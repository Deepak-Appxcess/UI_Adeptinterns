import { useState, useEffect } from 'react';
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
    verification_method: 'Email',
    verification_value: '',
    organization_logo: null,
    about_freelancer: ''
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, organization_logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verify Your Identity</h1>
          <p className="text-gray-600 mt-2">Please provide your basic details</p>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              name="first_name"
              value={userData.first_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={userData.last_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={userData.phone_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              disabled={!isEditing}
            />
          </div>

          {errors.saveError && (
            <div className="text-red-600 text-sm py-2 px-3 bg-red-50 rounded-lg">{errors.saveError}</div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
              >
                Edit Details
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                sendOtp();
                setStep(2);
              }}
              disabled={!userData.phone_number}
              className={`w-full py-2 px-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${
                !userData.phone_number 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              }`}
            >
              Verify Phone Number
            </button>
            {errors.otpError && (
              <div className="text-red-600 text-sm mt-2 py-2 px-3 bg-red-50 rounded-lg">{errors.otpError}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verify Your Phone</h1>
          <p className="text-gray-600 mt-2">We've sent a 6-digit code to {userData.phone_number}</p>
        </div>

        <form onSubmit={verifyPhone} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-xl tracking-widest"
              maxLength="6"
              pattern="\d{6}"
              required
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={sendOtp}
              disabled={countdown > 0}
              className={`text-sm ${
                countdown > 0 
                  ? 'text-gray-400' 
                  : 'text-indigo-600 hover:text-indigo-500 font-medium'
              }`}
            >
              Resend Code {countdown > 0 && `(${countdown}s)`}
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
            >
              Verify
            </button>
          </div>

          {errors.otpError && (
            <div className="text-red-600 text-sm py-2 px-3 bg-red-50 rounded-lg">{errors.otpError}</div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-md overflow-hidden">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Complete Your Employer Profile</h1>
        <p className="text-gray-600 mt-2">Fill in your details to get started</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Account Type */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Account Type
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={!formData.is_freelancer}
                onChange={() => setFormData(prev => ({ 
                  ...prev, 
                  is_freelancer: false,
                  // Reset to empty when switching to organization
                  industry: '',
                  no_of_employees: ''
                }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700">Organization</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.is_freelancer}
                onChange={() => setFormData(prev => ({ 
                  ...prev, 
                  is_freelancer: true,
                  // Set defaults when switching to freelancer
                  industry: 'Freelance',
                  no_of_employees: 1
                }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700">Freelancer</span>
            </label>
          </div>
        </div>

        {/* Common fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Designation*
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
            {errors.designation && <p className="mt-1 text-sm text-red-600">{errors.designation}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.is_freelancer ? 'Your Location*' : 'Organization Location*'}
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>
        </div>

        {/* Common fields for both freelancers and organizations */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Industry*
    </label>
    <input
      type="text"
      name="industry"
      value={formData.industry}
      onChange={handleFormChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      required
      placeholder={formData.is_freelancer ? "e.g. Web Development, Design" : "e.g. Tech, Finance"}
    />
    {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {formData.is_freelancer ? 'Team Size*' : 'Number of Employees*'}
    </label>
    <input
      type="number"
      name="no_of_employees"
      value={formData.no_of_employees}
      onChange={(e) => setFormData(prev => ({
        ...prev,
        no_of_employees: parseInt(e.target.value) || (formData.is_freelancer ? 1 : '')
      }))}
      min="1"
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      required
      placeholder={formData.is_freelancer ? "1" : "e.g. 50"}
    />
    {errors.no_of_employees && <p className="mt-1 text-sm text-red-600">{errors.no_of_employees}</p>}
  </div>
</div>

        {/* Organization-specific fields */}
        {!formData.is_freelancer && (
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name*
                </label>
                <input
                  type="text"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
                {errors.organization_name && <p className="mt-1 text-sm text-red-600">{errors.organization_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Description*
                </label>
                <textarea
                  name="organization_description"
                  value={formData.organization_description}
                  onChange={handleFormChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
                {errors.organization_description && <p className="mt-1 text-sm text-red-600">{errors.organization_description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Method*
                  </label>
                  <select
                    name="verification_method"
                    value={formData.verification_method}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                  >
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="Document">Document</option>
                  </select>
                  {errors.verification_method && <p className="mt-1 text-sm text-red-600">{errors.verification_method}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Value*
                  </label>
                  <input
                    type={formData.verification_method === 'Email' ? 'email' : 'text'}
                    name="verification_value"
                    value={formData.verification_value}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                    placeholder={
                      formData.verification_method === 'Email' ? 'hr@company.com' :
                      formData.verification_method === 'Phone' ? '+1234567890' :
                      'Document details'
                    }
                  />
                  {errors.verification_value && <p className="mt-1 text-sm text-red-600">{errors.verification_value}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Logo
                </label>
                <div className="mt-2 flex items-center gap-4">
                  {logoPreview && (
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  )}
                  <div>
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition">
                        Choose File
                      </span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                    {formData.organization_logo && (
                      <p className="mt-1 text-sm text-gray-500">
                        {formData.organization_logo.name}
                      </p>
                    )}
                  </div>
                </div>
                {errors.organization_logo && <p className="mt-1 text-sm text-red-600">{errors.organization_logo}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Freelancer-specific fields */}
        {formData.is_freelancer && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About You*
              </label>
              <textarea
                name="about_freelancer"
                value={formData.about_freelancer}
                onChange={handleFormChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Describe your skills, experience, and services"
                required
              />
              {errors.about_freelancer && <p className="mt-1 text-sm text-red-600">{errors.about_freelancer}</p>}
            </div>
          </div>
        )}

        {errors.non_field_errors && (
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">{errors.non_field_errors}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'Complete Setup'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployerProfileSetup;