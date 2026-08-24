import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { ElderlyButton } from './ElderlyButton';
import { SpeakerButton } from './SpeakerButton';

export const HeaderBar: React.FC = () => {
  const { patient } = useAuth();
  const { t } = useTranslation();
  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [sosSentModalVisible, setSosSentModalVisible] = useState(false);

  const headerSpeechText = patient
    ? `Smriti AI. ${t.home.goodMorning}, ${patient.name}.`
    : 'Smriti AI Cognitive Care.';

  const handleTriggerSOS = () => {
    setSosModalVisible(false);
    setSosSentModalVisible(true);
  };

  return (
    <>
      <View style={styles.headerContainer}>
        {/* Brand & Patient info */}
        <View style={styles.leftSection}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="brain" size={24} color={COLORS.primaryDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.brandTitle}>Smriti AI</Text>
            <Text style={styles.patientSubtitle} numberOfLines={1}>
              {patient ? `${t.home.goodMorning}, ${patient.name}` : 'Cognitive Care (NER)'}
            </Text>
          </View>
        </View>

        {/* Right side: Speaker, Online indicator & SOS Button */}
        <View style={styles.rightSection}>
          <SpeakerButton
            text={headerSpeechText}
            size="small"
            backgroundColor="rgba(255, 255, 255, 0.14)"
            color="#FFFFFF"
          />

          <View style={styles.statusPill}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>{t.nav.active}</Text>
          </View>

          <TouchableOpacity
            style={styles.sosButton}
            activeOpacity={0.8}
            onPress={() => setSosModalVisible(true)}
          >
            <Ionicons name="alert-circle" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.sosText}>{t.nav.sos}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SOS Confirmation Modal */}
      <Modal
        visible={sosModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSosModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="warning-outline" size={36} color={COLORS.danger} />
            </View>
            <Text style={styles.modalTitle}>{t.profile.emergencySosTitle}</Text>
            <Text style={styles.modalSubtitle}>
              {t.profile.emergencySosSub} ({patient?.name || 'Patient'}).
            </Text>

            <View style={styles.modalActions}>
              <ElderlyButton
                title={t.profile.emergencySosTitle}
                onPress={handleTriggerSOS}
                variant="danger"
                style={{ marginBottom: 10, width: '100%' }}
              />
              <ElderlyButton
                title={t.nav.cancel}
                onPress={() => setSosModalVisible(false)}
                variant="outline"
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* SOS Sent Modal */}
      <Modal
        visible={sosSentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSosSentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIconCircle, { backgroundColor: COLORS.successLight }]}>
              <Ionicons name="checkmark-circle-outline" size={36} color={COLORS.success} />
            </View>
            <Text style={styles.modalTitle}>{t.profile.emergencySosTitle}</Text>
            <Text style={styles.modalSubtitle}>
              {t.profile.emergencySosSub} ({patient?.name || 'Patient'}). Code: {patient?.pairingCode || 'N/A'}.
            </Text>

            <View style={styles.modalActions}>
              <ElderlyButton
                title={t.nav.ok}
                onPress={() => setSosSentModalVisible(false)}
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
  headerContainer: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  patientSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primaryLight,
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  sosButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.danger,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
    ...SHADOWS.cardHover,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 22,
  },
  modalActions: {
    width: '100%',
  },
});
