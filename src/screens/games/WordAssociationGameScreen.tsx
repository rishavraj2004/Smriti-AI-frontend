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
import { getWordPromptsData, LocalizedWordPrompt } from '../../i18n/gameData';

interface WordAssociationGameScreenProps {
  onBack: () => void;
  config?: GameConfig;
  onContinueNext?: () => void;
}

export const WordAssociationGameScreen: React.FC<WordAssociationGameScreenProps> = ({
  onBack,
  config,
  onContinueNext,
}) => {
  const { patient } = useAuth();
  const { recordGameCompletion } = useGameStats();
  const { t, language } = useTranslation();

  const [prompts, setPrompts] = useState<LocalizedWordPrompt[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
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
  }, [config, language]);

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

    if (config?.content?.questions && Array.isArray(config.content.questions) && config.content.questions.length > 0) {
      const normalized: LocalizedWordPrompt[] = config.content.questions.map((p: any, idx: number) => {
        const prefix = p.prefix || p.prompt || p.question || '';
        const rawOptions = Array.isArray(p.options) ? p.options : [];
        const options = rawOptions.map((opt: any) =>
          typeof opt === 'string' ? opt : opt.word || opt.text || opt.name || opt.label || String(opt)
        );
        const rawCorrect = p.correctWord || p.correct_word || p.correctAnswer || p.answer || '';
        let correctWord = typeof rawCorrect === 'string' ? rawCorrect : '';
        if (typeof rawCorrect === 'number' && options[rawCorrect]) {
          correctWord = options[rawCorrect];
        }

        return {
          id: p.id || idx + 1,
          prefix,
          correctWord: correctWord || options[0] || '',
          options,
          hint: p.hint || '',
        };
      });
      setPrompts(normalized);
    } else {
      setPrompts(getWordPromptsData(language));
    }
  };

  const currentP = prompts[currentIdx] || prompts[0];
  const totalCount = prompts.length;

  const handleSelect = (opt: string) => {
    if (selectedOption !== null || !currentP) return;
    setSelectedOption(opt);

    const isCorrect =
      opt === currentP.correctWord ||
      (currentP.correctWord &&
        opt.toLowerCase().trim() === currentP.correctWord.toLowerCase().trim());

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

    const res = await recordGameCompletion('wordAssociation', calculatedScore, accuracy, totalCount, {
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
        <Text style={styles.gameTitle}>{config?.title || t.games.game6Title}</Text>
      </View>

      {currentP && (
        <>
          <View style={styles.promptCard}>
            <View style={styles.badgeRow}>
              <Text style={styles.pCount}>
                {t.games.round} {currentIdx + 1} {t.games.of} {totalCount}
              </Text>
              <Text style={[styles.pCount, { backgroundColor: '#FEF3C7', color: '#B45309' }]}>
                Level {difficulty}
              </Text>
            </View>
            <Text style={styles.prefixText}>{currentP.prefix}</Text>
            <View style={styles.blankBox}>
              <Text style={styles.blankText}>
                {selectedOption || t.games.selectMatchingPhrase}
              </Text>
            </View>
          </View>

          {Boolean(currentP.hint) && (
            <View style={styles.hintCard}>
              <Text style={styles.hintText}>💡 {currentP.hint}</Text>
            </View>
          )}

          <Text style={styles.optionsPrompt}>{t.games.selectMatchingPhrase}</Text>

          <View style={styles.optionsList}>
            {currentP.options.map((opt, index) => {
              const optText = typeof opt === 'string' ? opt : (opt as any).word || (opt as any).text || String(opt);
              const isSelected = selectedOption === optText;
              const isCorrect =
                selectedOption !== null &&
                (optText === currentP.correctWord ||
                  (currentP.correctWord &&
                    optText.toLowerCase().trim() === currentP.correctWord.toLowerCase().trim()));
              const isWrong = isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={`${optText}-${index}`}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionChosen,
                    isCorrect && styles.optionCorrect,
                    isWrong && styles.optionWrong,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleSelect(optText)}
                  disabled={selectedOption !== null}
                >
                  <Text
                    style={[
                      styles.optionText,
                      (isSelected || isCorrect) && styles.optionTextChosen,
                    ]}
                  >
                    {optText}
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
    marginBottom: 14,
    ...SHADOWS.card,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  pCount: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  prefixText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    lineHeight: 28,
    marginBottom: 12,
  },
  blankBox: {
    backgroundColor: COLORS.bgMain,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  blankText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  hintCard: {
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
  optionsList: {
    width: '100%',
    gap: 12,
  },
  optionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.card,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    minHeight: 64,
  },
  optionChosen: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  optionCorrect: {
    borderColor: '#22C55E',
    backgroundColor: '#DCFCE7',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
  },
  optionTextChosen: {
    color: COLORS.primaryDark,
  },
  badgeEmoji: {
    fontSize: 20,
    color: '#16A34A',
    fontWeight: '900',
    marginLeft: 8,
  },
});
