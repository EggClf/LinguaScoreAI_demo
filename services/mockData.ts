import {
  AssessmentType,
  Tutor,
  AssessmentStatus,
  TestType,
  TargetLevel,
  AssessmentResult,
  ConfidenceLevel,
  Achievement,
  LeaderboardEntry,
  SkillNode,
  UserStats,
} from "../types";

export const MOCK_USER_STATS: UserStats = {
  currentLevel: "B1 Intermediate",
  experience: 450,
  nextLevelExp: 1000,
  points: 2450,
  totalAssessments: 24,
  masteredVocabulary: 450,
  learningVocabulary: 120,
  streakDays: 5,
  rank: 124,
};

export const MOCK_SKILL_TREE: SkillNode[] = [
  {
    id: "1",
    label: "Present Simple",
    status: "mastered",
    category: "Grammar",
    points: 100,
  },
  {
    id: "2",
    label: "Past Narrative",
    status: "mastered",
    category: "Grammar",
    points: 150,
  },
  {
    id: "3",
    label: "Conditionals",
    status: "available",
    category: "Grammar",
    points: 200,
  },
  {
    id: "4",
    label: "IELTS Vocabulary",
    status: "available",
    category: "Vocabulary",
    points: 300,
  },
  {
    id: "5",
    label: "Fluency Fillers",
    status: "locked",
    category: "Fluency",
    points: 250,
  },
  {
    id: "6",
    label: "Subjunctive Mood",
    status: "locked",
    category: "Grammar",
    points: 500,
  },
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: "a1",
    title: "Grammar Guru",
    description: "Get 10 perfect grammar scores",
    icon: "🏆",
    unlocked: false,
    progress: 7,
    maxProgress: 10,
    rarity: "Rare",
  },
  {
    id: "a2",
    title: "Streak Master",
    description: "30-day practice streak",
    icon: "🔥",
    unlocked: false,
    progress: 5,
    maxProgress: 30,
    rarity: "Epic",
  },
  {
    id: "a3",
    title: "Native Navigator",
    description: "Reach C1 level",
    icon: "🧭",
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rarity: "Legendary",
  },
  {
    id: "a4",
    title: "First Step",
    description: "Complete your first assessment",
    icon: "🌱",
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    rarity: "Common",
  },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "Minh Anh",
    points: 12500,
    isCurrentUser: false,
    avatar: "https://i.pravatar.cc/150?u=1",
    city: "Hanoi",
  },
  {
    rank: 2,
    name: "Thanh Tung",
    points: 11200,
    isCurrentUser: false,
    avatar: "https://i.pravatar.cc/150?u=2",
    city: "Saigon",
  },
  {
    rank: 3,
    name: "Bao Ngoc",
    points: 9800,
    isCurrentUser: false,
    avatar: "https://i.pravatar.cc/150?u=3",
    city: "Danang",
  },
  {
    rank: 124,
    name: "You",
    points: 2450,
    isCurrentUser: true,
    avatar: "https://i.pravatar.cc/150?u=me",
    city: "Saigon",
  },
];

export const MOCK_HISTORY_DATA = [
  {
    id: "h1",
    date: "2024-02-01",
    score: 4.5,
    type: AssessmentType.WRITING,
    status: AssessmentStatus.HUMAN_VERIFIED,
    preview: "The benefits of remote work are...",
  },
  {
    id: "h2",
    date: "2024-02-05",
    score: 5.0,
    type: AssessmentType.SPEAKING,
    status: AssessmentStatus.AI_ESTIMATE,
    preview: "Audio submission about travel.",
  },
  {
    id: "h3",
    date: "2024-02-10",
    score: 5.0,
    type: AssessmentType.WRITING,
    status: AssessmentStatus.AI_ESTIMATE,
    preview: "Global warming is a big issue...",
  },
  {
    id: "h4",
    date: "2024-02-15",
    score: 5.5,
    type: AssessmentType.SPEAKING,
    status: AssessmentStatus.HUMAN_VERIFIED,
    preview: "Pronunciation drill response.",
  },
  {
    id: "h5",
    date: "2024-02-20",
    score: 6.0,
    type: AssessmentType.WRITING,
    status: AssessmentStatus.AI_ESTIMATE,
    preview: "Technology in the classroom...",
  },
  {
    id: "h6",
    date: "2024-02-25",
    score: 6.0,
    type: AssessmentType.SPEAKING,
    status: AssessmentStatus.AI_ESTIMATE,
    preview: "Daily routine description.",
  },
  {
    id: "h7",
    date: "2024-03-01",
    score: 6.5,
    type: AssessmentType.WRITING,
    status: AssessmentStatus.PENDING_HUMAN,
    preview: "Economic impact of tourism...",
  },
];

export const MOCK_PENDING_REVIEWS: AssessmentResult[] = [
  {
    id: "rev-1",
    type: AssessmentType.WRITING,
    overallScore: 5.5,
    cefrLevel: "B1",
    userInput:
      "I think that technology is very good for education because it helps student for learn faster. However some people thinking that technology is distract.",
    testType: TestType.IELTS,
    targetLevel: TargetLevel.INTERMEDIATE,
    status: AssessmentStatus.PENDING_HUMAN,
    flagForReview: true,
    generalFeedback: "Good start, but grammar consistency needs work.",
    criteriaScores: [
      {
        criteria: "Grammar",
        score: 4,
        maxScore: 10,
        feedback: "Tense errors detected.",
        confidence: ConfidenceLevel.HIGH,
        keyFactors: ["Tense consistency", "Subject-verb agreement"],
      },
      {
        criteria: "Vocabulary",
        score: 6,
        maxScore: 10,
        feedback: "Good range of words.",
        confidence: ConfidenceLevel.MEDIUM,
        keyFactors: ["Lexical resource", "Common collocations"],
      },
    ],
    recommendedLessons: [],
    learningPath: [],
  },
];

export const MOCK_WEAKNESS_DATA = [
  { subject: "Articles (a/an/the)", frequency: 15, fullMark: 20 },
  { subject: "Past Tense", frequency: 12, fullMark: 20 },
  { subject: "Plural Endings", frequency: 10, fullMark: 20 },
  { subject: "Prepositions", frequency: 8, fullMark: 20 },
  { subject: "Pronunciation (th)", frequency: 18, fullMark: 20 },
];

export const MOCK_VOCAB_PROGRESS = [
  { month: "Jan", learned: 20 },
  { month: "Feb", learned: 45 },
  { month: "Mar", learned: 85 },
];

export const AVAILABLE_TUTORS: Tutor[] = [
  {
    id: "1",
    name: "Ms. Lan Nguyen",
    specialty: "IELTS Writing Specialist",
    avatar:
      "https://ui-avatars.com/api/?name=Lan+Nguyen&background=c7d2fe&color=3730a3",
    status: "online",
  },
  {
    id: "2",
    name: "Mr. David Smith",
    specialty: "Pronunciation Coach",
    avatar:
      "https://ui-avatars.com/api/?name=David+Smith&background=ffedd5&color=9a3412",
    status: "busy",
  },
];

export const getProgressSummary = () => {
  return {
    title: "Monthly Progress Report",
    summary:
      "Great job this month! You've improved your Speaking score by 1.5 bands. Your consistency is paying off.",
    advice:
      "Focus on 'Past Tense' verbs this week. You often switch to present tense when telling stories about the past.",
    motivation:
      "You are only 0.5 bands away from your B2 goal! Keep practicing writing complex sentences.",
  };
};
