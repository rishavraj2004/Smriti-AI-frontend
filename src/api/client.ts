import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { storageService } from '../services/storageService';

// Default to process.env.EXPO_PUBLIC_API_URL or local backend on port 3000
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: Attach JWT token if available and not already set
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      if (config.headers && !config.headers.Authorization) {
        const caregiverToken = await storageService.getCaregiverToken();
        const patientToken = await storageService.getToken();
        const token = caregiverToken || patientToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.warn('Error reading token for request interceptor:', error);
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

export const getApiBaseUrl = (): string => BASE_URL;
