'use client';

import React, { useMemo } from 'react';
import { CoordinateGraphPrimitive } from '../../types/kinetic';
import { getEntityVisualState } from '../../lib/engine/sceneGraph';

interface Props {
  entity: CoordinateGraphPrimitive;
  width?: number;
  height?: number;
}

export const CoordinateGraphPrimitiveRenderer: React.FC<Props> = ({
  entity,
  width = 480,
  height = 290,
}) => {
  const {
    id,
    title = 'Geometric Coordinate Stage',
    fnLatex = '0.25x^2',
    rangeX = [-1, 6],
    rangeY = [-1, 8],
    tangentAtX = 2.0,
    secantBetween = [2.0, 3.8],
    points = [],
    position,
  } = entity;

  // Retrieve dynamic visual state
  const visualState = getEntityVisualState(id);
  const isDimmed = visualState.isDimmed;
  const drawProgress = Math.max(0, Math.min(1, entity.drawProgress ?? visualState.drawProgress));

  // Timeline sub-progress stages
  const axisProgress = Math.min(1, drawProgress / 0.35);
  const curveProgress = drawProgress < 0.35 ? 0 : Math.min(1, (drawProgress - 0.35) / 0.45);
  const vectorProgress = drawProgress < 0.8 ? 0 : Math.min(1, (drawProgress - 0.8) / 0.2);

  // Coordinate screen mapping
  const pad = 36;
  const [minX, maxX] = rangeX;
  const [minY, maxY] = rangeY;

  const toScreenX = (x: number) => pad + ((x - minX) / (maxX - minX)) * (width - 2 * pad);
  const toScreenY = (y: number) => height - pad - ((y - minY) / (maxY - minY)) * (height - 2 * pad);

  // Mathematical function evaluator
  const evalFn = (x: number) => {
    if (fnLatex.includes('x^2')) return 0.25 * x * x;
    if (fnLatex.includes('x^3')) return 0.1 * x * x * x;
    if (fnLatex.includes('sin')) return 2.5 * Math.sin(x) + 2;
    return 0.25 * x * x;
  };

  // Derivative evaluator for tangent lines
  const evalDeriv = (x: number) => {
    const h = 0.0001;
    return (evalFn(x + h) - evalFn(x - h)) / (2 * h);
  };

  // Generate SVG path string for f(x)
  const curvePath = useMemo(() => {
    const steps = 80;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const x = minX + (i / steps) * (maxX - minX);
      const y = evalFn(x);
      const sx = toScreenX(x);
      const sy = toScreenY(y);
      d += i === 0 ? `M ${sx.toFixed(1)} ${sy.toFixed(1)}` : ` L ${sx.toFixed(1)} ${sy.toFixed(1)}`;
    }
    return d;
  }, [minX, maxX, minY, maxY, width, height, fnLatex]);

  // Points for Secant & Tangent
  const x0 = tangentAtX !== undefined ? tangentAtX : 2.0;
  const y0 = evalFn(x0);
  const sx0 = toScreenX(x0);
  const sy0 = toScreenY(y0);

  const x1 = secantBetween ? secantBetween[1] : 3.8;
  const y1 = evalFn(x1);
  const sx1 = toScreenX(x1);
  const sy1 = toScreenY(y1);

  const tangentSlope = evalDeriv(x0);
  const secantSlope = (y1 - y0) / (x1 - x0);

  // Tangent line endpoints
  const tanSpan = 2.2;
  const tanSxStart = toScreenX(x0 - tanSpan);
  const tanSyStart = toScreenY(y0 - tangentSlope * tanSpan);
  const tanSxEnd = toScreenX(x0 + tanSpan);
  const tanSyEnd = toScreenY(y0 + tangentSlope * tanSpan);

  // Origin point
  const originX = toScreenX(0);
  const originY = toScreenY(0);

  return (
    <div
      id={`graph-${id}`}
      style={{
        position: position ? 'absolute' : 'relative',
        left: position ? `calc(50% + ${position.x}px)` : undefined,
        top: position ? `calc(50% + ${position.y}px)` : undefined,
        transform: position ? 'translate(-50%, -50%)' : undefined,
        background: 'rgba(11, 15, 25, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        padding: 14,
        boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.7)',
        opacity: isDimmed ? 0.18 : 1,
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        zIndex: 10,
        width,
        userSelect: 'none',
      }}
    >
      {/* Title & Mathematical Invariant Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
          fontSize: 12,
        }}
      >
        <span style={{ fontWeight: 650, color: '#F8FAFC' }}>{title}</span>
        <span style={{ fontFamily: 'monospace', color: '#38BDF8', fontSize: 11 }}>
          f(x) = {fnLatex}
        </span>
      </div>

      {/* SVG Coordinate Stage */}
      <svg
        width={width}
        height={height}
        style={{
          display: 'block',
          background: 'rgba(2, 6, 23, 0.85)',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.04)',
          overflow: 'hidden',
        }}
      >
        <defs>
          <filter id={`glow-curve-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id={`glow-tangent-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Axis & Grid Construction (0.0 -> 0.35) */}
        {axisProgress > 0 && (
          <g opacity={axisProgress}>
            {/* Grid Lines */}
            {Array.from({ length: Math.floor(maxX - minX) + 1 }).map((_, i) => {
              const gx = minX + i;
              const sx = toScreenX(gx);
              return (
                <line
                  key={`gx-${i}`}
                  x1={sx}
                  y1={pad}
                  x2={sx}
                  y2={height - pad}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth={1}
                />
              );
            })}
            {Array.from({ length: Math.floor(maxY - minY) + 1 }).map((_, i) => {
              const gy = minY + i;
              const sy = toScreenY(gy);
              return (
                <line
                  key={`gy-${i}`}
                  x1={pad}
                  y1={sy}
                  x2={width - pad}
                  y2={sy}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth={1}
                />
              );
            })}

            {/* X-Axis */}
            <line
              x1={pad}
              y1={originY}
              x2={width - pad}
              y2={originY}
              stroke="rgba(255, 255, 255, 0.28)"
              strokeWidth={1.5}
            />
            {/* Y-Axis */}
            <line
              x1={originX}
              y1={height - pad}
              x2={originX}
              y2={pad}
              stroke="rgba(255, 255, 255, 0.28)"
              strokeWidth={1.5}
            />

            {/* Axis Labels */}
            <text x={width - pad - 6} y={originY - 8} fill="#94A3B8" fontSize={11} fontWeight={600}>
              x
            </text>
            <text x={originX + 8} y={pad + 12} fill="#94A3B8" fontSize={11} fontWeight={600}>
              y
            </text>
          </g>
        )}

        {/* 2. Progressive Curve Creation (0.35 -> 0.80) */}
        {curveProgress > 0 && (
          <path
            d={curvePath}
            fill="none"
            stroke="#818CF8"
            strokeWidth={2.6}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - curveProgress}
            filter={`url(#glow-curve-${id})`}
            style={{
              transition: 'stroke-dashoffset 0.08s linear',
            }}
          />
        )}

        {/* 3. Dynamic Secant & Tangent Vectors (0.80 -> 1.0) */}
        {vectorProgress > 0 && (
          <g opacity={vectorProgress}>
            {/* Secant Line (Amber #F59E0B) */}
            <line
              x1={sx0 - (sx1 - sx0) * 0.4}
              y1={sy0 - (sy1 - sy0) * 0.4}
              x2={sx1 + (sx1 - sx0) * 0.4}
              y2={sy1 + (sy1 - sy0) * 0.4}
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="5 4"
            />

            {/* Delta X Horizontal Run (Amber #F59E0B) */}
            <line
              x1={sx0}
              y1={sy0}
              x2={sx1}
              y2={sy0}
              stroke="#F59E0B"
              strokeWidth={1.8}
            />
            <text
              x={(sx0 + sx1) / 2}
              y={sy0 + 16}
              fill="#F59E0B"
              fontSize={11}
              fontWeight={700}
              textAnchor="middle"
            >
              Δx
            </text>

            {/* Delta Y Vertical Rise (Cyan #38BDF8) */}
            <line
              x1={sx1}
              y1={sy0}
              x2={sx1}
              y2={sy1}
              stroke="#38BDF8"
              strokeWidth={1.8}
            />
            <text
              x={sx1 + 14}
              y={(sy0 + sy1) / 2 + 4}
              fill="#38BDF8"
              fontSize={11}
              fontWeight={700}
            >
              Δy
            </text>

            {/* Instantaneous Tangent Line (Emerald #10B981) */}
            <line
              x1={tanSxStart}
              y1={tanSyStart}
              x2={tanSxEnd}
              y2={tanSyEnd}
              stroke="#10B981"
              strokeWidth={2.4}
              filter={`url(#glow-tangent-${id})`}
            />

            {/* Point A (Anchor) */}
            <circle cx={sx0} cy={sy0} r={5} fill="#A855F7" stroke="#FFFFFF" strokeWidth={1.5} />
            <text x={sx0 - 16} y={sy0 - 8} fill="#A855F7" fontSize={11} fontWeight={700}>
              A (x₀)
            </text>

            {/* Point B (Moving Secant Point) */}
            <circle cx={sx1} cy={sy1} r={5} fill="#F59E0B" stroke="#FFFFFF" strokeWidth={1.5} />
            <text x={sx1 + 8} y={sy1 - 8} fill="#F59E0B" fontSize={11} fontWeight={700}>
              B
            </text>
          </g>
        )}

        {/* Custom Point Markers */}
        {points.map((pt, i) => (
          <circle
            key={`pt-${i}`}
            cx={toScreenX(pt.x)}
            cy={toScreenY(pt.y)}
            r={4.5}
            fill={pt.color || '#10B981'}
            stroke="#FFFFFF"
            strokeWidth={1}
          />
        ))}
      </svg>

      {/* Floating Telemetry Chips Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 8,
          fontSize: 11,
          color: '#94A3B8',
        }}
      >
        <span>
          Secant Slope <strong style={{ color: '#F59E0B' }}>m = {secantSlope.toFixed(2)}</strong>
        </span>
        <span>
          Tangent Slope <strong style={{ color: '#10B981' }}>f&apos;({x0}) = {tangentSlope.toFixed(2)}</strong>
        </span>
      </div>
    </div>
  );
};
