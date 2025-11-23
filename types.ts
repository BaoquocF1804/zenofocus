export enum TimerMode {
  FOCUS = 'focus',
  SHORT_BREAK = 'shortBreak',
  LONG_BREAK = 'longBreak',
}

export enum ThemeType {
  NATURE = 'nature',
  LOFI = 'lofi',
  TECH = 'tech',
  VINTAGE = 'vintage',
}

export interface Settings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  dailyGoalHours: number;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface Session {
  id: string;
  mode: TimerMode;
  duration: number; // in seconds
  completedAt: number;
}

export interface ThemeConfig {
  name: string;
  bgImage: string;
  primaryColor: string; // Tailwind class mostly
  accentColor: string;
  textColor: string;
}

export interface MoodChannel {
  id: string;
  name: string;
  videoId: string;
  icon: string;
  type: 'video' | 'live';
}