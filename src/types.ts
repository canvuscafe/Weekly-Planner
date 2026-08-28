export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export type Priority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'completed' | 'pending';

export interface Task {
  id: string;
  date: string; // YYYY-MM-DD
  day: DayOfWeek;
  subject: string;
  goal: string;
  taskName: string;
  priority: Priority;
  status: TaskStatus;
  createdDate: string;
  completedDate: string | null;
  notes?: string;
  weekId: string;
}

export interface DayGoal {
  subject: string;
  goal: string;
  priority: Priority;
  notes?: string;
}

export interface AIReport {
  overallScore: number;
  summary: string;
  strengths: string[];
  whatNeedsImprovement: string[];
  nextWeekRecommendations: string[];
  generatedAt: string;
  mode: 'gemini' | 'rule-based';
}

export interface WeekPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  tasks: Task[];
  dayGoals: Record<DayOfWeek, DayGoal>;
  aiAnalysis?: AIReport | null;
  notes?: string;
}

export interface DailyStat {
  day: DayOfWeek;
  total: number;
  completed: number;
  pending: number;
  pct: number;
}

export interface SubjectStat {
  subject: string;
  total: number;
  completed: number;
  pending: number;
  pct: number;
}

export interface PriorityBreakdown {
  total: number;
  completed: number;
  pending: number;
  pct: number;
}

export interface PerformanceMetrics {
  overallCompletion: number;
  completedTasks: number;
  totalTasks: number;
  pendingTasks: number;
  highPriorityTotalCount: number;
  highPriorityCompletedCount: number;
  highPriorityCompletedPct: number;
  mediumPriorityCompletedPct: number;
  lowPriorityCompletedPct: number;
  goalsTotalCount: number;
  goalsCompletedCount: number;
  goalsCompletedPct: number;
  consistencyScore: number;
  overallScore: number;
  performanceLevel: {
    label: string;
    description: string;
    badgeColor: string;
    textColor: string;
    borderColor: string;
    bgColor: string;
  };
  dailyStats: DailyStat[];
  subjectStats: SubjectStat[];
  priorityStats: {
    High: PriorityBreakdown;
    Medium: PriorityBreakdown;
    Low: PriorityBreakdown;
  };
  strengths: string[];
  areasToImprove: string[];
  recommendations: string[];
}

export interface WeekHistoryItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  completion: number;
  score: number;
  totalTasks: number;
  completedTasks: number;
  highPriorityPct: number;
  trend: 'improving' | 'decreasing' | 'stable';
  isCurrent: boolean;
}

export type NavTab = 'dashboard' | 'planner' | 'performance' | 'history' | 'settings';
