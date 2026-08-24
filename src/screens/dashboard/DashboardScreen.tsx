import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { useGameStats } from '../../context/GameStatsContext';
import { useTranslation } from '../../hooks/useTranslation';
import { EmptyState } from '../../components/EmptyState';
import { ElderlyButton } from '../../components/ElderlyButton';
import { MainTabType } from '../../types/navigation';
import { gamesApi } from '../../api/gamesApi';
import { CaregiverPerformanceData, GameResult } from '../../types/games';
import { SpeakerButton } from '../../components/SpeakerButton';

interface DashboardScreenProps {
  onNavigateTab: (tab: MainTabType) => void;
}

const getGameTitle = (gameType: string): string => {
  switch (gameType) {
    case 'memory':
      return 'Cultural Memory Match';
    case 'attention':
      return 'Focus & Visual Attention';
    case 'math_memory':
    case 'mathMemory':
      return 'Gentle Numbers & Counting';
    case 'object_recognition':
    case 'objectRecognition':
      return 'Object & Cultural Recognition';
    case 'routine_recall':
    case 'routineRecall':
      return 'Daily Routine Sequencing';
    case 'word_association':
    case 'wordAssociation':
      return 'Word & Folklore Association';
    default:
      return 'Cognitive Exercise';
  }
};

const getGameIcon = (gameType: string) => {
  switch (gameType) {
    case 'memory':
      return <MaterialCommunityIcons name="cards-playing-outline" size={22} color={COLORS.teaGreen} />;
    case 'attention':
      return <Ionicons name="eye-outline" size={22} color={COLORS.secondaryDark} />;
    case 'math_memory':
    case 'mathMemory':
      return <MaterialCommunityIcons name="calculator-variant" size={22} color="#2563EB" />;
    case 'object_recognition':
    case 'objectRecognition':
      return <Ionicons name="cube-outline" size={22} color="#BE185D" />;
    case 'routine_recall':
    case 'routineRecall':
      return <Ionicons name="time-outline" size={22} color="#7E22CE" />;
    case 'word_association':
    case 'wordAssociation':
      return <FontAwesome5 name="book-open" size={17} color="#0D9488" />;
    default:
      return <Ionicons name="game-controller-outline" size={22} color={COLORS.primary} />;
  }
};

