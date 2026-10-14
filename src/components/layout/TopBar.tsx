'use client';

import React from 'react';
import { 
  PanelLeft, 
  PanelRight, 
  Sun, 
  Moon, 
  Maximize2,
  SlidersHorizontal
} from 'lucide-react';
import { extractCleanConceptTitle, inferConceptDomain } from '../../lib/utils/conceptUtils';

interface Props {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  rightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeTopic?: string;
  hasActiveArtifact: boolean;
  onExpandFullscreen?: () => void;
  studentMastery?: number;
  activeConcept?: string;
}

export const TopBar: React.FC<Props> = ({
  sidebarOpen,
  onToggleSidebar,
  rightPanelOpen,
  onToggleRightPanel,
  theme,
  onToggleTheme,
  activeTopic,
  hasActiveArtifact,
  onExpandFullscreen,
  studentMastery,
}) => {
  const masteryPercent = studentMastery !== undefined 
    ? Math.round(studentMastery * 100) 
    : (activeTopic ? 78 : null);

  const activeSegments = masteryPercent !== null 
    ? Math.min(4, Math.max(1, Math.ceil((masteryPercent / 100) * 4)))
    : 3;

  const cleanTitle = activeTopic ? extractCleanConceptTitle(activeTopic).cleanTitle : null;
  const domain = activeTopic ? inferConceptDomain(cleanTitle || activeTopic) : null;

  return (
    <header className="h-12 min-h-[48px] backdrop-blur-md bg-[#09090B]/85 border-b border-white/[0.06] flex items-center justify-between px-3.5 z-40 select-none">
      {/* Left Breadcrumb Navigation */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          className={`h-7 w-7 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
            sidebarOpen 
              ? 'bg-[#181A20] border-white/[0.12] text-[#F4F4F6]' 
              : 'border-transparent text-[#9496A1] hover:text-[#F4F4F6] hover:bg-white/[0.05]'
          }`}
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={15} />
        </button>

        {/* Breadcrumb Path */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#9496A1] font-medium tracking-tight">Mentora</span>

          <span className="text-[#5E606E]">/</span>

          {cleanTitle ? (
            <>
              {domain && (
                <>
                  <span className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[10px] text-[#9496A1] uppercase tracking-wider">
                    {domain}
                  </span>
                  <span className="text-[#5E606E]">/</span>
                </>
              )}
              <span className="text-[#F4F4F6] font-medium tracking-tight truncate max-w-[280px] sm:max-w-[420px]">
                {cleanTitle}
              </span>
            </>
          ) : (
            <span className="text-[#9496A1]">
              Workspace Overview
            </span>
          )}
        </div>
      </div>

      {/* Right Controls: BKT Mastery Telemetry + Inspector + Fullscreen + Theme */}
      <div className="flex items-center gap-2">
        {/* Live BKT Mastery Telemetry Pill */}
        {masteryPercent !== null && (
          <button
            type="button"
            className="h-7 px-2.5 rounded-md border border-white/[0.08] bg-[#121318] hover:bg-[#181A20] text-xs font-mono text-[#F4F4F6] flex items-center gap-2 transition-all cursor-pointer shadow-xs group"
            onClick={onToggleRightPanel}
            title="Inspect Bayesian Knowledge Tracing (BKT) Cognitive Model"
          >
            <div className="flex gap-0.5 items-center">
              {[1, 2, 3, 4].map(seg => (
                <span
                  key={seg}
                  className={`h-2.5 w-1 rounded-xs transition-colors ${
                    seg <= activeSegments ? 'bg-emerald-400' : 'bg-white/[0.12]'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-[#9496A1] group-hover:text-[#F4F4F6]">
              BKT Mastery: <strong className="text-emerald-400 tabular-nums">{masteryPercent}%</strong>
            </span>
          </button>
        )}

        {/* Fullscreen Classroom Button */}
        {hasActiveArtifact && onExpandFullscreen && (
          <button
            type="button"
            className="h-7 w-7 rounded-md border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] text-[#9496A1] hover:text-[#F4F4F6] flex items-center justify-center transition-all cursor-pointer"
            onClick={onExpandFullscreen}
            title="Expand Infinite Classroom Canvas"
            aria-label="Fullscreen lesson"
          >
            <Maximize2 size={13} />
          </button>
        )}

        {/* Inspector Panel Toggle Button */}
        <button
          type="button"
          className={`h-7 px-2.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            rightPanelOpen
              ? 'bg-[#181A20] border-white/[0.15] text-[#F4F4F6]'
              : 'bg-[#121318] border-white/[0.08] hover:bg-[#181A20] text-[#9496A1] hover:text-[#F4F4F6]'
          }`}
          onClick={onToggleRightPanel}
          title={rightPanelOpen ? 'Close Inspector Panel' : 'Open Inspector Panel'}
          aria-label="Toggle inspector panel"
        >
          <SlidersHorizontal size={12} className="text-[#9496A1]" />
          <span className="hidden sm:inline">Inspector</span>
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          type="button"
          className="h-7 w-7 rounded-md border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] text-[#9496A1] hover:text-[#F4F4F6] flex items-center justify-center transition-all cursor-pointer"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>
    </header>
  );
};
