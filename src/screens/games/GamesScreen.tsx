import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../theme/theme';
import { GameViewType } from '../../types/navigation';
import { GameConfig } from '../../types/games';
import { useTranslation } from '../../hooks/useTranslation';
import { gamesApi } from '../../api/gamesApi';
import { MemoryGameScreen } from './MemoryGameScreen';
import { AttentionGameScreen } from './AttentionGameScreen';
import { MathMemoryGameScreen } from './MathMemoryGameScreen';
import { ObjectRecognitionGameScreen } from './ObjectRecognitionGameScreen';
import { RoutineRecallGameScreen } from './RoutineRecallGameScreen';
import { WordAssociationGameScreen } from './WordAssociationGameScreen';

interface GamesScreenProps {
  initialGame?: GameViewType;
  onResetInitialGame?: () => void;
}

const mapBackendToViewType = (backendType: string): GameViewType => {
  switch (backendType) {
    case 'memory':
      return 'memory';
    case 'attention':
      return 'attention';
    case 'math_memory':
    case 'mathMemory':
      return 'mathMemory';
    case 'object_recognition':
    case 'objectRecognition':
      return 'objectRecognition';
    case 'routine_recall':
    case 'routineRecall':
      return 'routineRecall';
    case 'word_association':
    case 'wordAssociation':
      return 'wordAssociation';
    default:
      return 'memory';
  }
};

