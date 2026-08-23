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

interface MathQuestion {
  id: number;
  prompt: string;
  itemsDisplay?: string | null;
  correctAnswer: number;
  options: number[];
  explanation?: string;
}

interface MathMemoryGameScreenProps {
  onBack: () => void;
  config?: GameConfig;
  onContinueNext?: () => void;
}

const DEFAULT_QUESTIONS: MathQuestion[] = [
  {
    id: 1,
    prompt: 'Count how many fresh Assam tea leaves are displayed below:',
    itemsDisplay: '🌱  🌱  🌱  🌱',
    correctAnswer: 4,
    options: [3, 4, 5, 6],
  },
  {
    id: 2,
    prompt: 'You take 2 morning pills and 1 evening pill. How many total pills in a day?',
    correctAnswer: 3,
    options: [2, 3, 4, 5],
  },
  {
    id: 3,
    prompt: 'If you have 5 fresh starfruits and share 2 with your neighbor, how many do you have left?',
    correctAnswer: 3,
    options: [2, 3, 4, 1],
  },
  {
    id: 4,
    prompt: 'Count how many drumsticks are used for 2 Bihu Dhols (2 per dhol):',
    itemsDisplay: '🥢 🥢   🥢 🥢',
    correctAnswer: 4,
    options: [2, 4, 6, 8],
  },
];

export const MathMemoryGameScreen: React.FC<MathMemoryGameScreenProps> = ({
  onBack,
  config,
  onContinueNext,
}) => {
  const { patient } = useAuth();
  const { recordGameCompletion } = useGameStats();
  const { t } = useTranslation();

  const [questions, setQuestions] = useState<MathQuestion[]>(DEFAULT_QUESTIONS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
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
  }, [config]);

  const setupGame = () => {
    startTimeRef.current = Date.now();
    setCurrentIdx(0);
    setSelectedOption(null);
    setMistakes(0);
    setCorrectAnswers(0);
    setIsFinished(false);
    setResultModalVisible(false);
    setSessionDetails(null);
    setAdaptationDetails(null);

    if (config?.content?.questions && Array.isArray(config.content.questions)) {
      setQuestions(config.content.questions);
    } else {
      setQuestions(DEFAULT_QUESTIONS);
    }
  };

  const currentQ = questions[currentIdx] || questions[0];
  const totalCount = questions.length;

  const handleSelect = (opt: number) => {
    if (selectedOption !== null || !currentQ) return;
    setSelectedOption(opt);

    const isCorrect = opt === currentQ.correctAnswer;
    const nextCorrect = isCorrect ? correctAnswers + 1 : correctAnswers;
    const nextMistakes = !isCorrect ? mistakes + 1 : mistakes;

    if (isCorrect) setCorrectAnswers(nextCorrect);
    else setMistakes(nextMistakes);

    setTimeout(() => {
      if (currentIdx + 1 < totalCount) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        handleFinish(nextCorrect, nextMistakes);
      }
    }, 900);
  };

  const handleFinish = async (finalCorrect: number, finalMistakes: number) => {
    setIsFinished(true);
    const elapsedMs = Math.max(2000, Date.now() - startTimeRef.current);
    setResponseTimeMs(elapsedMs);

    const accuracy = totalCount > 0 ? finalCorrect / totalCount : 1.0;
    const calculatedScore = Math.max(50, Math.min(100, Math.round(accuracy * 100)));
    setRawScore(calculatedScore);

    const res = await recordGameCompletion('mathMemory', calculatedScore, accuracy, totalCount, {
      difficulty,
      responseTimeMs: elapsedMs,
      mistakes: finalMistakes,
      correctAnswers: finalCorrect,
      totalQuestions: totalCount,
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
        <Text style={styles.gameTitle}>{config?.title || t.games.game3Title}</Text>
      </View>

      {currentQ && (
        <>
          <View style={styles.questionCard}>
            <View style={styles.badgeRow}>
              <Text style={styles.qCount}>
                {t.games.round} {currentIdx + 1} {t.games.of} {totalCount}
              </Text>
              <Text style={[styles.qCount, { backgroundColor: '#FEF3C7', color: '#B45309' }]}>
                Level {difficulty}
              </Text>
            </View>
            <Text style={styles.qText}>{currentQ.prompt}</Text>
            {Boolean(currentQ.itemsDisplay) && (
              <View style={styles.itemsBox}>
                <Text style={styles.itemsText}>{currentQ.itemsDisplay}</Text>
              </View>
            )}
          </View>

          <Text style={styles.optionsPrompt}>{t.games.selectYourAnswer}</Text>

          <View style={styles.optionsContainer}>
            {currentQ.options.map((opt, index) => {
              const isChosen = selectedOption === opt;
              const isCorrect = selectedOption !== null && opt === currentQ.correctAnswer;
              const isWrong = isChosen && opt !== currentQ.correctAnswer;

              return (
                <TouchableOpacity
                  key={`${opt}-${index}`}
                  style={[
                    styles.optBtn,
                    isChosen && styles.optBtnChosen,
                    isCorrect && styles.optBtnCorrect,
                    isWrong && styles.optBtnWrong,
                  ]}
                  onPress={() => handleSelect(opt)}
                  activeOpacity={0.75}
                  disabled={selectedOption !== null}
                >
                  <Text
                    style={[
                      styles.optText,
                      (isChosen || isCorrect) && styles.optTextChosen,
                    ]}
                  >
                    {opt}
                  </Text>
                  {isCorrect && <Text style={styles.badgeEmoji}>✓</Text>}
                </TouchableOpacity>
              );
            })}
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
        accuracy={Math.round((correctAnswers / Math.max(1, totalCount)) * 100)}
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
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.white,
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
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    ...SHADOWS.card,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  qCount: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  qText: {
    fontSize: 18,
    color: COLORS.textDark,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 12,
  },
  itemsBox: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginTop: 6,
  },
  itemsText: {
    fontSize: 32,
    letterSpacing: 8,
  },
  optionsPrompt: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
  },
  optBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...SHADOWS.card,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  optBtnChosen: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  optBtnCorrect: {
    borderColor: '#22C55E',
    backgroundColor: '#DCFCE7',
  },
  optBtnWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  optText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  optTextChosen: {
    color: COLORS.primaryDark,
  },
  badgeEmoji: {
    fontSize: 20,
    marginLeft: 10,
    color: '#16A34A',
    fontWeight: '900',
  },
});
