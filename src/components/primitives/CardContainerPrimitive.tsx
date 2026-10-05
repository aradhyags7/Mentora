'use client';

import React from 'react';
import { CardContainerPrimitive } from '../../types/kinetic';

interface Props {
  entity: CardContainerPrimitive;
}

export const CardContainerPrimitiveRenderer: React.FC<Props> = ({ entity }) => {
  const { title, subtitle, items = [], content, theme = 'default' } = entity;

  const themeColors = {
    default: { border: '#E2E8F0', bg: '#FFFFFF' },
    accent: { border: '#93C5FD', bg: '#EFF6FF' },
    warning: { border: '#FDE68A', bg: '#FFFBEB' },
    success: { border: '#A7F3D0', bg: '#ECFDF5' },
  }[theme];

  return (
    <div
      className="primitive-card-box"
      style={{
        borderColor: themeColors.border,
        backgroundColor: themeColors.bg,
      }}
    >
      <div className="card-header-row">
        <span className="card-title">{title}</span>
        {subtitle && <span className="card-subtitle">{subtitle}</span>}
      </div>

      {content && (
        <div style={{ fontSize: 13, color: '#334155', marginBottom: 10, lineHeight: 1.4 }}>
          {content}
        </div>
      )}

      {items && items.length > 0 && (
        <div className="card-items-grid">
          {items.map((stat, idx) => (
            <div key={idx} className="card-stat-node">
              <span className="card-stat-label">{stat.label}</span>
              <span className="card-stat-value">{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
