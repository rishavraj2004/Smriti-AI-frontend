import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS, SHADOWS } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { ElderlyButton } from './ElderlyButton';

export const HeaderBar: React.FC = () => {
  const { patient } = useAuth();
  const { t } = useTranslation();
  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [sosSentModalVisible, setSosSentModalVisible] = useState(false);

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
            <Text style={styles.logoEmoji}>🧠</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>Smriti AI</Text>
            <Text style={styles.patientSubtitle} numberOfLines={1}>
              {patient ? `${t.home.goodMorning}, ${patient.name}` : 'Cognitive Care (NER)'}
            </Text>
          </View>
        </View>

        {/* Right side: Online indicator & SOS Button */}
        <View style={styles.rightSection}>
          <View style={styles.statusPill}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>{t.nav.active}</Text>
          </View>

          <TouchableOpacity
            style={styles.sosButton}
            activeOpacity={0.8}
            onPress={() => setSosModalVisible(true)}
          >
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
            <Text style={styles.modalEmoji}>🚨</Text>
            <Text style={styles.modalTitle}>{t.profile.emergencySosTitle}</Text>
            <Text style={styles.modalSubtitle}>
              {t.profile.emergencySosSub} ({patient?.name || 'Patient'}).
            </Text>

            <View style={styles.modalActions}>
              <ElderlyButton
                title={t.profile.emergencySosTitle}
                onPress={handleTriggerSOS}
                variant="danger"
                icon="🚨"
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
            <Text style={styles.modalEmoji}>🚨</Text>
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
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoEmoji: {
    fontSize: 24,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  patientSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryLight,
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
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  sosButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
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
