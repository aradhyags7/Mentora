/**
 * MENTORA DETERMINISTIC ENGINE - SCENE GRAPH REDUCER
 * 
 * Immutably reduces scene graph entities given kinetic actions.
 * Upgraded with Nitish Rajput spatial coordinates, documentary spotlight dimming,
 * and 3Blue1Brown progressive stroke draw states.
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
  VisualPrimitive,
  InvestigationNodePrimitive,
  CausalConnectorPrimitive
} from '../../types/kinetic';

export interface EntitySpatialMetadata {
  x: number;
  y: number;
  width: number;
  height: number;
  layer: 'background' | 'world' | 'hud';
}

export interface EntityVisualState {
  opacity: number;
  isDimmed: boolean;
  drawProgress: number;
  highlightColor?: string;
  isFocused: boolean;
}

// In-memory registry for spatial bounding metadata & spotlight state
const spatialMetadataStore: Record<string, EntitySpatialMetadata> = {};
let activeFocusEntityIds: string[] = [];
let isSpotlightActive = false;
let activeHighlights: Record<string, string> = {};
let activeEntitiesCache: Record<string, VisualPrimitive> = {};

export function registerEntityBounds(entityId: string, bounds: Partial<EntitySpatialMetadata>) {
  spatialMetadataStore[entityId] = {
    x: bounds.x ?? spatialMetadataStore[entityId]?.x ?? 0,
    y: bounds.y ?? spatialMetadataStore[entityId]?.y ?? 0,
    width: bounds.width ?? spatialMetadataStore[entityId]?.width ?? 320,
    height: bounds.height ?? spatialMetadataStore[entityId]?.height ?? 200,
    layer: bounds.layer ?? spatialMetadataStore[entityId]?.layer ?? 'world',
  };
}

export function getEntityBounds(entityId: string): EntitySpatialMetadata | null {
  return spatialMetadataStore[entityId] || null;
}

export function setSpotlightState(focusEntityIds: string[], active?: boolean) {
  activeFocusEntityIds = [...focusEntityIds];
  isSpotlightActive = active !== undefined ? active : focusEntityIds.length > 0;
}

export function getSpotlightState(): { focusEntityIds: string[]; spotlightActive: boolean } {
  return {
    focusEntityIds: activeFocusEntityIds,
    spotlightActive: isSpotlightActive,
  };
}

export function setEntityHighlight(entityId: string, color?: string) {
  if (color) {
    activeHighlights[entityId] = color;
  } else {
    delete activeHighlights[entityId];
  }
}

/**
 * Returns the computed visual state for an entity, including Nitish Rajput
 * spotlight dimming and 3Blue1Brown progressive draw parameters.
 */
export function getEntityVisualState(entityId: string, currentTime?: number): EntityVisualState {
  const isFocused = activeFocusEntityIds.includes(entityId);
  const isDimmed = isSpotlightActive && activeFocusEntityIds.length > 0 && !isFocused;
  
  const entity = activeEntitiesCache[entityId];
  const drawProgress = (entity as any)?.drawProgress ?? 1.0;
  const highlightColor = activeHighlights[entityId];

  return {
    opacity: isDimmed ? 0.18 : 1.0,
    isDimmed,
    drawProgress,
    highlightColor,
    isFocused,
  };
}

