import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar,
  Building, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Share2,
  Bookmark,
  Send,
  Star,
  Phone,
  Mail,
  Globe,
  Award,
  Target,
  Shield,
  Users
} from 'lucide-react';
import api from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showScreeningQuestions, setShowScreeningQuestions] = useState(false);
  const [screeningAnswers, setScreeningAnswers] = useState([]);
  const [applicationError, setApplicationError] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    fetchInternshipDetails();
  }, [id]);

  const fetchInternshipDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${id}/`);
      setInternship(response.data);
      // Initialize answers array with empty strings if screening questions exist
      if (response.data.screening_questions) {
        setScreeningAnswers(new Array(response.data.screening_questions.length).fill(''));
      }
    } catch (err) {
      console.error('Error fetching internship details:', err);
      setError('Failed to load internship details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/internship/${id}` } });
      return;
    }

    try {
      // First check if resume exists
      const resumeCheck = await api.get('/jobs/candidate/resume/');
      
      if (resumeCheck.data?.detail === "Resume not found.") {
        // No resume exists, navigate to resume page with redirect back
        navigate('/resume', { state: { from: `/internship/${id}` } });
        return;
      }

      // Resume exists, proceed with application
      if (internship.screening_questions && internship.screening_questions.length > 0) {
        setShowScreeningQuestions(true);
      } else {
        handleApply();
      }
    } catch (error) {
      console.error('Error checking resume:', error);
      if (error.response?.status === 404 || error.response?.data?.detail === "Resume not found.") {
        // No resume exists, navigate to resume page with redirect back
        navigate('/resume', { state: { from: `/internship/${id}` } });
      } else {
        toast.error('Failed to check resume status');
      }
    }
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...screeningAnswers];
    newAnswers[index] = value;
    setScreeningAnswers(newAnswers);
  };

  const handleApply = async () => {
    try {
      setIsApplying(true);
      setApplicationError(null);
      
      const payload = {
        internship_id: id,
        screening_answers: screeningAnswers
      };

      const response = await api.post('/jobs/apply/', payload);
      
      setApplicationSuccess(true);
      setShowScreeningQuestions(false);
    } catch (err) {
      console.error('Error applying for internship:', err);
      
      if (err.response) {
        // Handle different error responses
        if (err.response.status === 400) {
          if (err.response.data.screening_answers) {
            setApplicationError('Please answer all screening questions.');
          } else {
             setApplicationError(`Bad request: ${JSON.stringify(err.response.data)}`);
          }
        } else if (err.response.status === 403) {
          if (err.response.data.detail === 'Only candidates can complete this action.') {
            setApplicationError('Only candidates can apply for internships.');
          } else if (err.response.data.detail === 'You have already applied to this job.') {
            setApplicationError('You have already applied to this internship.');
          } else {
            setApplicationError('You are not authorized to perform this action.');
          }
        } else if (err.response.status === 404) {
          setApplicationError('Internship not found.');
        } else {
          setApplicationError('Failed to submit application. Please try again.');
        }
      } else {
        setApplicationError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const formatStipend = (min, max, isPaid) => {
    if (!isPaid) return 'Unpaid';
    if (!min && !max) return 'Stipend not disclosed';
    if (min && max) return `₹${parseFloat(min).toLocaleString()} - ₹${parseFloat(max).toLocaleString()}/month`;
    if (min) return `₹${parseFloat(min).toLocaleString()}+/month`;
    return `Up to ₹${parseFloat(max).toLocaleString()}/month`;
  };

  const getInternshipType = (internshipType, isPartTime) => {
    const type = internshipType === 'IN_OFFICE' ? 'In Office' : 
                internshipType === 'HYBRID' ? 'Hybrid' : 'Remote';
    
    const schedule = isPartTime ? 'Part-time' : 'Full-time';
    
    return `${type} • ${schedule}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-4 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Internship Details</h3>
          <p className="text-gray-600 mb-4">{error || 'Internship not found'}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              Go Back
            </button>
            <button
              onClick={fetchInternshipDetails}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-indigo-600 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Internships
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Internship Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl font-bold text-gray-900 mb-1">{internship.internship_profile_title}</h1>
                    <p className="text-gray-600 text-sm">{internship.employer_organization?.organization_name || 'Company Name'}</p>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Actively hiring
                      </span>
                      {internship.has_ppo && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ml-2">
                          <Star className="w-3 h-3 mr-1" />
                          PPO Available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="text-xs">
                  <span className="text-gray-500 block">Internship Type</span>
                  <div className="flex items-center mt-1">
                    <MapPin className="w-3 h-3 text-indigo-600 mr-1" />
                    <span className="font-medium text-sm">{getInternshipType(internship.internship_type, internship.is_part_time)}</span>
                  </div>
                </div>
                <div className="text-xs">
                  <span className="text-gray-500 block">Stipend</span>
                  <div className="flex items-center mt-1">
                    <DollarSign className="w-3 h-3 text-indigo-600 mr-1" />
                    <span className="font-medium text-sm">{formatStipend(internship.fixed_stipend_min, internship.fixed_stipend_max, internship.is_paid)}</span>
                  </div>
                </div>
                <div className="text-xs">
                  <span className="text-gray-500 block">Duration</span>
                  <div className="flex items-center mt-1">
                    <Clock className="w-3 h-3 text-indigo-600 mr-1" />
                    <span className="font-medium text-sm">{internship.duration} {internship.duration_unit?.toLowerCase() || 'months'}</span>
                  </div>
                </div>
                <div className="text-xs">
                  <span className="text-gray-500 block">Start Date</span>
                  <div className="flex items-center mt-1">
                    <Calendar className="w-3 h-3 text-indigo-600 mr-1" />
                    <span className="font-medium text-sm">
                      {internship.start_date_option === 'IMMEDIATE' ? 'Immediately' : 
                       internship.start_date_option === 'FLEXIBLE' ? 'Flexible' : 
                       formatDate(internship.specific_start_date)}
                    </span>
                  </div>
                </div>
              </div>

              {internship.skills_required && internship.skills_required.length > 0 && (
                <div className="mb-3">
                  <h3 className="text-xs font-semibold text-gray-900 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {internship.skills_required.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Posted on {formatDate(internship.created_at)}
                </div>
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {internship.number_of_openings} opening{internship.number_of_openings !== 1 ? 's' : ''}
                </div>
              </div>
            </motion.div>

            {/* About the Internship */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-4"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About the internship</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Responsibilities:</h3>
                  {internship.responsibilities && internship.responsibilities.length > 0 ? (
                    <ul className="space-y-1">
                      {internship.responsibilities.map((resp, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {resp}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-600">No detailed responsibilities provided.</p>
                  )}
                </div>

                {internship.learning_outcomes && internship.learning_outcomes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Learning Outcomes:</h3>
                    <ul className="space-y-1">
                      {internship.learning_outcomes.map((outcome, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {internship.screening_questions && internship.screening_questions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Screening questions:</h3>
                    <ul className="space-y-1">
                      {internship.screening_questions.map((question, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {internship.candidate_preferences && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Candidate preferences:</h3>
                    <p className="text-sm text-gray-700">{internship.candidate_preferences}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-4"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={`flex items-center p-3 rounded-lg ${internship.is_paid ? 'bg-green-50' : 'bg-gray-50'}`}>
                  {internship.is_paid ? (
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Stipend</h3>
                    <p className="text-xs text-gray-600">
                      {internship.is_paid ? 'Paid internship' : 'Unpaid internship'}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center p-3 rounded-lg ${internship.has_ppo ? 'bg-purple-50' : 'bg-gray-50'}`}>
                  {internship.has_ppo ? (
                    <CheckCircle className="w-4 h-4 text-purple-600 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">PPO Opportunity</h3>
                    <p className="text-xs text-gray-600">
                      {internship.has_ppo ? 'Pre-placement offer available' : 'No PPO mentioned'}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center p-3 rounded-lg ${internship.has_certificate ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  {internship.has_certificate ? (
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Certificate</h3>
                    <p className="text-xs text-gray-600">
                      {internship.has_certificate ? 'Certificate provided' : 'No certificate mentioned'}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center p-3 rounded-lg ${internship.allow_women_returning ? 'bg-pink-50' : 'bg-gray-50'}`}>
                  {internship.allow_women_returning ? (
                    <CheckCircle className="w-4 h-4 text-pink-600 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Women Returning to Work</h3>
                    <p className="text-xs text-gray-600">
                      {internship.allow_women_returning ? 'Supportive environment' : 'Standard eligibility'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply Now Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-4 sticky top-4"
            >
              {applicationSuccess ? (
                <div className="text-center py-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Application Submitted!</h3>
                  <p className="text-xs text-gray-600 mb-4">Your application has been successfully submitted.</p>
                  <button
                    onClick={() => navigate('/internships')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    Browse More Internships
                  </button>
                </div>
              ) : showScreeningQuestions ? (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Screening Questions</h2>
                  <p className="text-xs text-gray-600 mb-4">Please answer the following questions to complete your application.</p>
                  
                  {applicationError && (
                    <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
                      {applicationError}
                    </div>
                  )}
                  
                  <div className="space-y-4 mb-4">
                    {internship.screening_questions.map((question, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {question}
                        </label>
                        <textarea
                          value={screeningAnswers[index] || ''}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          rows={3}
                          required
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowScreeningQuestions(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApply}
                      disabled={isApplying}
                      className="flex-1 py-2 px-4 bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                    >
                      {isApplying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Apply for this internship</h2>
                  <p className="text-xs text-gray-600 mb-4">Submit your application now to be considered for this position.</p>
                  {internship.application_status === null ? (
                    <button
                      onClick={handleApplyClick}
                      disabled={isApplying}
                      className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                    >
                      {isApplying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Apply now
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="w-full py-3 px-4 bg-gray-300 text-gray-700 font-semibold rounded-lg shadow text-sm cursor-not-allowed"
                      onClick={() => toast.info('Already applied to this internship')}
                    >
                      Applied
                    </button>
                  )}
                  {!isAuthenticated && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      You'll need to log in or create an account to apply
                    </p>
                  )}
                </>
              )}
            </motion.div>

            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-4"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About {internship.employer_organization?.organization_name || 'the company'}</h2>
              
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{internship.employer_organization?.organization_name || 'Company Name'}</h3>
                  <p className="text-xs text-gray-600">Technology</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">
                A leading company in the industry focused on innovation and growth.
              </p>
              
              {internship.alternate_mobile_number && (
                <div className="flex items-center text-xs text-gray-600 mb-2">
                  <Phone className="w-3 h-3 mr-2" />
                  {internship.alternate_mobile_number}
                </div>
              )}
              
              {internship.employer_email && (
                <div className="flex items-center text-xs text-gray-600">
                  <Mail className="w-3 h-3 mr-2" />
                  {internship.employer_email}
                </div>
              )}
            </motion.div>

            {/* Internship Activity */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-4"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Internship activity</h2>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-3 h-3 mr-2" />
                  Posted on {formatDate(internship.created_at)}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-3 h-3 mr-2" />
                  {internship.number_of_openings} opening{internship.number_of_openings !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-3 h-3 mr-2" />
                  Be an early applicant
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default InternshipDetails;