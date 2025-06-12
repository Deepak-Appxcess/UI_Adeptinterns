import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Users, 
  FileText, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  Shield, 
  Camera, 
  CheckCircle, 
  AlertCircle,
  Briefcase,
  Globe,
  Award,
  Settings
} from 'lucide-react';
import api from '../../../services/api';
import EmployeeBio from './EmployeeBio';

const EmployerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  
  // Edit states
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [editingOrgInfo, setEditingOrgInfo] = useState(false);
  const [editingFreelancerInfo, setEditingFreelancerInfo] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  
  // Form data states
  const [personalInfoFormData, setPersonalInfoFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: ''
  });

  const [passwordFormData, setPasswordFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
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

  // UI states
  const [logoPreview, setLogoPreview] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [completingProfile, setCompletingProfile] = useState(false);
  
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
    api.get('/users/profile/').then(({ data }) => setProfile(data));
  };

  // Form change handlers
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfoFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOrgInfoChange = (e) => {
    const { name, value } = e.target;
    setOrgInfoFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFreelancerInfoChange = (e) => {
    const { name, value } = e.target;
    setFreelancerInfoFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOrgFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOrgInfoFormData(prev => ({ ...prev, organization_logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Form submission handlers
  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      await api.patch('/users/profile/update/', personalInfoFormData);
      setUpdateSuccess(true);
      setEditingPersonalInfo(false);
      const { data } = await api.get('/users/profile/');
      setProfile(data);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError(error.response?.data?.message || 'Failed to update personal information');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    // Validate passwords match
    if (passwordFormData.new_password !== passwordFormData.confirm_password) {
      setUpdateError('New passwords do not match');
      setUpdateLoading(false);
      return;
    }

    // Validate password strength
    if (passwordFormData.new_password.length < 6) {
      setUpdateError('New password must be at least 6 characters long');
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
      setPasswordFormData({ old_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating password:', error);
      setUpdateError(error.response?.data?.message || 'Failed to update password');
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
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUpdateSuccess(true);
      setEditingOrgInfo(false);
      const { data } = await api.get('/users/profile/');
      setProfile(data);
      setTimeout(() => setUpdateSuccess(false), 3000);
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
      const { data } = await api.get('/users/profile/');
      setProfile(data);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating freelancer info:', error);
      setUpdateError(error.response?.data?.message || 'Failed to update freelancer information');
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
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'organization', label: profile?.has_completed_freelancer_details ? 'Freelancer Info' : 'Organization', icon: Building }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                {profile.employer_profile?.organization_logo_url ? (
                  <img 
                    src={profile.employer_profile.organization_logo_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-gray-600 mt-1">{profile.email}</p>
              <div className="flex items-center mt-2">
                <div className="flex items-center text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  Verified Account
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Completion Alert */}
      {(!profile.has_completed_organization && !profile.has_completed_freelancer_details) && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border-l-4 border-amber-400 p-4 mx-4 mt-4 rounded-r-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-amber-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-amber-800">Complete Your Profile</p>
                <p className="text-sm text-amber-700">Your profile is incomplete. Complete it to start posting jobs and internships.</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCompletingProfile(true)}
              disabled={completingProfile}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {completingProfile ? 'Loading...' : 'Complete Now'}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Success/Error Messages */}
      <AnimatePresence>
        {updateSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <p className="text-green-800 text-sm font-medium">Profile updated successfully!</p>
            </div>
          </motion.div>
        )}
        
        {updateError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-800 text-sm font-medium">{updateError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-6">
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
                      className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      {editingPersonalInfo ? (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </>
                      )}
                    </motion.button>
                  </div>

                  {editingPersonalInfo ? (
                    <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name*</label>
                          <input
                            type="text"
                            name="first_name"
                            value={personalInfoFormData.first_name}
                            onChange={handlePersonalInfoChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name*</label>
                          <input
                            type="text"
                            name="last_name"
                            value={personalInfoFormData.last_name}
                            onChange={handlePersonalInfoChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            name="phone_number"
                            value={personalInfoFormData.phone_number}
                            onChange={handlePersonalInfoChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholder="e.g., +12025550123"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPersonalInfo(false);
                            setUpdateError(null);
                            setUpdateSuccess(false);
                          }}
                          className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                          disabled={updateLoading}
                        >
                          Cancel
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={updateLoading}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                          {updateLoading ? (
                            <div className="flex items-center">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                              />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-500">First Name</label>
                          <p className="text-lg font-medium text-gray-900">{profile.first_name || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Email</label>
                          <p className="text-lg font-medium text-gray-900">{profile.email}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-500">Last Name</label>
                          <p className="text-lg font-medium text-gray-900">{profile.last_name || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Phone Number</label>
                          <p className="text-lg font-medium text-gray-900">{profile.phone_number || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-indigo-600" />
                      Security Settings
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingPassword(!editingPassword);
                        setUpdateError(null);
                        setUpdateSuccess(false);
                        if (!editingPassword) {
                          setPasswordFormData({ old_password: '', new_password: '', confirm_password: '' });
                        }
                      }}
                      className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      {editingPassword ? (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-1" />
                          Change Password
                        </>
                      )}
                    </motion.button>
                  </div>

                  {editingPassword ? (
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password*</label>
                          <div className="relative">
                            <input
                              type={showOldPassword ? "text" : "password"}
                              name="old_password"
                              value={passwordFormData.old_password}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowOldPassword(!showOldPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password*</label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              name="new_password"
                              value={passwordFormData.new_password}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                              required
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Minimum 6 characters</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password*</label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirm_password"
                              value={passwordFormData.confirm_password}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPassword(false);
                            setUpdateError(null);
                            setUpdateSuccess(false);
                            setPasswordFormData({ old_password: '', new_password: '', confirm_password: '' });
                          }}
                          className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                          disabled={updateLoading}
                        >
                          Cancel
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={updateLoading}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                          {updateLoading ? (
                            <div className="flex items-center">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                              />
                              Updating...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Save className="w-4 h-4 mr-2" />
                              Update Password
                            </div>
                          )}
                        </motion.button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center">
                          <Lock className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">Password</p>
                            <p className="text-sm text-gray-500">Last updated: Never</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">••••••••</div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start">
                          <Shield className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900">Security Recommendations</h4>
                            <ul className="text-sm text-blue-800 mt-2 space-y-1">
                              <li>• Use a strong, unique password</li>
                              <li>• Change your password regularly</li>
                              <li>• Don't share your password with others</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Organization/Freelancer Tab */}
              {activeTab === 'organization' && (
                <motion.div
                  key="organization"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Profile Completion Section */}
                  {(!profile.has_completed_organization && !profile.has_completed_freelancer_details) ? (
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-6">
                      <div className="text-center">
                        <Building className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Profile</h2>
                        <p className="text-gray-600 mb-6">Please complete your organization details to continue</p>
                        <EmployeeBio onComplete={handleProfileComplete} />
                      </div>
                    </div>
                  ) : profile.has_completed_freelancer_details ? (
                    // Freelancer profile view
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                          <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
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
                          className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          {editingFreelancerInfo ? (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </>
                          ) : (
                            <>
                              <Edit3 className="w-4 h-4 mr-1" />
                              Edit
                            </>
                          )}
                        </motion.button>
                      </div>
                      
                      {editingFreelancerInfo ? (
                        <form onSubmit={handleFreelancerInfoSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Designation*</label>
                              <input
                                type="text"
                                name="designation"
                                value={freelancerInfoFormData.designation}
                                onChange={handleFreelancerInfoChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Location*</label>
                              <input
                                type="text"
                                name="city"
                                value={freelancerInfoFormData.city}
                                onChange={handleFreelancerInfoChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Industry*</label>
                              <input
                                type="text"
                                name="industry"
                                value={freelancerInfoFormData.industry}
                                onChange={handleFreelancerInfoChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Team Size*</label>
                              <input
                                type="number"
                                name="no_of_employees"
                                value={freelancerInfoFormData.no_of_employees}
                                onChange={handleFreelancerInfoChange}
                                min="1"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                required
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">About You*</label>
                              <textarea
                                name="about_freelancer"
                                value={freelancerInfoFormData.about_freelancer}
                                onChange={handleFreelancerInfoChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex justify-end space-x-4">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFreelancerInfo(false);
                                setUpdateError(null);
                                setUpdateSuccess(false);
                              }}
                              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                              disabled={updateLoading}
                            >
                              Cancel
                            </button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              type="submit"
                              disabled={updateLoading}
                              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                            >
                              {updateLoading ? (
                                <div className="flex items-center">
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                  />
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm text-gray-500">Designation</label>
                                <p className="text-lg font-medium text-gray-900">{profile.employer_profile.designation}</p>
                              </div>
                              <div>
                                <label className="text-sm text-gray-500">Industry</label>
                                <p className="text-lg font-medium text-gray-900">{profile.employer_profile.industry}</p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm text-gray-500">Location</label>
                                <p className="text-lg font-medium text-gray-900">{profile.employer_profile.city}</p>
                              </div>
                              <div>
                                <label className="text-sm text-gray-500">Team Size</label>
                                <p className="text-lg font-medium text-gray-900">{profile.employer_profile.no_of_employees}</p>
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-sm text-gray-500">About</label>
                              <p className="text-lg font-medium text-gray-900">{profile.employer_profile.about_freelancer}</p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    // Organization profile view
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-6">
                      <div className="flex items-center justify-between mb-6">
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
                          className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          {editingOrgInfo ? (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </>
                          ) : (
                            <>
                              <Edit3 className="w-4 h-4 mr-1" />
                              Edit
                            </>
                          )}
                        </motion.button>
                      </div>

                      {editingOrgInfo ? (
                        <form onSubmit={handleOrgInfoSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name*</label>
                              <input
                                type="text"
                                name="organization_name"
                                value={orgInfoFormData.organization_name}
                                onChange={handleOrgInfoChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Your Designation*</label>
                              <input
                                type="text"
                                name="designation"
                                value={orgInfoFormData.designation}
                                onChange={handleOrgInfoChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                required
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Organization Description*</label>
                              <textarea
                                name="organization_description"
                                value={orgInfoFormData.organization_description}
                                onChange={handleOrgInfoChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Location*</label>
                              <input
                                type="text"
                                name="city"
                                value={orgInfoFormData.city}
                                onChange={handleOrgInfoChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Industry*</label>
                              <input
                                type="text"
                                name="industry"
                                value={orgInfoFormData.industry}
                                onChange={handleOrgInfoChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Employees*</label>
                              <input
                                type="number"
                                name="no_of_employees"
                                value={orgInfoFormData.no_of_employees}
                                onChange={handleOrgInfoChange}
                                min="1"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Method*</label>
                              <select
                                name="verification_method"
                                value={orgInfoFormData.verification_method}
                                onChange={handleOrgInfoChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                required
                              >
                                <option value="Email">Email</option>
                                <option value="Phone">Phone</option>
                                <option value="Document">Document</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Value*</label>
                              <input
                                type={orgInfoFormData.verification_method === 'Email' ? 'email' : 'text'}
                                name="verification_value"
                                value={orgInfoFormData.verification_value}
                                onChange={handleOrgInfoChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                required
                                placeholder={
                                  orgInfoFormData.verification_method === 'Email' ? 'hr@company.com' :
                                  orgInfoFormData.verification_method === 'Phone' ? '+1234567890' :
                                  'Document details'
                                }
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Organization Logo</label>
                              <div className="flex items-center space-x-4">
                                {logoPreview && (
                                  <img 
                                    src={logoPreview} 
                                    alt="Logo preview" 
                                    className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200"
                                  />
                                )}
                                <div>
                                  <label className="cursor-pointer">
                                    <span className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition">
                                      Choose File
                                    </span>
                                    <input
                                      type="file"
                                      onChange={handleOrgFileChange}
                                      accept="image/*"
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-4">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingOrgInfo(false);
                                setUpdateError(null);
                                setUpdateSuccess(false);
                              }}
                              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                              disabled={updateLoading}
                            >
                              Cancel
                            </button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              type="submit"
                              disabled={updateLoading}
                              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                            >
                              {updateLoading ? (
                                <div className="flex items-center">
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                  />
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
                              <div className="flex justify-center">
                                <img 
                                  src={profile.employer_profile.organization_logo_url} 
                                  alt="Organization Logo" 
                                  className="w-32 h-32 object-contain rounded-xl border border-gray-200"
                                />
                              </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm text-gray-500">Organization Name</label>
                                  <p className="text-lg font-medium text-gray-900">{profile.employer_profile.organization_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-gray-500">Location</label>
                                  <p className="text-lg font-medium text-gray-900">{profile.employer_profile.city}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-gray-500">Employees</label>
                                  <p className="text-lg font-medium text-gray-900">{profile.employer_profile.no_of_employees}</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm text-gray-500">Designation</label>
                                  <p className="text-lg font-medium text-gray-900">{profile.employer_profile.designation}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-gray-500">Industry</label>
                                  <p className="text-lg font-medium text-gray-900">{profile.employer_profile.industry}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-gray-500">Verification Method</label>
                                  <p className="text-lg font-medium text-gray-900">{profile.employer_profile.verification_method}</p>
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-sm text-gray-500">Description</label>
                                <p className="text-lg font-medium text-gray-900">{profile.employer_profile.organization_description}</p>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;