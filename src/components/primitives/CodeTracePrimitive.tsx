'use client';

import React from 'react';
import { CodeTracePrimitive as CodeTraceType } from '../../types/kinetic';

interface Props {
  entity: CodeTraceType;
}

// Lightweight syntax highlighter for code keywords & literals
function highlightLine(line: string) {
  const tokens = line.split(/(\s+|[()[\]{},;:.]|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/);

  const keywords = new Set([
    'def', 'function', 'const', 'let', 'var', 'if', 'else', 'elif',
    'while', 'for', 'in', 'of', 'return', 'class', 'import', 'from',
    'as', 'yield', 'async', 'await', 'break', 'continue', 'true', 'false',
    'null', 'undefined', 'None', 'True', 'False', 'not', 'and', 'or'
  ]);

  return tokens.map((token, i) => {
    if (!token) return null;
    if (keywords.has(token)) {
      return (
        <span key={i} className="text-purple-400 font-semibold">
          {token}
        </span>
      );
    }
    if (/^"(.*)"$/.test(token) || /^'(.*)'$/.test(token)) {
      return (
        <span key={i} className="text-emerald-300">
          {token}
        </span>
      );
    }
    if (/^\d+(\.\d+)?$/.test(token)) {
      return (
        <span key={i} className="text-amber-300 font-mono">
          {token}
        </span>
      );
    }
    if (/^[A-Z][a-zA-Z0-9_]*$/.test(token)) {
      return (
        <span key={i} className="text-cyan-300">
          {token}
        </span>
      );
    }
    if (token.startsWith('//') || token.startsWith('#')) {
      return (
        <span key={i} className="text-slate-500 italic">
          {token}
        </span>
      );
    }
    return <span key={i}>{token}</span>;
  });
}

export const CodeTracePrimitive: React.FC<Props> = ({ entity }) => {
  const {
    title = 'algorithm.py',
    language = 'python',
    codeLines = [],
    activeLine,
    highlightedLines = [],
    variableWatch,
    complexityBadge,
    isDimmed,
    drawProgress = 1,
  } = entity;

  const prevWatchRef = React.useRef<Record<string, string | number>>({});
  React.useEffect(() => {
    if (variableWatch) {
      prevWatchRef.current = variableWatch;
    }
  }, [variableWatch]);

  const watchEntries = variableWatch ? Object.entries(variableWatch) : [];

  return (
    <div
      className={`relative w-[540px] select-none rounded-xl border border-slate-700/80 bg-[#0B0F19]/95 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-500 ${
        isDimmed ? 'opacity-30 blur-[1px]' : 'opacity-100'
      }`}
      style={{
        opacity: drawProgress,
        transform: `scale(${0.94 + drawProgress * 0.06})`,
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 20px rgba(56, 189, 248, 0.1)',
      }}
    >
      {/* IDE Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/70 px-4 py-2.5">
        <div className="flex items-center gap-3">
          {/* Traffic Light Dots */}
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#EF4444] opacity-80" />
            <span className="h-3 w-3 rounded-full bg-[#F59E0B] opacity-80" />
            <span className="h-3 w-3 rounded-full bg-[#10B981] opacity-80" />
          </div>

          <div className="flex items-center gap-2 pl-2">
            <span className="font-mono text-xs font-semibold text-slate-300">
              {title}
            </span>
            <span className="rounded bg-slate-800/70 px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider text-slate-400">
              {language}
            </span>
          </div>
        </div>

        {/* Optional Big-O Complexity Badges */}
        {complexityBadge && (
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="rounded bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 text-cyan-300 font-semibold shadow-[0_0_8px_rgba(56,189,248,0.2)]">
              Time: {complexityBadge.time}
            </span>
            <span className="rounded bg-purple-950/80 border border-purple-800/60 px-2 py-0.5 text-purple-300 font-semibold shadow-[0_0_8px_rgba(168,85,247,0.2)]">
              Space: {complexityBadge.space}
            </span>
          </div>
        )}
      </div>

      {/* Code Lines Body */}
      <div className="py-2.5 font-mono text-xs leading-relaxed max-h-[380px] overflow-y-auto">
        {codeLines.map((line, idx) => {
          const lineNum = idx + 1;
          const isActive = activeLine === lineNum;
          const isHighlighted = highlightedLines.includes(lineNum);

          return (
            <div
              key={lineNum}
              className={`relative flex items-center transition-colors duration-200 ${
                isActive
                  ? 'border-l-4 border-amber-400 bg-amber-500/15 text-white shadow-[inset_0_0_12px_rgba(245,158,11,0.15)] font-bold'
                  : isHighlighted
                  ? 'border-l-2 border-cyan-400 bg-cyan-500/10 text-cyan-100'
                  : 'border-l-4 border-transparent text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              {/* Line Number */}
              <div
                className={`w-10 select-none pr-3 text-right text-[11px] ${
                  isActive ? 'text-amber-400 font-bold' : 'text-slate-600'
                }`}
              >
                {lineNum}
              </div>

              {/* Execution Pointer Indicator */}
              <div className="w-5 flex-shrink-0 text-center">
                {isActive && (
                  <span className="inline-block animate-bounce text-sm">
                    👉
                  </span>
                )}
              </div>

              {/* Syntax Highlighted Line */}
              <div className="flex-1 pr-4 whitespace-pre font-mono">
                {highlightLine(line)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Variable Watch Bar */}
      {watchEntries.length > 0 && (
        <div className="border-t border-slate-800/90 bg-slate-950/80 px-4 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10B981]" />
            <span className="font-mono text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Live Variable Watch
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {watchEntries.map(([key, value]) => {
              return (
                <div
                  key={key}
                  className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-[#0B0F19] px-2 py-1 font-mono text-[11px] shadow-sm transition-all duration-300"
                >
                  <span className="text-slate-400 font-medium">{key}:</span>
                  <span className="font-bold text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                    {String(value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
