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

        // Set featured jobs (first 4)
        setFeaturedJobs(jobsResponse.data.results?.slice(0, 4) || []);
        
        // Set featured internships (first 3)
        setFeaturedInternships(internshipsResponse.data.results?.slice(0, 3) || []);
        
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
    return `https://ui-avatars.com/api/?name=${initial}&background=6366f1&color=fff&size=40&rounded=true`;
  };

  return (
     <GoogleOAuthProvider clientId="380706120194-tlm6ibu4b4jun9tssfgpcgib1mkflqir.apps.googleusercontent.com">
    <Router>
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-gray-100'} transition-colors duration-300`}>
        <div className={`${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-black/10'} rounded-[48px] min-h-[calc(100vh-2rem)] overflow-hidden border transition-colors duration-300`}>
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
    <main className="container mx-auto px-4 md:px-8">
      {/* Hero Section with ShaderGradient */}
      <div className="relative">
        {/* ShaderGradient Canvas */}
        <div className="absolute inset-0 z-0">
          <ShaderGradientCanvas
            style={{ width: '100%', height: '100vh' }}
            lazyLoad={undefined}
            fov={100}
            pixelDensity={1}
            pointerEvents="none"
          >
            <ShaderGradient
              animate="on"
              type="sphere"
              wireframe={false}
              shader="defaults"
              uTime={4.7}
              uSpeed={0.34}
              uStrength={1.1}
              uDensity={2}
              uFrequency={3.8}
              uAmplitude={0}
              positionX={-0.7}
              positionY={-0.4}
              positionZ={1.6}
              rotationX={-10}
              rotationY={0}
              rotationZ={-60}
              color1="#0054ff"
              color2="#ff000d"
              color3="#e5ce02"
              reflection={0.75}
              cAzimuthAngle={154}
              cPolarAngle={80}
              cDistance={2.8}
              cameraZoom={9.1}
              lightType="env"
              brightness={0}
              envPreset="dawn"
              grain="off"
              toggleAxis={false}
              zoomOut={false}
              hoverState=""
              enableTransition={false}
            />
          </ShaderGradientCanvas>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 py-8 md:py-16">
          <div className="flex flex-col justify-center">
            <h1 className={`text-4xl md:text-7xl font-bold mb-4 md:mb-6 leading-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Learn & Grow<br />with AdeptInterns.
            </h1>
            <p className={`text-base md:text-lg mb-6 md:mb-8 ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
              Unlock thousands of expert-led courses<br />in tech, business, design, and more.
            </p>
            <div>
              <Link 
                to={isAuthenticated ? "/dashboard/employer" : "/login"}
                className={`${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'} px-6 md:px-8 py-2 md:py-3 rounded-full flex items-center text-sm`}
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                <span className="ml-2">→</span>
              </Link>
            </div>
            
            {/* App Download Section */}
            <div className={`mt-8 md:mt-16 ${isDarkMode ? 'bg-white' : 'bg-black'} rounded-[24px] md:rounded-[32px] p-4 md:p-6 inline-block`}>
              <p className={`mb-4 text-sm ${isDarkMode ? 'text-black' : 'text-white'}`}>
               The premier platform delivering authentic work <br />experience—accessible from anywhere in the world.
              </p>
              <div className="flex space-x-3">
                <button className={`${isDarkMode ? 'bg-black' : 'bg-white'} p-3 rounded-full`}>
                  <img src="https://images.pexels.com/photos/5741606/pexels-photo-5741606.jpeg" alt="Apple Store" className="w-5 h-5 object-cover rounded-full" />
                </button>
                <button className={`${isDarkMode ? 'bg-black' : 'bg-white'} p-3 rounded-full`}>
                  <img src="https://images.pexels.com/photos/5741606/pexels-photo-5741606.jpeg" alt="Play Store" className="w-5 h-5 object-cover rounded-full" />
                </button>
              </div>
            </div>
          </div>
           
          {/* Right Side with Phone */}
          <div className="relative mt-8 md:mt-0">
            <div className="absolute top-0 right-0 w-full md:w-[500px] h-[300px] md:h-[500px] bg-gradient-to-br from-[#FF1F6D] via-[#FF758C] to-[#FF7EB3] rounded-full blur-[80px] md:blur-[120px] opacity-30"></div>
            <div className="relative z-10 h-[400px] md:h-[600px]">
              <StackingCard isDarkMode={isDarkMode} />
            </div>
          </div>
        </div>
      </div>

      {/* Common Search Section */}
      <section className={`py-16 ${isDarkMode ? 'text-white' : 'text-black'}`}>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Find Your Perfect Opportunity</h2>
          <p className={`text-lg ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
            Search through thousands of jobs and internships
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-8">
          <div className={`${isDarkMode ? 'bg-white/10' : 'bg-black/5'} rounded-2xl p-6 backdrop-blur-sm`}>
            {/* Search Tabs */}
            <div className="flex justify-center mb-6">
              <div className={`${isDarkMode ? 'bg-white/10' : 'bg-black/10'} rounded-xl p-1 flex`}>
                {[
                  { key: 'all', label: 'All Opportunities' },
                  { key: 'jobs', label: 'Jobs Only' },
                  { key: 'internships', label: 'Internships Only' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.key
                        ? isDarkMode
                          ? 'bg-white text-black'
                          : 'bg-black text-white'
                        : isDarkMode
                        ? 'text-white/80 hover:text-white'
                        : 'text-black/80 hover:text-black'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by skills, job title, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-6 py-4 rounded-xl text-lg ${
                    isDarkMode 
                      ? 'bg-white/10 text-white placeholder-white/60 border-white/20' 
                      : 'bg-white text-black placeholder-black/60 border-black/20'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading}
                className={`px-8 py-4 rounded-xl font-semibold transition-all ${
                  isDarkMode
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-black text-white hover:bg-black/90'
                } ${searchLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Quick Filters */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {['React', 'Python', 'JavaScript', 'Data Science', 'UI/UX', 'Marketing'].map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSearchQuery(skill)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    isDarkMode
                      ? 'bg-white/10 text-white/80 hover:bg-white/20'
                      : 'bg-black/10 text-black/80 hover:bg-black/20'
                  } transition-all`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="max-w-6xl mx-auto mb-16">
            <h3 className="text-xl font-semibold mb-6">Search Results ({searchResults.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.slice(0, 6).map((item, index) => (
                <div key={`${item.type}-${item.id}`} className={`${isDarkMode ? 'bg-white/5' : 'bg-black/5'} rounded-xl p-6 hover:scale-[1.02] transition-transform`}>
                  <div className="flex items-center mb-3">
                    <img
                      src={getCompanyLogo(item.company_logo_url, item.employer_organization?.organization_name)}
                      alt="Company Logo"
                      className="w-10 h-10 rounded-lg mr-3"
                      onError={(e) => {
                        e.target.src = getCompanyLogo(null, item.employer_organization?.organization_name);
                      }}
                    />
                    <div>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        item.type === 'job' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.type === 'job' ? 'Job' : 'Internship'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {item.type === 'job' ? item.job_title : item.internship_profile_title}
                  </h3>
                  <p className={`${isDarkMode ? 'text-white/80' : 'text-black/80'} mb-2`}>
                    {item.employer_organization?.organization_name || 'Company Name'}
                  </p>
                  <p className={`${isDarkMode ? 'text-white/60' : 'text-black/60'} mb-2`}>
                    {item.type === 'job' 
                      ? getWorkType(item.job_type, item.work_schedule)
                      : getInternshipType(item.internship_type, item.is_part_time)
                    }
                  </p>
                  <p className={`${isDarkMode ? 'text-white/80' : 'text-black/80'} mb-4`}>
                    {item.type === 'job' 
                      ? formatSalary(item.fixed_pay_min, item.fixed_pay_max)
                      : formatStipend(item.fixed_stipend_min, item.fixed_stipend_max, item.is_paid)
                    }
                  </p>
                  <Link 
                    to={item.type === 'job' ? `/job/${item.id}` : `/internship/${item.id}`} 
                    className="text-blue-500 hover:text-blue-600"
                  >
                    View details →
                  </Link>
                </div>
              ))}
            </div>
            {searchResults.length > 6 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => handleViewAll(activeTab === 'jobs' ? 'jobs' : activeTab === 'internships' ? 'internships' : 'jobs')}
                  className={`px-6 py-3 rounded-xl font-semibold ${
                    isDarkMode
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'bg-black text-white hover:bg-black/90'
                  } transition-all`}
                >
                  View All Results
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Featured Jobs Section */}
      <section className={`py-16 ${isDarkMode ? 'text-white' : 'text-black'}`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-4xl font-bold">Featured Jobs</h2>
          <Link to="/jobs" className="text-blue-500 hover:text-blue-600">View all →</Link>
        </div>

        {/* Job Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className={`${isDarkMode ? 'bg-white/5' : 'bg-black/5'} rounded-xl p-6 animate-pulse`}>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded mb-2 w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded mb-4 w-2/3"></div>
                <div className="h-8 bg-gray-300 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredJobs.length > 0 ? featuredJobs.map((job, index) => (
              <div key={job.id || index} className={`${isDarkMode ? 'bg-white/5' : 'bg-black/5'} rounded-xl p-6 hover:scale-[1.02] transition-transform`}>
                <div className="flex items-center mb-3">
                  <img
                    src={getCompanyLogo(job.company_logo_url, job.employer_organization?.organization_name)}
                    alt="Company Logo"
                    className="w-10 h-10 rounded-lg mr-3"
                    onError={(e) => {
                      e.target.src = getCompanyLogo(null, job.employer_organization?.organization_name);
                    }}
                  />
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Actively hiring
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{job.job_title}</h3>
                <p className={`${isDarkMode ? 'text-white/80' : 'text-black/80'} mb-2`}>
                  {job.employer_organization?.organization_name || 'Company Name'}
                </p>
                <p className={`${isDarkMode ? 'text-white/60' : 'text-black/60'} mb-2`}>
                  {getWorkType(job.job_type, job.work_schedule)}
                </p>
                <p className={`${isDarkMode ? 'text-white/80' : 'text-black/80'} mb-2`}>
                  {formatSalary(job.fixed_pay_min, job.fixed_pay_max)}
                </p>
                <p className={`${isDarkMode ? 'text-white/70' : 'text-black/70'} mb-4 text-sm`}>
                  {job.job_description?.[0]?.substring(0, 100) || 'Join our team and make an impact with your skills.'}
                  {job.job_description?.[0]?.length > 100 && '...'}
                </p>
                {job.skills_required && job.skills_required.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {job.skills_required.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {job.skills_required.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{job.skills_required.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <Link to={`/job/${job.id}`} className="text-blue-500 hover:text-blue-600">View details →</Link>
              </div>
            )) : (
              <div className="col-span-4 text-center py-8">
                <p className={`${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                  No jobs found matching your criteria.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Featured Internships Section */}
      <section className={`py-16 ${isDarkMode ? 'text-white' : 'text-black'}`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-4xl font-bold">Featured Internships</h2>
          <Link to="/internships" className="text-blue-500 hover:text-blue-600">View all →</Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => (
              <div key={index} className={`${isDarkMode ? 'bg-white/5' : 'bg-black/5'} rounded-xl p-6 animate-pulse`}>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded mb-2 w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded mb-4 w-2/3"></div>
                <div className="h-8 bg-gray-300 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredInternships.length > 0 ? featuredInternships.map((internship, index) => (
              <div key={internship.id || index} className={`${isDarkMode ? 'bg-white/5' : 'bg-black/5'} rounded-xl p-6 hover:scale-[1.02] transition-transform`}>
                <div className="flex items-center mb-3">
                  <img
                    src={getCompanyLogo(internship.company_logo_url, internship.employer_organization?.organization_name)}
                    alt="Company Logo"
                    className="w-10 h-10 rounded-lg mr-3"
                    onError={(e) => {
                      e.target.src = getCompanyLogo(null, internship.employer_organization?.organization_name);
                    }}
                  />
                  <div className="flex gap-2">
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Actively hiring
                    </span>
                    {internship.has_ppo && (
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        PPO Available
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{internship.internship_profile_title}</h3>
                <p className={`${isDarkMode ? 'text-white/80' : 'text-black/80'} mb-2`}>
                  {internship.employer_organization?.organization_name || 'Company Name'}
                </p>
                <p className={`${isDarkMode ? 'text-white/60' : 'text-black/60'} mb-2`}>
                  {getInternshipType(internship.internship_type, internship.is_part_time)}
                </p>
                <p className={`${isDarkMode ? 'text-white/80' : 'text-black/80'} mb-2`}>
                  Duration: {internship.duration} {internship.duration_unit?.toLowerCase() || 'months'}
                </p>
                <p className={`${isDarkMode ? 'text-white/80' : 'text-black/80'} mb-2`}>
                  Stipend: {formatStipend(internship.fixed_stipend_min, internship.fixed_stipend_max, internship.is_paid)}
                </p>
                <p className={`${isDarkMode ? 'text-white/70' : 'text-black/70'} mb-4 text-sm`}>
                  {internship.responsibilities?.[0]?.substring(0, 100) || 'Gain hands-on experience and learn from experienced professionals.'}
                  {internship.responsibilities?.[0]?.length > 100 && '...'}
                </p>
                {internship.skills_required && internship.skills_required.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {internship.skills_required.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {internship.skills_required.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{internship.skills_required.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <Link to={`/internship/${internship.id}`} className="text-blue-500 hover:text-blue-600">View details →</Link>
              </div>
            )) : (
              <div className="col-span-3 text-center py-8">
                <p className={`${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                  No internships available at the moment.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Featured Courses Section */}
    <section className={`py-16 ${isDarkMode ? 'text-white' : 'text-black'}`}>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl md:text-4xl font-bold">Featured Courses</h2>
        <Link to="/courses" className="text-blue-500 hover:text-blue-600">
          View all →
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
              className={`${
                isDarkMode ? 'bg-white/5' : 'bg-black/5'
              } rounded-xl p-6 hover:scale-[1.02] transition-transform`}
            >
              <div className="h-48 rounded-lg overflow-hidden mb-4">
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

              <div className="text-xl font-semibold text-purple-600 mb-3">
                {course.price ? `$${course.price}` : 'Free'}
              </div>

              <p
                className={`${
                  isDarkMode ? 'text-white/70' : 'text-black/70'
                } mb-4 text-sm line-clamp-3`}
              >
                {content?.summary || 'No summary available.'}
              </p>

              <Link
                to={`/courses/${course._id}`}
                className="text-blue-500 hover:text-blue-600"
              >
                Know more →
              </Link>
            </div>
          );
        })}
      </div>
    </section>

      {/* Career Impact Section with Gradient Background */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff005b]/10 via-[#ffe53b]/10 to-[#00EAFA]/10 opacity-50"></div>
        <div className="relative z-10">
          <div className="text-center mb-12">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Launch Your Career with AdeptInterns
            </h2>
            <p className={`text-lg md:text-xl ${isDarkMode ? 'text-white/80' : 'text-black/80'} max-w-3xl mx-auto`}>
              Discover global internship opportunities from the comfort of your home. Gain hands-on experience, refine your skill set, and unlock a world of future possibilities.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            {[
              { number: '500K+', label: 'Global Internship Impact' },
              { number: '800+', label: 'Global Reach & Diversity' },
              { number: '10+', label: 'Career Coaching Sessions' },
              { number: '2 in 1', label: 'Internship Success' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl md:text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {stat.number}
                </div>
                <div className={`${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Features Grid with Gradient Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Global Internship Access',
                description: 'Work with leading companies across the globe and gain valuable remote experience—regardless of your physical location.',
                gradient: 'from-[#ff005b]/5 to-[#ffe53b]/5'
              },
              {
                title: 'Gain Real-World Skills',
                description: 'Enhance your professional capabilities through practical, project-based learning aligned with your career aspirations.',
                gradient: 'from-[#ffe53b]/5 to-[#0014FF]/5'
              },
              {
                title: 'Track Your Progress',
                description: 'Monitor your development with performance insights and constructive feedback from dedicated mentors.',
                gradient: 'from-[#0014FF]/5 to-[#00EAFA]/5'
              },
              {
                title: 'Seamless Communication Tools',
                description: 'Engage with mentors and peers using integrated video conferencing and collaboration platforms.',
                gradient: 'from-[#ff005b]/5 to-[#00EAFA]/5'
              },
              {
                title: 'Real Career Opportunities',
                description: 'Make a lasting impression—many of our internships lead to full-time employment with top-tier organizations.',
                gradient: 'from-[#ffe53b]/5 to-[#0014FF]/5'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-xl bg-gradient-to-br ${feature.gradient} backdrop-blur-sm ${
                  isDarkMode ? 'bg-white/5' : 'bg-black/5'
                }`}
              >
                <h4 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {feature.title}
                </h4>
                <p className={`${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App