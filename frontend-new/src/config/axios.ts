import axios from 'axios';
import { toast } from 'react-toastify';

// Set base URL for all requests
const baseURL = 'http://localhost:5001/api';

const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

// Add request interceptor
instance.interceptors.request.use(
  (config) => {
    // Log the request
    console.log('📤 Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });

    // Add auth token if available
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
          console.log('🔑 Added token to request');
        }
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
instance.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('❌ Response Error:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
        message: error.message
      });

      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        console.log('🔒 Unauthorized - clearing user data');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Session expired. Please log in again.');
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('❌ Network Error:', {
        url: error.config?.url,
        message: 'No response received from server'
      });
      toast.error('Network error. Please check your connection.');
    } else {
      // Error in request configuration
      console.error('❌ Request Configuration Error:', {
        message: error.message
      });
    }
    return Promise.reject(error);
  }
);

export default instance;