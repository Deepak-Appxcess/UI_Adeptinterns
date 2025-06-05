import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2,X,Mail, User, Phone, ArrowLeft, Building, MapPin, Users, Globe, FileText, Check, Briefcase } from 'lucide-react';
import { checkEmailExists } from '../../services/api'; // Import the function

const EmployeeRegister = () => {

   const [emailStatus, setEmailStatus] = useState({
    loading: false,
    exists: null,
    message: ''
  });

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    contact_number: '',
    designation: '',
    organization_name: '',
    organization_description: '',
    organization_city: '',
    industry: '',
    no_of_employees: '',
    verification_method: '',
    verification_value: '',
    verification_document: null,
    isFreelancer: false,
    current_city: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [documentPreview, setDocumentPreview] = useState('');
  
  // OTP states
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpResent, setOtpResent] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const navigate = useNavigate();
  const API_BASE = "https://03df-2401-4900-8826-5329-8985-f5e9-e3a4-aff3.ngrok-free.app/api";

  // Industry options
  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Real Estate',
    'Hospitality',
    'Other'
  ];

  // Employee size options
  const employeeSizes = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+'
  ];


  // Verification methods
  const verificationMethods = [
    { id: 'website', label: 'Organization\'s website', icon: <Globe className="h-5 w-5 mr-2" /> },
    { id: 'social', label: 'Active social media page', icon: <Users className="h-5 w-5 mr-2" /> },
    { id: 'documents', label: 'Official company documents', icon: <FileText className="h-5 w-5 mr-2" /> },
    { id: 'none', label: 'I have none of the above', icon: <Check className="h-5 w-5 mr-2" /> }
  ];

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
    newErrors.email = 'Official Email ID is required';
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
    if (!formData.contact_number.trim()) {
      newErrors.contact_number = 'Mobile Number is required';
    } else if (!/^[0-9]{10}$/.test(formData.contact_number)) {
      newErrors.contact_number = 'Please enter a valid 10-digit number';
    }
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!formData.current_city.trim()) newErrors.current_city = 'Current city is required';
    
    if (!formData.isFreelancer) {
      if (!formData.organization_name.trim()) newErrors.organization_name = 'Organization name is required';
      if (!formData.organization_city.trim()) newErrors.organization_city = 'Organization city is required';
      if (!formData.industry) newErrors.industry = 'Industry is required';
      if (!formData.no_of_employees) newErrors.no_of_employees = 'Number of employees is required';
      if (!formData.verification_method) newErrors.verification_method = 'Verification method is required';
      
      if (formData.verification_method === 'website' && !formData.verification_value) {
        newErrors.verification_value = 'Website URL is required';
      }
      if (formData.verification_method === 'social' && !formData.verification_value) {
        newErrors.verification_value = 'Social media URL is required';
      }
      if (formData.verification_method === 'documents' && !formData.verification_document) {
        newErrors.verification_document = 'Document is required';
      }
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

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB
      setErrors(prev => ({
        ...prev,
        organization_logo: 'File size must be less than 1MB'
      }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setLogoFile(file);
  };



  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        verification_document: 'File must be PDF, JPEG, JPG, or PNG'
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setErrors(prev => ({
        ...prev,
        verification_document: 'File size must be less than 5MB'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      verification_document: file
    }));

    if (file.type.includes('image')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setDocumentPreview('');
    }

    if (errors.verification_document) {
      setErrors(prev => ({
        ...prev,
        verification_document: ''
      }));
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (otpError) setOtpError('');
  };

// In your handleRegisterSubmit function:
const handleRegisterSubmit = async (e) => {
  e.preventDefault();
  setApiError('');
  
  if (!validateForm()) return;

  setIsSubmitting(true);

   // Additional check in case the async validation hasn't completed
  if (emailStatus.loading) {
    setApiError('Please wait while we validate your email');
    return;
  }
  
  if (emailStatus.exists === true) {
    setApiError('This email is already registered');
    return;
  }
  
  try {
    const formPayload = new FormData();
    // Append all form fields
    formPayload.append('email', formData.email);
    formPayload.append('password', formData.password);
    formPayload.append('first_name', formData.first_name);
    formPayload.append('last_name', formData.last_name);
    formPayload.append('contact_number', formData.contact_number);
    formPayload.append('designation', formData.designation);
    formPayload.append('current_city', formData.current_city);
    formPayload.append('isFreelancer', formData.isFreelancer);
    formPayload.append('role', 'employer');

    // Append organization data if not freelancer
    if (!formData.isFreelancer) {
      formPayload.append('organization_name', formData.organization_name);
      formPayload.append('organization_description', formData.organization_description);
      formPayload.append('organization_city', formData.organization_city);
      formPayload.append('industry', formData.industry);
      formPayload.append('no_of_employees', formData.no_of_employees);
      formPayload.append('verification_method', formData.verification_method);
      
      if (logoFile) {
        formPayload.append('organization_logo', logoFile);
      }
      
      if (formData.verification_method === 'website' || formData.verification_method === 'social') {
        formPayload.append('verification_value', formData.verification_value);
      } else if (formData.verification_method === 'documents' && formData.verification_document) {
        formPayload.append('verification_document', formData.verification_document);
      }
    }

    // Debug: Log form data before sending
    for (let [key, value] of formPayload.entries()) {
      console.log(key, value);
    }

    const response = await axios.post(`${API_BASE}/users/`, formPayload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Handle successful registration
    if (response.status === 200 || response.status === 201) {
      setShowOtpForm(true);
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (error.response) {
      // Handle field-specific errors
      if (error.response.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Handle object-style errors
          const fieldErrors = {};
          Object.entries(errorData).forEach(([field, messages]) => {
            fieldErrors[field] = Array.isArray(messages) ? messages.join(', ') : messages;
          });
          setErrors(fieldErrors);
        } else {
          // Handle string error messages
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

// In your handleOtpSubmit function:
const handleOtpSubmit = async (e) => {
  e.preventDefault();
  
  if (otp.length !== 6) {
    setOtpError('Please enter a 6-digit OTP');
    return;
  }

  setIsSubmitting(true);
  
  try {
    const response = await axios.post(
      `${API_BASE}/users/verify-otp/`,
      {
        email: formData.email,
        otp
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.detail === 'User verified successfully.') {
      // Redirect to login or dashboard after successful verification
      navigate('/login', {
        state: { message: 'Registration successful! Please log in.' }
      });
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    if (error.response) {
      setOtpError(error.response.data.detail || 
                 error.response.data.message || 
                 'Invalid or expired OTP');
    } else {
      setOtpError('Network error. Please check your connection.');
    }
  } finally {
    setIsSubmitting(false);
  }
};

// In your handleResendOtp function:
const handleResendOtp = async () => {
  try {
    setResendDisabled(true);
    const response = await axios.post(
      `${API_BASE}/users/send-otp/`,
      {
        email: formData.email
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 200 || response.status === 201) {
      setOtpResent(true);
      setTimeout(() => setOtpResent(false), 3000);
    }
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


  useEffect(() => {
    const validateEmail = async () => {
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setEmailStatus({ loading: false, exists: null, message: '' });
        return;
      }

      setEmailStatus({ loading: true, exists: null, message: '' });
      
      try {
        const { data } = await checkEmailExists(formData.email);
        setEmailStatus({
          loading: false,
          exists: data.exists,
          message: data.exists 
            ? 'This email is already registered' 
            : 'Email is available'
        });
      } catch (error) {
        setEmailStatus({
          loading: false,
          exists: null,
          message: 'Error checking email'
        });
      }
    };

    // Add debounce to prevent excessive API calls
    const timer = setTimeout(() => {
      validateEmail();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email]);

  // Modify your email input field to show the status
  

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
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
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Employee Registration</h2>
            
            {apiError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {apiError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Personal Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Official Email ID
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
                      placeholder="name@company.com"
                      className={`w-full px-3 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.email ? 'border-red-500' : 
                        emailStatus.exists === true ? 'border-red-500' : 
                        emailStatus.exists === false ? 'border-green-500' : 'border-gray-300'
                      }`}
                      onBlur={() => {
                        if (!formData.email) {
                          setErrors(prev => ({ ...prev, email: 'Official Email ID is required' }));
                        }
                      }}
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
                    <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                          +91
                        </span>
                        <input
                          type="tel"
                          id="contact_number"
                          name="contact_number"
                          value={formData.contact_number}
                          onChange={handleChange}
                          placeholder="Enter mobile number"
                          maxLength="10"
                          className={`flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            errors.contact_number ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                    {errors.contact_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.contact_number}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                      Designation
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="designation"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="Your position"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.designation ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.designation && (
                      <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="current_city" className="block text-sm font-medium text-gray-700 mb-1">
                      Current City
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="current_city"
                        name="current_city"
                        value={formData.current_city}
                        onChange={handleChange}
                        placeholder="Your current city"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.current_city ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.current_city && (
                      <p className="mt-1 text-sm text-red-600">{errors.current_city}</p>
                    )}
                  </div>

                </div>

              
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Employment Type</h3>
                
                <div className="flex items-center mb-4">
                  <input
                    id="isFreelancer"
                    name="isFreelancer"
                    type="checkbox"
                    checked={formData.isFreelancer}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFreelancer" className="ml-2 block text-sm text-gray-700">
                    I am an independent practitioner (freelancer, architect, lawyer etc.) hiring for myself and I am NOT hiring on behalf of a company.
                  </label>
                </div>
                
                {!formData.isFreelancer && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="organization_name" className="block text-sm font-medium text-gray-700 mb-1">
                          Organization Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="organization_name"
                            name="organization_name"
                            value={formData.organization_name}
                            onChange={handleChange}
                            placeholder="Your organization name"
                            className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              errors.organization_name ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {errors.organization_name && (
                          <p className="mt-1 text-sm text-red-600">{errors.organization_name}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="organization_city" className="block text-sm font-medium text-gray-700 mb-1">
                          Organization City
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="organization_city"
                            name="organization_city"
                            value={formData.organization_city}
                            onChange={handleChange}
                            placeholder="e.g. Mumbai"
                            className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              errors.organization_city ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {errors.organization_city && (
                          <p className="mt-1 text-sm text-red-600">{errors.organization_city}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="organization_description" className="block text-sm font-medium text-gray-700 mb-1">
                        Organization Description
                      </label>
                      <textarea
                        id="organization_description"
                        name="organization_description"
                        value={formData.organization_description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Brief description about your organization"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.organization_description ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                          Industry
                        </label>
                        <select
                          id="industry"
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            errors.industry ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select industry</option>
                          {industries.map(industry => (
                            <option key={industry} value={industry}>{industry}</option>
                          ))}
                        </select>
                        {errors.industry && (
                          <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="no_of_employees" className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Employees
                        </label>
                        <select
                          id="no_of_employees"
                          name="no_of_employees"
                          value={formData.no_of_employees}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            errors.no_of_employees ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select an option</option>
                          {employeeSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        {errors.no_of_employees && (
                          <p className="mt-1 text-sm text-red-600">{errors.no_of_employees}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization Logo (Recommended)
                      </label>
                      <div className="flex items-center">
                        <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-full cursor-pointer bg-gray-50 hover:bg-gray-100">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo preview" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                          )}
                          <input id="organization_logo" name="organization_logo" type="file" className="hidden" onChange={handleLogoChange} accept="image/*" />
                        </label>
                        <div className="ml-4 text-sm text-gray-500">
                          <p>Max file size: 1MB</p>
                          <p>Max resolution: 500px × 500px</p>
                          <p>File types: JPEG, JPG, PNG, GIF, BMP</p>
                        </div>
                      </div>
                      {errors.organization_logo && (
                        <p className="mt-1 text-sm text-red-600">{errors.organization_logo}</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {!formData.isFreelancer && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Organization Verification</h3>
                  <p className="text-sm text-gray-600">
                    Using any one of the options below, get your organization verified and start posting internships/jobs
                  </p>
                  
                  <div className="space-y-3">
                    {verificationMethods.map(method => (
                                            <div key={method.id} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`verification_method_${method.id}`}
                            name="verification_method"
                            type="radio"
                            checked={formData.verification_method === method.id}
                            onChange={() => setFormData(prev => ({
                              ...prev,
                              verification_method: method.id,
                              verification_value: '',
                              verification_document: null
                            }))}
                            className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300"
                          />
                        </div>
                        <label htmlFor={`verification_method_${method.id}`} className="ml-3 flex items-center">
                          {method.icon}
                          <span className="block text-sm text-gray-700">{method.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>

                  {errors.verification_method && (
                    <p className="mt-1 text-sm text-red-600">{errors.verification_method}</p>
                  )}

                  {formData.verification_method === 'website' && (
                    <div>
                      <label htmlFor="verification_value" className="block text-sm font-medium text-gray-700 mb-1">
                        Organization Website URL
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="url"
                          id="verification_value"
                          name="verification_value"
                          value={formData.verification_value}
                          onChange={handleChange}
                          placeholder="https://yourcompany.com"
                          className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            errors.verification_value ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.verification_value && (
                        <p className="mt-1 text-sm text-red-600">{errors.verification_value}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Your email domain should match your website domain
                      </p>
                    </div>
                  )}

                  {formData.verification_method === 'social' && (
                    <div>
                      <label htmlFor="verification_value" className="block text-sm font-medium text-gray-700 mb-1">
                        Social Media Page URL
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="url"
                          id="verification_value"
                          name="verification_value"
                          value={formData.verification_value}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/company/yourcompany"
                          className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            errors.verification_value ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.verification_value && (
                        <p className="mt-1 text-sm text-red-600">{errors.verification_value}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Accepted: LinkedIn, Facebook, Twitter, Instagram with at least 100 followers
                      </p>
                    </div>
                  )}

                  {formData.verification_method === 'documents' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Official Document
                      </label>
                      <div className="mt-1 flex items-center">
                        <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          {documentPreview ? (
                            formData.verification_document?.type === 'application/pdf' ? (
                              <div className="flex flex-col items-center">
                                <FileText className="h-12 w-12 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-700">{formData.verification_document.name}</span>
                              </div>
                            ) : (
                              <img src={documentPreview} alt="Document preview" className="h-32 object-contain" />
                            )
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                              </svg>
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF, JPEG, JPG, PNG (Max 5MB)
                              </p>
                            </div>
                          )}
                          <input 
                            id="verification_document" 
                            name="verification_document" 
                            type="file" 
                            className="hidden" 
                            onChange={handleDocumentChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                        </label>
                      </div>
                      {errors.verification_document && (
                        <p className="mt-1 text-sm text-red-600">{errors.verification_document}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Accepted: GST certificate, Trade license, Incorporation certificate, PAN card
                      </p>
                    </div>
                  )}

                  {formData.verification_method === 'none' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-700">
                        Without verification, you'll only be able to post unpaid internships. 
                        To post jobs and paid internships, please provide verification later in your dashboard.
                      </p>
                    </div>
                  )}
                </div>
              )}

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
                        