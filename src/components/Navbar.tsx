import React, { useState, useRef, useEffect } from 'react';
import {
  Code2,
  Palette,
  Box,
  Sheet,
  Clock,
  Hash,
  Infinity as InfinityIcon,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  BookOpen,
  BarChart2,
  Settings,
  ChevronDown,
  Layers,
  Crown,
  User
} from 'lucide-react';
import { PresetId, TestModeType, OSMode, KeySwitchProfile, ThemeColors, UserProfile } from '../types';
import { PRESET_INFOS } from '../data/presets';

interface NavbarProps {
  currentPreset: PresetId;
  onSelectPreset: (preset: PresetId) => void;
  modeType: TestModeType;
  modeValue: number;
  onSelectMode: (type: TestModeType, value: number) => void;
  os: OSMode;
  onToggleOS: () => void;
  soundProfile: KeySwitchProfile;
  onChangeSoundProfile: (p: KeySwitchProfile) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenCheatsheet: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenLeaderboard: () => void;
  onOpenAuth: () => void;
  onOpenAccount: () => void;
  onGoHome: () => void;
  user: UserProfile | null;
  theme: ThemeColors;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPreset,
  onSelectPreset,
  modeType,
  modeValue,
  onSelectMode,
  os,
  onToggleOS,
  soundProfile,
  onChangeSoundProfile,
  isFullscreen,
  onToggleFullscreen,
  onOpenCheatsheet,
  onOpenHistory,
  onOpenSettings,
  onOpenLeaderboard,
  onOpenAuth,
  onOpenAccount,
  onGoHome,
  user,
  theme,
}) => {
  const [isPacksOpen, setIsPacksOpen] = useState(false);
  const packsRef = useRef<HTMLDivElement>(null);

  const activePresetInfo = PRESET_INFOS.find(p => p.id === currentPreset) || PRESET_INFOS[0];

  const getPresetIcon = (id: PresetId) => {
    switch (id) {
      case 'vscode':
        return <Code2 className="w-4 h-4" />;
      case 'figma':
        return <Palette className="w-4 h-4" />;
      case 'blender':
        return <Box className="w-4 h-4" />;
      case 'excel':
        return <Sheet className="w-4 h-4" />;
    }
  };

  const nextSoundProfile = () => {
    const cycle: KeySwitchProfile[] = ['blue', 'brown', 'red', 'off'];
    const idx = cycle.indexOf(soundProfile);
    const next = cycle[(idx + 1) % cycle.length];
    onChangeSoundProfile(next);
  };

  // Close packs dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (packsRef.current && !packsRef.current.contains(e.target as Node)) {
        setIsPacksOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full flex flex-col items-center gap-4 py-4 px-4 sm:px-8 max-w-6xl mx-auto select-none">
      {/* Top Header Row (Monkeytype style: Bare icons, zero box borders) */}
      <div className="w-full flex items-center justify-between">
        {/* Left: Brand + Quick Naked Icons */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div
            className="flex items-center gap-2 cursor-pointer select-none group"
            onClick={onGoHome}
            title="Return to trainer (Home)"
          >
            <span
              style={{ color: theme.accent }}
              className="font-mono font-black text-xl tracking-tighter transition-transform group-hover:scale-105"
            >
              ⌘ keyflow
            </span>
          </div>

          {/* Naked Header Action Icons (like Monkeytype's top left icons) */}
          <div className="flex items-center gap-1 text-sm font-mono" style={{ color: theme.subText }}>
            <button
              type="button"
              onClick={onOpenCheatsheet}
              title="Shortcut Cheatsheet (?)"
              className="p-1.5 hover:opacity-100 opacity-60 transition-opacity"
              style={{ color: theme.text }}
              aria-label="Open Shortcuts Cheatsheet"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Leaderboard Crown Icon (like Monkeytype's top crown) */}
            <button
              type="button"
              onClick={onOpenLeaderboard}
              title="Global Leaderboards & Rankings"
              className="p-1.5 hover:opacity-100 opacity-60 transition-opacity"
              style={{ color: theme.text }}
              aria-label="Open Global Leaderboards"
            >
              <Crown className="w-4 h-4 text-yellow-400" />
            </button>

            <button
              type="button"
              onClick={onOpenHistory}
              title="Test History & Records"
              className="p-1.5 hover:opacity-100 opacity-60 transition-opacity"
              style={{ color: theme.text }}
              aria-label="Open History and Stats"
            >
              <BarChart2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              title="Settings & Themes"
              className="p-1.5 hover:opacity-100 opacity-60 transition-opacity"
              style={{ color: theme.text }}
              aria-label="Open Settings and Themes"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Tools (Clean, zero heavy boxes) */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono" style={{ color: theme.subText }}>
          {/* OS Switcher - Plain minimal pill text */}
          <button
            type="button"
            onClick={onToggleOS}
            title={`Switch to ${os === 'mac' ? 'Windows / Linux' : 'macOS'} shortcuts`}
            className="px-2 py-1 hover:opacity-100 opacity-70 transition-opacity flex items-center gap-1 font-semibold"
            style={{ color: theme.text }}
            aria-label="Toggle Operating System"
          >
            <span style={{ color: theme.accent }}>{os === 'mac' ? ' mac' : '⊞ win'}</span>
          </button>

          {/* Sound Switcher */}
          <button
            type="button"
            onClick={nextSoundProfile}
            title={`Sound switch: ${soundProfile.toUpperCase()}`}
            className="p-1.5 hover:opacity-100 opacity-70 transition-opacity flex items-center gap-1"
            style={{ color: theme.text }}
            aria-label="Toggle Sound Switch Profile"
          >
            {soundProfile === 'off' ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" style={{ color: theme.accent }} />
            )}
            <span className="hidden md:inline text-[11px] opacity-60">
              {soundProfile === 'off' ? 'mute' : soundProfile}
            </span>
          </button>

          {/* Focus Mode / Fullscreen */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Focus Mode (Fullscreen)'}
            className="p-1.5 hover:opacity-100 opacity-70 transition-opacity"
            style={{ color: isFullscreen ? theme.accent : theme.text }}
            aria-label="Toggle Focus Mode Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* User Account / Profile Widget (Monkeytype style) */}
          {user ? (
            <button
              type="button"
              onClick={onOpenAccount}
              title={`Profile: ${user.username} (Level ${user.level})`}
              className="flex items-center gap-1.5 px-2 py-1 hover:opacity-100 opacity-85 transition-opacity font-semibold cursor-pointer"
              style={{ color: theme.text }}
              aria-label="Open User Account Profile"
            >
              <User className="w-4 h-4" style={{ color: theme.accent }} />
              <span className="hidden sm:inline truncate max-w-[85px]">{user.username}</span>
              {user.badge && (
                <span className="hidden md:inline-flex text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  {user.badge}
                </span>
              )}
              <span
                style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
                className="text-[10px] px-1.5 py-0.2 rounded font-bold font-mono"
              >
                {user.level}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              title="Sign in or Register"
              className="flex items-center gap-1.5 px-2 py-1 hover:opacity-100 opacity-70 transition-opacity font-semibold cursor-pointer"
              style={{ color: theme.text }}
              aria-label="Open Sign in"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">sign in</span>
            </button>
          )}
        </div>
      </div>

      {/* Monkeytype-style Unified Config Bar (Centered pill, NO individual square boxes) */}
      <div
        style={{
          backgroundColor: theme.surface,
        }}
        className="flex items-center justify-center gap-3 sm:gap-5 px-4 py-2 rounded-xl text-xs font-mono shadow-sm"
      >
        {/* 1. Pack Dropdown Selector */}
        <div className="relative" ref={packsRef}>
          <button
            type="button"
            onClick={() => setIsPacksOpen(!isPacksOpen)}
            style={{
              color: isPacksOpen ? theme.accent : theme.text,
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:opacity-100 opacity-90 transition-all font-semibold"
            aria-label="Select Software Pack"
          >
            <Layers className="w-3.5 h-3.5" style={{ color: theme.accent }} />
            <span>pack:</span>
            <span style={{ color: theme.accent }} className="font-bold underline decoration-dotted">
              {activePresetInfo.name}
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isPacksOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Floating Pack Dropdown Menu */}
          {isPacksOpen && (
            <div
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
              className="absolute left-0 top-full mt-2 w-64 rounded-2xl border p-1.5 z-40 animate-fade-in flex flex-col gap-1 font-mono text-xs"
            >
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.subText }}>
                Select Software Pack
              </div>

              {PRESET_INFOS.map(p => {
                const isSelected = currentPreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectPreset(p.id);
                      setIsPacksOpen(false);
                    }}
                    style={{
                      backgroundColor: isSelected ? theme.keyBg : 'transparent',
                      color: isSelected ? theme.accent : theme.text,
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-zinc-800/40 transition-colors"
                  >
                    <div
                      style={{
                        color: isSelected ? theme.accent : theme.subText,
                      }}
                    >
                      {getPresetIcon(p.id)}
                    </div>
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-[10px] opacity-60 font-sans">{p.tagline}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <span className="opacity-20 select-none">|</span>

        {/* 2. Mode Group: time | keys | zen */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onSelectMode('time', 30)}
            style={{
              color: modeType === 'time' ? theme.accent : theme.subText,
              fontWeight: modeType === 'time' ? '700' : '400',
            }}
            className="flex items-center gap-1 hover:opacity-100 transition-opacity"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>time</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('count', 10)}
            style={{
              color: modeType === 'count' ? theme.accent : theme.subText,
              fontWeight: modeType === 'count' ? '700' : '400',
            }}
            className="flex items-center gap-1 hover:opacity-100 transition-opacity"
          >
            <Hash className="w-3.5 h-3.5" />
            <span>keys</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('zen', 0)}
            style={{
              color: modeType === 'zen' ? theme.accent : theme.subText,
              fontWeight: modeType === 'zen' ? '700' : '400',
            }}
            className="flex items-center gap-1 hover:opacity-100 transition-opacity"
            title="Zen: Play until first mistake"
          >
            <InfinityIcon className="w-3.5 h-3.5" />
            <span>zen</span>
          </button>
        </div>

        {/* 3. Sub-mode values (15 30 60 or 10 25 50) */}
        {modeType !== 'zen' && (
          <>
            <span className="opacity-20 select-none">|</span>
            <div className="flex items-center gap-2">
              {modeType === 'time'
                ? [15, 30, 60].map(s => (
                    <button
                      key={`time-${s}`}
                      type="button"
                      onClick={() => onSelectMode('time', s)}
                      style={{
                        color: modeValue === s ? theme.accent : theme.subText,
                        fontWeight: modeValue === s ? '700' : '400',
                      }}
                      className="hover:opacity-100 transition-opacity px-0.5"
                    >
                      {s}
                    </button>
                  ))
                : [10, 25, 50].map(c => (
                    <button
                      key={`count-${c}`}
                      type="button"
                      onClick={() => onSelectMode('count', c)}
                      style={{
                        color: modeValue === c ? theme.accent : theme.subText,
                        fontWeight: modeValue === c ? '700' : '400',
                      }}
                      className="hover:opacity-100 transition-opacity px-0.5"
                    >
                      {c}
                    </button>
                  ))}
            </div>
          </>
        )}
      </div>
    </header>
  );
};
