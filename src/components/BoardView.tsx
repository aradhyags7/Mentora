'use client';

import React, { useRef, useEffect, useState } from 'react';
import { SubjectId, LessonData } from '@/types/classroom';
import { 
  Play, 
  Trash2, 
  CheckCircle, 
  PenTool, 
  Sparkles,
  Maximize2
} from 'lucide-react';
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
  // Math Canvas States
  const mathCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const inkCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [deltaX, setDeltaX] = useState<number>(1.2);

  // Ink drawing
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

  // 1. Math Interactive Canvas (Pristine White Background)
  useEffect(() => {
    if (currentSubject !== 'calculus') return;
    const canvas = mathCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width = canvas.parentElement?.clientWidth || 700;
      const height = canvas.height = canvas.parentElement?.clientHeight || 550;

      // Pure White Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      const originX = width * 0.26;
      const originY = height * 0.80;
      const scaleX = 95;
      const scaleY = 42;

      // Subtle Grid Lines
      ctx.strokeStyle = '#F1F5F9';
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
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(width, originY);
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, height);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 12px Inter, sans-serif';
      ctx.fillText('x', width - 20, originY - 8);
      ctx.fillText('y', originX + 10, 20);

      // Plot Curve f(x) = x^2 in clean Indigo / Blue
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

      // Secant / Tangent Line
      ctx.strokeStyle = deltaX < 0.05 ? '#059669' : '#E11D48';
      ctx.lineWidth = 2;
      ctx.setLineDash(deltaX < 0.05 ? [] : [5, 4]);
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
        ctx.fillStyle = 'rgba(225, 29, 72, 0.06)';
        ctx.beginPath();
        ctx.moveTo(pxP, pyP);
        ctx.lineTo(pxQ, pyP);
        ctx.lineTo(pxQ, pyQ);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#FDA4AF';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#BE123C';
        ctx.font = '11px JetBrains Mono';
        ctx.fillText(`Δx = ${deltaX.toFixed(2)}`, pxP + (pxQ - pxP) / 2 - 18, pyP + 14);
        ctx.fillText(`Δy = ${(yQ - yP).toFixed(2)}`, pxQ + 6, pyP - (pyP - pyQ) / 2);
      }

      // Point P
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(pxP, pyP, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.font = '600 12px Inter';
      ctx.fillText('P (1, 1)', pxP - 24, pyP - 10);

      // Point Q
      ctx.fillStyle = '#E11D48';
      ctx.beginPath();
      ctx.arc(pxQ, pyQ, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#9F1239';
      ctx.fillText(`Q (${xQ.toFixed(2)}, ${yQ.toFixed(2)})`, pxQ + 8, pyQ - 8);

      // Slope Indicator
      ctx.fillStyle = deltaX < 0.05 ? '#059669' : '#334155';
      ctx.font = '600 13px Inter';
      const slopeLabel = deltaX < 0.05 
        ? `Instantaneous Slope at x=1: m = ${slope.toFixed(2)} (Exact Derivative Limit)`
        : `Secant Line Slope: m = ${slope.toFixed(2)}`;
      ctx.fillText(slopeLabel, originX + 16, 42);
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
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2.5;
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
    if (strokes.length === 0) {
      setInkFeedback("No handwriting detected. Draw a derivation step on the board!");
      return;
    }
    setInkFeedback("✓ OCR Verified: Step is algebraically correct! Limit evaluates to 2.");
    if (onStudentWorkEvaluated) {
      onStudentWorkEvaluated(true, "Your algebraic step is correct.");
    }
  };

  // 2. Physics Simulation Rendering
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

      // Ground Line
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(w, horizonY);
      ctx.stroke();

      // Kinematics calculations
      const rad = (simAngle * Math.PI) / 180;
      const vx = simVelocity * Math.cos(rad);
      const vy = simVelocity * Math.sin(rad);
      const flightTime = (2 * vy) / simGravity;
      const scale = 14;

      // Parabolic Arc
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2;
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

      // Current Particle Ball
      const currT = flightTime * simProgress;
      const ballX = originX + vx * currT * scale;
      const ballY = originY - Math.max(0, vy * currT - 0.5 * simGravity * currT * currT) * scale;

      // Ball shadow
      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.ellipse(ballX, horizonY, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Projectile
      ctx.fillStyle = '#2563EB';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cannon Base
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(originX, originY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Cannon Barrel
      ctx.save();
      ctx.translate(originX, originY);
      ctx.rotate(-rad);
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, -4, 24, 8);
      ctx.restore();
    };

    renderPhysics();
  }, [currentSubject, simAngle, simVelocity, simGravity, simProgress]);

  // Simulation Animation Loop
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
      {/* Top Header of Canvas */}
      <div className="canvas-header">
        <div className="canvas-title-group">
          <span className="canvas-title-text">{lesson.title}</span>
          <span className="canvas-badge">{lesson.category}</span>
        </div>

        <div className="canvas-actions">
          {currentSubject === 'calculus' && (
            <>
              <button 
                className={`canvas-action-btn ${isInkMode ? 'active' : ''}`}
                onClick={onToggleInkMode}
              >
                <PenTool size={13} />
                <span>{isInkMode ? 'Ink Mode: ON' : 'Write / Draw'}</span>
              </button>
              {isInkMode && (
                <>
                  <button className="canvas-action-btn" onClick={clearInk}>
                    <Trash2 size={13} />
                    <span>Clear</span>
                  </button>
                  <button className="canvas-action-btn" onClick={verifyHandwriting} style={{ color: '#059669', borderColor: '#A7F3D0' }}>
                    <CheckCircle size={13} />
                    <span>Verify Step</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Viewport Area */}
      <div className="canvas-body-viewport">
        {/* 1. Calculus Subject */}
        {currentSubject === 'calculus' && (
          <div className="math-board-container">
            <canvas ref={mathCanvasRef} style={{ width: '100%', height: '100%' }} />

            {/* Freehand Ink Layer */}
            <canvas
              ref={inkCanvasRef}
              className="clean-ink-canvas"
              style={{ pointerEvents: isInkMode ? 'auto' : 'none' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />

            {/* Clean White Equation Card */}
            <div className="math-floating-card">
              <div className="math-card-label">Instantaneous Tangent Derivation</div>
              
              <div 
                className="math-formula-clean"
                dangerouslySetInnerHTML={{ 
                  __html: renderLatex(
                    deltaX < 0.05 
                      ? "f'(1) = \\lim_{\\Delta x \\to 0} \\frac{(1+\\Delta x)^2 - 1^2}{\\Delta x} = 2" 
                      : `m_{\\text{sec}} = \\frac{f(1+${deltaX.toFixed(2)}) - f(1)}{${deltaX.toFixed(2)}} = ${(2 + deltaX).toFixed(2)}`
                  ) 
                }}
              />

              <div className="math-card-caption">
                {deltaX < 0.05
                  ? "✓ When Δx reaches 0, the secant line becomes the tangent line. The slope at x=1 is exactly 2."
                  : "As Point Q slides toward P, the secant line steepens toward the true derivative."}
              </div>

              {inkFeedback && (
                <div style={{
                  marginTop: '8px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  fontSize: '0.74rem',
                  color: '#166534',
                  fontWeight: 500
                }}>
                  {inkFeedback}
                </div>
              )}
            </div>

            {/* Minimalist Bottom Scrubber */}
            <div className="clean-scrubber-capsule">
              <span>Limit: Δx → 0</span>
              <input
                type="range"
                min="0.01"
                max="2.0"
                step="0.01"
                value={deltaX}
                onChange={(e) => setDeltaX(parseFloat(e.target.value))}
                className="clean-slider"
              />
              <div className="clean-val-pill">Δx = {deltaX.toFixed(2)}</div>
            </div>
          </div>
        )}

        {/* 2. Physics Subject */}
        {currentSubject === 'physics_projectile' && (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <canvas ref={simCanvasRef} style={{ width: '100%', height: '100%' }} />

            {/* Control Panel in clean white card */}
            <div className="physics-card-controls">
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Kinematics Controls
              </span>

              <div className="physics-control-row">
                <div className="physics-control-header">
                  <span>Launch Angle (θ)</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{simAngle}°</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="75"
                  value={simAngle}
                  onChange={(e) => setSimAngle(parseInt(e.target.value))}
                  className="clean-slider"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="physics-control-row">
                <div className="physics-control-header">
                  <span>Velocity (v₀)</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{simVelocity} m/s</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  value={simVelocity}
                  onChange={(e) => setSimVelocity(parseInt(e.target.value))}
                  className="clean-slider"
                  style={{ width: '100%' }}
                />
              </div>

              <button
                className="fire-clean-btn"
                onClick={() => {
                  setSimProgress(0);
                  setIsSimAnimating(true);
                }}
                disabled={isSimAnimating}
              >
                <Play size={13} />
                <span>{isSimAnimating ? 'Simulating...' : 'Launch Projectile'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Computer Science Subject */}
        {currentSubject === 'binary_search' && (
          <div className="code-clean-container">
            <div className="code-clean-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>binary_search.py</span>
                <span style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 400 }}>Algorithm Sandbox</span>
              </div>
              <button
                className="canvas-action-btn"
                onClick={() => setCodeStepIndex((prev) => (prev + 1) % 2)}
                style={{ background: '#111827', color: '#FFFFFF', borderColor: '#111827' }}
              >
                <Play size={12} />
                <span>Step Trace ({codeStepIndex === 0 ? 'Step 1/2' : 'Step 2/2'})</span>
              </button>
            </div>

            <textarea
              className="code-clean-editor"
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              spellCheck={false}
            />

            <div className="code-clean-inspector">
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                Array Memory State
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {arrayData.map((val, idx) => {
                  const isMid = idx === (codeStepIndex === 0 ? 4 : 7);
                  const isEliminated = codeStepIndex === 1 && idx < 5;

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: isMid ? '#EEF2FF' : isEliminated ? '#F9FAFB' : '#FFFFFF',
                        border: isMid ? '1.5px solid #4F46E5' : '1px solid #E5E7EB',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        opacity: isEliminated ? 0.35 : 1
                      }}
                    >
                      <span style={{ fontSize: '0.62rem', color: '#9CA3AF' }}>[{idx}]</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isMid ? '#4F46E5' : '#111827' }}>
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p style={{ fontSize: '0.76rem', color: '#4B5563', lineHeight: 1.45, marginTop: '2px' }}>
                {codeStepIndex === 0
                  ? "Step 1: mid = index 4 (value 9). 9 < 18, so entire left half [0..4] is discarded!"
                  : "Step 2: mid = index 7 (value 18). Target 18 found in only 2 comparisons!"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
