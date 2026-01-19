import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('🚀 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ Response:', {
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      console.error('❌ Response Error:', {
        status,
        message: data?.message || error.message,
      });
      
      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
          
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden');
          break;
          
        case 404:
          // Not found
          console.error('Resource not found');
          break;
          
        case 422:
          // Validation error
          console.error('Validation error:', data?.errors);
          break;
          
        case 500:
          // Server error
          console.error('Server error');
          break;
          
        default:
          console.error('Unknown error occurred');
      }
      
      // Return formatted error
      return Promise.reject({
        status,
        message: data?.message || 'An error occurred',
        errors: data?.errors || null,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ Network Error:', error.message);
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
        errors: null,
      });
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
        errors: null,
      });
    }
  }
);

// Helper methods for common HTTP methods
export const apiService = {
  // GET request
  get: (url, config = {}) => api.get(url, config),
  
  // POST request
  post: (url, data, config = {}) => api.post(url, data, config),
  
  // PUT request
  put: (url, data, config = {}) => api.put(url, data, config),
  
  // PATCH request
  patch: (url, data, config = {}) => api.patch(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => api.delete(url, config),
  
  // Upload file with progress
  upload: (url, formData, onProgress) => {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
  
  // Download file
  download: (url, filename) => {
    return api.get(url, {
      responseType: 'blob',
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  },
};

// Export axios instance for advanced usage
export default api;
