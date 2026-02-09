/**
 * Axios Configuration
 * 
 * Global axios configuration with network error handling
 */

import axios from 'axios';
import { getErrorMessage, isNetworkError } from '@/utils/networkError';

// Create axios instance with default config
const axiosInstance = axios.create({
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors globally
    if (isNetworkError(error)) {
      const networkMessage = getErrorMessage(error);
      // You can show a toast notification here if needed
      // toast.error(networkMessage);
      return Promise.reject(new Error(networkMessage));
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
