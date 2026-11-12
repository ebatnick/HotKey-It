import React, { useState } from 'react';
import {
  X,
  User,
  Flame,
  Award,
  Clock,
  CheckCircle2,
  Edit2,
  LogOut,
  Keyboard,
  Shield,
  Save,
  Calendar,
  Sparkles
} from 'lucide-react';
import { ThemeColors, UserProfile } from '../types';
import { updateUserProfile, logoutUser } from '../utils/auth';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
  onLogout: () => void;
  onOpenSetCredentials?: () => void;
  theme: ThemeColors;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  onOpenSetCredentials,
  theme,
}) => {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(user.bio || '');
  const [isEditingKeyboard, setIsEditingKeyboard] = useState(false);
  const [keyboardInput, setKeyboardInput] = useState(user.keyboard || '');

  if (!isOpen) return null;

  const handleSaveBio = async () => {
    const updated = await updateUserProfile({ bio: bioInput });
    if (updated) onUpdateUser(updated);
    setIsEditingBio(false);
  };

  const handleSaveKeyboard = async () => {
    const updated = await updateUserProfile({ keyboard: keyboardInput });
    if (updated) onUpdateUser(updated);
    setIsEditingKeyboard(false);
  };

  const formatTypingTime = (totalSec: number): string => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Activity Heatmap Generation (Last 32 weeks x 7 days)
  const today = new Date();
  const heatmapWeeks: { dateStr: string; count: number; dayOfWeek: number }[][] = [];
  const totalDays = 32 * 7;

  let currentWeek: { dateStr: string; count: number; dayOfWeek: number }[] = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const count = user.activityHeatmap?.[key] || 0;
    const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday...

    currentWeek.push({ dateStr: key, count, dayOfWeek });

    if (dayOfWeek === 6 || i === 0) {
      heatmapWeeks.push(currentWeek);
      currentWeek = [];
    }
  }

  const getHeatmapColor = (count: number): string => {
    if (count === 0) return 'rgba(255, 255, 255, 0.05)';
    if (count <= 2) return `${theme.accent}44`;
    if (count <= 5) return `${theme.accent}88`;
    if (count <= 8) return `${theme.accent}cc`;
    return theme.accent;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-mono"
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.text,
        }}
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border p-6 sm:p-10 shadow-2xl flex flex-col select-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Row with Close & Logout */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-3">
            <span style={{ color: theme.accent }} className="font-bold text-lg tracking-tight">
              ⌘ hotkey-it profile
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSetCredentials && (
              <button
                type="button"
                onClick={onOpenSetCredentials}
                style={{ color: theme.text, backgroundColor: theme.bg, borderColor: theme.border }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border hover:opacity-85 transition-opacity text-xs cursor-pointer font-semibold"
                title="Change username or link email & password login"
              >
                <Shield className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                <span>credentials</span>
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                await logoutUser();
                onLogout();
                onClose();
              }}
              style={{ color: theme.subText }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-transparent hover:border-zinc-700/60 hover:text-red-400 transition-colors text-xs cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>sign out</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: theme.subText }}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. Profile Top Card (Exact layout from image_441903ad.png) */}
        <div
          style={{ backgroundColor: theme.bg, borderColor: theme.border }}
          className="rounded-2xl border p-6 mb-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
        >
          {/* Avatar & User Details (Cols 1-5) */}
          <div className="md:col-span-5 flex items-center gap-4">
            <div
              style={{ backgroundColor: `${theme.accent}22`, borderColor: `${theme.accent}66`, color: theme.accent }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 flex items-center justify-center shrink-0 shadow-lg"
            >
              <User className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="flex flex-col gap-1 overflow-hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight truncate" style={{ color: theme.text }}>
                  {user.username}
                </h2>
                {/* Custom Badge from Firestore (e.g. 🚀 Mythical) */}
                {user.badge && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-sm"
                  >
                    {user.badge}
                  </span>
                )}
              </div>

              <div className="text-[11px] opacity-70" style={{ color: theme.subText }}>
                Joined {user.joinedDate}
              </div>
              <div className="flex items-center gap-1.5 text-xs mt-0.5" style={{ color: theme.accent }}>
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Current streak {user.currentStreak} days</span>
              </div>

              {/* Level Progress Bar: 25 [=======-------] 934/1.3k */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="font-bold text-sm" style={{ color: theme.text }}>
                  {user.level}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden bg-zinc-800/80 max-w-[140px]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((user.xp / user.nextLevelXp) * 100))}%`, backgroundColor: theme.accent }}
                  />
                </div>
                <span className="text-[10px] opacity-70 font-mono" style={{ color: theme.subText }}>
                  {user.xp}/{user.nextLevelXp >= 1000 ? `${(user.nextLevelXp / 1000).toFixed(1)}k` : user.nextLevelXp}
                </span>
              </div>
            </div>
          </div>

          {/* Test Statistics Counters (Cols 6-8) */}
          <div className="md:col-span-3 flex flex-col gap-2 text-xs border-y md:border-y-0 md:border-x py-3 md:py-0 md:px-5" style={{ borderColor: theme.border }}>
            <div>
              <span className="text-[10px] uppercase tracking-wider block opacity-70" style={{ color: theme.subText }}>
                tests started
              </span>
              <span className="text-lg font-bold" style={{ color: theme.text }}>
                {user.testsStarted}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider block opacity-70" style={{ color: theme.subText }}>
                tests completed
              </span>
              <span className="text-lg font-bold" style={{ color: theme.accent }}>
                {user.testsCompleted}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider block opacity-70" style={{ color: theme.subText }}>
                time typing
              </span>
              <span className="text-sm font-bold font-mono" style={{ color: theme.text }}>
                {formatTypingTime(user.timeTypingSeconds)}
              </span>
            </div>
          </div>

          {/* Bio & Keyboard Settings (Cols 9-12) */}
          <div className="md:col-span-4 flex flex-col gap-3 text-xs">
            {/* Bio */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1" style={{ color: theme.subText }}>
                <span>bio</span>
                {!isEditingBio ? (
                  <button
                    type="button"
                    onClick={() => { setBioInput(user.bio); setIsEditingBio(true); }}
                    className="hover:opacity-100 opacity-60 p-0.5"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveBio}
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Save className="w-3 h-3" /> save
                  </button>
                )}
              </div>
              {isEditingBio ? (
                <textarea
                  value={bioInput}
                  onChange={e => setBioInput(e.target.value)}
                  maxLength={160}
                  className="w-full p-2 rounded-lg border text-xs outline-none bg-zinc-950/60"
                  style={{ borderColor: theme.border, color: theme.text }}
                  rows={2}
                />
              ) : (
                <p className="text-xs leading-relaxed opacity-90 italic" style={{ color: theme.text }}>
                  {user.bio || 'No bio set yet.'}
                </p>
              )}
            </div>

            {/* Keyboard */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1" style={{ color: theme.subText }}>
                <span>keyboard</span>
                {!isEditingKeyboard ? (
                  <button
                    type="button"
                    onClick={() => { setKeyboardInput(user.keyboard); setIsEditingKeyboard(true); }}
                    className="hover:opacity-100 opacity-60 p-0.5"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveKeyboard}
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Save className="w-3 h-3" /> save
                  </button>
                )}
              </div>
              {isEditingKeyboard ? (
                <input
                  type="text"
                  value={keyboardInput}
                  onChange={e => setKeyboardInput(e.target.value)}
                  maxLength={60}
                  className="w-full px-2.5 py-1 rounded-lg border text-xs outline-none bg-zinc-950/60"
                  style={{ borderColor: theme.border, color: theme.text }}
                />
              ) : (
                <p className="text-xs opacity-90 flex items-center gap-1.5" style={{ color: theme.text }}>
                  <Keyboard className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  <span>{user.keyboard || 'Standard Layout'}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 2. Personal Bests Grid (Exact layout from image_441903ad.png) */}
        <div className="mb-6 flex flex-col gap-3">
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.subText }}>
            all-time personal bests
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
            {/* Time categories: 15s, 30s, 60s, 120s */}
            {[
              { id: 'time_15', label: '15 seconds' },
              { id: 'time_30', label: '30 seconds' },
              { id: 'time_60', label: '60 seconds' },
              { id: 'time_120', label: '120 seconds' },
              { id: 'count_10', label: '10 keys' },
              { id: 'count_25', label: '25 keys' },
              { id: 'count_50', label: '50 keys' },
              { id: 'count_100', label: '100 keys' }
            ].map(col => {
              const score = user.personalBests?.[col.id];
              return (
                <div
                  key={col.id}
                  style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                  className="p-3 rounded-2xl border flex flex-col justify-between items-center text-center"
                >
                  <span className="text-[10px] opacity-70 mb-1" style={{ color: theme.subText }}>
                    {col.label}
                  </span>
                  <span className="text-2xl font-black tracking-tight" style={{ color: score ? theme.accent : theme.subText }}>
                    {score ? score.spm : '-'}
                  </span>
                  <span className="text-[10px] opacity-80 mt-1" style={{ color: score ? theme.text : theme.subText }}>
                    {score ? `${score.accuracy}%` : '-'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. 12-Month Activity Heatmap (Exact layout from image_441903ad.png) */}
        <div
          style={{ backgroundColor: theme.bg, borderColor: theme.border }}
          className="rounded-2xl border p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: theme.accent }} />
              <span className="font-bold" style={{ color: theme.text }}>
                activity heatmap
              </span>
              <span className="opacity-60 text-[11px]" style={{ color: theme.subText }}>
                ({user.testsCompleted} tests completed)
              </span>
            </div>

            {/* Legend: less ⬛ 🟩 🟩 🟩 more */}
            <div className="flex items-center gap-1.5 text-[10px] opacity-70" style={{ color: theme.subText }}>
              <span>less</span>
              <div className="w-2.5 h-2.5 rounded-sm bg-white/5" />
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `${theme.accent}44` }} />
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `${theme.accent}88` }} />
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `${theme.accent}cc` }} />
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme.accent }} />
              <span>more</span>
            </div>
          </div>

          {/* Grid rows */}
          <div className="w-full overflow-x-auto py-2">
            <div className="flex gap-1 min-w-[680px]">
              {/* Day of week labels */}
              <div className="flex flex-col justify-between text-[9px] pr-2 opacity-50 shrink-0 font-mono" style={{ color: theme.subText }}>
                <span>mon</span>
                <span>wed</span>
                <span>fri</span>
                <span>sun</span>
              </div>

              {/* Columns of weeks */}
              {heatmapWeeks.map((week, wIdx) => (
                <div key={`week-${wIdx}`} className="flex flex-col gap-1">
                  {week.map(day => (
                    <div
                      key={day.dateStr}
                      title={`${day.dateStr}: ${day.count} tests completed`}
                      style={{ backgroundColor: getHeatmapColor(day.count) }}
                      className="w-3 h-3 rounded-sm transition-transform hover:scale-125 hover:z-10 cursor-pointer"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] opacity-40 text-center mt-2 font-mono" style={{ color: theme.subText }}>
            Note: All activity timestamps synchronized in local time.
          </div>
        </div>
      </div>
    </div>
  );
};
