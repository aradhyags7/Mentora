'use client';

import React from 'react';
import { VisualPrimitive } from '../../types/kinetic';
import { ArrayNodePrimitive } from './ArrayNodePrimitive';
import { CodeTracePrimitive } from './CodeTracePrimitive';
import { TreeGraphPrimitive } from './TreeGraphPrimitive';
import { StackHashMapPrimitive } from './StackHashMapPrimitive';
import { CardContainerPrimitiveRenderer } from './CardContainerPrimitive';
import { CoordinateGraphPrimitiveRenderer } from './CoordinateGraphPrimitive';
import { MathEquationPrimitiveRenderer } from './MathEquationPrimitive';
import { InvestigationNodePrimitiveRenderer } from './InvestigationNodePrimitive';
import { CausalConnectorPrimitiveRenderer } from './CausalConnectorPrimitive';

interface Props {
  entity: VisualPrimitive;
}

export const PrimitiveRenderer: React.FC<Props> = ({ entity }) => {
  switch (entity.type) {
    case 'array':
      return <ArrayNodePrimitive entity={entity} />;
    case 'code_trace':
      return <CodeTracePrimitive entity={entity} />;
    case 'tree_graph':
      return <TreeGraphPrimitive entity={entity} />;
    case 'stack_hashmap':
      return <StackHashMapPrimitive entity={entity} />;
    case 'equation':
      return <MathEquationPrimitiveRenderer entity={entity} />;
    case 'graph':
      return <CoordinateGraphPrimitiveRenderer entity={entity} />;
    case 'card':
      return <CardContainerPrimitiveRenderer entity={entity} />;
    case 'investigation_node':
      return <InvestigationNodePrimitiveRenderer entity={entity} />;
    case 'causal_connector':
      return <CausalConnectorPrimitiveRenderer entity={entity} />;
    case 'callout':
      // Callouts are rendered on the RoughCalloutOverlay layer
      return null;
    default:
      return null;
  }
};
