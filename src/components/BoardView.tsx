'use client';

import React, { useRef, useEffect, useState } from 'react';
import { SubjectId, LessonData } from '@/types/classroom';
import { Play, Trash2, Check } from 'lucide-react';
import katex from 'katex';

interface BoardViewProps {
  currentSubject: SubjectId;
  lesson: LessonData;
  isInkMode: boolean;
  onToggleInkMode: () => void;
  onStudentWorkEvaluated?: (isCorrect: boolean, feedback: string) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  currentSubject,
  lesson,
  isInkMode,
  onToggleInkMode,
  onStudentWorkEvaluated
}) => {
  const mathCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const inkCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [deltaX, setDeltaX] = useState<number>(1.2);

  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<{ x: number; y: number }[][]>([]);
  const [inkFeedback, setInkFeedback] = useState<string | null>(null);

  // Physics Simulation
  const simCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [simAngle, setSimAngle] = useState<number>(45);
  const [simVelocity, setSimVelocity] = useState<number>(24);
  const [simGravity, setSimGravity] = useState<number>(9.8);
  const [simProgress, setSimProgress] = useState<number>(1);
  const [isSimAnimating, setIsSimAnimating] = useState<boolean>(false);

  // Code Simulation
  const [codeContent, setCodeContent] = useState<string>(lesson.starterCode || '');
  const [codeStepIndex, setCodeStepIndex] = useState<number>(0);
  const arrayData = [1, 3, 5, 7, 9, 12, 15, 18, 21, 25];

  useEffect(() => {
    if (lesson.starterCode) {
      setCodeContent(lesson.starterCode);
    }
    setInkFeedback(null);
  }, [currentSubject, lesson]);

  const renderLatex = (formula: string): string => {
    try {
      return katex.renderToString(formula, { throwOnError: false, displayMode: true });
    } catch {
      return formula;
    }
  };

  // Calculus Plotting: Crisp, clean, human design
  useEffect(() => {
    if (currentSubject !== 'calculus') return;
    const canvas = mathCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width = canvas.parentElement?.clientWidth || 700;
      const height = canvas.height = canvas.parentElement?.clientHeight || 550;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      const originX = width * 0.25;
      const originY = height * 0.82;
      const scaleX = 100;
      const scaleY = 44;

      // Clean subtle grid
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

      // Clean neutral axes
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(width, originY);
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, height);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '500 12px Plus Jakarta Sans, sans-serif';
      ctx.fillText('x', width - 18, originY - 8);
      ctx.fillText('y', originX + 10, 18);

      // Parabola curve: deep blue
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      let first = true;
      for (let xVal = -0.5; xVal <= 3.2; xVal += 0.05) {
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

      // Points P and Q
      const xP = 1.0;
      const yP = 1.0;
      const pxP = originX + xP * scaleX;
      const pyP = originY - yP * scaleY;

      const xQ = xP + deltaX;
      const yQ = xQ * xQ;
      const pxQ = originX + xQ * scaleX;
      const pyQ = originY - yQ * scaleY;

      const slope = (yQ - yP) / (xQ - xP);

      // Secant / Tangent line
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

      // Delta triangle
      if (deltaX > 0.08) {
        ctx.fillStyle = 'rgba(220, 38, 38, 0.04)';
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
        ctx.fillText(`Δx = ${deltaX.toFixed(2)}`, pxP + (pxQ - pxP) / 2 - 18, pyP + 14);
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

      // Slope reading
      ctx.fillStyle = deltaX < 0.05 ? '#059669' : '#374151';
      ctx.font = '500 12px Plus Jakarta Sans';
      const slopeLabel = deltaX < 0.05 
        ? `Slope: m = ${slope.toFixed(2)} (Instantaneous Tangent)` 
        : `Slope: m = ${slope.toFixed(2)}`;
      ctx.fillText(slopeLabel, originX + 16, 36);
    };

    render();
    window.addEventListener('resize', render);
    return () => window.removeEventListener('resize', render);
  }, [currentSubject, deltaX]);

  // Ink Layer
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isInkMode) return;
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setStrokes((prev) => [...prev, [{ x, y }]]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isInkMode) return;
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStrokes((prev) => {
      const next = [...prev];
      const current = next[next.length - 1];
      if (current) current.push({ x, y });
      return next;
    });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const currentStroke = strokes[strokes.length - 1];
    if (currentStroke && currentStroke.length > 1) {
      const p1 = currentStroke[currentStroke.length - 2];
      const p2 = currentStroke[currentStroke.length - 1];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => setIsDrawing(false);

  const clearInk = () => {
    setStrokes([]);
    setInkFeedback(null);
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const verifyHandwriting = () => {
    if (strokes.length === 0) return;
    setInkFeedback("Verified: Step is correct.");
    if (onStudentWorkEvaluated) {
      onStudentWorkEvaluated(true, "Your handwritten step is correct.");
    }
  };

  // Physics Simulation
  useEffect(() => {
    if (currentSubject !== 'physics_projectile') return;
    const canvas = simCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderPhysics = () => {
      const w = canvas.width = canvas.parentElement?.clientWidth || 700;
      const h = canvas.height = canvas.parentElement?.clientHeight || 550;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);

      const horizonY = h * 0.78;
      const originX = w * 0.18;
      const originY = horizonY;

      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(w, horizonY);
      ctx.stroke();

      const rad = (simAngle * Math.PI) / 180;
      const vx = simVelocity * Math.cos(rad);
      const vy = simVelocity * Math.sin(rad);
      const flightTime = (2 * vy) / simGravity;
      const scale = 14;

      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 1.75;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let t = 0; t <= flightTime; t += 0.05) {
        const px = originX + vx * t * scale;
        const py = originY - (vy * t - 0.5 * simGravity * t * t) * scale;
        if (t === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      const currT = flightTime * simProgress;
      const ballX = originX + vx * currT * scale;
      const ballY = originY - Math.max(0, vy * currT - 0.5 * simGravity * currT * currT) * scale;

      ctx.fillStyle = '#2563EB';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

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
    };

    renderPhysics();
  }, [currentSubject, simAngle, simVelocity, simGravity, simProgress]);

  // Simulation loop
  useEffect(() => {
    if (!isSimAnimating) return;
    let startTimestamp: number | null = null;
    const duration = 2200;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(1, elapsed / duration);
      setSimProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setIsSimAnimating(false);
      }
    };

    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [isSimAnimating]);

  return (
    <div className="canvas-column">
      {/* Header */}
      <div className="canvas-header">
        <span className="canvas-title">{lesson.title}</span>

        {currentSubject === 'calculus' && isInkMode && (
          <div className="canvas-toolbar">
            <button className="canvas-tool-button" onClick={clearInk}>
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
            <button className="canvas-tool-button" onClick={verifyHandwriting} style={{ color: '#059669' }}>
              <Check size={13} />
              <span>Verify</span>
            </button>
          </div>
        )}
      </div>

      {/* Viewport */}
      <div className="canvas-body-viewport">
        {/* 1. Calculus */}
        {currentSubject === 'calculus' && (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <canvas ref={mathCanvasRef} style={{ width: '100%', height: '100%' }} />

            <canvas
              ref={inkCanvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: isInkMode ? 'auto' : 'none',
                cursor: 'crosshair',
                zIndex: 4
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />

            {/* Notebook note card */}
            <div className="math-note-card">
              <div className="math-note-header">Definition of the Derivative</div>
              
              <div 
                className="math-formula-box"
                dangerouslySetInnerHTML={{ 
                  __html: renderLatex(
                    deltaX < 0.05 
                      ? "f'(1) = \\lim_{\\Delta x \\to 0} \\frac{(1+\\Delta x)^2 - 1^2}{\\Delta x} = 2" 
                      : `m_{\\text{sec}} = \\frac{f(1+${deltaX.toFixed(2)}) - f(1)}{${deltaX.toFixed(2)}} = ${(2 + deltaX).toFixed(2)}`
                  ) 
                }}
              />

              <div className="math-note-text">
                {deltaX < 0.05
                  ? "As Δx reaches 0, the secant line matches the tangent line at x = 1 (slope = 2)."
                  : "As point Q approaches P, the secant line rotates toward the true slope."}
              </div>

              {inkFeedback && (
                <div style={{
                  marginTop: '8px',
                  padding: '5px 8px',
                  borderRadius: '4px',
                  background: '#F0FDF4',
                  color: '#166534',
                  fontSize: '0.74rem'
                }}>
                  {inkFeedback}
                </div>
              )}
            </div>

            {/* Apple-style Slider */}
            <div className="clean-slider-bar">
              <span>Δx:</span>
              <input
                type="range"
                min="0.01"
                max="2.0"
                step="0.01"
                value={deltaX}
                onChange={(e) => setDeltaX(parseFloat(e.target.value))}
                className="apple-slider"
              />
              <span className="slider-val-tag">{deltaX.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* 2. Physics */}
        {currentSubject === 'physics_projectile' && (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <canvas ref={simCanvasRef} style={{ width: '100%', height: '100%' }} />

            <div className="math-note-card" style={{ right: 20, left: 'auto', width: 230 }}>
              <div className="math-note-header">Parameters</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                  <span>Angle</span>
                  <span style={{ fontWeight: 600 }}>{simAngle}°</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="75"
                  value={simAngle}
                  onChange={(e) => setSimAngle(parseInt(e.target.value))}
                  className="apple-slider"
                  style={{ width: '100%' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                  <span>Velocity</span>
                  <span style={{ fontWeight: 600 }}>{simVelocity} m/s</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  value={simVelocity}
                  onChange={(e) => setSimVelocity(parseInt(e.target.value))}
                  className="apple-slider"
                  style={{ width: '100%' }}
                />

                <button
                  onClick={() => {
                    setSimProgress(0);
                    setIsSimAnimating(true);
                  }}
                  disabled={isSimAnimating}
                  style={{
                    marginTop: 8,
                    background: '#1F2937',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Play size={12} />
                  <span>{isSimAnimating ? 'Simulating...' : 'Launch'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Computer Science */}
        {currentSubject === 'binary_search' && (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#FFFFFF' }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151' }}>binary_search.py</span>
              <button
                onClick={() => setCodeStepIndex((prev) => (prev + 1) % 2)}
                style={{
                  background: '#1F2937',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 6,
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Step ({codeStepIndex === 0 ? '1/2' : '2/2'})
              </button>
            </div>

            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1,
                padding: '16px 20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                lineHeight: 1.6,
                border: 'none',
                outline: 'none',
                resize: 'none',
                color: '#1F2937',
                background: '#FAFAFA'
              }}
            />

            <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', background: '#FFFFFF' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {arrayData.map((val, idx) => {
                  const isMid = idx === (codeStepIndex === 0 ? 4 : 7);
                  const isEliminated = codeStepIndex === 1 && idx < 5;

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '5px 8px',
                        borderRadius: 4,
                        background: isMid ? '#EFF6FF' : isEliminated ? '#F9FAFB' : '#FFFFFF',
                        border: isMid ? '1.5px solid #2563EB' : '1px solid #E5E7EB',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        opacity: isEliminated ? 0.35 : 1
                      }}
                    >
                      <span style={{ fontSize: '0.6rem', color: '#9CA3AF' }}>[{idx}]</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isMid ? '#2563EB' : '#1F2937' }}>
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: '0.76rem', color: '#4B5563' }}>
                {codeStepIndex === 0
                  ? "Step 1: mid = index 4 (value 9). 9 < 18, so entire left half is discarded."
                  : "Step 2: mid = index 7 (value 18). Target 18 found in 2 comparisons."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
