import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import StackingCard from './Components/StackingCard'
import Footer from './Components/Footer'
import Navbar from './Components/Navbar'
import Jobs from './pages/Jobs'
import Internships from './pages/Internships'
import Courses from './pages/Courses/Courses'

import EmployeeRegister from './pages/Register/EmployeeRegister'
import { GoogleOAuthProvider } from '@react-oauth/google';

import StudentRegister from './pages/Register/StudentRegister'
import Login from './pages/Login/Login'
import CourseDetails from './pages/Courses/CourseDetails'
import EmployeeDashboard from './pages/Dashboard/Employee/Dashboard'
import StudentDashboard from './pages/Dashboard/Student/StudentDashboard'
import PostInternships from './pages/Dashboard/Employee/PostInternship'
import StudentBio from './pages/Dashboard/Student/StudentBio'
import StudentPreferences from './pages/Dashboard/Student/StudentPreferences'
import PostJob from './pages/Dashboard/Employee/PostJob'
import StudentProfile from './pages/Dashboard/Student/StudentProfile'
import ApplicationViewPage from './pages/Dashboard/Employee/ApplicationViewPage'


import Employeeprofile from './pages/Dashboard/Employee/Profile'
import JobDetails from './pages/JobDetails'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import axios from 'axios';
import { fetchCourses } from './services/api'; // Adjust path if needed
import api from './services/api';
import ApplicationDetailPage from './pages/Dashboard/Employee/ApplicationDetailPage'
import InternshipDetails from './pages/InternshipDetails'
import ResumePage from './pages/Dashboard/Student/Resume/ResumePage'
import MyApplications from './pages/Dashboard/Student/MyApplications'


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [featuredInternships, setFeaturedInternships] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    const getFeaturedCourses = async () => {
      try {
        const response = await fetchCourses(); // from api.js
        const courses = response.data.data.slice(0, 3); // first 3 featured
        setFeaturedCourses(courses);
      } catch (error) {
        console.error('Error fetching featured courses:', error);
      }
    };

    getFeaturedCourses();
  }, []);

  // Fetch featured jobs and internships
  useEffect(() => {
    const getFeaturedOpportunities = async () => {
      try {
        setLoading(true);
        
        // Fetch jobs
        const jobsResponse = await api.get('/jobs/filtered/', {
          params: { 
            opportunity_type: 'JOB'
          }
        });
        
        // Fetch internships
        const internshipsResponse = await api.get('/jobs/filtered/', {
          params: { 
            opportunity_type: 'INTERNSHIP'
          }
        });

        // Set featured jobs (first 6)
        setFeaturedJobs(jobsResponse.data.results?.slice(0, 6) || []);
        
        // Set featured internships (first 6)
        setFeaturedInternships(internshipsResponse.data.results?.slice(0, 6) || []);
        
      } catch (error) {
        console.error('Error fetching featured opportunities:', error);
        // Fallback to empty arrays if API fails
        setFeaturedJobs([]);
        setFeaturedInternships([]);
      } finally {
        setLoading(false);
      }
    };

    getFeaturedOpportunities();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Helper function to format salary
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) return `₹${parseFloat(min).toLocaleString()} - ₹${parseFloat(max).toLocaleString()}/year`;
    if (min) return `₹${parseFloat(min).toLocaleString()}+/year`;
    return `Up to ₹${parseFloat(max).toLocaleString()}/year`;
  };

  // Helper function to format stipend
  const formatStipend = (min, max, isPaid) => {
    if (!isPaid) return 'Unpaid';
    if (!min && !max) return 'Stipend not disclosed';
    if (min && max) return `₹${parseFloat(min).toLocaleString()} - ₹${parseFloat(max).toLocaleString()}/month`;
    if (min) return `₹${parseFloat(min).toLocaleString()}+/month`;
    return `Up to ₹${parseFloat(max).toLocaleString()}/month`;
  };

  // Helper function to get work type
  const getWorkType = (jobType, workSchedule) => {
    const type = jobType || 'Remote';
    const schedule = workSchedule || 'Full-time';
    return `${type} • ${schedule}`;
  };

  // Helper function to get internship type
  const getInternshipType = (internshipType, isPartTime) => {
    const type = internshipType || 'Remote';
    const schedule = isPartTime ? 'Part-time' : 'Full-time';
    return `${type} • ${schedule}`;
  };

  // Helper function to get company logo with fallback
  const getCompanyLogo = (logoUrl, companyName) => {
    if (logoUrl) {
      return logoUrl;
    }
    // Default logo based on company name initial or generic building icon
    const initial = companyName?.charAt(0)?.toUpperCase() || 'C';
    return `https://ui-avatars.com/api/?name=${initial}&background=18005F&color=fff&size=48&rounded=true`;
  };

  return (
     <GoogleOAuthProvider clientId="380706120194-tlm6ibu4b4jun9tssfgpcgib1mkflqir.apps.googleusercontent.com">
    <Router>
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-white'} transition-colors duration-300`}>
        <div className={`${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-white'} min-h-screen`}>
          <Navbar 
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme} 
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
          />

          <Routes>
            <Route path="/" element={
              <Home 
                isDarkMode={isDarkMode} 
                featuredJobs={featuredJobs}
                featuredInternships={featuredInternships}
                featuredCourses={featuredCourses}
                isAuthenticated={isAuthenticated}
                loading={loading}
                formatSalary={formatSalary}
                formatStipend={formatStipend}
                getWorkType={getWorkType}
                getInternshipType={getInternshipType}
                getCompanyLogo={getCompanyLogo}
              />
            } />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/job/:id" element={<JobDetails />} />
            <Route path="/internships" element={<Internships />} />
        <Route path="/internship/:id" element={<InternshipDetails/>} />
            <Route path="/courses" element={<Courses />} />
            <Route  
              path="/dashboard/employer" 
              element={
                <ProtectedRoute>
                  <EmployeeDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/student" 
              element={
                <ProtectedRoute>
                  <StudentDashboard/>
                </ProtectedRoute>
              } 
            />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/employers" element={<EmployeeRegister/>} />
            {/* <Route path="/student" element={<StudentRegister/>} /> */}
            {/* <Route path="/login" element={<Login onLogin={handleLogin} />} /> */}

<Route path="/student" element={<StudentRegister />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/profile/candidate/bio" element={<StudentBio/>} />
            <Route path="/resume" element={<ResumePage/>} />
            <Route path="/MyApplication" element={<MyApplications/>} />
            
              <Route path="/student/preferences" element={<StudentPreferences />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Employeeprofile />
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            } />
            
            <Route path="/post-internship" element={
              <ProtectedRoute>
                <PostInternships />
              </ProtectedRoute>
            } />
            <Route path="/post-job" element={
              <ProtectedRoute>
                <PostJob />
              </ProtectedRoute>
            } />

         
<Route path="/applications" element={<ApplicationViewPage />} />
<Route path="/applications/jobs" element={<ApplicationViewPage />} />
<Route path="/applications/internships" element={<ApplicationViewPage />} />
<Route path="/applications/job/:jobId" element={<ApplicationViewPage />} />
<Route path="/applications/internship/:internshipId" element={<ApplicationViewPage />} />
<Route path="/applications/:appId" element={<ApplicationDetailPage/>} />
            </Routes>

          <Footer isDarkMode={isDarkMode} />
        </div>
      </div>
    </Router>
    </GoogleOAuthProvider>
  );
}

