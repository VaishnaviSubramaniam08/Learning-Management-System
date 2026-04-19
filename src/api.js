import axios from "axios";

// Determine the base URL for API calls
const getBaseURL = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  if (process.env.NODE_ENV === 'production') {
    return "http://localhost:5000/api";
  }
  
  // In development, use proxy
  return "/api";
};

const baseURL = getBaseURL();
console.log('🔧 API Configuration - Base URL:', baseURL);
console.log('🔧 API Configuration - Environment:', process.env.NODE_ENV);

const api = axios.create({
  baseURL: baseURL,
  timeout: 45000, // 45 second timeout for AI requests
});

// Token management utility
const getAuthToken = () => {
  // Try multiple possible token keys for compatibility
  return localStorage.getItem('authToken') ||
         localStorage.getItem('token') ||
         sessionStorage.getItem('authToken') ||
         sessionStorage.getItem('token');
};

const setAuthToken = (token) => {
  if (token) {
    // Store in both localStorage and set in axios defaults
    localStorage.setItem('authToken', token);
    localStorage.setItem('token', token); // For backward compatibility
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('🔧 Token set in storage and axios defaults');
  }
};

const clearAuthToken = () => {
  // Clear all possible token storage locations
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
  console.log('🧹 All tokens cleared');
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    console.log('🔍 API Debug - Request URL:', config.url);
    console.log('🔍 API Debug - Request method:', config.method);
    console.log('🔍 API Debug - Token exists:', !!token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔍 API Debug - Token added to headers');
      console.log('🔍 API Debug - Authorization header:', config.headers.Authorization.substring(0, 30) + '...');
    } else {
      console.log('⚠️ API Debug - No token found in any storage location');
      console.log('🔍 API Debug - Checking storage locations:');
      console.log('  - localStorage.authToken:', !!localStorage.getItem('authToken'));
      console.log('  - localStorage.token:', !!localStorage.getItem('token'));
      console.log('  - sessionStorage.authToken:', !!sessionStorage.getItem('authToken'));
      console.log('  - sessionStorage.token:', !!sessionStorage.getItem('token'));
    }
    return config;
  },
  (error) => {
    console.error('❌ API Debug - Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Debug - Response success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Debug - Response error:', error.response?.status, error.config?.url);
    console.error('❌ API Debug - Error message:', error.response?.data);
    console.error('❌ API Debug - Full error:', error);
    
    // Handle specific error cases
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.error('🚨 API Debug - Backend server is not running or not accessible');
      console.error('🚨 API Debug - Check if backend is running on port 5000');
    }
    
    if (error.response?.status === 404) {
      console.error('🚨 API Debug - 404 Error Details:');
      console.error('  - Requested URL:', error.config?.url);
      console.error('  - Full URL:', error.config?.baseURL + error.config?.url);
      console.error('  - Method:', error.config?.method);
      console.error('  - Base URL:', baseURL);
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('⚠️ API Debug - Authentication error, clearing tokens');
      clearAuthToken();
      localStorage.removeItem('user');

      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Export token management functions
export { getAuthToken, setAuthToken, clearAuthToken };
export default api;
