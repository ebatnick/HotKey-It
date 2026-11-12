import React, { useState, useEffect } from 'react';
import {
  X,
  Crown,
  Trophy,
  Medal,
  User,
  RefreshCw,
  Globe,
  Calendar,
  Sparkles,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ThemeColors, PresetId, TestModeType, LeaderboardEntry } from '../types';
import { fetchLeaderboardFromFirestore } from '../utils/auth';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeColors;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const [selectedTimeScope, setSelectedTimeScope] = useState<'all-time' | 'weekly' | 'daily'>('all-time');
  const [selectedAudience, setSelectedAudience] = useState<'everyone' | 'friends'>('everyone');
  const [selectedPreset, setSelectedPreset] = useState<PresetId | 'all'>('all');
  const [selectedModeType, setSelectedModeType] = useState<TestModeType>('time');
  const [selectedModeValue, setSelectedModeValue] = useState<number>(15);

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLeaderboardFromFirestore(selectedPreset, selectedModeType, selectedModeValue);
      setEntries(data);
    } catch (e) {
      console.error('Failed to load leaderboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen, selectedPreset, selectedModeType, selectedModeValue, selectedTimeScope]);

  if (!isOpen) return null;

  const modeTitle = selectedModeType === 'time'
    ? `Time ${selectedModeValue}`
    : `${selectedModeValue} Keys`;

  const presetTitle = selectedPreset === 'all'
    ? 'Shortcuts'
    : selectedPreset === 'vscode'
    ? 'VS Code'
    : selectedPreset.toUpperCase();

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
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border p-6 sm:p-8 shadow-2xl flex flex-col select-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Row with Close */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2.5">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-sm tracking-wide uppercase opacity-75" style={{ color: theme.subText }}>
              Global Rankings & Live Firestore Leaderboard
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadLeaderboard}
              disabled={isLoading}
              className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity disabled:opacity-30 cursor-pointer"
              style={{ color: theme.subText }}
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ color: theme.subText }}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Navigation Panels (Exact match to image_f95e8ba6.png) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          {/* Left Tabs: all-time shortcuts | weekly xp | daily */}
          <div className="flex items-center gap-1 p-1 rounded-xl border bg-black/40" style={{ borderColor: theme.border }}>
            <button
              type="button"
              onClick={() => setSelectedTimeScope('all-time')}
              style={{
                backgroundColor: selectedTimeScope === 'all-time' ? theme.accent : 'transparent',
                color: selectedTimeScope === 'all-time' ? theme.keyActiveText : theme.subText,
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>all-time shortcuts</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTimeScope('weekly')}
              style={{
                backgroundColor: selectedTimeScope === 'weekly' ? theme.accent : 'transparent',
                color: selectedTimeScope === 'weekly' ? theme.keyActiveText : theme.subText,
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>weekly xp</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTimeScope('daily')}
              style={{
                backgroundColor: selectedTimeScope === 'daily' ? theme.accent : 'transparent',
                color: selectedTimeScope === 'daily' ? theme.keyActiveText : theme.subText,
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>daily</span>
            </button>
          </div>

          {/* Middle Tabs: everyone | friends only */}
          <div className="flex items-center gap-1 p-1 rounded-xl border bg-black/40" style={{ borderColor: theme.border }}>
            <button
              type="button"
              onClick={() => setSelectedAudience('everyone')}
              style={{
                backgroundColor: selectedAudience === 'everyone' ? theme.accent : 'transparent',
                color: selectedAudience === 'everyone' ? theme.keyActiveText : theme.subText,
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>everyone</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedAudience('friends')}
              style={{
                backgroundColor: selectedAudience === 'friends' ? theme.accent : 'transparent',
                color: selectedAudience === 'friends' ? theme.keyActiveText : theme.subText,
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>friends only</span>
            </button>
          </div>

          {/* Mode Tabs: time 15 | time 60 | 10 keys | 25 keys */}
          <div className="flex items-center gap-1 p-1 rounded-xl border bg-black/40" style={{ borderColor: theme.border }}>
            <button
              type="button"
              onClick={() => { setSelectedModeType('time'); setSelectedModeValue(15); }}
              style={{
                backgroundColor: selectedModeType === 'time' && selectedModeValue === 15 ? theme.accent : 'transparent',
                color: selectedModeType === 'time' && selectedModeValue === 15 ? theme.keyActiveText : theme.subText,
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>time 15</span>
            </button>
            <button
              type="button"
              onClick={() => { setSelectedModeType('time'); setSelectedModeValue(60); }}
              style={{
                backgroundColor: selectedModeType === 'time' && selectedModeValue === 60 ? theme.accent : 'transparent',
                color: selectedModeType === 'time' && selectedModeValue === 60 ? theme.keyActiveText : theme.subText,
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>time 60</span>
            </button>
            <button
              type="button"
              onClick={() => { setSelectedModeType('count'); setSelectedModeValue(10); }}
              style={{
                backgroundColor: selectedModeType === 'count' && selectedModeValue === 10 ? theme.accent : 'transparent',
                color: selectedModeType === 'count' && selectedModeValue === 10 ? theme.keyActiveText : theme.subText,
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              10 keys
            </button>
            <button
              type="button"
              onClick={() => { setSelectedModeType('count'); setSelectedModeValue(25); }}
              style={{
                backgroundColor: selectedModeType === 'count' && selectedModeValue === 25 ? theme.accent : 'transparent',
                color: selectedModeType === 'count' && selectedModeValue === 25 ? theme.keyActiveText : theme.subText,
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              25 keys
            </button>
          </div>
        </div>

        {/* Heading & Notice from image_f95e8ba6.png */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            All-time {presetTitle} {modeTitle} Leaderboard
          </h1>
          <div
            style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}25`, color: theme.subText }}
            className="p-3 rounded-xl border text-xs text-center"
          >
            Your account must have at least 1 completed test to be ranked on the live leaderboard.
          </div>
        </div>

        {/* Sub-bar: Next update & Page selector */}
        <div className="flex items-center justify-between text-xs mb-3 px-1" style={{ color: theme.subText }}>
          <span className="opacity-70">
            Next update in: 04:02
          </span>

          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            <button type="button" className="opacity-50 hover:opacity-100 p-0.5"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <span className="font-bold text-white px-1"># 1</span>
            <button type="button" className="opacity-50 hover:opacity-100 p-0.5"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Leaderboard Table (Exact columns matching Monkeytype) */}
        <div className="w-full overflow-x-auto rounded-2xl border" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b text-[11px] uppercase tracking-wider" style={{ borderColor: theme.border, color: theme.subText }}>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">name</th>
                <th className="py-3 px-4 text-right">wpm / spm</th>
                <th className="py-3 px-4 text-right">accuracy</th>
                <th className="py-3 px-4 text-right">raw</th>
                <th className="py-3 px-4 text-right">consistency</th>
                <th className="py-3 px-4 text-right">date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center opacity-60">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-yellow-400" />
                    <span>Loading Firestore records...</span>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Crown className="w-8 h-8 opacity-30 text-yellow-400 mb-1" />
                      <span className="font-semibold text-sm" style={{ color: theme.text }}>
                        В базе данных Firestore пока нет рекордов для этого режима
                      </span>
                      <span className="text-xs opacity-60 max-w-md" style={{ color: theme.subText }}>
                        Войдите в аккаунт и пройдите тест, чтобы ваш реальный результат сразу же появился в таблице лидеров!
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                entries.map(item => {
                  const isTop1 = item.rank === 1;
                  const isTop2 = item.rank === 2;
                  const isTop3 = item.rank === 3;

                  return (
                    <tr
                      key={`${item.rank}-${item.username}-${item.dateStr}`}
                      style={{
                        backgroundColor: item.isCurrentUser ? `${theme.accent}18` : 'transparent',
                        borderColor: theme.border,
                      }}
                      className="border-b hover:bg-white/5 transition-colors"
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 font-bold text-center">
                        {isTop1 ? (
                          <span className="text-yellow-400 inline-flex items-center justify-center">
                            <Crown className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          </span>
                        ) : isTop2 ? (
                          <span className="text-slate-300 font-bold">2</span>
                        ) : isTop3 ? (
                          <span className="text-amber-500 font-bold">3</span>
                        ) : (
                          <span className="opacity-60">{item.rank}</span>
                        )}
                      </td>

                      {/* Name with Avatar & Firestore Badge (Exact match to rocket 🚀 Mythical in screenshot) */}
                      <td className="py-3.5 px-4 font-medium">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div
                            style={{
                              backgroundColor: item.isCurrentUser ? theme.accent : theme.surface,
                              color: item.isCurrentUser ? theme.keyActiveText : theme.subText,
                            }}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0"
                          >
                            <User className="w-3 h-3" />
                          </div>

                          <span style={{ color: item.isCurrentUser ? theme.accent : theme.text }} className="font-semibold">
                            {item.username}
                          </span>

                          {/* Dynamic Badge (e.g., 🚀 Mythical) */}
                          {item.badge && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-sky-500/25 text-sky-300 border border-sky-400/35 inline-flex items-center gap-1 shadow-sm"
                            >
                              {item.badge}
                            </span>
                          )}

                          {item.isCurrentUser && (
                            <span
                              style={{ backgroundColor: `${theme.accent}30`, color: theme.accent }}
                              className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                            >
                              you
                            </span>
                          )}
                        </div>
                      </td>

                      {/* WPM / SPM */}
                      <td className="py-3.5 px-4 text-right font-black text-sm" style={{ color: theme.accent }}>
                        {Number(item.spm).toFixed(2)}
                      </td>

                      {/* Accuracy */}
                      <td className="py-3.5 px-4 text-right font-medium" style={{ color: theme.text }}>
                        {Number(item.accuracy).toFixed(2)}%
                      </td>

                      {/* Raw */}
                      <td className="py-3.5 px-4 text-right opacity-80 font-mono" style={{ color: theme.text }}>
                        {(item.raw !== undefined ? Number(item.raw) : Number(item.spm)).toFixed(2)}
                      </td>

                      {/* Consistency */}
                      <td className="py-3.5 px-4 text-right opacity-80 font-mono" style={{ color: theme.text }}>
                        {(item.consistency !== undefined ? Number(item.consistency) : 92.5).toFixed(2)}%
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right opacity-50 text-[11px] whitespace-nowrap" style={{ color: theme.subText }}>
                        {item.dateStr}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
