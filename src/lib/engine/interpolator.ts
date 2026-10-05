/**
 * MENTORA DETERMINISTIC ENGINE - INTERPOLATOR
 * 
 * Math and easing primitives for 60 FPS deterministic camera pan/zoom
 * and element transitions.
 */

import { CameraState } from '../../types/kinetic';

export type EasingType = 'linear' | 'easeOut' | 'easeInOut' | 'elastic';

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function ease(t: number, type: EasingType = 'easeInOut'): number {
  const clamped = clamp(t, 0, 1);
  switch (type) {
    case 'linear':
      return clamped;
    case 'easeOut':
      // Cubic ease out
      return 1 - Math.pow(1 - clamped, 3);
    case 'elastic': {
      if (clamped === 0 || clamped === 1) return clamped;
      const p = 0.3;
      const s = p / 4;
      return Math.pow(2, -10 * clamped) * Math.sin(((clamped - s) * (2 * Math.PI)) / p) + 1;
    }
    case 'easeInOut':
    default:
      // Smooth sigmoid / cubic
      return clamped < 0.5
        ? 4 * clamped * clamped * clamped
        : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
  }
}

export function interpolateCamera(
  from: CameraState,
  to: CameraState,
  progress: number,
  easing: EasingType = 'easeInOut'
): CameraState {
  const eased = ease(progress, easing);
  return {
    x: lerp(from.x, to.x, eased),
    y: lerp(from.y, to.y, eased),
    zoom: lerp(from.zoom, to.zoom, eased),
  };
}
