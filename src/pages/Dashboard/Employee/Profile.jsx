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
  Lock
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
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState({});
  const [formData, setFormData] = useState({});
  const [organizationData, setOrganizationData] = useState({});
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  
  // Phone verification states
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  
  // Organization form states
  const [logoPreview, setLogoPreview] = useState(null);
  const [showOrganizationForm, setShowOrganizationForm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    let timer;
    if (resendDisabled && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
      setResendTimer(60);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, resendTimer]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetchUserProfile();
      setProfile(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
        phone_number: response.data.phone_number || ''
      });
      
      // Initialize organization data if employer profile exists
      if (response.data.employer_profile) {
        setOrganizationData({
          designation: response.data.employer_profile.designation || '',
          city: response.data.employer_profile.city || '',
          industry: response.data.employer_profile.industry || '',
          no_of_employees: response.data.employer_profile.no_of_employees || '',
          is_freelancer: response.data.employer_profile.is_freelancer || false,
          about_freelancer: response.data.employer_profile.about_freelancer || '',
          organization_name: response.data.employer_profile.organization_name || '',
          organization_description: response.data.employer_profile.organization_description || '',
          verification_method: response.data.employer_profile.verification_method || 'Email',
          verification_value: response.data.employer_profile.verification_value || '',
          organization_logo: null
        });
      } else {
        // Initialize with default values
        setOrganizationData({
          designation: '',
          city: '',
          industry: '',
          no_of_employees: '',
          is_freelancer: false,
          about_freelancer: '',
          organization_name: '',
          organization_description: '',
          verification_method: 'Email',
          verification_value: '',
          organization_logo: null
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section) => {
    setIsEditing(prev => ({ ...prev, [section]: true }));
    setErrors({});
    setSuccessMessage('');
  };

  const handleCancel = (section) => {
    setIsEditing(prev => ({ ...prev, [section]: false }));
    setErrors({});
    setSuccessMessage('');
    
    if (section === 'personal') {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone_number: profile.phone_number || ''
      });
    } else if (section === 'password') {
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    }
  };

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    
    if (section === 'personal') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (section === 'password') {
      setPasswordData(prev => ({ ...prev, [name]: value }));
    } else if (section === 'organization') {
      setOrganizationData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, organization_logo: 'File size must be less than 5MB' }));
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, organization_logo: 'Please select an image file' }));
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
    setErrors(prev => ({ ...prev, organization_logo: '' }));
  };

  const handleSave = async (section) => {
    try {
      setIsSubmitting(true);
      setErrors({});

      if (section === 'personal') {
        await updateProfile(formData);
        setSuccessMessage('Personal information updated successfully');
        await fetchProfile();
      } else if (section === 'password') {
        if (passwordData.new_password !== passwordData.confirm_password) {
          setErrors({ confirm_password: 'Passwords do not match' });
          return;
        }
        await changePassword(passwordData);
        setSuccessMessage('Password updated successfully');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      }

      setIsEditing(prev => ({ ...prev, [section]: false }));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error(`Error updating ${section}:`, error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: `Failed to update ${section}. Please try again.` });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneVerification = async () => {
    if (!profile.is_phone_verified) {
      setShowPhoneVerification(true);
      try {
        await resendPhoneOTP({ phone_number: profile.phone_number });
      } catch (error) {
        console.error('Error sending OTP:', error);
        setOtpError('Failed to send OTP. Please try again.');
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      await verifyPhoneOTP({
        phone_number: profile.phone_number,
        code: otp
      });
      setShowPhoneVerification(false);
      setShowOrganizationForm(true);
      await fetchProfile();
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('Invalid OTP. Please try again.');
    }
  };

  const handleOrganizationSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrors({});

      const data = new FormData();
      Object.keys(organizationData).forEach(key => {
        if (organizationData[key] !== null && organizationData[key] !== undefined) {
          if (key === 'organization_logo' && organizationData[key] instanceof File) {
            data.append(key, organizationData[key]);
          } else {
            data.append(key, organizationData[key]);
          }
        }
      });

      await setupEmployerProfile(data);
      setSuccessMessage('Organization profile updated successfully');
      setShowOrganizationForm(false);
      await fetchProfile();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating organization profile:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Failed to update organization profile. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'organization', label: 'Organization Profile', icon: Building }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#18005F] mb-4" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[#18005F] rounded-xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-gray-600">{profile.email}</p>
              <div className="flex items-center mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile.is_phone_verified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile.is_phone_verified ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Phone Verified
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Phone Not Verified
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                {successMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#18005F] text-[#18005F]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  {!isEditing.personal ? (
                    <button
                      onClick={() => handleEdit('personal')}
                      className="flex items-center px-4 py-2 text-[#18005F] border border-[#18005F] rounded-lg hover:bg-[#18005F]/5 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleCancel('personal')}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave('personal')}
                        disabled={isSubmitting}
                        className="flex items-center px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    {isEditing.personal ? (
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange(e, 'personal')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.first_name || 'Not provided'}</p>
                    )}
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    {isEditing.personal ? (
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange(e, 'personal')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.last_name || 'Not provided'}</p>
                    )}
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    {isEditing.personal ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange(e, 'personal')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.email}</p>
                    )}
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="flex items-center space-x-3">
                      {isEditing.personal ? (
                        <input
                          type="tel"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={(e) => handleInputChange(e, 'personal')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                        />
                      ) : (
                        <p className="text-gray-900 py-2 flex-1">{profile.phone_number || 'Not provided'}</p>
                      )}
                      {!profile.is_phone_verified && (
                        <button
                          onClick={handlePhoneVerification}
                          className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                    {errors.phone_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                  {!isEditing.password ? (
                    <button
                      onClick={() => handleEdit('password')}
                      className="flex items-center px-4 py-2 text-[#18005F] border border-[#18005F] rounded-lg hover:bg-[#18005F]/5 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Change Password
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleCancel('password')}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave('password')}
                        disabled={isSubmitting}
                        className="flex items-center px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Update Password
                      </button>
                    </div>
                  )}
                </div>

                {isEditing.password && (
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? "text" : "password"}
                          name="current_password"
                          value={passwordData.current_password}
                          onChange={(e) => handleInputChange(e, 'password')}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword.current ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors.current_password && (
                        <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.new ? "text" : "password"}
                          name="new_password"
                          value={passwordData.new_password}
                          onChange={(e) => handleInputChange(e, 'password')}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword.new ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors.new_password && (
                        <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          name="confirm_password"
                          value={passwordData.confirm_password}
                          onChange={(e) => handleInputChange(e, 'password')}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword.confirm ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors.confirm_password && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                      )}
                    </div>
                  </div>
                )}

                {!isEditing.password && (
                  <div className="text-gray-600">
                    <p>Click "Change Password" to update your password.</p>
                  </div>
                )}
              </div>
            )}

            {/* Organization Profile Tab */}
            {activeTab === 'organization' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Organization Profile</h3>
                  {profile.has_completed_organization && (
                    <button
                      onClick={() => setShowOrganizationForm(true)}
                      className="flex items-center px-4 py-2 text-[#18005F] border border-[#18005F] rounded-lg hover:bg-[#18005F]/5 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  )}
                </div>

                {!profile.is_phone_verified ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Phone Verification Required</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Please verify your phone number before setting up your organization profile.
                        </p>
                        <button
                          onClick={handlePhoneVerification}
                          className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                        >
                          Verify Phone Number
                        </button>
                      </div>
                    </div>
                  </div>
                ) : !profile.has_completed_organization ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Building className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">Complete Your Organization Profile</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Set up your organization profile to start posting jobs and internships.
                        </p>
                        <button
                          onClick={() => setShowOrganizationForm(true)}
                          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Setup Organization Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.employer_profile && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                          <p className="text-gray-900">{profile.employer_profile.designation}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                          <p className="text-gray-900">{profile.employer_profile.city}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                          <p className="text-gray-900">{profile.employer_profile.industry}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Employees</label>
                          <p className="text-gray-900">{profile.employer_profile.no_of_employees}</p>
                        </div>
                        {!profile.employer_profile.is_freelancer && (
                          <>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                              <p className="text-gray-900">{profile.employer_profile.organization_name}</p>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Organization Description</label>
                              <p className="text-gray-900">{profile.employer_profile.organization_description}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Method</label>
                              <p className="text-gray-900">{profile.employer_profile.verification_method}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Value</label>
                              <p className="text-gray-900">{profile.employer_profile.verification_value}</p>
                            </div>
                          </>
                        )}
                        {profile.employer_profile.is_freelancer && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">About Freelancer</label>
                            <p className="text-gray-900">{profile.employer_profile.about_freelancer}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phone Verification Modal */}
      <AnimatePresence>
        {showPhoneVerification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verify Phone Number</h3>
              <p className="text-gray-600 mb-4">
                Enter the 6-digit code sent to {profile.phone_number}
              </p>
              
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-3 py-2 text-center text-lg font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F]"
                  maxLength={6}
                />
                
                {otpError && (
                  <p className="text-sm text-red-600">{otpError}</p>
                )}
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPhoneVerification(false)}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={otp.length !== 6}
                    className="flex-1 px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 disabled:opacity-50"
                  >
                    Verify
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Organization Form Modal */}
      <AnimatePresence>
        {showOrganizationForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-3 sm:p-6 my-8 mx-auto overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Organization Profile</h3>
              
              <form onSubmit={handleOrganizationSubmit} className="space-y-6">
                {/* Account Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Account Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      !organizationData.is_freelancer 
                        ? 'border-[#18005F] bg-[#18005F]/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        checked={!organizationData.is_freelancer}
                        onChange={() => setOrganizationData(prev => ({ ...prev, is_freelancer: false }))}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <Building className="h-5 w-5 mr-3 text-[#18005F]" />
                        <span className="font-medium text-gray-900">Organization</span>
                      </div>
                      {!organizationData.is_freelancer && (
                        <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-[#18005F]" />
                      )}
                    </label>
                    
                    <label className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      organizationData.is_freelancer 
                        ? 'border-[#18005F] bg-[#18005F]/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        checked={organizationData.is_freelancer}
                        onChange={() => setOrganizationData(prev => ({ ...prev, is_freelancer: true }))}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-3 text-[#18005F]" />
                        <span className="font-medium text-gray-900">Freelancer</span>
                      </div>
                      {organizationData.is_freelancer && (
                        <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-[#18005F]" />
                      )}
                    </label>
                  </div>
                </div>

                {/* Common Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation *
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={organizationData.designation}
                      onChange={(e) => handleInputChange(e, 'organization')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F]"
                      required
                    />
                    {errors.designation && <p className="mt-1 text-sm text-red-600">{errors.designation}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={organizationData.city}
                      onChange={(e) => handleInputChange(e, 'organization')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F]"
                      required
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry *
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={organizationData.industry}
                      onChange={(e) => handleInputChange(e, 'organization')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F]"
                      required
                    />
                    {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Employees *
                    </label>
                    <input
                      type="number"
                      name="no_of_employees"
                      value={organizationData.no_of_employees}
                      onChange={(e) => handleInputChange(e, 'organization')}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F]"
                      required
                    />
                    {errors.no_of_employees && <p className="mt-1 text-sm text-red-600">{errors.no_of_employees}</p>}
                  </div>
                </div>

                {/* Organization-specific fields */}
                {!organizationData.is_freelancer && (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        name="organization_name"
                        value={organizationData.organization_name}
                        onChange={(e) => handleInputChange(e, 'organization')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F]"
                        required
                      />
                      {errors.organization_name && <p className="mt-1 text-sm text-red-600">{errors.organization_name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Description *
                      </label>
                      <textarea
                        name="organization_description"
                        value={organizationData.organization_description}
                        onChange={(e) => handleInputChange(e, 'organization')}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] resize-none"
                        required
                      />
                      {errors.organization_description && <p className="mt-1 text-sm text-red-600">{errors.organization_description}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Verification Method *
                        </label>
                        <select
                          name="verification_method"
                          value={organizationData.verification_method}
                          onChange={(e) => handleInputChange(e, 'organization')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F]"
                          required
                        >
                          <option value="Email">Email</option>
                          <option value="Phone">Phone</option>
                          <option value="Document">Document</option>
                        </select>
                        {errors.verification_method && <p className="mt-1 text-sm text-red-600">{errors.verification_method}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Verification Value *
                        </label>
                        <input
                          type={organizationData.verification_method === 'Email' ? 'email' : 'text'}
                          name="verification_value"
                          value={organizationData.verification_value}
                          onChange={(e) => handleInputChange(e, 'organization')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F]"
                          placeholder={
                            organizationData.verification_method === 'Email' ? 'hr@company.com' :
                            organizationData.verification_method === 'Phone' ? '+1234567890' :
                            'Document details'
                          }
                          required
                        />
                        {errors.verification_value && <p className="mt-1 text-sm text-red-600">{errors.verification_value}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              <span className="text-xs text-gray-500">Upload</span>
                            </div>
                            <input
                              type="file"
                              onChange={handleFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                          </label>
                        )}
                        {errors.organization_logo && <p className="mt-1 text-sm text-red-600">{errors.organization_logo}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Freelancer-specific fields */}
                {organizationData.is_freelancer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      About Freelancer *
                    </label>
                    <textarea
                      name="about_freelancer"
                      value={organizationData.about_freelancer}
                      onChange={(e) => handleInputChange(e, 'organization')}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] resize-none"
                      placeholder="Describe your skills, experience, and services you offer..."
                      required
                    />
                    {errors.about_freelancer && <p className="mt-1 text-sm text-red-600">{errors.about_freelancer}</p>}
                  </div>
                )}

                {errors.general && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      <p className="text-sm">{errors.general}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setShowOrganizationForm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployerProfile;