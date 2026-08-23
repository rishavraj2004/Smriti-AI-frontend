import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { ElderlyButton } from '../../components/ElderlyButton';
import { useTranslation } from '../../hooks/useTranslation';

interface WelcomeScreenProps {
  onGoToLogin: () => void;
  onGoToSignup: () => void;
  onGoToCaregiver: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGoToLogin,
  onGoToSignup,
  onGoToCaregiver,
}) => {
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Brand Hero */}
      <View style={styles.heroCard}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🧠</Text>
        </View>
        <Text style={styles.heroTitle}>{t.auth.welcomeTitle}</Text>
        <Text style={styles.heroSubtitle}>{t.auth.welcomeSubtitle}</Text>
        <Text style={styles.heroDescription}>
          {t.auth.welcomeDesc}
        </Text>
      </View>

      {/* Feature highlights */}
      <View style={styles.highlightsContainer}>
        <View style={styles.highlightItem}>
          <Text style={styles.highlightEmoji}>🌸</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.highlightTitle}>{t.auth.familiarCulture}</Text>
            <Text style={styles.highlightSub}>{t.auth.familiarCultureSub}</Text>
          </View>
        </View>

        <View style={styles.highlightItem}>
          <Text style={styles.highlightEmoji}>🗣️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.highlightTitle}>{t.auth.regionalLangSupport}</Text>
            <Text style={styles.highlightSub}>{t.auth.regionalLangSupportSub}</Text>
          </View>
        </View>

        <View style={styles.highlightItem}>
          <Text style={styles.highlightEmoji}>🤝</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.highlightTitle}>{t.auth.caregiverConnect}</Text>
            <Text style={styles.highlightSub}>{t.auth.caregiverConnectSub}</Text>
          </View>
        </View>
      </View>

      {/* Primary Actions */}
      <View style={styles.actionContainer}>
        <ElderlyButton
          title={t.auth.createPatientAccount}
          onPress={onGoToSignup}
          variant="primary"
          icon="✨"
        />
        <ElderlyButton
          title={t.auth.signInExisting}
          onPress={onGoToLogin}
          variant="outline"
          icon="🔑"
          style={{ marginTop: 8 }}
        />
        <ElderlyButton
          title={t.auth.caregiverPortal}
          onPress={onGoToCaregiver}
          variant="secondary"
          icon="🤝"
          style={{ marginTop: 8 }}
        />
      </View>

      <Text style={styles.footerNote}>
        Safe • High Contrast • Large Touch Targets
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.bgMain,
    flexGrow: 1,
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    ...SHADOWS.card,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoEmoji: {
    fontSize: 44,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginTop: 4,
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 16,
    color: '#F8FAFC',
    textAlign: 'center',
    lineHeight: 23,
  },
  highlightsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 14,
    ...SHADOWS.card,
  },
  highlightEmoji: {
    fontSize: 32,
  },
  highlightTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  highlightSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actionContainer: {
    marginBottom: 16,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});
