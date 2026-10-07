'use client';

import React, { useState, useRef, useEffect } from 'react';
import { InteractiveArtifactProps } from '../../../types/lessonSurface';
import { Play, RotateCcw } from 'lucide-react';

export const ProjectileArtifact: React.FC<InteractiveArtifactProps> = ({
  onInteraction,
}) => {
  const [angle, setAngle] = useState(45); // degrees
  const [velocity, setVelocity] = useState(22); // m/s
  const gravity = 9.8; // m/s^2

  const [isSimulating, setIsSimulating] = useState(false);
  const [projectilePos, setProjectilePos] = useState<{ x: number; y: number } | null>(null);
  const animationRef = useRef<number | null>(null);

  // Physical calculations
  const rad = (angle * Math.PI) / 180;
  const timeOfFlight = (2 * velocity * Math.sin(rad)) / gravity;
  const maxHeight = (Math.pow(velocity * Math.sin(rad), 2)) / (2 * gravity);
  const range = (Math.pow(velocity, 2) * Math.sin(2 * rad)) / gravity;

  // Canvas scaling
  const canvasWidth = 460;
  const canvasHeight = 220;
  const originX = 35;
  const originY = 190;
  const scale = 5.2; // pixels per meter

  const toCanvasX = (x: number) => originX + x * scale;
  const toCanvasY = (y: number) => originY - y * scale;

  // Precompute trajectory curve path
  const numSteps = 50;
  const trajectoryPoints: string[] = [];
  for (let i = 0; i <= numSteps; i++) {
    const t = (i / numSteps) * timeOfFlight;
    const x = velocity * Math.cos(rad) * t;
    const y = velocity * Math.sin(rad) * t - 0.5 * gravity * t * t;
    trajectoryPoints.push(`${i === 0 ? 'M' : 'L'} ${toCanvasX(x).toFixed(1)} ${toCanvasY(Math.max(0, y)).toFixed(1)}`);
  }
  const trajectoryPath = trajectoryPoints.join(' ');

  // Launch simulation animation
  const handleLaunch = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsedSec = (timestamp - startTime) / 1000;

      if (elapsedSec <= timeOfFlight) {
        const x = velocity * Math.cos(rad) * elapsedSec;
        const y = Math.max(0, velocity * Math.sin(rad) * elapsedSec - 0.5 * gravity * elapsedSec * elapsedSec);
        setProjectilePos({ x, y });
        animationRef.current = requestAnimationFrame(step);
      } else {
        setProjectilePos({ x: range, y: 0 });
        setIsSimulating(false);

        if (onInteraction) {
          onInteraction({
            type: 'student.interaction',
            artifact: 'physics.projectile',
            action: 'launch_completed',
            value: { angle, velocity, range, maxHeight },
          });
        }
      }
    };

    animationRef.current = requestAnimationFrame(step);
  };

  const handleReset = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsSimulating(false);
    setProjectilePos(null);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="projectile-artifact-root" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Live Ballistic Metrics */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 10,
          background: 'var(--bg-secondary)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Range R</div>
          <div style={{ fontSize: 15, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {range.toFixed(1)} m
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Max Height H</div>
          <div style={{ fontSize: 15, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-amber)' }}>
            {maxHeight.toFixed(1)} m
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Flight Time T</div>
          <div style={{ fontSize: 15, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {timeOfFlight.toFixed(2)} s
          </div>
        </div>
      </div>

      {/* Trajectory Simulation SVG */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: 230,
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
          overflow: 'hidden',
        }}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}>
          {/* Ground surface */}
          <line x1="10" y1={originY} x2={canvasWidth - 10} y2={originY} stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
          
          {/* Trajectory Curve */}
          <path d={trajectoryPath} fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeDasharray={isSimulating ? 'none' : '4 3'} strokeOpacity="0.8" />

          {/* Cannon Barrel Vector indicator */}
          <line
            x1={originX}
            y1={originY}
            x2={originX + 28 * Math.cos(rad)}
            y2={originY - 28 * Math.sin(rad)}
            stroke="var(--text-primary)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Projectile Particle */}
          {projectilePos && (
            <circle
              cx={toCanvasX(projectilePos.x)}
              cy={toCanvasY(projectilePos.y)}
              r="6.5"
              fill="var(--accent-amber)"
              stroke="var(--bg-card)"
              strokeWidth="2"
            />
          )}

          {/* Launch Origin Point */}
          <circle cx={originX} cy={originY} r="4" fill="var(--text-primary)" />
        </svg>
      </div>

      {/* Interactive Controls Sliders & Launch Button */}
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
        {/* Angle Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <label htmlFor="angle-slider" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', minWidth: 105 }}>
            Launch Angle (θ):
          </label>
          <input
            id="angle-slider"
            type="range"
            min="15"
            max="75"
            value={angle}
            disabled={isSimulating}
            onChange={e => {
              const val = parseInt(e.target.value, 10);
              setAngle(val);
              if (onInteraction) {
                onInteraction({
                  type: 'artifact.variable_changed',
                  artifact: 'physics.projectile',
                  action: 'change_angle',
                  variable: 'angle',
                  newValue: val,
                });
              }
            }}
            style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
          />
          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600, minWidth: 40 }}>
            {angle}°
          </span>
        </div>

        {/* Velocity Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <label htmlFor="vel-slider" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', minWidth: 105 }}>
            Initial Velocity:
          </label>
          <input
            id="vel-slider"
            type="range"
            min="10"
            max="35"
            value={velocity}
            disabled={isSimulating}
            onChange={e => {
              const val = parseInt(e.target.value, 10);
              setVelocity(val);
              if (onInteraction) {
                onInteraction({
                  type: 'artifact.variable_changed',
                  artifact: 'physics.projectile',
                  action: 'change_velocity',
                  variable: 'velocity',
                  newValue: val,
                });
              }
            }}
            style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
          />
          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600, minWidth: 40 }}>
            {velocity} m/s
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            type="button"
            onClick={handleLaunch}
            disabled={isSimulating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              fontSize: 13,
              fontWeight: 500,
              background: 'var(--accent-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              cursor: isSimulating ? 'default' : 'pointer',
            }}
          >
            <Play size={13} fill="currentColor" />
            <span>{isSimulating ? 'Flying...' : 'Launch Projectile'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              fontSize: 13,
              fontWeight: 500,
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
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
