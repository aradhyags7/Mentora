'use client';

import React from 'react';
import { CardContainerPrimitive } from '../../types/kinetic';

interface Props {
  entity: CardContainerPrimitive;
}

export const CardContainerPrimitiveRenderer: React.FC<Props> = ({ entity }) => {
  const { title, subtitle, items = [], content, theme = 'default' } = entity;

  const themeClasses: Record<string, string> = {
    default: 'theme-default',
    accent: 'theme-accent',
    warning: 'theme-warning',
    success: 'theme-success',
  };

  return (
    <div
      className={`primitive-card-box ${themeClasses[theme] || 'theme-default'}`}
      style={{
        borderColor: 'var(--border-default)',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="card-header-row">
        <span className="card-title" style={{ color: 'var(--text-primary)' }}>{title}</span>
        {subtitle && <span className="card-subtitle" style={{ color: 'var(--text-secondary)' }}>{subtitle}</span>}
      </div>

      {content && (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.4 }}>
          {content}
        </div>
      )}

      {items && items.length > 0 && (
        <div className="card-items-grid">
          {items.map((stat, idx) => (
            <div key={idx} className="card-stat-node" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}>
              <span className="card-stat-label" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</span>
              <span className="card-stat-value" style={{ color: 'var(--text-primary)' }}>{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
