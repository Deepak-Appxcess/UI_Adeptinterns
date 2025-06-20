import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Eye, 
  Hourglass, 
  ThumbsUp,
  Search,
  Calendar,
  Building,
  Filter,
  ArrowUp,
  ArrowDown,
  FileText,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { fetchCandidateApplications } from '../../../services/api';
import { toast } from 'react-toastify';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'applied_date', direction: 'desc' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetchCandidateApplications();
      setApplications(response.data.results || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again later.');
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPLIED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            <Eye className="mr-1 h-3 w-3" /> Applied
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
            <Hourglass className="mr-1 h-3 w-3" /> Under Review
          </span>
        );
      case 'SHORTLISTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
            <ThumbsUp className="mr-1 h-3 w-3" /> Shortlisted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-100">
            <XCircle className="mr-1 h-3 w-3" /> Rejected
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-100">
            <CheckCircle className="mr-1 h-3 w-3" /> Accepted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-700 border border-gray-100">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleJobClick = (application) => {
    if (application.opportunity_type === 'JOB') {
      navigate(`/job/${application.job_id}`);
    } else {
      navigate(`/internship/${application.internship_id}`);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="h-3 w-3 ml-1" /> : 
      <ArrowDown className="h-3 w-3 ml-1" />;
  };

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => {
      // Filter by search term
      const searchFields = [
        app.job_title || app.internship_title || '',
        app.company_name || '',
        app.status || ''
      ];
      const matchesSearch = searchTerm === '' || 
        searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      // Filter by status
      const matchesStatus = filterStatus === 'all' || 
        app.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const key = sortConfig.key;
      
      // Handle different data types
      let valueA, valueB;
      
      if (key === 'applied_date') {
        valueA = new Date(a.applied_date || a.created_at || 0).getTime();
        valueB = new Date(b.applied_date || b.created_at || 0).getTime();
      } else if (key === 'job_title') {
        valueA = a.job_title || a.internship_title || '';
        valueB = b.job_title || b.internship_title || '';
      } else {
        valueA = a[key] || '';
        valueB = b[key] || '';
      }
      
      // Sort direction
      if (sortConfig.direction === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#18005F] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Applications</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchApplications()}
            className="inline-flex items-center px-6 py-3 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors shadow-md"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Track and manage all your job and internship applications</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] shadow-sm"
                >
                  <option value="all">All Status</option>
                  <option value="APPLIED">Applied</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setSortConfig({ key: 'applied_date', direction: 'desc' });
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          {applications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-6">You haven't applied to any jobs or internships yet.</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => navigate('/jobs')}
                  className="px-6 py-3 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors shadow-md"
                >
                  Browse Jobs
                </button>
                <button
                  onClick={() => navigate('/internships')}
                  className="px-6 py-3 border border-[#18005F] text-[#18005F] rounded-lg hover:bg-[#18005F]/5 transition-colors shadow-sm"
                >
                  Find Internships
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('job_title')}
                    >
                      <div className="flex items-center">
                        Position
                        {getSortIcon('job_title')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('applied_date')}
                    >
                      <div className="flex items-center">
                        Applied On
                        {getSortIcon('applied_date')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('opportunity_type')}
                    >
                      <div className="flex items-center">
                        Type
                        {getSortIcon('opportunity_type')}
                      </div>
                    </th>
                    <th scope="col" className="relative px-6 py-4">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr 
                      key={application.job_id || application.internship_id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-[#18005F]/10 rounded-lg flex items-center justify-center">
                            {application.opportunity_type === 'JOB' ? (
                              <Briefcase className="h-5 w-5 text-[#18005F]" />
                            ) : (
                              <FileText className="h-5 w-5 text-[#18005F]" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div 
                              className="text-sm font-semibold text-[#18005F] hover:text-[#18005F]/80 cursor-pointer flex items-center"
                              onClick={() => handleJobClick(application)}
                            >
                              {application.job_title || application.internship_title}
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {application.opportunity_type === 'JOB' ? 
                                `${application.minimum_experience_years || 0} years exp required` : 
                                `${application.duration || ''} ${application.duration_unit?.toLowerCase() || 'months'}`
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                            <Building className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="text-sm text-gray-900">{application.company_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(application.applied_date || application.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                          application.opportunity_type === 'JOB' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                            : 'bg-green-50 text-green-700 border border-green-100'
                        }`}>
                          {application.opportunity_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleJobClick(application)}
                          className="text-[#18005F] hover:text-[#18005F]/80 bg-[#18005F]/5 hover:bg-[#18005F]/10 px-3 py-1 rounded-lg transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Application Stats */}
        {applications.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { 
                label: 'Total Applications', 
                value: applications.length,
                icon: FileText,
                color: 'bg-blue-50 text-blue-700'
              },
              { 
                label: 'In Progress', 
                value: applications.filter(app => ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED'].includes(app.status)).length,
                icon: Hourglass,
                color: 'bg-amber-50 text-amber-700'
              },
              { 
                label: 'Accepted', 
                value: applications.filter(app => app.status === 'ACCEPTED').length,
                icon: CheckCircle,
                color: 'bg-green-50 text-green-700'
              },
              { 
                label: 'Rejected', 
                value: applications.filter(app => app.status === 'REJECTED').length,
                icon: XCircle,
                color: 'bg-red-50 text-red-700'
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg ${stat.color.split(' ')[0]} flex items-center justify-center mr-3`}>
                        <Icon className={`w-5 h-5 ${stat.color.split(' ')[1]}`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;