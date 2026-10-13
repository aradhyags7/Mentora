/**
 * MENTORA DETERMINISTIC ENGINE - INTERPOLATOR
 * 
 * Math and easing primitives for 60 FPS deterministic camera pan/zoom,
 * Grant Sanderson's signature 3Blue1Brown (Manim) smooth transitions,
 * and Nitish Rajput documentary camera choreography.
 */

import { CameraState, CameraKeyframe } from '../../types/kinetic';

export type EasingType = 'linear' | 'easeOut' | 'easeInOut' | 'elastic' | 'cinema' | 'manim';

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Grant Sanderson's signature 3Blue1Brown (Manim) smooth step curve:
 * s = clamp(t, 0, 1); s^3 * (10 - 15s + 6s^2)
 * Features C2-continuous zero velocity and zero acceleration at both start and end.
 */
export function easeManimSmooth(t: number): number {
  const s = clamp(t, 0, 1);
  return s * s * s * (10 - 15 * s + 6 * s * s);
}

/**
 * Nitish Rajput documentary camera easing curve.
 * Equivalent to cubic-bezier(0.22, 1, 0.36, 1) for brisk pan initiation
 * with a long, smooth deceleration settle.
 */
function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  return function (t: number): number {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let u = t;
    for (let i = 0; i < 8; i++) {
      const currentX = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
      const currentSlope = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
      if (Math.abs(currentX - t) < 1e-5) break;
      if (Math.abs(currentSlope) < 1e-5) break;
      u -= (currentX - t) / currentSlope;
      u = clamp(u, 0, 1);
    }
    return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  };
}

const cinemaCameraBezier = cubicBezier(0.22, 1, 0.36, 1);

export function easeCinemaCamera(t: number): number {
  return cinemaCameraBezier(clamp(t, 0, 1));
}

/**
 * Calculate progressive SVG stroke reveal given normalized path length 1.
 */
export function interpolateStrokeDraw(
  currentTime: number,
  startTime: number,
  duration: number
): { strokeDasharray: string; strokeDashoffset: number; opacity: number } {
  if (duration <= 0) {
    return { strokeDasharray: '1', strokeDashoffset: 0, opacity: 1 };
  }
  const elapsed = currentTime - startTime;
  const rawProgress = clamp(elapsed / duration, 0, 1);
  const smoothProgress = easeManimSmooth(rawProgress);
  return {
    strokeDasharray: '1',
    strokeDashoffset: 1 - smoothProgress,
    opacity: smoothProgress > 0 ? 1 : 0,
  };
}

export function ease(t: number, type: EasingType = 'easeInOut'): number {
  const clamped = clamp(t, 0, 1);
  switch (type) {
    case 'linear':
      return clamped;
    case 'manim':
      return easeManimSmooth(clamped);
    case 'cinema':
      return easeCinemaCamera(clamped);
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
    focusEntityIds: to.focusEntityIds ?? from.focusEntityIds,
    spotlightIntensity: lerp(from.spotlightIntensity ?? 0, to.spotlightIntensity ?? 0, eased),
  };
}

export interface InterpolatedCameraState {
  panX: number;
  panY: number;
  zoom: number;
  focusEntityIds: string[];
  spotlightIntensity: number;
}

/**
 * Smoothly interpolate { panX, panY, zoom, focusEntityIds, spotlightIntensity }
 * across keyframes using easeCinemaCamera.
 */
export function interpolateCameraState(
  keyframes: CameraKeyframe[],
  currentTime: number
): InterpolatedCameraState {
  if (!keyframes || keyframes.length === 0) {
    return {
      panX: 0,
      panY: 0,
      zoom: 1.0,
      focusEntityIds: [],
      spotlightIntensity: 0,
    };
  }

  const sorted = [...keyframes].sort((a, b) => a.timestampMs - b.timestampMs);

  // Before first keyframe
  if (currentTime <= sorted[0].timestampMs) {
    const first = sorted[0];
    return {
      panX: first.panX,
      panY: first.panY,
      zoom: first.zoom,
      focusEntityIds: first.focusEntityIds || [],
      spotlightIntensity: first.spotlightIntensity ?? (first.focusEntityIds && first.focusEntityIds.length > 0 ? 0.75 : 0),
    };
  }

  // After last keyframe
  const last = sorted[sorted.length - 1];
  if (currentTime >= last.timestampMs + (last.durationMs || 0)) {
    return {
      panX: last.panX,
      panY: last.panY,
      zoom: last.zoom,
      focusEntityIds: last.focusEntityIds || [],
      spotlightIntensity: last.spotlightIntensity ?? (last.focusEntityIds && last.focusEntityIds.length > 0 ? 0.75 : 0),
    };
  }

  // Find surrounding transition
  for (let i = 0; i < sorted.length; i++) {
    const k = sorted[i];
    const duration = k.durationMs || 1000;
    const start = k.timestampMs;
    const end = start + duration;

    if (currentTime >= start && currentTime <= end) {
      const prev = i > 0 ? sorted[i - 1] : k;
      const progress = clamp((currentTime - start) / Math.max(duration, 1), 0, 1);
      const eased = easeCinemaCamera(progress);

      return {
        panX: lerp(prev.panX, k.panX, eased),
        panY: lerp(prev.panY, k.panY, eased),
        zoom: lerp(prev.zoom, k.zoom, eased),
        focusEntityIds: k.focusEntityIds || prev.focusEntityIds || [],
        spotlightIntensity: lerp(
          prev.spotlightIntensity ?? (prev.focusEntityIds && prev.focusEntityIds.length > 0 ? 0.75 : 0),
          k.spotlightIntensity ?? (k.focusEntityIds && k.focusEntityIds.length > 0 ? 0.75 : 0),
          eased
        ),
      };
    }
  }

  const active = sorted.filter(k => k.timestampMs <= currentTime).pop() || sorted[0];
  return {
    panX: active.panX,
    panY: active.panY,
    zoom: active.zoom,
    focusEntityIds: active.focusEntityIds || [],
    spotlightIntensity: active.spotlightIntensity ?? (active.focusEntityIds && active.focusEntityIds.length > 0 ? 0.75 : 0),
  };
}
