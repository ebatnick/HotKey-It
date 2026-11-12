/**
 * KeyFlow — Minimalist Hotkey & Muscle Memory Trainer
 * Inspired by Monkeytype philosophy, built for mastering professional software keyboard shortcuts.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ChordVisualizer } from './components/ChordVisualizer';
import { ActivePrompt } from './components/ActivePrompt';
import { ResultsView } from './components/ResultsView';
import { CheatsheetModal } from './components/CheatsheetModal';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { AccountModal } from './components/AccountModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SetCredentialsModal } from './components/SetCredentialsModal';
import {
  PresetId,
  TestModeType,
  OSMode,
  KeySwitchProfile,
  ShortcutDefinition,
  ShortcutAttempt,
  SessionResult,
  ActiveChordState,
  UserProfile
} from './types';
import { SHORTCUTS_DATA } from './data/presets';
import { getTheme, DEFAULT_THEME_ID } from './data/themes';
import {
  detectDefaultOS,
  checkShortcutMatch,
  isModifierKey,
  calculateSPM,
  calculateAccuracy,
  extractChordState
} from './utils/engine';
import { sound } from './utils/audio';
import {
  loadSettings,
  saveSettings,
  loadHistory,
  saveSessionResult,
  getPersonalBest
} from './utils/storage';
import { getCurrentUser, recordSessionForUser, subscribeToAuth } from './utils/auth';

function shuffleShortcuts(list: ShortcutDefinition[]): ShortcutDefinition[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  // Persistent Settings
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME_ID);
  const [os, setOS] = useState<OSMode>('win');
  const [soundProfile, setSoundProfile] = useState<KeySwitchProfile>('blue');
  const [soundVolume, setSoundVolume] = useState<number>(0.6);

  // Test Configuration
  const [currentPreset, setCurrentPreset] = useState<PresetId>('vscode');
  const [modeType, setModeType] = useState<TestModeType>('count');
  const [modeValue, setModeValue] = useState<number>(10);

  // Runtime Game State
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'results'>('idle');
  const [queue, setQueue] = useState<ShortcutDefinition[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [attempts, setAttempts] = useState<ShortcutAttempt[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [isErrorFlash, setIsErrorFlash] = useState<boolean>(false);
  const [activeChord, setActiveChord] = useState<ActiveChordState>({
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
    key: null,
  });

  // Analytics & Results
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [personalBest, setPersonalBest] = useState<{ spm: number; accuracy: number } | null>(null);
  const [historyList, setHistoryList] = useState<SessionResult[]>([]);

  // Modals & UI Controls
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isSetCredentialsOpen, setIsSetCredentialsOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Refs for smooth event handling and timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTimeRef = useRef<number>(0);
  const shortcutStartTimeRef = useRef<number>(0);
  const targetEndTimeRef = useRef<number>(0);
  const tabPressedRef = useRef<boolean>(false);
  const tabTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRunShortcutsRef = useRef<ShortcutDefinition[]>([]);

  // Current Theme
  const theme = getTheme(themeId);

  // Initialize settings & detect OS on mount
  useEffect(() => {
    const saved = loadSettings();
    setThemeId(saved.themeId || DEFAULT_THEME_ID);
    setSoundProfile(saved.soundProfile || 'blue');
    setSoundVolume(saved.soundVolume ?? 0.6);
    sound.setProfile(saved.soundProfile || 'blue');
    sound.setVolume(saved.soundVolume ?? 0.6);

    const initialOS = saved.os || detectDefaultOS();
    setOS(initialOS);

    setHistoryList(loadHistory());
    setPersonalBest(getPersonalBest(currentPreset, modeType, modeValue));

    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Update sound engine on volume / profile change
  useEffect(() => {
    sound.setVolume(soundVolume);
    sound.setProfile(soundProfile);
    saveSettings({ themeId, os, soundProfile, soundVolume });
  }, [themeId, os, soundProfile, soundVolume]);

  // Update personal best when preset or mode changes
  useEffect(() => {
    setPersonalBest(getPersonalBest(currentPreset, modeType, modeValue));
  }, [currentPreset, modeType, modeValue]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Prepare / Reset Queue
  const initQueue = useCallback((customList?: ShortcutDefinition[]) => {
    const source = customList || SHORTCUTS_DATA[currentPreset] || [];
    // Repeat and shuffle to ensure plenty of items
    let pool: ShortcutDefinition[] = [];
    while (pool.length < 100) {
      pool = pool.concat(shuffleShortcuts(source));
    }
    // Remember current set for "Repeat Test"
    lastRunShortcutsRef.current = customList ? [...customList] : pool.slice(0, modeType === 'count' ? modeValue : 25);
    setQueue(pool);
    setCurrentIndex(0);
    setAttempts([]);
    setCurrentStreak(0);
    setIsErrorFlash(false);
    setTimeLeft(modeType === 'time' ? modeValue : 0);
    targetEndTimeRef.current = 0;
    setGameState('idle');
    setSessionResult(null);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [currentPreset, modeType, modeValue]);

  // Auto-init on preset or mode change
  useEffect(() => {
    initQueue();
  }, [initQueue]);

  // Finalize Session and compute comprehensive metrics
  const finishSession = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    sound.playSuccessChime();

    const endTime = performance.now();
    const durationSeconds = Math.max(1, Math.round((endTime - sessionStartTimeRef.current) / 1000));
    const correctAttempts = attempts.filter(a => a.isCorrect);
    const correctCount = correctAttempts.length;
    const totalAttempts = attempts.length;
    const mistakeCount = totalAttempts - correctCount;

    const spm = calculateSPM(correctCount, durationSeconds);
    const accuracy = calculateAccuracy(correctCount, totalAttempts);

    // Compute average reaction latency
    const reactionTimes = attempts.map(a => a.reactionTimeMs);
    const avgReactionTimeMs = reactionTimes.length
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

    // Timeline calculation
    const timeline = attempts.map((att, idx) => {
      const elapsedSec = (att.timestamp - sessionStartTimeRef.current) / 1000;
      const countUpTo = attempts.slice(0, idx + 1).filter(a => a.isCorrect).length;
      const instantSpm = elapsedSec > 0 ? calculateSPM(countUpTo, elapsedSec) : 0;
      return {
        index: idx + 1,
        timeSec: Math.round(elapsedSec * 10) / 10,
        instantSpm,
        latencyMs: att.reactionTimeMs,
        shortcutName: att.shortcutName,
        isCorrect: att.isCorrect
      };
    });

    // Identify weak shortcuts (highest latency or multiple mistakes)
    const shortcutMap = new Map<string, { id: string; name: string; keysDisplay: string; latencies: number[]; mistakes: number }>();
    attempts.forEach(att => {
      if (!shortcutMap.has(att.shortcutId)) {
        shortcutMap.set(att.shortcutId, {
          id: att.shortcutId,
          name: att.shortcutName,
          keysDisplay: att.keysDisplay,
          latencies: [],
          mistakes: 0,
        });
      }
      const item = shortcutMap.get(att.shortcutId)!;
      item.latencies.push(att.reactionTimeMs);
      if (!att.isCorrect) item.mistakes++;
    });

    const weakShortcuts = Array.from(shortcutMap.values())
      .map(item => ({
        id: item.id,
        name: item.name,
        keysDisplay: item.keysDisplay,
        latencyMs: Math.round(item.latencies.reduce((a, b) => a + b, 0) / item.latencies.length),
        mistakes: item.mistakes,
      }))
      .sort((a, b) => b.latencyMs - a.latencyMs || b.mistakes - a.mistakes)
      .slice(0, 5);

    const result: SessionResult = {
      id: `session_${Date.now()}`,
      timestamp: Date.now(),
      preset: currentPreset,
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
    };

    saveSessionResult(result);
    recordSessionForUser(result).then(updated => {
      if (updated) setCurrentUser(updated);
    });
    setSessionResult(result);
    setHistoryList(loadHistory());
    setPersonalBest(getPersonalBest(currentPreset, modeType, modeValue));
    setGameState('results');
  }, [attempts, currentPreset, modeType, modeValue]);

  // Keep a stable ref for finishSession to prevent interval thrashing when typing
  const finishSessionRef = useRef(finishSession);
  useEffect(() => {
    finishSessionRef.current = finishSession;
  }, [finishSession]);

  // Monotonic, non-stopping real-time countdown timer
  // Starts when user types the first key and continues smoothly without resetting
  useEffect(() => {
    if (gameState === 'playing' && modeType === 'time') {
      const updateTimer = () => {
        const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          finishSessionRef.current();
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 200);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [gameState, modeType]);

  // Key Down Engine Handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 0. Proactively intercept & prevent browser defaults for chords (Ctrl+Shift+P, Ctrl+P, Ctrl+S, Ctrl+D, etc.)
    const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
    const isFunctionKey = e.key.startsWith('F') && e.key.length <= 3 && e.key !== 'F12';
    const isTab = e.key === 'Tab';
    const isDevTools = e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'i', 'C', 'c'].includes(e.key));

    if (!isDevTools && (hasModifier || isFunctionKey || isTab)) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
    }

    // If a modal is open, let normal keyboard behavior work inside the modal
    if (isCheatsheetOpen || isHistoryOpen || isSettingsOpen || isAuthOpen || isAccountOpen || isLeaderboardOpen || isSetCredentialsOpen) {
      if (e.key === 'Escape') {
        setIsCheatsheetOpen(false);
        setIsHistoryOpen(false);
        setIsSettingsOpen(false);
        setIsAuthOpen(false);
        setIsAccountOpen(false);
        setIsLeaderboardOpen(false);
        setIsSetCredentialsOpen(false);
      }
      return;
    }

    // 1. App control shortcut: Tab then Enter (or Tab in results view) to quick-restart
    if (e.key === 'Tab') {
      tabPressedRef.current = true;
      if (tabTimerRef.current) clearTimeout(tabTimerRef.current);
      tabTimerRef.current = setTimeout(() => {
        tabPressedRef.current = false;
      }, 800);
      return;
    }

    if (e.key === 'Enter' && tabPressedRef.current) {
      tabPressedRef.current = false;
      initQueue();
      return;
    }

    // 2. Escape to reset
    if (e.key === 'Escape') {
      initQueue();
      return;
    }

    // 3. Question mark '?' to trigger cheatsheet
    if (e.key === '?' && !e.ctrlKey && !e.metaKey && gameState !== 'playing') {
      setIsCheatsheetOpen(true);
      return;
    }

    // Update live HUD chord state
    setActiveChord(extractChordState(e));

    // If currently on results screen, Enter restarts the test
    if (gameState === 'results') {
      if (e.key === 'Enter') {
        initQueue();
      }
      return;
    }

    const currentShortcut = queue[currentIndex];
    if (!currentShortcut) return;

    // Start session when typing begins (if currently idle)
    let isInitialStart = false;
    if (gameState === 'idle') {
      if (!isModifierKey(e.key)) {
        sessionStartTimeRef.current = performance.now();
        shortcutStartTimeRef.current = performance.now();
        targetEndTimeRef.current = Date.now() + modeValue * 1000;
        setGameState('playing');
        isInitialStart = true;
      }
    }

    // If modifier only key, don't grade yet
    if (isModifierKey(e.key)) {
      return;
    }

    const now = performance.now();
    const reactionTimeMs = isInitialStart
      ? 200 // Default baseline for initial hit
      : Math.max(50, Math.round(now - (shortcutStartTimeRef.current || now)));

    const { isMatch } = checkShortcutMatch(e, currentShortcut, os);

    const keysDisplay = os === 'mac' ? currentShortcut.display.mac : currentShortcut.display.win;

    if (isMatch) {
      // SUCCESS!
      sound.playClick();
      setIsErrorFlash(false);
      setCurrentStreak(s => s + 1);

      const attemptRecord: ShortcutAttempt = {
        shortcutId: currentShortcut.id,
        shortcutName: currentShortcut.name,
        keysDisplay,
        reactionTimeMs,
        isCorrect: true,
        timestamp: now,
      };

      setAttempts(prev => [...prev, attemptRecord]);
      shortcutStartTimeRef.current = performance.now();

      // Check count completion
      if (modeType === 'count' && attempts.length + 1 >= modeValue) {
        finishSession();
        return;
      }

      // Advance to next shortcut
      setCurrentIndex(prev => prev + 1);
    } else {
      // INCORRECT CHORD
      sound.playError();
      setIsErrorFlash(true);
      setTimeout(() => setIsErrorFlash(false), 350);

      const attemptRecord: ShortcutAttempt = {
        shortcutId: currentShortcut.id,
        shortcutName: currentShortcut.name,
        keysDisplay,
        reactionTimeMs,
        isCorrect: false,
        timestamp: now,
      };

      setAttempts(prev => [...prev, attemptRecord]);

      if (modeType === 'zen') {
        // Zen / Streak mode ends on first error
        setCurrentStreak(0);
        finishSession();
      } else {
        setCurrentStreak(0);
      }
    }
  }, [
    isCheatsheetOpen,
    isHistoryOpen,
    isSettingsOpen,
    gameState,
    queue,
    currentIndex,
    os,
    modeType,
    modeValue,
    attempts,
    initQueue,
    finishSession
  ]);

  // Key Up Handler to update chord visualizer HUD
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setActiveChord(extractChordState(e));
  }, []);

  // Register window & document keyboard listeners with capture phase to intercept before browser chrome
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    document.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    window.addEventListener('keyup', handleKeyUp, { capture: true, passive: false });
    document.addEventListener('keyup', handleKeyUp, { capture: true, passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      document.removeEventListener('keyup', handleKeyUp, { capture: true });
    };
  }, [handleKeyDown, handleKeyUp]);

  // Focus Mode / Fullscreen Toggle with navigator.keyboard.lock()
  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        // Optional Keyboard Lock API for capturing lower-level keys in fullscreen
        if ('keyboard' in navigator && (navigator as any).keyboard?.lock) {
          try {
            await (navigator as any).keyboard.lock();
          } catch {}
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
        if ('keyboard' in navigator && (navigator as any).keyboard?.unlock) {
          try {
            (navigator as any).keyboard.unlock();
          } catch {}
        }
      }
    } catch {}
  };

  // Practice Weak Keys Custom Drill
  const handleDrillWeakKeys = (weakKeys: SessionResult['weakShortcuts']) => {
    const weakIds = new Set(weakKeys.map(w => w.id));
    const targetShortcuts = (SHORTCUTS_DATA[currentPreset] || []).filter(s => weakIds.has(s.id));
    if (targetShortcuts.length > 0) {
      initQueue(targetShortcuts);
    } else {
      initQueue();
    }
  };

  // Go Home / Reset to play area when clicking keyflow logo
  const handleGoHome = useCallback(() => {
    setIsCheatsheetOpen(false);
    setIsHistoryOpen(false);
    setIsSettingsOpen(false);
    setIsAuthOpen(false);
    setIsAccountOpen(false);
    setIsLeaderboardOpen(false);
    initQueue();
    if (typeof window !== 'undefined') {
      window.focus();
    }
  }, [initQueue]);

  const currentShortcut = queue[currentIndex] || SHORTCUTS_DATA[currentPreset][0];
  const upcomingShortcuts = queue.slice(currentIndex + 1, currentIndex + 5);

  return (
    <div
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
      }}
      className="min-h-screen flex flex-col transition-colors duration-200 select-none overflow-x-hidden font-mono"
    >
      {/* Top Navigation */}
      <Navbar
        currentPreset={currentPreset}
        onSelectPreset={p => {
          setCurrentPreset(p);
          initQueue(SHORTCUTS_DATA[p]);
        }}
        modeType={modeType}
        modeValue={modeValue}
        onSelectMode={(type, val) => {
          setModeType(type);
          setModeValue(val);
        }}
        os={os}
        onToggleOS={() => setOS(prev => (prev === 'mac' ? 'win' : 'mac'))}
        soundProfile={soundProfile}
        onChangeSoundProfile={setSoundProfile}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onGoHome={handleGoHome}
        user={currentUser}
        theme={theme}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 w-full">
        {/* Real-time Physical Chord Visualizer HUD */}
        <div className="w-full max-w-4xl flex justify-center py-2">
          <ChordVisualizer chord={activeChord} os={os} theme={theme} />
        </div>

        {gameState === 'results' && sessionResult ? (
          <ResultsView
            result={sessionResult}
            personalBest={personalBest}
            os={os}
            theme={theme}
            onRestart={() => initQueue()}
            onRepeat={() => {
              if (lastRunShortcutsRef.current.length > 0) {
                initQueue(lastRunShortcutsRef.current);
              } else {
                initQueue();
              }
            }}
            onDrillWeakKeys={handleDrillWeakKeys}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />
        ) : (
          <ActivePrompt
            currentShortcut={currentShortcut}
            upcomingShortcuts={upcomingShortcuts}
            chord={activeChord}
            os={os}
            theme={theme}
            modeType={modeType}
            modeValue={modeValue}
            timeLeft={timeLeft}
            completedCount={attempts.filter(a => a.isCorrect).length}
            currentStreak={currentStreak}
            isErrorFlash={isErrorFlash}
            onRestart={() => initQueue()}
            onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
          />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="py-4 px-6 text-center text-[11px] font-mono select-none" style={{ color: theme.subText }}>
        <span>hotkey-it</span> • <span>Master the tools of your craft</span> • <span style={{ color: theme.accent }}>Tab + Enter to restart</span>
      </footer>

      {/* Modals */}
      <CheatsheetModal
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
        preset={currentPreset}
        os={os}
        theme={theme}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={historyList}
        onRefreshHistory={() => setHistoryList(loadHistory())}
        theme={theme}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={theme}
        onSelectTheme={setThemeId}
        soundProfile={soundProfile}
        onChangeSoundProfile={setSoundProfile}
        soundVolume={soundVolume}
        onChangeSoundVolume={setSoundVolume}
        os={os}
        onChangeOS={setOS}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user, isNewUser) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
          if (isNewUser) {
            setIsSetCredentialsOpen(true);
          }
        }}
        theme={theme}
      />

      {currentUser && (
        <AccountModal
          isOpen={isAccountOpen}
          onClose={() => setIsAccountOpen(false)}
          user={currentUser}
          onUpdateUser={setCurrentUser}
          onLogout={() => {
            setCurrentUser(null);
            setIsAccountOpen(false);
          }}
          onOpenSetCredentials={() => {
            setIsAccountOpen(false);
            setIsSetCredentialsOpen(true);
          }}
          theme={theme}
        />
      )}

      {currentUser && (
        <SetCredentialsModal
          isOpen={isSetCredentialsOpen}
          onClose={() => setIsSetCredentialsOpen(false)}
          user={currentUser}
          onSuccess={updated => setCurrentUser(updated)}
          theme={theme}
        />
      )}

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        theme={theme}
      />
    </div>
  );
}
