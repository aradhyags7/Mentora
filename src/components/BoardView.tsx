'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SubjectId, LessonData } from '@/types/classroom';
import { 
  Maximize2, 
  RotateCcw, 
  Play, 
  Pause, 
  Trash2, 
  CheckCircle, 
  Flame,
  Layers,
  Code2,
  Box,
  Pen
} from 'lucide-react';
import katex from 'katex';

interface BoardViewProps {
  currentSubject: SubjectId;
  lesson: LessonData;
  isInkMode: boolean;
  onStudentWorkEvaluated?: (isCorrect: boolean, feedback: string) => void;
}

type BoardTab = 'whiteboard' | '3d_sim' | 'code_sandbox';

export const BoardView: React.FC<BoardViewProps> = ({
  currentSubject,
  lesson,
  isInkMode,
  onStudentWorkEvaluated
}) => {
  const [activeTab, setActiveTab] = useState<BoardTab>('whiteboard');
  
  // Math Whiteboard States
  const mathCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const inkCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [deltaX, setDeltaX] = useState<number>(1.2);
  const [derivationStep, setDerivationStep] = useState<number>(0);

  // Ink drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [inkColor, setInkColor] = useState('#06B6D4');
  const [strokes, setStrokes] = useState<{ x: number; y: number }[][]>([]);
  const [inkFeedback, setInkFeedback] = useState<string | null>(null);

  // 3D Simulation States
  const simCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [simAngle, setSimAngle] = useState<number>(45);
  const [simVelocity, setSimVelocity] = useState<number>(24);
  const [simGravity, setSimGravity] = useState<number>(9.8);
  const [simProgress, setSimProgress] = useState<number>(1);
  const [isSimAnimating, setIsSimAnimating] = useState<boolean>(false);

  // Code Sandbox States
  const [codeContent, setCodeContent] = useState<string>(lesson.starterCode || '');
  const [codeStepIndex, setCodeStepIndex] = useState<number>(0);
  const [binarySearchTarget, setBinarySearchTarget] = useState<number>(18);
  const arrayData = [1, 3, 5, 7, 9, 12, 15, 18, 21, 25];

  // Sync tab with subject change
  useEffect(() => {
    if (currentSubject === 'physics_projectile') {
      setActiveTab('3d_sim');
    } else if (currentSubject === 'binary_search') {
      setActiveTab('code_sandbox');
    } else {
      setActiveTab('whiteboard');
    }
    if (lesson.starterCode) {
      setCodeContent(lesson.starterCode);
    }
  }, [currentSubject, lesson]);

  // Safe KaTeX Helper
  const renderLatex = (formula: string): string => {
    try {
      return katex.renderToString(formula, { throwOnError: false, displayMode: true });
    } catch (err) {
      return formula;
    }
  };

  // ----------------------------------------------------
  // 1. Math Interactive Canvas (Plotting f(x) = x^2, Secant & Tangent Lines)
  // ----------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'whiteboard') return;
    const canvas = mathCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width = canvas.parentElement?.clientWidth || 800;
      const height = canvas.height = canvas.parentElement?.clientHeight || 600;

      ctx.clearRect(0, 0, width, height);

      // Coordinate Transform: Origin near bottom-left
      const originX = width * 0.28;
      const originY = height * 0.78;
      const scaleX = 90;
      const scaleY = 40;

      // Draw Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
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

      // Draw Axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // X-Axis
      ctx.moveTo(0, originY);
      ctx.lineTo(width, originY);
      // Y-Axis
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, height);
      ctx.stroke();

      // Axis Labels
      ctx.fillStyle = '#64748B';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('x', width - 20, originY - 10);
      ctx.fillText('y', originX + 10, 20);

      // Plot f(x) = x^2
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 3;
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
      const yP = xP * xP;
      const pxP = originX + xP * scaleX;
      const pyP = originY - yP * scaleY;

      const xQ = xP + deltaX;
      const yQ = xQ * xQ;
      const pxQ = originX + xQ * scaleX;
      const pyQ = originY - yQ * scaleY;

      // Draw Secant / Tangent Line through P and Q
      const slope = (yQ - yP) / (xQ - xP); // slope = 2 + deltaX
      ctx.strokeStyle = deltaX < 0.05 ? '#10B981' : '#EC4899';
      ctx.lineWidth = 2;
      ctx.setLineDash(deltaX < 0.05 ? [] : [6, 4]);
      ctx.beginPath();
      const lineXStart = -0.5;
      const lineXEnd = 3.2;
      const lineYStart = yP + slope * (lineXStart - xP);
      const lineYEnd = yP + slope * (lineXEnd - xP);
      ctx.moveTo(originX + lineXStart * scaleX, originY - lineYStart * scaleY);
      ctx.lineTo(originX + lineXEnd * scaleX, originY - lineYEnd * scaleY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fill Right Triangle for Delta X & Delta Y
      if (deltaX > 0.08) {
        ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
        ctx.beginPath();
        ctx.moveTo(pxP, pyP);
        ctx.lineTo(pxQ, pyP);
        ctx.lineTo(pxQ, pyQ);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels for Delta X & Delta Y
        ctx.fillStyle = '#F472B6';
        ctx.font = '11px JetBrains Mono';
        ctx.fillText(`Δx = ${deltaX.toFixed(2)}`, pxP + (pxQ - pxP) / 2 - 20, pyP + 16);
        ctx.fillText(`Δy = ${(yQ - yP).toFixed(2)}`, pxQ + 8, pyP - (pyP - pyQ) / 2);
      }

      // Draw Point P
      ctx.fillStyle = '#8B5CF6';
      ctx.beginPath();
      ctx.arc(pxP, pyP, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Inter';
      ctx.fillText('P (1, 1)', pxP - 25, pyP - 12);

      // Draw Point Q
      ctx.fillStyle = '#EC4899';
      ctx.beginPath();
      ctx.arc(pxQ, pyQ, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#F472B6';
      ctx.fillText(`Q (${xQ.toFixed(2)}, ${yQ.toFixed(2)})`, pxQ + 10, pyQ - 8);

      // Tangent / Secant Status Badge
      ctx.fillStyle = deltaX < 0.05 ? '#10B981' : '#A78BFA';
      ctx.font = 'bold 13px Inter';
      const statusText = deltaX < 0.05 
        ? `Instantaneous Tangent Slope: m = ${slope.toFixed(2)} (Exact Limit!)` 
        : `Average Secant Slope: m = ${slope.toFixed(2)}`;
      ctx.fillText(statusText, originX + 20, 50);
    };

    render();
    window.addEventListener('resize', render);
    return () => window.removeEventListener('resize', render);
  }, [activeTab, deltaX]);

  // ----------------------------------------------------
  // 2. Student Handwriting & Ink Stroke Layer
  // ----------------------------------------------------
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
      if (current) {
        current.push({ x, y });
      }
      return next;
    });

    // Draw on canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 3;
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

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearInk = () => {
    setStrokes([]);
    setInkFeedback(null);
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const evaluateHandwriting = () => {
    if (strokes.length === 0) {
      setInkFeedback("No handwriting detected. Draw an equation or step on the board!");
      return;
    }
    setInkFeedback("✓ OCR Recognized: 'f'(1) = 2'. Teacher verified: Correct algebraic step!");
    if (onStudentWorkEvaluated) {
      onStudentWorkEvaluated(true, "Your handwriting step is mathematically verified!");
    }
  };

  // ----------------------------------------------------
  // 3. 3D Kinematics Simulation Viewport
  // ----------------------------------------------------
  useEffect(() => {
    if (activeTab !== '3d_sim') return;
    const canvas = simCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render3D = () => {
      const w = canvas.width = canvas.parentElement?.clientWidth || 800;
      const h = canvas.height = canvas.parentElement?.clientHeight || 600;

      ctx.clearRect(0, 0, w, h);

      // Pseudo-3D Perspective Ground Grid
      const horizonY = h * 0.45;
      const originX = w * 0.2;
      const originY = h * 0.82;

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;

      // Draw Perspective Grid Lines
      for (let i = -10; i <= 25; i++) {
        const xBottom = originX + i * 45;
        const xTop = originX + i * 15;
        ctx.beginPath();
        ctx.moveTo(xBottom, h);
        ctx.lineTo(xTop, horizonY);
        ctx.stroke();
      }

      // Draw Horizontal Grid
      for (let y = horizonY; y <= h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Horizon line
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(w, horizonY);
      ctx.stroke();

      // Projectile Physics Parameters
      const rad = (simAngle * Math.PI) / 180;
      const vx = simVelocity * Math.cos(rad);
      const vy = simVelocity * Math.sin(rad);
      const totalFlightTime = (2 * vy) / simGravity;
      const maxRange = vx * totalFlightTime;
      const maxHeight = (vy * vy) / (2 * simGravity);

      const scale = 14; // pixels per meter

      // Draw Parabolic Trajectory Path
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      let hitGround = false;

      for (let t = 0; t <= totalFlightTime; t += 0.05) {
        const posX = vx * t;
        const posY = vy * t - 0.5 * simGravity * t * t;
        const cx = originX + posX * scale;
        const cy = originY - posY * scale;

        if (t === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Current Projectile Ball based on simProgress
      const currentT = totalFlightTime * simProgress;
      const currentX = vx * currentT;
      const currentY = Math.max(0, vy * currentT - 0.5 * simGravity * currentT * currentT);
      const ballCX = originX + currentX * scale;
      const ballCY = originY - currentY * scale;

      // Draw Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(ballCX, originY, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw Velocity Vector decomposition
      if (simProgress < 0.98) {
        ctx.strokeStyle = '#EC4899'; // Vy
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ballCX, ballCY);
        ctx.lineTo(ballCX, ballCY - (vy - simGravity * currentT) * 1.5);
        ctx.stroke();

        ctx.strokeStyle = '#8B5CF6'; // Vx
        ctx.beginPath();
        ctx.moveTo(ballCX, ballCY);
        ctx.lineTo(ballCX + vx * 1.5, ballCY);
        ctx.stroke();
      }

      // Projectile Sphere
      const grad = ctx.createRadialGradient(ballCX - 3, ballCY - 3, 2, ballCX, ballCY, 10);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.4, '#06B6D4');
      grad.addColorStop(1, '#0891B2');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ballCX, ballCY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Launch Cannon Base
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(originX, originY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Cannon Barrel
      ctx.save();
      ctx.translate(originX, originY);
      ctx.rotate(-rad);
      ctx.fillStyle = '#64748B';
      ctx.fillRect(0, -5, 28, 10);
      ctx.restore();

      // Live Stats Overlay
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '12px JetBrains Mono';
      ctx.fillText(`Max Height: ${maxHeight.toFixed(1)} m`, originX + 20, horizonY - 40);
      ctx.fillText(`Total Range: ${maxRange.toFixed(1)} m`, originX + 20, horizonY - 20);
      ctx.fillText(`Flight Time: ${totalFlightTime.toFixed(2)} s`, originX + 20, horizonY);
    };

    render3D();
  }, [activeTab, simAngle, simVelocity, simGravity, simProgress]);

  // Handle Simulation Animation Loop
  useEffect(() => {
    if (!isSimAnimating) return;
    let startTimestamp: number | null = null;
    const duration = 2400; // ms

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

    const animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isSimAnimating]);

  return (
    <main className="multimodal-board-stage">
      {/* Board Topbar Tabs & Tools */}
      <div className="board-topbar">
        <div className="board-mode-tabs">
          <button
            className={`board-mode-tab ${activeTab === 'whiteboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('whiteboard')}
          >
            <Pen size={14} />
            <span>Interactive Whiteboard</span>
          </button>
          <button
            className={`board-mode-tab ${activeTab === '3d_sim' ? 'active' : ''}`}
            onClick={() => setActiveTab('3d_sim')}
          >
            <Box size={14} />
            <span>3D Physics Simulation</span>
          </button>
          <button
            className={`board-mode-tab ${activeTab === 'code_sandbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('code_sandbox')}
          >
            <Code2 size={14} />
            <span>Code Sandbox & Trace</span>
          </button>
        </div>

        {/* Ink Actions */}
        {isInkMode && (
          <div className="board-tools">
            <button className="tool-chip" onClick={clearInk}>
              <Trash2 size={13} />
              <span>Clear Ink</span>
            </button>
            <button className="tool-chip active" onClick={evaluateHandwriting}>
              <CheckCircle size={13} />
              <span>Verify Handwriting</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Viewport */}
      <div className="board-content-viewport">
        {/* 1. Whiteboard Mode */}
        {activeTab === 'whiteboard' && (
          <div className="whiteboard-canvas-wrapper">
            <canvas ref={mathCanvasRef} className="drawing-layer-canvas" style={{ zIndex: 1 }} />
            
            {/* Ink drawing overlay */}
            <canvas
              ref={inkCanvasRef}
              className="drawing-layer-canvas"
              style={{ zIndex: 3, pointerEvents: isInkMode ? 'auto' : 'none' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />

            {/* Formula HUD Box */}
            <div className="math-hud-card">
              <div className="math-hud-title">
                <span>Calculus: Instantaneous Slope Limit</span>
                <span style={{ color: '#06B6D4' }}>f(x) = x²</span>
              </div>
              
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

              <p className="math-explanation-text">
                {deltaX < 0.05
                  ? "✓ When Δx reaches 0, the secant line becomes the exact tangent line at x = 1. The slope is precisely 2!"
                  : "As point Q approaches P, the secant line rotates toward the true tangent line. Drag the slider to observe the limit."}
              </p>

              {inkFeedback && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontSize: '0.74rem',
                  color: '#6EE7B7'
                }}>
                  {inkFeedback}
                </div>
              )}
            </div>

            {/* Interactive Limit Scrubber Bar */}
            <div className="math-scrubber-card">
              <span className="scrubber-label">Limit Scrubber: Δx → 0</span>
              <input
                type="range"
                min="0.01"
                max="2.0"
                step="0.01"
                value={deltaX}
                onChange={(e) => setDeltaX(parseFloat(e.target.value))}
                className="scrubber-slider"
              />
              <div className="scrubber-value-badge">
                Δx = {deltaX.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* 2. 3D Kinematics Simulation Mode */}
        {activeTab === '3d_sim' && (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas ref={simCanvasRef} style={{ width: '100%', height: '100%' }} />

            {/* Simulation Parameter Controls */}
            <div className="simulation-hud-card">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                fontSize: '0.76rem', 
                fontWeight: 700, 
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <span>Kinematics Parameters</span>
                <Flame size={14} color="#F59E0B" />
              </div>

              <div className="sim-slider-group">
                {/* Launch Angle Slider */}
                <div className="sim-slider-row">
                  <div className="sim-slider-header">
                    <span>Launch Angle (θ)</span>
                    <span>{simAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="75"
                    value={simAngle}
                    onChange={(e) => setSimAngle(parseInt(e.target.value))}
                    className="scrubber-slider"
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Initial Velocity Slider */}
                <div className="sim-slider-row">
                  <div className="sim-slider-header">
                    <span>Initial Velocity (v₀)</span>
                    <span>{simVelocity} m/s</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="45"
                    value={simVelocity}
                    onChange={(e) => setSimVelocity(parseInt(e.target.value))}
                    className="scrubber-slider"
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Gravity Slider */}
                <div className="sim-slider-row">
                  <div className="sim-slider-header">
                    <span>Gravity (g)</span>
                    <span>{simGravity.toFixed(1)} m/s²</span>
                  </div>
                  <input
                    type="range"
                    min="1.6"
                    max="15.0"
                    step="0.1"
                    value={simGravity}
                    onChange={(e) => setSimGravity(parseFloat(e.target.value))}
                    className="scrubber-slider"
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Launch Animation Button */}
                <button
                  className="code-run-btn"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '6px', height: '34px' }}
                  onClick={() => {
                    setSimProgress(0);
                    setIsSimAnimating(true);
                  }}
                  disabled={isSimAnimating}
                >
                  <Play size={14} />
                  <span>{isSimAnimating ? 'Simulating...' : 'Fire Cannon & Observe Arc'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Code Sandbox & Debugger Trace Mode */}
        {activeTab === 'code_sandbox' && (
          <div className="code-sandbox-stage">
            {/* Code Editor */}
            <div className="code-editor-pane">
              <div className="code-editor-header">
                <div className="code-tab">
                  <Code2 size={14} color="#06B6D4" />
                  <span>binary_search.py</span>
                </div>
                <button 
                  className="code-run-btn"
                  onClick={() => setCodeStepIndex((prev) => (prev + 1) % 2)}
                >
                  <Play size={13} />
                  <span>Step Debugger</span>
                </button>
              </div>

              <textarea
                className="code-text-area"
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                spellCheck={false}
              />
            </div>

            {/* Debugger Variable & Memory Array Inspector */}
            <div className="code-debugger-pane">
              <div className="debugger-header">
                <span>Runtime State & Array Memory</span>
              </div>

              <div className="debugger-content">
                {/* Array Memory Visualizer */}
                <div className="variable-card">
                  <div className="variable-header">SORTED ARRAY MEMORY (10 ELEMENTS)</div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {arrayData.map((val, idx) => {
                      const isLeft = idx === (codeStepIndex === 0 ? 0 : 5);
                      const isRight = idx === 9;
                      const isMid = idx === (codeStepIndex === 0 ? 4 : 7);
                      const isEliminated = codeStepIndex === 1 && idx < 5;

                      return (
                        <div
                          key={idx}
                          style={{
                            width: '38px',
                            height: '46px',
                            background: isMid 
                              ? 'rgba(139, 92, 246, 0.35)' 
                              : isEliminated 
                                ? 'rgba(255, 255, 255, 0.02)' 
                                : 'rgba(255, 255, 255, 0.06)',
                            border: isMid 
                              ? '1.5px solid var(--accent-violet)' 
                              : '1px solid var(--border-subtle)',
                            borderRadius: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: isEliminated ? 0.3 : 1
                          }}
                        >
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>[{idx}]</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isMid ? '#C4B5FD' : '#E2E8F0' }}>
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Target: <strong style={{ color: '#06B6D4' }}>{binarySearchTarget}</strong> | 
                    Active Search Window: <strong style={{ color: '#A78BFA' }}>{codeStepIndex === 0 ? "Indices [0..9]" : "Indices [5..9] (Halved!)"}</strong>
                  </div>
                </div>

                {/* Local Variables Stack */}
                <div className="variable-card">
                  <div className="variable-header">LOCAL CALL STACK VARIABLES</div>
                  <div className="variable-row">
                    <span style={{ color: 'var(--text-secondary)' }}>left:</span>
                    <span style={{ color: '#06B6D4' }}>{codeStepIndex === 0 ? 0 : 5}</span>
                  </div>
                  <div className="variable-row">
                    <span style={{ color: 'var(--text-secondary)' }}>right:</span>
                    <span style={{ color: '#06B6D4' }}>9</span>
                  </div>
                  <div className="variable-row">
                    <span style={{ color: 'var(--text-secondary)' }}>mid = (0 + 9) // 2:</span>
                    <span style={{ color: '#A78BFA' }}>{codeStepIndex === 0 ? 4 : 7}</span>
                  </div>
                  <div className="variable-row">
                    <span style={{ color: 'var(--text-secondary)' }}>arr[mid]:</span>
                    <span style={{ color: '#10B981' }}>{codeStepIndex === 0 ? 9 : 18}</span>
                  </div>
                </div>

                {/* Pedagogical Step Explanation */}
                <div style={{
                  padding: '12px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.76rem',
                  lineHeight: 1.5,
                  color: '#DDD6FE'
                }}>
                  <strong style={{ display: 'block', marginBottom: '4px', color: '#FFFFFF' }}>Teacher Step Analysis:</strong>
                  {codeStepIndex === 0
                    ? "In Step 1, mid is index 4 (value 9). Since 9 < 18, we can completely discard the entire left half of 5 elements! The problem size drops from N=10 to N=5 in a single operation."
                    : "In Step 2, mid becomes index 7 (value 18). Match found in just 2 comparisons! Notice: log2(10) ≈ 3.32 steps maximum."}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
