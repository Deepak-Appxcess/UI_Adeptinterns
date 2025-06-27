import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  Plus, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Calendar,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Building,
  MapPin,
  Clock,
  DollarSign,
  Star,
  ArrowUpRight,
  Target,
  Award,
  Activity,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import api from '../../../services/api';
import JobInternshipTable from './JobInternshipTable';
import FilterPanel from './FilterPanel';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('JOB');
  const [jobs, setJobs] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile/');
        setProfile(data);
        
        if (data.role.name !== 'Employer') {
          navigate('/dashboard/student');
          return;
        }

        if (!data.has_completed_organization) {
          navigate('/profile');
          return;
        }
        
        fetchListings();
        fetchAnalytics();
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    const fetchListings = async () => {
      try {
        setLoading(true);
        const jobsResponse = await api.get('/jobs/filtered/', { 
          params: { opportunity_type: 'JOB' } 
        });
        const internshipsResponse = await api.get('/jobs/filtered/', { 
          params: { opportunity_type: 'INTERNSHIP' } 
        });
        
        setJobs(jobsResponse.data.results || []);
        setInternships(internshipsResponse.data.results || []);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        
        const params = {};
        if (dateRange.startDate) params.start_date = formatDate(dateRange.startDate);
        if (dateRange.endDate) params.end_date = formatDate(dateRange.endDate);
        
        const { data } = await api.get('/jobs/dashboard/', { params });
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, dateRange.startDate, dateRange.endDate]);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setDateRange({
      startDate: start,
      endDate: end
    });
  };

  const handleFilterChange = async (filters) => {
    try {
      setLoading(true);
      const params = { 
        opportunity_type: activeTab,
        ...filters 
      };
      const response = await api.get('/jobs/filtered/', { params });
      
      if (activeTab === 'JOB') {
        setJobs(response.data.results || []);
      } else {
        setInternships(response.data.results || []);
      }
    } catch (err) {
      console.error('Error filtering listings:', err);
      setError('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const handlePostNew = () => {
    navigate(activeTab === 'JOB' ? '/post-job' : '/post-internship');
  };

  // Prepare chart data with consistent theme styling
  const statusBreakdownData = {
    labels: analytics?.application_status_breakdown?.map(item => item.status.replace('_', ' ')) || [],
    datasets: [{
      data: analytics?.application_status_breakdown?.map(item => item.count) || [],
      backgroundColor: [
        '#18005F', // primary purple
        '#4F46E5', // indigo
        '#8B5CF6', // violet
        '#A78BFA', // lighter purple
        '#C4B5FD'  // lightest purple
      ],
      borderWidth: 0,
      hoverOffset: 8
    }]
  };

  const topJobsData = {
    labels: analytics?.top_jobs_by_applications?.slice(0, 5).map(job => job.title) || [],
    datasets: [{
      label: 'Applications',
      data: analytics?.top_jobs_by_applications?.slice(0, 5).map(job => job.applications_count) || [],
      backgroundColor: 'rgba(24, 0, 95, 0.8)',
      borderColor: '#18005F',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const applicationTrendData = {
    labels: analytics?.application_trend ? Object.keys(analytics.application_trend) : [],
    datasets: [{
      label: 'Applications',
      data: analytics?.application_trend ? Object.values(analytics.application_trend) : [],
      borderColor: '#18005F',
      backgroundColor: 'rgba(24, 0, 95, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#18005F',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#18005F',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#18005F]" />
          <span className="text-gray-600">Loading dashboard...</span>
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
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {profile?.first_name}!</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePostNew}
              className="flex items-center px-6 py-3 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" />
              Post New {activeTab === 'JOB' ? 'Job' : 'Internship'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Job/Internship Management Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm"
        >
          {/* Header with Tabs */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Manage Opportunities</h2>
              
              {/* Search and Filter Controls */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-all text-sm"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg border transition-all ${
                    showFilters 
                      ? 'bg-[#18005F]/10 border-[#18005F]/20 text-[#18005F]' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mt-6 bg-gray-100 rounded-lg p-1">
              {[
                { key: 'JOB', label: 'Jobs', count: jobs.length },
                { key: 'INTERNSHIP', label: 'Internships', count: internships.length }
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3 px-4 rounded-md font-medium text-sm transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-[#18005F] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-[#18005F]/10 text-[#18005F]'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-b border-gray-200"
              >
                <FilterPanel 
                  type={activeTab} 
                  onFilterChange={handleFilterChange} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#18005F]" />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-6">{error}</div>
            ) : activeTab === 'JOB' ? (
              <JobInternshipTable 
                data={jobs} 
                type="JOB" 
              />
            ) : (
              <JobInternshipTable 
                data={internships} 
                type="INTERNSHIP" 
              />
            )}
          </div>
        </motion.div>
        {/* Quick Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              title: 'Total Jobs',
              value: analytics?.total_jobs_posted || 0,
              icon: Briefcase,
              color: 'text-[#18005F]',
              bgColor: 'bg-[#18005F]/10',
              change: '+12%'
            },
            {
              title: 'Total Internships',
              value: analytics?.total_internships_posted || 0,
              icon: Users,
              color: 'text-[#18005F]',
              bgColor: 'bg-[#18005F]/10',
              change: '+8%'
            },
            {
              title: 'Applications',
              value: analytics?.total_applications || 0,
              icon: TrendingUp,
              color: 'text-[#18005F]',
              bgColor: 'bg-[#18005F]/10',
              change: '+24%'
            },
            {
              title: 'Total Courses ',
              value: '0%',
              icon: Target,
              color: 'text-[#18005F]',
              bgColor: 'bg-[#18005F]/10',
              change: '0%'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-500 text-sm font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Date Range Picker */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-[#18005F]" />
              Analytics Period
            </h2>
          </div>
          <DatePicker
            selectsRange={true}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={handleDateChange}
            maxDate={new Date()}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
            isClearable={true}
            placeholderText="Select date range (optional)"
          />
          <p className="mt-2 text-sm text-gray-500">
            Leave empty to view data from the last 30 days
          </p>
        </motion.div>

        {/* Analytics Charts */}
        {!analyticsLoading && analytics && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            {/* Application Status Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-[#18005F]" />
                Application Status
              </h3>
              <div className="h-64">
                <Pie data={statusBreakdownData} options={chartOptions} />
              </div>
            </div>

            {/* Top Jobs by Applications */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Award className="w-5 h-5 mr-2 text-[#18005F]" />
                Top Performing Jobs
              </h3>
              <div className="h-64">
                <Bar data={topJobsData} options={chartOptions} />
              </div>
            </div>

            {/* Application Trend */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-[#18005F]" />
                Application Trends
              </h3>
              <div className="h-64">
                <Line data={applicationTrendData} options={chartOptions} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Common Skills */}
        {!analyticsLoading && analytics?.common_candidate_skills?.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-[#18005F]" />
              Popular Candidate Skills
            </h3>
            <div className="flex flex-wrap gap-3">
              {analytics.common_candidate_skills.map((skill, index) => (
                <motion.span 
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[#18005F]/10 text-[#18005F] border border-[#18005F]/20"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

      
      </div>
    </div>
  );
};

export default EmployerDashboard;