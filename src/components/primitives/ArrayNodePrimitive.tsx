'use client';

import React from 'react';
import { ArrayPrimitive, ArrayPointer } from '../../types/kinetic';

interface Props {
  entity: ArrayPrimitive;
}

const CELL_WIDTH = 58;
const CELL_GAP = 10;

export const ArrayNodePrimitive: React.FC<Props> = ({ entity }) => {
  const {
    title,
    items,
    elements,
    pointers = [],
    namedPointers = [],
    highlightRange,
    swapIndices,
    isDimmed,
    drawProgress = 1,
  } = entity;

  // Unify elements or legacy items
  const cellData = React.useMemo(() => {
    if (elements && elements.length > 0) {
      return elements.map((el, idx) => ({
        id: el.id || `elem_${idx}`,
        value: el.value,
        state: el.state || 'default',
        index: idx,
      }));
    }
    if (items && items.length > 0) {
      return items.map((item, idx) => ({
        id: item.id || `item_${idx}`,
        value: item.value,
        state: item.state || 'default',
        index: item.index !== undefined ? item.index : idx,
      }));
    }
    return [];
  }, [elements, items]);

  // Merge pointers and namedPointers into a single normalized array
  const allPointers = React.useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      index: number;
      color: string;
      position: 'top' | 'bottom';
    }> = [];

    pointers.forEach((p, i) => {
      const idx = p.index !== undefined ? p.index : (p.targetIndex !== undefined ? p.targetIndex : 0);
      const name = p.name || p.label || `P${i}`;
      const color = p.color || (name.toLowerCase().includes('mid') ? '#F59E0B' : name.toLowerCase().includes('r') ? '#EF4444' : '#38BDF8');
      const pos = p.position || (name.toLowerCase().includes('mid') ? 'bottom' : 'top');
      list.push({
        id: p.id || `ptr_${i}_${name}`,
        name,
        index: idx,
        color,
        position: pos,
      });
    });

    namedPointers.forEach((np, i) => {
      const name = np.name;
      const color = np.color || (name.toLowerCase().includes('mid') ? '#F59E0B' : '#10B981');
      const pos = np.position || 'top';
      list.push({
        id: `named_ptr_${i}_${name}`,
        name,
        index: np.index,
        color,
        position: pos,
      });
    });

    return list;
  }, [pointers, namedPointers]);

  const totalWidth = cellData.length * CELL_WIDTH + Math.max(0, cellData.length - 1) * CELL_GAP;

  const getPointerLeftPx = (targetIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(cellData.length - 1, targetIndex));
    return clampedIndex * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2;
  };

  const topPointers = allPointers.filter(p => p.position === 'top');
  const bottomPointers = allPointers.filter(p => p.position === 'bottom');

  return (
    <div
      className={`relative select-none transition-all duration-500 ${
        isDimmed ? 'opacity-30 blur-[1px]' : 'opacity-100'
      }`}
      style={{
        opacity: drawProgress,
        transform: `scale(${0.92 + drawProgress * 0.08})`,
      }}
    >
      {/* Title & Badge Header */}
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38BDF8]" />
            <h3 className="font-mono text-xs font-bold tracking-wider text-cyan-300 uppercase">
              {title}
            </h3>
          </div>
          <div className="rounded bg-slate-900/80 px-2 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-800">
            size: {cellData.length}
          </div>
        </div>
      )}

      <div
        className="relative pt-12 pb-12"
        style={{ minWidth: `${totalWidth}px` }}
      >
        {/* Top Pointers */}
        {topPointers.map(ptr => {
          const left = getPointerLeftPx(ptr.index);
          return (
            <div
              key={ptr.id}
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-300"
              style={{ left: `${left}px` }}
            >
              <div
                className="rounded px-2 py-0.5 font-mono text-xs font-bold text-white shadow-lg transition-all duration-300"
                style={{
                  backgroundColor: ptr.color,
                  boxShadow: `0 0 12px ${ptr.color}88`,
                }}
              >
                {ptr.name}
              </div>
              <svg
                width="14"
                height="10"
                viewBox="0 0 14 10"
                className="mt-0.5"
                style={{ fill: ptr.color }}
              >
                <path d="M7 10L0 0H14L7 10Z" />
              </svg>
            </div>
          );
        })}

        {/* Sliding Window / Active Range Highlight */}
        {highlightRange && cellData.length > 0 && (
          <div
            className="absolute z-10 pointer-events-none rounded-lg border-2 border-dashed transition-all duration-400"
            style={{
              top: '46px',
              height: '66px',
              left: `${Math.max(0, highlightRange.start) * (CELL_WIDTH + CELL_GAP) - 4}px`,
              width: `${(Math.min(cellData.length - 1, highlightRange.end) - Math.max(0, highlightRange.start) + 1) * CELL_WIDTH + (Math.min(cellData.length - 1, highlightRange.end) - Math.max(0, highlightRange.start)) * CELL_GAP + 8}px`,
              borderColor: highlightRange.color || '#38BDF8',
              backgroundColor: `${highlightRange.color || '#38BDF8'}12`,
              boxShadow: `0 0 18px ${highlightRange.color || '#38BDF8'}44`,
            }}
          >
            {highlightRange.label && (
              <span
                className="absolute -top-3.5 left-2 px-1.5 py-0.2 rounded font-mono text-[9px] uppercase font-bold text-white"
                style={{ backgroundColor: highlightRange.color || '#38BDF8' }}
              >
                {highlightRange.label}
              </span>
            )}
          </div>
        )}

        {/* Array Cells Row */}
        <div className="flex items-center gap-[10px]">
          {cellData.map((cell, idx) => {
            const isEliminated = cell.state === 'eliminated';
            const isActive = cell.state === 'active' || cell.state === 'comparing';
            const isFound = cell.state === 'found' || cell.state === 'sorted';
            const isSwapping = cell.state === 'swapping';

            // Check if this cell is part of swapIndices
            const isSwapFirst = swapIndices && swapIndices[0] === idx;
            const isSwapSecond = swapIndices && swapIndices[1] === idx;
            let swapTransform = '';
            if (isSwapFirst && swapIndices) {
              const diff = (swapIndices[1] - swapIndices[0]) * (CELL_WIDTH + CELL_GAP);
              swapTransform = `translate(${diff * 0.5}px, -14px) scale(1.05)`;
            } else if (isSwapSecond && swapIndices) {
              const diff = (swapIndices[0] - swapIndices[1]) * (CELL_WIDTH + CELL_GAP);
              swapTransform = `translate(${diff * 0.5}px, 14px) scale(1.05)`;
            }

            return (
              <div
                key={cell.id}
                id={`array_node_${idx}`}
                className="flex flex-col items-center gap-1.5"
                style={{
                  transform: swapTransform || 'none',
                  transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {/* Index label above */}
                <span className="font-mono text-[10px] text-slate-500 font-semibold">
                  [{idx}]
                </span>

                {/* Main Memory Box */}
                <div
                  className={`relative flex items-center justify-center font-mono text-base font-bold rounded-lg border backdrop-blur-md transition-all duration-300 ${
                    isEliminated
                      ? 'border-slate-800 bg-[#0B0F19]/40 text-slate-600 opacity-25'
                      : isFound
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.4)] scale-105'
                      : isActive
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.4)] scale-105'
                      : isSwapping
                      ? 'border-purple-400 bg-purple-500/25 text-purple-300 shadow-[0_0_18px_rgba(168,85,247,0.4)]'
                      : 'border-slate-700/80 bg-[#0B0F19]/90 text-slate-100 hover:border-slate-500'
                  }`}
                  style={{
                    width: `${CELL_WIDTH}px`,
                    height: '52px',
                  }}
                >
                  {/* Diagonal strikethrough for eliminated cells */}
                  {isEliminated && (
                    <svg className="absolute inset-0 h-full w-full pointer-events-none">
                      <line
                        x1="12%"
                        y1="88%"
                        x2="88%"
                        y2="12%"
                        stroke="#EF4444"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}

                  <span className="relative z-10">{cell.value}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Pointers */}
        {bottomPointers.map(ptr => {
          const left = getPointerLeftPx(ptr.index);
          return (
            <div
              key={ptr.id}
              className="absolute bottom-0 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-300"
              style={{ left: `${left}px` }}
            >
              <svg
                width="14"
                height="10"
                viewBox="0 0 14 10"
                className="mb-0.5"
                style={{ fill: ptr.color }}
              >
                <path d="M7 0L14 10H0L7 0Z" />
              </svg>
              <div
                className="rounded px-2 py-0.5 font-mono text-xs font-bold text-white shadow-lg transition-all duration-300"
                style={{
                  backgroundColor: ptr.color,
                  boxShadow: `0 0 12px ${ptr.color}88`,
                }}
              >
                {ptr.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