function Home({ 
  isDarkMode, 
  featuredJobs,
  featuredInternships,
  featuredCourses,
  isAuthenticated,
  loading,
  formatSalary,
  formatStipend,
  getWorkType,
  getInternshipType,
  getCompanyLogo
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'jobs', 'internships'
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      let results = [];
      
      if (activeTab === 'all' || activeTab === 'jobs') {
        const jobsResponse = await api.get('/jobs/filtered/', {
          params: { 
            opportunity_type: 'JOB',
            skills_required: searchQuery
          }
        });
        results = [...results, ...jobsResponse.data.results.map(job => ({ ...job, type: 'job' }))];
      }
      
      if (activeTab === 'all' || activeTab === 'internships') {
        const internshipsResponse = await api.get('/jobs/filtered/', {
          params: { 
            opportunity_type: 'INTERNSHIP',
            skills_required: searchQuery
          }
        });
        results = [...results, ...internshipsResponse.data.results.map(internship => ({ ...internship, type: 'internship' }))];
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleViewAll = (type) => {
    if (type === 'jobs') {
      navigate('/jobs');
    } else if (type === 'internships') {
      navigate('/internships');
    }
  };

  return (
    <main className={`${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-white text-black'}`}>
      {/* Hero Section */}
      <div className={`${isDarkMode ? 'bg-[#18005F]' : 'bg-[#18005F]'} text-white`}>
        <div className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Find Your Dream<br />Career Today
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Connect with top companies and discover opportunities that match your skills and ambitions.
              </p>
              <Link 
                to={isAuthenticated ? "/dashboard/student" : "/login"}
                className="inline-flex items-center bg-white text-[#18005F] px-8 py-4 font-semibold hover:bg-gray-100 transition-colors"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                <span className="ml-2">→</span>
              </Link>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm p-8 border border-white/20">
                <StackingCard isDarkMode={true} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className={`${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-gray-50'} py-16`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Search Opportunities</h2>
            <p className="text-xl text-gray-600">Find jobs and internships that match your skills</p>
          </div>

          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className={`${isDarkMode ? 'bg-[#18005F]/10 border-[#18005F]/20' : 'bg-white border-gray-200'} border p-6`}>
              {/* Search Tabs */}
              <div className="flex justify-center mb-6">
                <div className={`${isDarkMode ? 'bg-[#18005F]/20' : 'bg-gray-100'} p-1 flex`}>
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'jobs', label: 'Jobs' },
                    { key: 'internships', label: 'Internships' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-6 py-3 font-medium transition-all ${
                        activeTab === tab.key
                          ? 'bg-[#18005F] text-white'
                          : isDarkMode
                          ? 'text-white/80 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Input */}
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search by skills, job title, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`flex-1 px-6 py-4 text-lg ${
                    isDarkMode 
                      ? 'bg-[#18005F]/10 text-white placeholder-white/60 border-[#18005F]/30' 
                      : 'bg-white text-black placeholder-gray-500 border-gray-300'
                  } border focus:outline-none focus:border-[#18005F]`}
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="px-8 py-4 bg-[#18005F] text-white font-semibold hover:bg-[#18005F]/90 transition-colors disabled:opacity-50"
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Quick Filters */}
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                {['React', 'Python', 'JavaScript', 'Data Science', 'UI/UX', 'Marketing'].map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setSearchQuery(skill)}
                    className={`px-4 py-2 text-sm border transition-colors ${
                      isDarkMode
                        ? 'border-[#18005F]/30 text-white/80 hover:bg-[#18005F]/20'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-8">Search Results ({searchResults.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.slice(0, 6).map((item, index) => (
                  <div key={`${item.type}-${item.id}`} className={`${isDarkMode ? 'bg-[#18005F]/10 border-[#18005F]/20' : 'bg-white border-gray-200'} border p-6 hover:border-[#18005F] transition-colors`}>
                    <div className="flex items-center mb-4">
                      <img
                        src={getCompanyLogo(item.company_logo_url, item.employer_organization?.organization_name)}
                        alt="Company Logo"
                        className="w-12 h-12 mr-4"
                        onError={(e) => {
                          e.target.src = getCompanyLogo(null, item.employer_organization?.organization_name);
                        }}
                      />
                      <span className={`px-3 py-1 text-xs font-medium ${
                        item.type === 'job' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.type === 'job' ? 'Job' : 'Internship'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {item.type === 'job' ? item.job_title : item.internship_profile_title}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {item.employer_organization?.organization_name || 'Company Name'}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {item.type === 'job' 
                        ? formatSalary(item.fixed_pay_min, item.fixed_pay_max)
                        : formatStipend(item.fixed_stipend_min, item.fixed_stipend_max, item.is_paid)
                      }
                    </p>
                    <Link 
                      to={item.type === 'job' ? `/job/${item.id}` : `/internship/${item.id}`} 
                      className="text-[#18005F] hover:underline font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Featured Jobs Section */}
      <div className={`${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-white'} py-16`}>
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold">Featured Jobs</h2>
            <Link to="/jobs" className="text-[#18005F] hover:underline font-medium">View All →</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div key={index} className={`${isDarkMode ? 'bg-[#18005F]/10' : 'bg-gray-50'} p-6 animate-pulse`}>
                  <div className="h-4 bg-gray-300 mb-2"></div>
                  <div className="h-3 bg-gray-300 mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-300 mb-4 w-1/2"></div>
                  <div className="h-8 bg-gray-300 w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.length > 0 ? featuredJobs.map((job, index) => (
                <div key={job.id || index} className={`${isDarkMode ? 'bg-[#18005F]/10 border-[#18005F]/20' : 'bg-white border-gray-200'} border p-6 hover:border-[#18005F] transition-colors`}>
                  <div className="flex items-center mb-4">
                    <img
                      src={getCompanyLogo(job.company_logo_url, job.employer_organization?.organization_name)}
                      alt="Company Logo"
                      className="w-12 h-12 mr-4"
                      onError={(e) => {
                        e.target.src = getCompanyLogo(null, job.employer_organization?.organization_name);
                      }}
                    />
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 font-medium">
                      Actively Hiring
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{job.job_title}</h3>
                  <p className="text-gray-600 mb-2">
                    {job.employer_organization?.organization_name || 'Company Name'}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    {getWorkType(job.job_type, job.work_schedule)}
                  </p>
                  <p className="text-lg font-medium text-[#18005F] mb-4">
                    {formatSalary(job.fixed_pay_min, job.fixed_pay_max)}
                  </p>
                  {job.skills_required && job.skills_required.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {job.skills_required.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs">
                            {skill}
                          </span>
                        ))}
                        {job.skills_required.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs">
                            +{job.skills_required.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <Link to={`/job/${job.id}`} className="text-[#18005F] hover:underline font-medium">
                    View Details →
                  </Link>
                </div>
              )) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-500">No jobs available at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Featured Internships Section */}
      <div className={`${isDarkMode ? 'bg-[#18005F]/5' : 'bg-gray-50'} py-16`}>
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold">Featured Internships</h2>
            <Link to="/internships" className="text-[#18005F] hover:underline font-medium">View All →</Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div key={index} className={`${isDarkMode ? 'bg-[#18005F]/10' : 'bg-white'} p-6 animate-pulse`}>
                  <div className="h-4 bg-gray-300 mb-2"></div>
                  <div className="h-3 bg-gray-300 mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-300 mb-4 w-1/2"></div>
                  <div className="h-8 bg-gray-300 w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredInternships.length > 0 ? featuredInternships.map((internship, index) => (
                <div key={internship.id || index} className={`${isDarkMode ? 'bg-[#18005F]/10 border-[#18005F]/20' : 'bg-white border-gray-200'} border p-6 hover:border-[#18005F] transition-colors`}>
                  <div className="flex items-center mb-4">
                    <img
                      src={getCompanyLogo(internship.company_logo_url, internship.employer_organization?.organization_name)}
                      alt="Company Logo"
                      className="w-12 h-12 mr-4"
                      onError={(e) => {
                        e.target.src = getCompanyLogo(null, internship.employer_organization?.organization_name);
                      }}
                    />
                    <div className="flex gap-2">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 font-medium">
                        Actively Hiring
                      </span>
                      {internship.has_ppo && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 font-medium">
                          PPO Available
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{internship.internship_profile_title}</h3>
                  <p className="text-gray-600 mb-2">
                    {internship.employer_organization?.organization_name || 'Company Name'}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    {getInternshipType(internship.internship_type, internship.is_part_time)}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    Duration: {internship.duration} {internship.duration_unit?.toLowerCase() || 'months'}
                  </p>
                  <p className="text-lg font-medium text-[#18005F] mb-4">
                    {formatStipend(internship.fixed_stipend_min, internship.fixed_stipend_max, internship.is_paid)}
                  </p>
                  {internship.skills_required && internship.skills_required.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {internship.skills_required.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs">
                            {skill}
                          </span>
                        ))}
                        {internship.skills_required.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs">
                            +{internship.skills_required.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <Link to={`/internship/${internship.id}`} className="text-[#18005F] hover:underline font-medium">
                    View Details →
                  </Link>
                </div>
              )) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-500">No internships available at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Featured Courses Section */}
      <div className={`${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-white'} py-16`}>
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold">Featured Courses</h2>
            <Link to="/courses" className="text-[#18005F] hover:underline font-medium">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCourses.map((course) => {
              const content = typeof course.content === 'string'
                ? JSON.parse(course.content)
                : course.content;

              const imageURL = `${api.defaults.baseURL}/adept/${course._id}/image`;

              return (
                <div
                  key={course._id}
                  className={`${isDarkMode ? 'bg-[#18005F]/10 border-[#18005F]/20' : 'bg-white border-gray-200'} border p-6 hover:border-[#18005F] transition-colors`}
                >
                  <div className="h-48 overflow-hidden mb-4">
                    <img
                      src={imageURL}
                      alt={content?.courseTitle || 'Course image'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg';
                      }}
                    />
                  </div>

                  <h3 className="text-xl font-semibold mb-2">
                    {content?.courseTitle || 'Untitled Course'}
                  </h3>

                  <div className="text-xl font-semibold text-[#18005F] mb-3">
                    {course.price ? `$${course.price}` : 'Free'}
                  </div>

                  <p className="text-gray-600 mb-4 text-sm">
                    {content?.summary || 'No summary available.'}
                  </p>

                  <Link
                    to={`/courses/${course._id}`}
                    className="text-[#18005F] hover:underline font-medium"
                  >
                    Learn More →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#18005F] text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Join Thousands of Successful Professionals</h2>
            <p className="text-xl text-white/90">
              Connect with opportunities that shape your future
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: '50K+', label: 'Active Job Seekers' },
              { number: '5K+', label: 'Companies Hiring' },
              { number: '100K+', label: 'Jobs Posted' },
              { number: '95%', label: 'Success Rate' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default App