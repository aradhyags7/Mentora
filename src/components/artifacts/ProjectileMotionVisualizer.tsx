'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play } from 'lucide-react';

interface ProjectileMotionVisualizerProps {
  initialAngle?: number;
  initialVelocity?: number;
}

export const ProjectileMotionVisualizer: React.FC<ProjectileMotionVisualizerProps> = ({
  initialAngle = 45,
  initialVelocity = 24
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [angle, setAngle] = useState<number>(initialAngle);
  const [velocity, setVelocity] = useState<number>(initialVelocity);
  const [gravity] = useState<number>(9.8);
  const [progress, setProgress] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width = canvas.parentElement?.clientWidth || 640;
    const h = 320;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    const horizonY = h * 0.78;
    const originX = w * 0.16;
    const originY = horizonY;

    // Ground
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(w, horizonY);
    ctx.stroke();

    const rad = (angle * Math.PI) / 180;
    const vx = velocity * Math.cos(rad);
    const vy = velocity * Math.sin(rad);
    const flightTime = (2 * vy) / gravity;
    const scale = 14;

    // Parabolic Arc
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 1.75;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let t = 0; t <= flightTime; t += 0.05) {
      const px = originX + vx * t * scale;
      const py = originY - (vy * t - 0.5 * gravity * t * t) * scale;
      if (t === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Ball
    const currT = flightTime * progress;
    const ballX = originX + vx * currT * scale;
    const ballY = originY - Math.max(0, vy * currT - 0.5 * gravity * currT * currT) * scale;

    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.arc(ballX, ballY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cannon
    ctx.fillStyle = '#4B5563';
    ctx.beginPath();
    ctx.arc(originX, originY, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(originX, originY);
    ctx.rotate(-rad);
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, -3.5, 22, 7);
    ctx.restore();

    // Stats
    const maxRange = vx * flightTime;
    const maxHeight = (vy * vy) / (2 * gravity);
    ctx.fillStyle = '#6B7280';
    ctx.font = '500 11px Plus Jakarta Sans';
    ctx.fillText(`Max Height: ${maxHeight.toFixed(1)}m | Range: ${maxRange.toFixed(1)}m | Time: ${flightTime.toFixed(2)}s`, originX + 20, 28);
  }, [angle, velocity, gravity, progress]);

  useEffect(() => {
    if (!isAnimating) return;
    let startTimestamp: number | null = null;
    const duration = 2000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);

      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        setIsAnimating(false);
      }
    };

    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [isAnimating]);

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '14px',
      padding: '20px',
      margin: '14px 0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        paddingBottom: '10px',
        borderBottom: '1px solid #F3F4F6'
      }}>
        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111827' }}>
          Kinematics Simulation: 2D Projectile Trajectory
        </div>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 500,
          background: '#EFF6FF',
          color: '#2563EB',
          padding: '2px 8px',
          borderRadius: '12px'
        }}>
          Physics
        </span>
      </div>

      <div style={{ width: '100%', height: '320px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
      </div>

      {/* Sliders */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '12px',
        paddingTop: '10px',
        borderTop: '1px solid #F3F4F6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem' }}>
            <span>Angle:</span>
            <input
              type="range"
              min="15"
              max="75"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              style={{ width: '100px', accentColor: '#2563EB', cursor: 'pointer' }}
            />
            <span style={{ fontWeight: 600 }}>{angle}°</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem' }}>
            <span>Velocity:</span>
            <input
              type="range"
              min="10"
              max="35"
              value={velocity}
              onChange={(e) => setVelocity(parseInt(e.target.value))}
              style={{ width: '100px', accentColor: '#2563EB', cursor: 'pointer' }}
            />
            <span style={{ fontWeight: 600 }}>{velocity} m/s</span>
          </div>
        </div>

        <button
          onClick={() => {
            setProgress(0);
            setIsAnimating(true);
          }}
          disabled={isAnimating}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            background: '#1F2937',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 500,
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Play size={12} />
          <span>{isAnimating ? 'Simulating...' : 'Launch Projectile'}</span>
        </button>
      </div>
    </div>
  );
};
