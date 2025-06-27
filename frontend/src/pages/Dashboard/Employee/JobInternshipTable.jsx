import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Eye, 
  MoreVertical, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  Briefcase,
  GraduationCap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Zap,
  ChevronRight
} from 'lucide-react';

const JobInternshipTable = ({ data, type }) => {
  const [expandedRows, setExpandedRows] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const toggleRow = (id) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleEdit = (id) => {
    if (type === 'JOB') {
      navigate(`/jobs/update/${id}`);
    } else {
      navigate(`/internships/update/${id}`);
    }
  };

  const handleApplication = (id, type) => {
    if (type === 'JOB') {
      navigate(`/applications/job/${id}`);
    } else {
      navigate(`/applications/internship/${id}`);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'published':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'draft':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'rejected':
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'published':
        return <CheckCircle className="w-3 h-3" />;
      case 'draft':
        return <AlertCircle className="w-3 h-3" />;
      case 'rejected':
      case 'closed':
        return <XCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    return `Up to ₹${max.toLocaleString()}`;
  };

  // Filter and sort data
  const filteredData = data.filter(item => {
    const searchFields = [
      type === 'JOB' ? item.job_title : item.internship_profile_title,
      item.employer_organization?.organization_name,
      ...(item.skills_required || [])
    ];
    return searchFields.some(field => 
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  if (!data || data.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {type === 'JOB' ? (
            <Briefcase className="w-8 h-8 text-gray-400" />
          ) : (
            <GraduationCap className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No {type === 'JOB' ? 'jobs' : 'internships'} found
        </h3>
        <p className="text-gray-600 mb-6">
          You haven't posted any {type === 'JOB' ? 'jobs' : 'internships'} yet.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(type === 'JOB' ? '/post-job' : '/post-internship')}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#18005F] to-[#220066] text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <Zap className="w-4 h-4 mr-2" />
          Post Your First {type === 'JOB' ? 'Job' : 'Internship'}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={`Search ${type === 'JOB' ? 'jobs' : 'internships'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-4 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{sortedData.length} {type === 'JOB' ? 'jobs' : 'internships'}</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort(type === 'JOB' ? 'job_title' : 'internship_profile_title')}
                    className="flex items-center space-x-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900 transition-colors"
                  >
                    <span>{type === 'JOB' ? 'Job Title' : 'Internship Title'}</span>
                    {sortConfig.key === (type === 'JOB' ? 'job_title' : 'internship_profile_title') && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900 transition-colors"
                  >
                    <span>Status</span>
                    {sortConfig.key === 'status' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center space-x-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900 transition-colors"
                  >
                    <span>Created</span>
                    {sortConfig.key === 'created_at' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {sortedData.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Title Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#18005F] to-[#220066] rounded-lg flex items-center justify-center">
                              {type === 'JOB' ? (
                                <Briefcase className="w-5 h-5 text-white" />
                              ) : (
                                <GraduationCap className="w-5 h-5 text-white" />
                              )}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {type === 'JOB' ? item.job_title : item.internship_profile_title}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {item.employer_organization?.organization_name || 'Your Organization'}
                            </p>
                            {item.skills_required && item.skills_required.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.skills_required.slice(0, 3).map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#18005F]/10 text-[#18005F]"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {item.skills_required.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                    +{item.skills_required.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Details Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{item.job_type || item.internship_type || 'Remote'}</span>
                          </div>
                          {type === 'JOB' ? (
                            <>
                              <div className="flex items-center text-sm text-gray-600">
                                <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{formatSalary(item.fixed_pay_min, item.fixed_pay_max)}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{item.minimum_experience_years || 0} years exp</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center text-sm text-gray-600">
                                <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                                <span>
                                  {item.is_paid 
                                    ? formatSalary(item.fixed_stipend_min, item.fixed_stipend_max)
                                    : 'Unpaid'
                                  }
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{item.duration} {item.duration_unit?.toLowerCase()}</span>
                              </div>
                            </>
                          )}
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{item.number_of_openings} opening{item.number_of_openings !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1 capitalize">{item.status || 'Draft'}</span>
                        </span>
                      </td>

                      {/* Application Count */}
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <span>{item.applications_count || 0} application{item.applications_count !== 1 ? 's' : ''}</span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApplication(item.id, type)}
                            className="p-2 text-gray-400 hover:text-[#18005F] hover:bg-[#18005F]/10 rounded-lg transition-all ml-2"
                            title="View Applications"
                          >
                            <Users className="w-4 h-4" />
                          </motion.button>
                        </div>  
                      </td>

                      {/* Created Date Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleRow(item.id)}
                            className="p-2 text-gray-400 hover:text-[#18005F] hover:bg-[#18005F]/10 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          
                          {(item.status === 'DRAFT' || item.status === 'REJECTED') && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEdit(item.id)}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </motion.button>
                          )}
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
                            title="More Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Expanded Row */}
                    <AnimatePresence>
                      {expandedRows.includes(item.id) && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-gray-50"
                        >
                          <td colSpan={6} className="px-6 py-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Left Column */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                    {type === 'JOB' ? 'Job Description' : 'Responsibilities'}
                                  </h4>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    {(type === 'JOB' ? item.job_description : item.responsibilities)?.map((desc, idx) => (
                                      <p key={idx} className="flex items-start">
                                        <span className="w-1.5 h-1.5 bg-[#18005F] rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                        {desc}
                                      </p>
                                    )) || <p>No description available</p>}
                                  </div>
                                </div>

                                {item.screening_questions && item.screening_questions.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Screening Questions</h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      {item.screening_questions.map((question, idx) => (
                                        <p key={idx} className="flex items-start">
                                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                          {question}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Right Column */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Additional Information</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    {type === 'JOB' ? (
                                      <>
                                        <div>
                                          <span className="text-gray-500">Work Schedule:</span>
                                          <p className="font-medium text-gray-900">{item.work_schedule || 'Not specified'}</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Benefits:</span>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {item.has_five_day_week && (
                                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">5 Day Week</span>
                                            )}
                                            {item.has_health_insurance && (
                                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">Health Insurance</span>
                                            )}
                                            {item.has_life_insurance && (
                                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs">Life Insurance</span>
                                            )}
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div>
                                          <span className="text-gray-500">Start Date:</span>
                                          <p className="font-medium text-gray-900">{item.start_date_option || 'Immediate'}</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">PPO Available:</span>
                                          <p className="font-medium text-gray-900">{item.has_ppo ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Part Time:</span>
                                          <p className="font-medium text-gray-900">{item.is_part_time ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Women Returning:</span>
                                          <p className="font-medium text-gray-900">{item.allow_women_returning ? 'Allowed' : 'Not specified'}</p>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {item.candidate_preferences && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Candidate Preferences</h4>
                                    <p className="text-sm text-gray-600">{item.candidate_preferences}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {sortedData.length} of {data.length} {type === 'JOB' ? 'jobs' : 'internships'}
        </span>
        <div className="flex items-center space-x-2">
          <span>Sort by:</span>
          <select
            value={sortConfig.key || ''}
            onChange={(e) => handleSort(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F]"
          >
            <option value="">Default</option>
            <option value="created_at">Date Created</option>
            <option value={type === 'JOB' ? 'job_title' : 'internship_profile_title'}>Title</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default JobInternshipTable;