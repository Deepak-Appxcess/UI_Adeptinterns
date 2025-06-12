import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import EmployeeBio from './EmployeeBio';

const EmployerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [editingOrgInfo, setEditingOrgInfo] = useState(false);
  const [editingFreelancerInfo, setEditingFreelancerInfo] = useState(false);
  
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto pt-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Employer Dashboard</h1>
        
        {/* Personal Information Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <button
              onClick={() => {
                setEditingPersonalInfo(!editingPersonalInfo);
                setUpdateError(null);
                setUpdateSuccess(false);
              }}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              {editingPersonalInfo ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingPersonalInfo ? (
            <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name*</label>
                  <input
                    type="text"
                    name="first_name"
                    value={personalInfoFormData.first_name}
                    onChange={handlePersonalInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name*</label>
                  <input
                    type="text"
                    name="last_name"
                    value={personalInfoFormData.last_name}
                    onChange={handlePersonalInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={personalInfoFormData.phone_number}
                    onChange={handlePersonalInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., +12025550123"
                  />
                </div>
              </div>

              {updateError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                  <p>{updateError}</p>
                </div>
              )}

              {updateSuccess && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                  <p>Personal information updated successfully!</p>
                </div>
              )}

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPersonalInfo(false);
                    setUpdateError(null);
                    setUpdateSuccess(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={updateLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600">First Name</p>
                <p className="font-medium">{profile.first_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-600">Last Name</p>
                <p className="font-medium">{profile.last_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone Number</p>
                <p className="font-medium">{profile.phone_number || 'Not provided'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Completion Section */}
        {!profile.has_completed_organization && !profile.has_completed_freelancer_details ? (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Complete Your Employer Profile</h2>
              <p className="text-gray-600">Please complete your organization details to continue</p>
            </div>
            <EmployeeBio onComplete={handleProfileComplete} />
          </div>
        ) : profile.has_completed_freelancer_details ? (
          // Freelancer profile view
          <div className="bg-white shadow rounded-lg p-6 mb-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Freelancer Information</h2>
              <button
                onClick={() => {
                  setEditingFreelancerInfo(!editingFreelancerInfo);
                  setUpdateError(null);
                  setUpdateSuccess(false);
                }}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                {editingFreelancerInfo ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            {editingFreelancerInfo ? (
              <form onSubmit={handleFreelancerInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Designation*</label>
                    <input
                      type="text"
                      name="designation"
                      value={freelancerInfoFormData.designation}
                      onChange={handleFreelancerInfoChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location*</label>
                    <input
                      type="text"
                      name="city"
                      value={freelancerInfoFormData.city}
                      onChange={handleFreelancerInfoChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Industry*</label>
                    <input
                      type="text"
                      name="industry"
                      value={freelancerInfoFormData.industry}
                      onChange={handleFreelancerInfoChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Team Size*</label>
                    <input
                      type="number"
                      name="no_of_employees"
                      value={freelancerInfoFormData.no_of_employees}
                      onChange={handleFreelancerInfoChange}
                      min="1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">About You*</label>
                    <textarea
                      name="about_freelancer"
                      value={freelancerInfoFormData.about_freelancer}
                      onChange={handleFreelancerInfoChange}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                {updateError && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>{updateError}</p>
                  </div>
                )}

                {updateSuccess && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                    <p>Freelancer information updated successfully!</p>
                  </div>
                )}

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFreelancerInfo(false);
                      setUpdateError(null);
                      setUpdateSuccess(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={updateLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              profile.employer_profile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600">Designation</p>
                    <p className="font-medium">{profile.employer_profile.designation}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Location</p>
                    <p className="font-medium">{profile.employer_profile.city}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Industry</p>
                    <p className="font-medium">{profile.employer_profile.industry}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Team Size</p>
                    <p className="font-medium">{profile.employer_profile.no_of_employees}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-600">About</p>
                    <p className="font-medium">{profile.employer_profile.about_freelancer}</p>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          // Organization profile view
          <div className="bg-white shadow rounded-lg p-6 mb-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Organization Information</h2>
              <button
                onClick={() => {
                  setEditingOrgInfo(!editingOrgInfo);
                  setUpdateError(null);
                  setUpdateSuccess(false);
                }}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                {editingOrgInfo ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editingOrgInfo ? (
              <form onSubmit={handleOrgInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization Name*</label>
                    <input
                      type="text"
                      name="organization_name"
                      value={orgInfoFormData.organization_name}
                      onChange={handleOrgInfoChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Your Designation*</label>
                    <input
                      type="text"
                      name="designation"
                      value={orgInfoFormData.designation}
                      onChange={handleOrgInfoChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Organization Description*</label>
                    <textarea
                      name="organization_description"
                      value={orgInfoFormData.organization_description}
                      onChange={handleOrgInfoChange}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location*</label>
                    <input
                      type="text"
                      name="city"
                      value={orgInfoFormData.city}
                      onChange={handleOrgInfoChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Industry*</label>
                    <input
                      type="text"
                      name="industry"
                      value={orgInfoFormData.industry}
                      onChange={handleOrgInfoChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Employees*</label>
                    <input
                      type="number"
                      name="no_of_employees"
                      value={orgInfoFormData.no_of_employees}
                      onChange={handleOrgInfoChange}
                      min="1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Verification Method*</label>
                    <select
                      name="verification_method"
                      value={orgInfoFormData.verification_method}
                      onChange={handleOrgInfoChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                      <option value="Document">Document</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Verification Value*</label>
                    <input
                      type={orgInfoFormData.verification_method === 'Email' ? 'email' : 'text'}
                      name="verification_value"
                      value={orgInfoFormData.verification_value}
                      onChange={handleOrgInfoChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                      placeholder={
                        orgInfoFormData.verification_method === 'Email' ? 'hr@company.com' :
                        orgInfoFormData.verification_method === 'Phone' ? '+1234567890' :
                        'Document details'
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Organization Logo</label>
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
                            onChange={handleOrgFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {updateError && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>{updateError}</p>
                  </div>
                )}

                {updateSuccess && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                    <p>Organization information updated successfully!</p>
                  </div>
                )}

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingOrgInfo(false);
                      setUpdateError(null);
                      setUpdateSuccess(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={updateLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              profile.employer_profile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.employer_profile.organization_logo_url && (
                    <div className="md:col-span-2">
                      <img 
                        src={profile.employer_profile.organization_logo_url} 
                        alt="Organization Logo" 
                        className="h-32 w-32 object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Organization Name</p>
                    <p className="font-medium">{profile.employer_profile.organization_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Designation</p>
                    <p className="font-medium">{profile.employer_profile.designation}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-600">Description</p>
                    <p className="font-medium">{profile.employer_profile.organization_description}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Location</p>
                    <p className="font-medium">{profile.employer_profile.city}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Industry</p>
                    <p className="font-medium">{profile.employer_profile.industry}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Employees</p>
                    <p className="font-medium">{profile.employer_profile.no_of_employees}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Verification Method</p>
                    <p className="font-medium">{profile.employer_profile.verification_method}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Verification Value</p>
                    <p className="font-medium">{profile.employer_profile.verification_value}</p>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Quick Actions Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-lg"
              onClick={() => navigate('/employer/jobs')}
            >
              Manage Jobs
            </button>
            <button 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg"
              onClick={() => navigate('/employer/internships')}
            >
              Manage Internships  
            </button>
            <button 
              className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg"
              onClick={() => navigate('/profile')}
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;