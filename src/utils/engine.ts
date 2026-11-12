import { OSMode, ShortcutDefinition, ActiveChordState } from '../types';

/**
 * Standardize modifier key names
 */
export const MODIFIERS = ['Control', 'Meta', 'Alt', 'Shift'] as const;

export function isModifierKey(key: string): boolean {
  return MODIFIERS.includes(key as any) || key === 'OS' || key === 'Command';
}

/**
 * Normalize key string for comparison
 */
export function normalizeKey(rawKey: string): string {
  if (!rawKey) return '';
  const key = rawKey.trim();

  switch (key.toLowerCase()) {
    case 'ctrl':
    case 'control':
      return 'Control';
    case 'cmd':
    case 'command':
    case 'meta':
      return 'Meta';
    case 'alt':
    case 'opt':
    case 'option':
      return 'Alt';
    case 'shift':
      return 'Shift';
    case ' ':
    case 'space':
    case 'spacebar':
      return 'Space';
    case 'return':
    case 'enter':
      return 'Enter';
    case 'esc':
    case 'escape':
      return 'Escape';
    case 'backspace':
      return 'Backspace';
    case 'arrowup':
    case 'up':
      return 'ArrowUp';
    case 'arrowdown':
    case 'down':
      return 'ArrowDown';
    case 'arrowleft':
    case 'left':
      return 'ArrowLeft';
    case 'arrowright':
    case 'right':
      return 'ArrowRight';
    default:
      return key.length === 1 ? key.toLowerCase() : key;
  }
}

/**
 * Detect OS from browser environment
 */
export function detectDefaultOS(): OSMode {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'win';
  }
  const platform = (navigator.platform || '').toLowerCase();
  const userAgent = (navigator.userAgent || '').toLowerCase();
  if (platform.includes('mac') || userAgent.includes('macintosh') || userAgent.includes('mac os')) {
    return 'mac';
  }
  return 'win';
}

/**
 * Extract active modifiers and main key from target shortcut definition
 */
export function parseTargetKeys(keys: string[]) {
  const normalized = keys.map(normalizeKey);
  const hasCtrl = normalized.includes('Control');
  const hasMeta = normalized.includes('Meta');
  const hasAlt = normalized.includes('Alt');
  const hasShift = normalized.includes('Shift');

  const mainKeys = normalized.filter(k => !MODIFIERS.includes(k as any));
  const mainKey = mainKeys[0] || '';

  return {
    hasCtrl,
    hasMeta,
    hasAlt,
    hasShift,
    mainKey: mainKey.toLowerCase()
  };
}

export const SHIFT_CHAR_MAP: Record<string, string> = {
  '{': '[',
  '}': ']',
  '|': '\\',
  '~': '`',
  '?': '/',
  ':': ';',
  '"': "'",
  '<': ',',
  '>': '.',
  '+': '=',
  '_': '-',
  '!': '1',
  '@': '2',
  '#': '3',
  '$': '4',
  '%': '5',
  '^': '6',
  '&': '7',
  '*': '8',
  '(': '9',
  ')': '0',
};

export const CODE_TO_KEY_MAP: Record<string, string> = {
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Backquote: '`',
  Slash: '/',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Equal: '=',
  Minus: '-',
  Digit1: '1',
  Digit2: '2',
  Digit3: '3',
  Digit4: '4',
  Digit5: '5',
  Digit6: '6',
  Digit7: '7',
  Digit8: '8',
  Digit9: '9',
  Digit0: '0',
};

/**
 * Check if a KeyboardEvent matches the target shortcut
 */
