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
import { SpeakerButton } from '../../components/SpeakerButton';

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
  const { t, language } = useTranslation();
  const [activeGame, setActiveGame] = useState<GameViewType>(initialGame);
  const [gameConfig, setGameConfig] = useState<GameConfig | undefined>(undefined);
  const [isLoadingNext, setIsLoadingNext] = useState<boolean>(false);

  const fetchAndLaunchGame = useCallback(async (requestedType?: string) => {
    try {
      setIsLoadingNext(true);
      const res = await gamesApi.getNextGame(requestedType, undefined, language);
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
  }, [language]);

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
        <Text style={styles.loadingTitle}>Configuring Adaptive Exercise...</Text>
        <Text style={styles.loadingSub}>Personalizing difficulty & cultural parameters</Text>
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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <View style={styles.headerEmojiCircle}>
            <Text style={styles.headerEmoji}>🎮</Text>
          </View>
          <SpeakerButton
            text={`${t.games.hubTitle}. ${t.games.hubSub}`}
            size="small"
            backgroundColor="rgba(0, 0, 0, 0.05)"
            color={COLORS.textDark}
          />
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.heroLevelText}>Personalized Pacing</Text>
            <SpeakerButton
              text="Today's Recommended Exercise. Dynamically tailored to your cognitive comfort zone and recent sessions."
              size="small"
              backgroundColor="rgba(255, 255, 255, 0.15)"
              color="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.heroTitle}>Today's Recommended Exercise</Text>
        <Text style={styles.heroDesc}>
          Dynamically tailored to your cognitive comfort zone and recent sessions.
        </Text>
        <View style={styles.heroPlayButton}>
          <Text style={styles.heroPlayButtonText}>Start Today's Session</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={[styles.badgePill, { backgroundColor: COLORS.primaryLight }]}>
                <Text style={styles.badgePillText}>{t.games.memoryCategory}</Text>
              </View>
              <SpeakerButton
                text={`${t.games.game1Title}. ${t.games.game1Sub}`}
                size="small"
              />
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={[styles.badgePill, { backgroundColor: COLORS.secondaryLight }]}>
                <Text style={[styles.badgePillText, { color: COLORS.secondaryDark }]}>
                  {t.games.focusCategory}
                </Text>
              </View>
              <SpeakerButton
                text={`${t.games.game2Title}. ${t.games.game2Sub}`}
                size="small"
              />
            </View>
          </View>
          <Text style={styles.gameCardTitle}>{t.games.game2Title}</Text>
          <Text style={styles.gameCardSub}>{t.games.game2Sub}</Text>
        </TouchableOpacity>

        {/* Game 3: Math Memory */}
        <TouchableOpacity
          style={[styles.gameCard, { backgroundColor: '#EFF6FF', borderColor: COLORS.skyBlue }]}
          activeOpacity={0.85}
          onPress={() => fetchAndLaunchGame('mathMemory')}
        >
          <View style={styles.gameCardHeader}>
            <MaterialCommunityIcons name="calculator-variant-outline" size={28} color={COLORS.skyBlue} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={[styles.badgePill, { backgroundColor: '#DBEAFE' }]}>
                <Text style={[styles.badgePillText, { color: '#1D4ED8' }]}>
                  {t.games.numbersCategory}
                </Text>
              </View>
              <SpeakerButton
                text={`${t.games.game3Title}. ${t.games.game3Sub}`}
                size="small"
              />
            </View>
          </View>
          <Text style={styles.gameCardTitle}>{t.games.game3Title}</Text>
          <Text style={styles.gameCardSub}>{t.games.game3Sub}</Text>
        </TouchableOpacity>

        {/* Game 4: Object Recognition */}
        <TouchableOpacity
          style={[styles.gameCard, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}
          activeOpacity={0.85}
          onPress={() => fetchAndLaunchGame('objectRecognition')}
        >
          <View style={styles.gameCardHeader}>
            <MaterialCommunityIcons name="puzzle-outline" size={28} color="#EF4444" />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={[styles.badgePill, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.badgePillText, { color: '#B91C1C' }]}>
                  {t.games.recognitionCategory}
                </Text>
              </View>
              <SpeakerButton
                text={`${t.games.game4Title}. ${t.games.game4Sub}`}
                size="small"
              />
            </View>
          </View>
          <Text style={styles.gameCardTitle}>{t.games.game4Title}</Text>
          <Text style={styles.gameCardSub}>{t.games.game4Sub}</Text>
        </TouchableOpacity>

        {/* Game 5: Routine Recall */}
        <TouchableOpacity
          style={[styles.gameCard, { backgroundColor: '#FAF5FF', borderColor: '#9333EA' }]}
          activeOpacity={0.85}
          onPress={() => fetchAndLaunchGame('routineRecall')}
        >
          <View style={styles.gameCardHeader}>
            <Ionicons name="list-circle-outline" size={30} color="#9333EA" />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={[styles.badgePill, { backgroundColor: '#F3E8FF' }]}>
                <Text style={[styles.badgePillText, { color: '#7E22CE' }]}>
                  {t.games.sequenceCategory}
                </Text>
              </View>
              <SpeakerButton
                text={`${t.games.game5Title}. ${t.games.game5Sub}`}
                size="small"
              />
            </View>
          </View>
          <Text style={styles.gameCardTitle}>{t.games.game5Title}</Text>
          <Text style={styles.gameCardSub}>{t.games.game5Sub}</Text>
        </TouchableOpacity>

        {/* Game 6: Word Association */}
        <TouchableOpacity
          style={[styles.gameCard, { backgroundColor: '#FFF7ED', borderColor: '#EA580C' }]}
          activeOpacity={0.85}
          onPress={() => fetchAndLaunchGame('wordAssociation')}
        >
          <View style={styles.gameCardHeader}>
            <FontAwesome5 name="book-reader" size={24} color="#EA580C" />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={[styles.badgePill, { backgroundColor: '#FFEDD5' }]}>
                <Text style={[styles.badgePillText, { color: '#EA580C' }]}>
                  {t.games.languageCategory}
                </Text>
              </View>
              <SpeakerButton
                text={`${t.games.game6Title}. ${t.games.game6Sub}`}
                size="small"
              />
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
    backgroundColor: COLORS.bgMain,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
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
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  headerBanner: {
    backgroundColor: COLORS.bgCard,
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
    color: COLORS.textMuted,
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
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
    color: COLORS.textMuted,
    lineHeight: 20,
  },
});
