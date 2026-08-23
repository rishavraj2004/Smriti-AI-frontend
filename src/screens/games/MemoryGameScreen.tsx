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

interface Card {
  id: number;
  itemId?: string;
  symbol: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameScreenProps {
  onBack: () => void;
  config?: GameConfig;
  onContinueNext?: () => void;
}

export const MemoryGameScreen: React.FC<MemoryGameScreenProps> = ({
  onBack,
  config,
  onContinueNext,
}) => {
  const { patient } = useAuth();
  const { recordGameCompletion } = useGameStats();
  const { t } = useTranslation();

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [rawScore, setRawScore] = useState(80);
  const [responseTimeMs, setResponseTimeMs] = useState(15000);
  const [sessionDetails, setSessionDetails] = useState<SessionResultDetails | null>(null);
  const [adaptationDetails, setAdaptationDetails] = useState<AdaptationDetails | null>(null);
  const [resultModalVisible, setResultModalVisible] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const difficulty = config?.difficulty || 1;
  const targetPairs = config?.content?.pairsCount || 4;

  const DEFAULT_CARDS_DATA = [
    { symbol: '🌱', name: 'Assam Tea' },
    { symbol: '🦏', name: 'Kaziranga Rhino' },
    { symbol: '🥁', name: 'Bihu Dhol' },
    { symbol: '🦜', name: 'Hornbill Bird' },
    { symbol: '🎋', name: 'Bamboo Craft' },
    { symbol: '🌊', name: 'Loktak Lake' },
  ];

  useEffect(() => {
    startNewGame();
  }, [config]);

  const startNewGame = () => {
    startTimeRef.current = Date.now();
    setFlippedCards([]);
    setMoves(0);
    setMistakes(0);
    setMatchedPairs(0);
    setIsGameOver(false);
    setResultModalVisible(false);
    setSessionDetails(null);
    setAdaptationDetails(null);

    if (config?.content?.cards && Array.isArray(config.content.cards)) {
      setCards(config.content.cards);
    } else {
      const selected = DEFAULT_CARDS_DATA.slice(0, targetPairs);
      const deck = [...selected, ...selected]
        .sort(() => Math.random() - 0.5)
        .map((item, index) => ({
          id: index,
          symbol: item.symbol,
          name: item.name,
          isFlipped: false,
          isMatched: false,
        }));
      setCards(deck);
    }
  };

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedCards.length === 2) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIndex, secondIndex] = newFlipped;

      if (cards[firstIndex].symbol === cards[secondIndex].symbol) {
        // Match found
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((c, idx) =>
              idx === firstIndex || idx === secondIndex ? { ...c, isMatched: true } : c
            )
          );
          setFlippedCards([]);
          setMatchedPairs((prev) => {
            const next = prev + 1;
            const totalRequired = config?.content?.pairsCount || targetPairs;
            if (next >= totalRequired) {
              handleGameFinish(moves + 1, mistakes, next);
            }
            return next;
          });
        }, 400);
      } else {
        // Mismatch
        setMistakes((prev) => prev + 1);
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((c, idx) =>
              idx === firstIndex || idx === secondIndex ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleGameFinish = async (totalMoves: number, totalMistakes: number, totalMatched: number) => {
    setIsGameOver(true);
    const elapsedMs = Math.max(2000, Date.now() - startTimeRef.current);
    setResponseTimeMs(elapsedMs);

    const totalActions = totalMatched + totalMistakes;
    const accuracy = totalActions > 0 ? totalMatched / totalActions : 1.0;
    const calculatedScore = Math.max(50, Math.min(100, Math.round(accuracy * 100)));
    setRawScore(calculatedScore);

    // Submit raw telemetry to backend
    const res = await recordGameCompletion('memory', calculatedScore, accuracy, totalMoves, {
      difficulty,
      responseTimeMs: elapsedMs,
      mistakes: totalMistakes,
      correctAnswers: totalMatched,
      totalQuestions: totalMatched,
      completed: true,
      startedAt: new Date(startTimeRef.current).toISOString(),
    });

    if (res && res.session) {
      setSessionDetails(res.session);
      setAdaptationDetails(res.adaptation);
    }

    setResultModalVisible(true);
  };

  const totalPairsCount = config?.content?.pairsCount || targetPairs;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
          <Text style={styles.backBtnText}>{t.nav.back}</Text>
        </TouchableOpacity>
        <Text style={styles.gameTitle}>{config?.title || t.games.game1Title}</Text>
      </View>

      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>{config?.instructions || t.games.memoryInstruction}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statBadge}>
            {t.games.pairs}: {matchedPairs} / {totalPairsCount}
          </Text>
          <Text style={styles.statBadge}>{t.games.attempts}: {moves}</Text>
          <Text style={[styles.statBadge, { backgroundColor: '#FEF3C7', color: '#B45309' }]}>
            Level {difficulty}
          </Text>
        </View>
      </View>

      {/* Cards Grid */}
      <View style={styles.gridContainer}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              (card.isFlipped || card.isMatched) && styles.cardFlipped,
              card.isMatched && styles.cardMatched,
            ]}
            onPress={() => handleCardClick(index)}
            activeOpacity={0.7}
            disabled={card.isFlipped || card.isMatched || isGameOver}
          >
            {card.isFlipped || card.isMatched ? (
              <View style={styles.cardContent}>
                <Text style={styles.cardEmoji}>{card.symbol}</Text>
                <Text style={styles.cardName} numberOfLines={2}>
                  {card.name}
                </Text>
              </View>
            ) : (
              <View style={styles.cardBack}>
                <Text style={styles.cardBackIcon}>🎴</Text>
                <Text style={styles.cardBackText}>Tap</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Restart / Shuffle */}
      <View style={{ marginTop: 24, width: '100%' }}>
        <ElderlyButton
          title={t.games.playAgain}
          onPress={startNewGame}
          variant="secondary"
          icon="🔄"
          size="normal"
        />
      </View>

      {/* Backend Result Modal */}
      <GameResultModal
        visible={resultModalVisible}
        score={rawScore}
        accuracy={Math.round((matchedPairs / Math.max(1, matchedPairs + mistakes)) * 100)}
        responseTimeMs={responseTimeMs}
        difficulty={difficulty}
        sessionDetails={sessionDetails}
        adaptationDetails={adaptationDetails}
        onContinue={() => {
          setResultModalVisible(false);
          if (onContinueNext) onContinueNext();
          else startNewGame();
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
  infoBanner: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    ...SHADOWS.card,
  },
  infoText: {
    fontSize: 15,
    color: COLORS.textDark,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  statBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  card: {
    width: '47%',
    height: 120,
    backgroundColor: '#3B82F6',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.card,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  cardFlipped: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
  },
  cardMatched: {
    backgroundColor: '#F0FDF4',
    borderColor: '#22C55E',
  },
  cardContent: {
    alignItems: 'center',
    padding: 6,
  },
  cardEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  cardBack: {
    alignItems: 'center',
  },
  cardBackIcon: {
    fontSize: 32,
    marginBottom: 2,
  },
  cardBackText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
  },
});
