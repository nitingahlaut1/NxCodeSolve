export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type ProblemStatus = 'todo' | 'in_progress' | 'completed' | 'revision';

export interface Problem {
  id: number;
  step: string;
  topic: string;
  title: string;
  difficulty: Difficulty;
  leetcodeUrl: string;
  leetcodeSlug?: string;
  gfgUrl?: string;
  tufUrl?: string;
  youtubeUrl: string;
}

export interface ProblemProgress {
  status: ProblemStatus;
  bookmarked: boolean;
  notes?: string;
  code?: string;
  language?: string;
  updatedAt: string;
  completedAt?: string;
}

export interface UserProgressMap {
  [problemId: number]: ProblemProgress;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatar: string;
  createdAt: string;
  dailyGoal: number; // e.g. 3 problems/day
  targetDate?: string;
}

export interface UserActivityLog {
  date: string; // YYYY-MM-DD
  count: number;
  problemIds: number[];
}

export interface UserProgressData {
  userId: string;
  progress: UserProgressMap;
  activity: { [date: string]: number }; // date -> count of completed
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate?: string;
  };
}

export interface StepSummary {
  step: string;
  stepNumber: number;
  stepName: string;
  total: number;
  completed: number;
  topics: {
    name: string;
    total: number;
    completed: number;
    problems: Problem[];
  }[];
}

export interface StatsSummary {
  totalQuestions: number;
  completedQuestions: number;
  inProgressQuestions: number;
  revisionQuestions: number;
  bookmarkedQuestions: number;
  completionPercentage: number;
  byDifficulty: {
    Easy: { total: number; completed: number };
    Medium: { total: number; completed: number };
    Hard: { total: number; completed: number };
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
  };
  dailyGoal: number;
  solvedToday: number;
  activityHeatmap: { date: string; count: number }[];
}

export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'cpp' | 'java';

export interface ProblemExample {
  id: number;
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  id: number;
  label?: string;
  args: any[]; // arguments passed to the function
  expected: any; // expected return value
  rawInputDisplay?: string; // string formatted for UI display
  isHidden?: boolean;
  pos?: number; // cycle position for linked list problems
}

export interface ProblemDetail extends Problem {
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  hints?: string[];
  fnName: string;
  paramNames: string[];
  starterCodes: Record<SupportedLanguage, string>;
  testCases: TestCase[];
  hiddenTestCases: TestCase[];
  editorial?: {
    intuition: string;
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
    solutionCode?: string;
  };
}

export interface ExecutionResult {
  testCaseId: number;
  label?: string;
  passed: boolean;
  args: any[];
  expected: any;
  actual: any;
  stdout: string[];
  executionTimeMs: number;
  error?: string;
}

export interface SubmissionResult {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED';
  totalPassed: number;
  totalTests: number;
  runtimeMs: number;
  results: ExecutionResult[];
  failedCase?: ExecutionResult;
  errorDetails?: string;
}

