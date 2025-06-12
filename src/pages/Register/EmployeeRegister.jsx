import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, X, Mail, User, Phone, ArrowLeft, Check } from 'lucide-react';
import { checkEmailExists, registerUser, verifyOTP, resendOTP } from '../../services/api';

const EmployeeRegister = () => {
  const [emailStatus, setEmailStatus] = useState({
    loading: false,
    exists: null,
    message: ''
  });

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

      // Store tokens in memory (not localStorage)
       localStorage.setItem('authToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);

      // Redirect to dashboard
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        {showOtpForm ? (
          <>
            <button
              onClick={handleBackToRegister}
              className="flex items-center text-gray-600 hover:text-purple-600 mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to registration
            </button>
            
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Verify your email</h2>
            <p className="text-center text-gray-600 mb-6">
              One Time Password (OTP) has been sent on<br />
              <span className="font-medium">{formData.email}</span>
            </p>
            
            {otpResent && (
              <div className="mb-4 p-2 bg-green-100 text-green-700 text-sm rounded text-center">
                OTP has been resent successfully
              </div>
            )}
            
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter 6 digit OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="123456"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    otpError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={6}
                />
                {otpError && (
                  <p className="mt-1 text-sm text-red-600">{otpError}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || otp.length !== 6}
                className={`w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  isSubmitting || otp.length !== 6 ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Verifying...' : 'Verify Email'}
              </button>
              
              <div className="text-center text-sm text-gray-600">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendDisabled}
                  className={`text-purple-600 hover:underline ${
                    resendDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {resendDisabled ? `Resend OTP (${resendTimer}s)` : 'Resend OTP'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Employer Registration</h2>
            
            {apiError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {apiError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="Your first name"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.first_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Your last name"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.last_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        className={`w-full px-3 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.email ? 'border-red-500' : 
                          emailStatus.exists === true ? 'border-red-500' : 
                          emailStatus.exists === false ? 'border-green-500' : 'border-gray-300'
                        }`}
                      />
                      {emailStatus.loading && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      )}
                      {!emailStatus.loading && emailStatus.exists !== null && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          {emailStatus.exists ? (
                            <X className="h-5 w-5 text-red-500" />
                          ) : (
                            <Check className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                    {emailStatus.message && !errors.email && (
                      <p className={`mt-1 text-sm ${
                        emailStatus.exists ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {emailStatus.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 6 characters"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        placeholder="Enter phone number with country code"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.phone_number ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.phone_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the <a href="/terms" className="text-purple-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</a>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Registering...' : 'Register Now'}
                </button>
              </div>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-purple-600 hover:underline">
                  Log in
                </a>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeRegister;