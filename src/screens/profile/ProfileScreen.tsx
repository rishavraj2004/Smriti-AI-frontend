import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { COLORS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { ElderlyButton } from '../../components/ElderlyButton';
import { SUPPORTED_LANGUAGES } from '../../utils/validation';
import { getLanguageLabel } from '../../utils/formatters';
import { SupportedLanguage } from '../../types/auth';
import { SpeakerButton } from '../../components/SpeakerButton';

export const ProfileScreen: React.FC = () => {
  const { patient, logout, setLanguage } = useAuth();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [largeText, setLargeText] = useState(true);
  const [voiceAssistance, setVoiceAssistance] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [sosModalVisible, setSosModalVisible] = useState(false);

  const pairingCode = patient?.pairingCode || 'SMR-PENDING';
  const languageLabel = getLanguageLabel(patient?.language || 'en');

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.warn('Clipboard copy error:', err);
    }
  };

  const handleLogoutPress = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <SpeakerButton
              text={`Patient Profile. ${patient?.name || t.profile.title}. Age ${patient?.age || 'not set'}. Region: ${patient?.region || 'North Eastern Region'}.`}
              size="small"
              backgroundColor="rgba(255, 255, 255, 0.15)"
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.name}>{patient?.name || t.profile.title}</Text>
          <Text style={styles.detail}>
            {t.auth.ageLabel} {patient?.age || '—'} • {patient?.region || 'North Eastern Region'}
          </Text>
          <Text style={styles.emailText}>{patient?.email || ''}</Text>
        </View>

        {/* Caregiver Pairing Code Section */}
        <View style={styles.sectionCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={styles.sectionTitle}>{t.profile.caregiverPairingTitle}</Text>
            <SpeakerButton
              text={`${t.profile.caregiverPairingTitle}. ${t.profile.caregiverPairingSub}. Your pairing code is ${pairingCode}.`}
              size="small"
            />
          </View>
          <Text style={styles.sectionSub}>{t.profile.caregiverPairingSub}</Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{pairingCode}</Text>
          </View>

          <ElderlyButton
            title={copied ? t.profile.codeCopied : t.profile.copyCode}
            onPress={handleCopyCode}
            variant={copied ? 'success' : 'secondary'}
            icon={copied ? '✓' : '📋'}
            size="normal"
          />
        </View>

        {/* Emergency SOS Button */}
        <TouchableOpacity
          style={styles.sosBtn}
          activeOpacity={0.85}
          onPress={() => setSosModalVisible(true)}
        >
          <Text style={styles.sosEmoji}>🚨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.sosTitle}>{t.profile.emergencySosTitle}</Text>
            <Text style={styles.sosSub}>{t.profile.emergencySosSub}</Text>
          </View>
          <SpeakerButton
            text={`${t.profile.emergencySosTitle}. ${t.profile.emergencySosSub}`}
            size="small"
            backgroundColor="rgba(255, 255, 255, 0.2)"
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* Regional Language Selection */}
        <View style={styles.sectionCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={styles.sectionTitle}>{t.profile.regionalLangTitle}</Text>
            <SpeakerButton
              text={`${t.profile.regionalLangTitle}. Active language: ${languageLabel}.`}
              size="small"
            />
          </View>
          <Text style={styles.sectionSub}>Active: {languageLabel}</Text>

          <View style={styles.langList}>
            {SUPPORTED_LANGUAGES.map((l) => {
              const isSelected = (patient?.language || 'en') === l.code;
              return (
                <TouchableOpacity
                  key={l.code}
                  style={[styles.langItem, isSelected && styles.langItemSelected]}
                  onPress={() => setLanguage(l.code as SupportedLanguage)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.langText, isSelected && styles.langTextSelected]}>
                    {l.native} ({l.label})
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Accessibility & Preferences */}
        <View style={styles.sectionCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={styles.sectionTitle}>{t.profile.accessibilityTitle}</Text>
            <SpeakerButton
              text={`${t.profile.accessibilityTitle}. ${t.profile.largeFont}, ${t.profile.voiceAudio}, ${t.profile.highContrast}`}
              size="small"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t.profile.largeFont}</Text>
            <Switch
              value={largeText}
              onValueChange={setLargeText}
              trackColor={{ true: COLORS.primary, false: '#CBD5E1' }}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t.profile.voiceAudio}</Text>
            <Switch
              value={voiceAssistance}
              onValueChange={setVoiceAssistance}
              trackColor={{ true: COLORS.primary, false: '#CBD5E1' }}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t.profile.highContrast}</Text>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ true: COLORS.primary, false: '#CBD5E1' }}
            />
          </View>
        </View>

        {/* Logout Action */}
        <ElderlyButton
          title={t.profile.signOutBtn}
          onPress={handleLogoutPress}
          variant="danger"
          icon="🚪"
          loading={loggingOut}
          style={{ marginTop: 6, marginBottom: 20 }}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.profile.footerText}</Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🚪</Text>
            <Text style={styles.modalTitle}>{t.profile.signOutModalTitle}</Text>
            <Text style={styles.modalSubtitle}>{t.profile.signOutModalSub}</Text>

            <View style={styles.modalActions}>
              <ElderlyButton
                title={t.profile.yesSignOut}
                onPress={confirmLogout}
                variant="danger"
                icon="🚪"
                style={{ marginBottom: 10, width: '100%' }}
              />
              <ElderlyButton
                title={t.nav.cancel}
                onPress={() => setLogoutModalVisible(false)}
                variant="outline"
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* SOS Alert Modal */}
      <Modal
        visible={sosModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSosModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🚨</Text>
            <Text style={styles.modalTitle}>{t.profile.emergencySosTitle}</Text>
            <Text style={styles.modalSubtitle}>
              {t.profile.emergencySosSub} ({patient?.name || 'Patient'}). Code: {pairingCode}.
            </Text>

            <View style={styles.modalActions}>
              <ElderlyButton
                title={t.nav.ok}
                onPress={() => setSosModalVisible(false)}
                variant="primary"
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.bgMain,
    flexGrow: 1,
  },
  profileCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.card,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 36,
  },
  name: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  detail: {
    fontSize: 14,
    color: COLORS.primaryLight,
    marginTop: 2,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 13,
    color: '#E2E8F0',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sectionSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  codeBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 3,
  },
  sosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    padding: 16,
    borderRadius: 18,
    gap: 12,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  sosEmoji: {
    fontSize: 32,
  },
  sosTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sosSub: {
    color: COLORS.dangerLight,
    fontSize: 12,
    marginTop: 2,
  },
  langList: {
    gap: 8,
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  langItemSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  langText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  langTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  modalEmoji: {
    fontSize: 54,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalActions: {
    width: '100%',
  },
});
