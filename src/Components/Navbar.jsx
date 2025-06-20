import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Login from "../pages/Login/Login";
import { logout } from '../services/api'; // Import the logout function

function Navbar({ isDarkMode, toggleTheme }) {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // Check auth status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, [showLoginPopup]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken') || 
                  JSON.parse(sessionStorage.getItem('tempAuthTokens'))?.access;
    setIsAuthenticated(!!token);
    
    // You might want to fetch user profile here to get the role
    // For now, we'll just check localStorage
    const role = localStorage.getItem('userRole');
    setUserRole(role);
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
      setUserRole(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API logout fails, clear local tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      sessionStorage.removeItem('tempAuthTokens');
      setIsAuthenticated(false);
      setUserRole(null);
      navigate('/');
    }
  };

// Determine dashboard route based on user role
const getDashboardRoute = (role) => {
  switch(role) {
    case 'Employer':
      return '/dashboard/employer';
    case 'Candidate':
      return '/dashboard/student';
    default:
      return '/dashboard/student'; // fallback
  }
};

// Determine profile route based on user role
const getProfileRoute = (role) => {
  const normalizedRole = role?.toLowerCase();
  return normalizedRole === 'employer' ? '/profile' : '/student/profile';
};
  return (
    <>
      <nav className={`flex justify-between items-center p-4 md:p-6 mx-4 md:mx-6 my-2 md:my-4 ${isDarkMode ? 'bg-white' : 'bg-black'} rounded-full transition-colors duration-300`}>
        <Link to="/" className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-black' : 'text-white'}`}>
          ADEPTINTERNS
        </Link>
        
        <div className={`hidden md:flex space-x-8 ${isDarkMode ? 'text-black/80' : 'text-white/80'} text-sm`}>
          <Link to="/jobs">Jobs</Link>
          <Link to="/internships">Internships</Link>
          <Link to="/courses">Courses</Link>
          <a href="#blog">Our Blog</a>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
<Link 
  to={getDashboardRoute(userRole)}
  className={`px-4 py-2 rounded-full text-sm ${
    isDarkMode 
      ? 'bg-black text-white' 
      : 'bg-white text-black'
  }`}
>
  Dashboard
</Link>

<Link 
  to={getProfileRoute(userRole)}
  className={`px-4 py-2 rounded-full text-sm ${
    isDarkMode 
      ? 'bg-black text-white' 
      : 'bg-white text-black'
  }`}
>
  Profile
</Link>        <button 
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-full text-sm border ${
                    isDarkMode 
                      ? 'border-black/10 text-black/80' 
                      : 'border-white/10 text-white/80'
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setShowLoginPopup(true)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    isDarkMode 
                      ? 'bg-black text-white' 
                      : 'bg-white text-black'
                  }`}
                >
                  Login
                </button>
                <Link 
                  to="/student" 
                  className={`px-4 py-2 rounded-full text-sm ${
                    isDarkMode 
                      ? 'bg-black text-white' 
                      : 'bg-white text-black'
                  } font-medium`}
                >
                  Register
                </Link>
                <Link 
                  to="/employers" 
                  className={`px-4 py-2 rounded-full text-sm border ${
                    isDarkMode 
                      ? 'border-black/10 text-black/80' 
                      : 'border-white/10 text-white/80'
                  }`}
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
            // Update state immediately
            setIsAuthenticated(true);
            setUserRole(localStorage.getItem('userRole'));
            setShowLoginPopup(false);
          }} 
        />
      )}
    </>
  );
}

export default Navbar;