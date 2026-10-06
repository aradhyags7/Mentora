'use client';

import React from 'react';
import { 
  PanelLeft, 
  PanelRight, 
  Sun, 
  Moon, 
  Key, 
  Maximize2,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { AiProvider } from '../../types/ai';

interface Props {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  rightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeTopic?: string;
  hasActiveArtifact: boolean;
  onOpenSettings: () => void;
  activeProvider: AiProvider;
  hasKeyConfigured: boolean;
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
  onOpenSettings,
  activeProvider,
  hasKeyConfigured,
  onExpandFullscreen,
}) => {
  return (
    <header className="mentora-topbar">
      {/* Left: Sidebar Toggle + Model Pill + Topic */}
      <div className="topbar-left">
        <button
          className={`topbar-icon-btn ${sidebarOpen ? 'active' : ''}`}
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={16} />
        </button>

        {/* OpenAI / Claude-style Model Selector Pill */}
        <div 
          className="topbar-model-pill"
          onClick={onOpenSettings}
          title="Active Model: Gemini 3.5 Flash — Click to configure"
        >
          <Sparkles size={13} className="model-pill-icon" />
          <span className="model-pill-name">Mentora 3.5</span>
          <ChevronDown size={11} className="model-pill-chevron" />
        </div>

        {activeTopic && (
          <div className="topbar-breadcrumbs">
            <span className="separator">/</span>
            <span className="active">{activeTopic}</span>
          </div>
        )}
      </div>

      {/* Right: Fullscreen, Context Panel Toggle, Theme, Settings */}
      <div className="topbar-right">
        {hasActiveArtifact && onExpandFullscreen && (
          <button
            className="topbar-icon-btn"
            onClick={onExpandFullscreen}
            title="Expand to Fullscreen Lesson Mode"
            aria-label="Fullscreen lesson"
          >
            <Maximize2 size={15} />
          </button>
        )}

        {/* Right Context Panel Toggle */}
        <button
          className={`topbar-icon-btn ${rightPanelOpen ? 'active' : ''}`}
          onClick={onToggleRightPanel}
          title={rightPanelOpen ? 'Close context panel' : 'Open variables & outline panel'}
          aria-label="Toggle context panel"
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

        {/* Settings / API Key Button */}
        <button
          className="topbar-settings-btn"
          onClick={onOpenSettings}
          title={hasKeyConfigured ? `${activeProvider.toUpperCase()} active` : 'Configure API Key'}
        >
          <Key size={13} style={{ opacity: 0.7 }} />
          <span>{hasKeyConfigured ? 'Connected' : 'API Key'}</span>
        </button>
      </div>
    </header>
  );
};
