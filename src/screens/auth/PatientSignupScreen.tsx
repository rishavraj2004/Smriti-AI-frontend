import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../theme/theme';
import { ElderlyButton } from '../../components/ElderlyButton';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { SupportedLanguage } from '../../types/auth';
import {
  SUPPORTED_LANGUAGES,
  NER_REGIONS,
  validateEmail,
  validatePassword,
  validateAge,
} from '../../utils/validation';

interface PatientSignupScreenProps {
  onBack: () => void;
  onGoToLogin: () => void;
  onSignupSuccess: (pairingCode: string) => void;
}

export const PatientSignupScreen: React.FC<PatientSignupScreenProps> = ({
  onBack,
  onGoToLogin,
  onSignupSuccess,
}) => {
  const { signup, isLoading, error, clearError } = useAuth();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('as');
  const [region, setRegion] = useState(NER_REGIONS[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignup = async () => {
    setLocalError(null);
    clearError();

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const numericAge = parseInt(age.trim(), 10);

    if (!cleanName) {
      setLocalError('Please enter your full name.');
      return;
    }
    if (!validateAge(numericAge)) {
      setLocalError('Please enter a valid age between 1 and 120.');
      return;
    }
    if (!validateEmail(cleanEmail)) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (!validatePassword(password)) {
      setLocalError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      const createdPatient = await signup({
        name: cleanName,
        age: numericAge,
        email: cleanEmail,
        password,
        language,
        region,
      });

      onSignupSuccess(createdPatient.pairingCode);
    } catch (err: any) {
      setLocalError(err.message || 'Signup failed. Please try again.');
    }
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
            <Text style={styles.backBtnText}>{t.nav.back}</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>{t.auth.createAccountTitle}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.instruction}>
            {t.auth.fillDetails}
          </Text>

          {displayError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={22} color={COLORS.danger} />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.auth.fullNameLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (localError) setLocalError(null);
              }}
            />
          </View>

          {/* Age */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.auth.ageLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 72"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={age}
              onChangeText={(text) => {
                setAge(text);
                if (localError) setLocalError(null);
              }}
            />
          </View>

          {/* Regional Language Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.auth.preferredLangLabel}</Text>
            <View style={styles.langGrid}>
              {SUPPORTED_LANGUAGES.map((l) => {
                const isSelected = language === l.code;
                return (
                  <TouchableOpacity
                    key={l.code}
                    style={[styles.langChip, isSelected && styles.langChipSelected]}
                    onPress={() => setLanguage(l.code)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.langChipText, isSelected && styles.langChipTextSelected]}>
                      {l.native}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* NER Region */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.auth.regionLabel}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionScroll}>
              {NER_REGIONS.map((r) => {
                const isSelected = region === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.regionChip, isSelected && styles.regionChipSelected]}
                    onPress={() => setRegion(r)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.regionChipText, isSelected && styles.regionChipTextSelected]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.auth.emailLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. patient@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (localError) setLocalError(null);
              }}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.auth.passwordLabel}</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
                placeholder="Create secure password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (localError) setLocalError(null);
                }}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.auth.confirmPasswordLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (localError) setLocalError(null);
              }}
            />
          </View>

          {/* Submit Button */}
          <ElderlyButton
            title={t.auth.createAccountTitle}
            onPress={handleSignup}
            variant="primary"
            icon="✨"
            loading={isLoading}
            style={{ marginTop: 14 }}
          />

          {/* Switch to Login */}
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>{t.auth.alreadyRegistered}</Text>
            <TouchableOpacity onPress={onGoToLogin} activeOpacity={0.8}>
              <Text style={styles.loginLink}>{t.auth.signInHereLink}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.bgMain,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 12,
    gap: 4,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  instruction: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginBottom: 16,
    lineHeight: 21,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 17,
    color: COLORS.textDark,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 14,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  langChipSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  langChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  langChipTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  regionScroll: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  regionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginRight: 8,
  },
  regionChipSelected: {
    backgroundColor: COLORS.secondaryLight,
    borderColor: COLORS.secondary,
  },
  regionChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  regionChipTextSelected: {
    color: COLORS.secondaryDark,
    fontWeight: '800',
  },
  loginPrompt: {
    marginTop: 20,
    alignItems: 'center',
    gap: 6,
  },
  loginPromptText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  loginLink: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textDecorationLine: 'underline',
  },
});
