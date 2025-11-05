import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { supabase } from '../lib/supabase';

// Base URL for backend API (if still using backend for other services)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token from Supabase session
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && config.headers) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('Error getting session:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response) {
      // Handle different error status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - try to refresh session first
          try {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError || !session) {
              // Refresh failed, sign out
              await supabase.auth.signOut();
              localStorage.removeItem('wholechild-auth');
              window.location.href = '/';
            } else {
              // Retry the original request with new token
              const config = error.config;
              if (config && session?.access_token && config.headers) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
                return api.request(config);
              }
            }
          } catch (refreshErr) {
            // Refresh failed, sign out
            await supabase.auth.signOut();
            localStorage.removeItem('wholechild-auth');
            window.location.href = '/';
          }
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
        default:
          console.error('Request failed:', error.message);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error: No response received');
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;