const getDifficultyLabel = (diff?: number): string => {
  switch (diff) {
    case 1:
      return 'Easy';
    case 2:
      return 'Medium';
    case 3:
      return 'Hard';
    default:
      return 'Standard';
  }
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateTab }) => {
  const { patient, caregiver, caregiverToken, linkedPatient, linkPatientWithCode } = useAuth();
  const { sessionHistory, domainScores, totalGamesPlayedToday, averageScore } = useGameStats();
  const { t } = useTranslation();

  const [caregiverData, setCaregiverData] = useState<CaregiverPerformanceData | null>(null);
  const [caregiverSessions, setCaregiverSessions] = useState<GameResult[]>([]);
  const [patientDirectSessions, setPatientDirectSessions] = useState<GameResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pairingCodeInput, setPairingCodeInput] = useState('');
  const [linkingError, setLinkingError] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  const isCaregiverView = Boolean(caregiver && caregiverToken);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLinkingError(null);

      if (isCaregiverView && caregiverToken) {
        const data = await gamesApi.getCaregiverPerformance(caregiverToken);
        if (data) {
          setCaregiverData(data);
        }

        const sessionRes = await gamesApi.getCaregiverSessions(caregiverToken);
        if (sessionRes && sessionRes.success && Array.isArray(sessionRes.sessions)) {
          setCaregiverSessions(
            sessionRes.sessions.map((s) => ({
              id: s.id || s._id,
              gameType: s.gameType,
              gameTitle: getGameTitle(s.gameType),
              score: s.score,
              accuracy: Math.round((s.accuracy || 1) * 100),
              performanceScore: s.performanceScore,
              difficulty: s.difficulty,
              responseTimeMs: s.responseTimeMs,
              completedAt: s.completedAt,
            }))
          );
        }
      } else {
        try {
          const directRes = await gamesApi.getHistory();
          if (directRes && directRes.success && Array.isArray(directRes.sessions)) {
            setPatientDirectSessions(
              directRes.sessions.map((s) => ({
                id: s.id,
                gameType: s.gameType,
                gameTitle: getGameTitle(s.gameType),
                score: s.score,
                accuracy: Math.round((s.accuracy || 1) * 100),
                performanceScore: s.performanceScore,
                difficulty: s.difficulty,
                responseTimeMs: s.responseTimeMs,
                completedAt: s.completedAt,
              }))
            );
          }
        } catch {
          // Non-blocking
        }
      }
    } catch (err: any) {
      console.warn('Could not load dashboard data from backend:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isCaregiverView, caregiverToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLinkPatient = async () => {
    if (!pairingCodeInput.trim()) return;
    try {
      setIsLinking(true);
      setLinkingError(null);
      await linkPatientWithCode(pairingCodeInput.trim().toUpperCase());
      setPairingCodeInput('');
      await loadData();
    } catch (err: any) {
      setLinkingError(err.message || 'Failed to link with patient key.');
    } finally {
      setIsLinking(false);
    }
  };

  const hasLinkedPatient = Boolean(linkedPatient || caregiverData?.patient);

  const activePatient = isCaregiverView ? caregiverData?.patient || linkedPatient : patient;
  const activePatientName = activePatient?.name || (isCaregiverView ? 'Linked Patient' : t.dashboard.patient);
  const activePairingCode = activePatient?.pairingCode || (isCaregiverView ? 'SMR-LINKED' : 'SMR-ACTIVE');

  const activeTotalGames = isCaregiverView
    ? caregiverData?.totalGamesPlayed ?? caregiverSessions.length
    : patientDirectSessions.length > 0
    ? patientDirectSessions.length
    : totalGamesPlayedToday;

  const activeAverageScore = isCaregiverView
    ? caregiverData?.overallPerformance ?? averageScore
    : averageScore;

  const activeTrend = isCaregiverView ? caregiverData?.trend || 'Stable' : 'Active Progress';

  const activeDomainScores = isCaregiverView && caregiverData?.domainScores
    ? caregiverData.domainScores
    : domainScores;

  const activeSessionsList = isCaregiverView
    ? caregiverSessions
    : patientDirectSessions.length > 0
    ? patientDirectSessions
    : sessionHistory;

  const domainItems = [
    {
      title: t.games.game1Title,
      category: 'Working Memory',
      score: activeDomainScores.memory,
      color: COLORS.primary,
      icon: <MaterialCommunityIcons name="cards-playing-outline" size={20} color={COLORS.primary} />,
    },
    {
      title: t.games.game2Title,
      category: 'Focus & Attention',
      score: activeDomainScores.attention,
      color: COLORS.secondary,
      icon: <Ionicons name="eye-outline" size={20} color={COLORS.secondary} />,
    },
    {
      title: t.games.game3Title,
      category: 'Gentle Arithmetic',
      score: activeDomainScores.mathMemory,
      color: '#2563EB',
      icon: <MaterialCommunityIcons name="calculator-variant" size={20} color="#2563EB" />,
    },
    {
      title: t.games.game4Title,
      category: 'Semantic Recognition',
      score: activeDomainScores.objectRecognition,
      color: '#BE185D',
      icon: <Ionicons name="cube-outline" size={20} color="#BE185D" />,
    },
    {
      title: t.games.game5Title,
      category: 'Routine Recall',
      score: activeDomainScores.routineRecall,
      color: '#7E22CE',
      icon: <Ionicons name="time-outline" size={20} color="#7E22CE" />,
    },
    {
      title: t.games.game6Title,
      category: 'Language & Association',
      score: activeDomainScores.wordAssociation,
      color: '#0D9488',
      icon: <FontAwesome5 name="book-open" size={17} color="#0D9488" />,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Caregiver Link Patient Card */}
      {isCaregiverView && !hasLinkedPatient && (
        <View style={styles.linkCard}>
          <View style={styles.linkCardIconBox}>
            <Ionicons name="link-outline" size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.linkCardTitle}>Link Patient Account</Text>
          <Text style={styles.linkCardSub}>
            Enter the patient's unique 8-character pairing code (found on their Profile screen e.g. SMR-XXXX) to monitor their cognitive progress in real-time.
          </Text>

          {linkingError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{linkingError}</Text>
            </View>
          )}

          <TextInput
            style={styles.pairingInput}
            placeholder="SMR-XXXX"
            placeholderTextColor="#94A3B8"
            value={pairingCodeInput}
            onChangeText={setPairingCodeInput}
            autoCapitalize="characters"
            maxLength={8}
          />

          <ElderlyButton
            title={isLinking ? 'Linking...' : 'Connect Patient'}
            onPress={handleLinkPatient}
            variant="primary"
            size="normal"
            disabled={isLinking || !pairingCodeInput.trim()}
          />
        </View>
      )}

      {/* Patient Summary Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 }}>
              <Text style={styles.headerTitle}>
                {isCaregiverView ? 'Caregiver Clinical Overview' : t.dashboard.title}
              </Text>
              <SpeakerButton
                text={`${isCaregiverView ? 'Caregiver Clinical Overview' : t.dashboard.title}. ${t.dashboard.patient}: ${activePatientName}. ${t.dashboard.gamesPlayedToday}: ${activeTotalGames}. ${t.dashboard.averageScore}: ${activeAverageScore !== null ? activeAverageScore + '%' : 'no data'}.`}
                size="small"
              />
            </View>
            <Text style={styles.patientSub}>
              {t.dashboard.patient}: {activePatientName}
            </Text>
            <Text style={styles.caregiverCode}>
              {t.dashboard.caregiverId}: {activePairingCode}
            </Text>
            {activePatient?.region && (
              <View style={styles.regionRow}>
                <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.regionSub}>{activePatient.region}</Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.trendBadge,
              activeTrend === 'Improving' && styles.trendImproving,
              activeTrend === 'Needs Attention' && styles.trendAttention,
            ]}
          >
            <Ionicons
              name={
                activeTrend === 'Improving'
                  ? 'trending-up'
                  : activeTrend === 'Needs Attention'
                  ? 'alert-circle-outline'
                  : 'sparkles-outline'
              }
              size={15}
              color={
                activeTrend === 'Improving'
                  ? COLORS.success
                  : activeTrend === 'Needs Attention'
                  ? COLORS.danger
                  : COLORS.primaryDark
              }
              style={{ marginRight: 4 }}
            />
            <Text style={styles.trendText}>{activeTrend}</Text>
          </View>
        </View>

        <View style={styles.summaryStatsRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>{t.dashboard.gamesPlayedToday}</Text>
            <Text style={styles.summaryValue}>{activeTotalGames}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>{t.dashboard.averageScore}</Text>
            <Text style={styles.summaryValue}>
              {activeAverageScore !== null ? `${activeAverageScore}%` : '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* Adaptive Difficulty Engine Status */}
      <View style={styles.adaptiveEngineCard}>
        <View style={styles.adaptiveTopRow}>
          <View style={styles.adaptivePill}>
            <Ionicons name="flash-outline" size={13} color="#E0E7FF" style={{ marginRight: 4 }} />
            <Text style={styles.adaptivePillText}>AI ADAPTIVE ENGINE</Text>
          </View>
          <Text style={styles.adaptiveStatusText}>Active Calibration</Text>
        </View>
        <Text style={styles.adaptiveTitle}>Automated Cognitive Pacing</Text>
        <Text style={styles.adaptiveDesc}>
          Exercises dynamically calibrate difficulty and item complexity based on recent performance metrics.
        </Text>
        <TouchableOpacity
          style={styles.quickPlayBtn}
          activeOpacity={0.8}
          onPress={() => onNavigateTab('games')}
        >
          <Text style={styles.quickPlayBtnText}>Open Cognitive Games</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      {/* Cognitive Domains (6 Categories) */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{t.dashboard.domainsTitle}</Text>
          <Text style={styles.sectionSub}>{t.dashboard.domainsSub}</Text>
        </View>
      </View>

      <View style={styles.domainGrid}>
        {domainItems.map((item, idx) => (
          <View key={idx} style={styles.domainCard}>
            <View style={styles.domainHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                <View style={styles.domainIconCircle}>{item.icon}</View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.domainName} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.domainCategory}>{item.category}</Text>
                </View>
              </View>

              {item.score !== null ? (
                <View style={[styles.scoreBadge, { backgroundColor: COLORS.primaryLight }]}>
                  <Text style={styles.scoreText}>{item.score}%</Text>
                </View>
              ) : (
                <View style={[styles.scoreBadge, { backgroundColor: '#F1F5F9' }]}>
                  <Text style={styles.scoreNoneText}>{t.dashboard.noData}</Text>
                </View>
              )}
            </View>

            {item.score !== null ? (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${item.score}%` }]} />
              </View>
            ) : (
              <Text style={styles.emptyDomainText}>{t.dashboard.noExerciseYet}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Real Game History List */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{t.dashboard.sessionHistoryTitle}</Text>
          <Text style={styles.sectionSub}>Live records stored in MongoDB</Text>
        </View>
        <TouchableOpacity onPress={loadData} activeOpacity={0.7} style={styles.syncBtn}>
          <Ionicons name="refresh" size={16} color={COLORS.primary} />
          <Text style={styles.refreshLink}>Sync DB</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching session records...</Text>
        </View>
      ) : activeSessionsList.length === 0 ? (
        <EmptyState
          icon="game-controller-outline"
          title={t.dashboard.noHistoryTitle}
          description={
            isCaregiverView
              ? 'No cognitive game sessions recorded for this patient yet.'
              : t.dashboard.noHistoryDesc
          }
          actionText={isCaregiverView ? undefined : t.dashboard.goToGamesBtn}
          onAction={isCaregiverView ? undefined : () => onNavigateTab('games')}
        />
      ) : (
        <View style={styles.historyList}>
          {activeSessionsList.map((item) => {
            const scoreDisplay = Math.round(item.performanceScore ?? item.score ?? 80);
            return (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyIconBox}>
                  {getGameIcon(item.gameType)}
                </View>

                <View style={styles.historyLeft}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.historyTitle}>{item.gameTitle || getGameTitle(item.gameType)}</Text>
                    {Boolean(item.difficulty) && (
                      <View style={styles.diffBadge}>
                        <Text style={styles.diffBadgeText}>{getDifficultyLabel(item.difficulty)}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.historyTime}>
                    {new Date(item.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                    {new Date(item.completedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {Boolean(item.responseTimeMs) && (
                    <Text style={styles.historyMoves}>
                      Speed: {(((item.responseTimeMs || 0)) / 1000).toFixed(1)}s
                    </Text>
                  )}
                </View>

                <View style={styles.historyRight}>
                  <Text style={styles.historyScore}>{scoreDisplay}%</Text>
                  <Text style={styles.accuracyText}>
                    Accuracy: {item.accuracy}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.bgMain,
    paddingBottom: 36,
  },
  linkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  linkCardIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  linkCardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  linkCardSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 16,
  },
  pairingInput: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: COLORS.borderMedium,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 2,
    marginBottom: 14,
    textAlign: 'center',
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorBoxText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
    textAlign: 'center',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.2,
  },
  patientSub: {
    fontSize: 15,
    color: COLORS.primaryDark,
    fontWeight: '700',
    marginTop: 4,
  },
  caregiverCode: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  regionSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trendImproving: {
    backgroundColor: COLORS.successLight,
  },
  trendAttention: {
    backgroundColor: COLORS.warningLight,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#CBD5E1',
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
    marginBottom: 3,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  adaptiveEngineCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  adaptiveTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adaptivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  adaptivePillText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  adaptiveStatusText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  adaptiveTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  adaptiveDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 19,
    marginBottom: 12,
  },
  quickPlayBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  quickPlayBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginTop: 4,
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
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  refreshLink: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  loadingBox: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  domainGrid: {
    gap: 10,
    marginBottom: 18,
  },
  domainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  domainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  domainIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  domainName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  domainCategory: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  scoreNoneText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  emptyDomainText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  historyList: {
    gap: 10,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  historyIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyLeft: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  diffBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  historyTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  historyMoves: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  historyScore: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  accuracyText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
