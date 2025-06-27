import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchApplications } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Download,
  Eye,
  Briefcase,
  Calendar,
  User,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ApplicationViewPage = () => {
  const { jobId, internshipId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(
    jobId ? 'job' : internshipId ? 'internship' : 'all'
  );
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {};
        if (jobId) {
          params.job_id = jobId;
        } else if (internshipId) {
          params.internship_id = internshipId;
        } else {
          params.view_all = true;
          if (tabValue === 'jobs') {
            params.job_only = true;
          } else if (tabValue === 'internships') {
            params.internship_only = true;
          }
        }

        // Add date range filtering
        if (dateRange.startDate) params.start_date = formatDate(dateRange.startDate);
        if (dateRange.endDate) params.end_date = formatDate(dateRange.endDate);
        
        // Add search filtering
        if (searchQuery) params.search = searchQuery;

        const response = await fetchApplications(params);
        setApplications(response.data?.results || []);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, internshipId, tabValue, location.key, dateRange.startDate, dateRange.endDate, searchQuery]);

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
    if (newValue === 'all') {
      navigate('/applications');
    } else if (newValue === 'jobs') {
      navigate('/applications/jobs');
    } else if (newValue === 'internships') {
      navigate('/applications/internships');
    }
  };

  const handleViewApplication = (appId) => {
    navigate(`/applications/${appId}`);
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setDateRange({
      startDate: start,
      endDate: end
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return null;
    
    switch (status.toUpperCase()) {
      case 'APPLIED': return <Clock className="w-4 h-4 mr-1" />;
      case 'UNDER_REVIEW': return <Loader2 className="w-4 h-4 mr-1 animate-spin" />;
      case 'SHORTLISTED': return <Award className="w-4 h-4 mr-1" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 mr-1" />;
      case 'ACCEPTED': return <CheckCircle className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toUpperCase()) {
      case 'APPLIED': return 'bg-gray-100 text-gray-800';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800';
      case 'SHORTLISTED': return 'bg-purple-100 text-purple-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#18005F]" />
          <span className="text-gray-600">Loading applications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">
            {error.includes('Only employers') ? (
              'Only employers can view applications. Please switch to an employer account.'
            ) : error.includes('must be provided') ? (
              'Please select either a job or internship to view applications.'
            ) : (
              error
            )}
          </p>
          <div className="flex justify-center space-x-3">
            {error.includes('Only employers') ? (
              <button 
                onClick={() => navigate('/profile')}
                className="px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
              >
                Go to Profile
              </button>
            ) : error.includes('must be provided') ? (
              <>
                <button 
                  onClick={() => navigate('/jobs')}
                  className="px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
                >
                  Browse Jobs
                </button>
                <button 
                  onClick={() => navigate('/internships')}
                  className="px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
                >
                  Browse Internships
                </button>
              </>
            ) : (
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 rounded-t-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {jobId ? 'Job Applications' :
               internshipId ? 'Internship Applications' : 'All Applications'}
            </h1>
            <p className="text-gray-600 mt-1">
              {applications.length} {applications.length === 1 ? 'application' : 'applications'} found
            </p>
          </div>
          
          {/* Search and Date Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-all text-sm w-full"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <DatePicker
              selectsRange={true}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleDateChange}
              maxDate={new Date()}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors text-sm"
              isClearable={true}
              placeholderText="Filter by date"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      {!jobId && !internshipId && (
        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All Applications', icon: Briefcase },
              { key: 'jobs', label: 'Job Applications', icon: Briefcase },
              { key: 'internships', label: 'Internship Applications', icon: Award }
            ].map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTabChange(tab.key)}
                className={`flex-1 py-3 px-4 rounded-md font-medium text-sm transition-all flex items-center justify-center ${
                  tabValue === tab.key
                    ? 'bg-white text-[#18005F] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Applications Table */}
      <div className="bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-hidden">
        {applications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No applications found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {jobId ? 'This job has no applications yet.' :
               internshipId ? 'This internship has no applications yet.' :
               'There are no applications matching your current filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied On
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <motion.tr 
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {app.candidate_profile?.profile_picture_url ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={app.candidate_profile.profile_picture_url}
                              alt={`${app.candidate_profile.first_name} ${app.candidate_profile.last_name}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[#18005F]/10 flex items-center justify-center text-[#18005F] font-medium">
                              {app.candidate_profile?.first_name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {app.candidate_profile?.first_name || 'N/A'} {app.candidate_profile?.last_name || ''}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.candidate_email || 'Email not available'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {app.job_title || app.internship_title || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#18005F]/10 text-[#18005F]">
                        {app.job_title ? 'Job' : app.internship_title ? 'Internship' : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.work_experience ? `${app.work_experience} years` : 'Fresher'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {app.status || 'UNKNOWN'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(app.applied_at || app.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewApplication(app.id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18005F]"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </motion.button>
                        {app.resume?.url ? (
                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href={app.resume.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#18005F] hover:bg-[#18005F]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18005F]"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Resume
                          </motion.a>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            No Resume
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationViewPage;