'use client';

import React from 'react';
import { TreeGraphPrimitive as TreeGraphType, TreeGraphNode } from '../../types/kinetic';

interface Props {
  entity: TreeGraphType;
}

export const TreeGraphPrimitive: React.FC<Props> = ({ entity }) => {
  const {
    title,
    variant = 'binary_tree',
    nodes = [],
    edges = [],
    activePointer,
    isDimmed,
    drawProgress = 1,
  } = entity;

  // Compute node coordinates with graceful fallbacks
  const positionedNodes = React.useMemo(() => {
    return nodes.map((node, i) => {
      let x = node.x ?? node.rx;
      let y = node.y ?? node.ry;

      if (x === undefined || y === undefined) {
        if (variant === 'linked_list') {
          x = 60 + i * 140;
          y = 80;
        } else if (variant === 'binary_tree' || variant === 'recursion_tree') {
          // Default hierarchical binary tree layout for up to 7 nodes
          const level = Math.floor(Math.log2(i + 1));
          const indexInLevel = i - (Math.pow(2, level) - 1);
          const totalInLevel = Math.pow(2, level);
          const spacing = 480 / (totalInLevel + 1);
          x = spacing * (indexInLevel + 1);
          y = 50 + level * 80;
        } else {
          // Circular layout for general directed graphs
          const angle = (2 * Math.PI * i) / Math.max(1, nodes.length);
          x = 220 + Math.cos(angle) * 130;
          y = 150 + Math.sin(angle) * 90;
        }
      }

      return {
        ...node,
        x,
        y,
      };
    });
  }, [nodes, variant]);

  // Lookup map for edge endpoints
  const nodeMap = React.useMemo(() => {
    const map = new Map<string, { x: number; y: number; node: TreeGraphNode }>();
    positionedNodes.forEach(n => {
      map.set(n.id, { x: n.x, y: n.y, node: n });
    });
    return map;
  }, [positionedNodes]);

  // Compute bounds for responsive container
  const bounds = React.useMemo(() => {
    if (positionedNodes.length === 0) return { minX: 0, maxX: 400, minY: 0, maxY: 300 };
    const xs = positionedNodes.map(n => n.x);
    const ys = positionedNodes.map(n => n.y);
    return {
      minX: Math.max(0, Math.min(...xs) - 60),
      maxX: Math.max(480, Math.max(...xs) + 80),
      minY: Math.max(0, Math.min(...ys) - 50),
      maxY: Math.max(260, Math.max(...ys) + 70),
    };
  }, [positionedNodes]);

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

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
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
            <h3 className="font-mono text-xs font-bold tracking-wider text-emerald-300 uppercase">
              {title}
            </h3>
          </div>
          <span className="rounded bg-slate-900/80 px-2 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-800">
            {variant.replace('_', ' ')}
          </span>
        </div>
      )}

      {/* Graph Canvas */}
      <div
        className="relative rounded-xl border border-slate-800/80 bg-[#0B0F19]/90 p-4 shadow-2xl backdrop-blur-xl overflow-visible"
        style={{ width: `${Math.max(420, width)}px`, height: `${Math.max(240, height)}px` }}
      >
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          viewBox={`${bounds.minX} ${bounds.minY} ${width} ${height}`}
        >
          <defs>
            <marker
              id="graph-arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#38BDF8" opacity="0.8" />
            </marker>
            <marker
              id="graph-arrowhead-active"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#F59E0B" />
            </marker>
          </defs>

          {/* SVG Edges */}
          {edges.map((edge, idx) => {
            const src = nodeMap.get(edge.from);
            const dst = nodeMap.get(edge.to);
            if (!src || !dst) return null;

            const dx = dst.x - src.x;
            const dy = dst.y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) return null;

            // Offset endpoint so arrowhead touches node border
            const nodeRadius = variant === 'linked_list' ? 36 : 24;
            const startX = src.x + (dx / dist) * nodeRadius;
            const startY = src.y + (dy / dist) * (variant === 'linked_list' ? 18 : nodeRadius);
            const endX = dst.x - (dx / dist) * nodeRadius;
            const endY = dst.y - (dy / dist) * (variant === 'linked_list' ? 18 : nodeRadius);

            const isTraversed = edge.state === 'traversed';
            const isActive = edge.state === 'active';
            const edgeColor = isActive ? '#F59E0B' : isTraversed ? '#10B981' : '#475569';
            const strokeWidth = isActive ? 3 : isTraversed ? 2.5 : 1.75;

            const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
            const dashOffset = length * Math.max(0, 1 - drawProgress);

            return (
              <g key={`edge_${edge.from}_${edge.to}_${idx}`}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={edgeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={length}
                  strokeDashoffset={dashOffset}
                  markerEnd={
                    edge.directed !== false
                      ? isActive
                        ? 'url(#graph-arrowhead-active)'
                        : 'url(#graph-arrowhead)'
                      : undefined
                  }
                  style={{
                    transition: 'stroke 0.3s, stroke-width 0.3s',
                    filter: isActive ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))' : undefined,
                  }}
                />
                {edge.label && (
                  <text
                    x={(startX + endX) / 2}
                    y={(startY + endY) / 2 - 8}
                    fill="#94A3B8"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="font-bold select-none"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        {positionedNodes.map(node => {
          const isVisiting = node.state === 'visiting';
          const isVisited = node.state === 'visited';
          const isTarget = node.state === 'target';
          const isBacktracked = node.state === 'backtracked';

          // Linked List Split Capsule representation
          if (variant === 'linked_list') {
            return (
              <div
                key={node.id}
                id={`tree_node_${node.id}`}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center rounded-lg border backdrop-blur-md transition-all duration-300 font-mono shadow-lg ${
                  isTarget
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_20px_rgba(56,189,248,0.5)] scale-105'
                    : isVisiting
                    ? 'border-amber-400 bg-amber-500/25 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.5)] animate-pulse'
                    : isVisited
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'border-slate-700 bg-[#0B0F19]/95 text-slate-200'
                }`}
                style={{
                  left: `${node.x - bounds.minX}px`,
                  top: `${node.y - bounds.minY}px`,
                  minWidth: '72px',
                  height: '38px',
                }}
              >
                {/* Val partition */}
                <div className="flex-1 px-3 py-1 text-center font-bold text-sm">
                  {node.label}
                </div>
                {/* Next divider */}
                <div className="border-l border-slate-700/80 px-2 py-1 text-[11px] text-slate-500 font-medium">
                  •
                </div>
              </div>
            );
          }

          // Circular node representation for Trees & Graphs
          return (
            <div
              key={node.id}
              id={`tree_node_${node.id}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center rounded-full border font-mono font-bold transition-all duration-300 shadow-xl ${
                isTarget
                  ? 'border-cyan-400 bg-cyan-500/30 text-cyan-200 shadow-[0_0_24px_rgba(56,189,248,0.7)] scale-110 ring-2 ring-cyan-400/50'
                  : isVisiting
                  ? 'border-amber-400 bg-amber-500/25 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse ring-2 ring-amber-400/40'
                  : isVisited
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.4)]'
                  : isBacktracked
                  ? 'border-purple-500 bg-purple-900/30 text-purple-300'
                  : 'border-slate-700 bg-[#0B0F19]/95 text-slate-100 hover:border-slate-500'
              }`}
              style={{
                left: `${node.x - bounds.minX}px`,
                top: `${node.y - bounds.minY}px`,
                width: '48px',
                height: '48px',
                backgroundColor: node.color ? `${node.color}25` : undefined,
                borderColor: node.color || undefined,
              }}
            >
              <span className="text-sm leading-none">{node.label}</span>
              {node.subLabel && (
                <span className="text-[9px] text-slate-400 font-normal leading-none mt-0.5">
                  {node.subLabel}
                </span>
              )}
            </div>
          );
        })}

        {/* Active Pointer Badge */}
        {activePointer && nodeMap.has(activePointer.nodeId) && (() => {
          const target = nodeMap.get(activePointer.nodeId)!;
          const color = activePointer.color || '#38BDF8';
          return (
            <div
              className="absolute -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-300 z-20"
              style={{
                left: `${target.x - bounds.minX}px`,
                top: `${target.y - bounds.minY - 38}px`,
              }}
            >
              <div
                className="rounded px-2 py-0.5 font-mono text-[11px] font-bold text-white shadow-lg"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 14px ${color}88`,
                }}
              >
                {activePointer.label}
              </div>
              <svg width="12" height="8" viewBox="0 0 12 8" style={{ fill: color }}>
                <path d="M6 8L0 0H12L6 8Z" />
              </svg>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
