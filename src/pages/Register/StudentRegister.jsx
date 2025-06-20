import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, X, Mail, User, Phone, ArrowLeft, Check, Eye, EyeOff, Shield, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { registerUser, verifyOTP, resendOTP } from '../../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { googleSignIn } from '../../services/api';

const StudentRegister = () => {
  const [emailStatus, setEmailStatus] = useState({
    loading: false,
    exists: null,
    message: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Simplified form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'Candidate'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  
  // OTP states
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

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
      newErrors.password = 'Minimum 6 characters required';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

    // Clear confirm password error when password changes
    if (name === 'password' && errors.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ''
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
      // Remove confirmPassword from the data sent to API
      const { confirmPassword, ...registrationData } = formData;
      await registerUser(registrationData);
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

      navigate('/dashboard/student');
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
      const response = await resendOTP({ email: formData.email });

      if (response.data?.message) {
        setOtpMessage(response.data.message);
        setOtpError('');
        setOtpResent(true);
        setTimeout(() => {
          setOtpResent(false);
          setOtpMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      let backendMessage = 'Network error. Please check your connection.';

      if (error.response) {
        backendMessage =
          error.response.data.detail ||
          error.response.data.error ||
          error.response.data.message ||
          backendMessage;
      }

      setOtpError(backendMessage);
      setOtpMessage('');
    } finally {
      setResendDisabled(false);
    }
  };

  const handleBackToRegister = () => {
    setShowOtpForm(false);
    setOtp('');
    setOtpError('');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      setApiError('');
      
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Google user info:', decoded);
      
      const { data } = await googleSignIn(credentialResponse.credential);
      
      localStorage.setItem('authToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      
      navigate('/dashboard/student');
    } catch (error) {
      console.error('Google Sign-In error:', error);
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.error || 
                     error.response.data?.detail || 
                     errorMessage;
      }
      
      setApiError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setApiError('Google sign-in was cancelled');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
       <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2318005F%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]">


      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-[#18005F]/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-[#18005F]/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-[#18005F]/8 rounded-full blur-xl animate-pulse delay-500"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {showOtpForm ? (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative"
              >
                {/* Decorative Elements */}
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-[#18005F]/20 to-transparent rounded-full blur-xl"></div>
                <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-tr from-[#18005F]/15 to-transparent rounded-full blur-lg"></div>

                <motion.button
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBackToRegister}
                  className="flex items-center text-gray-600 hover:text-[#18005F] mb-8 transition-all duration-300 group"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm font-semibold">Back to registration</span>
                </motion.button>
                
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-gradient-to-br from-[#18005F] to-[#18005F]/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  >
                    <Shield className="h-10 w-10 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Verify Your Email</h2>
                  <p className="text-gray-600 leading-relaxed">
                    We've sent a verification code to<br />
                    <span className="font-bold text-[#18005F]">{formData.email}</span>
                  </p>
                </div>
                
                <AnimatePresence>
                  {otpMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-center shadow-sm"
                    >
                      <div className="flex items-center justify-center">
                        <Check className="w-5 h-5 mr-2" />
                        {otpMessage}
                      </div>
                    </motion.div>
                  )}
                  {otpError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center shadow-sm"
                    >
                      <div className="flex items-center justify-center">
                        <X className="w-5 h-5 mr-2" />
                        {otpError}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="otp" className="block text-sm font-bold text-gray-700 mb-3">
                      Enter 6-digit verification code
                    </label>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={otp}
                      onChange={handleOtpChange}
                      placeholder="000000"
                      className={`w-full px-6 py-4 text-center text-2xl font-mono tracking-widest border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 transition-all shadow-sm ${
                        otpError ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#18005F] bg-gray-50/50'
                      }`}
                      maxLength={6}
                    />
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting || otp.length !== 6}
                    className={`w-full bg-gradient-to-r from-[#18005F] to-[#18005F]/90 text-white py-4 px-6 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 ${
                      isSubmitting || otp.length !== 6 ? 'opacity-50 cursor-not-allowed' : 'hover:from-[#18005F]/90 hover:to-[#18005F]'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-3" />
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Verify Email
                      </div>
                    )}
                  </motion.button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendDisabled}
                      className={`font-semibold transition-all duration-300 ${
                        resendDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-[#18005F] hover:text-[#18005F]/80 hover:underline'
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
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative"
              >
                {/* Decorative Elements */}
                <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-[#18005F]/20 to-transparent rounded-full blur-xl"></div>
                <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-gradient-to-tr from-[#18005F]/15 to-transparent rounded-full blur-lg"></div>

                <div className="text-center mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center justify-center mb-4"
                  >
                    <div className="w-12 h-12 bg-[#18005F] rounded-2xl flex items-center justify-center mr-3 shadow-lg">
                      <Star className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-[#18005F] to-[#18005F]/80 bg-clip-text text-transparent">
                      ADEPTINTERNS
                    </h1>
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="text-2xl font-bold text-gray-900 mb-2"
                  >
                    Start Your Career Journey
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-gray-600 font-medium"
                  >
                    Discover amazing internship and job opportunities
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mt-8"
                  >
                    <div className="mb-6">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        shape="pill"
                        size="large"
                        text="signup_with"
                        theme="outline"
                        width="100%"
                      />
                      {googleLoading && (
                        <div className="mt-4 text-center">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#18005F]" />
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-semibold">Or continue with email</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <AnimatePresence>
                  {apiError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-sm"
                    >
                      <div className="flex items-center">
                        <X className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">{apiError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      <label htmlFor="first_name" className="block text-sm font-bold text-gray-700 mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          placeholder="Alex"
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 transition-all font-medium shadow-sm ${
                            errors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#18005F] bg-gray-50/50'
                          }`}
                        />
                      </div>
                      {errors.first_name && (
                        <p className="mt-2 text-xs text-red-600 font-medium">{errors.first_name}</p>
                      )}
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45, duration: 0.5 }}
                    >
                      <label htmlFor="last_name" className="block text-sm font-bold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          placeholder="Smith"
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 transition-all font-medium shadow-sm ${
                            errors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#18005F] bg-gray-50/50'
                          }`}
                        />
                      </div>
                      {errors.last_name && (
                        <p className="mt-2 text-xs text-red-600 font-medium">{errors.last_name}</p>
                      )}
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="alex@university.edu"
                        className={`w-full pl-12 pr-14 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 transition-all font-medium shadow-sm ${
                          errors.email ? 'border-red-300 bg-red-50' : 
                          emailStatus.exists === true ? 'border-red-300 bg-red-50' : 
                          emailStatus.exists === false ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 focus:border-[#18005F] bg-gray-50/50'
                        }`}
                      />
                      {emailStatus.loading && (
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      )}
                      {!emailStatus.loading && emailStatus.exists !== null && (
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          {emailStatus.exists ? (
                            <X className="h-5 w-5 text-red-500" />
                          ) : (
                            <Check className="h-5 w-5 text-emerald-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-xs text-red-600 font-medium">{errors.email}</p>
                    )}
                    {emailStatus.message && !errors.email && (
                      <p className={`mt-2 text-xs font-medium ${
                        emailStatus.exists ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {emailStatus.message}
                      </p>
                    )}
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.5 }}
                  >
                    <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 6 characters"
                        className={`w-full pl-12 pr-14 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 transition-all font-medium shadow-sm ${
                          errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#18005F] bg-gray-50/50'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-2xl transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-xs text-red-600 font-medium">{errors.password}</p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className={`w-full pl-12 pr-14 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 transition-all font-medium shadow-sm ${
                          errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#18005F] bg-gray-50/50'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-2xl transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-xs text-red-600 font-medium">{errors.confirmPassword}</p>
                    )}
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65, duration: 0.5 }}
                  >
                    <label htmlFor="phone_number" className="block text-sm font-bold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#18005F]/20 transition-all font-medium shadow-sm ${
                          errors.phone_number ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#18005F] bg-gray-50/50'
                        }`}
                      />
                    </div>
                    {errors.phone_number && (
                      <p className="mt-2 text-xs text-red-600 font-medium">{errors.phone_number}</p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="flex items-start space-x-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-200"
                  >
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="mt-1 h-5 w-5 text-[#18005F] focus:ring-[#18005F] border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed font-medium">
                      I agree to ADEPTINTERNS' <a href="/terms" className="text-[#18005F] hover:text-[#18005F]/80 font-bold underline">Terms of Service</a> and <a href="/privacy" className="text-[#18005F] hover:text-[#18005F]/80 font-bold underline">Privacy Policy</a>
                    </label>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75, duration: 0.5 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-gradient-to-r from-[#18005F] to-[#18005F]/90 text-white py-4 px-6 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:from-[#18005F]/90 hover:to-[#18005F]'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-3" />
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Sparkles className="h-5 w-5 mr-2" />
                        Create Student Account
                      </div>
                    )}
                  </motion.button>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="text-center"
                  >
                    <p className="text-gray-600 font-medium">
                      Already have an account?{' '}
                      <a href="/login" className="text-[#18005F] hover:text-[#18005F]/80 font-bold underline">
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
    </div>
  );
};

export default StudentRegister;