// src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://6cde-103-186-151-195.ngrok-free.app/api/users',
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
        
        const { data } = await axios.post(`${api.defaults.baseURL}/token/refresh/`, {
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

// ================= Auth API Endpoints =================
export const login = (credentials) => api.post('/token/', credentials);
export const refreshToken = (refresh) => api.post('/token/refresh/', { refresh });
export const verifyToken = (token) => api.post('/token/verify/', { token });

// Registration endpoints
export const registerUser = (data) => api.post('/register/', data);
export const verifyOTP = (data) => api.post('/verify-otp/', data);
export const resendOTP = (data) => api.post('/send-otp/', data);
export const checkEmailExists = (email) => api.post('/check-email/', { email });

// ================= User Profile Endpoints =================
export const fetchUserProfile = () => api.get('/profile/');
export const updateUserProfile = (data) => api.put('/profile/', data);

// ================= Candidate (Student) Endpoints =================
export const fetchCandidateProfile = () => api.get('/candidate/profile/');
export const updateCandidateBio = (data) => api.put('/candidate/bio/', data);
export const updateCandidatePreferences = (data) => api.put('/candidate/preferences/', data);
export const fetchAppliedJobs = () => api.get('/candidate/applications/jobs/');
export const fetchAppliedInternships = () => api.get('/candidate/applications/internships/');

// ================= Employer Endpoints =================
export const fetchEmployerProfile = () => api.get('/employer/profile/');
export const fetchMyInternships = () => api.get('/employer/my-internships/');
export const fetchMyJobs = () => api.get('/employer/my-jobs/');
export const createInternship = (data) => api.post('/employer/post-internship/', data);
export const createJob = (data) => api.post('/employer/post-job/', data);

// ================= Course Endpoints =================
export const fetchCourses = (query = '') => {
  const url = query 
    ? `/adept/search?query=${encodeURIComponent(query)}`
    : '/adept/';
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
  return api.post('/adept/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const updateCourse = (id, data) => api.patch(`/adept/${id}/`, data);
export const deleteCourse = (id) => api.delete(`/adept/${id}/`);

export default api;