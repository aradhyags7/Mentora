'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import { MathEquationPrimitive } from '../../types/kinetic';
import { getEntityVisualState } from '../../lib/engine/sceneGraph';

interface Props {
  entity: MathEquationPrimitive;
  latex?: string;
  colorMap?: Record<string, string>;
  drawProgress?: number;
  highlightTerm?: string;
  explanationCallout?: string;
  scale?: number;
  isDimmed?: boolean;
}

const DEFAULT_COLOR_MAP: Record<string, string> = {
  '\\Delta x': '#F59E0B', // Amber
  '\\Delta y': '#38BDF8', // Cyan
  "f'(x)": '#10B981',     // Emerald
  '\\frac{dy}{dx}': '#10B981',
  'f(x)': '#A855F7',      // Purple
  'x_0': '#EC4899',       // Pink
};

const TOKEN_LABELS: Record<string, string> = {
  '\\Delta x': 'Δx = Step Interval (Run)',
  '\\Delta y': 'Δy = Vertical Rise',
  "f'(x)": "f'(x) = Instantaneous Slope",
  '\\frac{dy}{dx}': 'dy/dx = Derivative Slope',
  'f(x)': 'f(x) = Function Curve',
  'x_0': 'x₀ = Base Coordinate',
};

/**
 * 3Blue1Brown Semantic LaTeX Token Colorizer.
 * Wraps matched mathematical terms in \textcolor{#HEX}{...} so LaTeX variables
 * directly mirror the geometric colors of the graph.
 */
function colorizeLatex(latex: string, colorMap: Record<string, string>): string {
  let result = latex;
  const sortedTokens = Object.keys(colorMap).sort((a, b) => b.length - a.length);

  for (const token of sortedTokens) {
    const hex = colorMap[token];
    if (!hex) continue;
    if (result.includes(`\\textcolor{${hex}}{${token}}`)) continue;

    // Replace occurrences not already in a textcolor wrapper
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<!\\\\textcolor\\{[^}]*\\}\\{)${escaped}`, 'g');
    result = result.replace(regex, `\\textcolor{${hex}}{${token}}`);
  }
  return result;
}

export const MathEquationPrimitiveRenderer: React.FC<Props> = ({
  entity,
  latex: directLatex,
  colorMap: directColorMap,
  drawProgress: directDrawProgress,
  explanationCallout,
  scale = 1.0,
  isDimmed: directDimmed,
}) => {
  const activeLatex = directLatex || entity.latex || '';
  const explanation = explanationCallout || entity.explanation;
  const activeColorMap = { ...DEFAULT_COLOR_MAP, ...(entity.colorMap || directColorMap) };

  // Dynamic visual state
  const visualState = getEntityVisualState(entity.id || 'eq_default');
  const isDimmed = directDimmed ?? visualState.isDimmed;
  const drawProgress = Math.max(0, Math.min(1, directDrawProgress ?? entity.drawProgress ?? visualState.drawProgress));

  // Preprocess LaTeX with 3B1B color locking
  const processedLatex = useMemo(() => {
    return colorizeLatex(activeLatex, activeColorMap);
  }, [activeLatex, activeColorMap]);

  // Render HTML via KaTeX
  const html = useMemo(() => {
    try {
      return katex.renderToString(processedLatex, {
        throwOnError: false,
        displayMode: true,
      });
    } catch {
      return activeLatex;
    }
  }, [processedLatex, activeLatex]);

  // Extract active tokens present in this formula for the interactive legend
  const presentTokens = useMemo(() => {
    return Object.keys(activeColorMap).filter(token => activeLatex.includes(token));
  }, [activeLatex, activeColorMap]);

  const position = entity.position;

  return (
    <div
      id={`equation-${entity.id}`}
      style={{
        position: position ? 'absolute' : 'relative',
        left: position ? `calc(50% + ${position.x}px)` : undefined,
        top: position ? `calc(50% + ${position.y}px)` : undefined,
        transform: position
          ? `translate(-50%, -50%) scale(${scale}) translateY(${(1 - drawProgress) * 8}px)`
          : `scale(${scale}) translateY(${(1 - drawProgress) * 8}px)`,
        transformOrigin: 'center center',
        background: 'rgba(11, 15, 25, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        padding: '14px 20px',
        boxShadow: '0 10px 30px -4px rgba(0, 0, 0, 0.65)',
        opacity: isDimmed ? 0.18 : drawProgress > 0.1 ? 1 : drawProgress * 10,
        transition: 'opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        zIndex: 12,
        maxWidth: 580,
      }}
    >
      {/* 3B1B Progressive Reveal via clip-path wipe */}
      <div
        style={{
          clipPath: `inset(0 ${(1 - drawProgress) * 100}% 0 0)`,
          transition: 'clip-path 0.08s linear',
        }}
      >
        <div
          className="equation-rendered"
          dangerouslySetInnerHTML={{ __html: html }}
          style={{
            color: '#F8FAFC',
            fontSize: 18,
            overflowX: 'auto',
            padding: '2px 0',
          }}
        />
      </div>

      {/* Explanation Banner */}
      {explanation && (
        <div
          style={{
            fontSize: 12,
            color: '#94A3B8',
            marginTop: 6,
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {explanation}
        </div>
      )}

      {/* 3B1B Interactive Semantic Color Token Legend */}
      {presentTokens.length > 0 && drawProgress >= 0.4 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 8,
            marginTop: 10,
            paddingTop: 8,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            opacity: drawProgress > 0.6 ? 1 : (drawProgress - 0.4) / 0.2,
            transition: 'opacity 0.3s ease',
          }}
        >
          {presentTokens.map(tok => {
            const hex = activeColorMap[tok];
            const label = TOKEN_LABELS[tok] || tok;
            return (
              <div
                key={tok}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#CBD5E1',
                  background: 'rgba(2, 6, 23, 0.55)',
                  border: `1px solid ${hex}44`,
                  padding: '3px 8px',
                  borderRadius: 999,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: hex,
                    boxShadow: `0 0 6px ${hex}`,
                  }}
                />
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
