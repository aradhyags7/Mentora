# Mentora Kinetic Timeline DSL Specification

The Kinetic Timeline DSL defines a declarative, serializable JSON contract for driving real-time 60 FPS educational animations.

## Core Schema

```typescript
interface KineticTimeline {
  id: string;
  title: string;
  concept: string;
  totalDurationMs: number;
  initialCamera?: { x: number; y: number; zoom: number };
  initialEntities: VisualPrimitive[];
  cues: TimelineCue[];
}
```

## Visual Primitives
All primitives are addressed by stable string IDs (e.g. `"arr_main"`, `"card_status"`):

1. **ArrayPrimitive (`'array'`)**:
   - `items`: `{ id: string, value: string | number, state: 'default' | 'active' | 'eliminated' | 'found' | 'highlight' }[]`
   - `pointers`: `{ id: string, label: string, targetIndex: number, color?: string, position: 'top' | 'bottom' }[]`

2. **MathEquationPrimitive (`'equation'`)**:
   - `latex`: LaTeX formula rendered via KaTeX
   - `explanation`: string
   - `highlights`: `{ symbolId: string, color: string }[]`

3. **CoordinateGraphPrimitive (`'graph'`)**:
   - `fnLatex`: function definition (e.g. `"0.5*x^2 - 2"`)
   - `rangeX`: `[minX, maxX]`
   - `rangeY`: `[minY, maxY]`
   - `tangentAtX`: instantaneous slope point
   - `points`: `{ x: number, y: number, label?: string, color?: string }[]`

4. **RoughCalloutPrimitive (`'callout'`)**:
   - Rendered using RoughJS hand-drawn sketches
   - `shape`: `'circle' | 'box' | 'arrow' | 'underline' | 'bracket' | 'strike'`
   - `targetEntityId`: Target primitive ID
   - `color`: hex color

5. **CardContainerPrimitive (`'card'`)**:
   - `title`, `subtitle`, `content`
   - `items`: `{ label: string, value: string, badge?: string }[]`
   - `theme`: `'default' | 'accent' | 'warning' | 'success'`

## Actions

- **Camera**: `{ type: 'camera', panX, panY, zoom, durationMs, easing }`
- **Array**:
  - `array:move_pointer`: `{ targetId, pointerId, targetIndex }`
  - `array:highlight_range`: `{ targetId, startIndex, endIndex, state }`
  - `array:mark_state`: `{ targetId, indices, state }`
- **Card**: `{ type: 'card:update', targetId, title, content, items }`
- **Callout**: `{ type: 'callout:show', callout, durationMs }`, `{ type: 'callout:clear', targetId }`
