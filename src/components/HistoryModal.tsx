import React, { useState } from 'react';
import { X, Trophy, BarChart2, Trash2, Calendar, Zap, Target, Clock } from 'lucide-react';
import { SessionResult, ThemeColors, PresetId } from '../types';
import { clearHistory } from '../utils/storage';
import { PRESET_INFOS } from '../data/presets';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SessionResult[];
  onRefreshHistory: () => void;
  theme: ThemeColors;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onRefreshHistory,
  theme,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<PresetId | 'all'>('all');

  if (!isOpen) return null;

  const filteredHistory = selectedPreset === 'all'
    ? history
    : history.filter(h => h.preset === selectedPreset);

  // Calculate high scores
  const getBestSpmForPreset = (presetId: PresetId) => {
    const list = history.filter(h => h.preset === presetId);
    if (!list.length) return null;
    return Math.max(...list.map(h => h.spm));
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your KeyFlow test history?')) {
      clearHistory();
      onRefreshHistory();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
      <div
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
        }}
        className="w-full max-w-3xl max-h-[85vh] rounded-3xl border flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2.5">
            <BarChart2 className="w-5 h-5" style={{ color: theme.accent }} />
            <div>
              <h2 className="text-base font-bold" style={{ color: theme.text }}>
                Test History & Records
              </h2>
              <p className="text-xs font-sans" style={{ color: theme.subText }}>
                Personal bests and session telemetry
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                title="Clear all history"
                className="p-1.5 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-zinc-800/60 transition-colors"
              style={{ color: theme.subText }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Personal Best Badges Grid */}
        <div className="p-4 border-b grid grid-cols-2 sm:grid-cols-4 gap-2" style={{ borderColor: theme.border }}>
          {PRESET_INFOS.map(p => {
            const best = getBestSpmForPreset(p.id);
            return (
              <div
                key={`pb-${p.id}`}
                style={{ backgroundColor: theme.keyBg, borderColor: theme.border }}
                className="p-3 rounded-2xl border flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[11px]" style={{ color: theme.subText }}>
                  <span>{p.name}</span>
                  <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                </div>
                <div className="mt-1">
                  <span className="text-xl font-black" style={{ color: best ? theme.accent : theme.subText }}>
                    {best !== null ? `${best} SPM` : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b flex items-center gap-1.5 overflow-x-auto text-xs" style={{ borderColor: theme.border }}>
          <button
            type="button"
            onClick={() => setSelectedPreset('all')}
            style={{
              backgroundColor: selectedPreset === 'all' ? theme.accent : 'transparent',
              color: selectedPreset === 'all' ? theme.keyActiveText : theme.subText,
            }}
            className="px-3 py-1 rounded-xl font-medium transition-colors"
          >
            All Presets
          </button>
          {PRESET_INFOS.map(p => (
            <button
              key={`filter-${p.id}`}
              type="button"
              onClick={() => setSelectedPreset(p.id)}
              style={{
                backgroundColor: selectedPreset === p.id ? theme.accent : 'transparent',
                color: selectedPreset === p.id ? theme.keyActiveText : theme.subText,
              }}
              className="px-3 py-1 rounded-xl font-medium transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* History Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredHistory.length === 0 ? (
            <div className="py-16 text-center text-xs opacity-60" style={{ color: theme.subText }}>
              No recorded sessions yet. Complete a test to see your analytics!
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map(item => (
                <div
                  key={item.id}
                  style={{ backgroundColor: theme.keyBg, borderColor: theme.border }}
                  className="p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        color: theme.accent,
                      }}
                      className="px-2.5 py-1 rounded-lg border font-bold uppercase text-[11px]"
                    >
                      {item.preset}
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: theme.text }}>
                        {item.modeType} {item.modeValue ? `(${item.modeValue})` : ''}
                      </div>
                      <div className="text-[10px] flex items-center gap-1 opacity-60" style={{ color: theme.subText }}>
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                      <span className="font-bold text-sm" style={{ color: theme.accent }}>
                        {item.spm}
                      </span>
                      <span className="text-[10px] opacity-60">SPM</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold text-sm" style={{ color: theme.text }}>
                        {item.accuracy}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span className="font-medium" style={{ color: theme.subText }}>
                        {item.avgReactionTimeMs}ms
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
