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

interface ObjectQuestion {
  id: number;
  prompt: string;
  correctAnswer: string;
  options: { label: string; emoji: string; name: string }[];
  hint: string;
}

interface ObjectRecognitionGameScreenProps {
  onBack: () => void;
  config?: GameConfig;
  onContinueNext?: () => void;
}

const DEFAULT_QUESTIONS: ObjectQuestion[] = [
  {
    id: 1,
    prompt: 'Which item is the famous traditional Assam Bamboo Basket (Japi / Khang)?',
    correctAnswer: 'Bamboo Basket',
    options: [
      { label: 'A', emoji: '🎋', name: 'Bamboo Basket' },
      { label: 'B', emoji: '🏺', name: 'Clay Pot' },
      { label: 'C', emoji: '🪑', name: 'Wooden Chair' },
    ],
    hint: 'Look for the woven green and yellow bamboo material!',
  },
  {
    id: 2,
    prompt: 'Which fruit is the famous North Eastern Kordoi / Starfruit?',
    correctAnswer: 'Starfruit',
    options: [
      { label: 'A', emoji: '🍎', name: 'Red Apple' },
      { label: 'B', emoji: '⭐', name: 'Starfruit' },
      { label: 'C', emoji: '🍌', name: 'Banana' },
    ],
    hint: 'It has star-shaped ridged slices!',
  },
  {
    id: 3,
    prompt: 'Which musical instrument is played during Bihu celebrations?',
    correctAnswer: 'Bihu Dhol',
    options: [
      { label: 'A', emoji: '🥁', name: 'Bihu Dhol' },
      { label: 'B', emoji: '🎸', name: 'Guitar' },
      { label: 'C', emoji: '🎺', name: 'Trumpet' },
    ],
    hint: 'It is a double-sided wooden drum played with sticks!',
  },
];

export const ObjectRecognitionGameScreen: React.FC<ObjectRecognitionGameScreenProps> = ({
  onBack,
  config,
  onContinueNext,
}) => {
  const { patient } = useAuth();
  const { recordGameCompletion } = useGameStats();
  const { t } = useTranslation();

  const [questions, setQuestions] = useState<ObjectQuestion[]>(DEFAULT_QUESTIONS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showHint, setShowHint] = useState(false);
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
    setShowHint(false);
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

  const handleSelect = (name: string) => {
    if (selectedOption !== null || !currentQ) return;
    setSelectedOption(name);

    const isCorrect = name === currentQ.correctAnswer;
    const nextCorrect = isCorrect ? correctAnswers + 1 : correctAnswers;
    const nextMistakes = !isCorrect ? mistakes + 1 : mistakes;

    if (isCorrect) setCorrectAnswers(nextCorrect);
    else setMistakes(nextMistakes);

    setTimeout(() => {
      if (currentIdx + 1 < totalCount) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOption(null);
        setShowHint(false);
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

    const res = await recordGameCompletion('objectRecognition', calculatedScore, accuracy, totalCount, {
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
        <Text style={styles.gameTitle}>{config?.title || t.games.game4Title}</Text>
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
          </View>

          {showHint && Boolean(currentQ.hint) && (
            <View style={styles.hintBanner}>
              <Text style={styles.hintText}>💡 {currentQ.hint}</Text>
            </View>
          )}

          {!showHint && Boolean(currentQ.hint) && (
            <TouchableOpacity
              style={styles.hintToggle}
              onPress={() => setShowHint(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.hintToggleText}>{t.games.needAClue}</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.optionsPrompt}>{t.games.chooseTheCorrectObject}</Text>

          <View style={styles.optionsContainer}>
            {currentQ.options.map((opt, index) => {
              const isChosen = selectedOption === opt.name;
              const isCorrect = selectedOption !== null && opt.name === currentQ.correctAnswer;
              const isWrong = isChosen && opt.name !== currentQ.correctAnswer;

              return (
                <TouchableOpacity
                  key={`${opt.name}-${index}`}
                  style={[
                    styles.optBtn,
                    isChosen && styles.optBtnChosen,
                    isCorrect && styles.optBtnCorrect,
                    isWrong && styles.optBtnWrong,
                  ]}
                  onPress={() => handleSelect(opt.name)}
                  activeOpacity={0.75}
                  disabled={selectedOption !== null}
                >
                  <Text style={styles.optEmoji}>{opt.emoji}</Text>
                  <Text
                    style={[
                      styles.optText,
                      (isChosen || isCorrect) && styles.optTextChosen,
                    ]}
                  >
                    {opt.name}
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
    marginBottom: 14,
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
    fontSize: 17,
    color: COLORS.textDark,
    fontWeight: '700',
    lineHeight: 25,
  },
  hintToggle: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  hintToggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  hintBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  hintText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 20,
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
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    flexDirection: 'row',
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
  optEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  optText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
  },
  optTextChosen: {
    color: COLORS.primaryDark,
  },
  badgeEmoji: {
    fontSize: 20,
    color: '#16A34A',
    fontWeight: '900',
    marginLeft: 8,
  },
});
