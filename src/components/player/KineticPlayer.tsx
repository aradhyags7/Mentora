'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { KineticTimeline } from '../../types/kinetic';
import { evaluateSceneAtTime } from '../../lib/engine/evaluator';
import { CameraViewport } from './CameraViewport';
import { RoughCalloutOverlay } from '../primitives/RoughCalloutPrimitive';
import { SubtitleOverlay } from './SubtitleOverlay';
import { ScrubberBar } from './ScrubberBar';
import { PrimitiveRenderer } from '../primitives/PrimitiveRenderer';
import '../../styles/player.css';

interface Props {
  timeline: KineticTimeline;
  autoPlay?: boolean;
}

export const KineticPlayer: React.FC<Props> = ({ timeline, autoPlay = false }) => {
  const [timeMs, setTimeMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const lastFrameTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 840, height: 440 });

  // Update container dimensions
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setStageDimensions({ width: rect.width || 840, height: 440 });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Pure deterministic scene evaluation: SceneFrameState = f(timeline, timeMs)
  const frameState = useMemo(() => {
    return evaluateSceneAtTime(timeline, timeMs);
  }, [timeline, timeMs]);

  // High-performance 60 FPS animation loop
  const loop = useCallback((now: number) => {
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = now;
    }
    const delta = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;

    setTimeMs(prevTime => {
      const nextTime = prevTime + delta * playbackSpeed;
      if (nextTime >= timeline.totalDurationMs) {
        setIsPlaying(false);
        return timeline.totalDurationMs;
      }
      return nextTime;
    });

    animFrameIdRef.current = requestAnimationFrame(loop);
  }, [playbackSpeed, timeline.totalDurationMs]);

  useEffect(() => {
    if (isPlaying) {
      lastFrameTimeRef.current = performance.now();
      animFrameIdRef.current = requestAnimationFrame(loop);
    } else {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      lastFrameTimeRef.current = null;
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, loop]);

  // Controls
  const togglePlay = () => setIsPlaying(p => !p);
  const seek = (targetMs: number) => {
    const clamped = Math.max(0, Math.min(timeline.totalDurationMs, targetMs));
    setTimeMs(clamped);
  };
  const stepOffset = (deltaMs: number) => seek(timeMs + deltaMs);
  const restart = () => {
    setTimeMs(0);
    setIsPlaying(true);
  };

  const entityList = Object.values(frameState.entities);

  return (
    <div className="kinetic-player-root" ref={containerRef}>
      {/* Header */}
      <div className="player-header">
        <div className="player-title-box">
          <span className="player-concept-badge">{timeline.concept || 'Concept'}</span>
          <h2 className="player-title">{timeline.title}</h2>
        </div>
      </div>

      {/* Viewport Stage */}
      <div className="player-viewport-stage">
        <div className="viewport-grid-bg" />

        {/* Camera-transformed Scene Graph */}
        <CameraViewport camera={frameState.camera}>
          <div className="scene-layout-stack">
            {entityList.map(entity => (
              <PrimitiveRenderer key={entity.id} entity={entity} />
            ))}
          </div>
        </CameraViewport>

        {/* Hand-drawn RoughJS Callout Overlay */}
        <RoughCalloutOverlay
          callouts={frameState.activeCallouts}
          containerWidth={stageDimensions.width}
          containerHeight={stageDimensions.height}
        />

        {/* Subtitle Karaoke Bar */}
        <SubtitleOverlay
          activeCue={frameState.activeCue}
          activeWordIndex={frameState.activeWordIndex}
        />
      </div>

      {/* Scrubber & Controls */}
      <ScrubberBar
        timeMs={timeMs}
        totalDurationMs={timeline.totalDurationMs}
        progress={frameState.progress}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        cues={timeline.cues}
        onTogglePlay={togglePlay}
        onSeek={seek}
        onSpeedChange={setPlaybackSpeed}
        onStepOffset={stepOffset}
        onRestart={restart}
      />
    </div>
  );
};
