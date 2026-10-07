'use client';

import React from 'react';

interface Props {
  size?: number;
  className?: string;
  glow?: boolean;
}

/**
 * Mentora's Signature Brand Mark:
 * An interlocking geometric kinetic learning prism.
 * The intersecting planes represent multimodal synthesis: text, visual, mathematical, and spatial knowledge.
 */
export const MentoraLogo: React.FC<Props> = ({ 
  size = 28, 
  className = '',
  glow = true 
}) => {
  return (
    <div 
      className={`mentora-logo-container ${className}`}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {glow && (
        <div 
          className="mentora-logo-ambient-glow"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '40%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(245, 158, 11, 0.2) 60%, transparent 100%)',
            filter: 'blur(6px)',
            opacity: 0.8,
            pointerEvents: 'none',
          }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))' }}
      >
        <defs>
          <linearGradient id="mentoraGradLeft" x1="4" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
          <linearGradient id="mentoraGradCenter" x1="16" y1="6" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="60%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="mentoraGradCore" x1="10" y1="10" x2="22" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>

        {/* Outer Prism Geometry */}
        {/* Left facet (Indigo) */}
        <path
          d="M6 25L6 10L14 17L14 28L6 25Z"
          fill="url(#mentoraGradLeft)"
          opacity="0.95"
        />
        {/* Right facet (Amber) */}
        <path
          d="M26 25L26 10L18 17L18 28L26 25Z"
          fill="url(#mentoraGradCenter)"
          opacity="0.95"
        />
        {/* Central kinetic apex & focal prism */}
        <path
          d="M16 4L22 13L16 19L10 13L16 4Z"
          fill="url(#mentoraGradCore)"
          opacity="0.98"
        />
        {/* Internal refractive line accents */}
        <line x1="16" y1="4" x2="16" y2="19" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round" />
        <circle cx="16" cy="19" r="1.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
