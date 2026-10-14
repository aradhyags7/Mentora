'use client';

import React from 'react';
import { InvestigationNodePrimitive } from '../../types/kinetic';
import { getEntityVisualState } from '../../lib/engine/sceneGraph';

interface Props {
  entity: InvestigationNodePrimitive;
  onClick?: () => void;
}

export const InvestigationNodePrimitiveRenderer: React.FC<Props> = ({ entity, onClick }) => {
  const {
    id,
    title,
    subtitle,
    categoryBadge,
    metricLabel,
    metricValue,
    accentColor = '#38BDF8',
    position = { x: 0, y: 0 },
    width = 280,
    height = 140,
  } = entity;

  // Retrieve dynamic visual state (spotlight dimming & stroke reveal)
  const visualState = getEntityVisualState(id);
  const isDimmed = entity.isDimmed ?? visualState.isDimmed;
  const isFocused = entity.isFocused ?? visualState.isFocused;
  const drawProgress = entity.drawProgress ?? visualState.drawProgress;

  // Perimeter for SVG border tracing animation
  const perimeter = 2 * (width + height);
  const strokeOffset = perimeter * (1 - Math.max(0, Math.min(1, drawProgress)));

  return (
    <div
      id={`node-${id}`}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `calc(50% + ${position.x}px - ${width / 2}px)`,
        top: `calc(50% + ${position.y}px - ${height / 2}px)`,
        width,
        minHeight: height,
        borderRadius: 12,
        background: 'rgba(11, 15, 25, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isFocused
          ? `0 0 35px -5px ${accentColor}66, 0 14px 28px -6px rgba(0, 0, 0, 0.7)`
          : '0 8px 24px -4px rgba(0, 0, 0, 0.6)',
        opacity: isDimmed ? 0.18 : 1,
        transform: isDimmed ? 'scale(0.97)' : isFocused ? 'scale(1.02)' : 'scale(1.0)',
        transition: 'opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease',
        cursor: onClick ? 'pointer' : 'default',
        zIndex: isFocused ? 20 : 10,
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Animated SVG Border Trace */}
      {drawProgress < 1 && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <rect
            x={1}
            y={1}
            width={width - 2}
            height={height - 2}
            rx={11}
            fill="none"
            stroke={accentColor}
            strokeWidth={2}
            strokeDasharray={perimeter}
            strokeDashoffset={strokeOffset}
            style={{
              transition: 'stroke-dashoffset 0.1s linear',
              filter: `drop-shadow(0 0 6px ${accentColor})`,
            }}
          />
        </svg>
      )}

      {/* Top Accent Glow Bar */}
      <div
        style={{
          width: '100%',
          height: 3,
          background: accentColor,
          boxShadow: `0 0 12px ${accentColor}`,
        }}
      />

      {/* Content Container */}
      <div
        style={{
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          opacity: drawProgress > 0.15 ? 1 : drawProgress * 6.6,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Category Tracking Badge */}
        {categoryBadge && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: accentColor,
                boxShadow: `0 0 6px ${accentColor}`,
              }}
            />
            <span>{categoryBadge}</span>
          </div>
        )}

        {/* Title */}
        <h4
          style={{
            margin: 0,
            fontSize: 14.5,
            fontWeight: 650,
            color: '#F8FAFC',
            lineHeight: 1.3,
            letterSpacing: '-0.2px',
          }}
        >
          {title}
        </h4>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: '#94A3B8',
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Live Telemetry Metric Pill */}
        {(metricLabel || metricValue) && (
          <div
            style={{
              marginTop: 4,
              padding: '6px 10px',
              borderRadius: 6,
              background: 'rgba(2, 6, 23, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 11.5,
            }}
          >
            <span style={{ color: '#64748B', fontWeight: 500 }}>{metricLabel}</span>
            <span
              style={{
                color: accentColor,
                fontFamily: 'monospace',
                fontWeight: 600,
              }}
            >
              {metricValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
