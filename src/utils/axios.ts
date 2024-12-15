import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'https://backend-rk52z7les-chaman-ss-projects.vercel.app',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // If no token is found and we're not on the login or signup pages, redirect to login
      const publicPaths = ['/login', '/signup'];
      if (!publicPaths.some(path => window.location.pathname.includes(path))) {
        window.location.href = '/login';
      }
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', error.response.data);
      
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Clear token and redirect to login for unauthorized access
          localStorage.removeItem('token');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
            toast.error('Session expired. Please log in again.');
          }
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(error.response.data?.message || 'An error occurred');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error:', error.request);
      toast.error('Network error. Please check your connection.');
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
      toast.error('An error occurred while processing your request.');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
