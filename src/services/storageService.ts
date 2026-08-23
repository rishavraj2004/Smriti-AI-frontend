import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const PATIENT_TOKEN_KEY = 'smriti_patient_jwt_token';
const CAREGIVER_TOKEN_KEY = 'smriti_caregiver_jwt_token';
const APP_LANGUAGE_KEY = 'smriti_app_language';

class StorageService {
  private memoryStore: Record<string, string> = {};

  async setToken(token: string): Promise<void> {
    await this.setItem(PATIENT_TOKEN_KEY, token);
  }

  async getToken(): Promise<string | null> {
    return await this.getItem(PATIENT_TOKEN_KEY);
  }

  async removeToken(): Promise<void> {
    await this.removeItem(PATIENT_TOKEN_KEY);
  }

  async setCaregiverToken(token: string): Promise<void> {
    await this.setItem(CAREGIVER_TOKEN_KEY, token);
  }

  async getCaregiverToken(): Promise<string | null> {
    return await this.getItem(CAREGIVER_TOKEN_KEY);
  }

  async removeCaregiverToken(): Promise<void> {
    await this.removeItem(CAREGIVER_TOKEN_KEY);
  }

  async setLanguage(lang: string): Promise<void> {
    await this.setItem(APP_LANGUAGE_KEY, lang);
  }

  async getLanguage(): Promise<string | null> {
    return await this.getItem(APP_LANGUAGE_KEY);
  }

  private async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        } else {
          this.memoryStore[key] = value;
        }
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.warn(`StorageService setItem (${key}) fallback:`, error);
      this.memoryStore[key] = value;
    }
  }

  private async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return this.memoryStore[key] || null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(`StorageService getItem (${key}) fallback:`, error);
      return this.memoryStore[key] || null;
    }
  }

  private async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        delete this.memoryStore[key];
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.warn(`StorageService removeItem (${key}) fallback:`, error);
      delete this.memoryStore[key];
    }
  }
}

export const storageService = new StorageService();
