'use client';

import React from 'react';
import { 
  SquarePen, 
  Settings, 
  HelpCircle, 
  MoreHorizontal,
  MessageSquare,
  PanelLeftClose
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
  onOpenSettings?: () => void;
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
      <div className="sidebar-main-content">
        {/* ChatGPT Style Top Header: Mentora name + New Chat icon */}
        <div className="sidebar-header">
          <button 
            type="button" 
            className="sidebar-brand-btn"
            onClick={() => onSelectNav('home')}
            title="Mentora Home"
          >
            <span className="sidebar-brand-text">Mentora</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              className="sidebar-icon-btn"
              onClick={onNewLesson}
              title="New chat"
            >
              <SquarePen size={18} />
            </button>
            <button
              className="sidebar-icon-btn"
              onClick={onClose}
              title="Close sidebar"
            >
              <PanelLeftClose size={17} />
            </button>
          </div>
        </div>

        {/* ChatGPT Style "New Chat" Row Button */}
        <div style={{ padding: '4px 10px 8px 10px' }}>
          <button className="chatgpt-new-chat-btn" onClick={onNewLesson}>
            <SquarePen size={16} />
            <span>New chat</span>
          </button>
        </div>

        {/* Chat / Lesson History (ChatGPT Style) */}
        <div className="sidebar-history-container">
          <div className="sidebar-history-group-label">Recent</div>
          <div className="sidebar-history-list">
            {recentLessons.map(lesson => {
              const isActive = activeLessonId === lesson.semanticKey;
              return (
                <button
                  key={lesson.id}
                  className={`sidebar-history-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectLesson(lesson.semanticKey)}
                  title={lesson.title}
                >
                  <MessageSquare size={14} className="history-item-icon" />
                  <span className="history-item-title">{lesson.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ChatGPT Style User Profile Row at Bottom */}
      <div className="sidebar-user-footer">
        <div className="sidebar-user-row" onClick={onOpenSettings} title="Settings">
          <div className="sidebar-user-avatar">
            <span>A</span>
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">Aradhya</span>
            <span className="sidebar-user-plan">Free Plan</span>
          </div>
          <MoreHorizontal size={16} className="sidebar-user-dots" />
        </div>
      </div>
    </aside>
  );
};
