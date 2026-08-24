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
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../theme/theme';
import { ElderlyButton } from '../../components/ElderlyButton';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePassword } from '../../utils/validation';
import { getLanguageLabel } from '../../utils/formatters';

interface CaregiverPortalScreenProps {
  onBack: () => void;
}

export const CaregiverPortalScreen: React.FC<CaregiverPortalScreenProps> = ({ onBack }) => {
  const {
    caregiver,
    caregiverToken,
    linkedPatient,
    signupCaregiver,
    loginCaregiver,
    linkPatientWithCode,
    logoutCaregiver,
    isLoading,
    error,
    clearError,
  } = useAuth();

  // Auth sub-mode
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Link patient code state
  const [pairingCodeInput, setPairingCodeInput] = useState('');
  const [localMessage, setLocalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  const handleCaregiverAuth = async () => {
    setLocalMessage(null);
    clearError();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setLocalMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    if (!validatePassword(password)) {
      setLocalMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    try {
      if (authMode === 'signup') {
        const cleanName = name.trim();
        if (!cleanName) {
          setLocalMessage({ type: 'error', text: 'Please enter your name.' });
          return;
        }
        await signupCaregiver({ name: cleanName, email: cleanEmail, password });
      } else {
        await loginCaregiver({ email: cleanEmail, password });
      }
    } catch (err: any) {
      setLocalMessage({ type: 'error', text: err.message || 'Authentication failed.' });
    }
  };

  const handleLinkPatient = async () => {
    setLocalMessage(null);
    clearError();

    const cleanCode = pairingCodeInput.trim().toUpperCase();
    if (!/^SMR-[A-Z0-9]{4}$/.test(cleanCode)) {
      setLocalMessage({
        type: 'error',
        text: 'Please enter a valid 8-character pairing code in the format SMR-XXXX.',
      });
      return;
    }

    setIsLinking(true);
    try {
      const patient = await linkPatientWithCode(cleanCode);
      setLocalMessage({
        type: 'success',
        text: `Successfully linked with ${patient.name}!`,
      });
      setPairingCodeInput('');
    } catch (err: any) {
      setLocalMessage({
        type: 'error',
        text: err.message || 'Could not link patient with this code. Check the code and try again.',
      });
    } finally {
      setIsLinking(false);
    }
  };

  const isCaregiverLoggedIn = !!(caregiver || caregiverToken);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color={COLORS.brandAmberBrown} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Caregiver Portal</Text>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="people" size={26} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Family & Caregiver Companion</Text>
          <Text style={styles.heroSub}>
            Link with your loved one using their unique Patient Pairing Key (SMR-XXXX).
          </Text>
        </View>

        {/* Feedback Alert */}
        {localMessage && (
          <View
            style={[
              styles.feedbackBox,
              localMessage.type === 'error' ? styles.feedbackError : styles.feedbackSuccess,
            ]}
          >
            <Ionicons
              name={localMessage.type === 'error' ? 'alert-circle' : 'checkmark-circle'}
              size={22}
              color={localMessage.type === 'error' ? COLORS.danger : COLORS.success}
            />
            <Text
              style={[
                styles.feedbackText,
                { color: localMessage.type === 'error' ? COLORS.danger : COLORS.success },
              ]}
            >
              {localMessage.text}
            </Text>
          </View>
        )}

        {/* Caregiver Authentication Section (if not logged in) */}
        {!isCaregiverLoggedIn ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Caregiver Sign In / Register</Text>
            <Text style={styles.cardSub}>
              Sign in to manage and link your elderly patient's cognitive health monitoring.
            </Text>

            {/* Mode Switcher */}
            <View style={styles.modeTabs}>
              <TouchableOpacity
                style={[styles.modeTab, authMode === 'login' && styles.modeTabActive]}
                onPress={() => {
                  setAuthMode('login');
                  setLocalMessage(null);
                }}
              >
                <Text
                  style={[styles.modeTabText, authMode === 'login' && styles.modeTabTextActive]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeTab, authMode === 'signup' && styles.modeTabActive]}
                onPress={() => {
                  setAuthMode('signup');
                  setLocalMessage(null);
                }}
              >
                <Text
                  style={[styles.modeTabText, authMode === 'signup' && styles.modeTabTextActive]}
                >
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {authMode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Priyanshi Hazarika"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="caregiver@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password (minimum 8 characters)</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
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

            <ElderlyButton
              title={authMode === 'login' ? 'Sign In as Caregiver' : 'Create Caregiver Account'}
              onPress={handleCaregiverAuth}
              variant="primary"
              loading={isLoading}
              style={{ marginTop: 10 }}
            />
          </View>
        ) : (
          /* Caregiver Logged In View */
          <>
            {/* Link Patient Key Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Link Patient Pairing Key</Text>
              <Text style={styles.cardSub}>
                Enter the 8-character pairing code shown on your loved one's Smriti AI screen (e.g. SMR-XXXX).
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Patient Pairing Code</Text>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="SMR-XXXX"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                  maxLength={8}
                  value={pairingCodeInput}
                  onChangeText={(t) => setPairingCodeInput(t.toUpperCase())}
                />
              </View>

              <ElderlyButton
                title="Link Patient Account"
                onPress={handleLinkPatient}
                variant="secondary"
                loading={isLinking}
                style={{ marginTop: 4 }}
              />
            </View>

            {/* Linked Patient Profile Dashboard */}
            {linkedPatient ? (
              <View style={styles.linkedPatientCard}>
                <View style={styles.linkedHeader}>
                  <View style={styles.patientAvatar}>
                    <Ionicons name="person" size={24} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.linkedTitle}>Linked Patient</Text>
                    <Text style={styles.patientName}>{linkedPatient.name}</Text>
                    <Text style={styles.patientDetail}>
                      Age {linkedPatient.age} • {linkedPatient.region}
                    </Text>
                  </View>
                  <View style={styles.activeBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.activeBadgeText}>Connected</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Language:</Text>
                  <Text style={styles.infoVal}>{getLanguageLabel(linkedPatient.language)}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Email:</Text>
                  <Text style={styles.infoVal}>{linkedPatient.email}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Pairing Code:</Text>
                  <Text style={styles.infoValCode}>{linkedPatient.pairingCode}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.noPatientBox}>
                <View style={styles.noPatientIconCircle}>
                  <Ionicons name="clipboard-outline" size={28} color={COLORS.textMuted} />
                </View>
                <Text style={styles.noPatientTitle}>No Patient Linked Yet</Text>
                <Text style={styles.noPatientSub}>
                  Enter your loved one's code above to link their account to your dashboard.
                </Text>
              </View>
            )}

            {/* Caregiver Portal Logout */}
            <ElderlyButton
              title="Sign Out of Caregiver Portal"
              onPress={logoutCaregiver}
              variant="outline"
              style={{ marginTop: 12, marginBottom: 20 }}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: COLORS.bgWarmIvory,
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.brandAmberBrown,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.brandAmberBrown,
  },
  heroCard: {
    backgroundColor: COLORS.brandAmberBrown,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.card,
  },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroEmoji: {
    fontSize: 36,
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 14,
    color: COLORS.primaryLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    gap: 10,
  },
  feedbackError: {
    backgroundColor: COLORS.dangerLight,
  },
  feedbackSuccess: {
    backgroundColor: COLORS.successLight,
  },
  feedbackText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.card,
  },
  modeTabText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  modeTabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '900',
  },
  inputGroup: {
    marginBottom: 14,
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
  codeInput: {
    letterSpacing: 3,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
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
  linkedPatientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.card,
  },
  linkedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  patientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientAvatarEmoji: {
    fontSize: 28,
  },
  linkedTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  patientName: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  patientDetail: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.success,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoKey: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  infoValCode: {
    fontSize: 16,
    color: COLORS.primaryDark,
    fontWeight: '900',
    letterSpacing: 2,
  },
  noPatientBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...SHADOWS.card,
  },
  noPatientIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noPatientTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  noPatientSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
