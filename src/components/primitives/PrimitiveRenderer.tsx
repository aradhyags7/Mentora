'use client';

import React from 'react';
import { VisualPrimitive } from '../../types/kinetic';
import { ArrayNodePrimitive } from './ArrayNodePrimitive';
import { CardContainerPrimitiveRenderer } from './CardContainerPrimitive';
import { CoordinateGraphPrimitiveRenderer } from './CoordinateGraphPrimitive';
import { MathEquationPrimitiveRenderer } from './MathEquationPrimitive';

interface Props {
  entity: VisualPrimitive;
}

export const PrimitiveRenderer: React.FC<Props> = ({ entity }) => {
  switch (entity.type) {
    case 'array':
      return <ArrayNodePrimitive entity={entity} />;
    case 'equation':
      return <MathEquationPrimitiveRenderer entity={entity} />;
    case 'graph':
      return <CoordinateGraphPrimitiveRenderer entity={entity} />;
    case 'card':
      return <CardContainerPrimitiveRenderer entity={entity} />;
    case 'callout':
      // Callouts are rendered on the RoughCalloutOverlay layer
      return null;
    default:
      return null;
  }
};
