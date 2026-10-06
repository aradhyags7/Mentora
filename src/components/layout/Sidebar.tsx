'use client';

import React from 'react';
import { 
  Plus, 
  Home, 
  Compass, 
  BookOpen, 
  Activity, 
  Settings, 
  HelpCircle, 
  User,
  PanelLeftClose,
  Sparkles
} from 'lucide-react';

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
  onOpenSettings: () => void;
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
    <aside className={`mentora-sidebar ${isOpen ? '' : 'collapsed'}`}>
      <div>
        {/* Brand header */}
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => onSelectNav('home')}>
            <div className="sidebar-brand-mark">M</div>
            <span className="sidebar-brand-name">Mentora</span>
          </div>

          <button
            className="topbar-icon-btn"
            onClick={onClose}
            title="Collapse sidebar"
            style={{ width: 26, height: 26 }}
          >
            <PanelLeftClose size={15} />
          </button>
        </div>

        {/* New lesson button */}
        <button className="sidebar-new-btn" onClick={onNewLesson}>
          <Plus size={15} />
          <span>New lesson</span>
        </button>

        {/* Primary Navigation */}
        <nav className="sidebar-nav-list">
          <button
            className={`sidebar-nav-item ${activeNav === 'home' ? 'active' : ''}`}
            onClick={() => onSelectNav('home')}
          >
            <Home size={15} />
            <span>Home</span>
          </button>
          <button
            className={`sidebar-nav-item ${activeNav === 'explore' ? 'active' : ''}`}
            onClick={() => onSelectNav('explore')}
          >
            <Compass size={15} />
            <span>Explore</span>
          </button>
          <button
            className={`sidebar-nav-item ${activeNav === 'library' ? 'active' : ''}`}
            onClick={() => onSelectNav('library')}
          >
            <BookOpen size={15} />
            <span>Library</span>
          </button>
          <button
            className={`sidebar-nav-item ${activeNav === 'progress' ? 'active' : ''}`}
            onClick={() => onSelectNav('progress')}
          >
            <Activity size={15} />
            <span>Progress</span>
          </button>
        </nav>

        {/* Recent Lessons */}
        <div className="sidebar-section-title">Recent</div>
        <div className="sidebar-recents-list">
          {recentLessons.map(lesson => {
            const isActive = activeLessonId === lesson.semanticKey;
            return (
              <button
                key={lesson.id}
                className={`sidebar-recent-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectLesson(lesson.semanticKey)}
                title={lesson.title}
              >
                <span>{lesson.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer controls */}
      <div className="sidebar-footer">
        <button className="sidebar-nav-item" onClick={onOpenSettings}>
          <Settings size={15} />
          <span>Settings</span>
        </button>
        <button 
          className="sidebar-nav-item"
          onClick={() => window.open('https://github.com/aradhyags7/Mentora', '_blank')}
        >
          <HelpCircle size={15} />
          <span>Help & Docs</span>
        </button>
        <div className="sidebar-nav-item" style={{ cursor: 'default' }}>
          <User size={15} />
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>Student Workspace</span>
        </div>
      </div>
    </aside>
  );
};
