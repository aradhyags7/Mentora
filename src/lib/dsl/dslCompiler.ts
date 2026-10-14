/**
 * MENTORA TEACHING DSL COMPILER (Phase 1, 3B1B & Nitish Rajput Upgrades)
 * 
 * Compiles high-level semantic Teaching DSL lessons into deterministic,
 * 60 FPS kinetic timeline representations executed by the Classroom Runtime.
 * 
 * Upgrades:
 * - 3Blue1Brown color-locked LaTeX token maps & progressive SVG geometry
 * - Nitish Rajput infinite canvas camera choreography, spatial investigation nodes,
 *   animated causal connectors, and signature zoom-out finale.
 */

import { TeachingDslLesson } from '../../types/teachingDsl';
import { 
  KineticTimeline, 
  TimelineCue, 
  VisualPrimitive, 
  InvestigationNodePrimitive, 
  CausalConnectorPrimitive,
  MathEquationPrimitive,
  CoordinateGraphPrimitive,
  ArrayPrimitive,
  CodeTracePrimitive,
  TreeGraphPrimitive,
  StackHashMapPrimitive,
  CameraAction
} from '../../types/kinetic';
import { validateAndCompileTimeline } from '../engine/validator';

export class TeachingDslCompiler {
  /**
   * Compiles a Teaching DSL lesson into a runnable KineticTimeline
   * with 3Blue1Brown progressive visuals and Nitish Rajput infinite canvas choreography.
   */
  static compileToTimeline(lesson: TeachingDslLesson): KineticTimeline {
    const rawEntities: VisualPrimitive[] = [];
    const cues: TimelineCue[] = [];
    let accumulatedTimeMs = 0;
    const conceptName = (lesson.meta?.concept || lesson.objective || '').toLowerCase();

    // Map of entity positions for auto-camera choreography
    const entityPositions: Record<string, { x: number; y: number; connectedIds?: string[] }> = {};

    // 1. Synthesize rich Visual Primitives based on concept
    if (conceptName.includes('deriv') || conceptName.includes('calculus') || conceptName.includes('tangent')) {
      // Calculus: Secant -> Tangent limit mind-map & color-locked equation
      const nodeA: InvestigationNodePrimitive = {
        id: 'node_secant_rate',
        type: 'investigation_node',
        title: 'Average Velocity (Secant)',
        categoryBadge: 'Geometric Invariant',
        subtitle: 'Ratio of finite changes Δy / Δx',
        metricLabel: 'Secant Slope m',
        metricValue: 'Δy / Δx',
        accentColor: '#F59E0B',
        position: { x: -320, y: -160 },
        width: 260,
        height: 140,
      };

      const nodeB: InvestigationNodePrimitive = {
        id: 'node_tangent_deriv',
        type: 'investigation_node',
        title: 'Instantaneous Rate (Tangent)',
        categoryBadge: 'The Derivative',
        subtitle: 'Limit as interval collapses to zero',
        metricLabel: "Slope f'(x₀)",
        metricValue: 'lim Δx → 0',
        accentColor: '#10B981',
        position: { x: 320, y: -160 },
        width: 260,
        height: 140,
      };

      const connector: CausalConnectorPrimitive = {
        id: 'conn_secant_to_tangent',
        type: 'causal_connector',
        fromEntityId: 'node_secant_rate',
        toEntityId: 'node_tangent_deriv',
        fromPoint: { x: -190, y: -160 },
        toPoint: { x: 190, y: -160 },
        label: 'Take Limit Δx → 0',
        color: '#38BDF8',
        curveOffset: -30,
      };

      const equation: MathEquationPrimitive = {
        id: 'eq_derivative_def',
        type: 'equation',
        latex: "f'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x + \\Delta x) - f(x)}{\\Delta x}",
        explanation: '3Blue1Brown Color-Locked Definition of the Derivative',
        colorMap: {
          '\\Delta x': '#F59E0B',
          "f'(x)": '#10B981',
          '\\Delta y': '#38BDF8',
          'f(x)': '#A855F7',
        },
        position: { x: 0, y: 190 },
      };

      const graph: CoordinateGraphPrimitive = {
        id: 'graph_derivative_parabola',
        type: 'graph',
        title: 'Parabola f(x) = 0.25x²',
        fnLatex: '0.25 * x^2',
        rangeX: [-1, 6],
        rangeY: [-1, 7],
        tangentAtX: 2.0,
        secantBetween: [2.0, 3.5],
        position: { x: 0, y: 10 },
      };

      rawEntities.push(nodeA, nodeB, connector, equation, graph);
      entityPositions['node_secant_rate'] = { x: -320, y: -160, connectedIds: ['node_tangent_deriv'] };
      entityPositions['node_tangent_deriv'] = { x: 320, y: -160, connectedIds: ['node_secant_rate'] };
      entityPositions['eq_derivative_def'] = { x: 0, y: 190 };
      entityPositions['graph_derivative_parabola'] = { x: 0, y: 10 };
    } else if (conceptName.includes('two_sum') || conceptName.includes('2sum') || conceptName.includes('3sum') || conceptName.includes('hash')) {
      // DSA: Two Sum / HashMap Space-Time Tradeoff
      const nodeIntuition: InvestigationNodePrimitive = {
        id: 'node_intuition',
        type: 'investigation_node',
        title: 'Space-Time Tradeoff',
        categoryBadge: 'Invariant',
        subtitle: 'Naive O(n²) nested loop vs O(1) hash lookup',
        metricLabel: 'Lookup Cost',
        metricValue: 'O(1) Hash Table',
        accentColor: '#38BDF8',
        position: { x: -360, y: -180 },
        width: 280,
      };

      const arrayDryRun: ArrayPrimitive = {
        id: 'array_twosum',
        type: 'array',
        title: 'Input Array (nums)',
        elements: [
          { value: 2, state: 'found' },
          { value: 7, state: 'found' },
          { value: 11, state: 'default' },
          { value: 15, state: 'default' },
        ],
        pointers: [
          { name: 'curr', index: 1, color: '#F59E0B', position: 'top' },
        ],
        position: { x: -360, y: 40 },
      };

      const hashMap: StackHashMapPrimitive = {
        id: 'hashmap_lookup',
        type: 'stack_hashmap',
        title: 'Lookup Table (Complement Map)',
        variant: 'hashmap',
        entries: [
          { key: '2', value: 'index 0', state: 'lookup_hit' },
          { key: '7', value: 'current (match target 9 - 7 = 2)', state: 'pushed' },
        ],
        position: { x: -360, y: 220 },
      };

      const codeTrace: CodeTracePrimitive = {
        id: 'code_twosum',
        type: 'code_trace',
        title: 'two_sum.py',
        language: 'python',
        codeLines: [
          'def two_sum(nums, target):',
          '    lookup = {}',
          '    for i, x in enumerate(nums):',
          '        complement = target - x',
          '        if complement in lookup:',
          '            return [lookup[complement], i]',
          '        lookup[x] = i',
          '    return []',
        ],
        activeLine: 5,
        highlightedLines: [4, 5, 6],
        variableWatch: {
          i: 1,
          x: 7,
          target: 9,
          complement: 2,
          'lookup[2]': 0,
        },
        complexityBadge: {
          time: 'O(n)',
          space: 'O(n)',
        },
        position: { x: 300, y: -20 },
      };

      const conn: CausalConnectorPrimitive = {
        id: 'conn_twosum',
        type: 'causal_connector',
        fromEntityId: 'node_intuition',
        toEntityId: 'code_twosum',
        fromPoint: { x: -220, y: -180 },
        toPoint: { x: 140, y: -20 },
        label: 'Complement = Target - num[i]',
        color: '#F59E0B',
      };

      rawEntities.push(nodeIntuition, arrayDryRun, hashMap, codeTrace, conn);
      entityPositions['node_intuition'] = { x: -360, y: -180, connectedIds: ['code_twosum'] };
      entityPositions['array_twosum'] = { x: -360, y: 40 };
      entityPositions['hashmap_lookup'] = { x: -360, y: 220 };
      entityPositions['code_twosum'] = { x: 300, y: -20 };
    } else if (conceptName.includes('tree') || conceptName.includes('dfs') || conceptName.includes('bfs') || conceptName.includes('graph')) {
      // DSA: Binary Tree DFS & Recursion Call Stack
      const nodeIntuition: InvestigationNodePrimitive = {
        id: 'node_intuition',
        type: 'investigation_node',
        title: 'Recursion Invariant',
        categoryBadge: 'Invariant',
        subtitle: 'Subproblem state preserved on call stack frames',
        metricLabel: 'Recursion Depth',
        metricValue: 'O(H) Height',
        accentColor: '#A855F7',
        position: { x: -360, y: -180 },
        width: 280,
      };

      const treeGraph: TreeGraphPrimitive = {
        id: 'tree_dfs_canvas',
        type: 'tree_graph',
        title: 'Binary Tree Traversal',
        variant: 'binary_tree',
        nodes: [
          { id: '1', label: '1', state: 'visited' },
          { id: '2', label: '2', state: 'visiting' },
          { id: '3', label: '3', state: 'default' },
          { id: '4', label: '4', state: 'default' },
          { id: '5', label: '5', state: 'default' },
        ],
        edges: [
          { from: '1', to: '2', state: 'active', directed: true },
          { from: '1', to: '3', directed: true },
          { from: '2', to: '4', directed: true },
          { from: '2', to: '5', directed: true },
        ],
        activePointer: {
          nodeId: '2',
          label: 'curr (DFS)',
          color: '#F59E0B',
        },
        position: { x: -360, y: 60 },
      };

      const callStack: StackHashMapPrimitive = {
        id: 'call_stack_view',
        type: 'stack_hashmap',
        title: 'Execution Call Stack',
        variant: 'call_stack',
        entries: [
          { key: 'dfs(node=1)', value: 'frame 0' },
          { key: 'dfs(node=2)', value: 'frame 1', state: 'pushed' },
        ],
        position: { x: 260, y: -180 },
      };

      const codeTrace: CodeTracePrimitive = {
        id: 'code_tree_dfs',
        type: 'code_trace',
        title: 'tree_dfs.py',
        language: 'python',
        codeLines: [
          'def dfs(node):',
          '    if not node:',
          '        return',
          '    visit(node.val)',
          '    dfs(node.left)',
          '    dfs(node.right)',
        ],
        activeLine: 4,
        highlightedLines: [4, 5],
        variableWatch: {
          'node.val': 2,
          'stack_depth': 2,
          'path': '1 -> 2',
        },
        complexityBadge: {
          time: 'O(V + E)',
          space: 'O(H)',
        },
        position: { x: 280, y: 80 },
      };

      rawEntities.push(nodeIntuition, treeGraph, callStack, codeTrace);
      entityPositions['node_intuition'] = { x: -360, y: -180 };
      entityPositions['tree_dfs_canvas'] = { x: -360, y: 60 };
      entityPositions['call_stack_view'] = { x: 260, y: -180 };
      entityPositions['code_tree_dfs'] = { x: 280, y: 80 };
    } else {
      // Default DSA: Binary Search (O(log n) Two Pointers)
      const nodeIntuition: InvestigationNodePrimitive = {
        id: 'node_intuition',
        type: 'investigation_node',
        title: 'Problem Intuition & Bottleneck',
        categoryBadge: 'Invariant',
        subtitle: 'Naive O(n) scan vs O(log n) space halving',
        metricLabel: 'Space Reduction',
        metricValue: 'N → N/2',
        accentColor: '#38BDF8',
        position: { x: -360, y: -180 },
        width: 280,
      };

      const arrayDryRun: ArrayPrimitive = {
        id: 'array_binary_search',
        type: 'array',
        title: 'Sorted Memory Space [0..7]',
        elements: [
          { value: 2, state: 'eliminated' },
          { value: 5, state: 'eliminated' },
          { value: 8, state: 'eliminated' },
          { value: 12, state: 'eliminated' },
          { value: 16, state: 'default' },
          { value: 23, state: 'found' },
          { value: 38, state: 'default' },
          { value: 56, state: 'default' },
        ],
        pointers: [
          { name: 'L', index: 4, color: '#38BDF8', position: 'top' },
          { name: 'R', index: 7, color: '#EF4444', position: 'top' },
          { name: 'mid', index: 5, color: '#10B981', position: 'bottom' },
        ],
        highlightRange: {
          start: 4,
          end: 7,
          label: 'Active Search Window',
          color: '#38BDF8',
        },
        position: { x: -360, y: 60 },
      };

      const codeTrace: CodeTracePrimitive = {
        id: 'code_binary_search',
        type: 'code_trace',
        title: 'binary_search.py',
        language: 'python',
        codeLines: [
          'def binary_search(arr, target):',
          '    low, high = 0, len(arr) - 1',
          '    while low <= high:',
          '        mid = (low + high) // 2',
          '        if arr[mid] == target:',
          '            return mid',
          '        elif arr[mid] < target:',
          '            low = mid + 1',
          '        else:',
          '            high = mid - 1',
          '    return -1',
        ],
        activeLine: 5,
        highlightedLines: [4, 5, 6],
        variableWatch: {
          low: 4,
          high: 7,
          mid: 5,
          'arr[mid]': 23,
          target: 23,
        },
        complexityBadge: {
          time: 'O(log n)',
          space: 'O(1)',
        },
        position: { x: 300, y: -50 },
      };

      const bigOEq: MathEquationPrimitive = {
        id: 'eq_complexity',
        type: 'equation',
        latex: "T(n) = T(n/2) + \\mathcal{O}(1) \\implies \\mathcal{O}(\\log n)",
        explanation: 'Master Theorem Recurrence for Halving Invariants',
        position: { x: 300, y: 260 },
      };

      const connector: CausalConnectorPrimitive = {
        id: 'conn_halving',
        type: 'causal_connector',
        fromEntityId: 'node_intuition',
        toEntityId: 'code_binary_search',
        fromPoint: { x: -220, y: -180 },
        toPoint: { x: 140, y: -50 },
        label: 'Mid = (Low + High) / 2',
        color: '#F59E0B',
      };

      rawEntities.push(nodeIntuition, arrayDryRun, codeTrace, bigOEq, connector);
      entityPositions['node_intuition'] = { x: -360, y: -180, connectedIds: ['code_binary_search'] };
      entityPositions['array_binary_search'] = { x: -360, y: 60 };
      entityPositions['code_binary_search'] = { x: 300, y: -50 };
      entityPositions['eq_complexity'] = { x: 300, y: 260 };
    }

    // Record any entity positions with coordinates
    for (const ent of rawEntities) {
      if ('position' in ent && ent.position) {
        entityPositions[ent.id] = { x: ent.position.x, y: ent.position.y };
      }
    }

    // 3. Translate DSL timeline steps into sequentially timed Kinetic Cues with Auto-Camera Choreography
    lesson.timeline.forEach((step, idx) => {
      const cueTimeMs = Math.max(step.t * 1000, accumulatedTimeMs);
      const cueDurationMs = 4000;

      if (step.type === 'speak') {
        const actions: CameraAction[] = [];

        // Auto-Camera Choreography: If beat mentions or references an entity, center camera on it
        const spokenText = step.text.toLowerCase();
        let targetEntityId: string | undefined;

        if (spokenText.includes('intuition') || spokenText.includes('bottleneck') || spokenText.includes('naive') || spokenText.includes('brute') || spokenText.includes('problem')) {
          targetEntityId = 'node_intuition' in entityPositions ? 'node_intuition' : 'node_secant_rate';
        } else if (spokenText.includes('dry') || spokenText.includes('pointer') || spokenText.includes('array') || spokenText.includes('element') || spokenText.includes('window') || spokenText.includes('halv')) {
          targetEntityId = 'array_binary_search' in entityPositions ? 'array_binary_search' : ('array_twosum' in entityPositions ? 'array_twosum' : 'tree_dfs_canvas');
        } else if (spokenText.includes('tree') || spokenText.includes('dfs') || spokenText.includes('recursion') || spokenText.includes('stack')) {
          targetEntityId = 'tree_dfs_canvas' in entityPositions ? 'tree_dfs_canvas' : ('call_stack_view' in entityPositions ? 'call_stack_view' : 'node_intuition');
        } else if (spokenText.includes('hash') || spokenText.includes('map') || spokenText.includes('lookup')) {
          targetEntityId = 'hashmap_lookup' in entityPositions ? 'hashmap_lookup' : 'array_twosum';
        } else if (spokenText.includes('code') || spokenText.includes('trace') || spokenText.includes('line') || spokenText.includes('watch') || spokenText.includes('variable')) {
          targetEntityId = 'code_binary_search' in entityPositions ? 'code_binary_search' : ('code_twosum' in entityPositions ? 'code_twosum' : 'code_tree_dfs');
        } else if (spokenText.includes('complexity') || spokenText.includes('space') || spokenText.includes('time') || spokenText.includes('big') || spokenText.includes('recurrence')) {
          targetEntityId = 'eq_complexity' in entityPositions ? 'eq_complexity' : 'eq_derivative_def';
        } else if (spokenText.includes('secant') || spokenText.includes('average')) {
          targetEntityId = 'node_secant_rate';
        } else if (spokenText.includes('tangent') || spokenText.includes('instant') || spokenText.includes('derivative')) {
          targetEntityId = 'node_tangent_deriv';
        } else if (spokenText.includes('graph') || spokenText.includes('curve') || spokenText.includes('parabola')) {
          targetEntityId = 'graph_derivative_parabola';
        } else if (idx === 0) {
          targetEntityId = Object.keys(entityPositions)[0];
        }

        if (targetEntityId && entityPositions[targetEntityId]) {
          const pos = entityPositions[targetEntityId];
          actions.push({
            type: 'camera',
            panX: -pos.x,
            panY: -pos.y,
            zoom: 1.25,
            durationMs: 1200,
            easing: 'cinema',
            focusEntityIds: [targetEntityId, ...(pos.connectedIds || [])],
            spotlightIntensity: 0.8,
          });
        }

        cues.push({
          id: `cue_${idx}`,
          timestampMs: cueTimeMs,
          durationMs: cueDurationMs,
          narration: step.text,
          words: step.words,
          actions,
        });
        accumulatedTimeMs = cueTimeMs + cueDurationMs;
      } else if (step.type === 'camera') {
        cues.push({
          id: `cue_${idx}`,
          timestampMs: cueTimeMs,
          durationMs: step.durationMs || 1000,
          narration: '',
          actions: [
            {
              type: 'camera',
              panX: step.panX,
              panY: step.panY,
              zoom: step.zoom,
              durationMs: step.durationMs,
              easing: 'cinema',
            },
          ],
        });
        accumulatedTimeMs = cueTimeMs + (step.durationMs || 1000);
      } else if (step.type === 'artifact.animate') {
        const actions: any[] = [];
        if (step.animation === 'secant_to_tangent' || step.animation.includes('tangent')) {
          actions.push({
            type: 'card:update',
            targetId: 'card_calc_status',
            items: [
              { label: 'f(x)', value: '0.5x² - 2' },
              { label: 'x₀', value: '2.0' },
              { label: 'Δx', value: '→ 0.001' },
              { label: 'Instant Slope', value: "f'(2) = 2.0" },
            ],
          });
        }
        cues.push({
          id: `cue_${idx}`,
          timestampMs: cueTimeMs,
          durationMs: step.durationMs || 2500,
          narration: '',
          actions,
        });
        accumulatedTimeMs = cueTimeMs + (step.durationMs || 2500);
      } else if (step.type === 'ask') {
        cues.push({
          id: `cue_${idx}`,
          timestampMs: cueTimeMs,
          durationMs: 5000,
          narration: `Question: ${step.question}`,
          actions: [
            {
              type: 'camera',
              panX: 0,
              panY: 0,
              zoom: 1.0,
              durationMs: 1500,
              easing: 'cinema',
              focusEntityIds: [],
              spotlightIntensity: 0,
            },
          ],
        });
        accumulatedTimeMs = cueTimeMs + 5000;
      }
    });

    // 4. THE SIGNATURE ZOOM-OUT FINALE:
    // Append a majestic documentary zoom-out so the student sees the whole connected system
    cues.push({
      id: `cue_finale_zoomout`,
      timestampMs: accumulatedTimeMs,
      durationMs: 2500,
      narration: 'Observe how the foundational axioms connect into the complete mathematical reality.',
      actions: [
        {
          type: 'camera',
          panX: 0,
          panY: 0,
          zoom: 0.68,
          durationMs: 2500,
          easing: 'cinema',
          focusEntityIds: [],
          spotlightIntensity: 0,
        },
      ],
    });
    accumulatedTimeMs += 2500;

    const rawTimeline = {
      id: lesson.lesson_id,
      title: lesson.objective || 'Interactive Lesson',
      concept: lesson.meta?.concept || 'Lesson',
      totalDurationMs: Math.max(accumulatedTimeMs + 1000, 10000),
      initialEntities: rawEntities,
      cues: cues.length > 0 ? cues : [
        {
          id: 'cue_default',
          timestampMs: 0,
          durationMs: 4000,
          narration: `Exploring ${lesson.objective}`,
          actions: [],
        },
      ],
    };

    return validateAndCompileTimeline(rawTimeline);
  }
}
