import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// In StudentDashboard.jsx
import api from '../../../services/api';  // Remove the curly braces

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/profile/');
        setProfile(data);
        
        // Check if user is actually a candidate
        if (data.role.name !== 'Candidate') {
          navigate('/dashboard/employer'); // Redirect to employer dashboard
          return;
        }
        
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleCompleteNow = () => {
    if (!profile.has_completed_bio) {
      navigate('/profile/candidate/bio');
    } else if (!profile.has_completed_preferences) {
      navigate('/profile/candidate/preferences');
    }
    // Add more conditions as needed
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Sticky attention message if profile is incomplete */}
      {(!profile.has_completed_bio || !profile.has_completed_preferences) && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-300 p-4 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <span className="font-semibold">Attention required:</span>
              <span className="ml-2">
                Your profile is hidden from employers as it is incomplete. Complete now
              </span>
            </div>
            <button
              onClick={handleCompleteNow}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
            >
              Complete Now
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto pt-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Dashboard</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600">First Name</p>
              <p className="font-medium">{profile.first_name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-gray-600">Last Name</p>
              <p className="font-medium">{profile.last_name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone Number</p>
              <p className="font-medium">{profile.phone_number || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-gray-600">Account Status</p>
              <p className="font-medium">
                {profile.is_active ? 'Active' : 'Inactive'} | 
                {profile.is_verified ? ' Verified' : ' Not Verified'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Completion</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                profile.has_completed_bio ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {profile.has_completed_bio ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : null}
              </div>
              <span>Basic Information</span>
              {!profile.has_completed_bio && (
                <button 
                  onClick={() => navigate('/profile/candidate/bio')}
                  className="ml-auto text-purple-600 hover:underline"
                >
                  Complete
                </button>
              )}
            </div>

            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                profile.has_completed_preferences ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {profile.has_completed_preferences ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : null}
              </div>
              <span>Preferences</span>
              {!profile.has_completed_preferences && (
                <button 
                  onClick={() => navigate('/profile/candidate/preferences')}
                  className="ml-auto text-purple-600 hover:underline"
                >
                  Complete
                </button>
              )}
            </div>

            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                profile.has_completed_organization ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {profile.has_completed_organization ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : null}
              </div>
              <span>Organization Details</span>
              {!profile.has_completed_organization && (
                <button 
                  onClick={() => navigate('/profile/candidate/organization')}
                  className="ml-auto text-purple-600 hover:underline"
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Additional dashboard content can be added here */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-lg"
              onClick={() => navigate('/jobs')}
            >
              Browse Jobs
            </button>
            <button 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg"
              onClick={() => navigate('/internships')}
            >
              Find Internships
            </button>
            <button 
              className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg"
              onClick={() => navigate('/profile')}
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;