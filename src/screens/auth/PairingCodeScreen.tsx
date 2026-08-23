import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS, SHADOWS } from '../../theme/theme';
import { ElderlyButton } from '../../components/ElderlyButton';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

interface PairingCodeScreenProps {
  codeOverride?: string;
  onContinue: () => void;
}

export const PairingCodeScreen: React.FC<PairingCodeScreenProps> = ({
  codeOverride,
  onContinue,
}) => {
  const { patient } = useAuth();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const displayCode = codeOverride || patient?.pairingCode || 'SMR-PENDING';

  const handleCopyCode = async () => {
    try {
      if (displayCode && displayCode !== 'SMR-PENDING') {
        await Clipboard.setStringAsync(displayCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.badgeCircle}>
          <Text style={styles.badgeEmoji}>🤝</Text>
        </View>

        <Text style={styles.title}>{t.auth.accountCreatedTitle}</Text>
        <Text style={styles.subtitle}>
          {t.auth.welcomeFriend}, {patient?.name || 'Friend'}.
        </Text>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>{t.auth.caregiverPairingCodeLabel}</Text>
          <Text style={styles.codeText}>{displayCode}</Text>
          <Text style={styles.codeExplanation}>
            {t.auth.pairingExplanation}
          </Text>
        </View>

        {/* Copy Button */}
        <ElderlyButton
          title={copied ? t.profile.codeCopied : t.profile.copyCode}
          onPress={handleCopyCode}
          variant={copied ? 'success' : 'secondary'}
          icon={copied ? '✓' : '📋'}
          style={{ marginBottom: 12 }}
        />

        {/* Continue to App */}
        <ElderlyButton
          title={t.auth.continueToHub}
          onPress={onContinue}
          variant="primary"
          icon="🚀"
        />
      </View>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  badgeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badgeEmoji: {
    fontSize: 44,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  codeContainer: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  codeText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 4,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  codeExplanation: {
    fontSize: 14,
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 20,
  },
});
