'use client';

import React from 'react';
import { CameraState } from '../../types/kinetic';

interface Props {
  camera: CameraState;
  children: React.ReactNode;
}

export const CameraViewport: React.FC<Props> = ({ camera, children }) => {
  const { x = 0, y = 0, zoom = 1.0 } = camera;

  return (
    <div
      className="kinetic-camera-container"
      style={{
        transform: `translate3d(${-x}px, ${-y}px, 0) scale(${zoom})`,
        transition: 'transform 0.08s linear',
      }}
    >
      {children}
    </div>
  );
};
