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
import { getAttentionRoundsData, LocalizedAttentionItem, LocalizedAttentionRound } from '../../i18n/gameData';

interface AttentionGameScreenProps {
  onBack: () => void;
  config?: GameConfig;
  onContinueNext?: () => void;
}

export const AttentionGameScreen: React.FC<AttentionGameScreenProps> = ({
  onBack,
  config,
  onContinueNext,
}) => {
  const { patient } = useAuth();
  const { recordGameCompletion } = useGameStats();
  const { t, language } = useTranslation();

  const [roundIndex, setRoundIndex] = useState(0);
  const [rounds, setRounds] = useState<LocalizedAttentionRound[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState<'SUCCESS' | 'TRY_AGAIN' | null>(null);
  const [isFinished, setIsFinished] = useState(false);
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
    setRoundIndex(0);
    setMistakes(0);
    setCorrectAnswers(0);
    setFeedback(null);
    setIsFinished(false);
    setResultModalVisible(false);
    setSessionDetails(null);
    setAdaptationDetails(null);

    if (config?.content?.rounds && Array.isArray(config.content.rounds) && config.content.rounds.length > 0) {
      setRounds(config.content.rounds);
    } else {
      const generatedRounds = getAttentionRoundsData(language, 5);
      setRounds(generatedRounds);
    }
  };

  const currentRound = rounds[roundIndex] || null;
  const totalRounds = rounds.length || 5;

  const handleSelect = (item: LocalizedAttentionItem) => {
    if (!currentRound || feedback !== null) return;

    const isMatch = item.name === currentRound.target.name || (item.id && item.id === currentRound.target.id);

    if (isMatch) {
      const nextCorrect = correctAnswers + 1;
      setCorrectAnswers(nextCorrect);
      setFeedback('SUCCESS');

      setTimeout(() => {
        if (roundIndex + 1 >= totalRounds) {
          handleFinish(nextCorrect, mistakes);
        } else {
          setRoundIndex((prev) => prev + 1);
          setFeedback(null);
        }
      }, 600);
    } else {
      setMistakes((prev) => prev + 1);
      setFeedback('TRY_AGAIN');
      setTimeout(() => {
        setFeedback(null);
      }, 800);
    }
  };

  const handleFinish = async (finalCorrect: number, finalMistakes: number) => {
    setIsFinished(true);
    const elapsedMs = Math.max(2000, Date.now() - startTimeRef.current);
    setResponseTimeMs(elapsedMs);

    const totalAttempts = finalCorrect + finalMistakes;
    const accuracy = totalAttempts > 0 ? finalCorrect / totalAttempts : 1.0;
    const calculatedScore = Math.max(50, Math.min(100, Math.round(accuracy * 100)));
    setRawScore(calculatedScore);

    const res = await recordGameCompletion('attention', calculatedScore, accuracy, totalAttempts, {
      difficulty,
      responseTimeMs: elapsedMs,
      mistakes: finalMistakes,
      correctAnswers: finalCorrect,
      totalQuestions: totalRounds,
      completed: true,
      startedAt: new Date(startTimeRef.current).toISOString(),
    });

    if (res && res.session) {
      setSessionDetails(res.session);
      setAdaptationDetails(res.adaptation);
    }

    setResultModalVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
          <Text style={styles.backBtnText}>{t.nav.back}</Text>
        </TouchableOpacity>
        <Text style={styles.gameTitle}>{config?.title || t.games.game2Title}</Text>
      </View>

      {currentRound && (
        <>
          <View style={styles.promptCard}>
            <View style={styles.badgeRow}>
              <Text style={styles.roundBadge}>
                {t.games.round} {roundIndex + 1} {t.games.of} {totalRounds}
              </Text>
              <Text style={[styles.roundBadge, { backgroundColor: '#FEF3C7', color: '#B45309' }]}>
                Level {difficulty}
              </Text>
            </View>
            <Text style={styles.promptLabel}>{t.games.findAndTap}</Text>
            <View style={styles.targetDisplay}>
              <Text style={styles.targetEmoji}>{currentRound.target.symbol}</Text>
              <Text style={styles.targetName}>{currentRound.target.name}</Text>
            </View>
          </View>

          {feedback === 'SUCCESS' && (
            <View style={styles.successBanner}>
              <Text style={styles.feedbackText}>{t.games.greatJobCorrect}</Text>
            </View>
          )}

          {feedback === 'TRY_AGAIN' && (
            <View style={styles.tryAgainBanner}>
              <Text style={styles.feedbackText}>{t.games.tryAgainGently}</Text>
            </View>
          )}

          {/* Grid Selection Cards */}
          <View style={styles.gridContainer}>
            {currentRound.grid.map((item, index) => (
              <TouchableOpacity
                key={`${item.name}-${index}`}
                style={styles.gridCard}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.gridEmoji}>{item.symbol}</Text>
                <Text style={styles.gridName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Restart Game */}
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
        accuracy={Math.round((correctAnswers / Math.max(1, totalRounds)) * 100)}
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
  promptCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.card,
    borderWidth: 2,
    borderColor: '#E0E7FF',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  roundBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  promptLabel: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: '600',
    marginBottom: 12,
  },
  targetDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  targetEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  targetName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  successBanner: {
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  tryAgainBanner: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  feedbackText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  gridCard: {
    width: '47%',
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    minHeight: 115,
  },
  gridEmoji: {
    fontSize: 38,
    marginBottom: 8,
  },
  gridName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
  },
});
