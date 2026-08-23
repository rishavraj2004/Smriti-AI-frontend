import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useGameStats } from '../../context/GameStatsContext';
import { useTranslation } from '../../hooks/useTranslation';
import { COLORS, SHADOWS } from '../../theme/theme';
import { ElderlyButton } from '../../components/ElderlyButton';
import { GameResultModal } from '../../components/GameResultModal';
import { GameConfig, SessionResultDetails, AdaptationDetails } from '../../types/games';
import { getRoutineStepsData, LocalizedRoutineStep } from '../../i18n/gameData';

interface RoutineRecallGameScreenProps {
  onBack: () => void;
  config?: GameConfig;
  onContinueNext?: () => void;
}

export const RoutineRecallGameScreen: React.FC<RoutineRecallGameScreenProps> = ({
  onBack,
  config,
  onContinueNext,
}) => {
  const { patient } = useAuth();
  const { recordGameCompletion } = useGameStats();
  const { t, language } = useTranslation();

  const [correctSequence, setCorrectSequence] = useState<LocalizedRoutineStep[]>([]);
  const [availableSteps, setAvailableSteps] = useState<LocalizedRoutineStep[]>([]);
  const [placedSequence, setPlacedSequence] = useState<LocalizedRoutineStep[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [rawScore, setRawScore] = useState(80);
  const [responseTimeMs, setResponseTimeMs] = useState(15000);
  const [sessionDetails, setSessionDetails] = useState<SessionResultDetails | null>(null);
  const [adaptationDetails, setAdaptationDetails] = useState<AdaptationDetails | null>(null);
  const [resultModalVisible, setResultModalVisible] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const difficulty = config?.difficulty || 1;

  useEffect(() => {
    setupGame();
  }, [config, language]);

  const setupGame = () => {
    startTimeRef.current = Date.now();
    setPlacedSequence([]);
    setIsCompleted(false);
    setIsCorrect(null);
    setMistakes(0);
    setResultModalVisible(false);
    setSessionDetails(null);
    setAdaptationDetails(null);

    if (config?.content?.correctSequence && Array.isArray(config.content.correctSequence) && config.content.correctSequence.length > 0) {
      setCorrectSequence(config.content.correctSequence);
      if (config.content.availableSteps) {
        setAvailableSteps(config.content.availableSteps);
      } else {
        setAvailableSteps([...config.content.correctSequence].sort(() => Math.random() - 0.5));
      }
    } else {
      const localizedSteps = getRoutineStepsData(language);
      setCorrectSequence(localizedSteps);
      setAvailableSteps([...localizedSteps].sort(() => Math.random() - 0.5));
    }
  };

  const totalSteps = correctSequence.length;

  const handleSelectStep = (step: LocalizedRoutineStep) => {
    if (placedSequence.length >= totalSteps) return;
    setPlacedSequence((prev) => [...prev, step]);
    setAvailableSteps((prev) => prev.filter((s) => s.id !== step.id));
    setIsCorrect(null);
  };

  const handleRemoveStep = (step: LocalizedRoutineStep) => {
    setPlacedSequence((prev) => prev.filter((s) => s.id !== step.id));
    setAvailableSteps((prev) => [...prev, step]);
    setIsCorrect(null);
  };

  const checkOrder = async () => {
    let matchCount = 0;
    placedSequence.forEach((item, index) => {
      if (item.order === index + 1) {
        matchCount += 1;
      }
    });

    const passed = matchCount === totalSteps;
    setIsCorrect(passed);

    if (passed) {
      setIsCompleted(true);
      const elapsedMs = Math.max(2000, Date.now() - startTimeRef.current);
      setResponseTimeMs(elapsedMs);

      const totalAttempts = totalSteps + mistakes;
      const accuracy = totalAttempts > 0 ? totalSteps / totalAttempts : 1.0;
      const calculatedScore = Math.max(50, Math.min(100, Math.round(accuracy * 100)));
      setRawScore(calculatedScore);

      const res = await recordGameCompletion('routineRecall', calculatedScore, accuracy, totalSteps, {
        difficulty,
        responseTimeMs: elapsedMs,
        mistakes,
        correctAnswers: totalSteps,
        totalQuestions: totalSteps,
        completed: true,
        startedAt: new Date(startTimeRef.current).toISOString(),
      });

      if (res && res.session) {
        setSessionDetails(res.session);
        setAdaptationDetails(res.adaptation);
      }

      setResultModalVisible(true);
    } else {
      setMistakes((prev) => prev + 1);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
          <Text style={styles.backBtnText}>{t.nav.back}</Text>
        </TouchableOpacity>
        <Text style={styles.gameTitle}>{config?.title || t.games.game5Title}</Text>
      </View>

      <View style={styles.instructionBanner}>
        <View style={styles.badgeRow}>
          <Text style={styles.badgeText}>{totalSteps} Steps</Text>
          <Text style={[styles.badgeText, { backgroundColor: '#FEF3C7', color: '#B45309' }]}>
            Level {difficulty}
          </Text>
        </View>
        <Text style={styles.instructionText}>{config?.instructions || t.games.routineInstruction}</Text>
      </View>

      {/* Target Slots */}
      <Text style={styles.sectionTitle}>{t.games.routineOrderTitle}:</Text>
      <View style={styles.slotsContainer}>
        {correctSequence.map((_, index) => {
          const item = placedSequence[index];
          return (
            <View key={index} style={styles.slotBox}>
              <View style={styles.slotNumberBadge}>
                <Text style={styles.slotNumberText}>
                  {t.games.step} {index + 1}
                </Text>
              </View>
              {item ? (
                <TouchableOpacity
                  style={styles.placedCard}
                  activeOpacity={0.8}
                  onPress={() => handleRemoveStep(item)}
                >
                  <Text style={styles.placedEmoji}>{item.emoji}</Text>
                  <Text style={styles.placedTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Ionicons name="close-circle" size={22} color={COLORS.danger} />
                </TouchableOpacity>
              ) : (
                <View style={styles.emptySlot}>
                  <Text style={styles.emptySlotText}>{t.games.tapActivityBelow}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Verification Feedback */}
      {isCorrect === false && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{t.games.outOfSequenceError}</Text>
        </View>
      )}

      {/* Check Order Button */}
      {placedSequence.length === totalSteps && (
        <View style={{ width: '100%', marginBottom: 16 }}>
          <ElderlyButton
            title={t.games.checkSequenceBtn}
            onPress={checkOrder}
            variant="primary"
            icon="✓"
            size="large"
          />
        </View>
      )}

      {/* Available Activities Pool */}
      {availableSteps.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>{t.games.availableActivities}:</Text>
          <View style={styles.availableList}>
            {availableSteps.map((step) => (
              <TouchableOpacity
                key={step.id}
                style={styles.availableCard}
                activeOpacity={0.7}
                onPress={() => handleSelectStep(step)}
              >
                <Text style={styles.availableEmoji}>{step.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.availableTitle}>{step.title}</Text>
                  <Text style={styles.availableTime}>{step.timeSlot}</Text>
                </View>
                <Ionicons name="add-circle" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Restart */}
      <View style={{ marginTop: 24, width: '100%' }}>
        <ElderlyButton
          title={t.games.playAgain}
          onPress={setupGame}
          variant="secondary"
          icon="🔄"
          size="normal"
        />
      </View>

      {/* Backend Result Modal */}
      <GameResultModal
        visible={resultModalVisible}
        score={rawScore}
        accuracy={Math.round((totalSteps / Math.max(1, totalSteps + mistakes)) * 100)}
        responseTimeMs={responseTimeMs}
        difficulty={difficulty}
        sessionDetails={sessionDetails}
        adaptationDetails={adaptationDetails}
        onContinue={() => {
          setResultModalVisible(false);
          if (onContinueNext) onContinueNext();
          else setupGame();
        }}
        onBackToGames={() => {
          setResultModalVisible(false);
          onBack();
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.bgMain,
    alignItems: 'center',
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    marginRight: 12,
    ...SHADOWS.card,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginLeft: 4,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    flex: 1,
  },
  instructionBanner: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    ...SHADOWS.card,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  instructionText: {
    fontSize: 15,
    color: COLORS.textDark,
    lineHeight: 22,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginTop: 4,
  },
  slotsContainer: {
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  slotBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  slotNumberBadge: {
    width: 75,
    paddingVertical: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  slotNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  placedCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.card,
  },
  placedEmoji: {
    fontSize: 26,
    marginRight: 10,
  },
  placedTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  emptySlot: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  emptySlotText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
  },
  availableList: {
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  availableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  availableEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  availableTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  availableTime: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
});
