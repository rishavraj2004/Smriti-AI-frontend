import { useAuth } from '../context/AuthContext';
import { getTranslation, TranslationDictionary } from '../i18n/translations';
import { SupportedLanguage } from '../types/auth';

export const useTranslation = (): {
  t: TranslationDictionary;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
} => {
  const { patient, appLanguage, setLanguage } = useAuth();
  const currentLang = (patient?.language as SupportedLanguage) || appLanguage || 'en';
  const t = getTranslation(currentLang);

  return {
    t,
    language: currentLang,
    setLanguage,
  };
};
