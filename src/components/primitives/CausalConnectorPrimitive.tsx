'use client';

import React from 'react';
import { CausalConnectorPrimitive } from '../../types/kinetic';
import { getEntityBounds, getEntityVisualState } from '../../lib/engine/sceneGraph';

interface Props {
  entity: CausalConnectorPrimitive;
}

export const CausalConnectorPrimitiveRenderer: React.FC<Props> = ({ entity }) => {
  const {
    id,
    fromEntityId,
    toEntityId,
    fromPoint,
    toPoint,
    label,
    color = '#F59E0B',
    curveOffset = -30,
  } = entity;

  // Retrieve dynamic visual state
  const visualState = getEntityVisualState(id);
  const isDimmed = visualState.isDimmed;
  const drawProgress = Math.max(0, Math.min(1, entity.drawProgress ?? visualState.drawProgress));

  // Determine starting and ending coordinates
  let startX = fromPoint?.x ?? 0;
  let startY = fromPoint?.y ?? 0;
  let endX = toPoint?.x ?? 0;
  let endY = toPoint?.y ?? 0;

  if (fromEntityId) {
    const bounds = getEntityBounds(fromEntityId);
    if (bounds) {
      startX = bounds.x + (bounds.width ? bounds.width / 2 : 0);
      startY = bounds.y;
    }
  }

  if (toEntityId) {
    const bounds = getEntityBounds(toEntityId);
    if (bounds) {
      endX = bounds.x - (bounds.width ? bounds.width / 2 : 0);
      endY = bounds.y;
    }
  }

  // Calculate curve control points
  const dx = endX - startX;
  const dy = endY - startY;
  const dist = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / dist;
  const ny = dx / dist;

  const cp1X = startX + dx * 0.3 + nx * curveOffset;
  const cp1Y = startY + dy * 0.3 + ny * curveOffset;
  const cp2X = startX + dx * 0.7 + nx * curveOffset;
  const cp2Y = startY + dy * 0.7 + ny * curveOffset;

  const pathD = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

  // Evaluate cubic bezier position at t
  const evaluateBezier = (t: number) => {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;

    const x = mt3 * startX + 3 * mt2 * t * cp1X + 3 * mt * t2 * cp2X + t3 * endX;
    const y = mt3 * startY + 3 * mt2 * t * cp1Y + 3 * mt * t2 * cp2Y + t3 * endY;
    return { x, y };
  };

  const leadingParticle = evaluateBezier(drawProgress);
  const midPoint = evaluateBezier(0.5);

  return (
    <div
      id={`connector-${id}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: isDimmed ? 0.18 : 1,
        transition: 'opacity 0.4s ease',
        zIndex: 15,
      }}
    >
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <defs>
          <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </linearGradient>
          <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Origin-centered Coordinate Group */}
        <g transform="translate(2000, 2000)">
          {/* Subtle Background Guide Track */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={1.5}
            strokeDasharray="4 6"
          />

          {/* Animated Shooting Connector Path */}
          <path
            d={pathD}
            fill="none"
            stroke={`url(#grad-${id})`}
            strokeWidth={2.4}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - drawProgress}
            filter={`url(#glow-${id})`}
            style={{
              transition: 'stroke-dashoffset 0.12s linear',
            }}
          />

          {/* Glowing Leading Particle at drawing tip */}
          {drawProgress > 0.02 && drawProgress < 0.99 && (
            <circle
              cx={leadingParticle.x}
              cy={leadingParticle.y}
              r={4.5}
              fill="#FFFFFF"
              filter={`url(#glow-${id})`}
            />
          )}

          {/* Final Destination Arrow Pulse */}
          {drawProgress >= 0.98 && (
            <circle
              cx={endX}
              cy={endY}
              r={3.5}
              fill={color}
              filter={`url(#glow-${id})`}
            />
          )}
        </g>
      </svg>

      {/* Midpoint Label Badge */}
      {label && drawProgress >= 0.35 && (
        <div
          style={{
            position: 'absolute',
            left: `calc(50% + ${midPoint.x}px)`,
            top: `calc(50% + ${midPoint.y}px)`,
            transform: 'translate(-50%, -50%)',
            background: 'rgba(15, 23, 42, 0.88)',
            border: `1px solid ${color}66`,
            boxShadow: `0 0 16px -2px ${color}44`,
            padding: '4px 10px',
            borderRadius: 999,
            color: '#F8FAFC',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.3px',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(8px)',
            opacity: drawProgress > 0.5 ? 1 : (drawProgress - 0.35) / 0.15,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'auto',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
