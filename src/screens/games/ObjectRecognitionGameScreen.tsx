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
import { getObjectQuestionsData, LocalizedObjectQuestion } from '../../i18n/gameData';

interface ObjectRecognitionGameScreenProps {
  onBack: () => void;
  config?: GameConfig;
  onContinueNext?: () => void;
}

// Intelligent contextual emoji and icon resolver for diverse options across languages
const resolveOptionIcon = (text: string, index: number, explicitEmoji?: string): string => {
  if (explicitEmoji && explicitEmoji !== '🌿' && explicitEmoji !== '🔹') {
    return explicitEmoji;
  }

  const lower = (text || '').toLowerCase().trim();

  // 1. Beverages & Liquids
  if (lower.includes('tea') || lower.includes('चाय') || lower.includes('চাহ') || lower.includes('চা') || lower.includes('thingpui')) return '🍵';
  if (lower.includes('coffee') || lower.includes('कॉफ़ी') || lower.includes('कफी')) return '☕';
  if (lower.includes('sugarcane') || lower.includes('गन्ना') || lower.includes('ইক্ষু') || lower.includes('juice') || lower.includes('रस') || lower.includes('জুস')) return '🧃';
  if (lower.includes('coconut') || lower.includes('नारियल') || lower.includes('নাৰিকল') || lower.includes('নারকেল')) return '🥥';
  if (lower.includes('water') || lower.includes('पानी') || lower.includes('পানী') || lower.includes('জল')) return '💧';
  if (lower.includes('milk') || lower.includes('दूध') || lower.includes('গাখীৰ') || lower.includes('দুধ') || lower.includes('lassi') || lower.includes('लस्सी')) return '🥛';

  // 2. Animals & Wildlife
  if (lower.includes('rhino') || lower.includes('गैंडा') || lower.includes('গঁড়') || lower.includes('গণ্ডার') || lower.includes('সমুক')) return '🦏';
  if (lower.includes('elephant') || lower.includes('हाथी') || lower.includes('হাতী') || lower.includes('হাতি')) return '🐘';
  if (lower.includes('deer') || lower.includes('हिरण') || lower.includes('হৰিণা') || lower.includes('হরিণ')) return '🦌';
  if (lower.includes('tiger') || lower.includes('बाघ') || lower.includes('বাঘ')) return '🐅';
  if (lower.includes('bird') || lower.includes('hornbill') || lower.includes('पक्षी') || lower.includes('ধনেশ') || lower.includes('পাখি') || lower.includes('উচেক')) return '🦜';
  if (lower.includes('fish') || lower.includes('मछली') || lower.includes('মাছ')) return '🐟';

  // 3. Cultural Artifacts, Crafts & Household
  if (lower.includes('bamboo') || lower.includes('बांस') || lower.includes('বাঁহ') || lower.includes('বাঁশ') || lower.includes('basket') || lower.includes('टोकरी') || lower.includes('japi') || lower.includes('জাপি') || lower.includes('খাং')) return '🎋';
  if (lower.includes('pot') || lower.includes('clay') || lower.includes('बर्तन') || lower.includes('মাটিৰ') || lower.includes('মাটির') || lower.includes('কলহ') || lower.includes('মটকা') || lower.includes('ঘड़ा')) return '🏺';
  if (lower.includes('chair') || lower.includes('कुर्सी') || lower.includes('চকী') || lower.includes('চেয়ার')) return '🪑';
  if (lower.includes('table') || lower.includes('मेज') || lower.includes('টেবিল') || lower.includes('কাষ্ঠ')) return '🪵';
  if (lower.includes('lamp') || lower.includes('दिया') || lower.includes('চাকি') || lower.includes('প্রদীপ')) return '🪔';
  if (lower.includes('bell') || lower.includes('घंटी') || lower.includes('ঘণ্টা')) return '🔔';

  // 4. Musical Instruments
  if (lower.includes('dhol') || lower.includes('drum') || lower.includes('ढोल') || lower.includes('ঢোল') || lower.includes('khuang')) return '🥁';
  if (lower.includes('flute') || lower.includes('pepa') || lower.includes('बांसुरी') || lower.includes('पेपा') || lower.includes('বাঁশী') || lower.includes('পেঁপা')) return '🪈';
  if (lower.includes('guitar') || lower.includes('गिटार') || lower.includes('গিটাৰ')) return '🎸';
  if (lower.includes('trumpet') || lower.includes('तुरही')) return '🎺';
  if (lower.includes('cymbals') || lower.includes('झांझ') || lower.includes('তাল')) return '🔔';

  // 5. Fruits, Food & Agriculture
  if (lower.includes('starfruit') || lower.includes('कमरख') || lower.includes('কৰ্দৈ') || lower.includes('কামরাঙা')) return '⭐';
  if (lower.includes('apple') || lower.includes('सेब') || lower.includes('আপেল')) return '🍎';
  if (lower.includes('banana') || lower.includes('केला') || lower.includes('কল') || lower.includes('কলা')) return '🍌';
  if (lower.includes('mango') || lower.includes('आम') || lower.includes('আম')) return '🥭';
  if (lower.includes('orange') || lower.includes('संतरा') || lower.includes('কমলা')) return '🍊';
  if (lower.includes('paddy') || lower.includes('rice') || lower.includes('धान') || lower.includes('चावल') || lower.includes('ধান') || lower.includes('ভাত')) return '🌾';

  // 6. Textiles, Nature & Geography
  if (lower.includes('silk') || lower.includes('muga') || lower.includes('रेशम') || lower.includes('চাদৰ') || lower.includes('শাড়ী') || lower.includes('মেখেলা') || lower.includes('कपड़ा') || lower.includes('গামোচা') || lower.includes('gamusa')) return '🧣';
  if (lower.includes('river') || lower.includes('boat') || lower.includes('नदी') || lower.includes('नाव') || lower.includes('নৈ') || lower.includes('নাও') || lower.includes('লোকটক')) return '⛵';
  if (lower.includes('mountain') || lower.includes('hill') || lower.includes('पहाड़') || lower.includes('পাহাৰ')) return '⛰️';
  if (lower.includes('flower') || lower.includes('फूल') || lower.includes('ফুল') || lower.includes('rhodo') || lower.includes('পদ্ম') || lower.includes('कमल')) return '🌸';
  if (lower.includes('tree') || lower.includes('forest') || lower.includes('पेड़') || lower.includes('জঙ্গল') || lower.includes('গাছ')) return '🌳';
  if (lower.includes('sun') || lower.includes('सूरज') || lower.includes('সূৰ্য')) return '☀️';
  if (lower.includes('moon') || lower.includes('चांद') || lower.includes('জোন')) return '🌙';

  // 7. Distinct slot badges if no keyword matches
  const slotFallbacks = ['📌', '🏷️', '📦', '🔍', '✨', '🎯'];
  return slotFallbacks[index % slotFallbacks.length];
};

