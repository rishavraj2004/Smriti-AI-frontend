import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { getLanguageLabel } from '../../utils/formatters';

export const MitrAIScreen: React.FC = () => {
  const { patient } = useAuth();
  const { t } = useTranslation();
  const currentLangLabel = getLanguageLabel(patient?.language || 'en');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Mitr AI Hero */}
      <View style={styles.heroCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>🤖</Text>
        </View>
        <Text style={styles.title}>{t.mitr.title}</Text>
        <Text style={styles.subtitle}>{t.mitr.subtitle}</Text>

        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{t.mitr.statusConnecting}</Text>
        </View>
      </View>

      {/* Main Notice in accordance with V1 specification */}
      <View style={styles.noticeCard}>
        <Text style={styles.noticeIcon}>📡</Text>
        <Text style={styles.noticeTitle}>{t.mitr.calibratingTitle}</Text>
        <Text style={styles.noticeBody}>
          {t.mitr.calibratingBody} ({currentLangLabel}).
        </Text>
        <Text style={styles.noticeSub}>{t.mitr.calibratingSub}</Text>
      </View>

      {/* Capabilities Overview */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t.mitr.upcomingTitle}</Text>

        <View style={styles.featureItem}>
          <Ionicons name="mic-outline" size={26} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>{t.mitr.voiceFeature}</Text>
            <Text style={styles.featureSub}>{t.mitr.voiceFeatureSub}</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="heart-outline" size={26} color={COLORS.secondary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>{t.mitr.reassuranceFeature}</Text>
            <Text style={styles.featureSub}>{t.mitr.reassuranceFeatureSub}</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="notifications-outline" size={26} color={COLORS.success} />
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>{t.mitr.reminderFeature}</Text>
            <Text style={styles.featureSub}>{t.mitr.reminderFeatureSub}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.bgMain,
    flexGrow: 1,
  },
  heroCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.card,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.card,
  },
  noticeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  noticeBody: {
    fontSize: 15,
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 6,
  },
  noticeSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
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
    marginBottom: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  featureSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
});
