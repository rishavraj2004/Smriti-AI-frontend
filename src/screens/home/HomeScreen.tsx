import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { useGameStats } from '../../context/GameStatsContext';
import { useTranslation } from '../../hooks/useTranslation';
import { getFormattedDate } from '../../utils/formatters';
import { MainTabType, GameViewType } from '../../types/navigation';
import { SpeakerButton } from '../../components/SpeakerButton';

interface HomeScreenProps {
  onNavigateTab: (tab: MainTabType) => void;
  onLaunchGame: (game: GameViewType) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLaunchGame }) => {
  const { patient } = useAuth();
  const { totalGamesPlayedToday, averageScore } = useGameStats();
  const { t } = useTranslation();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

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

  const moods = [
    { id: 'peaceful', emoji: '🌸', label: t.home.peaceful },
    { id: 'happy', emoji: '😊', label: t.home.cheerful },
    { id: 'calm', emoji: '🍵', label: t.home.relaxed },
    { id: 'tired', emoji: '😴', label: t.home.needRest },
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
              <SpeakerButton text={fullGreetingSpeech} size="medium" />
            </View>
            <Text style={styles.regionSub}>📍 {patientRegion}</Text>
            <Text style={styles.dateSub}>📅 {formattedDate}</Text>
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
        </View>
      </View>

      {/* Daily Mood Check-In */}
      <View style={styles.sectionCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={styles.sectionTitle}>{t.home.feelingTitle}</Text>
          <SpeakerButton text={`${t.home.feelingTitle}. ${t.home.feelingSub}`} size="small" />
        </View>
        <Text style={styles.sectionSub}>{t.home.feelingSub}</Text>

        <View style={styles.moodGrid}>
          {moods.map((m) => {
            const isSelected = selectedMood === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.moodItem, isSelected && styles.moodItemSelected]}
                onPress={() => setSelectedMood(m.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Featured Cognitive Exercises */}
      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionMainTitle}>{t.home.recommendedExercises}</Text>
          <Text style={styles.sectionSubText}>{t.home.tapToStart}</Text>
        </View>
        <SpeakerButton text={`${t.home.recommendedExercises}. ${t.home.tapToStart}`} size="small" />
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
            <View style={[styles.badgePill, { backgroundColor: COLORS.primaryLight }]}>
              <Text style={styles.badgePillText}>{t.games.memoryCategory}</Text>
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
            <View style={[styles.badgePill, { backgroundColor: COLORS.secondaryLight }]}>
              <Text style={[styles.badgePillText, { color: COLORS.secondaryDark }]}>
                {t.games.focusCategory}
              </Text>
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
            <View style={[styles.badgePill, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.badgePillText, { color: '#1D4ED8' }]}>
                {t.games.numbersCategory}
              </Text>
            </View>
          </View>
          <Text style={styles.gameCardTitle}>{t.games.game3Title}</Text>
          <Text style={styles.gameCardSub}>{t.games.game3Sub}</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Routine Checklist */}
      <View style={styles.sectionCard}>
        <View style={styles.routineHeader}>
          <Text style={styles.sectionTitle}>{t.home.routineRhythm}</Text>
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
    fontWeight: '700',
    marginTop: 4,
  },
  dateSub: {
    color: '#E2E8F0',
    fontSize: 13,
    marginTop: 2,
  },
  snapshotRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  snapshotBox: {
    flex: 1,
    alignItems: 'center',
  },
  snapshotDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  snapshotLabel: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '600',
  },
  snapshotValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sectionSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 14,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  moodItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  moodItemSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: COLORS.primaryDark,
    fontWeight: '900',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionMainTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  sectionSubText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  gamesGrid: {
    gap: 12,
    marginBottom: 18,
  },
  gameCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 2.5,
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
    lineHeight: 19,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineCount: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  routineList: {
    gap: 10,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  routineRowDone: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkCircleDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  routineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  routineTitleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  routineTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
