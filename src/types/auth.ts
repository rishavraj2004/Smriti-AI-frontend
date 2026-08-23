export type SupportedLanguage = 'en' | 'hi' | 'as' | 'bn' | 'mn' | 'mz';

export interface Patient {
  id: string;
  name: string;
  email: string;
  age: number;
  language: SupportedLanguage;
  region: string;
  pairingCode: string;
  caregiverId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientSignupRequest {
  name: string;
  email: string;
  password: string;
  age: number;
  language: SupportedLanguage;
  region: string;
}

export interface PatientLoginRequest {
  email: string;
  password: string;
}

export interface Caregiver {
  id: string;
  name: string;
  email: string;
}

export interface CaregiverSignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface CaregiverLoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  patient?: Patient;
}

export interface CaregiverAuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  caregiver?: Caregiver;
}

export interface ApiErrorResponse {
  success?: boolean;
  status?: string;
  message?: string;
  error?: unknown;
}
