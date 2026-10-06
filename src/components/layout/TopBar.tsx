'use client';

import React from 'react';
import { 
  PanelLeft, 
  PanelRight, 
  Sun, 
  Moon, 
  Key, 
  Maximize2,
  Sparkles
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
      {/* Left: Sidebar Toggle + Breadcrumb */}
      <div className="topbar-left">
        <button
          className={`topbar-icon-btn ${sidebarOpen ? 'active' : ''}`}
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Collapse sidebar (Ctrl+B)' : 'Expand sidebar'}
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={16} />
        </button>

        <div className="topbar-breadcrumbs">
          <span>Mentora</span>
          <span className="separator">/</span>
          <span className="active">{activeTopic || 'Workspace'}</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          padding: '2px 8px',
          borderRadius: 9999,
          background: 'var(--bg-tertiary)',
          marginLeft: 4,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
          <span>60fps Engine</span>
        </div>
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

        {/* API Key Modal Button */}
        <button
          onClick={onOpenSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            borderRadius: 8,
            border: '1px solid var(--border-default)',
            background: hasKeyConfigured ? 'var(--success-bg)' : 'var(--bg-primary)',
            color: hasKeyConfigured ? 'var(--success-text)' : 'var(--text-secondary)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title={hasKeyConfigured ? `${activeProvider.toUpperCase()} connected` : 'Connect API Key'}
        >
          <Key size={13} />
          <span>{hasKeyConfigured ? activeProvider : 'Connect Key'}</span>
        </button>
      </div>
    </header>
  );
};
