import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  GameResult,
  GameType,
  DomainScores,
  SubmitSessionPayload,
  SubmitSessionResponse,
} from '../types/games';
import { gamesApi } from '../api/gamesApi';
import { useAuth } from './AuthContext';

interface GameStatsContextType {
  sessionHistory: GameResult[];
  domainScores: DomainScores;
  totalGamesPlayedToday: number;
  averageScore: number | null;
  isLoading: boolean;
  recordGameCompletion: (
    gameType: GameType,
    score: number,
    accuracy?: number,
    moves?: number,
    rawMetrics?: Partial<SubmitSessionPayload>
  ) => Promise<SubmitSessionResponse | null>;
  refreshStats: () => Promise<void>;
  clearHistory: () => void;
}

const initialDomainScores: DomainScores = {
  memory: null,
  attention: null,
  objectRecognition: null,
  mathMemory: null,
  routineRecall: null,
  wordAssociation: null,
};

const GameStatsContext = createContext<GameStatsContextType | undefined>(undefined);

export const GameStatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, patient } = useAuth();
  const [sessionHistory, setSessionHistory] = useState<GameResult[]>([]);
  const [domainScores, setDomainScores] = useState<DomainScores>(initialDomainScores);
  const [totalGamesCount, setTotalGamesCount] = useState<number>(0);
  const [averageScoreVal, setAverageScoreVal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getGameTitle = (gameType: GameType): string => {
    switch (gameType) {
      case 'memory':
        return 'Cultural Memory Match';
      case 'attention':
        return 'Focus & Visual Attention';
      case 'mathMemory':
      case 'math_memory':
        return 'Gentle Numbers & Counting';
      case 'objectRecognition':
      case 'object_recognition':
        return 'Object & Cultural Recognition';
      case 'routineRecall':
      case 'routine_recall':
        return 'Daily Routine Sequencing';
      case 'wordAssociation':
      case 'word_association':
        return 'Word & Folklore Association';
      default:
        return 'Cognitive Exercise';
    }
  };

  // Fetch real session history and domain scores from MongoDB
  const refreshStats = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await gamesApi.getHistory();
      if (res && res.success) {
        setTotalGamesCount(res.totalGamesPlayed || 0);
        setAverageScoreVal(res.averagePerformance);
        if (res.domainScores) {
          setDomainScores(res.domainScores);
        }
        if (Array.isArray(res.sessions)) {
          setSessionHistory(
            res.sessions.map((s) => ({
              ...s,
              gameTitle: getGameTitle(s.gameType),
            }))
          );
        }
      }
    } catch (err) {
      console.warn('Could not fetch game history from backend DB:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshStats();
    } else {
      setSessionHistory([]);
      setDomainScores(initialDomainScores);
      setTotalGamesCount(0);
      setAverageScoreVal(null);
    }
  }, [token, refreshStats]);

  const recordGameCompletion = async (
    gameType: GameType,
    score: number,
    accuracy: number = score / 100,
    moves?: number,
    rawMetrics?: Partial<SubmitSessionPayload>
  ): Promise<SubmitSessionResponse | null> => {
    const normAccuracy = accuracy > 1 ? accuracy / 100 : accuracy;
    const completedAt = new Date().toISOString();

    const localResult: GameResult = {
      id: Date.now().toString(),
      gameType,
      gameTitle: getGameTitle(gameType),
      score,
      accuracy: Math.round(normAccuracy * 100),
      moves,
      mistakes: rawMetrics?.mistakes || 0,
      responseTimeMs: rawMetrics?.responseTimeMs || 15000,
      completedAt,
    };

    setSessionHistory((prev) => [localResult, ...prev]);

    // Submit raw interaction telemetry to backend MongoDB
    try {
      const response = await gamesApi.submitSession({
        gameType,
        difficulty: rawMetrics?.difficulty || 1,
        accuracy: normAccuracy,
        responseTimeMs: rawMetrics?.responseTimeMs || 15000,
        mistakes: rawMetrics?.mistakes || 0,
        correctAnswers: rawMetrics?.correctAnswers || 1,
        totalQuestions: rawMetrics?.totalQuestions || 1,
        completed: rawMetrics?.completed !== false,
        startedAt: rawMetrics?.startedAt || new Date(Date.now() - 15000).toISOString(),
      });

      if (response && response.success) {
        // Refresh DB stats in background
        refreshStats();
        return response;
      }
    } catch (err) {
      console.warn('Could not submit game session to backend DB:', err);
    }

    return null;
  };

  const clearHistory = () => {
    setSessionHistory([]);
    setDomainScores(initialDomainScores);
    setTotalGamesCount(0);
    setAverageScoreVal(null);
  };

  return (
    <GameStatsContext.Provider
      value={{
        sessionHistory,
        domainScores,
        totalGamesPlayedToday: totalGamesCount || sessionHistory.length,
        averageScore: averageScoreVal,
        isLoading,
        recordGameCompletion,
        refreshStats,
        clearHistory,
      }}
    >
      {children}
    </GameStatsContext.Provider>
  );
};

export const useGameStats = () => {
  const context = useContext(GameStatsContext);
  if (!context) throw new Error('useGameStats must be used within a GameStatsProvider');
  return context;
};
