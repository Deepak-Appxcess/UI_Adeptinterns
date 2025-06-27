import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Lock, 
  Briefcase, 
  Settings, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Camera,
  MapPin,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Building,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  fetchUserProfile, 
  updateProfile, 
  changePassword, 
  updateCandidateBio, 
  updateCandidatePreferences 
} from '../../../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const StudentProfile = () => {
  const [activeSection, setActiveSection] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [personalForm, setPersonalForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [bioForm, setBioForm] = useState({
    current_city: '',
    gender: '',
    languages_known: '',
    candidate_type: '',
    course: '',
    college_name: '',
    stream: '',
    start_year: '',
    end_year: '',
    current_company: '',
    current_designation: '',
    profile_picture: null
  });

  const [preferencesForm, setPreferencesForm] = useState({
    areas_of_interest: '',
    currently_looking_for: '',
    work_mode_looking_for: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await fetchUserProfile();
      const data = response.data;
      setProfile(data);

      // Set form data
      setPersonalForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone_number: data.phone_number || ''
      });

      if (data.candidate_profile?.bio) {
        setBioForm({
          current_city: data.candidate_profile.bio.current_city || '',
          gender: data.candidate_profile.bio.gender || '',
          languages_known: data.candidate_profile.bio.languages_known || '',
          candidate_type: data.candidate_profile.bio.candidate_type || '',
          course: data.candidate_profile.bio.course || '',
          college_name: data.candidate_profile.bio.college_name || '',
          stream: data.candidate_profile.bio.stream || '',
          start_year: data.candidate_profile.bio.start_year || '',
          end_year: data.candidate_profile.bio.end_year || '',
          current_company: data.candidate_profile.bio.current_company || '',
          current_designation: data.candidate_profile.bio.current_designation || '',
          profile_picture: null
        });
      }

      if (data.candidate_profile?.preferences) {
        setPreferencesForm({
          areas_of_interest: data.candidate_profile.preferences.areas_of_interest || '',
          currently_looking_for: data.candidate_profile.preferences.currently_looking_for || '',
          work_mode_looking_for: data.candidate_profile.preferences.work_mode_looking_for || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      await updateProfile(personalForm);
      toast.success('Personal information updated successfully');
      setEditingSection(null);
      fetchProfileData();
    } catch (error) {
      console.error('Error updating personal info:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      toast.error('Failed to update personal information');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setErrors({ confirm_password: 'Passwords do not match' });
      setSaving(false);
      return;
    }

    try {
      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      toast.success('Password updated successfully');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setEditingSection(null);
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      toast.error('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleBioSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const formData = new FormData();
      Object.keys(bioForm).forEach(key => {
        if (bioForm[key] !== null && bioForm[key] !== '') {
          formData.append(key, bioForm[key]);
        }
      });

      await updateCandidateBio(formData);
      toast.success('Bio information updated successfully');
      setEditingSection(null);
      fetchProfileData();
    } catch (error) {
      console.error('Error updating bio:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      toast.error('Failed to update bio information');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      await updateCandidatePreferences(preferencesForm);
      toast.success('Job preferences updated successfully');
      setEditingSection(null);
      fetchProfileData();
    } catch (error) {
      console.error('Error updating preferences:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      toast.error('Failed to update job preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBioForm(prev => ({ ...prev, profile_picture: file }));
    }
  };

  const sections = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'bio', label: 'Bio Information', icon: Briefcase },
    { id: 'preferences', label: 'Job Preferences', icon: Target }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#18005F]" />
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {profile?.candidate_profile?.bio?.profile_picture ? (
                <img
                  src={profile.candidate_profile.bio.profile_picture}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#18005F] text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg">
                  {profile?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profile?.first_name} {profile?.last_name}
              </h1>
              <p className="text-gray-600 mt-1">{profile?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#18005F]/10 text-[#18005F]">
                  {profile?.role?.name}
                </span>
                {profile?.candidate_profile?.bio?.current_city && (
                  <span className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profile.candidate_profile.bio.current_city}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h2>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all ${
                          activeSection === section.id
                            ? 'bg-[#18005F] text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {section.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                {/* Personal Information Section */}
                {activeSection === 'personal' && (
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                        <p className="text-gray-600 mt-1">Update your basic personal details</p>
                      </div>
                      {editingSection !== 'personal' && (
                        <button
                          onClick={() => setEditingSection('personal')}
                          className="flex items-center px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                      )}
                    </div>

                    {editingSection === 'personal' ? (
                      <form onSubmit={handlePersonalSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              First Name *
                            </label>
                            <input
                              type="text"
                              value={personalForm.first_name}
                              onChange={(e) => setPersonalForm(prev => ({ ...prev, first_name: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                              required
                            />
                            {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              value={personalForm.last_name}
                              onChange={(e) => setPersonalForm(prev => ({ ...prev, last_name: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                              required
                            />
                            {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={personalForm.email}
                            onChange={(e) => setPersonalForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                            required
                          />
                          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={personalForm.phone_number}
                            onChange={(e) => setPersonalForm(prev => ({ ...prev, phone_number: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                            required
                          />
                          {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>}
                        </div>
                        <div className="flex justify-end space-x-4">
                          <button
                            type="button"
                            onClick={() => setEditingSection(null)}
                            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center px-6 py-3 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors disabled:opacity-50"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                            <p className="text-lg font-semibold text-gray-900">{profile?.first_name || 'Not provided'}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                            <p className="text-lg font-semibold text-gray-900">{profile?.last_name || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                          <p className="text-lg font-semibold text-gray-900 flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {profile?.email || 'Not provided'}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                          <p className="text-lg font-semibold text-gray-900 flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {profile?.phone_number || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Password Section */}
                {activeSection === 'password' && (
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Password</h3>
                        <p className="text-gray-600 mt-1">Update your account password</p>
                      </div>
                      {editingSection !== 'password' && (
                        <button
                          onClick={() => setEditingSection('password')}
                          className="flex items-center px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Change Password
                        </button>
                      )}
                    </div>

                    {editingSection === 'password' ? (
                      <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Current Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordForm.current_password}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          {errors.current_password && <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            New Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={passwordForm.new_password}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                              required
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          {errors.new_password && <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm New Password *
                          </label>
                          <input
                            type="password"
                            value={passwordForm.confirm_password}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                            required
                          />
                          {errors.confirm_password && <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>}
                        </div>
                        <div className="flex justify-end space-x-4">
                          <button
                            type="button"
                            onClick={() => setEditingSection(null)}
                            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center px-6 py-3 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors disabled:opacity-50"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Update Password
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-[#18005F]/10 rounded-full flex items-center justify-center mr-4">
                            <Lock className="w-6 h-6 text-[#18005F]" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">Password</h4>
                            <p className="text-gray-600">Your password was last updated on {new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="mt-4 pl-16">
                          <p className="text-sm text-gray-500">
                            For security reasons, we recommend changing your password regularly.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bio Information Section */}
                {activeSection === 'bio' && (
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Bio Information</h3>
                        <p className="text-gray-600 mt-1">Update your personal and educational details</p>
                      </div>
                      {editingSection !== 'bio' && (
                        <button
                          onClick={() => setEditingSection('bio')}
                          className="flex items-center px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                      )}
                    </div>

                    {editingSection === 'bio' ? (
                      <form onSubmit={handleBioSubmit} className="space-y-6">
                        {/* Profile Picture */}
                        <div className="flex items-center space-x-6">
                          <div className="relative">
                            {profile?.candidate_profile?.bio?.profile_picture ? (
                              <img
                                src={profile.candidate_profile.bio.profile_picture}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-[#18005F] text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
                                {profile?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}
                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#18005F] rounded-full flex items-center justify-center cursor-pointer border-2 border-white shadow-md">
                              <Camera className="w-4 h-4 text-white" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">Profile Picture</h4>
                            <p className="text-xs text-gray-500">JPG, PNG or GIF, max 5MB</p>
                          </div>
                        </div>

                        {/* Personal Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Current City *
                            </label>
                            <input
                              type="text"
                              value={bioForm.current_city}
                              onChange={(e) => setBioForm(prev => ({ ...prev, current_city: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                              required
                            />
                            {errors.current_city && <p className="mt-1 text-sm text-red-600">{errors.current_city}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Gender *
                            </label>
                            <select
                              value={bioForm.gender}
                              onChange={(e) => setBioForm(prev => ({ ...prev, gender: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                              required
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                            {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Languages Known * (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={bioForm.languages_known}
                            onChange={(e) => setBioForm(prev => ({ ...prev, languages_known: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                            placeholder="e.g., English, Hindi, Spanish"
                            required
                          />
                          {errors.languages_known && <p className="mt-1 text-sm text-red-600">{errors.languages_known}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Candidate Type *
                          </label>
                          <select
                            value={bioForm.candidate_type}
                            onChange={(e) => setBioForm(prev => ({ ...prev, candidate_type: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                            required
                          >
                            <option value="">Select Type</option>
                            <option value="Fresher">Fresher</option>
                            <option value="Working professional">Working Professional</option>
                          </select>
                          {errors.candidate_type && <p className="mt-1 text-sm text-red-600">{errors.candidate_type}</p>}
                        </div>

                        {/* Education Details */}
                        <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                            <GraduationCap className="w-5 h-5 mr-2 text-[#18005F]" />
                            Education Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Course *
                              </label>
                              <select
                                value={bioForm.course}
                                onChange={(e) => setBioForm(prev => ({ ...prev, course: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                                required
                              >
                                <option value="">Select Course</option>
                                <option value="B.Tech">B.Tech</option>
                                <option value="BE">BE</option>
                                <option value="B.Com">B.Com</option>
                                <option value="MBA">MBA</option>
                                <option value="B.A">B.A</option>
                                <option value="M.Tech">M.Tech</option>
                                <option value="MCA">MCA</option>
                              </select>
                              {errors.course && <p className="mt-1 text-sm text-red-600">{errors.course}</p>}
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Stream
                              </label>
                              <input
                                type="text"
                                value={bioForm.stream}
                                onChange={(e) => setBioForm(prev => ({ ...prev, stream: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                                placeholder="e.g., Computer Science, Finance"
                              />
                              {errors.stream && <p className="mt-1 text-sm text-red-600">{errors.stream}</p>}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              College/University Name *
                            </label>
                            <input
                              type="text"
                              value={bioForm.college_name}
                              onChange={(e) => setBioForm(prev => ({ ...prev, college_name: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                              required
                            />
                            {errors.college_name && <p className="mt-1 text-sm text-red-600">{errors.college_name}</p>}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Start Year *
                              </label>
                              <input
                                type="number"
                                value={bioForm.start_year}
                                onChange={(e) => setBioForm(prev => ({ ...prev, start_year: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                                min="2000"
                                max="2099"
                                required
                              />
                              {errors.start_year && <p className="mt-1 text-sm text-red-600">{errors.start_year}</p>}
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                End Year *
                              </label>
                              <input
                                type="number"
                                value={bioForm.end_year}
                                onChange={(e) => setBioForm(prev => ({ ...prev, end_year: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                                min="2000"
                                max="2099"
                                required
                              />
                              {errors.end_year && <p className="mt-1 text-sm text-red-600">{errors.end_year}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Work Details (only for Working professionals) */}
                        {bioForm.candidate_type === 'Working professional' && (
                          <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                              <Building className="w-5 h-5 mr-2 text-[#18005F]" />
                              Work Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Current Company *
                                </label>
                                <input
                                  type="text"
                                  value={bioForm.current_company}
                                  onChange={(e) => setBioForm(prev => ({ ...prev, current_company: e.target.value }))}
                                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                                  required={bioForm.candidate_type === 'Working professional'}
                                />
                                {errors.current_company && <p className="mt-1 text-sm text-red-600">{errors.current_company}</p>}
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Current Designation *
                                </label>
                                <input
                                  type="text"
                                  value={bioForm.current_designation}
                                  onChange={(e) => setBioForm(prev => ({ ...prev, current_designation: e.target.value }))}
                                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                                  required={bioForm.candidate_type === 'Working professional'}
                                />
                                {errors.current_designation && <p className="mt-1 text-sm text-red-600">{errors.current_designation}</p>}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end space-x-4">
                          <button
                            type="button"
                            onClick={() => setEditingSection(null)}
                            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center px-6 py-3 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors disabled:opacity-50"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-8">
                        {/* Personal Details */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">Current City</label>
                              <p className="text-base font-semibold text-gray-900 flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                {profile?.candidate_profile?.bio?.current_city || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                              <p className="text-base font-semibold text-gray-900">
                                {profile?.candidate_profile?.bio?.gender || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">Languages Known</label>
                              <div className="flex flex-wrap gap-2">
                                {profile?.candidate_profile?.bio?.languages_known ? 
                                  profile.candidate_profile.bio.languages_known.split(',').map((lang, index) => (
                                    <span key={index} className="px-3 py-1 bg-[#18005F]/10 text-[#18005F] rounded-full text-sm">
                                      {lang.trim()}
                                    </span>
                                  )) : 
                                  <span className="text-gray-600">Not provided</span>
                                }
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">Candidate Type</label>
                              <p className="text-base font-semibold text-gray-900">
                                {profile?.candidate_profile?.bio?.candidate_type || 'Not provided'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Education Details */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                            <GraduationCap className="w-5 h-5 mr-2 text-[#18005F]" />
                            Education Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">Course</label>
                              <p className="text-base font-semibold text-gray-900">
                                {profile?.candidate_profile?.bio?.course || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">Stream</label>
                              <p className="text-base font-semibold text-gray-900">
                                {profile?.candidate_profile?.bio?.stream || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">College/University</label>
                              <p className="text-base font-semibold text-gray-900">
                                {profile?.candidate_profile?.bio?.college_name || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">Duration</label>
                              <p className="text-base font-semibold text-gray-900 flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                {profile?.candidate_profile?.bio?.start_year && profile?.candidate_profile?.bio?.end_year ? 
                                  `${profile.candidate_profile.bio.start_year} - ${profile.candidate_profile.bio.end_year}` : 
                                  'Not provided'
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Work Details (only for Working professionals) */}
                        {profile?.candidate_profile?.bio?.candidate_type === 'Working professional' && (
                          <div className="bg-gray-50 p-6 rounded-lg">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                              <Building className="w-5 h-5 mr-2 text-[#18005F]" />
                              Work Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Current Company</label>
                                <p className="text-base font-semibold text-gray-900">
                                  {profile?.candidate_profile?.bio?.current_company || 'Not provided'}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Current Designation</label>
                                <p className="text-base font-semibold text-gray-900">
                                  {profile?.candidate_profile?.bio?.current_designation || 'Not provided'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Job Preferences Section */}
                {activeSection === 'preferences' && (
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Job Preferences</h3>
                        <p className="text-gray-600 mt-1">Update your career preferences</p>
                      </div>
                      {editingSection !== 'preferences' && (
                        <button
                          onClick={() => setEditingSection('preferences')}
                          className="flex items-center px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                      )}
                    </div>

                    {editingSection === 'preferences' ? (
                      <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Areas of Interest * (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={preferencesForm.areas_of_interest}
                            onChange={(e) => setPreferencesForm(prev => ({ ...prev, areas_of_interest: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                            placeholder="e.g., Software Development, Data Science, Marketing"
                            required
                          />
                          {errors.areas_of_interest && <p className="mt-1 text-sm text-red-600">{errors.areas_of_interest}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Currently Looking For *
                            </label>
                            <select
                              value={preferencesForm.currently_looking_for}
                              onChange={(e) => setPreferencesForm(prev => ({ ...prev, currently_looking_for: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                              required
                            >
                              <option value="">Select Option</option>
                              <option value="Jobs">Jobs</option>
                              <option value="Internships">Internships</option>
                              <option value="Both">Both</option>
                            </select>
                            {errors.currently_looking_for && <p className="mt-1 text-sm text-red-600">{errors.currently_looking_for}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Preferred Work Mode *
                            </label>
                            <select
                              value={preferencesForm.work_mode_looking_for}
                              onChange={(e) => setPreferencesForm(prev => ({ ...prev, work_mode_looking_for: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                              required
                            >
                              <option value="">Select Option</option>
                              <option value="In-office">In-office</option>
                              <option value="Work from home">Work from home</option>
                              <option value="Hybrid">Hybrid</option>
                              <option value="Any">Any</option>
                            </select>
                            {errors.work_mode_looking_for && <p className="mt-1 text-sm text-red-600">{errors.work_mode_looking_for}</p>}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-4">
                          <button
                            type="button"
                            onClick={() => setEditingSection(null)}
                            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center px-6 py-3 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors disabled:opacity-50"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                            <Target className="w-5 h-5 mr-2 text-[#18005F]" />
                            Career Interests
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">Areas of Interest</label>
                              <div className="flex flex-wrap gap-2">
                                {profile?.candidate_profile?.preferences?.areas_of_interest ? 
                                  profile.candidate_profile.preferences.areas_of_interest.split(',').map((area, index) => (
                                    <span key={index} className="px-3 py-1 bg-[#18005F]/10 text-[#18005F] rounded-full text-sm">
                                      {area.trim()}
                                    </span>
                                  )) : 
                                  <span className="text-gray-600">Not provided</span>
                                }
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Currently Looking For</label>
                                <p className="text-base font-semibold text-gray-900 flex items-center">
                                  <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                                  {profile?.candidate_profile?.preferences?.currently_looking_for || 'Not provided'}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Preferred Work Mode</label>
                                <p className="text-base font-semibold text-gray-900 flex items-center">
                                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                  {profile?.candidate_profile?.preferences?.work_mode_looking_for || 'Not provided'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Profile Completion Status */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                            Profile Completion Status
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">Bio Information</span>
                              {profile?.has_completed_bio ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Complete
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Incomplete
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">Job Preferences</span>
                              {profile?.has_completed_preferences ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Complete
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Incomplete
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">Resume</span>
                              <Link to="/resume" className="text-[#18005F] hover:text-[#18005F]/80 text-sm font-medium">
                                Manage Resume →
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;