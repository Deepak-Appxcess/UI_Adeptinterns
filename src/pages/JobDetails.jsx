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
  Send
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
      const response = await api.get(`/jobs/${id}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Job Details</h3>
          <p className="text-gray-600 mb-6">{error || 'Job not found'}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={fetchJobDetails}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Back to Jobs</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.job_title}</h1>
                    <p className="text-lg text-gray-600">{job.employer_organization?.organization_name || 'Company Name'}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Job Type</span>
                  <div className="flex items-center mt-1">
                    <MapPin className="w-4 h-4 text-indigo-600 mr-1" />
                    <span className="font-medium">{getWorkType(job.job_type, job.work_schedule)}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Salary</span>
                  <div className="flex items-center mt-1">
                    <DollarSign className="w-4 h-4 text-indigo-600 mr-1" />
                    <span className="font-medium">{formatSalary(job.fixed_pay_min, job.fixed_pay_max)}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Experience</span>
                  <div className="flex items-center mt-1">
                    <Clock className="w-4 h-4 text-indigo-600 mr-1" />
                    <span className="font-medium">{job.minimum_experience_years || 0} years</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Openings</span>
                  <div className="flex items-center mt-1">
                    <Users className="w-4 h-4 text-indigo-600 mr-1" />
                    <span className="font-medium">{job.number_of_openings} position{job.number_of_openings !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {job.skills_required && job.skills_required.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Posted on {new Date(job.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Actively Hiring
                </span>
              </div>
            </motion.div>

            {/* Job Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              
              {job.job_description && job.job_description.length > 0 ? (
                <div className="space-y-4">
                  {job.job_description.map((desc, idx) => (
                    <p key={idx} className="text-gray-700">
                      {desc}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No detailed description provided.</p>
              )}
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`flex items-center p-4 rounded-xl ${job.has_five_day_week ? 'bg-green-50' : 'bg-gray-50'}`}>
                  {job.has_five_day_week ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400 mr-3" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">5-Day Work Week</h3>
                    <p className="text-sm text-gray-600">
                      {job.has_five_day_week ? 'Enjoy weekends off' : 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center p-4 rounded-xl ${job.has_health_insurance ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  {job.has_health_insurance ? (
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400 mr-3" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">Health Insurance</h3>
                    <p className="text-sm text-gray-600">
                      {job.has_health_insurance ? 'Medical coverage provided' : 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center p-4 rounded-xl ${job.has_life_insurance ? 'bg-purple-50' : 'bg-gray-50'}`}>
                  {job.has_life_insurance ? (
                    <CheckCircle className="w-5 h-5 text-purple-600 mr-3" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400 mr-3" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">Life Insurance</h3>
                    <p className="text-sm text-gray-600">
                      {job.has_life_insurance ? 'Life insurance coverage' : 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center p-4 rounded-xl ${job.allow_women_returning ? 'bg-pink-50' : 'bg-gray-50'}`}>
                  {job.allow_women_returning ? (
                    <CheckCircle className="w-5 h-5 text-pink-600 mr-3" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400 mr-3" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">Women Returning to Work</h3>
                    <p className="text-sm text-gray-600">
                      {job.allow_women_returning ? 'Supportive environment' : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Candidate Preferences */}
            {job.candidate_preferences && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Candidate Preferences</h2>
                <p className="text-gray-700">{job.candidate_preferences}</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Now Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply for this Job</h2>
              
              {applicationSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Submitted!</h3>
                  <p className="text-gray-600 mb-6">Your application has been successfully submitted. The employer will contact you if they're interested.</p>
                  <button
                    onClick={() => navigate('/jobs')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Browse More Jobs
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">Submit your application now to be considered for this position.</p>
                  
                  <button
                    onClick={handleApply}
                    disabled={isApplying}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isApplying ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Apply Now
                      </>
                    )}
                  </button>
                  
                  {!isAuthenticated && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      You'll need to log in or create an account to apply
                    </p>
                  )}
                </>
              )}
            </motion.div>

            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About the Company</h2>
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{job.employer_organization?.organization_name || 'Company Name'}</h3>
                  <p className="text-sm text-gray-600">{job.employer_organization?.industry || 'Technology'}</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">
                {job.employer_organization?.organization_description || 
                 'A leading company in the industry focused on innovation and growth.'}
              </p>
              
              <Link
                to={`/company/${job.employer_organization?.id}`}
                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center"
              >
                View Company Profile
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>

            {/* Similar Jobs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Similar Jobs</h2>
              
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <Link 
                    key={index}
                    to={`/job/${index}`}
                    className="block p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">Similar Job Title {index}</h3>
                    <p className="text-sm text-gray-600 mb-2">Company Name</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="mr-3">Remote</span>
                      <DollarSign className="w-3 h-3 mr-1" />
                      <span>₹8L - ₹12L</span>
                    </div>
                  </Link>
                ))}
              </div>
              
              <Link
                to="/jobs"
                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center mt-4"
              >
                View All Jobs
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;