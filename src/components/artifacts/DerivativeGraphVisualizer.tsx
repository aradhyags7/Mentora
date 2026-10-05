'use client';

import React, { useRef, useEffect, useState } from 'react';
import katex from 'katex';

interface DerivativeGraphVisualizerProps {
  initialDeltaX?: number;
}

export const DerivativeGraphVisualizer: React.FC<DerivativeGraphVisualizerProps> = ({
  initialDeltaX = 1.2
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [deltaX, setDeltaX] = useState<number>(initialDeltaX);

  const renderLatex = (formula: string): string => {
    try {
      return katex.renderToString(formula, { throwOnError: false, displayMode: true });
    } catch {
      return formula;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.parentElement?.clientWidth || 640;
    const height = canvas.height = 360;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    const originX = width * 0.25;
    const originY = height * 0.82;
    const scaleX = 90;
    const scaleY = 38;

    // Subtle Grid
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += scaleX / 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += scaleY) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '500 11px Plus Jakarta Sans, sans-serif';
    ctx.fillText('x', width - 15, originY - 8);
    ctx.fillText('y', originX + 8, 16);

    // Parabola f(x) = x^2
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let first = true;
    for (let xVal = -0.4; xVal <= 3.2; xVal += 0.05) {
      const yVal = xVal * xVal;
      const px = originX + xVal * scaleX;
      const py = originY - yVal * scaleY;
      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // P and Q
    const xP = 1.0;
    const yP = 1.0;
    const pxP = originX + xP * scaleX;
    const pyP = originY - yP * scaleY;

    const xQ = xP + deltaX;
    const yQ = xQ * xQ;
    const pxQ = originX + xQ * scaleX;
    const pyQ = originY - yQ * scaleY;

    const slope = (yQ - yP) / (xQ - xP);

    // Secant line
    ctx.strokeStyle = deltaX < 0.05 ? '#059669' : '#DC2626';
    ctx.lineWidth = 1.75;
    ctx.setLineDash(deltaX < 0.05 ? [] : [4, 4]);
    ctx.beginPath();
    const lineXStart = -0.3;
    const lineXEnd = 3.2;
    const lineYStart = yP + slope * (lineXStart - xP);
    const lineYEnd = yP + slope * (lineXEnd - xP);
    ctx.moveTo(originX + lineXStart * scaleX, originY - lineYStart * scaleY);
    ctx.lineTo(originX + lineXEnd * scaleX, originY - lineYEnd * scaleY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Delta X Triangle
    if (deltaX > 0.08) {
      ctx.fillStyle = 'rgba(220, 38, 38, 0.05)';
      ctx.beginPath();
      ctx.moveTo(pxP, pyP);
      ctx.lineTo(pxQ, pyP);
      ctx.lineTo(pxQ, pyQ);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#FECACA';
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#991B1B';
      ctx.font = '500 11px JetBrains Mono';
      ctx.fillText(`Δx = ${deltaX.toFixed(2)}`, pxP + (pxQ - pxP) / 2 - 16, pyP + 14);
    }

    // Point P
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(pxP, pyP, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#111827';
    ctx.font = '600 12px Plus Jakarta Sans';
    ctx.fillText('P (1, 1)', pxP - 22, pyP - 10);

    // Point Q
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(pxQ, pyQ, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#7F1D1D';
    ctx.fillText(`Q (${xQ.toFixed(2)}, ${yQ.toFixed(2)})`, pxQ + 8, pyQ - 8);

    // Slope badge
    ctx.fillStyle = deltaX < 0.05 ? '#059669' : '#374151';
    ctx.font = '500 12px Plus Jakarta Sans';
    const slopeText = deltaX < 0.05
      ? `m = ${slope.toFixed(2)} (Instantaneous Tangent Slope at x=1)`
      : `m = ${slope.toFixed(2)} (Secant Slope)`;
    ctx.fillText(slopeText, originX + 16, 32);
  }, [deltaX]);

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
        marginBottom: '14px',
        paddingBottom: '10px',
        borderBottom: '1px solid #F3F4F6'
      }}>
        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111827' }}>
          Interactive Tangent Limit: f(x) = x²
        </div>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 500,
          background: '#EFF6FF',
          color: '#2563EB',
          padding: '2px 8px',
          borderRadius: '12px'
        }}>
          Calculus
        </span>
      </div>

      {/* Canvas */}
      <div style={{ width: '100%', height: '360px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
      </div>

      {/* KaTeX Formula Box */}
      <div style={{
        marginTop: '12px',
        padding: '10px 14px',
        background: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
        dangerouslySetInnerHTML={{
          __html: renderLatex(
            deltaX < 0.05
              ? "f'(1) = \\lim_{\\Delta x \\to 0} \\frac{(1+\\Delta x)^2 - 1^2}{\\Delta x} = 2"
              : `m_{\\text{sec}} = \\frac{f(1+${deltaX.toFixed(2)}) - f(1)}{${deltaX.toFixed(2)}} = ${(2 + deltaX).toFixed(2)}`
          )
        }}
      />

      {/* Slider Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '14px',
        paddingTop: '10px',
        borderTop: '1px solid #F3F4F6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 500 }}>
            Drag Δx toward 0:
          </span>
          <input
            type="range"
            min="0.01"
            max="2.0"
            step="0.01"
            value={deltaX}
            onChange={(e) => setDeltaX(parseFloat(e.target.value))}
            style={{ width: '180px', accentColor: '#2563EB', cursor: 'pointer' }}
          />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            fontWeight: 600,
            background: '#F3F4F6',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            Δx = {deltaX.toFixed(2)}
          </span>
        </div>

        <div style={{ fontSize: '0.76rem', color: '#6B7280' }}>
          {deltaX < 0.05 ? "✓ Reached exact limit m = 2" : "Pivoting secant line"}
        </div>
      </div>
    </div>
  );
};
