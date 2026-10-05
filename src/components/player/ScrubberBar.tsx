'use client';

import React, { useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, Rewind } from 'lucide-react';
import { TimelineCue } from '../../types/kinetic';

interface Props {
  timeMs: number;
  totalDurationMs: number;
  progress: number;
  isPlaying: boolean;
  playbackSpeed: number;
  cues: TimelineCue[];
  onTogglePlay: () => void;
  onSeek: (targetMs: number) => void;
  onSpeedChange: (speed: number) => void;
  onStepOffset: (deltaMs: number) => void;
  onRestart: () => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export const ScrubberBar: React.FC<Props> = ({
  timeMs,
  totalDurationMs,
  progress,
  isPlaying,
  playbackSpeed,
  cues,
  onTogglePlay,
  onSeek,
  onSpeedChange,
  onStepOffset,
  onRestart,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percentage * totalDurationMs);
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    onSpeedChange(speeds[nextIdx]);
  };

  return (
    <div className="player-controls-footer">
      {/* Scrubber Progress Track */}
      <div
        ref={trackRef}
        className="scrubber-track-container"
        onClick={handleTrackClick}
      >
        <div className="scrubber-track-bg">
          {/* Fill bar */}
          <div
            className="scrubber-fill-bar"
            style={{ width: `${progress * 100}%` }}
          />

          {/* Cue Tick Markers */}
          {cues.map(cue => {
            const cuePercent = (cue.timestampMs / totalDurationMs) * 100;
            return (
              <div
                key={cue.id}
                className="scrubber-cue-dot"
                style={{ left: `${cuePercent}%` }}
                title={`${formatTime(cue.timestampMs)}: ${cue.narration.slice(0, 40)}...`}
                onClick={e => {
                  e.stopPropagation();
                  onSeek(cue.timestampMs);
                }}
              />
            );
          })}

          {/* Thumb Handle */}
          <div
            className="scrubber-thumb-handle"
            style={{ left: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Buttons row */}
      <div className="player-buttons-row">
        <div className="buttons-left-group">
          {/* Play / Pause */}
          <button
            className="ctrl-btn primary"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Step -5s */}
          <button
            className="ctrl-btn"
            onClick={() => onStepOffset(-5000)}
            aria-label="Rewind 5 seconds"
          >
            <Rewind size={15} />
          </button>

          {/* Step +5s */}
          <button
            className="ctrl-btn"
            onClick={() => onStepOffset(5000)}
            aria-label="Fast forward 5 seconds"
          >
            <FastForward size={15} />
          </button>

          {/* Restart */}
          <button
            className="ctrl-btn"
            onClick={onRestart}
            aria-label="Restart"
          >
            <RotateCcw size={14} />
          </button>

          {/* Time Counter */}
          <span className="time-counter">
            {formatTime(timeMs)} / {formatTime(totalDurationMs)}
          </span>
        </div>

        <div className="buttons-right-group">
          {/* Playback Speed */}
          <button
            className="speed-badge"
            onClick={cycleSpeed}
            title="Change Playback Speed"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>
    </div>
  );
};
