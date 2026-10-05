'use client';

import React from 'react';
import { ArrayPrimitive } from '../../types/kinetic';

interface Props {
  entity: ArrayPrimitive;
}

const CELL_WIDTH = 54;
const CELL_GAP = 8;

export const ArrayNodePrimitive: React.FC<Props> = ({ entity }) => {
  const { title, items = [], pointers = [] } = entity;

  // Calculate pointer horizontal center position relative to the cells container
  const getPointerLeftPx = (targetIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(items.length - 1, targetIndex));
    return clampedIndex * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2;
  };

  return (
    <div className="primitive-array-wrapper">
      {title && <div className="array-title">{title}</div>}

      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Top Pointers (e.g. low, high) */}
        {pointers
          .filter(p => p.position === 'top')
          .map(ptr => {
            const left = getPointerLeftPx(ptr.targetIndex);
            const color = ptr.color || '#3B82F6';
            return (
              <div
                key={ptr.id}
                className="pointer-flag pos-top"
                style={{
                  left: `${left}px`,
                  color,
                }}
              >
                <div
                  className="pointer-label"
                  style={{ backgroundColor: color }}
                >
                  {ptr.label}
                </div>
                <div
                  className="pointer-arrow"
                  style={{ borderTopColor: color }}
                />
              </div>
            );
          })}

        {/* Array Cells */}
        <div className="array-cells-row">
          {items.map((item, idx) => {
            const stateClass = `state-${item.state || 'default'}`;
            return (
              <div
                key={item.id || `cell_${idx}`}
                id={`array_node_${idx}`}
                className={`array-cell-node ${stateClass}`}
              >
                <span>{item.value}</span>
                <span className="array-cell-index">{idx}</span>
              </div>
            );
          })}
        </div>

        {/* Bottom Pointers (e.g. mid) */}
        {pointers
          .filter(p => p.position === 'bottom')
          .map(ptr => {
            const left = getPointerLeftPx(ptr.targetIndex);
            const color = ptr.color || '#2563EB';
            return (
              <div
                key={ptr.id}
                className="pointer-flag pos-bottom"
                style={{
                  left: `${left}px`,
                  color,
                }}
              >
                <div
                  className="pointer-arrow"
                  style={{ borderBottomColor: color }}
                />
                <div
                  className="pointer-label"
                  style={{ backgroundColor: color }}
                >
                  {ptr.label}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
