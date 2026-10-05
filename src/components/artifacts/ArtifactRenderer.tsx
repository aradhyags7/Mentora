'use client';

import React from 'react';
import { TeachingArtifactSpec } from '@/types/artifacts';
import { BinarySearchVisualizer } from './BinarySearchVisualizer';
import { DerivativeGraphVisualizer } from './DerivativeGraphVisualizer';
import { ProjectileMotionVisualizer } from './ProjectileMotionVisualizer';
import { CpuArchitectureVisualizer } from './CpuArchitectureVisualizer';

interface ArtifactRendererProps {
  artifact: TeachingArtifactSpec;
}

export const ArtifactRenderer: React.FC<ArtifactRendererProps> = ({ artifact }) => {
  switch (artifact.component) {
    case 'binary_search':
      return <BinarySearchVisualizer {...artifact.props} />;
    case 'derivative_graph':
      return <DerivativeGraphVisualizer {...artifact.props} />;
    case 'projectile_kinematics':
      return <ProjectileMotionVisualizer {...artifact.props} />;
    case 'cpu_pipeline':
      return <CpuArchitectureVisualizer {...artifact.props} />;
    default:
      return null;
  }
};
