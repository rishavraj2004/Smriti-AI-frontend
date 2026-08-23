import { apiClient } from './client';
import {
  GameConfig,
  SubmitSessionPayload,
  SubmitSessionResponse,
  CaregiverPerformanceData,
  DomainScores,
  GameResult,
} from '../types/games';

const normalizeBackendGameType = (type: string): string => {
  if (type === 'mathMemory') return 'math_memory';
  if (type === 'objectRecognition') return 'object_recognition';
  if (type === 'routineRecall') return 'routine_recall';
  if (type === 'wordAssociation') return 'word_association';
  return type;
};

export const gamesApi = {
  /**
   * Fetches the next recommended adaptive game configuration from backend.
   */
  async getNextGame(type?: string, difficulty?: number): Promise<{ success: boolean; game: GameConfig }> {
    const params: Record<string, any> = {};
    if (type) params.type = normalizeBackendGameType(type);
    if (difficulty) params.difficulty = difficulty;

    const response = await apiClient.get<{ success: boolean; game: GameConfig }>('/api/games/next', {
      params,
    });
    return response.data;
  },

  /**
   * Submits raw interaction metrics to backend for official score computation and MongoDB persistence.
   */
  async submitSession(payload: SubmitSessionPayload): Promise<SubmitSessionResponse> {
    const normalizedPayload = {
      ...payload,
      gameType: normalizeBackendGameType(payload.gameType),
    };

    const response = await apiClient.post<SubmitSessionResponse>('/api/games/session', normalizedPayload);
    return response.data;
  },

  /**
   * Fetches patient session history and calculated domain scores from MongoDB.
   */
  async getHistory(): Promise<{
    success: boolean;
    totalGamesPlayed: number;
    averagePerformance: number | null;
    domainScores: DomainScores;
    sessions: GameResult[];
  }> {
    const response = await apiClient.get('/api/games/history');
    return response.data;
  },

  /**
   * Fetches real aggregated performance analytics for the caregiver dashboard.
   */
  async getCaregiverPerformance(caregiverToken?: string): Promise<CaregiverPerformanceData> {
    try {
      const headers: Record<string, string> = {};
      if (caregiverToken) {
        headers.Authorization = `Bearer ${caregiverToken}`;
      }
      const response = await apiClient.get<CaregiverPerformanceData>('/api/caregiver/patient/performance', {
        headers,
      });
      return response.data;
    } catch (err: any) {
      if (err?.status === 404) {
        return {
          success: true,
          patient: null as any,
          overallPerformance: null,
          totalGamesPlayed: 0,
          trend: 'Stable',
          domainScores: {
            memory: null,
            attention: null,
            mathMemory: null,
            objectRecognition: null,
            routineRecall: null,
            wordAssociation: null,
          },
          recentSessions: [],
        };
      }
      throw err;
    }
  },

  /**
   * Fetches real individual session records for the caregiver dashboard.
   */
  async getCaregiverSessions(caregiverToken?: string): Promise<{
    success: boolean;
    totalSessions: number;
    sessions: any[];
  }> {
    try {
      const headers: Record<string, string> = {};
      if (caregiverToken) {
        headers.Authorization = `Bearer ${caregiverToken}`;
      }
      const response = await apiClient.get('/api/caregiver/patient/sessions', {
        headers,
      });
      return response.data;
    } catch (err: any) {
      if (err?.status === 404) {
        return {
          success: true,
          totalSessions: 0,
          sessions: [],
        };
      }
      throw err;
    }
  },
};
