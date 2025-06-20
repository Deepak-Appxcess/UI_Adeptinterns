// src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || 
                 sessionStorage.getItem('tempAuthToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 error and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');
        
        const { data } = await axios.post(`${api.defaults.baseURL}/users/token/refresh/`, {
          refresh: refreshToken
        });
        
        // Store the new tokens
        localStorage.setItem('authToken', data.access);
        localStorage.setItem('refreshToken', data.refresh || refreshToken);
        
        // Retry the original request with new token
        api.defaults.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('tempAuthToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Candidate Bio Endpoint ONLY
export const updateCandidateBio = (formData) => {
  return api.patch('/users/profile/candidate/bio/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
};

// Add to api.js
export const setupEmployerProfile = (formData) => {
  return api.patch('/users/profile/employer/setup/', formData, {
    headers: {
      'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json'
    }
  });
};

// ================= Auth API Endpoints =================
export const googleSignIn = (idToken) => api.post('/users/google-signin/', { id_token: idToken });
export const login = (credentials) => api.post('/users/token/', credentials);
export const refreshToken = (refresh) => api.post('/users/token/refresh/', { refresh });
export const verifyToken = (token) => api.post('/users/token/verify/', { token });

// Registration endpoints
export const registerUser = (data) => api.post('/users/register/', data);
export const verifyOTP = (data) => api.post('/users/verify-otp/', data);
export const resendOTP = (data) => api.post('/users/resend-otp/', data);
export const checkEmailExists = (email) => api.post('/users/check-email/', { email });

// ================= User Profile Endpoints =================
export const fetchUserProfile = () => api.get('/users/profile/');
export const updateUserProfile = (data) => api.put('/users/profile/', data);

// ================= Candidate (Student) Endpoints =================
export const fetchCandidateProfile = () => api.get('/users/candidate/profile/');
export const updateCandidatePreferences = (data) => api.patch('/users/profile/candidate/preferences/', data);
export const fetchAppliedJobs = () => api.get('/users/candidate/applications/jobs/');
export const fetchAppliedInternships = () => api.get('/users/candidate/applications/internships/');
// Add to src/services/api.js
export const fetchCandidateApplications = () => {
  return api.get('/jobs/candidate/applications/');
};
// Resume Endpoints
export const getCandidateResume = () => {
  return api.get('/jobs/candidate/resume/');
};
// Add to src/services/api.js
export const fetchRecentActivity = () => {
  return api.get('/jobs/candidate/recent-activity/');
};
export const createOrUpdateCandidateResume = (data) => {
  return api.patch('/jobs/candidate/resume/', data);
};

export const deleteCandidateResume = () => {
  return api.delete('/jobs/candidate/resume/');
  
};
// ================= Employer Endpoints =================
export const fetchEmployerProfile = () => api.get('/users/employer/profile/');
export const fetchMyInternships = () => api.get('/users/dashboard/employer/');
export const fetchMyJobs = () => api.get('/users/dashboard/employer/');
export const createJobPosting = (data) => api.post('/jobs/create/', data);
export const createInternship = (data) => api.post('/jobs/internship/create/', data);
export const updateJobPosting = (id, data) => api.patch(`/jobs/update/${id}/`, data);
export const fetchJobDetails = (id) => api.get(`/jobs/${id}/`);
export const updateInternship = (id, data) => api.patch(`/jobs/internship/update/${id}/`, data);
export const fetchInternshipDetails = (id) => api.get(`/jobs/internship/${id}/`);
// In services/api.js
export const fetchApplications = (params = {}) => {
  // Validate that either job_id or internship_id is provided when not fetching all
  if (!params.job_id && !params.internship_id && !params.view_all) {
    throw new Error('Either job_id or internship_id must be provided.');
  }
  return api.get('/jobs/employer/applications/', { params });
};

// Fetch single application details
export const fetchApplicationDetails = (applicationId) => {
  return api.get(`/jobs/employer/applications/${applicationId}/`);
};

// Update application status
export const updateApplicationStatus = (applicationId, data) => {
  return api.patch(`/jobs/applications/${applicationId}/status/`, data);
};
// ================= Password Change Endpoint =================
export const changePassword = (data) => api.patch('/users/profile/update/', data);

// ================= Phone Verification Endpoints =================
export const checkPhoneVerification = (data) => {
  return api.post('/users/check-phone-verification/', data);
};

export const resendPhoneOTP = (data) => {
  return api.post('/users/resend-phone-otp/', data);
};

export const verifyPhoneOTP = (data) => {
  return api.post('/users/verify-phone-otp/', data);
};

// ================= Course Endpoints =================
export const fetchCourses = (query = '') => {
  const url = query 
    ? `/adept/search?query=${encodeURIComponent(query)}`
    : '/users/adept/';
  return api.get(url);
};

export const fetchCourseById = (id) => api.get(`/adept/${id}/`);
export const fetchCourseImage = (id) => api.get(`/adept/${id}/image/`, {
  responseType: 'blob'
});

export const createCourse = (data) => {
  const formData = new FormData();
  formData.append('content', data.content);
  formData.append('price', data.price);
  if (data.image) {
    formData.append('image', data.image);
  }
  return api.post('/users/adept/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const updateCourse = (id, data) => api.patch(`/adept/${id}/`, data);
export const deleteCourse = (id) => api.delete(`/adept/${id}/`);

// ================= Auth Endpoints =================
export const logout = (data) => api.post('/users/logout/', data);
export const updateProfile = (data) => {
  return api.patch('/users/profile/update/', data);
};

// ================= Jobs/Internships Endpoints =================
export const fetchFilteredJobs = (params) => {
  return api.get('/jobs/filtered/', { params });
};

// ================= Job Application Endpoints =================
export const applyForJob = (jobId, data) => {
  return api.post(`/jobs/${jobId}/apply/`, data);
};

export const applyForInternship = (internshipId, data) => {
  return api.post(`/jobs/internship/${internshipId}/apply/`, data);
};

export default api;