export const ObjectRecognitionGameScreen: React.FC<ObjectRecognitionGameScreenProps> = ({
  onBack,
  config,
  onContinueNext,
}) => {
  const { patient } = useAuth();
  const { recordGameCompletion } = useGameStats();
  const { t, language } = useTranslation();

  const [questions, setQuestions] = useState<LocalizedObjectQuestion[]>([]);
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
  }, [config, language]);

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

    if (config?.content?.questions && Array.isArray(config.content.questions) && config.content.questions.length > 0) {
      // Normalize dynamic questions from backend API / AI generator
      const normalized: LocalizedObjectQuestion[] = config.content.questions.map((q: any, idx: number) => {
        const prompt = q.prompt || q.question || q.title || `Question ${idx + 1}`;
        const rawCorrect = q.correctAnswer || q.correct_answer || q.answer || '';
        const rawOptions = Array.isArray(q.options) ? q.options : [];

        const options = rawOptions.map((opt: any, optIdx: number) => {
          const text = typeof opt === 'string' ? opt : (opt.name || opt.text || opt.label || opt.title || opt.option || opt.value || `Option ${optIdx + 1}`);
          const explicitEmoji = typeof opt === 'object' ? (opt.emoji || opt.icon) : undefined;
          const emoji = resolveOptionIcon(text, optIdx, explicitEmoji);
          const label = opt?.label || String.fromCharCode(65 + optIdx);

          return {
            name: text,
            emoji,
            label,
          };
        });

        // Resolve correctAnswer if provided as index or letter
        let resolvedCorrect = typeof rawCorrect === 'string' ? rawCorrect : '';
        if (typeof rawCorrect === 'number' && options[rawCorrect]) {
          resolvedCorrect = options[rawCorrect].name;
        } else if (typeof rawCorrect === 'string' && rawCorrect.length === 1 && rawCorrect >= 'A' && rawCorrect <= 'Z') {
          const letterIdx = rawCorrect.charCodeAt(0) - 65;
          if (options[letterIdx]) {
            resolvedCorrect = options[letterIdx].name;
          }
        }

        return {
          id: q.id || idx + 1,
          prompt,
          correctAnswer: resolvedCorrect || (options[0] ? options[0].name : ''),
          options,
          hint: q.hint || q.explanation || '',
        };
      });
      setQuestions(normalized);
    } else {
      setQuestions(getObjectQuestionsData(language));
    }
  };

  const currentQ = questions[currentIdx] || questions[0];
  const totalCount = questions.length;

  const handleSelect = (optionName: string) => {
    if (selectedOption !== null || !currentQ) return;
    setSelectedOption(optionName);

    const isMatch =
      optionName === currentQ.correctAnswer ||
      (currentQ.correctAnswer &&
        optionName.toLowerCase().trim() === currentQ.correctAnswer.toLowerCase().trim());

    const nextCorrect = isMatch ? correctAnswers + 1 : correctAnswers;
    const nextMistakes = !isMatch ? mistakes + 1 : mistakes;

    if (isMatch) setCorrectAnswers(nextCorrect);
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
              <Text style={styles.hintToggleText}>{t.games.needHint}</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.optionsPrompt}>{t.games.selectYourAnswer}</Text>

          <View style={styles.optionsContainer}>
            {currentQ.options.map((opt, index) => {
              const optText = typeof opt === 'string' ? opt : (opt.name || opt.label || String(opt));
              const explicitEmoji = typeof opt === 'object' ? opt.emoji : undefined;
              const optEmoji = resolveOptionIcon(optText, index, explicitEmoji);
              const letterBadge = String.fromCharCode(65 + index);
              const isChosen = selectedOption === optText;
              const isCorrect =
                selectedOption !== null &&
                (optText === currentQ.correctAnswer ||
                  (currentQ.correctAnswer &&
                    optText.toLowerCase().trim() === currentQ.correctAnswer.toLowerCase().trim()));
              const isWrong = isChosen && !isCorrect;

              return (
                <TouchableOpacity
                  key={`${optText}-${index}`}
                  style={[
                    styles.optBtn,
                    isChosen && styles.optBtnChosen,
                    isCorrect && styles.optBtnCorrect,
                    isWrong && styles.optBtnWrong,
                  ]}
                  onPress={() => handleSelect(optText)}
                  activeOpacity={0.75}
                  disabled={selectedOption !== null}
                >
                  <View style={[styles.letterCircle, (isChosen || isCorrect) && styles.letterCircleActive]}>
                    <Text style={[styles.letterText, (isChosen || isCorrect) && styles.letterTextActive]}>
                      {letterBadge}
                    </Text>
                  </View>
                  <Text style={styles.optEmoji}>{optEmoji}</Text>
                  <Text
                    style={[
                      styles.optText,
                      (isChosen || isCorrect) && styles.optTextChosen,
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
  questionCard: {
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
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    ...SHADOWS.card,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    minHeight: 64,
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
  letterCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  letterCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  letterText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  letterTextActive: {
    color: '#FFFFFF',
  },
  optEmoji: {
    fontSize: 26,
    marginRight: 12,
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
