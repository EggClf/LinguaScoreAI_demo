export enum AssessmentType {
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING'
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING',
  TUTOR = 'TUTOR'
}

export enum DifficultyLevel {
  BEGINNER = 'Beginner (A1-A2)',
  INTERMEDIATE = 'Intermediate (B1-B2)',
  ADVANCED = 'Advanced (C1-C2)'
}

export interface CriteriaScore {
  criteria: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface WritingCorrection {
  original: string;
  correction: string;
  explanation: string;
}

export interface AssessmentResult {
  overallScore: number;
  cefrLevel: string; // e.g., "B2", "C1"
  transcription?: string; // For speaking
  criteriaScores: CriteriaScore[];
  generalFeedback: string;
  corrections?: WritingCorrection[]; // For writing
  improvedVersion?: string; // For writing
  pronunciationErrors?: string[]; // For speaking
  audioQualityWarning?: string | null; // Warning for noise/low volume
  flagForReview: boolean; // If AI is uncertain
}

export interface HistoryItem {
  id: string;
  date: string;
  type: AssessmentType;
  score: number;
  preview: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface UserStats {
  currentLevel: string;
  totalAssessments: number;
  masteredVocabulary: number;
  learningVocabulary: number;
  streakDays: number;
}