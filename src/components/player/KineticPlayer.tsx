'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  KineticTimeline, 
  TutorRuntimeState, 
  InterruptSnapshot, 
  DoubtResolutionResponse 
} from '../../types/kinetic';
import { evaluateSceneAtTime } from '../../lib/engine/evaluator';
import { CameraViewport } from './CameraViewport';
import { RoughCalloutOverlay } from '../primitives/RoughCalloutPrimitive';
import { SubtitleOverlay } from './SubtitleOverlay';
import { ScrubberBar } from './ScrubberBar';
import { PrimitiveRenderer } from '../primitives/PrimitiveRenderer';
import { DoubtInterruptBar } from './DoubtInterruptBar';
import { 
  SyncedSpeechController, 
  alignTimelineTriggersWithNarration, 
  globalSpeechController 
} from '../../lib/audio/syncedSpeechEngine';
import { useVoiceBargeIn } from '../../lib/audio/useVoiceBargeIn';
import { spliceDoubtIntoTimeline } from '../../lib/engine/timelineSplicer';
import { Volume2, VolumeX } from 'lucide-react';
import '../../styles/player.css';

interface Props {
  timeline: KineticTimeline;
  autoPlay?: boolean;
  showHeader?: boolean;
  onTimelineChange?: (updatedTimeline: KineticTimeline) => void;
  onDoubtStateChange?: (state: TutorRuntimeState) => void;
}

export const KineticPlayer: React.FC<Props> = ({ 
  timeline: initialTimeline, 
  autoPlay = false, 
  showHeader = false,
  onTimelineChange,
  onDoubtStateChange,
}) => {
  // Splicable active timeline state (pre-aligned with trigger phrases)
  const [timeline, setTimeline] = useState<KineticTimeline>(() => 
    alignTimelineTriggersWithNarration(initialTimeline)
  );

  // Sync when prop timeline changes externally
  useEffect(() => {
    setTimeline(alignTimelineTriggersWithNarration(initialTimeline));
  }, [initialTimeline]);

  const [timeMs, setTimeMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [voiceBargeInEnabled, setVoiceBargeInEnabled] = useState(true);

  // Real-time tutor states & interruption snapshot
  const [tutorState, setTutorState] = useState<TutorRuntimeState>(
    autoPlay ? 'SPEAKING_AND_DRAWING' : 'IDLE'
  );
  const [snapshot, setSnapshot] = useState<InterruptSnapshot | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isResolvingDoubt, setIsResolvingDoubt] = useState(false);
  const [syncedWordIndex, setSyncedWordIndex] = useState(0);

  const lastFrameTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 840, height: 440 });
  const activeCueIdRef = useRef<string | null>(null);

  // Notify parent of tutor state changes
  useEffect(() => {
    onDoubtStateChange?.(tutorState);
  }, [tutorState, onDoubtStateChange]);

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

  // Connect word boundary tracking to subtitle overlay
  useEffect(() => {
    globalSpeechController.setCallbacks(
      (wordIdx) => {
        setSyncedWordIndex(wordIdx);
      },
      () => {
        // Cue ended
      }
    );
  }, []);

  // Manage speech playback in lockstep with visual timeline cues
  useEffect(() => {
    if (isPlaying && tutorState === 'SPEAKING_AND_DRAWING') {
      const activeCue = frameState.activeCue;
      if (activeCue && activeCue.id !== activeCueIdRef.current) {
        activeCueIdRef.current = activeCue.id;
        const offsetSec = Math.max(0, (timeMs - (activeCue.timestampMs || 0)) / 1000);
        globalSpeechController.speakCue(activeCue, offsetSec);
      }
    } else {
      activeCueIdRef.current = null;
    }
  }, [isPlaying, tutorState, frameState.activeCue?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
        setTutorState('IDLE');
        globalSpeechController.stop();
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
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setTutorState('IDLE');
      globalSpeechController.pause();
    } else {
      setIsPlaying(true);
      setTutorState('SPEAKING_AND_DRAWING');
      if (frameState.activeCue) {
        const offsetSec = Math.max(0, (timeMs - (frameState.activeCue.timestampMs || 0)) / 1000);
        globalSpeechController.speakCue(frameState.activeCue, offsetSec);
      }
    }
  };

  const seek = (targetMs: number) => {
    const clamped = Math.max(0, Math.min(timeline.totalDurationMs, targetMs));
    setTimeMs(clamped);
    if (isPlaying && frameState.activeCue) {
      const offsetSec = Math.max(0, (clamped - (frameState.activeCue.timestampMs || 0)) / 1000);
      globalSpeechController.speakCue(frameState.activeCue, offsetSec);
    }
  };

  const stepOffset = (deltaMs: number) => seek(timeMs + deltaMs);

  const restart = () => {
    setTimeMs(0);
    setIsPlaying(true);
    setTutorState('SPEAKING_AND_DRAWING');
    activeCueIdRef.current = null;
  };

  const toggleMute = () => {
    const next = !isVoiceMuted;
    setIsVoiceMuted(next);
    globalSpeechController.setMuted(next);
  };

  // Instant Barge-In Interruption Handler (<15ms latency)
  const triggerInterrupt = useCallback(() => {
    setIsPlaying(false);
    const snap = globalSpeechController.interruptNow(
      timeline,
      timeMs / 1000,
      {
        panX: frameState.camera.x,
        panY: frameState.camera.y,
        zoom: frameState.camera.zoom,
      }
    );
    setSnapshot(snap);
    setTutorState('PAUSED_FOR_DOUBT');
  }, [timeline, timeMs, frameState.camera]);

  // Handle Voice Barge-In via hook
  useVoiceBargeIn({
    enabled: voiceBargeInEnabled,
    tutorState,
    onBargeInTriggered: () => {
      triggerInterrupt();
    },
    onDoubtTranscriptChange: (text) => {
      setLiveTranscript(text);
    },
    onDoubtFinalized: (doubt) => {
      handleDoubtSubmit(doubt);
    },
  });

  // Submit Doubt to /api/doubt and splice resolution directly into timeline
  const handleDoubtSubmit = async (doubtText: string) => {
    if (!snapshot || !doubtText.trim()) return;

    setIsResolvingDoubt(true);
    setTutorState('REPLANNING_DOUBT');

    try {
      const res = await fetch('/api/doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeline,
          snapshot,
          studentDoubt: doubtText.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.resolution) {
          const resolution: DoubtResolutionResponse = data.resolution;
          const { updatedTimeline, resumeTime } = spliceDoubtIntoTimeline(
            timeline,
            snapshot,
            resolution
          );

          setTimeline(updatedTimeline);
          onTimelineChange?.(updatedTimeline);

          // Seek directly to resume point and begin playing visual explanation
          const resumeMs = Math.round(resumeTime * 1000);
          setTimeMs(resumeMs);
          setSnapshot(null);
          setLiveTranscript('');
          setTutorState('SPEAKING_AND_DRAWING');
          setIsPlaying(true);

          // Trigger speech for newly spliced doubt cue
          activeCueIdRef.current = null;
          return;
        }
      }
    } catch (err) {
      console.warn('Doubt resolution request failed:', err);
    } finally {
      setIsResolvingDoubt(false);
    }
  };

  const resumeAfterPause = () => {
    setSnapshot(null);
    setLiveTranscript('');
    setTutorState('SPEAKING_AND_DRAWING');
    setIsPlaying(true);
    if (frameState.activeCue) {
      const offsetSec = Math.max(0, (timeMs - (frameState.activeCue.timestampMs || 0)) / 1000);
      globalSpeechController.speakCue(frameState.activeCue, offsetSec);
    }
  };

  const entityList = Object.values(frameState.entities);

  return (
    <div className="kinetic-player-root flex flex-col gap-2" ref={containerRef}>
      {/* Optional Header */}
      {showHeader && (
        <div className="player-header">
          <div className="player-title-box">
            <span className="player-concept-badge">{timeline.concept || 'Concept'}</span>
            <h2 className="player-title">{timeline.title}</h2>
          </div>
        </div>
      )}

      {/* Floating Doubt & Barge-in Control Bar */}
      <DoubtInterruptBar
        tutorState={tutorState}
        snapshot={snapshot}
        liveTranscript={liveTranscript}
        voiceBargeInEnabled={voiceBargeInEnabled}
        onToggleVoiceBargeIn={() => setVoiceBargeInEnabled(prev => !prev)}
        onTriggerInterrupt={triggerInterrupt}
        onSubmitDoubt={handleDoubtSubmit}
        onResume={resumeAfterPause}
        isResolving={isResolvingDoubt}
      />

      {/* Viewport Stage */}
      <div className="player-viewport-stage relative overflow-hidden rounded-xl border border-slate-800 bg-[#0B0F19]">
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

        {/* Real-time Subtitle Karaoke Bar */}
        <SubtitleOverlay
          activeCue={frameState.activeCue}
          activeWordIndex={syncedWordIndex || frameState.activeWordIndex}
        />
      </div>

      {/* Scrubber & Controls Footer */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
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

        {/* Quick Voice Mute Toggle */}
        <button
          type="button"
          onClick={toggleMute}
          title={isVoiceMuted ? 'Voice Muted (Click to Unmute)' : 'Voice Audio Active (Click to Mute)'}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
            isVoiceMuted
              ? 'border-red-500/40 bg-red-500/10 text-red-400'
              : 'border-slate-800 bg-[#0B0F19]/90 text-slate-300 hover:text-white'
          }`}
        >
          {isVoiceMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>
    </div>
  );
};
