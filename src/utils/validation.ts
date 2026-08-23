import { SupportedLanguage } from '../types/auth';

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া (Axomiya)' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'mn', label: 'Manipuri', native: 'মৈতৈলোন্ (Meiteilon)' },
  { code: 'mz', label: 'Mizo', native: 'Mizo ṭawng' },
];

export const NER_REGIONS = [
  'Assam (Guwahati / Jorhat / Dibrugarh)',
  'Meghalaya (Shillong / Tura)',
  'Arunachal Pradesh (Itanagar / Tawang)',
  'Manipur (Imphal / Churachandpur)',
  'Mizoram (Aizawl / Lunglei)',
  'Nagaland (Kohima / Dimapur)',
  'Tripura (Agartala / Dharmanagar)',
  'Sikkim (Gangtok / Namchi)',
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email: string): boolean => {
  return EMAIL_PATTERN.test(email.trim().toLowerCase());
};

export const validatePassword = (password: string): boolean => {
  return typeof password === 'string' && password.length >= 8;
};

export const validateAge = (age: number | string): boolean => {
  const numericAge = typeof age === 'number' ? age : parseInt(age, 10);
  return !isNaN(numericAge) && Number.isInteger(numericAge) && numericAge >= 1 && numericAge <= 120;
};
