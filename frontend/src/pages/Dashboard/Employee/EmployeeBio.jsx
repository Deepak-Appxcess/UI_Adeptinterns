import { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { 
  checkPhoneVerification,
  resendPhoneOTP,
  verifyPhoneOTP,
  fetchUserProfile,
  updateProfile,
  setupEmployerProfile
} from '../../../services/api';

const EmployerProfileSetup = ({ onComplete }) => {
  const [step, setStep] = useState(1); // 1: Edit details, 2: OTP verification, 3: Profile setup
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    phone_number: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [otp, setOtp] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    is_freelancer: false,
    designation: '',
    city: '',
    organization_name: '',
    organization_description: '',
    industry: '',
    no_of_employees: '',
    verification_method: 'gst',
    verification_value: '',
    organization_logo: null,
    about_freelancer: ''
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

      setFormData(prev => ({ ...prev, organization_logo: file }));
      setLogoPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, organization_logo: '' }));
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, organization_logo: null }));
    setLogoPreview(null);
    setErrors(prev => ({ ...prev, organization_logo: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Clear previous errors
      setErrors({});

      // Validate required fields
      const validationErrors = {};
      
      if (!formData.designation) {
        validationErrors.designation = "Designation is required";
      }
      if (!formData.city) {
        validationErrors.city = "Location is required";
      }
      
      if (!formData.is_freelancer) {
        // Organization validation
        if (!formData.organization_name) {
          validationErrors.organization_name = "Organization name is required";
        }
        if (!formData.organization_description) {
          validationErrors.organization_description = "Organization description is required";
        }
        if (!formData.industry) {
          validationErrors.industry = "Industry is required";
        }
        if (!formData.no_of_employees || formData.no_of_employees < 1) {
          validationErrors.no_of_employees = "Number of employees must be at least 1";
        }
        if (!formData.verification_value) {
          validationErrors.verification_value = "Verification value is required";
        }
      } else {
        // Freelancer validation
        if (!formData.about_freelancer) {
          validationErrors.about_freelancer = "About freelancer is required";
        }
        // Set default values if not provided
        if (!formData.industry) {
          setFormData(prev => ({ ...prev, industry: 'Freelance' }));
        }
        if (!formData.no_of_employees) {
          setFormData(prev => ({ ...prev, no_of_employees: 1 }));
        }
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const data = new FormData();
      
      // Prepare the data to send based on account type
      const fieldsToSend = formData.is_freelancer
        ? [
            'is_freelancer', 'designation', 'city', 
            'about_freelancer', 'industry', 'no_of_employees'
          ]
        : [
            'is_freelancer', 'designation', 'city',
            'organization_name', 'organization_description',
            'industry', 'no_of_employees', 'verification_method',
            'verification_value', 'organization_logo'
          ];

      fieldsToSend.forEach(field => {
        if (formData[field] !== null && formData[field] !== undefined) {
          if (field === 'organization_logo' && formData[field] instanceof File) {
            data.append(field, formData[field]);
          } else {
            data.append(field, formData[field]);
          }
        }
      });

      // Use the correct employer setup endpoint
      await setupEmployerProfile(data);
      
      // Handle successful submission
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting profile:', error);
      
      // Handle API validation errors
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ 
          non_field_errors: error.message || 'Failed to submit profile. Please try again.' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetchUserProfile();
        const { first_name, last_name, phone_number, is_phone_verified } = response.data;
        
        setUserData({
          first_name: first_name || '',
          last_name: last_name || '',
          phone_number: phone_number || ''
        });

        if (is_phone_verified) {
          setIsPhoneVerified(true);
          setStep(3);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setErrors({ fetchError: 'Failed to load profile data' });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(userData);
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ saveError: error.response?.data?.error || 'Failed to update profile' });
    }
  };

  const sendOtp = async () => {
    try {
      await resendPhoneOTP({ phone_number: userData.phone_number });
      setOtpSent(true);
      setStep(2);
      setCountdown(60);
      setErrors({});
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrors({ otpError: error.response?.data?.error || 'Failed to send OTP' });
    }
  };

  const verifyPhone = async (e) => {
    e.preventDefault();
    try {
      if (!otp || !userData.phone_number) {
        throw new Error("Please enter the verification code");
      }
      
      await verifyPhoneOTP({
        phone_number: userData.phone_number,
        code: otp
      });
      setIsPhoneVerified(true);
      setStep(3);
      setErrors({});
    } catch (error) {
      console.error('Error verifying phone:', error);
      setErrors({ 
        otpError: error.response?.data?.error || error.message || 'Invalid OTP' 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-slate-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#18005F]/20 border-t-[#18005F] rounded-full"
        />
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-[#18005F] to-[#18005F]/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <User className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Identity</h1>
            <p className="text-gray-600">Please provide your basic details</p>
          </div>
          
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="first_name"
                  value={userData.first_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-all text-sm bg-gray-50/50"
                  disabled={!isEditing}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="last_name"
                  value={userData.last_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-all text-sm bg-gray-50/50"
                  disabled={!isEditing}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone_number"
                  value={userData.phone_number}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-all text-sm bg-gray-50/50"
                  disabled={!isEditing}
                />
              </div>
            </motion.div>

            <AnimatePresence>
              {errors.saveError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"
                >
                  {errors.saveError}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end space-x-3 pt-2">
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#18005F] to-[#18005F]/90 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Edit Details
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="px-6 py-3 bg-gradient-to-r from-[#18005F] to-[#18005F]/90 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Save Changes
                  </motion.button>
                </>
              )}
            </div>

            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  sendOtp();
                  setStep(2);
                }}
                disabled={!userData.phone_number}
                className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-all ${
                  !userData.phone_number 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Verify Phone Number
                </div>
              </motion.button>
              <AnimatePresence>
                {errors.otpError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"
                  >
                    {errors.otpError}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <Phone className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Phone</h1>
            <p className="text-gray-600">We've sent a 6-digit code to {userData.phone_number}</p>
          </div>

          <form onSubmit={verifyPhone} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-center text-xl tracking-widest font-mono transition-all bg-gray-50/50"
                maxLength="6"
                pattern="\d{6}"
                required
                placeholder="000000"
              />
            </motion.div>

            <div className="flex justify-between items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={sendOtp}
                disabled={countdown > 0}
                className={`text-sm font-medium transition-colors ${
                  countdown > 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-[#18005F] hover:text-[#18005F]/80'
                }`}
              >
                Resend Code {countdown > 0 && `(${countdown}s)`}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Verify
              </motion.button>
            </div>

            <AnimatePresence>
              {errors.otpError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"
                >
                  {errors.otpError}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-[#18005F] to-[#18005F]/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <Building className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Employer Profile</h1>
            <p className="text-gray-600">Fill in your details to get started</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Account Type */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-[#18005F]/5 to-[#18005F]/10 p-6 rounded-2xl border border-[#18005F]/20"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    !formData.is_freelancer 
                      ? 'border-[#18005F] bg-[#18005F]/5' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    checked={!formData.is_freelancer}
                    onChange={() => setFormData(prev => ({ 
                      ...prev, 
                      is_freelancer: false,
                      industry: '',
                      no_of_employees: ''
                    }))}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-3 text-[#18005F]" />
                    <span className="font-medium text-gray-900">Organization</span>
                  </div>
                  {!formData.is_freelancer && (
                    <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-[#18005F]" />
                  )}
                </motion.label>
                
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.is_freelancer 
                      ? 'border-[#18005F] bg-[#18005F]/5' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    checked={formData.is_freelancer}
                    onChange={() => setFormData(prev => ({ 
                      ...prev, 
                      is_freelancer: true,
                      industry: 'Freelance',
                      no_of_employees: 1
                    }))}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-3 text-[#18005F]" />
                    <span className="font-medium text-gray-900">Freelancer</span>
                  </div>
                  {formData.is_freelancer && (
                    <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-[#18005F]" />
                  )}
                </motion.label>
              </div>
            </motion.div>

            {/* Common fields */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Designation*
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleFormChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-all text-sm bg-gray-50/50"
                    required
                    placeholder="e.g., CEO, HR Manager, Developer"
                  />
                </div>
                {errors.designation && <p className="mt-1 text-sm text-red-600">{errors.designation}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {formData.is_freelancer ? 'Your Location*' : 'Organization Location*'}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-all text-sm bg-gray-50/50"
                    required
                    placeholder="e.g., New York, London, Remote"
                  />
                </div>
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
              </div>
            </motion.div>

            {/* Common fields for both freelancers and organizations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Industry*
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleFormChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-all text-sm bg-gray-50/50"
                    required
                    placeholder={formData.is_freelancer ? "e.g. Web Development, Design" : "e.g. Tech, Finance"}
                  />
                </div>
                {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {formData.is_freelancer ? 'Team Size*' : 'Number of Employees*'}
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="no_of_employees"
                    value={formData.no_of_employees}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      no_of_employees: parseInt(e.target.value) || (formData.is_freelancer ? 1 : '')
                    }))}
                    min="1"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-all text-sm bg-gray-50/50"
                    required
                    placeholder={formData.is_freelancer ? "1" : "e.g. 50"}
                  />
                </div>
                {errors.no_of_employees && <p className="mt-1 text-sm text-red-600">{errors.no_of_employees}</p>}
              </div>
            </motion.div>

            {/* Organization-specific fields */}
            <AnimatePresence>
              {!formData.is_freelancer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-[#18005F]" />
                    Organization Details
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Organization Name*
                      </label>
                      <input
                        type="text"
                        name="organization_name"
                        value={formData.organization_name}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-all text-sm bg-gray-50/50"
                        required
                        placeholder="e.g., ADEPTINTERNS Inc."
                      />
                      {errors.organization_name && <p className="mt-1 text-sm text-red-600">{errors.organization_name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Organization Description*
                      </label>
                      <textarea
                        name="organization_description"
                        value={formData.organization_description}
                        onChange={handleFormChange}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-all text-sm resize-none bg-gray-50/50"
                        required
                        placeholder="Describe your organization, its mission, and what you do..."
                      />
                      {errors.organization_description && <p className="mt-1 text-sm text-red-600">{errors.organization_description}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Verification Method*
                        </label>
                        <select
                          name="verification_method"
                          value={formData.verification_method}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-all text-sm bg-gray-50/50"
                          required
                        >
                          <option value="gst">GST NO</option>
                          <option value="Phone">Phone</option>
                          <option value="Document">Document</option>
                        </select>
                        {errors.verification_method && <p className="mt-1 text-sm text-red-600">{errors.verification_method}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Verification Value*
                        </label>
                        <div className="relative">
                          {formData.verification_method === 'gst' ? (
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          ) : formData.verification_method === 'Phone' ? (
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          ) : (
                            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          )}
                          <input
                            type={formData.verification_method === 'gst' ? 'text' : 'text'}
                            name="verification_value"
                            value={formData.verification_value}
                            onChange={handleFormChange}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-all text-sm bg-gray-50/50"
                            required
                            placeholder={
                              formData.verification_method === 'gst' ? 'GST Number' :
                              formData.verification_method === 'Phone' ? '+1234567890' :
                              'Document details'
                            }
                          />
                        </div>
                        {errors.verification_value && <p className="mt-1 text-sm text-red-600">{errors.verification_value}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        {formData.organization_logo && (
                          <p className="mt-2 text-sm text-gray-600">
                            {formData.organization_logo.name}
                          </p>
                        )}
                        {errors.organization_logo && <p className="mt-1 text-sm text-red-600">{errors.organization_logo}</p>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Freelancer-specific fields */}
            <AnimatePresence>
              {formData.is_freelancer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-purple-600" />
                    About You
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tell us about yourself*
                    </label>
                    <textarea
                      name="about_freelancer"
                      value={formData.about_freelancer}
                      onChange={handleFormChange}
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm resize-none bg-gray-50/50"
                      placeholder="Describe your skills, experience, and services you offer..."
                      required
                    />
                    {errors.about_freelancer && <p className="mt-1 text-sm text-red-600">{errors.about_freelancer}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {errors.non_field_errors && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <p className="text-sm">{errors.non_field_errors}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#18005F] to-[#18005F]/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Complete Setup
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployerProfileSetup;