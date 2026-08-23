export type BackendGameType =
  | 'memory'
  | 'attention'
  | 'math_memory'
  | 'object_recognition'
  | 'routine_recall'
  | 'word_association';

export type GameType =
  | BackendGameType
  | 'mathMemory'
  | 'objectRecognition'
  | 'routineRecall'
  | 'wordAssociation';

export interface GameSettings {
  timeLimitMs?: number;
  expectedTimeMs?: number;
}

export interface GameConfig<T = any> {
  gameType: BackendGameType;
  difficulty: 1 | 2 | 3;
  title: string;
  instructions: string;
  content: T;
  settings?: GameSettings;
  sessionSeed?: string;
  patientId?: string;
}

export interface SubmitSessionPayload {
  gameType: BackendGameType | GameType;
  difficulty: number;
  accuracy: number;
  responseTimeMs: number;
  mistakes?: number;
  correctAnswers?: number;
  totalQuestions?: number;
  completed?: boolean;
  startedAt?: string;
}

export interface ScoreComponents {
  accuracyScore: number;
  speedScore: number;
  consistencyScore: number;
  completionScore: number;
}

export interface SessionResultDetails {
  id: string;
  gameType: string;
  difficulty: number;
  score: number;
  accuracy: number;
  performanceScore: number;
  responseTimeMs: number;
  completedAt: string;
  components?: ScoreComponents;
}

export interface AdaptationDetails {
  previousDifficulty: number;
  nextDifficulty: number;
  reason: string;
}

export interface SubmitSessionResponse {
  success: boolean;
  message?: string;
  session: SessionResultDetails;
  adaptation: AdaptationDetails;
}

export interface GameResult {
  id: string;
  gameType: GameType;
  gameTitle: string;
  score: number;
  accuracy: number;
  performanceScore?: number;
  difficulty?: number;
  moves?: number;
  mistakes?: number;
  timeSpentSeconds?: number;
  responseTimeMs?: number;
  completedAt: string;
}

export interface DomainScores {
  memory: number | null;
  attention: number | null;
  objectRecognition: number | null;
  mathMemory: number | null;
  routineRecall: number | null;
  wordAssociation: number | null;
}

export interface CaregiverPerformanceData {
  success?: boolean;
  patient?: {
    id: string;
    name: string;
    email: string;
    age: number;
    language: string;
    region: string;
    pairingCode: string;
  };
  overallPerformance: number | null;
  totalGamesPlayed: number;
  trend: string;
  domainScores: DomainScores;
  recentSessions: Array<{
    id: string;
    gameType: string;
    difficulty: number;
    performanceScore: number;
    accuracy: number;
    responseTimeMs: number;
    completedAt: string;
  }>;
}

export interface GameInfo {
  id: GameType;
  backendType: BackendGameType;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bgLight: string;
  category: string;
  badge: string;
}
