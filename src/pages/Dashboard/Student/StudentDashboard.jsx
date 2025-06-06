 import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { updateCandidateBio, updateCandidatePreferences } from '../../../services/api';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
   const [editingBio, setEditingBio] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [bioFormData, setBioFormData] = useState({});
  const [preferencesFormData, setPreferencesFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.candidate_profile) {
      setBioFormData({
        current_city: profile.candidate_profile.current_city || '',
        gender: profile.candidate_profile.gender || '',
        languages_known: profile.candidate_profile.languages_known || '',
        candidate_type: profile.candidate_profile.candidate_type || '',
        course: profile.candidate_profile.course || '',
        college_name: profile.candidate_profile.college_name || '',
        stream: profile.candidate_profile.stream || '',
        start_year: profile.candidate_profile.start_year || '',
        end_year: profile.candidate_profile.end_year || '',
        profile_picture: null
      });

      setPreferencesFormData({
        areas_of_interest: profile.candidate_profile.areas_of_interest || '',
        currently_looking_for: profile.candidate_profile.currently_looking_for || '',
        work_mode_looking_for: profile.candidate_profile.work_mode_looking_for || ''
      });
    }
  }, [profile]);
    const handleBioChange = (e) => {
    const { name, value } = e.target;
    setBioFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferencesChange = (e) => {
    const { name, value } = e.target;
    setPreferencesFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setBioFormData(prev => ({ ...prev, profile_picture: e.target.files[0] }));
  };

  const handleBioSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(bioFormData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const { data } = await updateCandidateBio(formData);
      setProfile(prev => ({
        ...prev,
        candidate_profile: data.candidate_profile,
        has_completed_bio: true
      }));
      setEditingBio(false);
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await updateCandidatePreferences(preferencesFormData);
      setProfile(prev => ({
        ...prev,
        candidate_profile: {
          ...prev.candidate_profile,
          ...data.candidate_profile
        },
        has_completed_preferences: true
      }));
      setEditingPreferences(false);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/profile/');
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

  const handleCompleteNow = () => {
    if (!profile.has_completed_bio) {
      navigate('/profile/candidate/bio');
    } else if (!profile.has_completed_preferences) {
      navigate('/student/preferences');
    }
  };

  const handleEditBio = () => {
    navigate('/profile/candidate/bio');
  };

  const handleEditPreferences = () => {
    navigate('/student/preferences');
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
        
        {/* Personal Information Section */}
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
          </div>
        </div>

        {/* Bio Information Section (shown if completed) */}
  {profile.has_completed_bio && profile.candidate_profile && (
  <div className="bg-white shadow rounded-lg p-6 mb-6 relative">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Bio Information</h2>
      <button
        onClick={() => setEditingBio(!editingBio)}
        className="text-purple-600 hover:text-purple-800 font-medium"
      >
        {editingBio ? 'Cancel' : 'Edit Bio'}
      </button>
    </div>

    {editingBio ? (
      <form onSubmit={handleBioSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current City */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Current City*</label>
            <input
              type="text"
              name="current_city"
              value={bioFormData.current_city}
              onChange={handleBioChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender*</label>
            <select
              name="gender"
              value={bioFormData.gender}
              onChange={handleBioChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Languages Known */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Languages Known* (comma-separated)</label>
            <input
              type="text"
              name="languages_known"
              value={bioFormData.languages_known}
              onChange={handleBioChange}
              placeholder="e.g., English,Spanish,Hindi"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Candidate Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Candidate Type*</label>
            <select
              name="candidate_type"
              value={bioFormData.candidate_type}
              onChange={handleBioChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Type</option>
              <option value="College student">College student</option>
              <option value="Fresher">Fresher</option>
              <option value="Working professional">Working professional</option>
              <option value="School student">School student</option>
              <option value="Woman returning to work">Woman returning to work</option>
            </select>
          </div>

          {/* Course */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Course*</label>
            <select
              name="course"
              value={bioFormData.course}
              onChange={handleBioChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Course</option>
              <option value="B.Tech">B.Tech</option>
              <option value="BE">BE</option>
              <option value="B.Com">B.Com</option>
              <option value="MBA">MBA</option>
              <option value="B.A">B.A</option>
            </select>
          </div>

          {/* College Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">College Name*</label>
            <input
              type="text"
              name="college_name"
              value={bioFormData.college_name}
              onChange={handleBioChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Stream */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Stream (Optional)</label>
            <input
              type="text"
              name="stream"
              value={bioFormData.stream}
              onChange={handleBioChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Start Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Year*</label>
            <input
              type="number"
              name="start_year"
              value={bioFormData.start_year}
              onChange={handleBioChange}
              min="2000"
              max="2099"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* End Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700">End Year*</label>
            <input
              type="number"
              name="end_year"
              value={bioFormData.end_year}
              onChange={handleBioChange}
              min="2000"
              max="2099"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Profile Picture */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Profile Picture (Optional)</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => setEditingBio(false)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-gray-600">Current City</p>
          <p className="font-medium">{profile.candidate_profile.current_city || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-gray-600">Gender</p>
          <p className="font-medium">{profile.candidate_profile.gender || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-gray-600">Languages Known</p>
          <p className="font-medium">{profile.candidate_profile.languages_known || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-gray-600">Candidate Type</p>
          <p className="font-medium">{profile.candidate_profile.candidate_type || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-gray-600">Course</p>
          <p className="font-medium">{profile.candidate_profile.course || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-gray-600">College Name</p>
          <p className="font-medium">{profile.candidate_profile.college_name || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-gray-600">Stream</p>
          <p className="font-medium">{profile.candidate_profile.stream || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-gray-600">Education Period</p>
          <p className="font-medium">
            {profile.candidate_profile.start_year} - {profile.candidate_profile.end_year}
          </p>
        </div>
        {profile.candidate_profile.profile_picture && (
          <div className="md:col-span-2">
            <p className="text-gray-600">Profile Picture</p>
            <img 
              src={profile.candidate_profile.profile_picture} 
              alt="Profile" 
              className="mt-2 h-32 w-32 rounded-full object-cover"
            />
          </div>
        )}
      </div>
    )}
  </div>
)}

        {/* Preferences Section (shown if completed) */}
         {profile.has_completed_preferences && profile.candidate_profile && (
    <div className="bg-white shadow rounded-lg p-6 mb-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Job Preferences</h2>
        <button
          onClick={() => setEditingPreferences(!editingPreferences)}
          className="text-purple-600 hover:text-purple-800 font-medium"
        >
          {editingPreferences ? 'Cancel' : 'Edit Preferences'}
        </button>
      </div>

      {editingPreferences ? (
        <form onSubmit={handlePreferencesSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Areas of Interest</label>
              <input
                type="text"
                name="areas_of_interest"
                value={preferencesFormData.areas_of_interest}
                onChange={handlePreferencesChange}
                placeholder="e.g., Software Development, Data Science"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Currently Looking For</label>
              <select
                name="currently_looking_for"
                value={preferencesFormData.currently_looking_for}
                onChange={handlePreferencesChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select an option</option>
                <option value="Jobs">Jobs</option>
                <option value="Internships">Internships</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Work Mode</label>
              <select
                name="work_mode_looking_for"
                value={preferencesFormData.work_mode_looking_for}
                onChange={handlePreferencesChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select an option</option>
                <option value="In-office">In-office</option>
                <option value="Work from home">Work from home</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setEditingPreferences(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600">Areas of Interest</p>
            <p className="font-medium">
              {profile.candidate_profile.areas_of_interest || 'Not provided'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Currently Looking For</p>
            <p className="font-medium">
              {profile.candidate_profile.currently_looking_for || 'Not provided'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Preferred Work Mode</p>
            <p className="font-medium">
              {profile.candidate_profile.work_mode_looking_for || 'Not provided'}
            </p>
          </div>
        </div>
      )}
    </div>
  )}

        {/* Profile Completion Status */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Completion</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                profile.has_completed_bio ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {profile.has_completed_bio && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
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
                {profile.has_completed_preferences && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
              <span>Preferences</span>
              {!profile.has_completed_preferences && (
                <button 
                  onClick={() => navigate('/student/preferences')}
                  className="ml-auto text-purple-600 hover:underline"
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
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