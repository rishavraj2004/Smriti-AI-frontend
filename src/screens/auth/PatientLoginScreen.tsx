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
import { validateEmail } from '../../utils/validation';

interface PatientLoginScreenProps {
  onBack: () => void;
  onGoToSignup: () => void;
}

export const PatientLoginScreen: React.FC<PatientLoginScreenProps> = ({
  onBack,
  onGoToSignup,
}) => {
  const { login, isLoading, error, clearError } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalError(null);
    clearError();

    const cleanEmail = email.trim();
    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    try {
      await login({
        email: cleanEmail,
        password,
      });
    } catch (err: any) {
      setLocalError(err.message || 'Email or password is incorrect.');
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
          <Text style={styles.screenTitle}>{t.auth.signInTitle}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.instruction}>
            {t.auth.enterCredentials}
          </Text>

          {displayError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={22} color={COLORS.danger} />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          {/* Email field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.auth.emailLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. yourname@example.com"
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

          {/* Password field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.auth.passwordLabel}</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
                placeholder="Enter your password"
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

          {/* Sign In Button */}
          <ElderlyButton
            title={t.auth.signInBtn}
            onPress={handleLogin}
            variant="primary"
            icon="🔓"
            loading={isLoading}
            style={{ marginTop: 14 }}
          />

          {/* Switch to Signup */}
          <View style={styles.signupPrompt}>
            <Text style={styles.signupPromptText}>{t.auth.dontHaveAccount}</Text>
            <TouchableOpacity onPress={onGoToSignup} activeOpacity={0.8}>
              <Text style={styles.signupLink}>{t.auth.createNewAccountLink}</Text>
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
    justifyContent: 'center',
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
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  instruction: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: 18,
    lineHeight: 22,
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
    fontSize: 16,
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
    paddingVertical: 14,
    fontSize: 18,
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
  signupPrompt: {
    marginTop: 20,
    alignItems: 'center',
    gap: 6,
  },
  signupPromptText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  signupLink: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textDecorationLine: 'underline',
  },
});
