'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RotateCcw, ArrowRight, Sparkles, Move } from 'lucide-react';
import { InteractiveArtifactProps } from '../../../types/lessonSurface';

export const DerivativeArtifact: React.FC<InteractiveArtifactProps> = ({
  onInteraction,
  isTeacherActive = false,
}) => {
  // Calculus function: f(x) = 0.5 * x^2 - 2
  // Fixed anchor point x0 = 2.0 -> f(2) = 0.5*(4) - 2 = 0
  const x0 = 2.0;
  const f = useCallback((x: number) => 0.5 * x * x - 2, []);
  const fPrime = useCallback((x: number) => x, []); // f'(x) = x -> f'(2) = 2.0

  // Movable point delta: x1 = x0 + deltaX
  const [deltaX, setDeltaX] = useState(2.0); // start at deltaX = 2 (x1 = 4.0)
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Computed values
  const y0 = f(x0); // 0.0
  const x1 = x0 + deltaX;
  const y1 = f(x1);
  const secantSlope = deltaX !== 0 ? (y1 - y0) / deltaX : fPrime(x0);
  const instantSlope = fPrime(x0); // 2.0

  // Coordinate mapping for SVG (origin at (120, 200), scale = 45 px per unit)
  const scale = 45;
  const originX = 120;
  const originY = 200;

  const toSvgX = (x: number) => originX + x * scale;
  const toSvgY = (y: number) => originY - y * scale;

  // Handle pointer dragging on point B
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseSvgX = e.clientX - rect.left;
    // Map mouse X back to math domain x
    const mathX = (mouseSvgX - originX) / scale;
    // Clamp deltaX between 0.01 and 3.5
    const newDelta = Math.max(0.02, Math.min(3.5, mathX - x0));
    setDeltaX(parseFloat(newDelta.toFixed(3)));

    if (onInteraction) {
      onInteraction({
        type: 'student.interaction',
        artifact: 'math.derivative',
        action: 'move_point',
        value: parseFloat(newDelta.toFixed(3)),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  // Step deltaX closer to 0
  const stepCloser = () => {
    const steps = [2.0, 1.2, 0.6, 0.2, 0.05, 0.001];
    const currentIndex = steps.findIndex(s => Math.abs(s - deltaX) < 0.1);
    const nextDelta = currentIndex >= 0 && currentIndex < steps.length - 1 
      ? steps[currentIndex + 1] 
      : Math.max(0.001, deltaX * 0.4);
    
    setDeltaX(parseFloat(nextDelta.toFixed(3)));
    if (onInteraction) {
      onInteraction({
        type: 'student.interaction',
        artifact: 'math.derivative',
        action: 'step_closer',
        value: nextDelta,
      });
    }
  };

  // Animate limit: deltaX smoothly shrinks to 0.001
  const animateLimit = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    let startDelta = deltaX;
    let startTime: number | null = null;
    const duration = 2200; // 2.2 seconds

    const animateFrame = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.max(0.001, startDelta * (1 - eased));
      setDeltaX(parseFloat(current.toFixed(3)));

      if (progress < 1.0) {
        requestAnimationFrame(animateFrame);
      } else {
        setIsAnimating(false);
        if (onInteraction) {
          onInteraction({
            type: 'student.interaction',
            artifact: 'math.derivative',
            action: 'animate_limit_complete',
            value: 0.001,
          });
        }
      }
    };

    requestAnimationFrame(animateFrame);
  };

  const resetState = () => {
    setDeltaX(2.0);
    if (onInteraction) {
      onInteraction({
        type: 'student.interaction',
        artifact: 'math.derivative',
        action: 'reset',
        value: 2.0,
      });
    }
  };

  // Generate SVG path for f(x) from x = -1 to x = 5.2
  const pathPoints: string[] = [];
  for (let x = -1; x <= 5.2; x += 0.1) {
    const sx = toSvgX(x);
    const sy = toSvgY(f(x));
    pathPoints.push(`${x === -1 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`);
  }
  const curvePath = pathPoints.join(' ');

  // Secant line coordinates through (x0, y0) and (x1, y1)
  // Extended line: from x = 0.5 to x = 5.0
  const secantXStart = 0.8;
  const secantYStart = y0 + secantSlope * (secantXStart - x0);
  const secantXEnd = 5.0;
  const secantYEnd = y0 + secantSlope * (secantXEnd - x0);

  // Tangent line coordinates through (x0, y0) with slope instantSlope (2.0)
  const tangentXStart = 0.8;
  const tangentYStart = y0 + instantSlope * (tangentXStart - x0);
  const tangentXEnd = 4.8;
  const tangentYEnd = y0 + instantSlope * (tangentXEnd - x0);

  return (
    <div className="derivative-artifact-root" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Live Invariant Metrics HUD */}
      <div 
        className="derivative-metrics-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10,
          background: 'var(--bg-secondary)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Anchor Point A</div>
          <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
            (2.0, 0.0)
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Interval Δx</div>
          <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 600, color: deltaX < 0.1 ? 'var(--accent-primary)' : 'var(--accent-amber)' }}>
            {deltaX.toFixed(3)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Secant Slope (Δy/Δx)</div>
          <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-amber)' }}>
            {secantSlope.toFixed(3)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Tangent Slope f'(2)</div>
          <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>
            2.000 <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>(instantaneous)</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Whiteboard Canvas */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: 310,
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 460 310"
          style={{ cursor: isDragging ? 'grabbing' : 'default', touchAction: 'none' }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="45" height="45" patternUnits="userSpaceOnUse">
              <path d="M 45 0 L 0 0 0 45" fill="none" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Coordinate Axes */}
          <line x1="20" y1={originY} x2="440" y2={originY} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
          <line x1={originX} y1="20" x2={originX} y2="290" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
          
          <text x="430" y={originY - 8} fill="currentColor" fillOpacity="0.5" fontSize="11" fontFamily="var(--font-mono)">x</text>
          <text x={originX + 8} y="32" fill="currentColor" fillOpacity="0.5" fontSize="11" fontFamily="var(--font-mono)">y</text>

          {/* Function Curve f(x) = 0.5x^2 - 2 */}
          <path d={curvePath} fill="none" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" />
          <text x={toSvgX(4.2)} y={toSvgY(f(4.2)) - 10} fill="var(--text-secondary)" fontSize="11" fontFamily="var(--font-mono)">
            f(x) = 0.5x² - 2
          </text>

          {/* Tangent line (Target limit: slope = 2.0) */}
          <line
            x1={toSvgX(tangentXStart)}
            y1={toSvgY(tangentYStart)}
            x2={toSvgX(tangentXEnd)}
            y2={toSvgY(tangentYEnd)}
            stroke="var(--accent-primary)"
            strokeWidth="1.8"
            strokeDasharray="4 3"
            strokeOpacity="0.75"
          />

          {/* Secant line (Connecting A and B) */}
          <line
            x1={toSvgX(secantXStart)}
            y1={toSvgY(secantYStart)}
            x2={toSvgX(secantXEnd)}
            y2={toSvgY(secantYEnd)}
            stroke="var(--accent-amber)"
            strokeWidth="2.2"
          />

          {/* Delta-x horizontal distance bracket */}
          {deltaX > 0.05 && (
            <g strokeOpacity="0.6">
              <line 
                x1={toSvgX(x0)} 
                y1={toSvgY(y0) + 16} 
                x2={toSvgX(x1)} 
                y2={toSvgY(y0) + 16} 
                stroke="var(--accent-amber)" 
                strokeWidth="1.5" 
                strokeDasharray="2 2"
              />
              <text 
                x={(toSvgX(x0) + toSvgX(x1)) / 2} 
                y={toSvgY(y0) + 30} 
                textAnchor="middle" 
                fill="var(--accent-amber)" 
                fontSize="11" 
                fontFamily="var(--font-mono)"
                fontWeight="600"
              >
                Δx = {deltaX.toFixed(2)}
              </text>
            </g>
          )}

          {/* Fixed Anchor Point A (2, 0) */}
          <circle
            cx={toSvgX(x0)}
            cy={toSvgY(y0)}
            r="6"
            fill="var(--accent-primary)"
            stroke="var(--bg-card)"
            strokeWidth="2"
          />
          <text x={toSvgX(x0) - 18} y={toSvgY(y0) - 10} fill="var(--text-primary)" fontSize="12" fontWeight="600">
            A (x₀)
          </text>

          {/* Movable Interactive Point B (x0 + Δx, f(x0 + Δx)) */}
          <g 
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onPointerDown={handlePointerDown}
          >
            {/* Pulsing halo to signal interactive affordance */}
            <circle
              cx={toSvgX(x1)}
              cy={toSvgY(y1)}
              r="14"
              fill="var(--accent-amber)"
              fillOpacity={isDragging ? 0.35 : 0.18}
              stroke="var(--accent-amber)"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            <circle
              cx={toSvgX(x1)}
              cy={toSvgY(y1)}
              r="6.5"
              fill="var(--accent-amber)"
              stroke="var(--bg-card)"
              strokeWidth="2"
            />
            <text x={toSvgX(x1) + 12} y={toSvgY(y1) - 4} fill="var(--accent-amber)" fontSize="12" fontWeight="700">
              B (drag me)
            </text>
          </g>
        </svg>

        {/* Drag Hint Overlay */}
        <div 
          style={{
            position: 'absolute',
            bottom: 10,
            left: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 11,
            pointerEvents: 'none',
          }}
        >
          <Move size={12} />
          <span>Drag Point B along curve or use controls below</span>
        </div>
      </div>

      {/* Accessible Slider & Shared Control Manipulation Toolbar */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          background: 'var(--bg-card)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-default)',
        }}
      >
        {/* Slider row with label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <label htmlFor="delta-slider" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            Point B distance (Δx):
          </label>
          <input
            id="delta-slider"
            type="range"
            min="0.001"
            max="3.0"
            step="0.01"
            value={deltaX}
            disabled={isAnimating}
            onChange={e => {
              const val = parseFloat(e.target.value);
              setDeltaX(val);
              if (onInteraction) {
                onInteraction({
                  type: 'student.interaction',
                  artifact: 'math.derivative',
                  action: 'move_point',
                  value: val,
                });
              }
            }}
            style={{
              flex: 1,
              accentColor: 'var(--accent-primary)',
              cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600, minWidth: 42, textAlign: 'right' }}>
            {deltaX.toFixed(2)}
          </span>
        </div>

        {/* Action buttons row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            onClick={stepCloser}
            disabled={deltaX <= 0.005 || isAnimating}
            className="artifact-interact-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              fontSize: 12.5,
              fontWeight: 500,
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
            }}
          >
            <ArrowRight size={13} />
            <span>Move Point Closer</span>
          </button>

          <button
            type="button"
            onClick={animateLimit}
            disabled={isAnimating}
            className="artifact-interact-btn primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              fontSize: 12.5,
              fontWeight: 500,
              background: 'var(--accent-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
            }}
          >
            <Play size={13} fill="currentColor" />
            <span>{isAnimating ? 'Snapping to limit...' : 'Animate Limit (Δx → 0)'}</span>
          </button>

          <button
            type="button"
            onClick={resetState}
            disabled={isAnimating}
            className="artifact-interact-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              fontSize: 12.5,
              fontWeight: 500,
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
