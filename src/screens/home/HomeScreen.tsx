import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { useGameStats } from '../../context/GameStatsContext';
import { useTranslation } from '../../hooks/useTranslation';
import { getFormattedDate } from '../../utils/formatters';
import { MainTabType, GameViewType } from '../../types/navigation';
import { SpeakerButton } from '../../components/SpeakerButton';
import { ttsService } from '../../services/ttsService';

interface HomeScreenProps {
  onNavigateTab: (tab: MainTabType) => void;
  onLaunchGame: (game: GameViewType) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateTab, onLaunchGame }) => {
  const { patient, appLanguage } = useAuth();
  const { totalGamesPlayedToday, averageScore } = useGameStats();
  const { t } = useTranslation();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const activeLang = patient?.language || appLanguage || 'en';

  const [routines, setRoutines] = useState([
    { id: 'r1', key: 'routine1', time: '07:30 AM', completed: false },
    { id: 'r2', key: 'routine2', time: '09:00 AM', completed: false },
    { id: 'r3', key: 'routine3', time: '03:30 PM', completed: false },
    { id: 'r4', key: 'routine4', time: '06:00 PM', completed: false },
  ]);

  const now = new Date();
  const hour = now.getHours();
  const greetingText =
    hour < 12
      ? t.home.goodMorning
      : hour < 17
      ? t.home.goodAfternoon
      : t.home.goodEvening;

  const formattedDate = getFormattedDate();
  const patientName = patient?.name || 'Friend';
  const patientRegion = patient?.region || 'North Eastern Region';

  const fullGreetingSpeech = `${greetingText}, ${patientName}. ${formattedDate}`;

  // Automatically voice greeting when the patient opens the app
  useEffect(() => {
    const timer = setTimeout(() => {
      ttsService.speak(fullGreetingSpeech, activeLang);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const moods = [
    { id: 'peaceful', icon: <Ionicons name="leaf-outline" size={24} color={COLORS.primary} />, label: t.home.peaceful },
    { id: 'happy', icon: <Ionicons name="sunny-outline" size={24} color={COLORS.secondary} />, label: t.home.cheerful },
    { id: 'calm', icon: <Ionicons name="cafe-outline" size={24} color="#0D9488" />, label: t.home.relaxed },
    { id: 'tired', icon: <Ionicons name="moon-outline" size={24} color="#6366F1" />, label: t.home.needRest },
  ];

  const toggleRoutine = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const completedCount = routines.filter((r) => r.completed).length;

  const getRoutineTitle = (key: string) => {
    if (key === 'routine1') return t.home.routine1;
    if (key === 'routine2') return t.home.routine2;
    if (key === 'routine3') return t.home.routine3;
    return t.home.routine4;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Personalized Greeting Card */}
      <View style={styles.greetingCard}>
        <View style={styles.greetingHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.greetingTitle}>
                {greetingText}, {patientName}
              </Text>
              <SpeakerButton
                text={fullGreetingSpeech}
                language={activeLang}
                size="medium"
                backgroundColor="rgba(255, 255, 255, 0.2)"
                color="#FFFFFF"
              />
            </View>
            <View style={styles.greetingSubRow}>
              <Ionicons name="location-outline" size={13} color="rgba(255, 255, 255, 0.85)" />
              <Text style={styles.regionSub}>{patientRegion}</Text>
            </View>
            <View style={styles.greetingSubRow}>
              <Ionicons name="calendar-outline" size={13} color="rgba(255, 255, 255, 0.85)" />
              <Text style={styles.dateSub}>{formattedDate}</Text>
            </View>
          </View>
        </View>

        {/* Real Session Snapshot */}
        <View style={styles.snapshotRow}>
          <View style={styles.snapshotBox}>
            <Text style={styles.snapshotLabel}>{t.home.gamesPlayedToday}</Text>
            <Text style={styles.snapshotValue}>{totalGamesPlayedToday}</Text>
          </View>
          <View style={styles.snapshotDivider} />
          <View style={styles.snapshotBox}>
            <Text style={styles.snapshotLabel}>{t.home.sessionScore}</Text>
            <Text style={styles.snapshotValue}>
              {averageScore !== null ? `${averageScore}%` : '—'}
            </Text>
          </View>
          <SpeakerButton
            text={`${t.home.gamesPlayedToday}: ${totalGamesPlayedToday}. ${t.home.sessionScore}: ${averageScore !== null ? averageScore + '%' : 'no data'}`}
            language={activeLang}
            size="small"
            backgroundColor="rgba(255, 255, 255, 0.15)"
            color="#FFFFFF"
            style={{ marginLeft: 6 }}
          />
        </View>
      </View>

      {/* Daily Mood Check-In */}
      <View style={styles.sectionCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={styles.sectionTitle}>{t.home.feelingTitle}</Text>
          <SpeakerButton
            text={`${t.home.feelingTitle}. ${t.home.feelingSub}`}
            language={activeLang}
            size="small"
          />
        </View>
        <Text style={styles.sectionSub}>{t.home.feelingSub}</Text>

        <View style={styles.moodGrid}>
          {moods.map((m) => {
            const isSelected = selectedMood === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.moodItem, isSelected && styles.moodItemSelected]}
                onPress={() => {
                  setSelectedMood(m.id);
                  ttsService.speak(m.label, activeLang);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.moodIconBox}>{m.icon}</View>
                <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* FAMILY SCRAPBOOK FEATURED CARD */}
      <TouchableOpacity
        style={styles.scrapbookHeroCard}
        activeOpacity={0.88}
        onPress={() => onNavigateTab('scrapbook')}
      >
        <View style={styles.scrapbookTopRow}>
          <View style={styles.scrapbookBadge}>
            <Ionicons name="book-outline" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.scrapbookBadgeText}>FAMILY SCRAPBOOK</Text>
          </View>
          <SpeakerButton
            text="Family Scrapbook. Browse treasured family photos, listen to recorded voice stories, and watch photo slideshows."
            language={activeLang}
            size="small"
            backgroundColor="rgba(255, 255, 255, 0.2)"
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.scrapbookHeroTitle}>Family Scrapbook Album</Text>
        <Text style={styles.scrapbookHeroSub}>
          Photos, cherished family stories, and spoken voice recordings to comfort and strengthen memory.
        </Text>

        <View style={styles.scrapbookActionRow}>
          <View style={styles.scrapbookOpenBtn}>
            <Text style={styles.scrapbookOpenBtnText}>Open Scrapbook Album</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Featured Cognitive Exercises */}
      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionMainTitle}>{t.home.recommendedExercises}</Text>
          <Text style={styles.sectionSubText}>{t.home.tapToStart}</Text>
        </View>
        <SpeakerButton
          text={`${t.home.recommendedExercises}. ${t.home.tapToStart}`}
          language={activeLang}
          size="small"
        />
      </View>

      <View style={styles.gamesGrid}>
        {/* Game 1: Cultural Memory */}
        <TouchableOpacity
          style={[styles.gameCard, { backgroundColor: '#F0FDF4', borderColor: COLORS.teaGreen }]}
          activeOpacity={0.85}
          onPress={() => onLaunchGame('memory')}
        >
          <View style={styles.gameCardHeader}>
            <MaterialCommunityIcons name="cards-playing-outline" size={28} color={COLORS.teaGreen} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={[styles.badgePill, { backgroundColor: COLORS.primaryLight }]}>
                <Text style={styles.badgePillText}>{t.games.memoryCategory}</Text>
              </View>
              <SpeakerButton
                text={`${t.games.game1Title}. ${t.games.game1Sub}`}
                language={activeLang}
                size="small"
              />
            </View>
          </View>
          <Text style={styles.gameCardTitle}>{t.games.game1Title}</Text>
          <Text style={styles.gameCardSub}>{t.games.game1Sub}</Text>
        </TouchableOpacity>

        {/* Game 2: Visual Focus */}
        <TouchableOpacity
          style={[styles.gameCard, { backgroundColor: '#FFFBEB', borderColor: COLORS.secondary }]}
          activeOpacity={0.85}
          onPress={() => onLaunchGame('attention')}
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
                language={activeLang}
                size="small"
              />
            </View>
          </View>
          <Text style={styles.gameCardTitle}>{t.games.game2Title}</Text>
          <Text style={styles.gameCardSub}>{t.games.game2Sub}</Text>
        </TouchableOpacity>

        {/* Game 3: Gentle Math */}
        <TouchableOpacity
          style={[styles.gameCard, { backgroundColor: '#EFF6FF', borderColor: '#2563EB' }]}
          activeOpacity={0.85}
          onPress={() => onLaunchGame('mathMemory')}
        >
          <View style={styles.gameCardHeader}>
            <MaterialCommunityIcons name="calculator-variant" size={28} color="#1D4ED8" />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={[styles.badgePill, { backgroundColor: '#DBEAFE' }]}>
                <Text style={[styles.badgePillText, { color: '#1D4ED8' }]}>
                  {t.games.numbersCategory}
                </Text>
              </View>
              <SpeakerButton
                text={`${t.games.game3Title}. ${t.games.game3Sub}`}
                language={activeLang}
                size="small"
              />
            </View>
          </View>
          <Text style={styles.gameCardTitle}>{t.games.game3Title}</Text>
          <Text style={styles.gameCardSub}>{t.games.game3Sub}</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Routine Checklist */}
      <View style={styles.sectionCard}>
        <View style={styles.routineHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.sectionTitle}>{t.home.routineRhythm}</Text>
            <SpeakerButton
              text={`${t.home.routineRhythm}. ${t.home.checkOffTasks}. ${completedCount} of ${routines.length} completed.`}
              language={activeLang}
              size="small"
            />
          </View>
          <Text style={styles.routineCount}>
            {completedCount} / {routines.length} {t.home.done}
          </Text>
        </View>
        <Text style={styles.sectionSub}>{t.home.checkOffTasks}</Text>

        <View style={styles.routineList}>
          {routines.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.routineRow, item.completed && styles.routineRowDone]}
              onPress={() => toggleRoutine(item.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkCircle, item.completed && styles.checkCircleDone]}>
                {item.completed && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.routineTitle, item.completed && styles.routineTitleDone]}>
                  {getRoutineTitle(item.key)}
                </Text>
                <Text style={styles.routineTime}>⏰ {item.time}</Text>
              </View>
              <SpeakerButton
                text={`${getRoutineTitle(item.key)} at ${item.time}`}
                language={activeLang}
                size="small"
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.bgMain,
    flexGrow: 1,
  },
  greetingCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  greetingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greetingTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  regionSub: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  dateSub: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  snapshotRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  snapshotBox: {
    alignItems: 'center',
    flex: 1,
  },
  snapshotDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  snapshotLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  snapshotValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  greetingSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sectionSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 14,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  moodItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  moodItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  moodIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  moodLabelSelected: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  sectionMainTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  sectionSubText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  gamesGrid: {
    gap: 12,
    marginBottom: 16,
  },
  gameCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    ...SHADOWS.card,
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '800',
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
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  routineCount: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  routineList: {
    gap: 10,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  routineRowDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkCircleDone: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  routineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  routineTitleDone: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  routineTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  scrapbookHeroCard: {
    backgroundColor: '#0F766E',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.card,
  },
  scrapbookTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scrapbookBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scrapbookBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrapbookHeroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scrapbookHeroSub: {
    fontSize: 13,
    color: '#CCFBF1',
    lineHeight: 18,
    marginBottom: 16,
  },
  scrapbookActionRow: {
    flexDirection: 'row',
  },
  scrapbookOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  scrapbookOpenBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
