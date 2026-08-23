import { apiClient } from './client';
import { AuthResponse, PatientLoginRequest, PatientSignupRequest, Patient, SupportedLanguage } from '../types/auth';

export const authApi = {
  async signup(data: PatientSignupRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/patient/signup', data);
    return response.data;
  },

  async login(data: PatientLoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/patient/login', data);
    return response.data;
  },

  async getMe(): Promise<{ success: boolean; patient: Patient }> {
    const response = await apiClient.get<{ success: boolean; patient: Patient }>('/api/auth/me');
    return response.data;
  },

  async updateLanguage(language: SupportedLanguage): Promise<{ success: boolean; patient?: Patient }> {
    try {
      const response = await apiClient.put<{ success: boolean; patient?: Patient }>('/api/auth/profile', { language });
      return response.data;
    } catch {
      try {
        const altResponse = await apiClient.put<{ success: boolean; patient?: Patient }>('/api/patient/language', { language });
        return altResponse.data;
      } catch {
        return { success: false };
      }
    }
  },

  async checkHealth(): Promise<{ success: boolean; status: string; time: string }> {
    const response = await apiClient.get<{ success: boolean; status: string; time: string }>('/health');
    return response.data;
  },
};
