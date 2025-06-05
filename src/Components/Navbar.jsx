import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

function Navbar({ isDarkMode, toggleTheme, isAuthenticated, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    onLogout?.();
    navigate('/');
  };

  return (
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
        
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard/employee" 
                className={`px-4 py-2 rounded-full text-sm ${
                  isDarkMode 
                    ? 'bg-black text-white hover:bg-black/90' 
                    : 'bg-white text-black hover:bg-white/90'
                } transition-colors`}
              >
                Dashboard
              </Link>
              <Link 
                to="/profile" 
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'bg-black text-white hover:bg-black/90' 
                    : 'bg-white text-black hover:bg-white/90'
                } transition-colors`}
              >
                <User className="w-5 h-5" />
              </Link>
              <button 
                onClick={handleLogout}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  isDarkMode 
                    ? 'border-black/10 text-black hover:bg-black/5' 
                    : 'border-white/10 text-white hover:bg-white/5'
                }`}
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className={`px-4 py-2 rounded-full text-sm ${
                isDarkMode 
                  ? 'bg-black text-white hover:bg-black/90' 
                  : 'bg-white text-black hover:bg-white/90'
              } transition-colors`}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;