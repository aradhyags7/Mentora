/**
 * MENTORA DETERMINISTIC ENGINE - SCENE GRAPH REDUCER
 * 
 * Immutably reduces scene graph entities given kinetic actions.
 * Every entity is identified by a stable string ID.
 */

import { 
  ArrayPrimitive, 
  CardContainerPrimitive, 
  CoordinateGraphPrimitive, 
  EntityAction, 
  KineticAction, 
  MathEquationPrimitive, 
  RoughCalloutPrimitive, 
  VisualPrimitive 
} from '../../types/kinetic';

export function createInitialEntityMap(initialEntities: VisualPrimitive[]): Record<string, VisualPrimitive> {
  const map: Record<string, VisualPrimitive> = {};
  for (const entity of initialEntities) {
    map[entity.id] = JSON.parse(JSON.stringify(entity));
  }
  return map;
}

export function applyActionToEntities(
  currentEntities: Record<string, VisualPrimitive>,
  action: KineticAction
): {
  entities: Record<string, VisualPrimitive>;
  newCallout?: RoughCalloutPrimitive | null;
  clearCallouts?: boolean;
} {
  // If camera action, entities don't change
  if (action.type === 'camera') {
    return { entities: currentEntities };
  }

  // Clone top-level map
  const nextEntities: Record<string, VisualPrimitive> = { ...currentEntities };

  switch (action.type) {
    case 'entity:spawn': {
      nextEntities[action.entity.id] = JSON.parse(JSON.stringify(action.entity));
      return { entities: nextEntities };
    }

    case 'entity:destroy': {
      delete nextEntities[action.targetId];
      return { entities: nextEntities };
    }

    case 'array:set_items': {
      const target = nextEntities[action.targetId];
      if (target && target.type === 'array') {
        nextEntities[action.targetId] = {
          ...target,
          items: action.items.map(item => ({ ...item })),
        };
      }
      return { entities: nextEntities };
    }

    case 'array:move_pointer': {
      const target = nextEntities[action.targetId];
      if (target && target.type === 'array') {
        const updatedPointers = target.pointers.map(ptr => 
          ptr.id === action.pointerId 
            ? { ...ptr, targetIndex: action.targetIndex }
            : ptr
        );
        nextEntities[action.targetId] = {
          ...target,
          pointers: updatedPointers,
        };
      }
      return { entities: nextEntities };
    }

    case 'array:highlight_range': {
      const target = nextEntities[action.targetId];
      if (target && target.type === 'array') {
        const updatedItems = target.items.map((item, idx) => {
          if (idx >= action.startIndex && idx <= action.endIndex) {
            return { ...item, state: action.state };
          }
          return item;
        });
        nextEntities[action.targetId] = {
          ...target,
          items: updatedItems,
        };
      }
      return { entities: nextEntities };
    }

    case 'array:mark_state': {
      const target = nextEntities[action.targetId];
      if (target && target.type === 'array') {
        const updatedItems = target.items.map((item, idx) => {
          if (action.indices.includes(idx)) {
            return { ...item, state: action.state };
          }
          return item;
        });
        nextEntities[action.targetId] = {
          ...target,
          items: updatedItems,
        };
      }
      return { entities: nextEntities };
    }

    case 'equation:update_latex': {
      const target = nextEntities[action.targetId];
      if (target && target.type === 'equation') {
        nextEntities[action.targetId] = {
          ...target,
          latex: action.latex,
          highlights: action.highlights ?? target.highlights,
        };
      }
      return { entities: nextEntities };
    }

    case 'card:update': {
      const target = nextEntities[action.targetId];
      if (target && target.type === 'card') {
        nextEntities[action.targetId] = {
          ...target,
          title: action.title ?? target.title,
          content: action.content ?? target.content,
          items: action.items ? [...action.items] : target.items,
        };
      }
      return { entities: nextEntities };
    }

    case 'callout:show': {
      return {
        entities: nextEntities,
        newCallout: action.callout,
      };
    }

    case 'callout:clear': {
      return {
        entities: nextEntities,
        clearCallouts: true,
      };
    }

    default:
      return { entities: nextEntities };
  }
}
