'use client';

import React from 'react';
import { StackHashMapPrimitive as StackHashMapType } from '../../types/kinetic';

interface Props {
  entity: StackHashMapType;
}

export const StackHashMapPrimitive: React.FC<Props> = ({ entity }) => {
  const {
    title,
    variant = 'call_stack',
    entries = [],
    isDimmed,
    drawProgress = 1,
  } = entity;

  const isStackOrQueue = variant === 'call_stack' || variant === 'monotonic_stack' || variant === 'queue';

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
      {/* Title Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              isStackOrQueue
                ? 'bg-purple-400 shadow-[0_0_8px_#A855F7]'
                : 'bg-amber-400 shadow-[0_0_8px_#F59E0B]'
            }`}
          />
          <h3 className="font-mono text-xs font-bold tracking-wider text-slate-200 uppercase">
            {title}
          </h3>
        </div>
        <span className="rounded bg-slate-900/80 px-2 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-800">
          {variant.replace('_', ' ')}
        </span>
      </div>

      {isStackOrQueue ? (
        /* Vertical Stack / Queue Open Container */
        <div className="relative w-[280px]">
          {/* Top of Stack Indicator */}
          <div className="flex items-center justify-between px-2 pb-1 font-mono text-[10px] text-slate-500">
            <span>TOP (LIFO)</span>
            <span>▲</span>
          </div>

          {/* Open-top Bucket */}
          <div className="flex flex-col-reverse gap-2 rounded-b-xl border-b-2 border-l-2 border-r-2 border-slate-700/80 bg-[#0B0F19]/90 p-3 shadow-2xl backdrop-blur-xl min-h-[160px]">
            {entries.length === 0 ? (
              <div className="flex items-center justify-center py-8 font-mono text-xs text-slate-600 italic">
                (empty stack)
              </div>
            ) : (
              entries.map((entry, idx) => {
                const isPushed = entry.state === 'pushed';
                const isPopping = entry.state === 'popping';
                const isTop = idx === entries.length - 1;

                return (
                  <div
                    key={`stack_entry_${idx}_${entry.key}`}
                    className={`relative flex items-center justify-between rounded-lg border px-3 py-2 font-mono text-xs font-semibold shadow-md transition-all duration-300 ${
                      isPopping
                        ? 'border-red-400/80 bg-red-500/15 text-red-300 -translate-y-2 opacity-40 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                        : isPushed
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.4)] animate-pulse'
                        : isTop
                        ? 'border-purple-400/80 bg-purple-500/15 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                        : 'border-slate-800 bg-slate-900/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">#{idx}</span>
                      <span className="text-slate-100">{entry.key}</span>
                    </div>
                    {entry.value && (
                      <span className="text-amber-300 font-bold">{entry.value}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Hash Map Key ➔ Value Bucket Table */
        <div className="w-[340px] rounded-xl border border-slate-800/80 bg-[#0B0F19]/95 shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-2 border-b border-slate-800 bg-slate-950/70 px-4 py-2 font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <div>Key (Hash)</div>
            <div className="text-right">Value</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-800/60 p-2 max-h-[260px] overflow-y-auto">
            {entries.length === 0 ? (
              <div className="py-6 text-center font-mono text-xs text-slate-600 italic">
                (empty hash table)
              </div>
            ) : (
              entries.map((entry, idx) => {
                const isHit = entry.state === 'lookup_hit';
                const isMiss = entry.state === 'lookup_miss';

                return (
                  <div
                    key={`hash_entry_${idx}_${entry.key}`}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 font-mono text-xs transition-all duration-300 ${
                      isHit
                        ? 'border border-emerald-400/90 bg-emerald-500/20 text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.35)] scale-[1.02]'
                        : isMiss
                        ? 'border border-amber-400/90 bg-amber-500/20 text-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.35)]'
                        : 'text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-600">[{idx}]</span>
                      <span className="font-semibold text-slate-200">{entry.key}</span>
                      {isHit && (
                        <span className="text-[10px] text-emerald-400 font-bold">✓ HIT</span>
                      )}
                      {isMiss && (
                        <span className="text-[10px] text-amber-400 font-bold">✗ MISS</span>
                      )}
                    </div>
                    <div className="text-right font-bold text-cyan-300">
                      {entry.value}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
