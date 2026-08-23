import { apiClient } from './client';
import {
  Caregiver,
  CaregiverSignupRequest,
  CaregiverLoginRequest,
  CaregiverAuthResponse,
  Patient,
} from '../types/auth';

export const caregiverApi = {
  async signup(data: CaregiverSignupRequest): Promise<CaregiverAuthResponse> {
    const response = await apiClient.post<CaregiverAuthResponse>('/api/auth/caregiver/signup', data);
    return response.data;
  },

  async login(data: CaregiverLoginRequest): Promise<CaregiverAuthResponse> {
    const response = await apiClient.post<CaregiverAuthResponse>('/api/auth/caregiver/login', data);
    return response.data;
  },

  async linkPatient(pairingCode: string, token?: string): Promise<{ success: boolean; message: string; patient: Patient }> {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.post<{ success: boolean; message: string; patient: Patient }>(
      '/api/caregiver/link-patient',
      { pairingCode: pairingCode.trim().toUpperCase() },
      { headers }
    );
    return response.data;
  },

  async getDashboard(token?: string): Promise<{ success: boolean; patient: Patient }> {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.get<{ success: boolean; patient: Patient }>(
      '/api/caregiver/dashboard',
      { headers }
    );
    return response.data;
  },
};
