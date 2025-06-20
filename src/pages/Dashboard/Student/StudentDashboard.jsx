import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { fetchRecentActivity } from '../../../services/api'; // Add this import

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completingProfile, setCompletingProfile] = useState(false);
   const [recentActivity, setRecentActivity] = useState([]); // Add this state
  const [activityLoading, setActivityLoading] = useState(false); // Add this state
  const navigate = useNavigate();

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile/');
        setProfile(data);
        
        if (data.role.name !== 'Candidate') {
          navigate('/dashboard/employer');
          return;
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Navigation handlers with loading states
  const handleCompleteNow = async () => {
    setCompletingProfile(true);
    try {
      if (!profile.has_completed_bio) {
        await navigate('/profile/candidate/bio');
      } else if (!profile.has_completed_preferences) {
        await navigate('/student/preferences');
      }
    } finally {
      setCompletingProfile(false);
    }
  };

   useEffect(() => {
    const fetchActivity = async () => {
      setActivityLoading(true);
      try {
        const { data } = await fetchRecentActivity();
        setRecentActivity(data);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchActivity();
  }, []);

  // Loading and error states
  if (loading) {
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

  if (!profile) {
    return null;
  }

  // Button with loader component
  const ButtonWithLoader = ({ loading, children, ...props }) => (
    <button {...props} disabled={loading}>
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Professional attention message if profile is incomplete */}
      {(!profile.has_completed_bio || !profile.has_completed_preferences) && (
        <div className="fixed top-0 left-0 right-0 bg-blue-50 border-b border-blue-200 p-4 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-2 md:mb-0">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="font-semibold text-blue-800">Profile Incomplete:</span>
                <span className="ml-2 text-blue-700">
                  Your profile is currently hidden from employers. Complete your profile to increase your visibility.
                </span>
              </div>
            </div>
            <ButtonWithLoader
              onClick={handleCompleteNow}
              loading={completingProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 shadow-sm disabled:opacity-75 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Complete Profile
            </ButtonWithLoader>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto pt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg text-white p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {profile.first_name}!</h2>
          <p className="opacity-90 mb-4">Ready to find your next opportunity? Here's what's new for you.</p>
          <div className="flex space-x-4">
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-medium">
              {profile.has_completed_bio && profile.has_completed_preferences ? 'Profile Complete' : 'Profile Incomplete'}
            </span>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-medium">
              {profile.candidate_profile?.preferences?.currently_looking_for || 'Not specified'}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-gray-500 text-sm font-medium">Jobs Applied</h3>
            <p className="text-2xl font-bold mt-1">0</p>
            <p className="text-gray-500 text-xs mt-2">No applications yet</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-gray-500 text-sm font-medium">Saved Jobs</h3>
            <p className="text-2xl font-bold mt-1">0</p>
            <p className="text-gray-500 text-xs mt-2">No saved jobs</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-gray-500 text-sm font-medium">Profile Views</h3>
            <p className="text-2xl font-bold mt-1">0</p>
            <p className="text-gray-500 text-xs mt-2">
              {profile.has_completed_bio && profile.has_completed_preferences 
                ? 'Visible to employers' 
                : 'Not visible to employers'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-lg transition-colors duration-150 flex items-center justify-center"
              onClick={() => navigate('/jobs')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Browse Jobs
            </button>
            <button 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg transition-colors duration-150 flex items-center justify-center"
              onClick={() => navigate('/internships')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Find Internships
            </button>
            <button 
              className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg transition-colors duration-150 flex items-center justify-center"
              onClick={() => navigate('/profile')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View Profile
            </button>
          </div>
        </div>

        {/* Recent Activity */}
         <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
    {activityLoading ? (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    ) : recentActivity.length > 0 ? (
      <ul className="divide-y divide-gray-200">
        {recentActivity.map((activity) => (
          <li key={activity.id} className="py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {activity.activity_type === 'JOB_APPLIED' ? (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.details}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(activity.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <button 
                  onClick={() => navigate(`/job/${activity.related_id}`)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
        <p className="mt-1 text-sm text-gray-500">Your job applications and profile views will appear here.</p>
      </div>
    )}
  </div>
      </div> 
    </div>   
  );
};
export default StudentDashboard;      
    