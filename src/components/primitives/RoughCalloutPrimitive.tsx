'use client';

import React from 'react';
import { RoughCalloutPrimitive } from '../../types/kinetic';

interface Props {
  callouts: RoughCalloutPrimitive[];
  containerWidth: number;
  containerHeight: number;
}

export const RoughCalloutOverlay: React.FC<Props> = ({
  callouts,
  containerWidth,
  containerHeight,
}) => {
  if (!callouts || callouts.length === 0) return null;

  return (
    <svg
      className="rough-callout-overlay"
      viewBox={`0 0 ${containerWidth} ${containerHeight}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 25,
        overflow: 'visible',
      }}
    >
      <defs>
        <filter id="hand-ink-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {callouts.map(callout => {
        const color = callout.color || '#3B82F6';
        const strokeWidth = callout.strokeWidth || 2.4;
        const drawProgress = Math.max(0, Math.min(1, callout.drawProgress ?? 1.0));
        const shape = callout.shape || 'circle';

        // Coordinates
        const cx = callout.toPoint?.x ?? containerWidth / 2;
        const cy = callout.toPoint?.y ?? containerHeight / 2;
        const fromX = callout.fromPoint?.x ?? containerWidth * 0.2;
        const fromY = callout.fromPoint?.y ?? containerHeight * 0.3;

        return (
          <g key={callout.id} id={`callout-${callout.id}`} filter="url(#hand-ink-glow)">
            {/* 1. Organic Hand-Drawn Circle / Ellipse */}
            {shape === 'circle' && (
              <g>
                {/* Primary Stroke with authentic handwriting overshoot */}
                <path
                  d={`M ${cx} ${cy - 34} 
                      C ${cx + 42} ${cy - 34}, ${cx + 44} ${cy + 34}, ${cx} ${cy + 34} 
                      C ${cx - 44} ${cy + 34}, ${cx - 42} ${cy - 34}, ${cx + 8} ${cy - 36}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - drawProgress}
                  style={{ transition: 'stroke-dashoffset 0.08s linear' }}
                />
                {/* Secondary Jittered Sketch Stroke for authentic rough texture */}
                <path
                  d={`M ${cx - 2} ${cy - 33} 
                      C ${cx + 40} ${cy - 36}, ${cx + 46} ${cy + 32}, ${cx - 2} ${cy + 35} 
                      C ${cx - 42} ${cy + 32}, ${cx - 44} ${cy - 32}, ${cx + 5} ${cy - 34}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth * 0.65}
                  strokeOpacity={0.65}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - drawProgress}
                  style={{ transition: 'stroke-dashoffset 0.08s linear' }}
                />
              </g>
            )}

            {/* 2. Organic Underline */}
            {shape === 'underline' && (
              <g>
                <path
                  d={`M ${fromX} ${fromY + 18} Q ${(fromX + cx) / 2} ${fromY + 23}, ${cx} ${fromY + 19}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - drawProgress}
                />
                <path
                  d={`M ${fromX + 4} ${fromY + 20} Q ${(fromX + cx) / 2} ${fromY + 25}, ${cx - 3} ${fromY + 21}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth * 0.6}
                  strokeOpacity={0.6}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - drawProgress}
                />
              </g>
            )}

            {/* 3. Hand-Drawn Arrow */}
            {shape === 'arrow' && (
              <g>
                {/* Shaft */}
                <path
                  d={`M ${fromX} ${fromY} Q ${(fromX + cx) / 2 + 10} ${(fromY + cy) / 2 - 10}, ${cx} ${cy}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - drawProgress}
                />
                {/* Arrow Head (left & right barbs) */}
                {drawProgress > 0.7 && (
                  <path
                    d={`M ${cx - 14} ${cy - 8} L ${cx} ${cy} L ${cx - 8} ${cy + 14}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={(1 - drawProgress) / 0.3}
                  />
                )}
              </g>
            )}

            {/* 4. Hand-Sketched Box */}
            {shape === 'box' && (
              <g>
                <path
                  d={`M ${fromX} ${fromY} 
                      L ${cx} ${fromY + 1} 
                      L ${cx - 1} ${cy} 
                      L ${fromX + 1} ${cy - 1} 
                      Z`}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - drawProgress}
                />
                {/* Sketchy second pass */}
                <path
                  d={`M ${fromX - 2} ${fromY + 2} 
                      L ${cx + 3} ${fromY - 1} 
                      L ${cx + 1} ${cy + 2} 
                      L ${fromX - 1} ${cy - 2} 
                      Z`}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth * 0.55}
                  strokeOpacity={0.6}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - drawProgress}
                />
              </g>
            )}

            {/* 5. Bracket */}
            {shape === 'bracket' && (
              <path
                d={`M ${fromX + 12} ${fromY} L ${fromX} ${fromY} L ${fromX} ${cy} L ${fromX + 12} ${cy}`}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - drawProgress}
              />
            )}

            {/* 6. Strike */}
            {shape === 'strike' && (
              <path
                d={`M ${fromX} ${fromY - 14} L ${cx} ${cy + 14}`}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth + 1}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - drawProgress}
              />
            )}

            {/* Teacher's Annotation Label */}
            {callout.label && drawProgress > 0.4 && (
              <text
                x={cx}
                y={cy - 44}
                fill={color}
                fontSize={12}
                fontWeight={700}
                textAnchor="middle"
                opacity={drawProgress > 0.6 ? 1 : (drawProgress - 0.4) / 0.2}
                style={{
                  fontFamily: 'var(--font-sans, system-ui)',
                  letterSpacing: '0.2px',
                  filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.8))`,
                }}
              >
                {callout.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
