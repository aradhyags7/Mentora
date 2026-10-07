'use client';

import React from 'react';
import { InteractiveArtifactProps } from '../../types/lessonSurface';
import { DerivativeArtifact } from './math/DerivativeArtifact';
import { BinarySearchArtifact } from './cs/BinarySearchArtifact';
import { ProjectileArtifact } from './physics/ProjectileArtifact';

interface Props extends InteractiveArtifactProps {
  artifactKey: string;
}

export const ArtifactRenderer: React.FC<Props> = ({
  artifactKey,
  id,
  concept,
  initialState,
  onInteraction,
  isTeacherActive,
}) => {
  const normalizedKey = (artifactKey || concept || '').toLowerCase();

  if (normalizedKey.includes('derivative') || normalizedKey.includes('calculus') || normalizedKey.includes('math.')) {
    return (
      <DerivativeArtifact
        id={id}
        concept={concept}
        initialState={initialState}
        onInteraction={onInteraction}
        isTeacherActive={isTeacherActive}
      />
    );
  }

  if (normalizedKey.includes('binary') || normalizedKey.includes('search') || normalizedKey.includes('cs.')) {
    return (
      <BinarySearchArtifact
        id={id}
        concept={concept}
        initialState={initialState}
        onInteraction={onInteraction}
        isTeacherActive={isTeacherActive}
      />
    );
  }

  if (normalizedKey.includes('projectile') || normalizedKey.includes('physics') || normalizedKey.includes('motion')) {
    return (
      <ProjectileArtifact
        id={id}
        concept={concept}
        initialState={initialState}
        onInteraction={onInteraction}
        isTeacherActive={isTeacherActive}
      />
    );
  }

  // Default fallback to math derivative artifact
  return (
    <DerivativeArtifact
      id={id}
      concept={concept}
      initialState={initialState}
      onInteraction={onInteraction}
      isTeacherActive={isTeacherActive}
    />
  );
};
