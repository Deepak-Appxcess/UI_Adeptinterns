import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, X, Mail, User, Phone, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkEmailExists, registerUser, verifyOTP, resendOTP } from '../../services/api';

const EmployeeRegister = () => {
  const [emailStatus, setEmailStatus] = useState({
    loading: false,
    exists: null,
    message: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  // Simplified form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'Employer'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  
  // OTP states
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpResent, setOtpResent] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const navigate = useNavigate();

  // Countdown timer for resend OTP
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'First Name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last Name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    } else if (emailStatus.exists === true) {
      newErrors.email = 'This email is already registered';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 characters';
    }
    
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone Number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (otpError) setOtpError('');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    if (emailStatus.loading) {
      setApiError('Please wait while we validate your email');
      return;
    }
    
    if (emailStatus.exists === true) {
      setApiError('This email is already registered');
      return;
    }
    
    try {
      await registerUser(formData);
      setShowOtpForm(true);
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        if (error.response.data) {
          const errorData = error.response.data;
          if (typeof errorData === 'object') {
            const fieldErrors = {};
            Object.entries(errorData).forEach(([field, messages]) => {
              fieldErrors[field] = Array.isArray(messages) ? messages.join(', ') : messages;
            });
            setErrors(fieldErrors);
          } else {
            setApiError(errorData.message || errorData.detail || 'Registration failed');
          }
        }
      } else {
        setApiError('Network error. Please check your connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setOtpError('Please enter a 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data } = await verifyOTP({
        email: formData.email,
        code: otp
      });

      localStorage.setItem('authToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);

      navigate('/dashboard/employer');
    } catch (error) {
      console.error('OTP verification error:', error);
      if (error.response) {
        if (error.response.data) {
          const errorData = error.response.data;
          if (typeof errorData === 'object') {
            const errorMessages = [];
            Object.entries(errorData).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                errorMessages.push(...messages);
              } else {
                errorMessages.push(messages);
              }
            });
            setOtpError(errorMessages.join(', '));
          } else {
            setOtpError(errorData.detail || errorData.message || 'OTP verification failed');
          }
        } else {
          setOtpError('Invalid or expired OTP');
        }
      } else {
        setOtpError('Network error. Please check your connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendDisabled(true);
      await resendOTP({ email: formData.email });
      setOtpResent(true);
      setTimeout(() => setOtpResent(false), 3000);
    } catch (error) {
      console.error('Resend OTP error:', error);
      if (error.response) {
        setOtpError(error.response.data.detail || 
                   error.response.data.message || 
                   'Failed to resend OTP');
      } else {
        setOtpError('Network error. Please check your connection.');
      }
    } finally {
      setResendDisabled(false);
    }
  };

  const handleBackToRegister = () => {
    setShowOtpForm(false);
    setOtp('');
    setOtpError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {showOtpForm ? (
            <motion.div
              key="otp-form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToRegister}
                className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Back to registration</span>
              </motion.button>
              
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Mail className="h-8 w-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We've sent a verification code to<br />
                  <span className="font-semibold text-indigo-600">{formData.email}</span>
                </p>
              </div>
              
              <AnimatePresence>
                {otpResent && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl text-center"
                  >
                    ✓ OTP has been resent successfully
                  </motion.div>
                )}
              </AnimatePresence>
              
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter 6-digit verification code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="000000"
                    className={`w-full px-4 py-3 text-center text-lg font-mono tracking-widest border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all ${
                      otpError ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'
                    }`}
                    maxLength={6}
                  />
                  {otpError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 text-sm text-red-600"
                    >
                      {otpError}
                    </motion.p>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting || otp.length !== 6}
                  className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all ${
                    isSubmitting || otp.length !== 6 ? 'opacity-50 cursor-not-allowed' : 'hover:from-indigo-700 hover:to-purple-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Verifying...
                    </div>
                  ) : 'Verify Email'}
                </motion.button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendDisabled}
                    className={`text-sm font-medium transition-colors ${
                      resendDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-700'
                    }`}
                  >
                    {resendDisabled ? `Resend code in ${resendTimer}s` : 'Resend verification code'}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="register-form"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8"
            >
              <div className="text-center mb-8">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2"
                >
                  ADEPTINTERNS
                </motion.h1>
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-semibold text-gray-900 mb-1"
                >
                  Join as an Employer
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-600 text-sm"
                >
                  Find the perfect talent for your organization
                </motion.p>
              </div>
              
              <AnimatePresence>
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"
                  >
                    {apiError}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label htmlFor="first_name" className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="John"
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-sm ${
                          errors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                    {errors.first_name && (
                      <p className="mt-1 text-xs text-red-600">{errors.first_name}</p>
                    )}
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Doe"
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-sm ${
                          errors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                    {errors.last_name && (
                      <p className="mt-1 text-xs text-red-600">{errors.last_name}</p>
                    )}
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@company.com"
                      className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-sm ${
                        errors.email ? 'border-red-300 bg-red-50' : 
                        emailStatus.exists === true ? 'border-red-300 bg-red-50' : 
                        emailStatus.exists === false ? 'border-green-300 bg-green-50' : 'border-gray-200 focus:border-indigo-500'
                      }`}
                    />
                    {emailStatus.loading && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      </div>
                    )}
                    {!emailStatus.loading && emailStatus.exists !== null && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {emailStatus.exists ? (
                          <X className="h-4 w-4 text-red-500" />
                        ) : (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                  {emailStatus.message && !errors.email && (
                    <p className={`mt-1 text-xs ${
                      emailStatus.exists ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {emailStatus.message}
                    </p>
                  )}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-sm ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label htmlFor="phone_number" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-sm ${
                        errors.phone_number ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {errors.phone_number && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone_number}</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="flex items-start space-x-3"
                >
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                    I agree to ADEPTINTERNS' <a href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium">Terms of Service</a> and <a href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">Privacy Policy</a>
                  </label>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:from-indigo-700 hover:to-purple-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Creating Account...
                    </div>
                  ) : 'Create Employer Account'}
                </motion.button>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center"
                >
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                      Sign in
                    </a>
                  </p>
                </motion.div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmployeeRegister;