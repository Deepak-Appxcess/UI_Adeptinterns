import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Building, 
  MapPin, 
  Briefcase, 
  Globe, 
  Users, 
  Mail, 
  Phone, 
  FileText, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  CheckCircle, 
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Shield
} from 'lucide-react';
import api from '../../../services/api';
import EmployeeBio from './EmployeeBio';

const EmployerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [editingOrgInfo, setEditingOrgInfo] = useState(false);
  const [editingFreelancerInfo, setEditingFreelancerInfo] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  
  const [personalInfoFormData, setPersonalInfoFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: ''
  });

  const [orgInfoFormData, setOrgInfoFormData] = useState({
    designation: '',
    city: '',
    organization_name: '',
    organization_description: '',
    industry: '',
    no_of_employees: '',
    verification_method: 'Email',
    verification_value: '',
    is_freelancer: false,
    organization_logo: null
  });

  const [freelancerInfoFormData, setFreelancerInfoFormData] = useState({
    designation: '',
    is_freelancer: true,
    city: '',
    industry: 'Freelance',
    no_of_employees: 1,
    about_freelancer: ''
  });

  const [passwordFormData, setPasswordFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  const [logoPreview, setLogoPreview] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile/');
        setProfile(data);
        
        if (data.role.name !== 'Employer') {
          navigate('/dashboard/student');
          return;
        } 
        
        // Initialize personal info form data
        setPersonalInfoFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone_number: data.phone_number || ''
        });

        // Initialize organization or freelancer info if exists
        if (data.employer_profile) {
          if (data.has_completed_freelancer_details) {
            setFreelancerInfoFormData({
              designation: data.employer_profile.designation || '',
              city: data.employer_profile.city || '',
              industry: data.employer_profile.industry || 'Freelance',
              no_of_employees: data.employer_profile.no_of_employees || 1,
              is_freelancer: true,
              about_freelancer: data.employer_profile.about_freelancer || ''
            });
          } else {
            setOrgInfoFormData({
              designation: data.employer_profile.designation || '',
              city: data.employer_profile.city || '',
              organization_name: data.employer_profile.organization_name || '',
              organization_description: data.employer_profile.organization_description || '',
              industry: data.employer_profile.industry || '',
              no_of_employees: data.employer_profile.no_of_employees || '',
              verification_method: data.employer_profile.verification_method || 'Email',
              verification_value: data.employer_profile.verification_value || '',
              is_freelancer: false,
              organization_logo: null
            });
            if (data.employer_profile.organization_logo_url) {
              setLogoPreview(data.employer_profile.organization_logo_url);
            }
          }
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

  const handleProfileComplete = () => {
    // Refetch profile after completion
    api.get('/users/profile/').then(({ data }) => setProfile(data));
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfoFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrgInfoChange = (e) => {
    const { name, value } = e.target;
    setOrgInfoFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFreelancerInfoChange = (e) => {
    const { name, value } = e.target;
    setFreelancerInfoFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleOrgFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOrgInfoFormData(prev => ({ ...prev, organization_logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      await api.patch('/users/profile/update/', personalInfoFormData);
      setUpdateSuccess(true);
      setEditingPersonalInfo(false);
      // Refresh profile data
      const { data } = await api.get('/users/profile/');
      setProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError(error.response?.data?.message || 'Failed to update personal information');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleOrgInfoSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const formData = new FormData();
      Object.entries(orgInfoFormData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
  
      await api.patch('/users/profile/employer/setup/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUpdateSuccess(true);
      setEditingOrgInfo(false);
      // Refresh profile data
      const { data } = await api.get('/users/profile/');
      setProfile(data);
    } catch (error) {
      console.error('Error updating organization info:', error);
      setUpdateError(error.response?.data?.message || 'Failed to update organization information');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleFreelancerInfoSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      await api.patch('/users/profile/employer/setup/', freelancerInfoFormData);
      setUpdateSuccess(true);
      setEditingFreelancerInfo(false);
      // Refresh profile data
      const { data } = await api.get('/users/profile/');
      setProfile(data);
    } catch (error) {
      console.error('Error updating freelancer info:', error);
      setUpdateError(error.response?.data?.message || 'Failed to update freelancer information');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setPasswordErrors({});
    setUpdateError(null);
    setUpdateSuccess(false);

    // Validate passwords
    const errors = {};
    if (!passwordFormData.old_password) {
      errors.old_password = 'Current password is required';
    }
    if (!passwordFormData.new_password) {
      errors.new_password = 'New password is required';
    } else if (passwordFormData.new_password.length < 6) {
      errors.new_password = 'Password must be at least 6 characters';
    }
    if (passwordFormData.new_password !== passwordFormData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      setUpdateLoading(false);
      return;
    }

    try {
      await api.patch('/users/profile/update/', {
        old_password: passwordFormData.old_password,
        new_password: passwordFormData.new_password
      });
      
      setUpdateSuccess(true);
      setEditingPassword(false);
      setPasswordFormData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response?.data) {
        setPasswordErrors(error.response.data);
      } else {
        setUpdateError('Failed to change password. Please try again.');
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto pt-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6"
        >
          My Profile
        </motion.h1>
        
        {/* Personal Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg mb-6 relative"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-indigo-600" />
              Personal Information
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingPersonalInfo(!editingPersonalInfo);
                setUpdateError(null);
                setUpdateSuccess(false);
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            >
              {editingPersonalInfo ? 'Cancel' : 'Edit'}
            </motion.button>
          </div>

          {editingPersonalInfo ? (
            <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name*</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="first_name"
                      value={personalInfoFormData.first_name}
                      onChange={handlePersonalInfoChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name*</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="last_name"
                      value={personalInfoFormData.last_name}
                      onChange={handlePersonalInfoChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone_number"
                      value={personalInfoFormData.phone_number}
                      onChange={handlePersonalInfoChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      placeholder="e.g., +12025550123"
                    />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {updateError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
                  >
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      <p className="text-sm">{updateError}</p>
                    </div>
                  </motion.div>
                )}

                {updateSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl"
                  >
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <p className="text-sm">Personal information updated successfully!</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end space-x-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setEditingPersonalInfo(false);
                    setUpdateError(null);
                    setUpdateSuccess(false);
                  }}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all text-sm font-medium"
                  disabled={updateLoading}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-sm disabled:opacity-70"
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </div>
                  )}
                </motion.button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">First Name</p>
                <p className="font-semibold text-gray-900">{profile.first_name || 'Not provided'}</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Last Name</p>
                <p className="font-semibold text-gray-900">{profile.last_name || 'Not provided'}</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-semibold text-gray-900">{profile.email}</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                <p className="font-semibold text-gray-900">{profile.phone_number || 'Not provided'}</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Account Type</p>
                <p className="font-semibold text-gray-900">{profile.role?.name || 'Employer'}</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Joined</p>
                <p className="font-semibold text-gray-900">
                  {profile.date_joined ? new Date(profile.date_joined).toLocaleDateString() : 'Not available'}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Password Change Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg mb-6 relative"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-indigo-600" />
              Password
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingPassword(!editingPassword);
                setPasswordErrors({});
                setUpdateError(null);
                setUpdateSuccess(false);
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            >
              {editingPassword ? 'Cancel' : 'Change Password'}
            </motion.button>
          </div>

          <AnimatePresence>
            {editingPassword ? (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handlePasswordSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password*</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showOldPassword ? "text" : "password"}
                      name="old_password"
                      value={passwordFormData.old_password}
                      onChange={handlePasswordChange}
                      className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-sm ${
                        passwordErrors.old_password ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.old_password && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.old_password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password*</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="new_password"
                      value={passwordFormData.new_password}
                      onChange={handlePasswordChange}
                      className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-sm ${
                        passwordErrors.new_password ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.new_password && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.new_password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password*</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      value={passwordFormData.confirm_password}
                      onChange={handlePasswordChange}
                      className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-sm ${
                        passwordErrors.confirm_password ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirm_password && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirm_password}</p>
                  )}
                </div>

                <AnimatePresence>
                  {updateError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
                    >
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <p className="text-sm">{updateError}</p>
                      </div>
                    </motion.div>
                  )}

                  {updateSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl"
                    >
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <p className="text-sm">Password changed successfully!</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setEditingPassword(false);
                      setPasswordFormData({
                        old_password: '',
                        new_password: '',
                        confirm_password: ''
                      });
                      setPasswordErrors({});
                    }}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all text-sm font-medium"
                    disabled={updateLoading}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-sm disabled:opacity-70"
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Update Password
                      </div>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl"
              >
                <p className="text-sm text-gray-600">
                  Your password is securely stored. For security reasons, we recommend changing your password regularly.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Profile Completion Section */}
        {!profile.has_completed_organization && !profile.has_completed_freelancer_details ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg mb-6"
          >
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-indigo-600" />
                  Complete Your Profile
                </h2>
                <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                  Required
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                Your profile is incomplete. Complete it to start posting jobs and internships.
              </p>
            </div>
            <EmployeeBio onComplete={handleProfileComplete} />
          </motion.div>
        ) : profile.has_completed_freelancer_details ? (
          // Freelancer profile view
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg mb-6 relative"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-600" />
                Freelancer Information
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingFreelancerInfo(!editingFreelancerInfo);
                  setUpdateError(null);
                  setUpdateSuccess(false);
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              >
                {editingFreelancerInfo ? 'Cancel' : 'Edit'}
              </motion.button>
            </div>
            
            {editingFreelancerInfo ? (
              <form onSubmit={handleFreelancerInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Designation*</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="designation"
                        value={freelancerInfoFormData.designation}
                        onChange={handleFreelancerInfoChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location*</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="city"
                        value={freelancerInfoFormData.city}
                        onChange={handleFreelancerInfoChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Industry*</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="industry"
                        value={freelancerInfoFormData.industry}
                        onChange={handleFreelancerInfoChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Team Size*</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        name="no_of_employees"
                        value={freelancerInfoFormData.no_of_employees}
                        onChange={handleFreelancerInfoChange}
                        min="1"
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">About You*</label>
                    <textarea
                      name="about_freelancer"
                      value={freelancerInfoFormData.about_freelancer}
                      onChange={handleFreelancerInfoChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {updateError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
                    >
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <p className="text-sm">{updateError}</p>
                      </div>
                    </motion.div>
                  )}

                  {updateSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl"
                    >
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <p className="text-sm">Freelancer information updated successfully!</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end space-x-4 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setEditingFreelancerInfo(false);
                      setUpdateError(null);
                      setUpdateSuccess(false);
                    }}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all text-sm font-medium"
                    disabled={updateLoading}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-sm disabled:opacity-70"
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </div>
                    )}
                  </motion.button>
                </div>
              </form>
            ) : (
              profile.employer_profile && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Designation</p>
                    <p className="font-semibold text-gray-900">{profile.employer_profile.designation}</p>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">{profile.employer_profile.city}</p>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Industry</p>
                    <p className="font-semibold text-gray-900">{profile.employer_profile.industry}</p>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Team Size</p>
                    <p className="font-semibold text-gray-900">{profile.employer_profile.no_of_employees}</p>
                  </div>
                  <div className="md:col-span-2 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">About</p>
                    <p className="font-semibold text-gray-900">{profile.employer_profile.about_freelancer}</p>
                  </div>
                </div>
              )
            )}
          </motion.div>
        ) : (
          // Organization profile view
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg mb-6 relative"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2 text-indigo-600" />
                Organization Information
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingOrgInfo(!editingOrgInfo);
                  setUpdateError(null);
                  setUpdateSuccess(false);
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              >
                {editingOrgInfo ? 'Cancel' : 'Edit'}
              </motion.button>
            </div>

            {editingOrgInfo ? (
              <form onSubmit={handleOrgInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Name*</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="organization_name"
                        value={orgInfoFormData.organization_name}
                        onChange={handleOrgInfoChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Designation*</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="designation"
                        value={orgInfoFormData.designation}
                        onChange={handleOrgInfoChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Description*</label>
                    <textarea
                      name="organization_description"
                      value={orgInfoFormData.organization_description}
                      onChange={handleOrgInfoChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location*</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="city"
                        value={orgInfoFormData.city}
                        onChange={handleOrgInfoChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Industry*</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="industry"
                        value={orgInfoFormData.industry}
                        onChange={handleOrgInfoChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Employees*</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        name="no_of_employees"
                        value={orgInfoFormData.no_of_employees}
                        onChange={handleOrgInfoChange}
                        min="1"
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Method*</label>
                    <select
                      name="verification_method"
                      value={orgInfoFormData.verification_method}
                      onChange={handleOrgInfoChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      required
                    >
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                      <option value="Document">Document</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Value*</label>
                    <div className="relative">
                      {orgInfoFormData.verification_method === 'Email' ? (
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      ) : orgInfoFormData.verification_method === 'Phone' ? (
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      ) : (
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      )}
                      <input
                        type={orgInfoFormData.verification_method === 'Email' ? 'email' : 'text'}
                        name="verification_value"
                        value={orgInfoFormData.verification_value}
                        onChange={handleOrgInfoChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        required
                        placeholder={
                          orgInfoFormData.verification_method === 'Email' ? 'hr@company.com' :
                          orgInfoFormData.verification_method === 'Phone' ? '+1234567890' :
                          'Document details'
                        }
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Logo</label>
                    <div className="mt-2 flex items-center gap-4">
                      {logoPreview ? (
                        <div className="relative">
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="h-24 w-24 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setOrgInfoFormData(prev => ({ ...prev, organization_logo: null }));
                              setLogoPreview(null);
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                            <Camera className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">Upload</span>
                          </div>
                          <input
                            type="file"
                            onChange={handleOrgFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </label>
                      )}
                      <div className="text-sm text-gray-500">
                        <p>Recommended size: 400x400px</p>
                        <p>Max file size: 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {updateError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
                    >
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <p className="text-sm">{updateError}</p>
                      </div>
                    </motion.div>
                  )}

                  {updateSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl"
                    >
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <p className="text-sm">Organization information updated successfully!</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end space-x-4 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setEditingOrgInfo(false);
                      setUpdateError(null);
                      setUpdateSuccess(false);
                    }}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all text-sm font-medium"
                    disabled={updateLoading}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-sm disabled:opacity-70"
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </div>
                    )}
                  </motion.button>
                </div>
              </form>
            ) : (
              profile.employer_profile && (
                <div className="space-y-6">
                  {profile.employer_profile.organization_logo_url && (
                    <div className="flex justify-center mb-6">
                      <img 
                        src={profile.employer_profile.organization_logo_url} 
                        alt="Organization Logo" 
                        className="h-32 w-32 object-contain bg-white p-2 rounded-xl shadow-md"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Organization Name</p>
                      <p className="font-semibold text-gray-900">{profile.employer_profile.organization_name}</p>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Designation</p>
                      <p className="font-semibold text-gray-900">{profile.employer_profile.designation}</p>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="font-semibold text-gray-900">{profile.employer_profile.city}</p>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Industry</p>
                      <p className="font-semibold text-gray-900">{profile.employer_profile.industry}</p>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Employees</p>
                      <p className="font-semibold text-gray-900">{profile.employer_profile.no_of_employees}</p>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Verification</p>
                      <p className="font-semibold text-gray-900">
                        {profile.employer_profile.verification_method}: {profile.employer_profile.verification_value}
                      </p>
                    </div>
                    <div className="md:col-span-3 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Description</p>
                      <p className="font-semibold text-gray-900">{profile.employer_profile.organization_description}</p>
                    </div>
                  </div>
                </div>
              )
            )}
          </motion.div>
        )}

        {/* Quick Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.button
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/post-job')}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Post a Job</h3>
                <p className="text-sm text-white/80">Create a new job listing</p>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/post-internship')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Post an Internship</h3>
                <p className="text-sm text-white/80">Create a new internship opportunity</p>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard/employer')}
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <Building className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Dashboard</h3>
                <p className="text-sm text-white/80">View your dashboard</p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployerDashboard;