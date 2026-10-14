'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CameraState } from '../../types/kinetic';
import { Crosshair, RotateCcw } from 'lucide-react';

interface Props {
  camera: CameraState;
  children: React.ReactNode;
  onUserInteract?: () => void;
  onResetCamera?: () => void;
  spotlightActive?: boolean;
  spotlightIntensity?: number;
}

export const CameraViewport: React.FC<Props> = ({
  camera,
  children,
  onUserInteract,
  onResetCamera,
  spotlightActive,
  spotlightIntensity,
}) => {
  // Manual user pan & zoom override states
  const [manualOffset, setManualOffset] = useState({ x: 0, y: 0 });
  const [manualZoomFactor, setManualZoomFactor] = useState(1.0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const isManuallyAdjusted =
    Math.abs(manualOffset.x) > 5 ||
    Math.abs(manualOffset.y) > 5 ||
    Math.abs(manualZoomFactor - 1.0) > 0.05;

  // Effective camera coordinates
  const timelinePanX = camera.x ?? 0;
  const timelinePanY = camera.y ?? 0;
  const timelineZoom = camera.zoom ?? 1.0;

  const effectivePanX = timelinePanX + manualOffset.x;
  const effectivePanY = timelinePanY + manualOffset.y;
  const effectiveZoom = Math.max(0.25, Math.min(3.5, timelineZoom * manualZoomFactor));

  // Spotlight intensity determination
  const hasFocus = Boolean(camera.focusEntityIds && camera.focusEntityIds.length > 0);
  const isSpotlight = spotlightActive ?? hasFocus;
  const rawIntensity = spotlightIntensity ?? (camera.spotlightIntensity ?? (hasFocus ? 0.8 : 0));
  const effectiveIntensity = isSpotlight ? rawIntensity : 0;

  // Reset manual camera override
  const handleRecenter = useCallback(() => {
    setManualOffset({ x: 0, y: 0 });
    setManualZoomFactor(1.0);
    onResetCamera?.();
  }, [onResetCamera]);

  // Mouse drag handlers for manual pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only drag on left click and if target is the background/canvas
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, input, select, textarea, a, .interactive-control');
    if (isInteractive) return;

    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = (e.clientX - dragStartRef.current.x) / effectiveZoom;
      const dy = (e.clientY - dragStartRef.current.y) / effectiveZoom;
      dragStartRef.current = { x: e.clientX, y: e.clientY };

      setManualOffset(prev => ({
        x: prev.x - dx,
        y: prev.y - dy,
      }));
      onUserInteract?.();
    },
    [effectiveZoom, onUserInteract]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // Wheel handler for zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Zoom with ctrl + wheel, or standard wheel when hovering over canvas
      const zoomDelta = e.deltaY < 0 ? 1.06 : 0.94;
      setManualZoomFactor(prev => {
        const next = Math.max(0.3, Math.min(3.0, prev * zoomDelta));
        return next;
      });
      onUserInteract?.();
    },
    [onUserInteract]
  );

  // Global mouseup listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Calculate parallax offsets for blueprint grid patterns
  const fineGridOffsetX = ((-effectivePanX * 0.4) % 40 + 40) % 40;
  const fineGridOffsetY = ((-effectivePanY * 0.4) % 40 + 40) % 40;
  const majorGridOffsetX = ((-effectivePanX * 0.7) % 200 + 200) % 200;
  const majorGridOffsetY = ((-effectivePanY * 0.7) % 200 + 200) % 200;

  return (
    <div
      ref={viewportRef}
      className="kinetic-infinite-viewport"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#05070D',
        cursor: isDraggingRef.current ? 'grabbing' : 'default',
        userSelect: 'none',
      }}
    >
      {/* 3B1B Obsidian Void & Parallax Blueprint Grid Layer */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <defs>
          {/* Subtle 40px Fine Grid at 3.5% Opacity */}
          <pattern
            id="fine-grid-pattern"
            width={40}
            height={40}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${fineGridOffsetX}, ${fineGridOffsetY})`}
          >
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.035)" strokeWidth={1} />
          </pattern>

          {/* 200px Major Blueprint Grid with Precision Crosshairs at 7.5% Opacity */}
          <pattern
            id="major-grid-pattern"
            width={200}
            height={200}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${majorGridOffsetX}, ${majorGridOffsetY})`}
          >
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(56, 189, 248, 0.075)" strokeWidth={1.5} />
            {/* Center crosshair */}
            <path
              d="M 94 100 L 106 100 M 100 94 L 100 106"
              fill="none"
              stroke="rgba(56, 189, 248, 0.12)"
              strokeWidth={1}
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#fine-grid-pattern)" />
        <rect width="100%" height="100%" fill="url(#major-grid-pattern)" />
      </svg>

      {/* 4000x4000 Infinite Coordinate Plane Container */}
      <div
        className="kinetic-camera-matrix-stage"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 4000,
          height: 4000,
          marginLeft: -2000,
          marginTop: -2000,
          transform: `translate3d(${-effectivePanX}px, ${-effectivePanY}px, 0) scale(${effectiveZoom})`,
          transformOrigin: 'center center',
          willChange: 'transform',
          transition: isDraggingRef.current ? 'none' : 'transform 0.08s linear',
          zIndex: 2,
        }}
      >
        {children}
      </div>

      {/* Documentary Spotlight Vignette Overlay */}
      <div
        className="documentary-spotlight-vignette"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          background: `radial-gradient(circle at 50% 50%, transparent 40%, rgba(2, 4, 10, ${
            0.65 + effectiveIntensity * 0.28
          }) 100%)`,
          opacity: effectiveIntensity > 0 ? 1 : 0.6,
          transition: 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          zIndex: 8,
        }}
      />

      {/* Floating Recenter Camera Pill */}
      {isManuallyAdjusted && (
        <button
          type="button"
          onClick={handleRecenter}
          className="recenter-camera-pill"
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 999,
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.6)',
            color: '#38BDF8',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            zIndex: 30,
            transition: 'all 0.2s ease',
          }}
          title="Recenter camera to AI director position"
        >
          <RotateCcw size={13} />
          <span>Recenter Camera</span>
        </button>
      )}
    </div>
  );
};
