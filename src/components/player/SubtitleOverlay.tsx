'use client';

import React from 'react';
import { TimelineCue } from '../../types/kinetic';

interface Props {
  activeCue: TimelineCue | null;
  activeWordIndex: number;
}

export const SubtitleOverlay: React.FC<Props> = ({ activeCue, activeWordIndex }) => {
  if (!activeCue || !activeCue.narration) return null;

  const words = activeCue.words && activeCue.words.length > 0
    ? activeCue.words
    : activeCue.narration.split(/\s+/).map((w, i) => ({ word: w, startOffsetMs: i * 300, endOffsetMs: (i + 1) * 300 }));

  return (
    <div className="player-subtitle-dock">
      {words.map((item, idx) => {
        const isActive = idx === activeWordIndex;
        return (
          <span
            key={idx}
            className={`subtitle-word ${isActive ? 'active' : ''}`}
          >
            {item.word}
          </span>
        );
      })}
    </div>
  );
};