export const GamesScreen: React.FC<GamesScreenProps> = ({
  initialGame = 'list',
  onResetInitialGame,
}) => {
  const { t } = useTranslation();
  const [activeGame, setActiveGame] = useState<GameViewType>(initialGame);
  const [gameConfig, setGameConfig] = useState<GameConfig | undefined>(undefined);
  const [isLoadingNext, setIsLoadingNext] = useState<boolean>(false);

  const fetchAndLaunchGame = useCallback(async (requestedType?: string) => {
    try {
      setIsLoadingNext(true);
      const res = await gamesApi.getNextGame(requestedType);
      if (res && res.success && res.game) {
        setGameConfig(res.game);
        setActiveGame(mapBackendToViewType(res.game.gameType));
      } else {
        // Fallback to local default renderer
        setGameConfig(undefined);
        if (requestedType) {
          setActiveGame(mapBackendToViewType(requestedType));
        } else {
          setActiveGame('memory');
        }
      }
    } catch (err) {
      console.warn('Error fetching game config from backend:', err);
      setGameConfig(undefined);
      if (requestedType) {
        setActiveGame(mapBackendToViewType(requestedType));
      } else {
        setActiveGame('memory');
      }
    } finally {
      setIsLoadingNext(false);
    }
  }, []);

  useEffect(() => {
    if (initialGame && initialGame !== 'list') {
      fetchAndLaunchGame(initialGame);
      if (onResetInitialGame) onResetInitialGame();
    }
  }, [initialGame, onResetInitialGame, fetchAndLaunchGame]);

  const handleBackToList = () => {
    setActiveGame('list');
    setGameConfig(undefined);
  };

  const handleContinueNext = () => {
    fetchAndLaunchGame();
  };

  if (isLoadingNext) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingTitle}>Loading Adaptive Exercise...</Text>
        <Text style={styles.loadingSub}>Personalizing difficulty & cultural content</Text>
      </View>
    );
  }

  if (activeGame === 'memory') {
    return (
      <MemoryGameScreen
        onBack={handleBackToList}
        config={gameConfig}
        onContinueNext={handleContinueNext}
      />
    );
  }
  if (activeGame === 'attention') {
    return (
      <AttentionGameScreen
        onBack={handleBackToList}
        config={gameConfig}
        onContinueNext={handleContinueNext}
      />
    );
  }
  if (activeGame === 'mathMemory') {
    return (
      <MathMemoryGameScreen
        onBack={handleBackToList}
        config={gameConfig}
        onContinueNext={handleContinueNext}
      />
    );
  }
  if (activeGame === 'objectRecognition') {
    return (
      <ObjectRecognitionGameScreen
        onBack={handleBackToList}
        config={gameConfig}
        onContinueNext={handleContinueNext}
      />
    );
  }
  if (activeGame === 'routineRecall') {
    return (
      <RoutineRecallGameScreen
        onBack={handleBackToList}
        config={gameConfig}
        onContinueNext={handleContinueNext}
      />
    );
  }
  if (activeGame === 'wordAssociation') {
    return (
      <WordAssociationGameScreen
        onBack={handleBackToList}
        config={gameConfig}
        onContinueNext={handleContinueNext}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.headerEmojiCircle}>
          <Text style={styles.headerEmoji}>🎮</Text>
        </View>
        <Text style={styles.headerTitle}>{t.games.hubTitle}</Text>
        <Text style={styles.headerSub}>{t.games.hubSub}</Text>
      </View>

      {/* Hero: Today's Adaptive Daily Exercise */}
      <TouchableOpacity
        style={styles.heroAdaptiveCard}
        activeOpacity={0.88}
        onPress={() => fetchAndLaunchGame()}
      >
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>⚡ AI ADAPTIVE</Text>
          </View>
          <Text style={styles.heroLevelText}>Personalized Pacing</Text>
        </View>

        <Text style={styles.heroTitle}>Today's Recommended Exercise</Text>
        <Text style={styles.heroDesc}>
          Dynamically tailored to your cognitive comfort zone and recent sessions.
        </Text>

        <View style={styles.heroPlayButton}>
          <Text style={styles.heroPlayButtonText}>Start Today's Session</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 6 }} />
        </View>
      </TouchableOpacity>

      <Text style={styles.categoriesHeader}>All Cognitive Domains</Text>

      <View style={styles.gamesList}>
        {/* Game 1: Memory */}
        <TouchableOpacity
          style={[styles.gameCard, { backgroundColor: '#F0FDF4', borderColor: COLORS.teaGreen }]}
          activeOpacity={0.85}
          onPress={() => fetchAndLaunchGame('memory')}
        >
          <View style={styles.gameCardHeader}>
            <MaterialCommunityIcons name="cards-playing-outline" size={28} color={COLORS.teaGreen} />
            <View style={[styles.badgePill, { backgroundColor: COLORS.primaryLight }]}>
              <Text style={styles.badgePillText}>{t.games.memoryCategory}</Text>
            </View>
          </View>
          <Text style={styles.gameCardTitle}>{t.games.game1Title}</Text>
          <Text style={styles.gameCardSub}>{t.games.game1Sub}</Text>
        </TouchableOpacity>

        {/* Game 2: Attention */}
        <TouchableOpacity
          style={[styles.gameCard, { backgroundColor: '#FFFBEB', borderColor: COLORS.secondary }]}
          activeOpacity={0.85}
          onPress={() => fetchAndLaunchGame('attention')}
        >
          <View style={styles.gameCardHeader}>
            <Ionicons name="eye-outline" size={28} color={COLORS.secondaryDark} />
            <View style={[styles.badgePill, { backgroundColor: COLORS.secondaryLight }]}>
              <Text style={[styles.badgePillText, { color: COLORS.secondaryDark }]}>
                {t.games.focusCategory}
              </Text>
            </View>
          </View>
          <Text style={styles.gameCardTitle}>{t.games.game2Title}</Text>
          <Text style={styles.gameCardSub}>{t.games.game2Sub}</Text>
        </TouchableOpacity>

        {/* Game 3: Math Memory */}
        <TouchableOpacity
          style={[styles.gameCard, { backgroundColor: '#EFF6FF', borderColor: '#2563EB' }]}
          activeOpacity={0.85}
          onPress={() => fetchAndLaunchGame('mathMemory')}
        >
          <View style={styles.gameCardHeader}>
            <MaterialCommunityIcons name="calculator-variant" size={28} color="#1D4ED8" />
            <View style={[styles.badgePill, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.badgePillText, { color: '#1D4ED8' }]}>
                {t.games.numbersCategory}
              </Text>
            </View>
          </View>
          <Text style={styles.gameCardTitle}>{t.games.game3Title}</Text>
          <Text style={styles.gameCardSub}>{t.games.game3Sub}</Text>
        </TouchableOpacity>

        {/* Game 4: Object Recognition */}
        <TouchableOpacity
          style={[styles.gameCard, { backgroundColor: '#FDF2F8', borderColor: '#DB2777' }]}
          activeOpacity={0.85}
          onPress={() => fetchAndLaunchGame('objectRecognition')}
        >
          <View style={styles.gameCardHeader}>
            <Ionicons name="cube-outline" size={28} color="#BE185D" />
            <View style={[styles.badgePill, { backgroundColor: '#FCE7F3' }]}>
              <Text style={[styles.badgePillText, { color: '#BE185D' }]}>
                {t.games.recognitionCategory}
              </Text>
            </View>
          </View>
          <Text style={styles.gameCardTitle}>{t.games.game4Title}</Text>
          <Text style={styles.gameCardSub}>{t.games.game4Sub}</Text>
        </TouchableOpacity>

        {/* Game 5: Routine Recall */}
        <TouchableOpacity
          style={[styles.gameCard, { backgroundColor: '#FAF5FF', borderColor: '#7E22CE' }]}
          activeOpacity={0.85}
          onPress={() => fetchAndLaunchGame('routineRecall')}
        >
          <View style={styles.gameCardHeader}>
            <Ionicons name="time-outline" size={28} color="#7E22CE" />
            <View style={[styles.badgePill, { backgroundColor: '#F3E8FF' }]}>
              <Text style={[styles.badgePillText, { color: '#7E22CE' }]}>
                {t.games.routineCategory}
              </Text>
            </View>
          </View>
          <Text style={styles.gameCardTitle}>{t.games.game5Title}</Text>
          <Text style={styles.gameCardSub}>{t.games.game5Sub}</Text>
        </TouchableOpacity>

        {/* Game 6: Word Association */}
        <TouchableOpacity
          style={[styles.gameCard, { backgroundColor: '#F0FDFA', borderColor: '#0D9488' }]}
          activeOpacity={0.85}
          onPress={() => fetchAndLaunchGame('wordAssociation')}
        >
          <View style={styles.gameCardHeader}>
            <FontAwesome5 name="book-open" size={24} color="#0D9488" />
            <View style={[styles.badgePill, { backgroundColor: '#CCFBF1' }]}>
              <Text style={[styles.badgePillText, { color: '#0F766E' }]}>
                {t.games.languageCategory}
              </Text>
            </View>
          </View>
          <Text style={styles.gameCardTitle}>{t.games.game6Title}</Text>
          <Text style={styles.gameCardSub}>{t.games.game6Sub}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.background,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 16,
  },
  loadingSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  headerBanner: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.card,
  },
  headerEmojiCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  heroAdaptiveCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.card,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroBadge: {
    backgroundColor: '#4338CA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBadgeText: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroLevelText: {
    color: '#A5B4FC',
    fontSize: 13,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 14,
    color: '#C7D2FE',
    lineHeight: 20,
    marginBottom: 16,
  },
  heroPlayButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  heroPlayButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  categoriesHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  gamesList: {
    gap: 14,
  },
  gameCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    ...SHADOWS.card,
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  gameCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  gameCardSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
