'use client';

import React, { useEffect, useRef } from 'react';
import { CoordinateGraphPrimitive } from '../../types/kinetic';

interface Props {
  entity: CoordinateGraphPrimitive;
  width?: number;
  height?: number;
}

export const CoordinateGraphPrimitiveRenderer: React.FC<Props> = ({
  entity,
  width = 380,
  height = 220,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { fnLatex, rangeX = [-5, 5], rangeY = [-5, 5], tangentAtX, points = [] } = entity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const [minX, maxX] = rangeX;
    const [minY, maxY] = rangeY;

    const toScreenX = (x: number) => ((x - minX) / (maxX - minX)) * width;
    const toScreenY = (y: number) => height - ((y - minY) / (maxY - minY)) * height;

    // Draw grid & axes
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0';
    ctx.lineWidth = 1;

    // Origin lines
    ctx.beginPath();
    ctx.moveTo(toScreenX(0), 0);
    ctx.lineTo(toScreenX(0), height);
    ctx.moveTo(0, toScreenY(0));
    ctx.lineTo(width, toScreenY(0));
    ctx.stroke();

    // Evaluate simple curves (e.g. x^2, sin(x), x^3)
    const evaluateFn = (x: number) => {
      if (fnLatex.includes('x^2')) return 0.5 * x * x - 2;
      if (fnLatex.includes('x^3')) return 0.2 * x * x * x;
      if (fnLatex.includes('sin')) return 3 * Math.sin(x);
      return 0.5 * x * x - 2;
    };

    // Draw Curve
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const x = minX + (i / steps) * (maxX - minX);
      const y = evaluateFn(x);
      const sx = toScreenX(x);
      const sy = toScreenY(y);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Draw Tangent line if tangentAtX is set
    if (tangentAtX !== undefined) {
      const x0 = tangentAtX;
      const y0 = evaluateFn(x0);
      const h = 0.001;
      const slope = (evaluateFn(x0 + h) - evaluateFn(x0 - h)) / (2 * h);

      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();

      const tanSpan = 2.5;
      const xStart = x0 - tanSpan;
      const yStart = y0 - slope * tanSpan;
      const xEnd = x0 + tanSpan;
      const yEnd = y0 + slope * tanSpan;

      ctx.moveTo(toScreenX(xStart), toScreenY(yStart));
      ctx.lineTo(toScreenX(xEnd), toScreenY(yEnd));
      ctx.stroke();
      ctx.setLineDash([]);

      // Tangent point
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(toScreenX(x0), toScreenY(y0), 5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw custom labeled points
    points.forEach(pt => {
      ctx.fillStyle = pt.color || '#10B981';
      ctx.beginPath();
      ctx.arc(toScreenX(pt.x), toScreenY(pt.y), 4.5, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [fnLatex, rangeX, rangeY, tangentAtX, points, width, height]);

  return (
    <div style={{ 
      background: 'var(--bg-card)', 
      padding: 12, 
      borderRadius: 'var(--radius-sm)', 
      border: '1px solid var(--border-default)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
    }}>
      {entity.title && (
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          {entity.title}
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ 
          display: 'block', 
          borderRadius: 8, 
          background: 'var(--bg-tertiary)' 
        }}
      />
    </div>
  );
};
