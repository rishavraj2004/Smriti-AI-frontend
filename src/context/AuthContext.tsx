import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Patient,
  PatientLoginRequest,
  PatientSignupRequest,
  Caregiver,
  CaregiverLoginRequest,
  CaregiverSignupRequest,
  SupportedLanguage,
} from '../types/auth';
import { authApi } from '../api/authApi';
import { caregiverApi } from '../api/caregiverApi';
import { storageService } from '../services/storageService';

interface AuthContextType {
  // Patient state
  patient: Patient | null;
  appLanguage: SupportedLanguage;
  token: string | null;
  pendingPairingCode: string | null;
  isLoading: boolean;
  isRestoringSession: boolean;
  error: string | null;
  signup: (data: PatientSignupRequest) => Promise<Patient>;
  confirmSignupFlow: () => void;
  login: (data: PatientLoginRequest) => Promise<Patient>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setLanguage: (language: SupportedLanguage) => void;
  clearError: () => void;

  // Caregiver state & methods
  caregiver: Caregiver | null;
  caregiverToken: string | null;
  linkedPatient: Patient | null;
  signupCaregiver: (data: CaregiverSignupRequest) => Promise<Caregiver>;
  loginCaregiver: (data: CaregiverLoginRequest) => Promise<Caregiver>;
  linkPatientWithCode: (pairingCode: string) => Promise<Patient>;
  fetchCaregiverDashboard: () => Promise<Patient | null>;
  logoutCaregiver: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appLanguage, setAppLanguage] = useState<SupportedLanguage>('en');
  const [pendingPatient, setPendingPatient] = useState<Patient | null>(null);
  const [pendingPairingCode, setPendingPairingCode] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Caregiver state
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [caregiverToken, setCaregiverToken] = useState<string | null>(null);
  const [linkedPatient, setLinkedPatient] = useState<Patient | null>(null);

  const [isRestoringSession, setIsRestoringSession] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Restore authenticated session & language on app launch
  const restoreSession = useCallback(async () => {
    try {
      setIsRestoringSession(true);
      setError(null);

      // Check stored language preference
      const storedLang = await storageService.getLanguage();
      if (storedLang) {
        setAppLanguage(storedLang as SupportedLanguage);
      }

      // Check for stored patient token first
      const storedPatientToken = await storageService.getToken();
      if (storedPatientToken) {
        try {
          const response = await authApi.getMe();
          if (response.success && response.patient) {
            setToken(storedPatientToken);
            setPatient(response.patient);
            if (response.patient.language) {
              setAppLanguage(response.patient.language);
              await storageService.setLanguage(response.patient.language);
            }
            // Clear any lingering caregiver state in patient mode
            setCaregiver(null);
            setCaregiverToken(null);
            setLinkedPatient(null);
            return;
          }
        } catch {
          await storageService.removeToken();
          setToken(null);
          setPatient(null);
        }
      }

      // Check for stored caregiver token
      const storedCaregiverToken = await storageService.getCaregiverToken();
      if (storedCaregiverToken) {
        setCaregiverToken(storedCaregiverToken);
        setCaregiver({
          id: 'caregiver-active',
          name: 'Caregiver',
          email: '',
        });
        try {
          const dashRes = await caregiverApi.getDashboard(storedCaregiverToken);
          if (dashRes.success && dashRes.patient) {
            setLinkedPatient(dashRes.patient);
            if (dashRes.patient.language) {
              setAppLanguage(dashRes.patient.language);
            }
          }
        } catch {
          // Patient linking pending
        }
      }
    } catch (err: any) {
      console.warn('Session restoration failed:', err.message);
      if (err?.status === 401) {
        await storageService.removeToken();
        await storageService.removeCaregiverToken();
        setToken(null);
        setPatient(null);
        setCaregiver(null);
        setCaregiverToken(null);
      }
    } finally {
      setIsRestoringSession(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Patient methods
  const signup = async (data: PatientSignupRequest): Promise<Patient> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.signup(data);

      if (!response.success || !response.token || !response.patient) {
        throw new Error(response.message || 'Signup failed. Please try again.');
      }

      // Clear caregiver credentials on patient signup
      await storageService.removeCaregiverToken();
      setCaregiverToken(null);
      setCaregiver(null);
      setLinkedPatient(null);

      await storageService.setToken(response.token);
      setToken(response.token);
      setPendingPatient(response.patient);
      setPendingPairingCode(response.patient.pairingCode);

      if (response.patient.language) {
        setAppLanguage(response.patient.language);
        await storageService.setLanguage(response.patient.language);
      }

      return response.patient;
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please check your information.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSignupFlow = () => {
    if (pendingPatient) {
      setPatient(pendingPatient);
      setPendingPatient(null);
      setPendingPairingCode(null);
    }
  };

  const login = async (data: PatientLoginRequest): Promise<Patient> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.login(data);

      if (!response.success || !response.token || !response.patient) {
        throw new Error(response.message || 'Login failed. Please check your credentials.');
      }

      // Clear caregiver credentials on patient login
      await storageService.removeCaregiverToken();
      setCaregiverToken(null);
      setCaregiver(null);
      setLinkedPatient(null);

      await storageService.setToken(response.token);
      setToken(response.token);
      setPatient(response.patient);
      setPendingPatient(null);
      setPendingPairingCode(null);

      // Apply language stored in backend database
      if (response.patient.language) {
        setAppLanguage(response.patient.language);
        await storageService.setLanguage(response.patient.language);
      }

      return response.patient;
    } catch (err: any) {
      const msg = err.message || 'Email or password is incorrect.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await storageService.removeToken();
      setToken(null);
      setPatient(null);
      setPendingPatient(null);
      setPendingPairingCode(null);
      setError(null);
    } catch (err) {
      console.warn('Error during logout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const response = await authApi.getMe();
      if (response.success && response.patient) {
        setPatient(response.patient);
        if (response.patient.language) {
          setAppLanguage(response.patient.language);
          await storageService.setLanguage(response.patient.language);
        }
      }
    } catch (err: any) {
      console.warn('Error refreshing profile:', err.message);
    }
  };

  const setLanguage = (language: SupportedLanguage) => {
    setAppLanguage(language);
    storageService.setLanguage(language).catch(() => {});
    if (patient) {
      setPatient({ ...patient, language });
      // Persist language update to backend database
      authApi.updateLanguage(language).catch((e) => {
        console.warn('Could not sync language to backend DB:', e);
      });
    }
  };

  // Caregiver methods
  const signupCaregiver = async (data: CaregiverSignupRequest): Promise<Caregiver> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await caregiverApi.signup(data);

      if (!response.success || !response.token || !response.caregiver) {
        throw new Error(response.message || 'Caregiver registration failed.');
      }

      // Clear patient credentials on caregiver signup
      await storageService.removeToken();
      setToken(null);
      setPatient(null);

      await storageService.setCaregiverToken(response.token);
      setCaregiverToken(response.token);
      setCaregiver(response.caregiver);
      return response.caregiver;
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please check your information.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const loginCaregiver = async (data: CaregiverLoginRequest): Promise<Caregiver> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await caregiverApi.login(data);

      if (!response.success || !response.token || !response.caregiver) {
        throw new Error(response.message || 'Caregiver login failed.');
      }

      // Clear patient credentials on caregiver login
      await storageService.removeToken();
      setToken(null);
      setPatient(null);

      await storageService.setCaregiverToken(response.token);
      setCaregiverToken(response.token);
      setCaregiver(response.caregiver);

      // Fetch linked patient if any
      try {
        const dashRes = await caregiverApi.getDashboard(response.token);
        if (dashRes.success && dashRes.patient) {
          setLinkedPatient(dashRes.patient);
          if (dashRes.patient.language) {
            setAppLanguage(dashRes.patient.language);
          }
        }
      } catch {
        setLinkedPatient(null);
      }

      return response.caregiver;
    } catch (err: any) {
      const msg = err.message || 'Caregiver email or password incorrect.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const linkPatientWithCode = async (pairingCode: string): Promise<Patient> => {
    try {
      setIsLoading(true);
      setError(null);
      const cToken = caregiverToken || (await storageService.getCaregiverToken());
      if (!cToken) {
        throw new Error('You must be logged in as a caregiver to link a patient.');
      }

      const response = await caregiverApi.linkPatient(pairingCode, cToken);

      if (!response.success || !response.patient) {
        throw new Error(response.message || 'Failed to link with patient key.');
      }

      setLinkedPatient(response.patient);
      if (response.patient.language) {
        setAppLanguage(response.patient.language);
      }
      return response.patient;
    } catch (err: any) {
      const msg = err.message || 'Invalid or non-existent Patient Key.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCaregiverDashboard = async (): Promise<Patient | null> => {
    try {
      const cToken = caregiverToken || (await storageService.getCaregiverToken());
      if (!cToken) return null;

      const response = await caregiverApi.getDashboard(cToken);
      if (response.success && response.patient) {
        setLinkedPatient(response.patient);
        if (response.patient.language) {
          setAppLanguage(response.patient.language);
        }
        return response.patient;
      }
      return null;
    } catch {
      return null;
    }
  };

  const logoutCaregiver = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await storageService.removeCaregiverToken();
      setCaregiverToken(null);
      setCaregiver(null);
      setLinkedPatient(null);
      setError(null);
    } catch (err) {
      console.warn('Error during caregiver logout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        patient,
        appLanguage,
        token,
        pendingPairingCode,
        isLoading,
        isRestoringSession,
        error,
        signup,
        confirmSignupFlow,
        login,
        logout,
        refreshProfile,
        setLanguage,
        clearError,
        caregiver,
        caregiverToken,
        linkedPatient,
        signupCaregiver,
        loginCaregiver,
        linkPatientWithCode,
        fetchCaregiverDashboard,
        logoutCaregiver,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
