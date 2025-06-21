import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Building, 
  MapPin, 
  Users, 
  FileText, 
  Upload, 
  Check, 
  ArrowRight, 
  Briefcase,
  Globe,
  Phone,
  Mail,
  Shield,
  Star,
  Loader2,
  AlertCircle,
  CheckCircle,
  Camera,
  X,
  Edit3,
  Save,
  Eye,
  EyeOff,
  Lock,
  Settings,
  Award,
  Target
} from 'lucide-react';
import { 
  checkPhoneVerification,
  resendPhoneOTP,
  verifyPhoneOTP,
  fetchUserProfile,
  updateProfile,
  setupEmployerProfile,
  changePassword
} from '../../../services/api';

const EmployerProfile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Personal Information State
  const [personalData, setPersonalData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: ''
  });
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);

  // Password State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Organization Profile State
  const [organizationData, setOrganizationData] = useState({
    is_freelancer: false,
    designation: '',
    city: '',
    organization_name: '',
    organization_description: '',
    industry: '',
    no_of_employees: '',
    verification_method: 'Email',
    verification_value: '',
    organization_logo: null,
    about_freelancer: ''
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [isEditingOrganization, setIsEditingOrganization] = useState(false);

  // Phone Verification State
  const [phoneVerification, setPhoneVerification] = useState({
    isVerified: false,
    showOtpForm: false,
    otp: '',
    countdown: 0,
    isResending: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (phoneVerification.countdown > 0) {
      const timer = setTimeout(() => {
        setPhoneVerification(prev => ({ ...prev, countdown: prev.countdown - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneVerification.countdown]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetchUserProfile();
      const profile = response.data;
      
      setUserProfile(profile);
      
      // Set personal data
      setPersonalData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone_number: profile.phone_number || ''
      });

      // Set organization data if exists
      if (profile.employer_profile) {
        setOrganizationData({
          is_freelancer: profile.employer_profile.is_freelancer || false,
          designation: profile.employer_profile.designation || '',
          city: profile.employer_profile.city || '',
          organization_name: profile.employer_profile.organization_name || '',
          organization_description: profile.employer_profile.organization_description || '',
          industry: profile.employer_profile.industry || '',
          no_of_employees: profile.employer_profile.no_of_employees || '',
          verification_method: profile.employer_profile.verification_method || 'Email',
          verification_value: profile.employer_profile.verification_value || '',
          organization_logo: null,
          about_freelancer: profile.employer_profile.about_freelancer || ''
        });

        if (profile.employer_profile.organization_logo) {
          setLogoPreview(profile.employer_profile.organization_logo);
        }
      }

      setPhoneVerification(prev => ({
        ...prev,
        isVerified: profile.is_phone_verified || false
      }));

    } catch (error) {
      console.error('Error fetching profile:', error);
      setErrors({ general: 'Failed to load profile data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      await updateProfile(personalData);
      setSuccessMessage('Personal information updated successfully!');
      setIsEditingPersonal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchProfile();
    } catch (error) {
      console.error('Error updating personal info:', error);
      setErrors(error.response?.data || { general: 'Failed to update personal information' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    if (passwordData.new_password !== passwordData.confirm_password) {
      setErrors({ confirm_password: 'Passwords do not match' });
      setIsSubmitting(false);
      return;
    }

    try {
      await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      setSuccessMessage('Password updated successfully!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating password:', error);
      setErrors(error.response?.data || { general: 'Failed to update password' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrganizationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const formData = new FormData();
      
      Object.keys(organizationData).forEach(key => {
        if (organizationData[key] !== null && organizationData[key] !== undefined) {
          if (key === 'organization_logo' && organizationData[key] instanceof File) {
            formData.append(key, organizationData[key]);
          } else {
            formData.append(key, organizationData[key]);
          }
        }
      });

      await setupEmployerProfile(formData);
      setSuccessMessage('Organization profile updated successfully!');
      setIsEditingOrganization(false);
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchProfile();
    } catch (error) {
      console.error('Error updating organization:', error);
      setErrors(error.response?.data || { general: 'Failed to update organization profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ organization_logo: 'File size must be less than 5MB' });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors({ organization_logo: 'Please select an image file' });
        return;
      }

      setOrganizationData(prev => ({ ...prev, organization_logo: file }));
      setLogoPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, organization_logo: '' }));
    }
  };

  const removeFile = () => {
    setOrganizationData(prev => ({ ...prev, organization_logo: null }));
    setLogoPreview(null);
  };

  const handleSendPhoneOTP = async () => {
    try {
      setPhoneVerification(prev => ({ ...prev, isResending: true }));
      await resendPhoneOTP({ phone_number: personalData.phone_number });
      setPhoneVerification(prev => ({ 
        ...prev, 
        showOtpForm: true, 
        countdown: 60,
        isResending: false 
      }));
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrors({ phone: 'Failed to send OTP' });
      setPhoneVerification(prev => ({ ...prev, isResending: false }));
    }
  };

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await verifyPhoneOTP({
        phone_number: personalData.phone_number,
        code: phoneVerification.otp
      });
      setPhoneVerification(prev => ({ 
        ...prev, 
        isVerified: true, 
        showOtpForm: false, 
        otp: '' 
      }));
      setSuccessMessage('Phone number verified successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchProfile();
    } catch (error) {
      console.error('Error verifying phone:', error);
      setErrors({ otp: 'Invalid OTP code' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'organization', label: 'Organization Profile', icon: Building }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#18005F]/20 border-t-[#18005F] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#18005F] to-[#18005F]/80 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userProfile?.first_name} {userProfile?.last_name}
                </h1>
                <p className="text-gray-600 font-medium">{userProfile?.email}</p>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    userProfile?.is_verified 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {userProfile?.is_verified ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified Account
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending Verification
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-medium">Role</p>
              <p className="text-lg font-bold text-[#18005F]">{userProfile?.role?.name}</p>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl mb-6 shadow-sm"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium text-sm">{successMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Settings</h2>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-[#18005F] text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                    <button
                      onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                      className={`flex items-center px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                        isEditingPersonal
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-[#18005F] text-white hover:bg-[#18005F]/90'
                      }`}
                    >
                      {isEditingPersonal ? (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </>
                      )}
                    </button>
                  </div>

                  <form onSubmit={handlePersonalSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={personalData.first_name}
                          onChange={(e) => setPersonalData(prev => ({ ...prev, first_name: e.target.value }))}
                          disabled={!isEditingPersonal}
                          className={`w-full px-4 py-3 border-2 rounded-xl font-medium text-sm transition-all ${
                            isEditingPersonal
                              ? 'border-gray-200 focus:border-[#18005F] focus:ring-4 focus:ring-[#18005F]/20'
                              : 'border-gray-100 bg-gray-50'
                          }`}
                        />
                        {errors.first_name && (
                          <p className="mt-1 text-xs text-red-600 font-medium">{errors.first_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={personalData.last_name}
                          onChange={(e) => setPersonalData(prev => ({ ...prev, last_name: e.target.value }))}
                          disabled={!isEditingPersonal}
                          className={`w-full px-4 py-3 border-2 rounded-xl font-medium text-sm transition-all ${
                            isEditingPersonal
                              ? 'border-gray-200 focus:border-[#18005F] focus:ring-4 focus:ring-[#18005F]/20'
                              : 'border-gray-100 bg-gray-50'
                          }`}
                        />
                        {errors.last_name && (
                          <p className="mt-1 text-xs text-red-600 font-medium">{errors.last_name}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={personalData.email}
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl font-medium text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500 font-medium">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="flex space-x-3">
                        <input
                          type="tel"
                          value={personalData.phone_number}
                          onChange={(e) => setPersonalData(prev => ({ ...prev, phone_number: e.target.value }))}
                          disabled={!isEditingPersonal}
                          className={`flex-1 px-4 py-3 border-2 rounded-xl font-medium text-sm transition-all ${
                            isEditingPersonal
                              ? 'border-gray-200 focus:border-[#18005F] focus:ring-4 focus:ring-[#18005F]/20'
                              : 'border-gray-100 bg-gray-50'
                          }`}
                        />
                        {!phoneVerification.isVerified && personalData.phone_number && (
                          <button
                            type="button"
                            onClick={handleSendPhoneOTP}
                            disabled={phoneVerification.isResending}
                            className="px-4 py-3 bg-amber-500 text-white rounded-xl font-medium text-sm hover:bg-amber-600 transition-colors disabled:opacity-50"
                          >
                            {phoneVerification.isResending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Verify'
                            )}
                          </button>
                        )}
                        {phoneVerification.isVerified && (
                          <div className="flex items-center px-4 py-3 bg-emerald-100 text-emerald-800 rounded-xl">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            <span className="font-medium text-sm">Verified</span>
                          </div>
                        )}
                      </div>
                      {errors.phone_number && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone_number}</p>
                      )}
                    </div>

                    {/* Phone OTP Verification */}
                    <AnimatePresence>
                      {phoneVerification.showOtpForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                        >
                          <h4 className="font-bold text-blue-900 mb-3 text-sm">Verify Phone Number</h4>
                          <form onSubmit={handleVerifyPhone} className="space-y-4">
                            <input
                              type="text"
                              placeholder="Enter 6-digit OTP"
                              value={phoneVerification.otp}
                              onChange={(e) => setPhoneVerification(prev => ({ 
                                ...prev, 
                                otp: e.target.value.replace(/\D/g, '').slice(0, 6) 
                              }))}
                              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl font-medium text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                              maxLength={6}
                            />
                            <div className="flex space-x-3">
                              <button
                                type="submit"
                                disabled={isSubmitting || phoneVerification.otp.length !== 6}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                {isSubmitting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Verify'
                                )}
                              </button>
                              {phoneVerification.countdown > 0 ? (
                                <span className="px-4 py-2 text-blue-600 font-medium text-sm">
                                  Resend in {phoneVerification.countdown}s
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleSendPhoneOTP}
                                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                  Resend OTP
                                </button>
                              )}
                            </div>
                            {errors.otp && (
                              <p className="text-xs text-red-600 font-medium">{errors.otp}</p>
                            )}
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isEditingPersonal && (
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex items-center px-6 py-3 bg-[#18005F] text-white rounded-xl font-bold text-sm hover:bg-[#18005F]/90 transition-colors disabled:opacity-50"
                        >
                          {isSubmitting ? (
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
                    )}
                  </form>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Change Password</h3>
                    <p className="text-gray-600 text-sm font-medium">Update your password to keep your account secure</p>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl font-medium text-sm focus:border-[#18005F] focus:ring-4 focus:ring-[#18005F]/20 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.current_password && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{errors.current_password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl font-medium text-sm focus:border-[#18005F] focus:ring-4 focus:ring-[#18005F]/20 transition-all"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.new_password && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{errors.new_password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl font-medium text-sm focus:border-[#18005F] focus:ring-4 focus:ring-[#18005F]/20 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirm_password && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirm_password}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center px-6 py-3 bg-[#18005F] text-white rounded-xl font-bold text-sm hover:bg-[#18005F]/90 transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Organization Profile Tab */}
              {activeTab === 'organization' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Organization Profile</h3>
                      <p className="text-gray-600 text-sm font-medium">Manage your organization information</p>
                    </div>
                    <button
                      onClick={() => setIsEditingOrganization(!isEditingOrganization)}
                      className={`flex items-center px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                        isEditingOrganization
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-[#18005F] text-white hover:bg-[#18005F]/90'
                      }`}
                    >
                      {isEditingOrganization ? (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </>
                      )}
                    </button>
                  </div>

                  <form onSubmit={handleOrganizationSubmit} className="space-y-6">
                    {/* Account Type */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                      <label className="block text-sm font-bold text-gray-700 mb-4">
                        Account Type
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          !organizationData.is_freelancer 
                            ? 'border-[#18005F] bg-[#18005F]/5' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        } ${!isEditingOrganization ? 'pointer-events-none' : ''}`}>
                          <input
                            type="radio"
                            checked={!organizationData.is_freelancer}
                            onChange={() => setOrganizationData(prev => ({ ...prev, is_freelancer: false }))}
                            disabled={!isEditingOrganization}
                            className="sr-only"
                          />
                          <div className="flex items-center">
                            <Building className="h-5 w-5 mr-3 text-[#18005F]" />
                            <span className="font-bold text-gray-900 text-sm">Organization</span>
                          </div>
                          {!organizationData.is_freelancer && (
                            <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-[#18005F]" />
                          )}
                        </label>
                        
                        <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          organizationData.is_freelancer 
                            ? 'border-[#18005F] bg-[#18005F]/5' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        } ${!isEditingOrganization ? 'pointer-events-none' : ''}`}>
                          <input
                            type="radio"
                            checked={organizationData.is_freelancer}
                            onChange={() => setOrganizationData(prev => ({ ...prev, is_freelancer: true }))}
                            disabled={!isEditingOrganization}
                            className="sr-only"
                          />
                          <div className="flex items-center">
                            <User className="h-5 w-5 mr-3 text-[#18005F]" />
                            <span className="font-bold text-gray-900 text-sm">Freelancer</span>
                          </div>
                          {organizationData.is_freelancer && (
                            <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-[#18005F]" />
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Your Designation
                        </label>
                        <input
                          type="text"
                          value={organizationData.designation}
                          onChange={(e) => setOrganizationData(prev => ({ ...prev, designation: e.target.value }))}
                          disabled={!isEditingOrganization}
                          className={`w-full px-4 py-3 border-2 rounded-xl font-medium text-sm transition-all ${
                            isEditingOrganization
                              ? 'border-gray-200 focus:border-[#18005F] focus:ring-4 focus:ring-[#18005F]/20'
                              : 'border-gray-100 bg-gray-50'
                          }`}
                          placeholder="e.g., CEO, HR Manager"
                        />
                        {errors.designation && (
                          <p className="mt-1 text-xs text-red-600 font-medium">{errors.designation}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={organizationData.city}
                          onChange={(e) => setOrganizationData(prev => ({ ...prev, city: e.target.value }))}
                          disabled={!isEditingOrganization}
                          className={`w-full px-4 py-3 border-2 rounded-xl font-medium text-sm transition-all ${
                            isEditingOrganization
                              ? 'border-gray-200 focus:border-[#18005F] focus:ring-4 focus:ring-[#18005F]/20'
                              : 'border-gray-100 bg-gray-50'
                          }`}
                          placeholder="e.g., New York, Remote"
                        />
                        {errors.city && (
                          <p className="mt-1 text-xs text-red-600 font-medium">{errors.city}</p>
                        )}
                      </div>
                    </div>

                    {/* Organization-specific fields */}
                    {!organizationData.is_freelancer && (
                      <div className="space-y-6 bg-blue-50 p-6 rounded-2xl border border-blue-200">
                        <h4 className="text-lg font-bold text-gray-900 flex items-center">
                          <Building className="h-5 w-5 mr-2 text-[#18005F]" />
                          Organization Details
                        </h4>
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Organization Name
                          </label>
                          <input
                            type="text"
                            value={organizationData.organization_name}
                            onChange={(e) => setOrganizationData(prev => ({ ...prev, organization_name: e.target.value }))}
                            disabled={!isEditingOrganization}
                            className={`w-full px-4 py-3 border-2 rounded-xl font-medium text-sm transition-all ${
                              isEditingOrganization
                                ? 'border-gray-200 focus:border-[#18005F] focus:ring-4 focus:ring-[#18005F]/20'
                                : 'border-gray-100 bg-gray-50'
                            }`}
                            placeholder="e.g., ADEPTINTERNS Inc."
                          />
                          {errors.organization_name && (
                            <p className="mt-1 text-xs text-red-600 font-medium">{errors.organization_name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Organization Description
                          </label>
                          <textarea
                            value={organizationData.organization_description}
                            onChange={(e) => setOrganizationData(prev => ({ ...prev, organization_description: e.target.value }))}
                            disabled={!isEditingOrganization}
                            rows={4}
                            className={`w-full px-4 py-3 border-2 rounded-xl font-medium text-sm transition-all resize-none ${
                              isEditingOrganization
                                ? 'border-gray-200 focus:border-[#18005F] focus:ring-4 focus:ring-[#18005F]/20'
                                : 'border-gray-100 bg-gray-50'
                            }`}
                            placeholder="Describe your organization..."
                          />
                          {errors.organization_description && (
                            <p className="mt-1 text-xs text-red-600 font-medium">{errors.organization_description}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Industry
                            </label>
                            <input
                              type="text"
                              value={organizationData.industry}
                              onChange={(e) => setOrganizationData(prev => ({ ...prev, industry: e.target.value }))}
                              disabled={!isEditingOrganization}
                              className={`w-full px-4 py-3 border-2 rounded-xl font-medium text-sm transition-all ${
                                isEditingOrganization
                                  ? 'border-gray-200 focus:border-[#18005F] focus:ring-4 focus:ring-[#18005F]/20'
                                  : 'border-gray-100 bg-gray-50'
                              }`}
                              placeholder="e.g., Technology"
                            />
                            {errors.industry && (
                              <p className="mt-1 text-xs text-red-600 font-medium">{errors.industry}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Number of Employees
                            </label>
                            <input
                              type="number"
                              value={organizationData.no_of_employees}
                              onChange={(e) => setOrganizationData(prev => ({ ...prev, no_of_employees: e.target.value }))}
                              disabled={!isEditingOrganization}
                              min="1"
                              className={`w-full px-4 py-3 border-2 rounded-xl font-medium text-sm transition-all ${
                                isEditingOrganization
                                  ? 'border-gray-200 focus:border-[#18005F] focus:ring-4 focus:ring-[#18005F]/20'
                                  : 'border-gray-100 bg-gray-50'
                              }`}
                              placeholder="e.g., 50"
                            />
                            {errors.no_of_employees && (
                              <p className="mt-1 text-xs text-red-600 font-medium">{errors.no_of_employees}</p>
                            )}
                          </div>
                        </div>

                        {/* Organization Logo */}
                        {isEditingOrganization && (
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Organization Logo
                            </label>
                            <div className="mt-2">
                              {logoPreview ? (
                                <div className="relative inline-block">
                                  <img 
                                    src={logoPreview} 
                                    alt="Logo preview" 
                                    className="h-24 w-24 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={removeFile}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <label className="cursor-pointer">
                                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-[#18005F] hover:bg-[#18005F]/5 transition-all">
                                    <Camera className="w-6 h-6 text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-500 font-medium">Upload</span>
                                  </div>
                                  <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                  />
                                </label>
                              )}
                              {errors.organization_logo && (
                                <p className="mt-1 text-xs text-red-600 font-medium">{errors.organization_logo}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Freelancer-specific fields */}
                    {organizationData.is_freelancer && (
                      <div className="bg-purple-50 p-6 rounded-2xl border border-purple-200">
                        <h4 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                          <Star className="h-5 w-5 mr-2 text-[#18005F]" />
                          About You
                        </h4>
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Tell us about yourself
                          </label>
                          <textarea
                            value={organizationData.about_freelancer}
                            onChange={(e) => setOrganizationData(prev => ({ ...prev, about_freelancer: e.target.value }))}
                            disabled={!isEditingOrganization}
                            rows={6}
                            className={`w-full px-4 py-3 border-2 rounded-xl font-medium text-sm transition-all resize-none ${
                              isEditingOrganization
                                ? 'border-gray-200 focus:border-[#18005F] focus:ring-4 focus:ring-[#18005F]/20'
                                : 'border-gray-100 bg-gray-50'
                            }`}
                            placeholder="Describe your skills, experience, and services..."
                          />
                          {errors.about_freelancer && (
                            <p className="mt-1 text-xs text-red-600 font-medium">{errors.about_freelancer}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {isEditingOrganization && (
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex items-center px-6 py-3 bg-[#18005F] text-white rounded-xl font-bold text-sm hover:bg-[#18005F]/90 transition-colors disabled:opacity-50"
                        >
                          {isSubmitting ? (
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
                    )}
                  </form>
                </div>
              )}

              {/* Error Messages */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-sm"
                  >
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium text-sm">{errors.general}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;