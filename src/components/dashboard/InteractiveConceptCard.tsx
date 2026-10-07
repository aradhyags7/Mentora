'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Play, Sparkles } from 'lucide-react';

export interface ConceptCardData {
  id: string;
  title: string;
  domain: string;
  tagline: string;
  description: string;
  prompt: string;
  beatsCount: number;
  previewType: 'euler' | 'binary_search' | 'gradient_descent' | 'virtual_memory';
}

interface Props {
  concept: ConceptCardData;
  onClick: () => void;
}

export const InteractiveConceptCard: React.FC<Props> = ({ concept, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [frame, setFrame] = useState(0);

  // Micro-simulation tick for interactive previews
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = time - lastTime;
      if (dt > 30) {
        setFrame(prev => (prev + 1) % 360);
        lastTime = time;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Render the specific visual micro-canvas
  const renderVisualPreview = () => {
    switch (concept.previewType) {
      case 'euler': {
        // Revolving complex phasor approaching -1 (angle = 180 deg)
        // Oscillation around pi (180 deg) to highlight e^(i*pi) = -1
        const angleRad = Math.PI + Math.sin(frame * 0.05) * 0.8;
        const cx = 70;
        const cy = 40;
        const r = 26;
        const px = cx + r * Math.cos(angleRad);
        const py = cy - r * Math.sin(angleRad);

        return (
          <div className="concept-micro-canvas euler-canvas">
            <svg viewBox="0 0 140 80" className="concept-micro-svg">
              {/* Axes */}
              <line x1="20" y1="40" x2="120" y2="40" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
              <line x1="70" y1="10" x2="70" y2="70" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
              
              {/* Unit circle */}
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="3 3" />
              
              {/* Target point at (-1, 0) */}
              <circle cx={cx - r} cy={cy} r="3" fill="#F59E0B" />
              <text x={cx - r - 12} y={cy - 5} fontSize="9" fill="#F59E0B" fontFamily="monospace" fontWeight="600">-1</text>
              
              {/* Phasor vector */}
              <line x1={cx} y1={cy} x2={px} y2={py} stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
              <circle cx={px} cy={py} r="3" fill="#6366F1" />

              {/* Angle arc */}
              <path 
                d={`M ${cx + 10} ${cy} A 10 10 0 0 0 ${cx + 10 * Math.cos(angleRad)} ${cy - 10 * Math.sin(angleRad)}`} 
                fill="none" 
                stroke="#6366F1" 
                strokeWidth="1" 
                strokeOpacity="0.5" 
              />
              <text x="76" y="24" fontSize="8" fill="currentColor" opacity="0.6" fontFamily="monospace">e^(iθ)</text>
            </svg>
          </div>
        );
      }

      case 'binary_search': {
        // Step cycle: Low/High narrowing down
        const step = Math.floor((frame % 120) / 30);
        // Step 0: [0..6], mid 3
        // Step 1: target > mid -> [4..6], mid 5
        // Step 2: match at 5!
        // Step 3: pause
        const targetIdx = 5;
        const low = step === 0 ? 0 : 4;
        const high = 6;
        const mid = step === 0 ? 3 : 5;

        return (
          <div className="concept-micro-canvas binary-canvas">
            <svg viewBox="0 0 140 80" className="concept-micro-svg">
              {/* Array cells */}
              {[1, 3, 7, 12, 19, 28, 35].map((val, idx) => {
                const x = 12 + idx * 17;
                const isEliminated = (step > 0 && idx < low) || idx > high;
                const isMid = idx === mid;
                const isFound = step >= 2 && idx === targetIdx;

                return (
                  <g key={idx}>
                    <rect
                      x={x}
                      y="32"
                      width="14"
                      height="20"
                      rx="3"
                      fill={
                        isFound
                          ? 'rgba(16, 185, 129, 0.25)'
                          : isMid
                          ? 'rgba(99, 102, 241, 0.25)'
                          : isEliminated
                          ? 'rgba(100, 116, 139, 0.1)'
                          : 'rgba(255, 255, 255, 0.05)'
                      }
                      stroke={
                        isFound
                          ? '#10B981'
                          : isMid
                          ? '#6366F1'
                          : isEliminated
                          ? 'rgba(100, 116, 139, 0.3)'
                          : 'currentColor'
                      }
                      strokeWidth={isMid || isFound ? '1.5' : '1'}
                      strokeOpacity={isEliminated ? '0.3' : '0.6'}
                    />
                    <text
                      x={x + 7}
                      y="46"
                      textAnchor="middle"
                      fontSize="8"
                      fill={isFound ? '#10B981' : isMid ? '#6366F1' : 'currentColor'}
                      opacity={isEliminated ? '0.3' : '0.8'}
                      fontFamily="monospace"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Pointer indicators */}
              <text x="12" y="24" fontSize="8" fill="#F59E0B" fontFamily="monospace">O(log n)</text>
              <text x="75" y="68" fontSize="8" fill="#6366F1" fontFamily="monospace" textAnchor="middle">
                {step >= 2 ? 'Found target 28!' : `Mid → [${[1, 3, 7, 12, 19, 28, 35][mid]}]`}
              </text>
            </svg>
          </div>
        );
      }

      case 'gradient_descent': {
        // Loss curve parabola L(w) = a * w^2
        // Ball rolling down
        const progress = (frame % 100) / 100;
        // w starts at 1.8, decays to ~0.1
        const w = 1.8 * Math.pow(0.2, progress);
        const bx = 70 + w * 28;
        const by = 65 - Math.pow(w, 2) * 12;

        return (
          <div className="concept-micro-canvas gradient-canvas">
            <svg viewBox="0 0 140 80" className="concept-micro-svg">
              {/* Parabola curve */}
              <path
                d="M 18 16 Q 70 75 122 16"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.3"
                strokeWidth="1.5"
              />
              
              {/* Minimum point */}
              <circle cx="70" cy="65" r="2.5" fill="#10B981" />
              <text x="70" y="75" textAnchor="middle" fontSize="7" fill="#10B981" fontFamily="monospace">min L(w)</text>
              
              {/* Descent tangent / step */}
              <line x1={bx - 10} y1={by - 5} x2={bx + 10} y2={by + 5} stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 2" />

              {/* Descent Ball */}
              <circle cx={bx} cy={by} r="4" fill="#6366F1" />
              <circle cx={bx} cy={by} r="7" fill="#6366F1" opacity="0.3" />

              <text x="24" y="22" fontSize="8" fill="#6366F1" fontFamily="monospace">w ← w - η∇L</text>
            </svg>
          </div>
        );
      }

      case 'virtual_memory': {
        // Translation flow from VPN -> Page Table -> PPN
        const pulse = (frame % 60) / 60;
        const dotX = 26 + pulse * 88;

        return (
          <div className="concept-micro-canvas vm-canvas">
            <svg viewBox="0 0 140 80" className="concept-micro-svg">
              {/* Virtual Address Block */}
              <rect x="14" y="25" width="28" height="30" rx="3" fill="rgba(99, 102, 241, 0.15)" stroke="#6366F1" strokeWidth="1" />
              <text x="28" y="42" textAnchor="middle" fontSize="7" fill="#6366F1" fontFamily="monospace">VIRT</text>

              {/* Arrow */}
              <line x1="42" y1="40" x2="56" y2="40" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />

              {/* Page Table Block */}
              <rect x="56" y="20" width="30" height="40" rx="3" fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth="1" />
              <text x="71" y="38" textAnchor="middle" fontSize="7" fill="#F59E0B" fontFamily="monospace">PAGE</text>
              <text x="71" y="48" textAnchor="middle" fontSize="7" fill="#F59E0B" fontFamily="monospace">TABLE</text>

              {/* Arrow */}
              <line x1="86" y1="40" x2="100" y2="40" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />

              {/* Physical RAM Block */}
              <rect x="100" y="25" width="28" height="30" rx="3" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="1" />
              <text x="114" y="42" textAnchor="middle" fontSize="7" fill="#10B981" fontFamily="monospace">PHYS</text>

              {/* Luminous translation bit packet */}
              <circle cx={dotX} cy="40" r="2.5" fill="#38BDF8" />

              <text x="70" y="72" textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.6" fontFamily="monospace">TLB Fast-Path</text>
            </svg>
          </div>
        );
      }
    }
  };

  return (
    <div
      className={`interactive-concept-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Top Header: Domain badge & interactive indicator */}
      <div className="concept-card-top">
        <span className="concept-card-domain-badge">{concept.domain}</span>
        <div className="concept-card-beats-chip">
          <Sparkles size={11} className="beats-icon" />
          <span>{concept.beatsCount} beats</span>
          <ArrowUpRight size={13} className="beats-arrow" />
        </div>
      </div>

      {/* Main Title & Tagline */}
      <div className="concept-card-body">
        <h3 className="concept-card-title">{concept.title}</h3>
        <p className="concept-card-description">{concept.description}</p>
      </div>

      {/* Live Interactive Visual Micro-Simulation Canvas */}
      <div className="concept-card-preview-zone">
        {renderVisualPreview()}
        <div className="concept-card-launch-overlay">
          <span className="launch-text">
            <Play size={10} fill="currentColor" />
            Launch Visual Lesson
          </span>
        </div>
      </div>
    </div>
  );
};
