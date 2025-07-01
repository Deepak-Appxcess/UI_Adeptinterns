import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Users,
  Calendar,
  Video,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  FileText,
  Loader,
  Award
} from 'lucide-react';
import { fetchCandidateCourses } from '../../../services/api';
import { toast } from 'react-toastify';

const MyCourses = () => {
  const [coursesData, setCoursesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'enrollment_date', direction: 'desc' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetchCandidateCourses();
      setCoursesData(response);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
        return;
      }
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-100">
            <CheckCircle className="mr-1 h-3 w-3" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-100">
            <XCircle className="mr-1 h-3 w-3" /> Rejected
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
            <Award className="mr-1 h-3 w-3" /> Completed
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

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            <Clock className="mr-1 h-3 w-3" /> Payment Pending
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-100">
            <CheckCircle className="mr-1 h-3 w-3" /> Paid
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-100">
            <XCircle className="mr-1 h-3 w-3" /> Payment Failed
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

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
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

  // Filter and sort enrollments
  const filteredEnrollments = coursesData?.enrollments
    ?.filter(enrollment => {
      // Filter by search term
      const searchFields = [
        enrollment.course_title || '',
        enrollment.status || '',
        enrollment.payment_status || ''
      ];
      const matchesSearch = searchTerm === '' || 
        searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      // Filter by status
      const matchesStatus = filterStatus === 'all' || 
        enrollment.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    ?.sort((a, b) => {
      const key = sortConfig.key;
      
      // Handle different data types
      let valueA, valueB;
      
      if (key === 'enrollment_date') {
        valueA = new Date(a.enrollment_date).getTime();
        valueB = new Date(b.enrollment_date).getTime();
      } else if (key === 'course_title') {
        valueA = a.course_title || '';
        valueB = b.course_title || '';
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
          <p className="text-gray-600 font-medium">Loading your courses...</p>
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Courses</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchCourses()}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">Track and manage all your course enrollments</p>
        </div>

        {/* Statistics Cards */}
        {coursesData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { 
                label: 'Total Enrollments', 
                value: coursesData.enrollments?.length || 0,
                icon: BookOpen,
                color: 'bg-blue-50 text-blue-700'
              },
              { 
                label: 'Upcoming Courses', 
                value: coursesData.upcoming_count || 0,
                icon: Calendar,
                color: 'bg-amber-50 text-amber-700'
              },
              { 
                label: 'Live Courses', 
                value: coursesData.live_count || 0,
                icon: Video,
                color: 'bg-green-50 text-green-700'
              },
              { 
                label: 'Completed', 
                value: coursesData.completed_count || 0,
                icon: Award,
                color: 'bg-purple-50 text-purple-700'
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

        {/* Live Courses Section */}
        {coursesData?.live_courses?.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Courses</h2>
            <div className="space-y-4">
              {coursesData.live_courses.map((course) => (
                <div key={course.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="flex-shrink-0 h-12 w-12 bg-[#18005F]/10 rounded-lg flex items-center justify-center mr-4">
                      <Video className="h-6 w-6 text-[#18005F]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#18005F]">{course.course_title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(course.start_time).toLocaleString()} - {new Date(course.end_time).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <Users className="h-4 w-4 mr-2" />
                      {course.current_participants}/{course.max_participants} participants
                    </div>
                    {course.can_attend && (
                      <a 
                        href={course.google_meet_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors text-center"
                      >
                        Join Now
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search courses..."
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
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setSortConfig({ key: 'enrollment_date', direction: 'desc' });
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Enrollments Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          {coursesData?.enrollments?.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Course Enrollments Yet</h3>
              <p className="text-gray-600 mb-6">You haven't enrolled in any courses yet.</p>
              <button
                onClick={() => navigate('/courses')}
                className="px-6 py-3 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors shadow-md"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('course_title')}
                    >
                      <div className="flex items-center">
                        Course
                        {getSortIcon('course_title')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('course_type')}
                    >
                      <div className="flex items-center">
                        Type
                        {getSortIcon('course_type')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('enrollment_date')}
                    >
                      <div className="flex items-center">
                        Enrolled On
                        {getSortIcon('enrollment_date')}
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
                      onClick={() => handleSort('payment_status')}
                    >
                      <div className="flex items-center">
                        Payment
                        {getSortIcon('payment_status')}
                      </div>
                    </th>
                    <th scope="col" className="relative px-6 py-4">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEnrollments?.map((enrollment) => (
                    <tr 
                      key={enrollment.course_id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-[#18005F]/10 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-[#18005F]" />
                          </div>
                          <div className="ml-4">
                            <div 
                              className="text-sm font-semibold text-[#18005F] hover:text-[#18005F]/80 cursor-pointer flex items-center"
                              onClick={() => handleCourseClick(enrollment.course_id)}
                            >
                              {enrollment.course_title}
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </div>
                            {enrollment.course_banner_image && (
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="truncate">Image available</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                          enrollment.course_type === 'group' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                            : 'bg-green-50 text-green-700 border border-green-100'
                        }`}>
                          {enrollment.course_type === 'group' ? 'Group' : 'Individual'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(enrollment.enrollment_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(enrollment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatusBadge(enrollment.payment_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleCourseClick(enrollment.course_id)}
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
      </div>
    </div>
  );
};

export default MyCourses;