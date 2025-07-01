import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut, FileText, Briefcase, Settings } from 'lucide-react';
import Login from "../pages/Login/Login";
import { logout, fetchUserProfile } from '../services/api';

function Navbar({ isDarkMode, toggleTheme }) {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  // Check auth status and fetch profile on component mount
  useEffect(() => {
    checkAuthStatus();
  }, [showLoginPopup]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || 
                    JSON.parse(sessionStorage.getItem('tempAuthTokens'))?.access;
      
      if (token) {
        setIsAuthenticated(true);
        // Fetch user profile
        const response = await fetchUserProfile();
        setUserProfile(response.data);
      } else {
        setIsAuthenticated(false);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setIsAuthenticated(false);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken') || 
                          JSON.parse(sessionStorage.getItem('tempAuthTokens'))?.refresh;
      
      if (refreshToken) {
        await logout({ refresh: refreshToken });
      }
      
      // Clear all auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      sessionStorage.removeItem('tempAuthTokens');
      
      setIsAuthenticated(false);
      setUserProfile(null);
      setShowProfileMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API logout fails, clear local tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      sessionStorage.removeItem('tempAuthTokens');
      setIsAuthenticated(false);
      setUserProfile(null);
      setShowProfileMenu(false);
      navigate('/');
    }
  };

  // Get profile picture or first letter
  const getProfileDisplay = () => {
    if (userProfile?.candidate_profile?.bio?.profile_picture) {
      return (
        <img
          src={userProfile.candidate_profile.bio.profile_picture}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
        />
      );
    }
    
    const firstLetter = userProfile?.first_name?.charAt(0)?.toUpperCase() || 'U';
    return (
      <div className="w-8 h-8 rounded-full bg-[#18005F] text-white flex items-center justify-center text-sm font-semibold border-2 border-white/20">
        {firstLetter}
      </div>
    );
  };

  // Determine dashboard route based on user role
  const getDashboardRoute = () => {
    if (userProfile?.role?.name === 'Employer') {
      return '/dashboard/employer';
    }
    return '/dashboard/student';
  };

  // Determine profile route based on user role
  const getProfileRoute = () => {
    if (userProfile?.role?.name === 'Employer') {
      return '/profile';
    }
    return '/student/profile';
  };

  // Check if user is employer
  const isEmployer = userProfile?.role?.name === 'Employer';

  return (
    <>
      <nav className={`flex justify-between items-center p-4 md:p-6 mx-4 md:mx-6 my-2 md:my-4 ${isDarkMode ? 'bg-black' : 'bg-[rgb(174,178,191,0.18)]'} rounded-full transition-colors duration-300`}>
        {/* Logo Section */}
        <Link to="/" className={`flex items-center space-x-3 text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {/* Website Logo */}
          {/* <div className="w-8 h-8 bg-[#18005F] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div> */}
          <span>ADEPTINTERNS</span>
        </Link>
        
        {/* Navigation Links - Only show for non-employers */}
        {!isEmployer && (
          <div className={`hidden md:flex space-x-8 ${isDarkMode ? 'text-white/80' : 'text-black/80'} text-sm`}>
            <Link to="/jobs" className="hover:text-[#18005F] transition-colors">Jobs</Link>
            <Link to="/internships" className="hover:text-[#18005F] transition-colors">Internships</Link>
            <Link to="/courses" className="hover:text-[#18005F] transition-colors">Courses</Link>
            <a href="#blog" className="hover:text-[#18005F] transition-colors">Our Blog</a>
          </div>
        )}
        
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
         
          
          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
            ) : isAuthenticated && userProfile ? (
              /* Profile Menu */
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
                    isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'
                  } transition-colors`}
                >
                  {getProfileDisplay()}
                  <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-black'} transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        {getProfileDisplay()}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {userProfile.first_name} {userProfile.last_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {userProfile.email}
                          </p>
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-[#18005F]/10 text-[#18005F] rounded-full mt-1">
                            {userProfile.role?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to={getDashboardRoute()}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Briefcase className="w-4 h-4 mr-3 text-gray-400" />
                        Dashboard
                      </Link>

                      <Link
                        to={getProfileRoute()}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3 text-gray-400" />
                        Profile
                      </Link>

                      {/* Student-specific menu items */}
                      {!isEmployer && (
                        <>
                          <Link
                            to="/MyApplication"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FileText className="w-4 h-4 mr-3 text-gray-400" />
                            My Applications
                          </Link>
                          <Link
                             to="/MyCourses"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FileText className="w-4 h-4 mr-3 text-gray-400" /> 
                            My Courses
                          </Link>
                          <Link
                            to="/resume"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FileText className="w-4 h-4 mr-3 text-gray-400" />
                            Resume
                          </Link>
                        </>
                      )}

                      <div className="border-t border-gray-100 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login/Register Buttons */
              <>
                <button 
                  onClick={() => setShowLoginPopup(true)}
                  className="px-4 py-2 rounded-full text-sm bg-black text-white transition-colors"
                >
                  Login
                </button>
                <Link 
                  to="/student" 
                  className="px-4 py-2 rounded-full text-sm bg-black text-white font-medium transition-colors"
                >
                  Register
                </Link>
                <Link 
                  to="/employers" 
                  className="px-4 py-2 rounded-full text-sm border border-black text-black bg-white hover:bg-gray-50 transition-colors"
                >
                  For Employers
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Login Popup */}
      {showLoginPopup && (
        <Login 
          onClose={() => setShowLoginPopup(false)} 
          onLoginSuccess={() => {
            setShowLoginPopup(false);
            checkAuthStatus(); // Refresh profile data
          }} 
        />
      )}
    </>
  );
}

export default Navbar;