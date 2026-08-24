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
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  Feather,
} from '@expo/vector-icons';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../theme/theme';
import { ElderlyButton } from '../../components/ElderlyButton';
import { useAuth } from '../../context/AuthContext';
import { getLanguageLabel } from '../../utils/formatters';
import { gamesApi } from '../../api/gamesApi';
import { CaregiverPerformanceData, GameResult } from '../../types/games';

type CaregiverTabType = 'overview' | 'cognitive' | 'sessions' | 'care';

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

export const CaregiverDashboardScreen: React.FC = () => {
  const {
    caregiver,
    caregiverToken,
    linkedPatient,
    linkPatientWithCode,
    logoutCaregiver,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<CaregiverTabType>('overview');
  const [pairingCodeInput, setPairingCodeInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Caregiver quick observation note state
  const [caregiverNote, setCaregiverNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([
    'Patient rested well and took morning prescribed medication on time.',
    'Enjoyed the Cultural Memory Match game with great focus.',
  ]);

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

  const handleAddNote = () => {
    if (!caregiverNote.trim()) return;
    setSavedNotes([caregiverNote.trim(), ...savedNotes]);
    setCaregiverNote('');
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
      icon: <MaterialCommunityIcons name="cards-playing-outline" size={22} color={COLORS.primary} />,
      desc: 'Visual recall and pattern retention',
    },
    {
      title: 'Focus & Visual Attention',
      category: 'Attention & Focus',
      score: domainScores.attention,
      color: COLORS.secondary,
      icon: <Ionicons name="eye-outline" size={22} color={COLORS.secondary} />,
      desc: 'Target discrimination and alertness',
    },
    {
      title: 'Gentle Numbers & Math',
      category: 'Daily Calculation',
      score: domainScores.mathMemory,
      color: '#2563EB',
      icon: <MaterialCommunityIcons name="calculator-variant" size={22} color="#2563EB" />,
      desc: 'Basic numeracy and mental sharpness',
    },
    {
      title: 'Object & Cultural Recognition',
      category: 'Semantic Memory',
      score: domainScores.objectRecognition,
      color: '#BE185D',
      icon: <Ionicons name="cube-outline" size={22} color="#BE185D" />,
      desc: 'Familiar item and identity recognition',
    },
    {
      title: 'Daily Routine Sequencing',
      category: 'Executive Function',
      score: domainScores.routineRecall,
      color: '#7E22CE',
      icon: <Ionicons name="time-outline" size={22} color="#7E22CE" />,
      desc: 'Temporal planning and daily task order',
    },
    {
      title: 'Word & Folklore Association',
      category: 'Language Recall',
      score: domainScores.wordAssociation,
      color: '#0D9488',
      icon: <FontAwesome5 name="book-open" size={18} color="#0D9488" />,
      desc: 'Verbal fluency and regional vocabulary',
    },
  ];

  return (
    <View style={styles.screenWrapper}>
      {/* Caregiver Portal Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.caregiverIconBox}>
            <Ionicons name="heart-half-outline" size={24} color={COLORS.primaryDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Caregiver Hub</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {caregiver?.name ? `Caregiver: ${caregiver.name}` : 'Cognitive Care & Monitoring'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={loadData}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={20} color={COLORS.primaryDark} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerIconBtn, { backgroundColor: '#FEE2E2' }]}
            onPress={() => setLogoutModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Segmented Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'overview' && styles.tabItemActive]}
          onPress={() => setActiveTab('overview')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'overview' ? 'grid' : 'grid-outline'}
            size={18}
            color={activeTab === 'overview' ? COLORS.primaryDark : COLORS.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'cognitive' && styles.tabItemActive]}
          onPress={() => setActiveTab('cognitive')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'cognitive' ? 'analytics' : 'analytics-outline'}
            size={18}
            color={activeTab === 'cognitive' ? COLORS.primaryDark : COLORS.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'cognitive' && styles.tabTextActive]}>
            Cognitive
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'sessions' && styles.tabItemActive]}
          onPress={() => setActiveTab('sessions')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'sessions' ? 'game-controller' : 'game-controller-outline'}
            size={18}
            color={activeTab === 'sessions' ? COLORS.primaryDark : COLORS.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'sessions' && styles.tabTextActive]}>
            Sessions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'care' && styles.tabItemActive]}
          onPress={() => setActiveTab('care')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'care' ? 'clipboard' : 'clipboard-outline'}
            size={18}
            color={activeTab === 'care' ? COLORS.primaryDark : COLORS.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'care' && styles.tabTextActive]}>
            Care & Notes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Tab Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
              size={20}
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

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            {hasPatient && activePatient ? (
              <View style={styles.card}>
                <View style={styles.patientHeader}>
                  <View style={styles.patientAvatarBox}>
                    <Ionicons name="person" size={26} color={COLORS.primaryDark} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardSuperTitle}>Linked Family Member</Text>
                    <Text style={styles.patientName}>{activePatient.name}</Text>
                    <Text style={styles.patientSub}>
                      Age {activePatient.age} • {activePatient.region}
                    </Text>
                  </View>
                  <View style={styles.connectedBadge}>
                    <View style={styles.greenPulseDot} />
                    <Text style={styles.connectedBadgeText}>Active</Text>
                  </View>
                </View>

                <View style={styles.detailsGrid}>
                  <View style={styles.detailCard}>
                    <Text style={styles.detailLabel}>Language</Text>
                    <Text style={styles.detailValue}>{getLanguageLabel(activePatient.language)}</Text>
                  </View>
                  <View style={styles.detailCard}>
                    <Text style={styles.detailLabel}>Pairing Key</Text>
                    <Text style={styles.detailCodeText}>{activePatient.pairingCode}</Text>
                  </View>
                  <View style={[styles.detailCard, { width: '100%' }]}>
                    <Text style={styles.detailLabel}>Account Email</Text>
                    <Text style={styles.detailValue}>{activePatient.email}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.switchPatientBtn}
                  onPress={() => setLinkModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="swap-horizontal" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.switchPatientBtnText}>Link or Switch Patient Key</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.unlinkedCard}>
                <View style={styles.unlinkedIconBox}>
                  <Ionicons name="key-outline" size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.unlinkedTitle}>Link Your Loved One's Profile</Text>
                <Text style={styles.unlinkedSub}>
                  Enter the 8-character pairing code from the patient screen (e.g. SMR-XXXX) to monitor cognitive exercises in real-time.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Patient Pairing Key</Text>
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
                  title="Connect Patient Profile"
                  onPress={handleLinkPatient}
                  variant="primary"
                  loading={isLinking}
                  style={{ width: '100%', marginTop: 6 }}
                />
              </View>
            )}

            {/* Performance Summary Cards */}
            {hasPatient && (
              <>
                <View style={styles.metricsRow}>
                  <View style={styles.metricCard}>
                    <View style={[styles.metricIconBox, { backgroundColor: COLORS.primaryLight }]}>
                      <Ionicons name="game-controller-outline" size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.metricNumber}>{totalGames}</Text>
                    <Text style={styles.metricLabel}>Total Sessions</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <View style={[styles.metricIconBox, { backgroundColor: COLORS.secondaryLight }]}>
                      <Ionicons name="ribbon-outline" size={20} color={COLORS.secondary} />
                    </View>
                    <Text style={styles.metricNumber}>
                      {overallScore !== null ? `${overallScore}%` : '—'}
                    </Text>
                    <Text style={styles.metricLabel}>Cognitive Index</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <View
                      style={[
                        styles.metricIconBox,
                        {
                          backgroundColor:
                            trend === 'Improving'
                              ? COLORS.successLight
                              : trend === 'Needs Attention'
                              ? COLORS.dangerLight
                              : '#F1F5F9',
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          trend === 'Improving'
                            ? 'trending-up'
                            : trend === 'Needs Attention'
                            ? 'alert-circle-outline'
                            : 'remove-outline'
                        }
                        size={20}
                        color={
                          trend === 'Improving'
                            ? COLORS.success
                            : trend === 'Needs Attention'
                            ? COLORS.danger
                            : COLORS.textMuted
                        }
                      />
                    </View>
                    <Text style={styles.metricNumber} numberOfLines={1}>
                      {trend}
                    </Text>
                    <Text style={styles.metricLabel}>Current Trend</Text>
                  </View>
                </View>

                {/* Today's Care Check-in Summary */}
                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View>
                      <Text style={styles.cardTitle}>Today's Care Status</Text>
                      <Text style={styles.cardSubtitle}>Real-time patient wellness check-ins</Text>
                    </View>
                    <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.primary} />
                  </View>

                  <View style={styles.careList}>
                    <View style={styles.careRow}>
                      <View style={[styles.checkCircle, { backgroundColor: COLORS.successLight }]}>
                        <Ionicons name="checkmark" size={16} color={COLORS.success} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.careItemTitle}>Morning Hydration & Routine</Text>
                        <Text style={styles.careItemSub}>Warm water & gentle stretches logged</Text>
                      </View>
                      <Text style={styles.careTimeText}>Completed</Text>
                    </View>

                    <View style={styles.careRow}>
                      <View style={[styles.checkCircle, { backgroundColor: COLORS.successLight }]}>
                        <Ionicons name="checkmark" size={16} color={COLORS.success} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.careItemTitle}>Prescribed Morning Medication</Text>
                        <Text style={styles.careItemSub}>Confirmed on schedule</Text>
                      </View>
                      <Text style={styles.careTimeText}>09:00 AM</Text>
                    </View>

                    <View style={styles.careRow}>
                      <View style={[styles.checkCircle, { backgroundColor: COLORS.primaryLight }]}>
                        <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.careItemTitle}>Afternoon Cognitive Exercise</Text>
                        <Text style={styles.careItemSub}>Mitr companion memory session</Text>
                      </View>
                      <Text style={styles.careTimeText}>Pending</Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </>
        )}

        {/* TAB 2: COGNITIVE ANALYTICS */}
        {activeTab === 'cognitive' && (
          <>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.pageTitle}>Cognitive Domains Breakdown</Text>
                <Text style={styles.pageSubtitle}>
                  Multi-domain performance scores across 6 cognitive dimensions
                </Text>
              </View>
              <TouchableOpacity onPress={loadData} activeOpacity={0.7} style={styles.refreshMiniBtn}>
                <Ionicons name="sync" size={16} color={COLORS.primary} />
                <Text style={styles.refreshMiniText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.domainList}>
              {domainItems.map((item, idx) => (
                <View key={idx} style={styles.domainCard}>
                  <View style={styles.domainHeaderRow}>
                    <View style={styles.domainIconCircle}>{item.icon}</View>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.domainTitleText} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.domainCategoryTag}>{item.category} • {item.desc}</Text>
                    </View>

                    {item.score !== null ? (
                      <View style={[styles.scoreBadge, { backgroundColor: COLORS.primaryLight }]}>
                        <Text style={styles.scoreBadgeText}>{item.score}%</Text>
                      </View>
                    ) : (
                      <View style={[styles.scoreBadge, { backgroundColor: '#F1F5F9' }]}>
                        <Text style={styles.scoreNoneText}>No Data</Text>
                      </View>
                    )}
                  </View>

                  {item.score !== null ? (
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressBar, { width: `${item.score}%` }]} />
                    </View>
                  ) : (
                    <Text style={styles.noDomainDataText}>No exercises recorded in this domain yet</Text>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* TAB 3: RECENT SESSIONS */}
        {activeTab === 'sessions' && (
          <>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.pageTitle}>Recent Cognitive Sessions</Text>
                <Text style={styles.pageSubtitle}>
                  Logged session telemetry stored in MongoDB
                </Text>
              </View>
              <TouchableOpacity onPress={loadData} activeOpacity={0.7} style={styles.refreshMiniBtn}>
                <Ionicons name="sync" size={16} color={COLORS.primary} />
                <Text style={styles.refreshMiniText}>Sync</Text>
              </TouchableOpacity>
            </View>

            {isLoadingData ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Fetching session records from database...</Text>
              </View>
            ) : recentSessions.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="game-controller-outline" size={44} color={COLORS.textMuted} />
                <Text style={styles.emptyCardTitle}>No Sessions Recorded Yet</Text>
                <Text style={styles.emptyCardSub}>
                  When {activePatient?.name || 'the patient'} plays cognitive games in Smriti AI, scores and speed telemetry will appear here automatically.
                </Text>
              </View>
            ) : (
              <View style={styles.sessionList}>
                {recentSessions.map((item) => {
                  const scoreDisplay = item.performanceScore ?? item.score;
                  return (
                    <View key={item.id} style={styles.sessionCard}>
                      <View style={styles.sessionIconCircle}>
                        {getGameIcon(item.gameType)}
                      </View>

                      <View style={styles.sessionMiddle}>
                        <View style={styles.sessionTitleRow}>
                          <Text style={styles.sessionGameName} numberOfLines={1}>
                            {item.gameTitle || getGameTitle(item.gameType)}
                          </Text>
                          {Boolean(item.difficulty) && (
                            <View style={styles.diffPill}>
                              <Text style={styles.diffPillText}>{getDifficultyLabel(item.difficulty)}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.sessionTimestamp}>
                          {new Date(item.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                          {new Date(item.completedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        {Boolean(item.responseTimeMs) && (
                          <Text style={styles.sessionSpeed}>
                            Avg Speed: {(((item.responseTimeMs || 0)) / 1000).toFixed(1)}s
                          </Text>
                        )}
                      </View>

                      <View style={styles.sessionRight}>
                        <Text style={styles.sessionScoreNumber}>{scoreDisplay}%</Text>
                        <Text style={styles.sessionAccuracyNumber}>
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

        {/* TAB 4: CARE & NOTES */}
        {activeTab === 'care' && (
          <>
            {/* Quick Observations Notepad */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.cardTitle}>Caregiver Observation Notes</Text>
                  <Text style={styles.cardSubtitle}>Record notes on mood, sleep, or nutrition</Text>
                </View>
                <Feather name="edit-3" size={22} color={COLORS.primary} />
              </View>

              <View style={styles.noteInputBox}>
                <TextInput
                  style={styles.noteTextInput}
                  placeholder="Type an observation (e.g. Patient enjoyed tea in the garden, relaxed mood)..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={caregiverNote}
                  onChangeText={setCaregiverNote}
                />
                <TouchableOpacity
                  style={[styles.saveNoteBtn, !caregiverNote.trim() && { opacity: 0.5 }]}
                  onPress={handleAddNote}
                  disabled={!caregiverNote.trim()}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.saveNoteBtnText}>Save Note</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.savedNotesContainer}>
                <Text style={styles.savedNotesHeader}>Recent Observations</Text>
                {savedNotes.map((note, index) => (
                  <View key={index} style={styles.noteCard}>
                    <Ionicons name="document-text-outline" size={18} color={COLORS.primary} style={{ marginTop: 2, marginRight: 8 }} />
                    <Text style={styles.noteCardText}>{note}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Daily Eldercare Schedule */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recommended Daily Care Schedule</Text>
              <Text style={styles.cardSubtitle}>Cognitive & physical routine milestones</Text>

              <View style={styles.scheduleTimeline}>
                <View style={styles.scheduleItem}>
                  <View style={styles.scheduleDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scheduleItemTime}>07:30 AM — Morning Awaken & Hydration</Text>
                    <Text style={styles.scheduleItemDesc}>Warm water, morning sunlight, light stretches</Text>
                  </View>
                </View>

                <View style={styles.scheduleItem}>
                  <View style={styles.scheduleDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scheduleItemTime}>09:00 AM — Breakfast & Medications</Text>
                    <Text style={styles.scheduleItemDesc}>Wholesome meal and prescribed medicine</Text>
                  </View>
                </View>

                <View style={styles.scheduleItem}>
                  <View style={styles.scheduleDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scheduleItemTime}>11:30 AM — Smriti AI Cognitive Session</Text>
                    <Text style={styles.scheduleItemDesc}>Memory match, word games & Mitr AI companionship</Text>
                  </View>
                </View>

                <View style={styles.scheduleItem}>
                  <View style={styles.scheduleDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scheduleItemTime}>01:30 PM — Nutritious Lunch & Rest</Text>
                    <Text style={styles.scheduleItemDesc}>Healthy lunch followed by a 20-30 min quiet nap</Text>
                  </View>
                </View>

                <View style={styles.scheduleItem}>
                  <View style={styles.scheduleDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scheduleItemTime}>05:00 PM — Tea & Family Reminiscence</Text>
                    <Text style={styles.scheduleItemDesc}>Warm Assam tea, family photos, and conversation</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Link Code Modal */}
      <Modal
        visible={linkModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLinkModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="link-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.modalTitle}>Connect Patient Key</Text>
            <Text style={styles.modalSubtitle}>
              Enter the 8-character pairing code from the patient screen.
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
              title="Confirm & Link"
              onPress={handleLinkPatient}
              variant="primary"
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

      {/* Sign Out Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIconCircle, { backgroundColor: COLORS.dangerLight }]}>
              <Ionicons name="log-out-outline" size={32} color={COLORS.danger} />
            </View>
            <Text style={styles.modalTitle}>Sign Out from Caregiver Hub?</Text>
            <Text style={styles.modalSubtitle}>
              You will need to sign in again to monitor patient sessions and telemetry.
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
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...SHADOWS.subtle,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  caregiverIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 1,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 6,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
    backgroundColor: '#F8FAFC',
  },
  tabItemActive: {
    backgroundColor: COLORS.primaryLight,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    gap: 10,
  },
  feedbackSuccess: {
    backgroundColor: COLORS.successLight,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  feedbackError: {
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  pageSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  refreshMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  refreshMiniText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  patientAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardSuperTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  patientName: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  patientSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  greenPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  connectedBadgeText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '700',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  detailCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 2,
  },
  detailCodeText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 2,
    letterSpacing: 1,
  },
  switchPatientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  switchPatientBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  unlinkedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  unlinkedIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  unlinkedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  unlinkedSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 21,
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
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.borderMedium,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    color: COLORS.textDark,
    backgroundColor: '#FFFFFF',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  metricIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  careList: {
    gap: 12,
  },
  careRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  careItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  careItemSub: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  careTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  domainList: {
    gap: 12,
  },
  domainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  domainHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  domainIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  domainTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  domainCategoryTag: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  scoreBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  scoreNoneText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  noDomainDataText: {
    fontSize: 12,
    color: COLORS.textSubtle,
    fontStyle: 'italic',
  },
  sessionList: {
    gap: 12,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  sessionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sessionMiddle: {
    flex: 1,
    marginRight: 8,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sessionGameName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
  },
  diffPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  sessionTimestamp: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  sessionSpeed: {
    fontSize: 11,
    color: COLORS.textSubtle,
    marginTop: 1,
  },
  sessionRight: {
    alignItems: 'flex-end',
  },
  sessionScoreNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  sessionAccuracyNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  emptyCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyCardSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  noteInputBox: {
    marginBottom: 16,
  },
  noteTextInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderMedium,
    padding: 14,
    fontSize: 14,
    color: COLORS.textDark,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  saveNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveNoteBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  savedNotesContainer: {
    gap: 8,
  },
  savedNotesHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noteCardText: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 19,
    flex: 1,
  },
  scheduleTimeline: {
    marginTop: 14,
    gap: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  scheduleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginTop: 5,
  },
  scheduleItemTime: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  scheduleItemDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    ...SHADOWS.cardHover,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
});
