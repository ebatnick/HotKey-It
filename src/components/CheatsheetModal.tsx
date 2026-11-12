import React, { useState } from 'react';
import { X, Search, BookOpen } from 'lucide-react';
import { PresetId, OSMode, ThemeColors, ShortcutDefinition } from '../types';
import { SHORTCUTS_DATA, PRESET_INFOS } from '../data/presets';
import { getSymbolForDisplay } from '../utils/engine';

interface CheatsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: PresetId;
  os: OSMode;
  theme: ThemeColors;
}

export const CheatsheetModal: React.FC<CheatsheetModalProps> = ({
  isOpen,
  onClose,
  preset,
  os,
  theme,
}) => {
  const [search, setSearch] = useState('');
  const [activePreset, setActivePreset] = useState<PresetId>(preset);

  if (!isOpen) return null;

  const currentPresetsShortcuts = SHORTCUTS_DATA[activePreset] || [];
  const filtered = currentPresetsShortcuts.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
        }}
        className="w-full max-w-2xl max-h-[85vh] rounded-3xl border flex flex-col shadow-2xl overflow-hidden font-mono"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5" style={{ color: theme.accent }} />
            <div>
              <h2 className="text-base font-bold" style={{ color: theme.text }}>
                Shortcut Cheatsheet
              </h2>
              <p className="text-xs font-sans" style={{ color: theme.subText }}>
                Master reference for professional keyboard bindings
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-800/60 transition-colors"
            style={{ color: theme.subText }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Switcher & Search Bar */}
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-1 overflow-x-auto">
            {PRESET_INFOS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePreset(p.id)}
                style={{
                  backgroundColor: activePreset === p.id ? theme.accent : theme.keyBg,
                  color: activePreset === p.id ? theme.keyActiveText : theme.subText,
                  borderColor: theme.border,
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
              >
                {p.name}
              </button>
            ))}
          </div>

          <div
            style={{ backgroundColor: theme.keyBg, borderColor: theme.border }}
            className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border"
          >
            <Search className="w-3.5 h-3.5" style={{ color: theme.subText }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter shortcuts..."
              className="bg-transparent border-none outline-none text-xs w-full font-mono placeholder:text-zinc-600"
              style={{ color: theme.text }}
            />
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-60" style={{ color: theme.subText }}>
              No shortcuts found matching &quot;{search}&quot;
            </div>
          ) : (
            filtered.map(item => {
              const keys = os === 'mac' ? item.keys.mac : item.keys.win;
              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: theme.keyBg,
                    borderColor: theme.border,
                  }}
                  className="p-3 rounded-2xl border flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs" style={{ color: theme.text }}>
                        {item.name}
                      </span>
                      <span
                        style={{
                          backgroundColor: `${theme.accent}15`,
                          color: theme.accent,
                        }}
                        className="text-[10px] px-2 py-0.5 rounded uppercase font-semibold"
                      >
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] font-sans mt-0.5" style={{ color: theme.subText }}>
                      {item.description}
                    </p>
                  </div>

                  {/* Key Combo Display */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {keys.map((k, i) => (
                      <kbd
                        key={`${item.id}-${k}-${i}`}
                        style={{
                          backgroundColor: theme.surface,
                          borderColor: theme.keyBorder,
                          color: theme.text,
                        }}
                        className="min-w-[28px] h-7 px-2 rounded-lg border flex items-center justify-center text-xs font-bold shadow-sm"
                      >
                        {getSymbolForDisplay(k, os)}
                      </kbd>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
