import { describe, it, expect } from 'vitest';
import { validateAndCompileTimeline } from '../../src/lib/engine/validator';
import { TeachingDslCompiler } from '../../src/lib/dsl/dslCompiler';
import { VisualPrimitive } from '../../src/types/kinetic';

describe('DSA Visual Primitives & Choreography Engine', () => {
  it('validates and compiles an array with elements, pointers, highlightRange, and swapIndices', () => {
    const rawTimeline = {
      id: 'tl_dsa_array',
      title: 'Array Dry Run',
      concept: 'Binary Search',
      totalDurationMs: 8000,
      initialEntities: [
        {
          id: 'arr_1',
          type: 'array',
          title: 'Memory Cells',
          elements: [
            { value: 10, state: 'eliminated' },
            { value: 25, state: 'active' },
            { value: 40, state: 'found' },
          ],
          pointers: [
            { name: 'L', index: 0, color: '#38BDF8', position: 'top' },
            { name: 'mid', index: 1, color: '#F59E0B', position: 'bottom' },
          ],
          highlightRange: { start: 1, end: 2, label: 'Search Space', color: '#10B981' },
          swapIndices: [0, 1],
          position: { x: -200, y: 50 },
        },
      ],
      cues: [
        {
          id: 'cue_1',
          timestampMs: 0,
          narration: 'Observe memory cells and pointers',
          actions: [],
        },
      ],
    };

    const compiled = validateAndCompileTimeline(rawTimeline);
    expect(compiled.initialEntities.length).toBe(1);
    const arr = compiled.initialEntities[0] as any;
    expect(arr.type).toBe('array');
    expect(arr.elements.length).toBe(3);
    expect(arr.pointers.length).toBe(2);
    expect(arr.highlightRange.label).toBe('Search Space');
    expect(arr.swapIndices).toEqual([0, 1]);
  });

  it('validates and compiles code_trace, tree_graph, and stack_hashmap primitives', () => {
    const rawTimeline = {
      id: 'tl_dsa_structures',
      title: 'DSA Structures',
      concept: 'Tree DFS and Call Stack',
      totalDurationMs: 10000,
      initialEntities: [
        {
          id: 'code_1',
          type: 'code_trace',
          title: 'dfs.py',
          language: 'python',
          codeLines: ['def dfs(u):', '  visit(u)', '  dfs(left)'],
          activeLine: 2,
          variableWatch: { u: 4, depth: 2 },
          complexityBadge: { time: 'O(V+E)', space: 'O(H)' },
          position: { x: 300, y: 0 },
        },
        {
          id: 'tree_1',
          type: 'tree_graph',
          title: 'Call Tree',
          variant: 'binary_tree',
          nodes: [
            { id: 'n1', label: '1', state: 'visited' },
            { id: 'n2', label: '2', state: 'visiting' },
          ],
          edges: [
            { from: 'n1', to: 'n2', state: 'active', directed: true },
          ],
          activePointer: { nodeId: 'n2', label: 'curr' },
          position: { x: -250, y: 0 },
        },
        {
          id: 'stack_1',
          type: 'stack_hashmap',
          title: 'Call Stack',
          variant: 'call_stack',
          entries: [
            { key: 'dfs(1)', value: 'frame 0' },
            { key: 'dfs(2)', value: 'frame 1', state: 'pushed' },
          ],
          position: { x: 0, y: -200 },
        },
      ],
      cues: [
        {
          id: 'cue_1',
          timestampMs: 0,
          narration: 'Tracing tree traversal and call stack',
          actions: [],
        },
      ],
    };

    const compiled = validateAndCompileTimeline(rawTimeline);
    expect(compiled.initialEntities.length).toBe(3);
    const types = compiled.initialEntities.map(e => e.type);
    expect(types).toContain('code_trace');
    expect(types).toContain('tree_graph');
    expect(types).toContain('stack_hashmap');
  });

  it('compiles a dynamic Binary Search lesson with rich 4-beat choreography', () => {
    const dslLesson = {
      lesson_id: 'lesson_bs_test',
      mode: 'visual' as const,
      objective: 'Binary Search Algorithm',
      action: 'VISUALIZE' as const,
      timeline: [
        { t: 0, type: 'speak' as const, text: 'Problem intuition and brute force bottleneck' },
        { t: 4, type: 'speak' as const, text: 'Visual dry-run across sorted memory array and pointers' },
        { t: 8, type: 'speak' as const, text: 'Live code trace and variable watch execution' },
        { t: 12, type: 'ask' as const, question: 'Why does sorted order allow O(log n)?' },
      ],
      meta: { concept: 'Binary Search' },
    };

    const timeline = TeachingDslCompiler.compileToTimeline(dslLesson as any);
    expect(timeline.initialEntities.length).toBeGreaterThanOrEqual(4);
    
    // Checks that ArrayNode and CodeTrace are synthesized on the whiteboard
    const entityTypes = timeline.initialEntities.map(e => e.type);
    expect(entityTypes).toContain('investigation_node');
    expect(entityTypes).toContain('array');
    expect(entityTypes).toContain('code_trace');
    expect(entityTypes).toContain('equation');

    // Checks that finale zoomout cue exists
    const lastCue = timeline.cues[timeline.cues.length - 1];
    expect(lastCue.id).toBe('cue_finale_zoomout');
    const cameraAction = lastCue.actions.find(a => a.type === 'camera') as any;
    expect(cameraAction).toBeDefined();
    expect(cameraAction.zoom).toBe(0.68);
  });
});
