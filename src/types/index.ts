export type PresetId = 'vscode' | 'figma' | 'blender' | 'excel';

export interface ShortcutDefinition {
  id: string;
  name: string;
  description: string;
  preset: PresetId;
  category: string;
  keys: {
    mac: string[];
    win: string[];
  };
  altKeys?: {
    mac: string[];
    win: string[];
  };
  display: {
    mac: string;
    win: string;
  };
  hint?: string;
}

export type TestModeType = 'time' | 'count' | 'zen';

export interface TestConfig {
  preset: PresetId;
  modeType: TestModeType;
  modeValue: number; // e.g. 15, 30, 60 seconds OR 10, 25, 50 shortcuts
}

export type OSMode = 'mac' | 'win';

export type KeySwitchProfile = 'blue' | 'brown' | 'red' | 'off';

export interface ActiveChordState {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  key: string | null;
}

export interface ShortcutAttempt {
  shortcutId: string;
  shortcutName: string;
  keysDisplay: string;
  reactionTimeMs: number;
  isCorrect: boolean;
  timestamp: number;
}

export interface SessionResult {
  id: string;
  timestamp: number;
  preset: PresetId;
  modeType: TestModeType;
  modeValue: number;
  spm: number; // Shortcuts per minute
  accuracy: number; // percentage 0-100
  avgReactionTimeMs: number;
  totalAttempts: number;
  correctCount: number;
  mistakeCount: number;
  durationSeconds: number;
  timeline: {
    index: number;
    timeSec: number;
    instantSpm: number;
    latencyMs: number;
    shortcutName: string;
    isCorrect: boolean;
  }[];
  weakShortcuts: {
    id: string;
    name: string;
    keysDisplay: string;
    latencyMs: number;
    mistakes: number;
  }[];
}

export interface ThemeColors {
  id: string;
  name: string;
  isLight?: boolean;
  bg: string;
  surface: string;
  border: string;
  text: string;
  subText: string;
  accent: string;
  accentSubtle: string;
  error: string;
  keyBg: string;
  keyBorder: string;
  keyActiveBg: string;
  keyActiveText: string;
}

export interface UserProfile {
  id: string;
  uid?: string;
  username: string;
  email: string;
  joinedDate: string;
  currentStreak: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  testsStarted: number;
  testsCompleted: number;
  timeTypingSeconds: number;
  bio: string;
  keyboard: string;
  badge?: string; // Optional custom badge, by default empty, editable via Firestore database
  personalBests: Record<string, { spm: number; accuracy: number; date: string }>;
  activityHeatmap: Record<string, number>; // 'YYYY-MM-DD' -> count
}

export interface LeaderboardEntry {
  id?: string;
  rank: number;
  userId?: string;
  username: string;
  badge?: string; // e.g. "🚀 Mythical"
  spm: number;
  accuracy: number;
  raw?: number;
  consistency?: number;
  avgReactionTimeMs: number;
  preset: PresetId;
  modeType: TestModeType;
  modeValue: number;
  dateStr: string;
  isCurrentUser?: boolean;
}

