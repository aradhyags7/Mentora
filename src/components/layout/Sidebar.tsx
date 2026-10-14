'use client';

import React from 'react';
import { 
  SquarePen, 
  PanelLeftClose, 
  SlidersHorizontal,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { extractCleanConceptTitle } from '../../lib/utils/conceptUtils';

export interface RecentLessonItem {
  id: string;
  semanticKey: string;
  title: string;
  domain: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeNav: string;
  onSelectNav: (navId: string) => void;
  recentLessons: RecentLessonItem[];
  activeLessonId?: string;
  onSelectLesson: (semanticKey: string) => void;
  onNewLesson: () => void;
  onOpenSettings?: () => void;
}

function getDomainDotClass(domain: string = '', title: string = '') {
  const combined = `${domain} ${title}`.toLowerCase();
  if (
    combined.includes('calc') || 
    combined.includes('math') || 
    combined.includes('deriv') || 
    combined.includes('integral') ||
    combined.includes('limit')
  ) {
    return 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]';
  }
  if (
    combined.includes('system') || 
    combined.includes('distributed') || 
    combined.includes('cache') || 
    combined.includes('redis') || 
    combined.includes('tcp') || 
    combined.includes('architecture')
  ) {
    return 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.6)]';
  }
  // Default to Emerald for Algorithms, DSA, Programming
  return 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]';
}

export const Sidebar: React.FC<Props> = ({
  isOpen,
  onClose,
  activeNav,
  onSelectNav,
  recentLessons,
  activeLessonId,
  onSelectLesson,
  onNewLesson,
  onOpenSettings,
}) => {
  return (
    <aside 
      className={`mentora-sidebar select-none bg-[#0B0C0E] border-r border-white/[0.05] ${isOpen ? '' : 'collapsed'}`}
      style={{
        width: 256,
        minWidth: 256,
        maxWidth: 256,
        backgroundColor: '#0B0C0E',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header: Minimal Geometric Mentora Mark + Wordmark + Version + Collapse */}
        <div className="h-12 px-3.5 flex items-center justify-between border-b border-white/[0.04]">
          <button 
            type="button" 
            className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer p-0 group"
            onClick={() => onSelectNav('home')}
            title="Mentora Workspace Home"
          >
            {/* Geometric Frontier Mark */}
            <div className="w-5 h-5 rounded-md bg-white/[0.06] border border-white/[0.12] flex items-center justify-center group-hover:border-white/[0.22] transition-colors shadow-xs">
              <span className="text-[10px] font-mono font-semibold text-[#F4F4F6] tracking-tight">M</span>
            </div>
            
            <span className="font-medium tracking-tight text-sm text-[#F4F4F6]">
              Mentora
            </span>

            <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-[#5E606E] border border-white/[0.06]">
              v2.0
            </span>
          </button>

          <button
            type="button"
            className="w-7 h-7 rounded-md border border-transparent hover:border-white/[0.08] hover:bg-white/[0.04] text-[#5E606E] hover:text-[#F4F4F6] flex items-center justify-center transition-all cursor-pointer"
            onClick={onClose}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={15} />
          </button>
        </div>

        {/* Primary Action Button: Linear-style "New Whiteboard Session" */}
        <div className="p-3">
          <button 
            type="button"
            className="h-9 px-3 w-full rounded-lg bg-[#16181F] hover:bg-[#1E2029] border border-white/[0.08] hover:border-white/[0.16] flex items-center justify-between text-xs font-medium text-[#F4F4F6] transition-all duration-150 group shadow-sm cursor-pointer"
            onClick={onNewLesson}
          >
            <div className="flex items-center gap-2">
              <SquarePen size={14} className="text-[#9496A1] group-hover:text-[#F4F4F6] transition-colors" />
              <span>New Whiteboard Session</span>
            </div>
            <kbd className="text-[10px] font-mono text-[#5E606E] group-hover:text-[#9496A1] bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded transition-colors">
              ⌘N
            </kbd>
          </button>
        </div>

        {/* Session History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 flex flex-col gap-0.5">
          <div className="px-2.5 py-1.5 text-[10px] tracking-[0.08em] text-[#5E606E] font-mono uppercase">
            RECENT SESSIONS
          </div>

          {(() => {
            const sanitizedLessons = recentLessons
              .map(lesson => {
                let clean = extractCleanConceptTitle(lesson.title).cleanTitle;
                // If clean title is still a generic fallback, try extracting from semanticKey if available
                if ((clean === 'Visual Concept' || clean === 'First Principles Concept') && lesson.semanticKey) {
                  const fromKey = extractCleanConceptTitle(lesson.semanticKey.replace(/[_-]+/g, ' ')).cleanTitle;
                  if (fromKey !== 'Visual Concept' && fromKey !== 'First Principles Concept') {
                    clean = fromKey;
                  }
                }
                return { ...lesson, cleanTitle: clean };
              })
              .filter(lesson => 
                lesson.cleanTitle !== 'Visual Concept' && 
                lesson.cleanTitle !== 'First Principles Concept'
              );

            if (sanitizedLessons.length === 0) {
              return (
                <div className="px-3 py-6 text-center text-xs text-[#5E606E] font-mono select-none">
                  No recent sessions
                </div>
              );
            }

            return sanitizedLessons.map(lesson => {
              const isActive = activeLessonId === lesson.semanticKey;
              const dotClass = getDomainDotClass(lesson.domain, lesson.cleanTitle);

              return (
                <button
                  key={lesson.id}
                  type="button"
                  className={`group relative flex items-center justify-between w-full px-2.5 py-2 rounded-md text-left transition-all text-xs cursor-pointer border ${
                    isActive 
                      ? 'bg-[#181A20] border-white/[0.12] text-[#F4F4F6] font-medium shadow-xs' 
                      : 'border-transparent text-[#9496A1] hover:text-[#F4F4F6] hover:bg-[#14151B]'
                  }`}
                  onClick={() => onSelectLesson(lesson.semanticKey)}
                  title={lesson.cleanTitle}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    {/* Domain indicator dot */}
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
                    <span className="truncate">{lesson.cleanTitle}</span>
                  </div>

                  <ArrowUpRight 
                    size={12} 
                    className="text-[#5E606E] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" 
                  />
                </button>
              );
            });
          })()}
        </div>
      </div>

      {/* Footer Profile & Cognitive Telemetry Card */}
      <div className="p-2.5 border-t border-white/[0.05] bg-[#0B0C0E]">
        <div className="rounded-lg p-2 bg-[#121318] border border-white/[0.06] flex flex-col gap-2">
          {/* User info row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1E2029] to-[#2B2E3B] border border-white/[0.1] text-[10px] font-semibold text-[#F4F4F6] flex items-center justify-center">
                A
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-[#F4F4F6] leading-none">Aradhya</span>
                <span className="text-[10px] font-mono text-[#5E606E] leading-tight">Engineer</span>
              </div>
            </div>

            {/* Spatial Runtime Active badge */}
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#10B981] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Spatial Active</span>
            </div>
          </div>

          {/* Quick Models & Keys button */}
          <button
            type="button"
            className="h-7 w-full px-2 rounded bg-[#181A20] hover:bg-[#20222B] border border-white/[0.06] hover:border-white/[0.12] text-[11px] font-mono text-[#9496A1] hover:text-[#F4F4F6] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            onClick={onOpenSettings}
            title="Configure AI Models & API Keys"
          >
            <SlidersHorizontal size={11} className="text-[#5E606E]" />
            <span>⚙ Models & Keys</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
