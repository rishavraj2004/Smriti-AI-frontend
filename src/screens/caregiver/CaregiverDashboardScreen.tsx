import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../theme/theme';
import { ElderlyButton } from '../../components/ElderlyButton';
import { useAuth } from '../../context/AuthContext';
import { getLanguageLabel } from '../../utils/formatters';
import { gamesApi } from '../../api/gamesApi';
import { CaregiverPerformanceData, GameResult } from '../../types/games';

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
      return <FontAwesome5 name="book-open" size={18} color="#0D9488" />;
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

export const CaregiverDashboardScreen: React.FC = () => {
  const {
    caregiver,
    caregiverToken,
    linkedPatient,
    linkPatientWithCode,
    fetchCaregiverDashboard,
    logoutCaregiver,
  } = useAuth();

  const [pairingCodeInput, setPairingCodeInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Live Performance & Session Data from MongoDB
  const [performanceData, setPerformanceData] = useState<CaregiverPerformanceData | null>(null);
  const [recentSessions, setRecentSessions] = useState<GameResult[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const loadData = useCallback(async () => {
    if (!caregiverToken) return;
    try {
      setIsLoadingData(true);
      setFeedback(null);

      // 1. Fetch aggregated performance analytics from MongoDB
      const perfRes = await gamesApi.getCaregiverPerformance(caregiverToken);
      if (perfRes) {
        setPerformanceData(perfRes);
      }

      // 2. Fetch individual session records from MongoDB
      const sessionRes = await gamesApi.getCaregiverSessions(caregiverToken);
      if (sessionRes && sessionRes.success && Array.isArray(sessionRes.sessions)) {
        setRecentSessions(
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
    } catch (err: any) {
      console.warn('Could not load caregiver dashboard data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [caregiverToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLinkPatient = async () => {
    setFeedback(null);
    const cleanCode = pairingCodeInput.trim().toUpperCase();

    if (!/^SMR-[A-Z0-9]{4}$/.test(cleanCode)) {
      setFeedback({
        type: 'error',
        text: 'Please enter a valid 8-character pairing code in the format SMR-XXXX.',
      });
      return;
    }

    setIsLinking(true);
    try {
      const patient = await linkPatientWithCode(cleanCode);
      setFeedback({
        type: 'success',
        text: `Successfully linked with ${patient.name}!`,
      });
      setPairingCodeInput('');
      setLinkModalVisible(false);
      await loadData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Could not link patient. Check the code and try again.',
      });
    } finally {
      setIsLinking(false);
    }
  };

  const activePatient = performanceData?.patient || linkedPatient;
  const hasPatient = Boolean(activePatient);

  const totalGames = performanceData?.totalGamesPlayed ?? recentSessions.length;
  const overallScore = performanceData?.overallPerformance ?? null;
  const trend = performanceData?.trend || 'Stable';

  const domainScores = performanceData?.domainScores || {
    memory: null,
    attention: null,
    mathMemory: null,
    objectRecognition: null,
    routineRecall: null,
    wordAssociation: null,
  };

  const domainItems = [
    {
      title: 'Cultural Memory Match',
      category: 'Working Memory',
      score: domainScores.memory,
      color: COLORS.primary,
      icon: <MaterialCommunityIcons name="cards-playing-outline" size={20} color={COLORS.teaGreen} />,
    },
    {
      title: 'Focus & Visual Attention',
      category: 'Attention & Focus',
      score: domainScores.attention,
      color: COLORS.secondary,
      icon: <Ionicons name="eye-outline" size={20} color={COLORS.secondaryDark} />,
    },
    {
      title: 'Gentle Numbers & Math',
      category: 'Daily Calculation',
      score: domainScores.mathMemory,
      color: '#2563EB',
      icon: <MaterialCommunityIcons name="calculator-variant" size={20} color="#2563EB" />,
    },
    {
      title: 'Object & Cultural Recognition',
      category: 'Semantic Memory',
      score: domainScores.objectRecognition,
      color: '#BE185D',
      icon: <Ionicons name="cube-outline" size={20} color="#BE185D" />,
    },
    {
      title: 'Daily Routine Sequencing',
      category: 'Executive Function',
      score: domainScores.routineRecall,
      color: '#7E22CE',
      icon: <Ionicons name="time-outline" size={20} color="#7E22CE" />,
    },
    {
      title: 'Word & Folklore Association',
      category: 'Language Recall',
      score: domainScores.wordAssociation,
      color: '#0D9488',
      icon: <FontAwesome5 name="book-open" size={17} color="#0D9488" />,
    },
  ];

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Caregiver Portal Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeEmoji}>🤝</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerBrand}>Smriti AI Caregiver Hub</Text>
              <Text style={styles.caregiverName}>
                {caregiver?.name ? `Caregiver: ${caregiver.name}` : 'Caregiver Portal'}
              </Text>
              <Text style={styles.caregiverEmail}>{caregiver?.email || ''}</Text>
            </View>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={loadData}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Feedback Alert */}
        {feedback && (
          <View
            style={[
              styles.feedbackBox,
              feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess,
            ]}
          >
            <Ionicons
              name={feedback.type === 'error' ? 'alert-circle' : 'checkmark-circle'}
              size={22}
              color={feedback.type === 'error' ? COLORS.danger : COLORS.success}
            />
            <Text
              style={[
                styles.feedbackText,
                { color: feedback.type === 'error' ? COLORS.danger : COLORS.success },
              ]}
            >
              {feedback.text}
            </Text>
          </View>
        )}

        {/* Linked Patient Card or Empty Link Prompt */}
        {hasPatient && activePatient ? (
          <View style={styles.patientCard}>
            <View style={styles.patientHeader}>
              <View style={styles.patientAvatar}>
                <Text style={styles.patientAvatarEmoji}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardSuperTitle}>Linked Family Member</Text>
                <Text style={styles.patientName}>{activePatient.name}</Text>
                <Text style={styles.patientSub}>
                  Age {activePatient.age} • {activePatient.region}
                </Text>
              </View>
              <View style={styles.connectedPill}>
                <View style={styles.greenDot} />
                <Text style={styles.connectedText}>Connected</Text>
              </View>
            </View>

            <View style={styles.patientDetailsGrid}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Language:</Text>
                <Text style={styles.detailValue}>{getLanguageLabel(activePatient.language)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{activePatient.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Pairing Key:</Text>
                <Text style={styles.detailValueCode}>{activePatient.pairingCode}</Text>
              </View>
            </View>

            <ElderlyButton
              title="Link Another Patient Code"
              onPress={() => setLinkModalVisible(true)}
              variant="outline"
              icon="🔗"
              size="normal"
              style={{ marginTop: 14 }}
            />
          </View>
        ) : (
          /* Unlinked State - Direct Prompt to Link Code */
          <View style={styles.unlinkedCard}>
            <View style={styles.unlinkedIconCircle}>
              <Text style={styles.unlinkedEmoji}>🔑</Text>
            </View>
            <Text style={styles.unlinkedTitle}>Link Your Loved One's Patient Key</Text>
            <Text style={styles.unlinkedSub}>
              Enter the 8-character pairing code shown on your patient's Smriti AI screen (e.g. SMR-XXXX) to connect their cognitive profile and stream real session data.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Patient Pairing Code</Text>
              <TextInput
                style={styles.codeInput}
                placeholder="SMR-XXXX"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                maxLength={8}
                value={pairingCodeInput}
                onChangeText={(t) => setPairingCodeInput(t.toUpperCase())}
              />
            </View>

            <ElderlyButton
              title="Link Patient Account"
              onPress={handleLinkPatient}
              variant="primary"
              icon="🔗"
              loading={isLinking}
              style={{ marginTop: 4, width: '100%' }}
            />
          </View>
        )}

        {/* Clinical Overview Stats Card */}
        {hasPatient && (
          <>
            <View style={styles.overviewCard}>
              <View style={styles.overviewTop}>
                <View>
                  <Text style={styles.overviewTitle}>Cognitive Performance Summary</Text>
                  <Text style={styles.overviewSub}>Aggregated from MongoDB session history</Text>
                </View>
                <View
                  style={[
                    styles.trendBadge,
                    trend === 'Improving' && styles.trendImproving,
                    trend === 'Needs Attention' && styles.trendAttention,
                  ]}
                >
                  <Text style={styles.trendText}>
                    {trend === 'Improving' ? '📈' : trend === 'Needs Attention' ? '🎯' : '✨'} {trend}
                  </Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Sessions Played</Text>
                  <Text style={styles.statValue}>{totalGames}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Overall Score</Text>
                  <Text style={styles.statValue}>
                    {overallScore !== null ? `${overallScore}%` : '—'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Cognitive Domains (6 Categories) */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cognitive Domains Breakdown</Text>
              <TouchableOpacity onPress={loadData} activeOpacity={0.7} style={styles.syncBtn}>
                <Ionicons name="refresh" size={16} color={COLORS.primary} />
                <Text style={styles.syncBtnText}>Sync DB</Text>
              </TouchableOpacity>
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
                        <Text style={styles.scoreNoneText}>No Data</Text>
                      </View>
                    )}
                  </View>

                  {item.score !== null ? (
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBar, { width: `${item.score}%` }]} />
                    </View>
                  ) : (
                    <Text style={styles.emptyDomainText}>No exercises recorded in this domain yet</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Recent Cognitive Sessions List */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Cognitive Sessions</Text>
              <Text style={styles.sectionSub}>Live from MongoDB</Text>
            </View>

            {isLoadingData ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Fetching session records...</Text>
              </View>
            ) : recentSessions.length === 0 ? (
              <View style={styles.noSessionsCard}>
                <Text style={styles.noSessionsEmoji}>🎮</Text>
                <Text style={styles.noSessionsTitle}>No Sessions Recorded Yet</Text>
                <Text style={styles.noSessionsSub}>
                  When {activePatient?.name || 'the patient'} plays cognitive games in Smriti AI, sessions and scores will appear here automatically.
                </Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {recentSessions.map((item) => {
                  const scoreDisplay = item.performanceScore ?? item.score;
                  return (
                    <View key={item.id} style={styles.historyCard}>
                      <View style={styles.historyIconBox}>
                        {getGameIcon(item.gameType)}
                      </View>

                      <View style={styles.historyLeft}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <Text style={styles.historyTitle} numberOfLines={1}>
                            {item.gameTitle || getGameTitle(item.gameType)}
                          </Text>
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
          </>
        )}

        {/* Caregiver Sign Out */}
        <ElderlyButton
          title="Sign Out of Caregiver Portal"
          onPress={() => setLogoutModalVisible(true)}
          variant="danger"
          icon="🚪"
          style={{ marginTop: 24, marginBottom: 24 }}
        />
      </ScrollView>

      {/* Re-Link Code Modal */}
      <Modal
        visible={linkModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLinkModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🔑</Text>
            <Text style={styles.modalTitle}>Link Patient Key</Text>
            <Text style={styles.modalSubtitle}>
              Enter the 8-character pairing code from the patient's Smriti AI screen.
            </Text>

            <TextInput
              style={[styles.codeInput, { width: '100%', marginBottom: 14 }]}
              placeholder="SMR-XXXX"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              maxLength={8}
              value={pairingCodeInput}
              onChangeText={(t) => setPairingCodeInput(t.toUpperCase())}
            />

            <ElderlyButton
              title="Confirm Link"
              onPress={handleLinkPatient}
              variant="primary"
              icon="🔗"
              loading={isLinking}
              style={{ width: '100%', marginBottom: 8 }}
            />
            <ElderlyButton
              title="Cancel"
              onPress={() => setLinkModalVisible(false)}
              variant="outline"
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </Modal>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🚪</Text>
            <Text style={styles.modalTitle}>Sign Out from Caregiver Hub?</Text>
            <Text style={styles.modalSubtitle}>
              You will need to sign in again to access patient monitoring.
            </Text>

            <ElderlyButton
              title="Sign Out"
              onPress={async () => {
                setLogoutModalVisible(false);
                await logoutCaregiver();
              }}
              variant="danger"
              style={{ width: '100%', marginBottom: 8 }}
            />
            <ElderlyButton
              title="Cancel"
              onPress={() => setLogoutModalVisible(false)}
              variant="outline"
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.bgMain,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerBadgeEmoji: {
    fontSize: 24,
  },
  headerBrand: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A5B4FC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  caregiverName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  caregiverEmail: {
    fontSize: 13,
    color: '#C7D2FE',
    marginTop: 2,
  },
  refreshBtn: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    gap: 10,
  },
  feedbackSuccess: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  feedbackError: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  patientCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  patientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  patientAvatarEmoji: {
    fontSize: 26,
  },
  cardSuperTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  patientName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  patientSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  connectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  connectedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  patientDetailsGrid: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  detailValueCode: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 1,
  },
  unlinkedCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 22,
    padding: 22,
    marginBottom: 20,
    alignItems: 'center',
    ...SHADOWS.card,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  unlinkedIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  unlinkedEmoji: {
    fontSize: 30,
  },
  unlinkedTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  unlinkedSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  codeInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 2,
    textAlign: 'center',
  },
  overviewCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  overviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  overviewSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  trendBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  trendImproving: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  trendAttention: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#C7D2FE',
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    ...SHADOWS.card,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  domainGrid: {
    gap: 12,
    marginBottom: 20,
  },
  domainCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.card,
  },
  domainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  domainIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  domainName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  domainCategory: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  scoreNoneText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  progressContainer: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  emptyDomainText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  loadingBox: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  noSessionsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.card,
    marginBottom: 16,
  },
  noSessionsEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  noSessionsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  noSessionsSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  historyList: {
    gap: 12,
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  historyIconBox: {
    width: 44,
    height: 44,
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
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  diffBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  historyTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  historyMoves: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  historyScore: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  accuracyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  modalEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
});
