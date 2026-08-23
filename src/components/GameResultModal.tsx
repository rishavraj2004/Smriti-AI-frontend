import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS } from '../theme/theme';
import { ElderlyButton } from './ElderlyButton';
import { SessionResultDetails, AdaptationDetails } from '../types/games';

interface GameResultModalProps {
  visible: boolean;
  score: number;
  accuracy: number;
  responseTimeMs: number;
  difficulty: number;
  sessionDetails?: SessionResultDetails | null;
  adaptationDetails?: AdaptationDetails | null;
  onContinue: () => void;
  onBackToGames: () => void;
}

const getDifficultyLabel = (diff: number): string => {
  switch (diff) {
    case 1:
      return 'Easy';
    case 2:
      return 'Medium';
    case 3:
      return 'Hard';
    default:
      return 'Standard';
  }
};

export const GameResultModal: React.FC<GameResultModalProps> = ({
  visible,
  score,
  accuracy,
  responseTimeMs,
  difficulty,
  sessionDetails,
  adaptationDetails,
  onContinue,
  onBackToGames,
}) => {
  const displayScore = sessionDetails?.performanceScore ?? score;
  const displayAccuracy = sessionDetails?.accuracy ? Math.round(sessionDetails.accuracy * 100) : accuracy;
  const displayTimeSec = (responseTimeMs / 1000).toFixed(1);
  const displayDifficulty = getDifficultyLabel(sessionDetails?.difficulty || difficulty);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.congratsTitle}>Great Job!</Text>
          <Text style={styles.congratsSub}>Today's Cognitive Exercise Completed</Text>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Official Performance Score</Text>
            <Text style={styles.scoreValue}>{displayScore}</Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricTitle}>Accuracy</Text>
              <Text style={styles.metricValue}>{displayAccuracy}%</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricTitle}>Response Time</Text>
              <Text style={styles.metricValue}>{displayTimeSec}s</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricTitle}>Difficulty</Text>
              <Text style={styles.metricValue}>{displayDifficulty}</Text>
            </View>
          </View>

          {adaptationDetails && (
            <View style={styles.adaptationCard}>
              <Text style={styles.adaptationHeader}>
                {adaptationDetails.nextDifficulty > adaptationDetails.previousDifficulty
                  ? '📈 Difficulty Increased'
                  : adaptationDetails.nextDifficulty < adaptationDetails.previousDifficulty
                  ? '🎯 Pacing Adjusted'
                  : '✨ Consistent Rhythm'}
              </Text>
              <Text style={styles.adaptationReason}>{adaptationDetails.reason}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <ElderlyButton
              title="Continue to Next Exercise"
              onPress={onContinue}
              variant="primary"
              icon="➡️"
              size="large"
            />
            <TouchableOpacity style={styles.secondaryBtn} onPress={onBackToGames} activeOpacity={0.7}>
              <Text style={styles.secondaryBtnText}>Back to Games Hub</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  congratsTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  congratsSub: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreContainer: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#CBD5E1',
  },
  adaptationCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  adaptationHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 2,
  },
  adaptationReason: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});
