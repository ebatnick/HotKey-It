import React from 'react';
import { ActiveChordState, OSMode, ThemeColors } from '../types';

interface ChordVisualizerProps {
  chord: ActiveChordState;
  os: OSMode;
  theme: ThemeColors;
}

export const ChordVisualizer: React.FC<ChordVisualizerProps> = ({ chord, os, theme }) => {
  const metaLabel = os === 'mac' ? 'cmd' : 'win';
  const ctrlLabel = 'ctrl';
  const altLabel = os === 'mac' ? 'opt' : 'alt';
  const shiftLabel = 'shift';

  const modifiers = [
    { id: 'ctrl', label: ctrlLabel, active: chord.ctrl },
    { id: 'alt', label: altLabel, active: chord.alt },
    { id: 'shift', label: shiftLabel, active: chord.shift },
    { id: 'meta', label: metaLabel, active: chord.meta },
  ];

  const anyHeld = chord.ctrl || chord.alt || chord.shift || chord.meta || chord.key;

  return (
    <div className="flex items-center gap-2 select-none font-mono text-xs transition-opacity duration-150">
      <div className="flex items-center gap-3 px-3 py-1">
        {modifiers.map(mod => {
          const isActive = mod.active;
          return (
            <span
              key={mod.id}
              style={{
                color: isActive ? theme.accent : theme.subText,
                fontWeight: isActive ? '700' : '400',
                opacity: isActive ? 1 : 0.45,
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                textShadow: isActive ? `0 0 12px ${theme.accent}88` : 'none',
              }}
              className="transition-all duration-100 uppercase text-[11px] tracking-wide"
            >
              {mod.label}
            </span>
          );
        })}

        {/* Current pressed action key if any */}
        {chord.key && (
          <span
            style={{
              color: theme.accent,
              textShadow: `0 0 14px ${theme.accent}`,
            }}
            className="font-bold text-xs uppercase underline underline-offset-4 animate-pulse ml-1"
          >
            + {chord.key}
          </span>
        )}
      </div>
    </div>
  );
};
