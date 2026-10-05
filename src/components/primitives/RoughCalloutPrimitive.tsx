'use client';

import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { RoughCalloutPrimitive } from '../../types/kinetic';

interface Props {
  callouts: RoughCalloutPrimitive[];
  containerWidth: number;
  containerHeight: number;
}

export const RoughCalloutOverlay: React.FC<Props> = ({
  callouts,
  containerWidth,
  containerHeight,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Clear previous children
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    if (!callouts || callouts.length === 0) return;

    const rc = rough.svg(svg);

    callouts.forEach(callout => {
      const color = callout.color || '#3B82F6';
      const strokeWidth = callout.strokeWidth || 2.5;

      switch (callout.shape) {
        case 'circle': {
          // If targeted to a coordinate or default center
          const cx = callout.toPoint?.x ?? containerWidth / 2;
          const cy = callout.toPoint?.y ?? containerHeight / 2;
          const diameter = 68;

          const shapeNode = rc.circle(cx, cy, diameter, {
            stroke: color,
            strokeWidth,
            roughness: 1.8,
            bowing: 1.5,
          });
          svg.appendChild(shapeNode);

          if (callout.label) {
            const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textNode.setAttribute('x', String(cx));
            textNode.setAttribute('y', String(cy - diameter / 2 - 8));
            textNode.setAttribute('fill', color);
            textNode.setAttribute('font-size', '12px');
            textNode.setAttribute('font-weight', '700');
            textNode.setAttribute('text-anchor', 'middle');
            textNode.textContent = callout.label;
            svg.appendChild(textNode);
          }
          break;
        }

        case 'strike': {
          const fromX = callout.fromPoint?.x ?? containerWidth * 0.15;
          const fromY = callout.fromPoint?.y ?? containerHeight / 2;
          const toX = callout.toPoint?.x ?? containerWidth * 0.5;
          const toY = callout.toPoint?.y ?? containerHeight / 2;

          const line = rc.line(fromX, fromY - 18, toX, toY + 18, {
            stroke: color,
            strokeWidth: strokeWidth + 1,
            roughness: 2.2,
          });
          svg.appendChild(line);
          break;
        }

        case 'arrow': {
          const x1 = callout.fromPoint?.x ?? containerWidth / 2;
          const y1 = callout.fromPoint?.y ?? containerHeight * 0.2;
          const x2 = callout.toPoint?.x ?? containerWidth / 2;
          const y2 = callout.toPoint?.y ?? containerHeight * 0.45;

          // Shaft
          const shaft = rc.line(x1, y1, x2, y2, {
            stroke: color,
            strokeWidth,
            roughness: 1.4,
          });
          svg.appendChild(shaft);

          // Head
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const headLen = 14;
          const leftHead = rc.line(
            x2,
            y2,
            x2 - headLen * Math.cos(angle - Math.PI / 6),
            y2 - headLen * Math.sin(angle - Math.PI / 6),
            { stroke: color, strokeWidth }
          );
          const rightHead = rc.line(
            x2,
            y2,
            x2 - headLen * Math.cos(angle + Math.PI / 6),
            y2 - headLen * Math.sin(angle + Math.PI / 6),
            { stroke: color, strokeWidth }
          );
          svg.appendChild(leftHead);
          svg.appendChild(rightHead);
          break;
        }

        case 'bracket':
        case 'box':
        default: {
          const x = callout.fromPoint?.x ?? containerWidth * 0.12;
          const y = callout.fromPoint?.y ?? containerHeight * 0.3;
          const w = callout.toPoint?.x ? callout.toPoint.x - x : containerWidth * 0.76;
          const h = callout.toPoint?.y ? callout.toPoint.y - y : 90;

          const box = rc.rectangle(x, y, w, h, {
            stroke: color,
            strokeWidth,
            roughness: 1.5,
          });
          svg.appendChild(box);
          break;
        }
      }
    });
  }, [callouts, containerWidth, containerHeight]);

  return (
    <svg
      ref={svgRef}
      className="rough-callout-overlay"
      viewBox={`0 0 ${containerWidth} ${containerHeight}`}
    />
  );
};