export function createInitialEntityMap(initialEntities: VisualPrimitive[]): Record<string, VisualPrimitive> {
  const map: Record<string, VisualPrimitive> = {};
  for (const entity of initialEntities) {
    map[entity.id] = JSON.parse(JSON.stringify(entity));
    
    // Auto-register spatial metadata if position or root x/y provided
    const posX = ('position' in entity && entity.position?.x !== undefined) ? entity.position.x : ('x' in entity && typeof (entity as any).x === 'number' ? (entity as any).x : undefined);
    const posY = ('position' in entity && entity.position?.y !== undefined) ? entity.position.y : ('y' in entity && typeof (entity as any).y === 'number' ? (entity as any).y : undefined);
    if (posX !== undefined && posY !== undefined) {
      registerEntityBounds(entity.id, {
        x: posX,
        y: posY,
        layer: 'world',
      });
    }
  }
  activeEntitiesCache = map;
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
  // If camera action with focus targets, update spotlight state
  if (action.type === 'camera') {
    if (action.focusEntityIds !== undefined) {
      setSpotlightState(action.focusEntityIds, action.focusEntityIds.length > 0);
    }
    return { entities: currentEntities };
  }

  // Clone top-level map
  const nextEntities: Record<string, VisualPrimitive> = { ...currentEntities };

  switch (action.type) {
    case 'entity:spawn': {
      nextEntities[action.entity.id] = JSON.parse(JSON.stringify(action.entity));
      const ent = action.entity as any;
      const posX = ('position' in ent && ent.position?.x !== undefined) ? ent.position.x : (typeof ent.x === 'number' ? ent.x : undefined);
      const posY = ('position' in ent && ent.position?.y !== undefined) ? ent.position.y : (typeof ent.y === 'number' ? ent.y : undefined);
      if (posX !== undefined && posY !== undefined) {
        registerEntityBounds(action.entity.id, {
          x: posX,
          y: posY,
          layer: 'world',
        });
      }
      activeEntitiesCache = nextEntities;
      return { entities: nextEntities };
    }

    case 'entity:destroy': {
      delete nextEntities[action.targetId];
      delete spatialMetadataStore[action.targetId];
      delete activeHighlights[action.targetId];
      activeEntitiesCache = nextEntities;
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
      activeEntitiesCache = nextEntities;
      return { entities: nextEntities };
    }

    case 'array:move_pointer': {
      const target = nextEntities[action.targetId];
      if (target && target.type === 'array') {
        const updatedPointers = (target.pointers || []).map(ptr => 
          ptr.id === action.pointerId 
            ? { ...ptr, targetIndex: action.targetIndex }
            : ptr
        );
        nextEntities[action.targetId] = {
          ...target,
          pointers: updatedPointers,
        };
      }
      activeEntitiesCache = nextEntities;
      return { entities: nextEntities };
    }

    case 'array:highlight_range': {
      const target = nextEntities[action.targetId];
      if (target && target.type === 'array') {
        const updatedItems = (target.items || []).map((item, idx) => {
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
      activeEntitiesCache = nextEntities;
      return { entities: nextEntities };
    }

    case 'array:mark_state': {
      const target = nextEntities[action.targetId];
      if (target && target.type === 'array') {
        const updatedItems = (target.items || []).map((item, idx) => {
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
      activeEntitiesCache = nextEntities;
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
      activeEntitiesCache = nextEntities;
      return { entities: nextEntities };
    }

    case 'graph:set_tangent': {
      const target = nextEntities[action.targetId];
      if (target && target.type === 'graph') {
        nextEntities[action.targetId] = {
          ...target,
          tangentAtX: action.tangentAtX,
        };
      }
      activeEntitiesCache = nextEntities;
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
      activeEntitiesCache = nextEntities;
      return { entities: nextEntities };
    }

    case 'code_trace:set_line': {
      const target = nextEntities[action.targetId];
      if (target && target.type === 'code_trace') {
        nextEntities[action.targetId] = {
          ...target,
          activeLine: action.activeLine,
          variableWatch: action.variableWatch 
            ? { ...target.variableWatch, ...action.variableWatch } 
            : target.variableWatch,
          highlightedLines: action.highlightedLines ?? target.highlightedLines,
        };
      }
      activeEntitiesCache = nextEntities;
      return { entities: nextEntities };
    }

    case 'tree_graph:set_pointer': {
      const target = nextEntities[action.targetId];
      if (target && target.type === 'tree_graph') {
        nextEntities[action.targetId] = {
          ...target,
          activePointer: {
            nodeId: action.nodeId,
            label: action.label,
            color: action.color,
          },
        };
      }
      activeEntitiesCache = nextEntities;
      return { entities: nextEntities };
    }

    case 'tree_graph:mark_node': {
      const target = nextEntities[action.targetId];
      if (target && target.type === 'tree_graph') {
        const updatedNodes = target.nodes.map(n => 
          n.id === action.nodeId 
            ? { ...n, state: action.state, color: action.color ?? n.color } 
            : n
        );
        nextEntities[action.targetId] = {
          ...target,
          nodes: updatedNodes,
        };
      }
      activeEntitiesCache = nextEntities;
      return { entities: nextEntities };
    }

    case 'stack_hashmap:push': {
      const target = nextEntities[action.targetId];
      if (target && target.type === 'stack_hashmap') {
        nextEntities[action.targetId] = {
          ...target,
          entries: [...target.entries, { ...action.entry }],
        };
      }
      activeEntitiesCache = nextEntities;
      return { entities: nextEntities };
    }

    case 'stack_hashmap:pop': {
      const target = nextEntities[action.targetId];
      if (target && target.type === 'stack_hashmap') {
        const nextEntries = action.key 
          ? target.entries.filter(e => e.key !== action.key) 
          : target.entries.slice(0, -1);
        nextEntities[action.targetId] = {
          ...target,
          entries: nextEntries,
        };
      }
      activeEntitiesCache = nextEntities;
      return { entities: nextEntities };
    }

    case 'stack_hashmap:set_entries': {
      const target = nextEntities[action.targetId];
      if (target && target.type === 'stack_hashmap') {
        nextEntities[action.targetId] = {
          ...target,
          entries: action.entries.map(e => ({ ...e })),
        };
      }
      activeEntitiesCache = nextEntities;
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
      activeEntitiesCache = nextEntities;
      return { entities: nextEntities };
  }
}
