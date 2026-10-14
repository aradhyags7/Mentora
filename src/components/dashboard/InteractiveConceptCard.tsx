'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface ConceptCardData {
  id: string;
  title: string;
  domain: string;
  tagline: string;
  description: string;
  prompt: string;
  beatsCount: number;
  previewType: 'binary_search' | 'two_sum' | 'sliding_window' | 'linked_list' | 'tree_dfs' | 'derivative' | 'gradient_descent' | 'euler' | 'virtual_memory';
  domainTag?: string;
  category?: 'dsa' | 'calculus' | 'systems';
}

interface Props {
  concept: ConceptCardData;
  onClick: () => void;
}

export const InteractiveConceptCard: React.FC<Props> = ({ concept, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [scrubProgress, setScrubProgress] = useState(0.5);
  const [idleTick, setIdleTick] = useState(0);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Smooth idle oscillation when not scrubbing
  useEffect(() => {
    let animId: number;
    let start = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - start) / 1000;
      setIdleTick(elapsed);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Compute effective progress: cursor position if hovered, else smooth harmonic breathing
  const progress = isHovered 
    ? scrubProgress 
    : 0.5 + 0.42 * Math.sin(idleTick * 1.8);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setScrubProgress(x / rect.width);
  };

  // Domain metadata tag
  const getDomainTag = () => {
    if (concept.domainTag) return concept.domainTag;
    switch (concept.previewType) {
      case 'binary_search': return 'ALGORITHMS • ARRAY / POINTERS';
      case 'two_sum': return 'HASH TABLE • O(1) LOOKUP';
      case 'sliding_window': return 'SLIDING WINDOW • O(N) LINEAR';
      case 'linked_list':
      case 'tree_dfs': return 'LINKED LIST • IN-PLACE REVERSAL';
      case 'derivative': return 'CALCULUS • LIMIT Δx → 0';
      case 'gradient_descent': return 'OPTIMIZATION • GRADIENTS';
      default: return 'COMPUTER SCIENCE • FOUNDATIONS';
    }
  };

  // Render the interactive scrubbed micro-canvas
  const renderMicroSimulation = () => {
    const p = Math.max(0, Math.min(1, progress));

    switch (concept.previewType) {
      case 'binary_search': {
        const step = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
        const low = step === 0 ? 0 : 4;
        const high = 6;
        const mid = step === 0 ? 3 : 5;
        const items = [1, 3, 7, 12, 19, 28, 35];
        const isHit = step === 2;

        return (
          <div className="w-full h-full relative select-none flex flex-col justify-between p-3">
            {/* Top Telemetry Monospace */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#9496A1]">
              <span className="text-[#38BDF8]">target: 28</span>
              <span className="tabular-nums">
                low: <span className="text-[#F4F4F6]">{low}</span> | mid: <span className="text-amber-400 font-semibold">{mid}</span> | high: <span className="text-[#F4F4F6]">{high}</span>
              </span>
            </div>

            {/* Micro Array Cells */}
            <div className="flex items-center justify-center gap-1.5 my-auto">
              {items.map((val, idx) => {
                const isEliminated = (step > 0 && idx < low) || idx > high;
                const isMid = idx === mid;
                const isTarget = isHit && idx === 5;

                return (
                  <div
                    key={idx}
                    className={`h-11 flex-1 max-w-[38px] rounded flex flex-col items-center justify-center font-mono text-xs transition-all duration-150 border ${
                      isTarget
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                        : isMid
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : isEliminated
                        ? 'bg-white/[0.02] border-white/[0.04] text-[#5E606E]/40 line-through'
                        : 'bg-white/[0.04] border-white/[0.08] text-[#F4F4F6]'
                    }`}
                  >
                    <span className="text-[9px] text-[#5E606E] mb-0.5">{idx}</span>
                    <span className="tabular-nums font-semibold">{val}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Invariant Banner */}
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-emerald-400">
                {isHit ? '✓ Invariant Maintained: arr[mid] == 28 (Found)' : `Halving remaining: [${low}..${high}]`}
              </span>
              <span className="text-[#5E606E]">O(log n)</span>
            </div>
          </div>
        );
      }

      case 'two_sum': {
        const step = p < 0.4 ? 0 : p < 0.75 ? 1 : 2;
        const currIdx = step === 0 ? 0 : 1;
        const complement = step === 0 ? 7 : 2;
        const isFound = step === 2;

        return (
          <div className="w-full h-full relative select-none flex flex-col justify-between p-3">
            {/* Telemetry Header */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#9496A1]">
              <span className="text-[#38BDF8]">target: 9</span>
              <span className="tabular-nums">
                complement: <span className="text-amber-400 font-semibold">{complement}</span>
              </span>
            </div>

            {/* Two Sum Array + Complement Lookup Stage */}
            <div className="flex items-center justify-between gap-3 my-auto">
              <div className="flex items-center gap-1.5 flex-1">
                {[2, 7, 11, 15].map((val, idx) => {
                  const isCur = idx === currIdx;
                  const isPair = (idx === 0 || idx === 1) && isFound;

                  return (
                    <div
                      key={idx}
                      className={`h-11 flex-1 rounded flex flex-col items-center justify-center font-mono text-xs transition-all border ${
                        isPair
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                          : isCur
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-white/[0.04] border-white/[0.08] text-[#9496A1]'
                      }`}
                    >
                      <span className="text-[9px] text-[#5E606E]">{idx}</span>
                      <span className="tabular-nums font-semibold">{val}</span>
                    </div>
                  );
                })}
              </div>

              {/* Mini HashMap Bucket */}
              <div className="h-11 px-2.5 rounded bg-[#121318] border border-white/[0.1] flex flex-col justify-center font-mono text-[10px]">
                <span className="text-[#5E606E]">seen_map</span>
                <span className={isFound ? 'text-emerald-400 font-semibold' : 'text-[#38BDF8]'}>
                  {step === 0 ? '{ 2: 0 }' : '{ 2: 0, 7: HIT }'}
                </span>
              </div>
            </div>

            {/* Bottom Status */}
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className={isFound ? 'text-emerald-400 font-semibold' : 'text-[#9496A1]'}>
                {isFound ? '✓ Pair: nums[0] + nums[1] = 9' : 'O(1) hash table lookup'}
              </span>
              <span className="text-[#5E606E]">Time: O(n)</span>
            </div>
          </div>
        );
      }

      case 'sliding_window': {
        const windowSize = 3;
        const totalItems = 6;
        const maxOffset = totalItems - windowSize;
        const left = Math.min(maxOffset, Math.floor(p * (maxOffset + 0.99)));
        const right = left + windowSize - 1;
        const items = [1, 3, -1, -3, 5, 3];
        const windowVals = items.slice(left, left + windowSize);
        const windowMax = Math.max(...windowVals);

        return (
          <div className="w-full h-full relative select-none flex flex-col justify-between p-3">
            {/* Telemetry Header */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#9496A1]">
              <span className="text-amber-400">k = 3</span>
              <span className="tabular-nums">
                L: <span className="text-[#F4F4F6]">{left}</span> | R: <span className="text-[#F4F4F6]">{right}</span> | max: <span className="text-emerald-400 font-bold">{windowMax}</span>
              </span>
            </div>

            {/* Sliding Array Cells */}
            <div className="flex items-center justify-center gap-1.5 my-auto relative">
              {items.map((val, idx) => {
                const inWindow = idx >= left && idx <= right;
                const isMax = inWindow && val === windowMax;

                return (
                  <div
                    key={idx}
                    className={`h-11 flex-1 max-w-[42px] rounded flex flex-col items-center justify-center font-mono text-xs transition-all border ${
                      isMax
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : inWindow
                        ? 'bg-sky-500/15 border-sky-400/50 text-[#F4F4F6]'
                        : 'bg-white/[0.03] border-white/[0.06] text-[#5E606E]'
                    }`}
                  >
                    <span className="text-[9px] text-[#5E606E]">{idx}</span>
                    <span className="tabular-nums font-semibold">{val}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Queue Status */}
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-sky-400">
                Window: [{windowVals.join(', ')}]
              </span>
              <span className="text-[#5E606E]">Monotonic Queue</span>
            </div>
          </div>
        );
      }

      case 'derivative': {
        const dx = Math.max(0.01, 2.0 * (1 - p) + 0.01);
        const x1 = 55;
        const y1 = 50;
        const x2 = x1 + dx * 24;
        const y2 = y1 - (Math.pow((x2 - 25)/20, 2) - Math.pow((x1 - 25)/20, 2)) * 14;
        const isTang = dx < 0.15;

        return (
          <div className="w-full h-full relative select-none flex flex-col justify-between p-3">
            {/* Telemetry Header */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#9496A1]">
              <span className="text-[#38BDF8]">f(x) = x²</span>
              <span className="tabular-nums">
                Δx: <span className="text-amber-400 font-semibold">{dx.toFixed(2)}</span> | slope: <span className="text-emerald-400 font-bold">{(4.00 / (1 + dx * 0.1)).toFixed(2)}</span>
              </span>
            </div>

            {/* SVG Secant / Tangent Curve */}
            <svg viewBox="0 0 160 60" className="w-full h-12 my-auto overflow-visible">
              {/* Parabola */}
              <path d="M 20 54 Q 65 52 140 10" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
              
              {/* Point A */}
              <circle cx={x1} cy={y1} r="3" fill="#38BDF8" />
              
              {/* Point B (collapsing to A) */}
              {!isTang && (
                <circle cx={x2} cy={y2} r="2.5" fill="#F59E0B" />
              )}

              {/* Secant or Tangent line */}
              <line
                x1={x1 - 35}
                y1={y1 + (y1 - y2) * (35 / Math.max(1, x2 - x1))}
                x2={x1 + 45}
                y2={y1 - (y1 - y2) * (45 / Math.max(1, x2 - x1))}
                stroke={isTang ? '#10B981' : '#F59E0B'}
                strokeWidth={isTang ? '2' : '1.5'}
                strokeDasharray={isTang ? 'none' : '3 2'}
              />
            </svg>

            {/* Bottom Limit Invariant */}
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className={isTang ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                {isTang ? "✓ Instantaneous Tangent: f'(x) = 2x" : "Secant Line: Δy / Δx"}
              </span>
              <span className="text-[#5E606E]">lim Δx → 0</span>
            </div>
          </div>
        );
      }

      default: {
        // Linked List / Tree DFS in-place pointer reversal
        const step = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
        const prev = step === 0 ? 'null' : step === 1 ? '1' : '2';
        const curr = step === 0 ? '1' : step === 1 ? '2' : '3';
        const next = step === 0 ? '2' : step === 1 ? '3' : '4';

        return (
          <div className="w-full h-full relative select-none flex flex-col justify-between p-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#9496A1]">
              <span className="text-amber-400">prev: {prev}</span>
              <span className="tabular-nums">
                curr: <span className="text-[#F4F4F6] font-bold">{curr}</span> | next: <span className="text-[#38BDF8]">{next}</span>
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 my-auto font-mono text-xs">
              {[1, 2, 3, 4].map((n, i) => {
                const isReversed = i < step;
                const isCurr = i === step;

                return (
                  <React.Fragment key={n}>
                    <div className={`w-9 h-9 rounded flex items-center justify-center border font-semibold ${
                      isCurr 
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : isReversed
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-white/[0.04] border-white/[0.08] text-[#9496A1]'
                    }`}>
                      {n}
                    </div>
                    {i < 3 && (
                      <span className={`text-xs ${i < step ? 'text-emerald-400 font-bold' : 'text-[#5E606E]'}`}>
                        {i < step ? '←' : '→'}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-emerald-400">
                curr.next = prev (O(1) memory)
              </span>
              <span className="text-[#5E606E]">In-Place</span>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div
      ref={cardRef}
      className="group relative rounded-xl bg-[#111217] hover:bg-[#15171E] border border-white/[0.07] hover:border-white/[0.16] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-200 overflow-hidden flex flex-col justify-between p-5 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      {/* Top Metadata Bar */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono tracking-wider text-[#9496A1] uppercase font-semibold">
            {getDomainTag()}
          </span>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#5E606E] group-hover:text-[#9496A1] transition-colors">
            <span>4 Zones • {concept.beatsCount} Beats</span>
            <ArrowUpRight 
              size={13} 
              className="text-[#5E606E] group-hover:text-[#F4F4F6] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" 
            />
          </div>
        </div>

        {/* Title & Concise Technical Thesis */}
        <h3 className="text-base font-semibold tracking-tight text-[#F4F4F6] mt-2 group-hover:text-white transition-colors">
          {concept.title}
        </h3>
        <p className="text-xs text-[#9496A1] leading-relaxed mt-1 line-clamp-2">
          {concept.description}
        </p>
      </div>

      {/* Interactive Cursor-Scrubbed Micro-Canvas */}
      <div className="h-36 mt-4 rounded-lg bg-[#090A0D] border border-white/[0.05] relative overflow-hidden group-hover:border-white/[0.12] transition-colors">
        {/* Coordinate micro grid background */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Live Simulation Render */}
        {renderMicroSimulation()}

        {/* Subtle scrub indicator bar at bottom of micro-canvas */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.05]">
          <div 
            className="h-full bg-emerald-400/80 transition-all duration-75"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      {/* Bottom Footer Strip with 4 Zones */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#5E606E] mt-3.5 pt-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[#9496A1]">
            Zone A: Intuition
          </span>
          <span className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[#9496A1]">
            Zone B: Dry-Run
          </span>
          <span className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[#9496A1]">
            Zone C: Code Trace
          </span>
          <span className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[#9496A1]">
            Zone D: Proof
          </span>
        </div>

        <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
          Launch ↗
        </span>
      </div>
    </div>
  );
};
