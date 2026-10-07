'use client';

import React from 'react';
import { 
  PanelLeft, 
  PanelRight, 
  Sun, 
  Moon, 
  Maximize2,
  ChevronDown
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
}) => {
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
          title="Model: Mentora"
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

      {/* Right: Fullscreen, Canvas toggle, Theme, Profile */}
      <div className="topbar-right">
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
          title={rightPanelOpen ? 'Close canvas panel' : 'Open canvas panel'}
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
          className="topbar-user-avatar" 
          title="Account"
        >
          <span>A</span>
        </div>
      </div>
    </header>
  );
};
