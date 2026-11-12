import { SessionResult, OSMode, KeySwitchProfile, PresetId, TestModeType } from '../types';
import { THEMES, DEFAULT_THEME_ID } from '../data/themes';

interface UserSettings {
  themeId: string;
  os: OSMode;
  soundProfile: KeySwitchProfile;
  soundVolume: number;
}

const SETTINGS_KEY = 'keyflow_settings_v1';
const HISTORY_KEY = 'keyflow_history_v1';

const VALID_THEME_IDS = new Set(THEMES.map(t => t.id));
const VALID_OS_MODES = new Set<OSMode>(['mac', 'win']);
const VALID_SOUND_PROFILES = new Set<KeySwitchProfile>(['blue', 'brown', 'red', 'off']);
const VALID_PRESETS = new Set<PresetId>(['vscode', 'figma', 'blender', 'excel']);
const VALID_MODE_TYPES = new Set<TestModeType>(['time', 'count', 'zen']);

/**
 * Safely loads user settings from localStorage with strict runtime validation
 * to prevent malformed data or prototype pollution injection.
 */
export function loadSettings(): UserSettings {
  const fallback: UserSettings = {
    themeId: DEFAULT_THEME_ID,
    os: 'win',
    soundProfile: 'blue',
    soundVolume: 0.6
  };

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fallback;

    const themeId = typeof parsed.themeId === 'string' && VALID_THEME_IDS.has(parsed.themeId)
      ? parsed.themeId
      : fallback.themeId;

    const os = typeof parsed.os === 'string' && VALID_OS_MODES.has(parsed.os as OSMode)
      ? (parsed.os as OSMode)
      : fallback.os;

    const soundProfile = typeof parsed.soundProfile === 'string' && VALID_SOUND_PROFILES.has(parsed.soundProfile as KeySwitchProfile)
      ? (parsed.soundProfile as KeySwitchProfile)
      : fallback.soundProfile;

    const soundVolume = typeof parsed.soundVolume === 'number' && Number.isFinite(parsed.soundVolume)
      ? Math.max(0, Math.min(1, parsed.soundVolume))
      : fallback.soundVolume;

    return { themeId, os, soundProfile, soundVolume };
  } catch {
    return fallback;
  }
}

/**
 * Safely persists user settings to localStorage.
 */
export function saveSettings(settings: UserSettings): void {
  try {
    const sanitized: UserSettings = {
      themeId: VALID_THEME_IDS.has(settings.themeId) ? settings.themeId : DEFAULT_THEME_ID,
      os: VALID_OS_MODES.has(settings.os) ? settings.os : 'win',
      soundProfile: VALID_SOUND_PROFILES.has(settings.soundProfile) ? settings.soundProfile : 'blue',
      soundVolume: Number.isFinite(settings.soundVolume) ? Math.max(0, Math.min(1, settings.soundVolume)) : 0.6
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(sanitized));
  } catch {}
}

/**
 * Safely loads session history with sanitization of each session record.
 */
export function loadHistory(): SessionResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];

    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    const sanitizedList: SessionResult[] = [];

    for (const item of list) {
      if (!item || typeof item !== 'object') continue;

      const preset = VALID_PRESETS.has(item.preset) ? item.preset : 'vscode';
      const modeType = VALID_MODE_TYPES.has(item.modeType) ? item.modeType : 'count';
      const modeValue = typeof item.modeValue === 'number' && Number.isFinite(item.modeValue) ? item.modeValue : 10;
      const spm = typeof item.spm === 'number' && Number.isFinite(item.spm) ? Math.max(0, item.spm) : 0;
      const accuracy = typeof item.accuracy === 'number' && Number.isFinite(item.accuracy) ? Math.max(0, Math.min(100, item.accuracy)) : 100;
      const avgReactionTimeMs = typeof item.avgReactionTimeMs === 'number' && Number.isFinite(item.avgReactionTimeMs) ? item.avgReactionTimeMs : 0;
      const durationSeconds = typeof item.durationSeconds === 'number' && Number.isFinite(item.durationSeconds) ? item.durationSeconds : 1;
      const totalAttempts = typeof item.totalAttempts === 'number' && Number.isFinite(item.totalAttempts) ? item.totalAttempts : 0;
      const correctCount = typeof item.correctCount === 'number' && Number.isFinite(item.correctCount) ? item.correctCount : 0;
      const mistakeCount = typeof item.mistakeCount === 'number' && Number.isFinite(item.mistakeCount) ? item.mistakeCount : 0;
      const timestamp = typeof item.timestamp === 'number' && Number.isFinite(item.timestamp) ? item.timestamp : Date.now();
      const id = typeof item.id === 'string' ? item.id.slice(0, 64) : `session_${timestamp}`;

      const timeline = Array.isArray(item.timeline)
        ? item.timeline.slice(0, 150).map((t: any, idx: number) => ({
            index: typeof t.index === 'number' ? t.index : idx + 1,
            timeSec: typeof t.timeSec === 'number' ? t.timeSec : 0,
            instantSpm: typeof t.instantSpm === 'number' ? t.instantSpm : 0,
            latencyMs: typeof t.latencyMs === 'number' ? t.latencyMs : 0,
            shortcutName: typeof t.shortcutName === 'string' ? t.shortcutName.slice(0, 80) : '',
            isCorrect: Boolean(t.isCorrect)
          }))
        : [];

      const weakShortcuts = Array.isArray(item.weakShortcuts)
        ? item.weakShortcuts.slice(0, 10).map((w: any) => ({
            id: typeof w.id === 'string' ? w.id.slice(0, 50) : '',
            name: typeof w.name === 'string' ? w.name.slice(0, 80) : '',
            keysDisplay: typeof w.keysDisplay === 'string' ? w.keysDisplay.slice(0, 80) : '',
            latencyMs: typeof w.latencyMs === 'number' ? w.latencyMs : 0,
            mistakes: typeof w.mistakes === 'number' ? w.mistakes : 0
          }))
        : [];

      sanitizedList.push({
        id,
        timestamp,
        preset,
        modeType,
        modeValue,
        spm,
        accuracy,
        avgReactionTimeMs,
        totalAttempts,
        correctCount,
        mistakeCount,
        durationSeconds,
        timeline,
        weakShortcuts
      });
    }

    return sanitizedList;
  } catch {
    return [];
  }
}

/**
 * Safely appends a new session result and trims excess records.
 */
export function saveSessionResult(result: SessionResult): void {
  try {
    const history = loadHistory();
    history.unshift(result);
    // Keep last 60 sessions to maintain optimal localStorage performance
    const trimmed = history.slice(0, 60);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {}
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

export function getPersonalBest(preset: PresetId, modeType: TestModeType, modeValue: number): { spm: number; accuracy: number } | null {
  const history = loadHistory();
  const matching = history.filter(h => h.preset === preset && h.modeType === modeType && h.modeValue === modeValue);
  if (!matching.length) return null;

  let bestSpm = 0;
  let bestAcc = 0;

  for (const item of matching) {
    if (item.spm > bestSpm) {
      bestSpm = item.spm;
      bestAcc = item.accuracy;
    }
  }

  return { spm: bestSpm, accuracy: bestAcc };
}
