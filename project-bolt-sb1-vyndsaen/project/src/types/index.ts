export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  taskReminders: boolean;
  goalDeadlines: boolean;
  timerAlerts: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'work' | 'personal' | 'learning' | 'health' | 'finance' | 'social' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
  dueDate?: string;
  startDate?: string;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  goalId?: string;
  projectId?: string;
  tags: string[];
  subtasks: SubTask[];
  attachments: Attachment[];
  comments: Comment[];
  recurring?: RecurringPattern;
  dependencies: string[]; // task IDs
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: string;
  endAfter?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: 'active' | 'completed' | 'archived' | 'on-hold';
  startDate?: string;
  endDate?: string;
  progress: number;
  teamMembers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: 'career' | 'health' | 'education' | 'personal' | 'financial' | 'relationships' | 'travel' | 'skills';
  type: 'outcome' | 'habit' | 'milestone';
  targetDate: string;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  milestones: Milestone[];
  metrics: GoalMetric[];
  linkedTasks: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface GoalMetric {
  id: string;
  name: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  trackingType: 'manual' | 'automatic';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'checklist' | 'canvas' | 'template';
  tags: string[];
  category: string;
  isFavorite: boolean;
  isArchived: boolean;
  parentId?: string; // for nested notes
  attachments: Attachment[];
  collaborators: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  type: 'one-time' | 'recurring';
  dueDate: string;
  reminderTime: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  snoozedUntil?: string;
  recurring?: RecurringPattern;
  createdAt: string;
}

export interface TimerSession {
  id: string;
  type: 'pomodoro' | 'break' | 'long-break' | 'custom' | 'stopwatch';
  duration: number; // in seconds
  actualDuration?: number; // in seconds
  category?: string;
  taskId?: string;
  projectId?: string;
  notes?: string;
  startedAt: string;
  completedAt?: string;
  pausedDuration?: number; // total paused time in seconds
}

export interface TimetableSlot {
  id: string;
  title: string;
  description?: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  category: 'work' | 'class' | 'personal' | 'exercise' | 'meeting' | 'break' | 'other';
  color: string;
  location?: string;
  recurring: boolean;
  notifications: boolean;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  currentStreak: number;
  longestStreak: number;
  completions: HabitCompletion[];
  isActive: boolean;
  createdAt: string;
}

export interface HabitCompletion {
  id: string;
  date: string;
  count: number;
  notes?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  weekStartsOn: 0 | 1;
  pomodoroWorkDuration: number; // in minutes
  pomodoroBreakDuration: number; // in minutes
  pomodoroLongBreakDuration: number; // in minutes
  pomodoroLongBreakInterval: number; // after how many pomodoros
  notifications: NotificationSettings;
  autoSave: boolean;
  soundEnabled: boolean;
  keyboardShortcuts: boolean;
  compactMode: boolean;
  showCompletedTasks: boolean;
  defaultTaskView: 'list' | 'board' | 'calendar' | 'timeline';
}

export interface Analytics {
  productivity: ProductivityMetrics;
  timeTracking: TimeTrackingMetrics;
  goals: GoalMetrics;
  habits: HabitMetrics;
}

export interface ProductivityMetrics {
  tasksCompleted: number;
  tasksCreated: number;
  completionRate: number;
  averageTaskDuration: number;
  productivityScore: number;
  focusTime: number;
  distractionTime: number;
}

export interface TimeTrackingMetrics {
  totalFocusTime: number;
  pomodoroSessions: number;
  averageSessionLength: number;
  categoryBreakdown: { [category: string]: number };
  dailyFocusTime: { date: string; duration: number }[];
}

export interface GoalMetrics {
  activeGoals: number;
  completedGoals: number;
  averageCompletionTime: number;
  goalCompletionRate: number;
}

export interface HabitMetrics {
  activeHabits: number;
  averageStreak: number;
  completionRate: number;
  habitCompletions: { date: string; count: number }[];
}

export interface Dashboard {
  widgets: DashboardWidget[];
  layout: 'grid' | 'list';
  customization: DashboardCustomization;
}

export interface DashboardWidget {
  id: string;
  type: 'tasks' | 'goals' | 'timer' | 'calendar' | 'analytics' | 'notes' | 'habits' | 'weather' | 'quotes';
  position: { x: number; y: number; w: number; h: number };
  settings: any;
  isVisible: boolean;
}

export interface DashboardCustomization {
  showGreeting: boolean;
  showWeather: boolean;
  showQuote: boolean;
  compactMode: boolean;
  autoRefresh: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  type: 'task' | 'project' | 'note' | 'goal';
  content: any;
  category: string;
  isPublic: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
}

export interface Integration {
  id: string;
  name: string;
  type: 'calendar' | 'email' | 'storage' | 'communication' | 'automation';
  isConnected: boolean;
  settings: any;
  lastSync?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  members: WorkspaceMember[];
  projects: string[];
  settings: WorkspaceSettings;
  createdAt: string;
}

export interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface WorkspaceSettings {
  isPublic: boolean;
  allowInvites: boolean;
  defaultPermissions: string;
}