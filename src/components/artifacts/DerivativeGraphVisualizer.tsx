'use client';

import React, { useRef, useEffect, useState } from 'react';
import katex from 'katex';

interface DerivativeGraphVisualizerProps {
  initialFunction?: string;
  initialPoint?: number;
  initialDeltaX?: number;
}

export const DerivativeGraphVisualizer: React.FC<DerivativeGraphVisualizerProps> = ({
  initialFunction = 'x^2',
  initialPoint = 1.0,
  initialDeltaX = 1.2
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [funcExpr, setFuncExpr] = useState<string>(initialFunction);
  const [pointX, setPointX] = useState<number>(initialPoint);
  const [deltaX, setDeltaX] = useState<number>(initialDeltaX);

  // Evaluate f(x) for common educational functions
  const evalFunc = (x: number, expr: string): number => {
    const clean = expr.trim().toLowerCase();
    if (clean === 'x^2' || clean === 'x^2') return x * x;
    if (clean === 'x^3') return 0.3 * (x * x * x);
    if (clean === 'sin(x)' || clean === 'sin') return Math.sin(x);
    if (clean === 'cos(x)' || clean === 'cos') return Math.cos(x);
    if (clean === 'sqrt(x)' || clean === 'sqrt') return x >= 0 ? Math.sqrt(x) : 0;
    if (clean === '2x' || clean === '2*x') return 2 * x;
    if (clean === 'x') return x;
    // Default to quadratic
    return x * x;
  };

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

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    const originX = width * 0.28;
    const originY = height * 0.78;
    const scaleX = 85;
    const scaleY = 36;

    // Grid
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

    // Plot Curve f(x)
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let first = true;
    const startX = -1.0;
    const endX = 3.5;

    for (let xVal = startX; xVal <= endX; xVal += 0.05) {
      const yVal = evalFunc(xVal, funcExpr);
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

    // Points P and Q
    const xP = pointX;
    const yP = evalFunc(xP, funcExpr);
    const pxP = originX + xP * scaleX;
    const pyP = originY - yP * scaleY;

    const xQ = xP + deltaX;
    const yQ = evalFunc(xQ, funcExpr);
    const pxQ = originX + xQ * scaleX;
    const pyQ = originY - yQ * scaleY;

    const slope = deltaX !== 0 ? (yQ - yP) / (xQ - xP) : 0;

    // Secant / Tangent Line
    ctx.strokeStyle = deltaX < 0.05 ? '#059669' : '#DC2626';
    ctx.lineWidth = 1.75;
    ctx.setLineDash(deltaX < 0.05 ? [] : [4, 4]);
    ctx.beginPath();
    const lineXStart = -0.5;
    const lineXEnd = 3.5;
    const lineYStart = yP + slope * (lineXStart - xP);
    const lineYEnd = yP + slope * (lineXEnd - xP);
    ctx.moveTo(originX + lineXStart * scaleX, originY - lineYStart * scaleY);
    ctx.lineTo(originX + lineXEnd * scaleX, originY - lineYEnd * scaleY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Delta Triangle
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
    ctx.fillText(`P (${xP.toFixed(1)}, ${yP.toFixed(2)})`, pxP - 22, pyP - 10);

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

    // Slope readout
    ctx.fillStyle = deltaX < 0.05 ? '#059669' : '#374151';
    ctx.font = '500 12px Plus Jakarta Sans';
    const slopeText = deltaX < 0.05
      ? `m = ${slope.toFixed(2)} (Instantaneous Tangent Slope at x = ${xP.toFixed(1)})`
      : `m = ${slope.toFixed(2)} (Secant Slope)`;
    ctx.fillText(slopeText, originX + 16, 32);
  }, [funcExpr, pointX, deltaX]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111827' }}>
            Interactive Tangent Limit
          </span>

          {/* Function Selector / Custom input */}
          <select
            value={funcExpr}
            onChange={(e) => setFuncExpr(e.target.value)}
            style={{
              padding: '3px 8px',
              fontSize: '0.78rem',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              background: '#FFFFFF',
              color: '#111827',
              cursor: 'pointer'
            }}
          >
            <option value="x^2">f(x) = x²</option>
            <option value="x^3">f(x) = x³</option>
            <option value="sin(x)">f(x) = sin(x)</option>
            <option value="cos(x)">f(x) = cos(x)</option>
            <option value="sqrt(x)">f(x) = √x</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#6B7280' }}>
          <span>Point x₀:</span>
          <input
            type="number"
            min="0"
            max="3"
            step="0.5"
            value={pointX}
            onChange={(e) => setPointX(parseFloat(e.target.value) || 1)}
            style={{
              width: '50px',
              padding: '2px 6px',
              fontSize: '0.76rem',
              borderRadius: '4px',
              border: '1px solid #D1D5DB'
            }}
          />
        </div>
      </div>

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
              ? `f'(${pointX}) = \\lim_{\\Delta x \\to 0} \\frac{f(${pointX}+\\Delta x) - f(${pointX})}{\\Delta x}`
              : `m_{\\text{sec}} = \\frac{f(${pointX}+${deltaX.toFixed(2)}) - f(${pointX})}{${deltaX.toFixed(2)}} = ${(
                  (evalFunc(pointX + deltaX, funcExpr) - evalFunc(pointX, funcExpr)) / deltaX
                ).toFixed(2)}`
          )
        }}
      />

      {/* Interactive Delta X Scrubber */}
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
          {deltaX < 0.05 ? "✓ Instantaneous tangent limit achieved" : "Pivoting secant line"}
        </div>
      </div>
    </div>
  );
};