function matchKeySet(e: KeyboardEvent, expectedKeys: string[]): boolean {
  const target = parseTargetKeys(expectedKeys);
  const ctrlMatches = e.ctrlKey === target.hasCtrl;
  const altMatches = e.altKey === target.hasAlt;
  const shiftMatches = e.shiftKey === target.hasShift;
  const metaMatches = e.metaKey === target.hasMeta;

  if (!ctrlMatches || !altMatches || !shiftMatches || !metaMatches) {
    return false;
  }

  const rawKey = e.key || '';
  const eventKeyNorm = normalizeKey(rawKey).toLowerCase();
  const unshiftedKey = (SHIFT_CHAR_MAP[rawKey] || rawKey).toLowerCase();
  const codeKey = e.code ? (CODE_TO_KEY_MAP[e.code] || e.code.replace(/^Key/, '')).toLowerCase() : '';

  if (target.mainKey === 'space') {
    return eventKeyNorm === 'space' || e.code === 'Space';
  } else if (target.mainKey === 'enter') {
    return eventKeyNorm === 'enter' || e.code === 'Enter';
  } else if (target.mainKey === 'escape') {
    return eventKeyNorm === 'escape' || e.code === 'Escape';
  } else if (target.mainKey === 'backspace') {
    return eventKeyNorm === 'backspace' || e.code === 'Backspace';
  } else if (target.mainKey === 'tab') {
    return eventKeyNorm === 'tab' || e.code === 'Tab';
  } else if (target.mainKey.startsWith('arrow')) {
    return eventKeyNorm === target.mainKey;
  } else {
    return (
      eventKeyNorm === target.mainKey ||
      unshiftedKey === target.mainKey ||
      codeKey === target.mainKey
    );
  }
}

/**
 * Check if a KeyboardEvent matches the target shortcut (primary or alt keys)
 */
export function checkShortcutMatch(
  e: KeyboardEvent,
  targetDefinition: ShortcutDefinition,
  os: OSMode
): { isMatch: boolean; isModifierOnly: boolean } {
  // If the user just pressed a modifier key (Shift, Ctrl, Alt, Meta), it's not a full chord press yet
  if (isModifierKey(e.key)) {
    return { isMatch: false, isModifierOnly: true };
  }

  const primaryKeys = os === 'mac' ? targetDefinition.keys.mac : targetDefinition.keys.win;
  if (matchKeySet(e, primaryKeys)) {
    return { isMatch: true, isModifierOnly: false };
  }

  if (targetDefinition.altKeys) {
    const altKeys = os === 'mac' ? targetDefinition.altKeys.mac : targetDefinition.altKeys.win;
    if (matchKeySet(e, altKeys)) {
      return { isMatch: true, isModifierOnly: false };
    }
  }

  return { isMatch: false, isModifierOnly: false };
}

/**
 * Get readable text for a key (clean words instead of unicode arrows/symbols)
 */
export function getSymbolForDisplay(key: string, os: OSMode): string {
  const norm = normalizeKey(key);
  switch (norm) {
    case 'Meta':
      return os === 'mac' ? 'Cmd' : 'Win';
    case 'Control':
      return 'Ctrl';
    case 'Alt':
      return os === 'mac' ? 'Option' : 'Alt';
    case 'Shift':
      return 'Shift';
    case 'Enter':
      return 'Enter';
    case 'Backspace':
      return 'Backspace';
    case 'Escape':
      return 'Esc';
    case 'Tab':
      return 'Tab';
    case 'Space':
      return 'Space';
    case 'ArrowUp':
      return 'Up';
    case 'ArrowDown':
      return 'Down';
    case 'ArrowLeft':
      return 'Left';
    case 'ArrowRight':
      return 'Right';
    default:
      return key.toUpperCase();
  }
}

/**
 * Format target keys array into visual labels
 */
export function formatKeysForDisplay(keys: string[], os: OSMode): string[] {
  return keys.map(k => getSymbolForDisplay(k, os));
}

/**
 * Calculate Shortcuts Per Minute (SPM)
 */
export function calculateSPM(correctCount: number, durationSeconds: number): number {
  if (durationSeconds <= 0 || correctCount <= 0) return 0;
  const minutes = durationSeconds / 60;
  return Math.round((correctCount / minutes) * 10) / 10;
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(correctCount: number, totalAttempts: number): number {
  if (totalAttempts <= 0) return 100;
  return Math.round((correctCount / totalAttempts) * 1000) / 10;
}

/**
 * Extract active chord state from KeyboardEvent
 */
export function extractChordState(e: KeyboardEvent): ActiveChordState {
  const isMod = isModifierKey(e.key);
  const rawKey = e.key || '';
  const normalized = isMod ? null : normalizeKey(SHIFT_CHAR_MAP[rawKey] || rawKey);
  return {
    ctrl: e.ctrlKey,
    alt: e.altKey,
    shift: e.shiftKey,
    meta: e.metaKey,
    key: normalized
  };
}
