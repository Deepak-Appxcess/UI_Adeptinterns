import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  Calendar, 
  Users, 
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
  Shield
} from 'lucide-react';
import api from '../services/api';

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${id}/`);
      setJob(response.data);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Failed to load job details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/job/${id}` } });
      return;
    }

    try {
      setIsApplying(true);
      // API call to apply for the job would go here
      // await api.post(`/jobs/${id}/apply`);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setApplicationSuccess(true);
    } catch (err) {
      console.error('Error applying for job:', err);
      // Show error message
    } finally {
      setIsApplying(false);
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) return `₹${parseFloat(min).toLocaleString()} - ₹${parseFloat(max).toLocaleString()}/year`;
    if (min) return `₹${parseFloat(min).toLocaleString()}+/year`;
    return `Up to ₹${parseFloat(max).toLocaleString()}/year`;
  };

  const getWorkType = (jobType, workSchedule) => {
    const type = jobType === 'IN_OFFICE' ? 'In Office' : 
                jobType === 'HYBRID' ? 'Hybrid' : 'Remote';
    
    const schedule = workSchedule === 'FULL_TIME' ? 'Full-time' : 'Part-time';
    
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

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Job Details</h3>
          <p className="text-gray-600 mb-4">{error || 'Job not found'}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              Go Back
            </button>
            <button
              onClick={fetchJobDetails}
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
            Back to Jobs
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Job Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl font-bold text-gray-900 mb-1">{job.job_title}</h1>
                    <p className="text-gray-600 text-sm">{job.employer_organization?.organization_name || 'Company Name'}</p>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Actively hiring
                      </span>
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
                  <span className="text-gray-500 block">Job Type</span>
                  <div className="flex items-center mt-1">
                    <MapPin className="w-3 h-3 text-indigo-600 mr-1" />
                    <span className="font-medium text-sm">{getWorkType(job.job_type, job.work_schedule)}</span>
                  </div>
                </div>
                <div className="text-xs">
                  <span className="text-gray-500 block">Salary</span>
                  <div className="flex items-center mt-1">
                    <DollarSign className="w-3 h-3 text-indigo-600 mr-1" />
                    <span className="font-medium text-sm">{formatSalary(job.fixed_pay_min, job.fixed_pay_max)}</span>
                  </div>
                </div>
                <div className="text-xs">
                  <span className="text-gray-500 block">Experience</span>
                  <div className="flex items-center mt-1">
                    <Clock className="w-3 h-3 text-indigo-600 mr-1" />
                    <span className="font-medium text-sm">{job.minimum_experience_years || 0} years</span>
                  </div>
                </div>
                <div className="text-xs">
                  <span className="text-gray-500 block">Openings</span>
                  <div className="flex items-center mt-1">
                    <Users className="w-3 h-3 text-indigo-600 mr-1" />
                    <span className="font-medium text-sm">{job.number_of_openings} position{job.number_of_openings !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {job.skills_required && job.skills_required.length > 0 && (
                <div className="mb-3">
                  <h3 className="text-xs font-semibold text-gray-900 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {job.skills_required.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Posted on {formatDate(job.created_at)}
                </div>
              </div>
            </motion.div>

            {/* About the Job */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-4"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About the job</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Key responsibilities:</h3>
                  {job.job_description && job.job_description.length > 0 ? (
                    <ul className="space-y-1">
                      {job.job_description.map((desc, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {desc}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-600">No detailed description provided.</p>
                  )}
                </div>

                {job.skills_required && job.skills_required.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Skills Required:</h3>
                    <div className="flex flex-wrap gap-1">
                      {job.skills_required.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {job.screening_questions && job.screening_questions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Screening questions:</h3>
                    <ul className="space-y-1">
                      {job.screening_questions.map((question, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.candidate_preferences && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Candidate preferences:</h3>
                    <p className="text-sm text-gray-700">{job.candidate_preferences}</p>
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
                <div className={`flex items-center p-3 rounded-lg ${job.has_five_day_week ? 'bg-green-50' : 'bg-gray-50'}`}>
                  {job.has_five_day_week ? (
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">5-Day Work Week</h3>
                    <p className="text-xs text-gray-600">
                      {job.has_five_day_week ? 'Enjoy weekends off' : 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center p-3 rounded-lg ${job.has_health_insurance ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  {job.has_health_insurance ? (
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Health Insurance</h3>
                    <p className="text-xs text-gray-600">
                      {job.has_health_insurance ? 'Medical coverage provided' : 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center p-3 rounded-lg ${job.has_life_insurance ? 'bg-purple-50' : 'bg-gray-50'}`}>
                  {job.has_life_insurance ? (
                    <CheckCircle className="w-4 h-4 text-purple-600 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Life Insurance</h3>
                    <p className="text-xs text-gray-600">
                      {job.has_life_insurance ? 'Life insurance coverage' : 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center p-3 rounded-lg ${job.allow_women_returning ? 'bg-pink-50' : 'bg-gray-50'}`}>
                  {job.allow_women_returning ? (
                    <CheckCircle className="w-4 h-4 text-pink-600 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Women Returning to Work</h3>
                    <p className="text-xs text-gray-600">
                      {job.allow_women_returning ? 'Supportive environment' : 'Not specified'}
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
                    onClick={() => navigate('/jobs')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    Browse More Jobs
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Apply for this job</h2>
                  <p className="text-xs text-gray-600 mb-4">Submit your application now to be considered for this position.</p>
                  
                  <button
                    onClick={handleApply}
                    disabled={isApplying}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm"
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
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About {job.employer_organization?.organization_name || 'the company'}</h2>
              
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{job.employer_organization?.organization_name || 'Company Name'}</h3>
                  <p className="text-xs text-gray-600">Technology</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">
                A leading company in the industry focused on innovation and growth.
              </p>
              
              {job.alternate_mobile_number && (
                <div className="flex items-center text-xs text-gray-600 mb-2">
                  <Phone className="w-3 h-3 mr-2" />
                  {job.alternate_mobile_number}
                </div>
              )}
              
              {job.employer_email && (
                <div className="flex items-center text-xs text-gray-600">
                  <Mail className="w-3 h-3 mr-2" />
                  {job.employer_email}
                </div>
              )}
            </motion.div>

            {/* Job Activity */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-4"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Job activity</h2>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-3 h-3 mr-2" />
                  Posted on {formatDate(job.created_at)}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-3 h-3 mr-2" />
                  {job.number_of_openings} opening{job.number_of_openings !== 1 ? 's' : ''}
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
    </div>
  );
}

export default JobDetails;