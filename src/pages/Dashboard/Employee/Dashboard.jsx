// src/pages/employer/EmployerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../../services/api';
import JobInternshipTable from '../../../pages/Dashboard/Employee/JobInternshipTable';
import FilterPanel from '../../../pages/Dashboard/Employee/FilterPanel';

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
        
        console.log('Jobs response:', jobsResponse.data);
        console.log('Internships response:', internshipsResponse.data);
        
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

  // Prepare chart data
  const statusBreakdownData = {
    labels: analytics?.application_status_breakdown?.map(item => item.status.replace('_', ' ')) || [],
    datasets: [{
      data: analytics?.application_status_breakdown?.map(item => item.count) || [],
      backgroundColor: [
        '#3B82F6', // blue
        '#10B981', // green
        '#EF4444', // red
        '#F59E0B', // yellow
        '#8B5CF6'  // purple
      ],
      borderWidth: 1
    }]
  };

  const topJobsData = {
    labels: analytics?.top_jobs_by_applications?.slice(0, 5).map(job => job.title) || [],
    datasets: [{
      label: 'Applications',
      data: analytics?.top_jobs_by_applications?.slice(0, 5).map(job => job.applications_count) || [],
      backgroundColor: '#3B82F6'
    }]
  };

  const applicationTrendData = {
    labels: analytics?.application_trend ? Object.keys(analytics.application_trend) : [],
    datasets: [{
      label: 'Applications',
      data: analytics?.application_trend ? Object.values(analytics.application_trend) : [],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.1,
      fill: true
    }]
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
            <div className="flex space-x-4">
              <button
                onClick={handlePostNew}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Post New {activeTab === 'JOB' ? 'Job' : 'Internship'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Date Range Picker */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Select Date Range</h2>
          <DatePicker
            selectsRange={true}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={handleDateChange}
            maxDate={new Date()}
            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            isClearable={true}
            placeholderText="Select date range (optional)"
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave empty to view data from the last 30 days
          </p>
        </div>

        {/* Analytics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Analytics</h2>
          
          {analyticsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Stats Cards */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Jobs Posted</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{analytics?.total_jobs_posted || 0}</div>
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Internships Posted</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{analytics?.total_internships_posted || 0}</div>
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{analytics?.total_applications || 0}</div>
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          {!analyticsLoading && analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Application Status Breakdown */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Application Status Breakdown</h3>
                <div className="h-64">
                  <Pie 
                    data={statusBreakdownData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right'
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Top Jobs by Applications */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Jobs by Applications</h3>
                <div className="h-64">
                  <Bar 
                    data={topJobsData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Application Trend */}
              <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Application Trend</h3>
                <div className="h-64">
                  <Line 
                    data={applicationTrendData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Common Skills */}
          {!analyticsLoading && analytics?.common_candidate_skills?.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Common Candidate Skills</h3>
              <div className="flex flex-wrap gap-2">
                {analytics.common_candidate_skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Job/Internship Management Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Opportunity Management</h2>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('JOB')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'JOB'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Jobs
                <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {jobs.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('INTERNSHIP')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'INTERNSHIP'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Internships
                <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {internships.length}
                </span>
              </button>
            </nav>
          </div>

          {/* Filter Panel */}
          <FilterPanel 
            type={activeTab} 
            onFilterChange={handleFilterChange} 
          />

          {/* Results */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {activeTab === 'JOB' ? 'Job Listings' : 'Internship Listings'}
            </h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
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
        </div>
      </main>
    </div>
  );
};

export default EmployerDashboard;