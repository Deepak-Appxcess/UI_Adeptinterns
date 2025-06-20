import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Briefcase, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Building,
  Globe,
  Award,
  Target,
  Languages,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { fetchUserProfile, updateProfile } from '../../../services/api';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await fetchUserProfile();
      setProfile(response.data);
      setEditData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
        phone_number: response.data.phone_number || ''
      });
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

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile(editData);
      await fetchProfileData(); // Refresh data
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      email: profile.email || '',
      phone_number: profile.phone_number || ''
    });
    setIsEditing(false);
  };

  const getProfilePicture = () => {
    if (profile?.candidate_profile?.bio?.profile_picture) {
      return profile.candidate_profile.bio.profile_picture;
    }
    return null;
  };

  const getInitials = () => {
    const firstName = profile?.first_name || '';
    const lastName = profile?.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getCompletionPercentage = () => {
    if (!profile) return 0;
    
    let completed = 0;
    let total = 8;

    // Basic info
    if (profile.first_name && profile.last_name) completed++;
    if (profile.email) completed++;
    if (profile.phone_number) completed++;
    if (profile.is_phone_verified) completed++;
    
    // Bio info
    if (profile.candidate_profile?.bio) {
      const bio = profile.candidate_profile.bio;
      if (bio.current_city) completed++;
      if (bio.college_name) completed++;
      if (bio.course) completed++;
    }
    
    // Preferences
    if (profile.candidate_profile?.preferences?.areas_of_interest) completed++;

    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#18005F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchProfileData}
              className="px-6 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{completionPercentage}% Complete</div>
                <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-full bg-[#18005F] rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-[#18005F] to-[#18005F]/80 px-6 py-8 text-white">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    {getProfilePicture() ? (
                      <img
                        src={getProfilePicture()}
                        alt="Profile"
                        className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white text-[#18005F] flex items-center justify-center text-2xl font-bold">
                        {getInitials()}
                      </div>
                    )}
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white text-[#18005F] rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold">
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  <p className="text-white/80 mt-1">{profile?.email}</p>
                  <div className="flex items-center justify-center mt-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                      <User className="w-4 h-4 mr-2" />
                      {profile?.role?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#18005F]">
                      {profile?.candidate_profile?.bio?.start_year || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Start Year</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#18005F]">
                      {profile?.candidate_profile?.bio?.course || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Course</div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Verified</span>
                    <div className="flex items-center">
                      {profile?.is_verified ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Phone Verified</span>
                    <div className="flex items-center">
                      {profile?.is_phone_verified ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-[#18005F]" />
                  Basic Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.first_name}
                        onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {profile?.first_name || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.last_name}
                        onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {profile?.last_name || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {profile?.email || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.phone_number}
                        onChange={(e) => setEditData({...editData, phone_number: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {profile?.phone_number || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            {profile?.candidate_profile?.bio && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-[#18005F]" />
                    Academic Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">College/University</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 flex items-center">
                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                        {profile.candidate_profile.bio.college_name || 'Not provided'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {profile.candidate_profile.bio.course || 'Not provided'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stream/Specialization</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {profile.candidate_profile.bio.stream || 'Not provided'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {profile.candidate_profile.bio.start_year} - {profile.candidate_profile.bio.end_year}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current City</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {profile.candidate_profile.bio.current_city || 'Not provided'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Languages Known</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 flex items-center">
                        <Languages className="w-4 h-4 mr-2 text-gray-400" />
                        {profile.candidate_profile.bio.languages_known || 'Not provided'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Career Preferences */}
            {profile?.candidate_profile?.preferences && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-[#18005F]" />
                    Career Preferences
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Areas of Interest</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {profile.candidate_profile.preferences.areas_of_interest || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currently Looking For</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                        {profile.candidate_profile.preferences.currently_looking_for || 'Not specified'}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Work Mode</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-gray-400" />
                        {profile.candidate_profile.preferences.work_mode_looking_for || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate('/resume')}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Award className="w-5 h-5 mr-2 text-[#18005F]" />
                    <span className="font-medium">Manage Resume</span>
                  </button>
                  <button
                    onClick={() => navigate('/MyApplication')}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Briefcase className="w-5 h-5 mr-2 text-[#18005F]" />
                    <span className="font-medium">My Applications</span>
                  </button>
                  <button
                    onClick={() => navigate('/student/preferences')}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Target className="w-5 h-5 mr-2 text-[#18005F]" />
                    <span className="font-medium">Update Preferences</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;