export enum AssessmentType {
  WRITING = "WRITING",
  SPEAKING = "SPEAKING",
}

export enum ViewMode {
  DASHBOARD = "DASHBOARD",
  WRITING = "WRITING",
  SPEAKING = "SPEAKING",
  TUTOR = "TUTOR",
  TUTOR_PORTAL = "TUTOR_PORTAL",
  GAMIFICATION = "GAMIFICATION",
}

export enum AssessmentStatus {
  PENDING_AI = "PENDING_AI",
  AI_ESTIMATE = "AI_ESTIMATE",
  PENDING_HUMAN = "PENDING_HUMAN",
  HUMAN_VERIFIED = "HUMAN_VERIFIED",
}

export enum TestType {
  IELTS = "IELTS",
  TOEIC = "TOEIC",
}

export enum TargetLevel {
  BEGINNER = "Beginner (A1-A2)",
  INTERMEDIATE = "Intermediate (B1-B2)",
  ADVANCED = "Advanced (C1-C2)",
}

export enum ConfidenceLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export interface Mistake {
  id: string;
  original: string;
  correction: string;
  rule: string;
  category: string;
  timestamp: Date;
}

export interface SessionSummary {
  durationMinutes: number;
  messageCount: number;
  vocabCount: number;
  mistakeCount: number;
  fluencyScore: number;
  commonMistakes: { category: string; count: number }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
}

export interface SkillNode {
  id: string;
  label: string;
  status: "locked" | "available" | "mastered";
  category: "Grammar" | "Vocabulary" | "Fluency";
  points: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  isCurrentUser: boolean;
  avatar: string;
  city?: string;
}

export interface UserStats {
  currentLevel: string;
  experience: number;
  nextLevelExp: number;
  points: number;
  totalAssessments: number;
  masteredVocabulary: number;
  learningVocabulary: number;
  streakDays: number;
  rank: number;
}

export interface CriteriaScore {
  criteria: string;
  score: number;
  maxScore: number;
  feedback: string;
  confidence: ConfidenceLevel;
  keyFactors: string[];
}

export interface WritingCorrection {
  original: string;
  correction: string;
  explanation: string;
}

export interface RecommendedLesson {
  title: string;
  category: "Grammar" | "Vocabulary" | "Pronunciation" | "Fluency";
  rationale: string;
}

export interface ReferenceAnswer {
  band: string;
  content: string;
  rationale: string;
}

export interface VerificationDetails {
  tutorId: string;
  tutorName: string;
  justification: string;
  voiceNoteUrl?: string;
  verifiedAt: string;
}

export interface AssessmentResult {
  id: string;
  overallScore: number;
  cefrLevel: string;
  transcription?: string;
  criteriaScores: CriteriaScore[];
  generalFeedback: string;
  corrections?: WritingCorrection[];
  improvedVersion?: string;
  pronunciationErrors?: string[];
  audioQualityWarning?: string | null;
  flagForReview: boolean;
  recommendedLessons?: RecommendedLesson[];
  learningPath?: string[];
  referenceAnswers?: ReferenceAnswer[];
  status: AssessmentStatus;
  verification?: VerificationDetails;
  userInput: string;
  testType: TestType;
  targetLevel: TargetLevel;
  type: AssessmentType;
}

export interface HistoryItem {
  id: string;
  date: string;
  type: AssessmentType;
  score: number;
  preview: string;
  status: AssessmentStatus;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export interface Tutor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  status: "online" | "offline" | "busy";
}
