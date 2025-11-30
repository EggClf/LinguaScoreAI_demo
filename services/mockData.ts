import { AssessmentType } from "../types";

export const MOCK_USER_STATS = {
  currentLevel: "B1 Intermediate",
  totalAssessments: 24,
  masteredVocabulary: 450,
  learningVocabulary: 120,
  streakDays: 5
};

export const MOCK_HISTORY_DATA = [
  { date: '2024-02-01', score: 4.5, type: AssessmentType.WRITING },
  { date: '2024-02-05', score: 5.0, type: AssessmentType.SPEAKING },
  { date: '2024-02-10', score: 5.0, type: AssessmentType.WRITING },
  { date: '2024-02-15', score: 5.5, type: AssessmentType.SPEAKING },
  { date: '2024-02-20', score: 6.0, type: AssessmentType.WRITING },
  { date: '2024-02-25', score: 6.0, type: AssessmentType.SPEAKING },
  { date: '2024-03-01', score: 6.5, type: AssessmentType.WRITING },
  { date: '2024-03-05', score: 7.0, type: AssessmentType.SPEAKING },
];

export const MOCK_WEAKNESS_DATA = [
  { subject: 'Articles (a/an/the)', frequency: 15, fullMark: 20 },
  { subject: 'Past Tense', frequency: 12, fullMark: 20 },
  { subject: 'Plural Endings', frequency: 10, fullMark: 20 },
  { subject: 'Prepositions', frequency: 8, fullMark: 20 },
  { subject: 'Pronunciation (th)', frequency: 18, fullMark: 20 },
];

export const MOCK_VOCAB_PROGRESS = [
  { month: 'Jan', learned: 20 },
  { month: 'Feb', learned: 45 },
  { month: 'Mar', learned: 85 },
];