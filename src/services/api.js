// src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: 'https://03df-2401-4900-8826-5329-8985-f5e9-e3a4-aff3.ngrok-free.app/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
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
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const login = (credentials) => api.post('/token/', credentials);
export const refreshToken = (refresh) => api.post('/token/refresh/', { refresh });
export const verifyToken = (token) => api.post('/token/verify/', { token });

// Course API endpoints
export const fetchCourses = (query = '') => {
  const url = query 
    ? `/adept/search?query=${encodeURIComponent(query)}`
    : '/adept/';
  return api.get(url);
};

export const fetchCourseById = (id) => api.get(`/adept/${id}`);
export const fetchCourseImage = (id) => api.get(`/adept/${id}/image`, {
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

export const updateCourse = (id, data) => api.patch(`/adept/${id}`, data);
export const deleteCourse = (id) => api.delete(`/adept/${id}`);

// Employee API endpoints
export const fetchMyInternships = () => api.get('/employee/my-internships');
export const fetchMyJobs = () => api.get('/employee/my-jobs');

export const createInternship = (data) => api.post('/employee/post-internship', data);
export const updateInternship = (id, data) => api.put(`/employee/my-internships/${id}`, data);
export const deleteInternship = (id) => api.delete(`/employee/my-internships/${id}`);

export const createJob = (data) => api.post('/employee/post-job', data);
export const updateJob = (id, data) => api.put(`/employee/post-job/${id}`, data);
export const deleteJob = (id) => api.delete(`/employee/post-job/${id}`);

// Student API endpoints
export const fetchStudentProfile = () => api.get('/student/profile');
export const updateStudentProfile = (data) => api.put('/student/profile', data);
export const fetchAppliedJobs = () => api.get('/student/applications/jobs');
export const fetchAppliedInternships = () => api.get('/student/applications/internships');


// Add to your existing api.js
// Add to src/services/api.js
export const checkEmailExists = (email) => api.post('/users/check-email/', { email });

export default api;