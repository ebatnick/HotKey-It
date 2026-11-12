import React, { useEffect } from 'react';
import { RotateCcw, AlertTriangle, Flame, Clock, Hash } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { ShortcutDefinition, OSMode, ThemeColors, TestModeType, ActiveChordState } from '../types';
import { getSymbolForDisplay } from '../utils/engine';

interface ActivePromptProps {
  currentShortcut: ShortcutDefinition;
  upcomingShortcuts: ShortcutDefinition[];
  chord: ActiveChordState;
  os: OSMode;
  theme: ThemeColors;
  modeType: TestModeType;
  modeValue: number;
  timeLeft: number;
  completedCount: number;
  currentStreak: number;
  isErrorFlash: boolean;
  onRestart: () => void;
  onOpenCheatsheet: () => void;
}

export const ActivePrompt: React.FC<ActivePromptProps> = ({
  currentShortcut,
  upcomingShortcuts,
  chord,
  os,
  theme,
  modeType,
  modeValue,
  timeLeft,
  completedCount,
  currentStreak,
  isErrorFlash,
  onRestart,
  onOpenCheatsheet,
}) => {
  const targetKeys = os === 'mac' ? currentShortcut.keys.mac : currentShortcut.keys.win;

  // Determine which target keys are currently physically held by the user
  const isKeyHeld = (keyName: string): boolean => {
    const lower = keyName.toLowerCase();
    if (lower === 'meta' || lower === 'cmd' || lower === 'command') return chord.meta;
    if (lower === 'control' || lower === 'ctrl') return chord.ctrl;
    if (lower === 'alt' || lower === 'opt' || lower === 'option') return chord.alt;
    if (lower === 'shift') return chord.shift;
    if (chord.key) {
      if (lower.startsWith('arrow')) {
        return chord.key.toLowerCase() === lower;
      }
      return chord.key.toLowerCase() === lower;
    }
    return false;
  };

  // anime.js punchy micro-scale animation when target shortcut changes
  useEffect(() => {
    try {
      animate('.keycap-item', {
        scale: [0.94, 1],
        opacity: [0.7, 1],
        ease: 'outBack',
        duration: 260,
        delay: stagger(40)
      });
    } catch {}
  }, [currentShortcut.id]);

  return (
    <div className="flex-1 flex flex-col justify-center items-center w-full max-w-4xl mx-auto px-4 py-8 select-none">
      {/* Top Session Progress Bar / Counters */}
      <div className="w-full flex items-center justify-between text-xs font-mono mb-8 px-2">
        {/* Left: Mode specifics (Time left or Counter) */}
        <div className="flex items-center gap-4" style={{ color: theme.subText }}>
          {modeType === 'time' && (
            <div className="flex items-center gap-1.5 font-bold text-sm" style={{ color: theme.accent }}>
              <Clock className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>
          )}
          {modeType === 'count' && (
            <div className="flex items-center gap-1.5 font-bold text-sm" style={{ color: theme.accent }}>
              <Hash className="w-4 h-4" />
              <span>
                {completedCount} / {modeValue}
              </span>
            </div>
          )}
          {modeType === 'zen' && (
            <div className="flex items-center gap-1.5 font-bold text-sm" style={{ color: theme.accent }}>
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Streak: {currentStreak}</span>
            </div>
          )}
        </div>

        {/* Right: Quick actions and context hint */}
        <div className="flex items-center gap-3">
          {currentStreak > 3 && (
            <div
              style={{
                backgroundColor: `${theme.accent}15`,
                color: theme.accent,
                borderColor: `${theme.accent}40`,
              }}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold"
            >
              <Flame className="w-3.5 h-3.5 animate-bounce" />
              <span>{currentStreak}x Combo</span>
            </div>
          )}
          <button
            type="button"
            onClick={onRestart}
            title="Restart test (Tab + Enter)"
            style={{ color: theme.subText }}
            className="flex items-center gap-1 p-1 hover:text-zinc-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Focus Card */}
      <div
        style={{
          borderColor: isErrorFlash ? theme.error : theme.border,
          boxShadow: isErrorFlash
            ? `0 0 30px ${theme.error}44, inset 0 0 15px ${theme.error}22`
            : `0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
          backgroundColor: theme.surface,
        }}
        className={`w-full rounded-3xl border p-6 sm:p-10 flex flex-col items-center text-center transition-all duration-150 ${
          isErrorFlash ? 'translate-x-[-4px] animate-wiggle' : ''
        }`}
      >
        {/* Category & Hint Pill */}
        <div className="flex items-center gap-2 mb-3">
          <span
            style={{
              backgroundColor: theme.accentSubtle,
              color: theme.accent,
              borderColor: `${theme.accent}40`,
            }}
            className="text-xs font-mono font-medium px-3 py-1 rounded-full border tracking-wide uppercase"
          >
            {currentShortcut.category}
          </span>
          {currentShortcut.hint && (
            <span
              style={{
                backgroundColor: theme.keyBg,
                color: theme.subText,
                borderColor: theme.border,
              }}
              className="text-xs font-mono px-2.5 py-1 rounded-full border"
            >
              {currentShortcut.hint}
            </span>
          )}
        </div>

        {/* Large Crisp Action Title */}
        <h2
          className="text-2xl sm:text-4xl font-bold tracking-tight mb-2 font-mono transition-colors"
          style={{ color: isErrorFlash ? theme.error : theme.text }}
        >
          {currentShortcut.name}
        </h2>

        {/* Purpose Description */}
        <p className="text-xs sm:text-sm max-w-lg mb-8 leading-relaxed font-sans" style={{ color: theme.subText }}>
          {currentShortcut.description}
        </p>

        {/* The Giant Keycap Chord Sequence */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 my-2">
          {targetKeys.map((keyName, idx) => {
            const symbol = getSymbolForDisplay(keyName, os);
            const held = isKeyHeld(keyName);

            return (
              <React.Fragment key={`${currentShortcut.id}-${keyName}-${idx}`}>
                {idx > 0 && (
                  <span className="text-sm font-mono font-light select-none px-0.5" style={{ color: theme.subText }}>
                    +
                  </span>
                )}
                <div
                  style={{
                    backgroundColor: held ? theme.accent : theme.keyBg,
                    color: held ? theme.keyActiveText : theme.text,
                    borderColor: held ? theme.accent : theme.keyBorder,
                    boxShadow: held
                      ? `0 0 24px ${theme.accent}77, inset 0 2px 0 rgba(255,255,255,0.3)`
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                    transform: held ? 'translateY(2px) scale(1.02)' : 'translateY(0)',
                  }}
                  className="keycap-item min-w-[56px] sm:min-w-[68px] h-12 sm:h-16 px-4 rounded-xl border flex items-center justify-center font-mono font-bold text-base sm:text-2xl tracking-wide transition-all duration-100"
                >
                  {symbol}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Alternative shortcut hint if available (e.g. F1 for Command Palette) */}
        {currentShortcut.altKeys && (
          <div
            style={{ color: theme.subText }}
            className="text-xs font-mono mt-3 opacity-80"
          >
            or press{' '}
            <span style={{ color: theme.accent }} className="font-semibold underline decoration-dotted underline-offset-4">
              {os === 'mac' ? currentShortcut.altKeys.mac.join(' + ') : currentShortcut.altKeys.win.join(' + ')}
            </span>
          </div>
        )}

        {/* Error notification banner if error just occurred */}
        {isErrorFlash && (
          <div
            style={{ color: theme.error }}
            className="flex items-center gap-1.5 text-xs font-mono mt-4 animate-fade-in"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Wrong combination! Try again</span>
          </div>
        )}
      </div>

      {/* Upcoming Shortcuts Queue Preview (Monkeytype style: faint text line, no box borders) */}
      <div className="w-full max-w-2xl mt-8 flex flex-col items-center gap-2 select-none">
        <div className="flex items-center justify-center gap-3 sm:gap-4 overflow-hidden w-full text-xs font-mono opacity-50 hover:opacity-80 transition-opacity">
          {upcomingShortcuts.slice(0, 3).map((sc, idx) => (
            <React.Fragment key={`upcoming-${sc.id}-${idx}`}>
              {idx > 0 && <span className="opacity-30">•</span>}
              <div className="flex items-center gap-1.5 truncate">
                <span style={{ color: theme.text }}>
                  {sc.name}
                </span>
                <span style={{ color: theme.subText }} className="text-[11px]">
                  ({os === 'mac' ? sc.display.mac : sc.display.win})
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Bottom Command Hints (Monkeytype style: minimal text, zero boxes) */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-mono opacity-60" style={{ color: theme.subText }}>
        <div>
          <span style={{ color: theme.text }}>tab</span> + <span style={{ color: theme.text }}>enter</span> — restart
        </div>
        <span className="opacity-30">•</span>
        <div>
          <span style={{ color: theme.text }}>esc</span> — reset
        </div>
        <span className="opacity-30">•</span>
        <button
          type="button"
          onClick={onOpenCheatsheet}
          className="hover:underline"
          style={{ color: theme.accent }}
        >
          <span className="font-bold">?</span> cheatsheet
        </button>
      </div>
    </div>
  );
};
