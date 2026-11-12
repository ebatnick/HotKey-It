import React from 'react';
import { X, Palette, Volume2, Monitor, ShieldCheck, Play } from 'lucide-react';
import { ThemeColors, KeySwitchProfile, OSMode } from '../types';
import { THEMES } from '../data/themes';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeColors;
  onSelectTheme: (id: string) => void;
  soundProfile: KeySwitchProfile;
  onChangeSoundProfile: (p: KeySwitchProfile) => void;
  soundVolume: number;
  onChangeSoundVolume: (v: number) => void;
  os: OSMode;
  onChangeOS: (os: OSMode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  soundProfile,
  onChangeSoundProfile,
  soundVolume,
  onChangeSoundVolume,
  os,
  onChangeOS,
}) => {
  if (!isOpen) return null;

  const testClickSound = () => {
    sound.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
      <div
        style={{
          backgroundColor: currentTheme.surface,
          borderColor: currentTheme.border,
        }}
        className="w-full max-w-2xl max-h-[85vh] rounded-3xl border flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: currentTheme.border }}>
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5" style={{ color: currentTheme.accent }} />
            <div>
              <h2 className="text-base font-bold" style={{ color: currentTheme.text }}>
                Settings & Themes
              </h2>
              <p className="text-xs font-sans" style={{ color: currentTheme.subText }}>
                Customize your terminal aesthetics and mechanical switches
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-800/60 transition-colors"
            style={{ color: currentTheme.subText }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section 1: Themes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4" style={{ color: currentTheme.accent }} />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTheme.text }}>
                Color Palettes
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEMES.map(t => {
                const isSelected = currentTheme.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelectTheme(t.id)}
                    style={{
                      backgroundColor: t.bg,
                      borderColor: isSelected ? t.accent : t.border,
                      boxShadow: isSelected ? `0 0 16px ${t.accent}44` : 'none',
                    }}
                    className="p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all hover:scale-[1.01]"
                  >
                    <div>
                      <div className="font-bold text-xs" style={{ color: t.text }}>
                        {t.name}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: t.subText }}>
                        {t.isLight ? 'Light Theme' : 'Dark Theme'}
                      </div>
                    </div>

                    {/* Palette swatches preview */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.accent }} />
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.surface }} />
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.subText }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Audio & Mechanical Switch Profiles */}
          <div className="pt-4 border-t" style={{ borderColor: currentTheme.border }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" style={{ color: currentTheme.accent }} />
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTheme.text }}>
                  Synthesized Mechanical Switches
                </h3>
              </div>
              <button
                type="button"
                onClick={testClickSound}
                style={{
                  backgroundColor: currentTheme.keyBg,
                  borderColor: currentTheme.border,
                  color: currentTheme.accent,
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-semibold hover:opacity-85 transition-opacity"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Test Switch</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {[
                { id: 'blue', label: 'MX Blue', desc: 'Clicky & Sharp' },
                { id: 'brown', label: 'MX Brown', desc: 'Tactile Bump' },
                { id: 'red', label: 'MX Red', desc: 'Linear Smooth' },
                { id: 'off', label: 'Muted', desc: 'Silent' },
              ].map(sw => {
                const isSelected = soundProfile === sw.id;
                return (
                  <button
                    key={sw.id}
                    type="button"
                    onClick={() => onChangeSoundProfile(sw.id as KeySwitchProfile)}
                    style={{
                      backgroundColor: isSelected ? currentTheme.accent : currentTheme.keyBg,
                      color: isSelected ? currentTheme.keyActiveText : currentTheme.text,
                      borderColor: isSelected ? currentTheme.accent : currentTheme.border,
                    }}
                    className="p-3 rounded-2xl border text-center transition-all"
                  >
                    <div className="font-bold text-xs">{sw.label}</div>
                    <div className="text-[10px] opacity-75 mt-0.5">{sw.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Volume Slider */}
            {soundProfile !== 'off' && (
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="w-20" style={{ color: currentTheme.subText }}>Volume:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={e => onChangeSoundVolume(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className="w-10 text-right font-bold" style={{ color: currentTheme.accent }}>
                  {Math.round(soundVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Operating System Preference */}
          <div className="pt-4 border-t" style={{ borderColor: currentTheme.border }}>
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-4 h-4" style={{ color: currentTheme.accent }} />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTheme.text }}>
                Keyboard Layout Mode
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChangeOS('mac')}
                style={{
                  backgroundColor: os === 'mac' ? currentTheme.accent : currentTheme.keyBg,
                  color: os === 'mac' ? currentTheme.keyActiveText : currentTheme.text,
                  borderColor: os === 'mac' ? currentTheme.accent : currentTheme.border,
                }}
                className="p-3 rounded-2xl border text-left transition-all"
              >
                <div className="font-bold text-xs"> macOS Layout</div>
                <div className="text-[10px] opacity-80 mt-1">
                  Cmd ⌘, Option ⌥, Control ⌃
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChangeOS('win')}
                style={{
                  backgroundColor: os === 'win' ? currentTheme.accent : currentTheme.keyBg,
                  color: os === 'win' ? currentTheme.keyActiveText : currentTheme.text,
                  borderColor: os === 'win' ? currentTheme.accent : currentTheme.border,
                }}
                className="p-3 rounded-2xl border text-left transition-all"
              >
                <div className="font-bold text-xs">⊞ Windows / Linux</div>
                <div className="text-[10px] opacity-80 mt-1">
                  Ctrl, Alt, Win
                </div>
              </button>
            </div>
          </div>

          {/* Section 4: Focus Mode & Keyboard Lock Note */}
          <div
            style={{
              backgroundColor: currentTheme.keyBg,
              borderColor: currentTheme.border,
            }}
            className="p-4 rounded-2xl border flex items-start gap-3 text-xs"
          >
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <div className="space-y-1 font-sans">
              <div className="font-bold font-mono text-[11px]" style={{ color: currentTheme.text }}>
                Focus Mode & Keyboard Lock
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: currentTheme.subText }}>
                When you activate Focus Mode via the fullscreen button, KeyFlow enters fullscreen and locks system keys via the browser Keyboard Lock API (`navigator.keyboard.lock()`), allowing shortcuts like <code className="font-mono text-zinc-300">Ctrl+W</code> or <code className="font-mono text-zinc-300">Ctrl+N</code> to be intercepted seamlessly without closing your tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
