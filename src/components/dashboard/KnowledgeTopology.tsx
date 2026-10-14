'use client';

import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface DAGNode {
  id: string;
  title: string;
  x: number;
  y: number;
  mastery: number; // 0.0 to 1.0
  status: 'mastered' | 'in_progress' | 'ready';
  prompt: string;
}

export interface DAGEdge {
  from: string;
  to: string;
}

export interface DAGTrack {
  id: string;
  name: string;
  nodes: DAGNode[];
  edges: DAGEdge[];
}

interface Props {
  onSelectTopic: (topicPrompt: string) => void;
}

export const KnowledgeTopology: React.FC<Props> = ({ onSelectTopic }) => {
  const [activeTrackId, setActiveTrackId] = useState<string>('dsa');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const tracks: Record<string, DAGTrack> = {
    dsa: {
      id: 'dsa',
      name: 'Algorithms & Data Structures',
      nodes: [
        { id: 'arr', title: 'Arrays & Memory', x: 80, y: 120, mastery: 0.90, status: 'mastered', prompt: 'Teach me contiguous array memory layout and pointer arithmetic' },
        { id: 'two_ptr', title: 'Two Pointers', x: 230, y: 120, mastery: 0.75, status: 'mastered', prompt: 'Explain Two Pointers and sorted array convergence from first principles' },
        { id: 'bin_search', title: 'Binary Search', x: 390, y: 65, mastery: 0.65, status: 'in_progress', prompt: 'Teach me Binary Search visually with array space halving and two pointers' },
        { id: 'sliding_win', title: 'Sliding Window', x: 390, y: 175, mastery: 0.50, status: 'in_progress', prompt: 'Teach me the Sliding Window Maximum technique with monotonic queue' },
        { id: 'tree_rec', title: 'Trees & Recursion', x: 560, y: 120, mastery: 0.30, status: 'ready', prompt: 'Visualize Binary Tree DFS traversal and recursion call stack' },
        { id: 'dp', title: 'Dynamic Programming', x: 720, y: 120, mastery: 0.15, status: 'ready', prompt: 'Teach Dynamic Programming memoization and DAG state transitions visually' },
      ],
      edges: [
        { from: 'arr', to: 'two_ptr' },
        { from: 'two_ptr', to: 'bin_search' },
        { from: 'two_ptr', to: 'sliding_win' },
        { from: 'bin_search', to: 'tree_rec' },
        { from: 'sliding_win', to: 'tree_rec' },
        { from: 'tree_rec', to: 'dp' },
      ],
    },
    calculus: {
      id: 'calculus',
      name: 'Calculus & Machine Learning',
      nodes: [
        { id: 'slopes', title: 'Functions & Slopes', x: 80, y: 120, mastery: 0.92, status: 'mastered', prompt: 'Teach functions and rates of change visually' },
        { id: 'limits', title: 'Limits (Δx → 0)', x: 230, y: 120, mastery: 0.70, status: 'in_progress', prompt: 'Teach limits from first principles as delta x approaches 0' },
        { id: 'deriv', title: 'Derivatives & Tangents', x: 390, y: 70, mastery: 0.60, status: 'in_progress', prompt: 'Teach me derivatives from first principles with an interactive tangent curve' },
        { id: 'partial', title: 'Multivariable Gradients', x: 550, y: 120, mastery: 0.35, status: 'ready', prompt: 'Teach partial derivatives and the gradient vector visually' },
        { id: 'grad_desc', title: 'Gradient Descent', x: 720, y: 120, mastery: 0.20, status: 'ready', prompt: 'Teach Gradient Descent optimization and learning rate visually' },
      ],
      edges: [
        { from: 'slopes', to: 'limits' },
        { from: 'limits', to: 'deriv' },
        { from: 'deriv', to: 'partial' },
        { from: 'partial', to: 'grad_desc' },
      ],
    },
    systems: {
      id: 'systems',
      name: 'Systems & Backend Architecture',
      nodes: [
        { id: 'tcp', title: 'TCP/HTTP Layer', x: 80, y: 120, mastery: 0.88, status: 'mastered', prompt: 'Teach TCP handshake and HTTP request streaming visually' },
        { id: 'lb', title: 'L7 Load Balancing', x: 230, y: 120, mastery: 0.65, status: 'in_progress', prompt: 'Teach Layer 7 reverse proxying and load balancing algorithms' },
        { id: 'rate_limit', title: 'Token Bucket Limiting', x: 390, y: 65, mastery: 0.55, status: 'in_progress', prompt: 'Teach Token Bucket and Leaky Bucket rate limiting algorithms' },
        { id: 'redis', title: 'Distributed Redis Cache', x: 390, y: 175, mastery: 0.40, status: 'ready', prompt: 'Teach distributed caching, cache-aside, and redis replication visually' },
        { id: 'sharding', title: 'Consensus & Sharding', x: 620, y: 120, mastery: 0.22, status: 'ready', prompt: 'Teach database horizontal sharding and Raft consensus visually' },
      ],
      edges: [
        { from: 'tcp', to: 'lb' },
        { from: 'lb', to: 'rate_limit' },
        { from: 'lb', to: 'redis' },
        { from: 'rate_limit', to: 'sharding' },
        { from: 'redis', to: 'sharding' },
      ],
    },
  };

  const currentTrack = tracks[activeTrackId] || tracks.dsa;
  const nodesMap = new Map(currentTrack.nodes.map(n => [n.id, n]));

  // Connected edges when a node is hovered
  const isEdgeHighlighted = (edge: DAGEdge) => {
    if (!hoveredNodeId) return false;
    return edge.from === hoveredNodeId || edge.to === hoveredNodeId;
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Track Switcher Navigation Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#0C0D10] border border-white/[0.06]">
          {Object.values(tracks).map(track => {
            const isActive = track.id === activeTrackId;
            return (
              <button
                key={track.id}
                type="button"
                className={`text-xs font-mono px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#181A20] text-[#F4F4F6] font-medium border border-white/[0.1] shadow-xs'
                    : 'text-[#9496A1] hover:text-[#F4F4F6] border border-transparent'
                }`}
                onClick={() => setActiveTrackId(track.id)}
              >
                {track.name}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#5E606E]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Mastered (P &ge; 75%)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>In Progress</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white/[0.2]" />
            <span>Ready to Synthesize</span>
          </span>
        </div>
      </div>

      {/* 2D SVG Directed Acyclic Graph Canvas */}
      <div className="h-[250px] w-full bg-[#090A0D] rounded-xl border border-white/[0.06] relative overflow-hidden shadow-inner">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <svg viewBox="0 0 800 240" className="w-full h-full">
          <defs>
            <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.2)" />
            </linearGradient>
            <linearGradient id="edgeActiveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>

          {/* Render Curved Cubic-Bezier Dependency Edges */}
          {currentTrack.edges.map(edge => {
            const fromNode = nodesMap.get(edge.from);
            const toNode = nodesMap.get(edge.to);
            if (!fromNode || !toNode) return null;

            const x1 = fromNode.x;
            const y1 = fromNode.y;
            const x2 = toNode.x;
            const y2 = toNode.y;
            const dx = x2 - x1;
            const pathData = `M ${x1} ${y1} C ${x1 + dx * 0.5} ${y1}, ${x1 + dx * 0.5} ${y2}, ${x2} ${y2}`;
            const highlighted = isEdgeHighlighted(edge);

            return (
              <g key={`${edge.from}->${edge.to}`}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={highlighted ? 'url(#edgeActiveGradient)' : 'rgba(255, 255, 255, 0.1)'}
                  strokeWidth={highlighted ? '2.5' : '1.5'}
                  strokeDasharray={highlighted ? '4 3' : '3 3'}
                  className={highlighted ? 'animate-pulse' : ''}
                />
              </g>
            );
          })}

          {/* Render DAG Interactive Nodes */}
          {currentTrack.nodes.map(node => {
            const isHovered = hoveredNodeId === node.id;
            const pct = Math.round(node.mastery * 100);
            const ringRadius = 16;
            const circumference = 2 * Math.PI * ringRadius;
            const strokeDashoffset = circumference - (node.mastery * circumference);

            const ringColor = node.status === 'mastered' 
              ? '#10B981' 
              : node.status === 'in_progress' 
              ? '#F59E0B' 
              : '#5E606E';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => onSelectTopic(node.prompt)}
              >
                {/* Outer Glow Halo on Hover */}
                {isHovered && (
                  <circle
                    cx="0"
                    cy="0"
                    r="24"
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="1"
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}

                {/* Node Capsule Background */}
                <circle
                  cx="0"
                  cy="0"
                  r="20"
                  fill="#121318"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1.5"
                />

                {/* BKT Mastery Background Track */}
                <circle
                  cx="0"
                  cy="0"
                  r={ringRadius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeWidth="2.5"
                />

                {/* BKT Mastery Circular Progress Ring */}
                <circle
                  cx="0"
                  cy="0"
                  r={ringRadius}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90)"
                />

                {/* Center Mastery Percentage */}
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill={isHovered ? '#F4F4F6' : '#9496A1'}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {pct}%
                </text>

                {/* Node Label Below */}
                <text
                  x="0"
                  y="34"
                  textAnchor="middle"
                  fill={isHovered ? '#FFFFFF' : '#F4F4F6'}
                  fontSize="10"
                  fontFamily="Inter, sans-serif"
                  fontWeight={isHovered ? '600' : '500'}
                  letterSpacing="-0.01em"
                >
                  {node.title}
                </text>

                {/* Floating Interactive Tooltip */}
                {isHovered && (
                  <g transform="translate(0, -32)">
                    <rect
                      x="-85"
                      y="-12"
                      width="170"
                      height="24"
                      rx="6"
                      fill="#181A20"
                      stroke="rgba(255, 255, 255, 0.16)"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#F4F4F6"
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="500"
                    >
                      Launch Live Whiteboard ↗
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
