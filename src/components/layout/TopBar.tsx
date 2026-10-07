'use client';

import React from 'react';
import { 
  PanelLeft, 
  PanelRight, 
  Sun, 
  Moon, 
  Maximize2,
  ChevronDown,
  Brain
} from 'lucide-react';

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
  activeConcept,
}) => {
  const masteryPercent = studentMastery !== undefined ? Math.round(studentMastery * 100) : null;

  return (
    <header className="mentora-topbar">
      {/* Left: Sidebar Toggle + ChatGPT-style Model Pill */}
      <div className="topbar-left">
        <button
          className={`topbar-icon-btn ${sidebarOpen ? 'active' : ''}`}
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={17} />
        </button>

        {/* ChatGPT Style Model Dropdown */}
        <div 
          className="topbar-model-pill"
          title="Model: Mentora Pedagogical Intelligence"
        >
          <span className="model-pill-name">Mentora</span>
          <ChevronDown size={14} className="model-pill-chevron" />
        </div>

        {activeTopic && (
          <div className="topbar-breadcrumbs">
            <span className="separator">/</span>
            <span className="active">{activeTopic}</span>
          </div>
        )}
      </div>

      {/* Right: Fullscreen, Cognitive Brain Pill, Canvas toggle, Theme, Profile */}
      <div className="topbar-right">
        {/* Real-time BKT Cognitive Model Indicator Pill */}
        {masteryPercent !== null && (
          <button
            type="button"
            className="topbar-brain-pill"
            onClick={onToggleRightPanel}
            title="Inspect Teacher Cognitive Brain & BKT Model"
          >
            <Brain size={13} className="text-accent" />
            <span className="brain-pill-text">Mastery: <strong>{masteryPercent}%</strong></span>
          </button>
        )}

        {hasActiveArtifact && onExpandFullscreen && (
          <button
            className="topbar-icon-btn"
            onClick={onExpandFullscreen}
            title="Expand to Fullscreen Canvas"
            aria-label="Fullscreen lesson"
          >
            <Maximize2 size={16} />
          </button>
        )}

        {/* Right Canvas / Context Panel Toggle */}
        <button
          className={`topbar-icon-btn ${rightPanelOpen ? 'active' : ''}`}
          onClick={onToggleRightPanel}
          title={rightPanelOpen ? 'Close context & brain panel' : 'Open context & brain panel'}
          aria-label="Toggle canvas panel"
        >
          <PanelRight size={16} />
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          className="topbar-icon-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User Profile Avatar (ChatGPT style) */}
        <div 
          className="topbar-avatar" 
          title="Student Profile"
        >
          <span>S</span>
        </div>
      </div>
    </header>
  );
};
