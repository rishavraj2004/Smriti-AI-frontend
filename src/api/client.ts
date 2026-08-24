import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { storageService } from '../services/storageService';

const PRODUCTION_API_URL = 'https://smriti-ai-backend-s505.onrender.com';

// Determine the most appropriate backend URL based on runtime environment
export const resolveBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location.hostname) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
      }
    }
  }

  return PRODUCTION_API_URL;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
    'bypass-tunnel-reminder': 'true',
  },
});

// Request interceptor: Dynamically ensure baseURL & attach JWT token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const activeBase = resolveBaseUrl();
      if (!config.baseURL || config.baseURL === 'http://localhost:3000') {
        config.baseURL = activeBase;
      }

      // Ensure bypass tunnel header
      config.headers['Bypass-Tunnel-Reminder'] = 'true';
      config.headers['bypass-tunnel-reminder'] = 'true';

      // Attach auth token if available
      if (!config.headers.Authorization) {
        const caregiverToken = await storageService.getCaregiverToken();
        const patientToken = await storageService.getToken();
        const token = caregiverToken || patientToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.warn('Error in request interceptor:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Extract clean error message
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = 'Unable to connect to Smriti AI. Please try again.';
    
    if (error.response) {
      // Backend returned error JSON (e.g. { success: false, message: '...' })
      friendlyMessage = error.response.data?.message || `Server error (${error.response.status})`;
    } else if (error.request) {
      // Network failure / server offline
      friendlyMessage = 'Could not reach the server. Please check your internet connection.';
    } else if (error.message) {
      friendlyMessage = error.message;
    }

    const enhancedError = new Error(friendlyMessage);
    (enhancedError as any).status = error.response?.status;
    (enhancedError as any).original = error;
    return Promise.reject(enhancedError);
  }
);

export const getApiBaseUrl = (): string => resolveBaseUrl();
