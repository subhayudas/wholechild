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
          // Unauthorized - try to refresh session first (but only once to prevent loops)
          const config = error.config as any;
          if (!config._retry) {
            config._retry = true;
            
            try {
              // First check if we have a valid session
              const { data: { session: currentSession } } = await supabase.auth.getSession();
              
              if (!currentSession) {
                // No session at all, don't sign out (might be a public endpoint)
                return Promise.reject(error);
              }
              
              // Only try to refresh if session has required properties
              if (!currentSession.refresh_token || !currentSession.access_token) {
                // Session doesn't have required properties, check if it's expired
                if (currentSession.expires_at && currentSession.expires_at < Math.floor(Date.now() / 1000)) {
                  // Session is expired and can't be refreshed, sign out
                  await supabase.auth.signOut();
                  localStorage.removeItem('wholechild-auth');
                  window.location.href = '/';
                }
                return Promise.reject(error);
              }
              
              // Try to refresh the session
              const { data: { session }, error: refreshError } = await supabase.auth.refreshSession(currentSession);
              
              if (refreshError || !session) {
                // Refresh failed - check if session is actually expired
                const { data: { session: checkSession } } = await supabase.auth.getSession();
                
                if (!checkSession || (checkSession.expires_at && checkSession.expires_at < Math.floor(Date.now() / 1000))) {
                  // Session is truly invalid, sign out
                  await supabase.auth.signOut();
                  localStorage.removeItem('wholechild-auth');
                  window.location.href = '/';
                }
                // If session still exists, don't sign out - might be a temporary issue
                return Promise.reject(error);
              } else {
                // Retry the original request with new token
                if (config && session?.access_token && config.headers) {
                  config.headers.Authorization = `Bearer ${session.access_token}`;
                  return api.request(config);
                }
              }
            } catch (refreshErr) {
              // On error, check if session still exists before signing out
              try {
                const { data: { session: checkSession } } = await supabase.auth.getSession();
                if (!checkSession) {
                  // No session, sign out
                  await supabase.auth.signOut();
                  localStorage.removeItem('wholechild-auth');
                  window.location.href = '/';
                }
              } catch (checkErr) {
                // Can't check session, but don't sign out - might be a network issue
                console.error('Error checking session:', checkErr);
              }
              return Promise.reject(error);
            }
          } else {
            // Already retried - check if session is still valid before signing out
            const { data: { session: finalCheck } } = await supabase.auth.getSession();
            if (!finalCheck || (finalCheck.expires_at && finalCheck.expires_at < Math.floor(Date.now() / 1000))) {
              // Session is truly invalid, sign out
              await supabase.auth.signOut();
              localStorage.removeItem('wholechild-auth');
              window.location.href = '/';
            }
            return Promise.reject(error);
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



