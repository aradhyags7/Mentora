/**
 * MENTORA UNIVERSAL TEACHING DSL COMPILER (Phase 3 Core Evolution)
 * 
 * Compiles semantic Teaching DSL lessons into deterministic, 60 FPS
 * kinetic timelines with:
 * - 4-Zone Spatial Canvas Layout (Zero Overlap Rule)
 * - Real-Time Word-Level triggerPhrase Synchronization
 * - Multi-beat Live DSA Dry-Runs across all 11 Algorithmic Archetypes
 * - Nitish Rajput cinematic camera choreography + 3B1B visual proofs
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
  CameraAction,
  KineticAction
} from '../../types/kinetic';
import { validateAndCompileTimeline } from '../engine/validator';
import { extractCleanConceptTitle, AlgorithmicArchetype } from '../utils/conceptUtils';
import { alignTimelineTriggersWithNarration } from '../audio/syncedSpeechEngine';

interface ArchetypeSynthesisResult {
  entities: VisualPrimitive[];
  cues: TimelineCue[];
}

export class TeachingDslCompiler {
  /**
   * Compiles a Teaching DSL lesson into a runnable KineticTimeline.
   */
  static compileToTimeline(lesson: TeachingDslLesson): KineticTimeline {
    const rawConcept = lesson.meta?.concept || lesson.objective || '';
    const { cleanTitle, category, archetype, socraticQuestion } = extractCleanConceptTitle(rawConcept);

    // 1. Synthesize 4-Zone Spatial Primitives & Word-Synchronized Cues for the Archetype
    const { entities, cues } = TeachingDslCompiler.synthesizeArchetype(archetype, cleanTitle, socraticQuestion);

    // 2. If the incoming lesson has custom timeline steps, enrich them with camera choreography
    let compiledCues: TimelineCue[] = cues;
    if (lesson.timeline && lesson.timeline.filter(s => s.type === 'speak').length >= 3) {
      compiledCues = TeachingDslCompiler.mergeCustomLessonSteps(lesson.timeline, cues, entities);
    }

    // 3. Assemble and validate the complete kinetic timeline
    const totalDurationMs = compiledCues.reduce((acc, c) => Math.max(acc, c.timestampMs + (c.durationMs || 4000)), 0);

    const rawTimeline: KineticTimeline = {
      id: lesson.lesson_id || `tl_${Date.now()}`,
      title: cleanTitle,
      concept: category,
      totalDurationMs: Math.max(totalDurationMs + 1000, 12000),
      initialCamera: {
        x: -260,
        y: -220,
        zoom: 1.15,
      },
      initialEntities: entities,
      cues: compiledCues,
    };

    const validated = validateAndCompileTimeline(rawTimeline);
    return alignTimelineTriggersWithNarration(validated);
  }

  /**
   * Universal Algorithmic Archetype Synthesizer.
   * Guarantees 4 non-overlapping spatial zones and verbatim triggerPhrase bindings.
   */
  private static synthesizeArchetype(
    archetype: AlgorithmicArchetype,
    cleanTitle: string,
    socraticQuestion: string
  ): ArchetypeSynthesisResult {
    switch (archetype) {
      case 'binary_search':
        return TeachingDslCompiler.buildBinarySearchArchetype(cleanTitle, socraticQuestion);
      case 'two_pointers':
        return TeachingDslCompiler.buildTwoPointersArchetype(cleanTitle, socraticQuestion);
      case 'sliding_window':
        return TeachingDslCompiler.buildSlidingWindowArchetype(cleanTitle, socraticQuestion);
      case 'hashmap':
        return TeachingDslCompiler.buildHashMapArchetype(cleanTitle, socraticQuestion);
      case 'linked_list':
        return TeachingDslCompiler.buildLinkedListArchetype(cleanTitle, socraticQuestion);
      case 'tree_graph':
        return TeachingDslCompiler.buildTreeGraphArchetype(cleanTitle, socraticQuestion);
      case 'stack_queue':
        return TeachingDslCompiler.buildStackQueueArchetype(cleanTitle, socraticQuestion);
      case 'dynamic_programming':
        return TeachingDslCompiler.buildDynamicProgrammingArchetype(cleanTitle, socraticQuestion);
      case 'sorting':
        return TeachingDslCompiler.buildSortingArchetype(cleanTitle, socraticQuestion);
      case 'system_design':
        return TeachingDslCompiler.buildSystemDesignArchetype(cleanTitle, socraticQuestion);
      case 'calculus_math':
      default:
        return TeachingDslCompiler.buildCalculusMathArchetype(cleanTitle, socraticQuestion);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                      ARCHETYPE 1: BINARY SEARCH                            */
  /* -------------------------------------------------------------------------- */
  private static buildBinarySearchArchetype(title: string, socraticQuestion: string): ArchetypeSynthesisResult {
    // Zone A: Intuition & Bottleneck (x: 260, y: 220)
    const nodeA: InvestigationNodePrimitive = {
      id: 'node_bottleneck',
      type: 'investigation_node',
      title: 'Search Invariant & Bottleneck',
      subtitle: 'Linear scan O(n) vs Halving O(log n)',
      categoryBadge: 'Invariant',
      metricLabel: 'Search Space',
      metricValue: 'N → N / 2',
      accentColor: '#38BDF8',
      position: { x: 260, y: 220 },
      width: 260,
      height: 140,
    };

    // Zone B: Data Structure Dry-Run (x: 880, y: 260)
    const arrayB: ArrayPrimitive = {
      id: 'arr_binary_search',
      type: 'array',
      title: 'Sorted Memory Space [0..7] (Target: 23)',
      elements: [
        { value: 2, state: 'default' },
        { value: 5, state: 'default' },
        { value: 8, state: 'default' },
        { value: 12, state: 'default' },
        { value: 16, state: 'default' },
        { value: 23, state: 'default' },
        { value: 38, state: 'default' },
        { value: 56, state: 'default' },
      ],
      pointers: [
        { id: 'ptr_low', name: 'low', targetIndex: 0, color: '#38BDF8', position: 'top' },
        { id: 'ptr_high', name: 'high', targetIndex: 7, color: '#EF4444', position: 'top' },
        { id: 'ptr_mid', name: 'mid', targetIndex: 3, color: '#10B981', position: 'bottom' },
      ],
      highlightRange: { start: 0, end: 7, label: 'Active Search Window', color: '#38BDF8' },
      position: { x: 880, y: 260 },
    };

    // Zone C: Live Code Stepper (x: 1620, y: 340)
    const codeC: CodeTracePrimitive = {
      id: 'code_binary_search',
      type: 'code_trace',
      title: 'binary_search.py',
      language: 'python',
      codeLines: [
        'def binary_search(nums, target):',
        '    low, high = 0, len(nums) - 1',
        '    while low <= high:',
        '        mid = (low + high) // 2',
        '        if nums[mid] == target:',
        '            return mid',
        '        elif nums[mid] < target:',
        '            low = mid + 1',
        '        else:',
        '            high = mid - 1',
        '    return -1',
      ],
      activeLine: 3,
      highlightedLines: [3, 4],
      variableWatch: { low: 0, high: 7, mid: 3, target: 23 },
      complexityBadge: { time: 'O(log n)', space: 'O(1)' },
      position: { x: 1620, y: 340 },
    };

    // Zone D: Complexity Proof (x: 880, y: 840)
    const eqD: MathEquationPrimitive = {
      id: 'eq_complexity',
      type: 'equation',
      latex: 'T(n) = T(n/2) + \\mathcal{O}(1) \\implies \\mathcal{O}(\\log n)',
      explanation: 'Master Theorem Recurrence for Halving Invariants',
      colorMap: { 'T(n)': '#38BDF8', 'T(n/2)': '#F59E0B', '\\mathcal{O}(\\log n)': '#10B981' },
      position: { x: 880, y: 840 },
    };

    const conn: CausalConnectorPrimitive = {
      id: 'conn_halving',
      type: 'causal_connector',
      fromEntityId: 'node_bottleneck',
      toEntityId: 'arr_binary_search',
      fromPoint: { x: 390, y: 220 },
      toPoint: { x: 740, y: 260 },
      label: 'mid = (low + high) // 2',
      color: '#F59E0B',
    };

    const cues: TimelineCue[] = [
      {
        id: 'cue_1',
        timestampMs: 0,
        durationMs: 4500,
        narration: 'In binary search, checking elements one-by-one requires linear time. But sorted order guarantees a halving invariant.',
        actions: [
          { type: 'camera', panX: -260, panY: -220, zoom: 1.2, durationMs: 1000, triggerPhrase: 'linear time' },
        ],
      },
      {
        id: 'cue_2',
        timestampMs: 4500,
        durationMs: 5500,
        narration: 'Notice how the mid pointer lands on index 3 with value 12. Since 12 is less than target 23, we eliminate the entire lower half.',
        actions: [
          { type: 'camera', panX: -880, panY: -260, zoom: 1.25, durationMs: 1000, triggerPhrase: 'mid pointer lands on index 3' },
          { type: 'array:mark_state', targetId: 'arr_binary_search', indices: [0, 1, 2, 3], state: 'eliminated', triggerPhrase: 'eliminate the entire lower half' },
          { type: 'array:move_pointer', targetId: 'arr_binary_search', pointerId: 'ptr_low', targetIndex: 4, triggerPhrase: 'eliminate the entire lower half' },
        ],
      },
      {
        id: 'cue_3',
        timestampMs: 10000,
        durationMs: 5000,
        narration: 'Follow the code stepper on line 8. We advance low to mid plus 1, updating our variable watch instantly to low equals 4.',
        actions: [
          { type: 'camera', panX: -1620, panY: -340, zoom: 1.2, durationMs: 1000, triggerPhrase: 'code stepper on line 8' },
          { type: 'code_trace:set_line', targetId: 'code_binary_search', activeLine: 8, variableWatch: { low: 4, high: 7, mid: 3, target: 23 }, triggerPhrase: 'updating our variable watch instantly' },
        ],
      },
      {
        id: 'cue_4',
        timestampMs: 15000,
        durationMs: 4500,
        narration: 'Because every comparison divides the remaining array by 2, the recurrence relation mathematically proves logarithmic time.',
        actions: [
          { type: 'camera', panX: -880, panY: -840, zoom: 1.2, durationMs: 1000, triggerPhrase: 'recurrence relation mathematically proves' },
        ],
      },
      {
        id: 'cue_socratic',
        timestampMs: 19500,
        durationMs: 4500,
        narration: `Socratic Checkpoint: ${socraticQuestion}`,
        actions: [
          { type: 'camera', panX: -920, panY: -440, zoom: 0.85, durationMs: 1200, triggerPhrase: 'Socratic Checkpoint' },
        ],
      },
      {
        id: 'cue_finale_zoomout',
        timestampMs: 24000,
        durationMs: 2500,
        narration: 'Observe the complete unified system: mathematical halving invariant, live memory board, and synchronized execution trace.',
        actions: [
          { type: 'camera', panX: -950, panY: -460, zoom: 0.68, durationMs: 2500, triggerPhrase: 'complete unified system' },
        ],
      },
    ];

    return { entities: [nodeA, arrayB, codeC, eqD, conn], cues };
  }

  /* -------------------------------------------------------------------------- */
  /*                      ARCHETYPE 2: TWO POINTERS                            */
  /* -------------------------------------------------------------------------- */
  private static buildTwoPointersArchetype(title: string, socraticQuestion: string): ArchetypeSynthesisResult {
    const nodeA: InvestigationNodePrimitive = {
      id: 'node_bottleneck',
      type: 'investigation_node',
      title: 'Monotonic Pointer Invariant',
      subtitle: 'O(n²) nested loop vs O(n) converging pointers',
      categoryBadge: 'Invariant',
      metricLabel: 'Pointer Progress',
      metricValue: 'L → ← R',
      accentColor: '#10B981',
      position: { x: 260, y: 220 },
      width: 260,
      height: 140,
    };

    const arrayB: ArrayPrimitive = {
      id: 'arr_twopointers',
      type: 'array',
      title: 'Sorted Array [0..5] (Target Sum: 11)',
      elements: [
        { value: 1, state: 'default' },
        { value: 3, state: 'default' },
        { value: 4, state: 'default' },
        { value: 7, state: 'found' },
        { value: 10, state: 'default' },
        { value: 14, state: 'eliminated' },
      ],
      pointers: [
        { id: 'ptr_l', name: 'left', targetIndex: 2, color: '#38BDF8', position: 'top' },
        { id: 'ptr_r', name: 'right', targetIndex: 3, color: '#EF4444', position: 'top' },
      ],
      position: { x: 880, y: 260 },
    };

    const codeC: CodeTracePrimitive = {
      id: 'code_twopointers',
      type: 'code_trace',
      title: 'two_pointers.py',
      language: 'python',
      codeLines: [
        'def two_sum_sorted(nums, target):',
        '    left, right = 0, len(nums) - 1',
        '    while left < right:',
        '        curr_sum = nums[left] + nums[right]',
        '        if curr_sum == target:',
        '            return [left, right]',
        '        elif curr_sum < target:',
        '            left += 1',
        '        else:',
        '            right -= 1',
        '    return []',
      ],
      activeLine: 5,
      highlightedLines: [4, 5, 6],
      variableWatch: { left: 2, right: 3, curr_sum: 11, target: 11 },
      complexityBadge: { time: 'O(n)', space: 'O(1)' },
      position: { x: 1620, y: 340 },
    };

    const eqD: MathEquationPrimitive = {
      id: 'eq_complexity',
      type: 'equation',
      latex: 'T(n) = \\mathcal{O}(n), \\quad S(n) = \\mathcal{O}(1)',
      explanation: 'Each step monotonically moves left or right by at least 1 index',
      position: { x: 880, y: 840 },
    };

    const cues: TimelineCue[] = [
      {
        id: 'cue_1',
        timestampMs: 0,
        durationMs: 4500,
        narration: 'Comparing all pairs takes quadratic time. But when the array is sorted, our converging two pointers eliminate entire rows of combinations.',
        actions: [
          { type: 'camera', panX: -260, panY: -220, zoom: 1.2, durationMs: 1000, triggerPhrase: 'quadratic time' },
        ],
      },
      {
        id: 'cue_2',
        timestampMs: 4500,
        durationMs: 5500,
        narration: 'Observe our memory board: left pointer points to 4 and right pointer points to 7. Their sum exactly equals target 11!',
        actions: [
          { type: 'camera', panX: -880, panY: -260, zoom: 1.25, durationMs: 1000, triggerPhrase: 'left pointer points to 4' },
          { type: 'array:mark_state', targetId: 'arr_twopointers', indices: [2, 3], state: 'found', triggerPhrase: 'sum exactly equals target 11' },
        ],
      },
      {
        id: 'cue_3',
        timestampMs: 10000,
        durationMs: 5000,
        narration: 'Notice line 5 in the code trace: the condition evaluates to true, and our live variable watch captures the solution.',
        actions: [
          { type: 'camera', panX: -1620, panY: -340, zoom: 1.2, durationMs: 1000, triggerPhrase: 'condition evaluates to true' },
          { type: 'code_trace:set_line', targetId: 'code_twopointers', activeLine: 6, variableWatch: { left: 2, right: 3, curr_sum: 11 }, triggerPhrase: 'live variable watch captures' },
        ],
      },
      {
        id: 'cue_socratic',
        timestampMs: 15000,
        durationMs: 4500,
        narration: `Socratic Checkpoint: ${socraticQuestion}`,
        actions: [
          { type: 'camera', panX: -920, panY: -440, zoom: 0.85, durationMs: 1200, triggerPhrase: 'Socratic Checkpoint' },
        ],
      },
      {
        id: 'cue_finale_zoomout',
        timestampMs: 19500,
        durationMs: 2500,
        narration: 'The two pointers guarantee linear convergence without any auxiliary memory allocation.',
        actions: [
          { type: 'camera', panX: -950, panY: -460, zoom: 0.68, durationMs: 2500, triggerPhrase: 'linear convergence' },
        ],
      },
    ];

    return { entities: [nodeA, arrayB, codeC, eqD], cues };
  }

  /* -------------------------------------------------------------------------- */
  /*                      ARCHETYPE 3: SLIDING WINDOW                          */
  /* -------------------------------------------------------------------------- */
  private static buildSlidingWindowArchetype(title: string, socraticQuestion: string): ArchetypeSynthesisResult {
    const nodeA: InvestigationNodePrimitive = {
      id: 'node_bottleneck',
      type: 'investigation_node',
      title: 'Contiguous Window Invariant',
      subtitle: 'O(k · n) re-summing vs O(1) boundary updates',
      categoryBadge: 'Invariant',
      metricLabel: 'Window Slide',
      metricValue: '+nums[R] -nums[L]',
      accentColor: '#F59E0B',
      position: { x: 260, y: 220 },
      width: 260,
      height: 140,
    };

    const arrayB: ArrayPrimitive = {
      id: 'arr_sliding_window',
      type: 'array',
      title: 'Array Elements [0..5] (Window Size k=3)',
      elements: [
        { value: 2, state: 'eliminated' },
        { value: 1, state: 'active' },
        { value: 5, state: 'active' },
        { value: 1, state: 'active' },
        { value: 3, state: 'default' },
        { value: 2, state: 'default' },
      ],
      pointers: [
        { id: 'ptr_l', name: 'L', targetIndex: 1, color: '#38BDF8', position: 'top' },
        { id: 'ptr_r', name: 'R', targetIndex: 3, color: '#10B981', position: 'top' },
      ],
      highlightRange: { start: 1, end: 3, label: 'Window Sum = 7', color: '#F59E0B' },
      position: { x: 880, y: 260 },
    };

    const stackB: StackHashMapPrimitive = {
      id: 'stack_window_state',
      type: 'stack_hashmap',
      title: 'Window State Monitor',
      variant: 'monotonic_stack',
      entries: [
        { key: 'window_sum', value: '7', state: 'lookup_hit' },
        { key: 'max_sum', value: '8', state: 'pushed' },
      ],
      position: { x: 880, y: 460 },
    };

    const codeC: CodeTracePrimitive = {
      id: 'code_sliding_window',
      type: 'code_trace',
      title: 'sliding_window.py',
      language: 'python',
      codeLines: [
        'def max_sub_array_of_size_k(k, nums):',
        '    max_sum, window_sum = 0, sum(nums[:k])',
        '    for right in range(k, len(nums)):',
        '        window_sum += nums[right] - nums[right - k]',
        '        max_sum = max(max_sum, window_sum)',
        '    return max_sum',
      ],
      activeLine: 4,
      highlightedLines: [3, 4, 5],
      variableWatch: { right: 3, 'nums[right]': 1, window_sum: 7, max_sum: 8 },
      complexityBadge: { time: 'O(n)', space: 'O(1)' },
      position: { x: 1620, y: 340 },
    };

    const eqD: MathEquationPrimitive = {
      id: 'eq_complexity',
      type: 'equation',
      latex: 'T(n) = \\mathcal{O}(n) \\implies \\text{Each element enters and exits window once}',
      explanation: 'Linear time scaling by recycling contiguous overlapping state',
      position: { x: 880, y: 840 },
    };

    const cues: TimelineCue[] = [
      {
        id: 'cue_1',
        timestampMs: 0,
        durationMs: 4500,
        narration: 'Recomputing window sums from scratch wastes redundant operations. Sliding window recycles the previous sum with one addition and one subtraction.',
        actions: [
          { type: 'camera', panX: -260, panY: -220, zoom: 1.2, durationMs: 1000, triggerPhrase: 'redundant operations' },
        ],
      },
      {
        id: 'cue_2',
        timestampMs: 4500,
        durationMs: 5500,
        narration: 'Watch our window slide forward: right pointer expands to include 1, while left pointer contracts past index 0.',
        actions: [
          { type: 'camera', panX: -880, panY: -260, zoom: 1.25, durationMs: 1000, triggerPhrase: 'right pointer expands' },
          { type: 'array:highlight_range', targetId: 'arr_sliding_window', startIndex: 1, endIndex: 3, state: 'active', triggerPhrase: 'left pointer contracts' },
        ],
      },
      {
        id: 'cue_3',
        timestampMs: 10000,
        durationMs: 5000,
        narration: 'On line 4 of the code trace, window sum updates dynamically in constant time, updating our live variable watch.',
        actions: [
          { type: 'camera', panX: -1620, panY: -340, zoom: 1.2, durationMs: 1000, triggerPhrase: 'line 4 of the code trace' },
          { type: 'code_trace:set_line', targetId: 'code_sliding_window', activeLine: 4, variableWatch: { right: 3, window_sum: 7 }, triggerPhrase: 'updating our live variable watch' },
        ],
      },
      {
        id: 'cue_socratic',
        timestampMs: 15000,
        durationMs: 4500,
        narration: `Socratic Checkpoint: ${socraticQuestion}`,
        actions: [
          { type: 'camera', panX: -920, panY: -440, zoom: 0.85, durationMs: 1200, triggerPhrase: 'Socratic Checkpoint' },
        ],
      },
      {
        id: 'cue_finale_zoomout',
        timestampMs: 19500,
        durationMs: 2500,
        narration: 'Every element is visited at most twice, guaranteeing optimal linear time complexity.',
        actions: [
          { type: 'camera', panX: -950, panY: -460, zoom: 0.68, durationMs: 2500, triggerPhrase: 'optimal linear time' },
        ],
      },
    ];

    return { entities: [nodeA, arrayB, stackB, codeC, eqD], cues };
  }

  /* -------------------------------------------------------------------------- */
  /*                      ARCHETYPE 4: HASHMAP (TWO SUM)                       */
  /* -------------------------------------------------------------------------- */
  private static buildHashMapArchetype(title: string, socraticQuestion: string): ArchetypeSynthesisResult {
    const nodeA: InvestigationNodePrimitive = {
      id: 'node_bottleneck',
      type: 'investigation_node',
      title: 'Space-Time Tradeoff',
      subtitle: 'O(n²) nested loop vs O(1) hash lookup',
      categoryBadge: 'Tradeoff',
      metricLabel: 'Lookup Time',
      metricValue: 'O(1) Amortized',
      accentColor: '#38BDF8',
      position: { x: 260, y: 220 },
      width: 260,
      height: 140,
    };

    const arrayB: ArrayPrimitive = {
      id: 'arr_hashmap',
      type: 'array',
      title: 'Input Array (nums, Target: 9)',
      elements: [
        { value: 2, state: 'found' },
        { value: 7, state: 'found' },
        { value: 11, state: 'default' },
        { value: 15, state: 'default' },
      ],
      pointers: [
        { id: 'ptr_curr', name: 'i', targetIndex: 1, color: '#F59E0B', position: 'top' },
      ],
      position: { x: 880, y: 260 },
    };

    const hashmapB: StackHashMapPrimitive = {
      id: 'hashmap_table',
      type: 'stack_hashmap',
      title: 'Complement Lookup Table',
      variant: 'hashmap',
      entries: [
        { key: '2', value: 'index 0', state: 'lookup_hit' },
        { key: '7', value: 'current (match target 9 - 7 = 2)', state: 'pushed' },
      ],
      position: { x: 880, y: 460 },
    };

    const codeC: CodeTracePrimitive = {
      id: 'code_hashmap',
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
      variableWatch: { i: 1, x: 7, complement: 2, 'lookup[2]': 0 },
      complexityBadge: { time: 'O(n)', space: 'O(n)' },
      position: { x: 1620, y: 340 },
    };

    const eqD: MathEquationPrimitive = {
      id: 'eq_complexity',
      type: 'equation',
      latex: 'T(n) = \\mathcal{O}(n), \\quad S(n) = \\mathcal{O}(n)',
      explanation: 'Trading O(n) auxiliary hash memory for constant-time complement lookups',
      position: { x: 880, y: 840 },
    };

    const cues: TimelineCue[] = [
      {
        id: 'cue_1',
        timestampMs: 0,
        durationMs: 4500,
        narration: 'Brute force checks every pair in quadratic time. But by storing complements in a hash map, we resolve lookups in constant time.',
        actions: [
          { type: 'camera', panX: -260, panY: -220, zoom: 1.2, durationMs: 1000, triggerPhrase: 'quadratic time' },
        ],
      },
      {
        id: 'cue_2',
        timestampMs: 4500,
        durationMs: 5500,
        narration: 'On our memory board, as we inspect value 7 with target 9, our complement is 2. The hash table registers an instantaneous lookup hit!',
        actions: [
          { type: 'camera', panX: -880, panY: -360, zoom: 1.2, durationMs: 1000, triggerPhrase: 'our complement is 2' },
          { type: 'stack_hashmap:push', targetId: 'hashmap_table', entry: { key: '7', value: 'index 1', state: 'pushed' }, triggerPhrase: 'instantaneous lookup hit' },
        ],
      },
      {
        id: 'cue_3',
        timestampMs: 10000,
        durationMs: 5000,
        narration: 'Trace line 5 in the editor: the complement exists in our map, and the variable watch returns index pair 0 and 1.',
        actions: [
          { type: 'camera', panX: -1620, panY: -340, zoom: 1.2, durationMs: 1000, triggerPhrase: 'Trace line 5 in the editor' },
          { type: 'code_trace:set_line', targetId: 'code_hashmap', activeLine: 6, variableWatch: { i: 1, x: 7, complement: 2 }, triggerPhrase: 'returns index pair' },
        ],
      },
      {
        id: 'cue_socratic',
        timestampMs: 15000,
        durationMs: 4500,
        narration: `Socratic Checkpoint: ${socraticQuestion}`,
        actions: [
          { type: 'camera', panX: -920, panY: -440, zoom: 0.85, durationMs: 1200, triggerPhrase: 'Socratic Checkpoint' },
        ],
      },
      {
        id: 'cue_finale_zoomout',
        timestampMs: 19500,
        durationMs: 2500,
        narration: 'A single linear scan with instantaneous hash lookups achieves optimal runtime.',
        actions: [
          { type: 'camera', panX: -950, panY: -460, zoom: 0.68, durationMs: 2500, triggerPhrase: 'optimal runtime' },
        ],
      },
    ];

    return { entities: [nodeA, arrayB, hashmapB, codeC, eqD], cues };
  }

  /* -------------------------------------------------------------------------- */
  /*                      ARCHETYPE 5: LINKED LIST                             */
  /* -------------------------------------------------------------------------- */
  private static buildLinkedListArchetype(title: string, socraticQuestion: string): ArchetypeSynthesisResult {
    const nodeA: InvestigationNodePrimitive = {
      id: 'node_bottleneck',
      type: 'investigation_node',
      title: 'Pointer Overwrite Hazard',
      subtitle: 'Temporary next reference preserves the forward chain',
      categoryBadge: 'Invariant',
      metricLabel: 'Aux Space',
      metricValue: 'O(1) In-Place',
      accentColor: '#10B981',
      position: { x: 260, y: 220 },
      width: 260,
      height: 140,
    };

    const listB: TreeGraphPrimitive = {
      id: 'list_reverse_canvas',
      type: 'tree_graph',
      title: 'Linked List Node Capsules [ val | next • ]',
      variant: 'linked_list',
      nodes: [
        { id: 'n1', label: '1', state: 'visited' },
        { id: 'n2', label: '2', state: 'visiting' },
        { id: 'n3', label: '3', state: 'default' },
        { id: 'n4', label: '4', state: 'default' },
      ],
      edges: [
        { from: 'n2', to: 'n1', directed: true, state: 'active' },
        { from: 'n2', to: 'n3', directed: true, state: 'default' },
        { from: 'n3', to: 'n4', directed: true, state: 'default' },
      ],
      activePointer: { nodeId: 'n2', label: 'curr', color: '#F59E0B' },
      position: { x: 880, y: 260 },
    };

    const codeC: CodeTracePrimitive = {
      id: 'code_reverse_list',
      type: 'code_trace',
      title: 'reverse_list.py',
      language: 'python',
      codeLines: [
        'def reverse_list(head):',
        '    prev = None',
        '    curr = head',
        '    while curr:',
        '        next_temp = curr.next',
        '        curr.next = prev',
        '        prev = curr',
        '        curr = next_temp',
        '    return prev',
      ],
      activeLine: 6,
      highlightedLines: [5, 6, 7],
      variableWatch: { 'prev.val': 1, 'curr.val': 2, 'next_temp.val': 3 },
      complexityBadge: { time: 'O(n)', space: 'O(1)' },
      position: { x: 1620, y: 340 },
    };

    const eqD: MathEquationPrimitive = {
      id: 'eq_complexity',
      type: 'equation',
      latex: 'T(n) = \\mathcal{O}(n), \\quad S(n) = \\mathcal{O}(1)',
      explanation: 'In-place pointer reversal rewiring n references without allocating new nodes',
      position: { x: 880, y: 840 },
    };

    const cues: TimelineCue[] = [
      {
        id: 'cue_1',
        timestampMs: 0,
        durationMs: 4500,
        narration: 'Overwriting a node pointer without a temporary reference breaks the chain, causing orphaned nodes in memory.',
        actions: [
          { type: 'camera', panX: -260, panY: -220, zoom: 1.2, durationMs: 1000, triggerPhrase: 'orphaned nodes' },
        ],
      },
      {
        id: 'cue_2',
        timestampMs: 4500,
        durationMs: 5500,
        narration: 'Notice on our canvas: curr pointer targets node 2. Before pointing backwards to prev, next pointer preserves node 3 safely.',
        actions: [
          { type: 'camera', panX: -880, panY: -260, zoom: 1.25, durationMs: 1000, triggerPhrase: 'curr pointer targets node 2' },
          { type: 'tree_graph:mark_node', targetId: 'list_reverse_canvas', nodeId: 'n2', state: 'visiting', triggerPhrase: 'preserves node 3 safely' },
        ],
      },
      {
        id: 'cue_3',
        timestampMs: 10000,
        durationMs: 5000,
        narration: 'Line 6 executes: curr.next re-wires to prev, reversing the directional arrow while the variable watch confirms pointer shifts.',
        actions: [
          { type: 'camera', panX: -1620, panY: -340, zoom: 1.2, durationMs: 1000, triggerPhrase: 'Line 6 executes' },
          { type: 'code_trace:set_line', targetId: 'code_reverse_list', activeLine: 6, variableWatch: { 'prev.val': 1, 'curr.val': 2 }, triggerPhrase: 'reversing the directional arrow' },
        ],
      },
      {
        id: 'cue_socratic',
        timestampMs: 15000,
        durationMs: 4500,
        narration: `Socratic Checkpoint: ${socraticQuestion}`,
        actions: [
          { type: 'camera', panX: -920, panY: -440, zoom: 0.85, durationMs: 1200, triggerPhrase: 'Socratic Checkpoint' },
        ],
      },
      {
        id: 'cue_finale_zoomout',
        timestampMs: 19500,
        durationMs: 2500,
        narration: 'The entire list reverses in-place with zero memory allocation overhead.',
        actions: [
          { type: 'camera', panX: -950, panY: -460, zoom: 0.68, durationMs: 2500, triggerPhrase: 'zero memory allocation' },
        ],
      },
    ];

    return { entities: [nodeA, listB, codeC, eqD], cues };
  }

  /* -------------------------------------------------------------------------- */
  /*                      ARCHETYPE 6: TREE & GRAPH (DFS/BFS)                  */
  /* -------------------------------------------------------------------------- */
  private static buildTreeGraphArchetype(title: string, socraticQuestion: string): ArchetypeSynthesisResult {
    const nodeA: InvestigationNodePrimitive = {
      id: 'node_bottleneck',
      type: 'investigation_node',
      title: 'Recursion Invariant',
      subtitle: 'Subproblem state preserved on call stack frames',
      categoryBadge: 'Invariant',
      metricLabel: 'Recursion Depth',
      metricValue: 'O(H) Height',
      accentColor: '#A855F7',
      position: { x: 260, y: 220 },
      width: 260,
      height: 140,
    };

    const treeB: TreeGraphPrimitive = {
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
      activePointer: { nodeId: '2', label: 'curr (DFS)', color: '#F59E0B' },
      position: { x: 880, y: 240 },
    };

    const stackB: StackHashMapPrimitive = {
      id: 'call_stack_view',
      type: 'stack_hashmap',
      title: 'Execution Call Stack',
      variant: 'call_stack',
      entries: [
        { key: 'dfs(node=1)', value: 'frame 0' },
        { key: 'dfs(node=2)', value: 'frame 1', state: 'pushed' },
      ],
      position: { x: 880, y: 460 },
    };

    const codeC: CodeTracePrimitive = {
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
      variableWatch: { 'node.val': 2, stack_depth: 2, path: '1 -> 2' },
      complexityBadge: { time: 'O(V + E)', space: 'O(H)' },
      position: { x: 1620, y: 340 },
    };

    const eqD: MathEquationPrimitive = {
      id: 'eq_complexity',
      type: 'equation',
      latex: 'T(n) = \\mathcal{O}(V + E), \\quad S(n) = \\mathcal{O}(H)',
      explanation: 'Depth-first search traverses each node once with call stack height O(H)',
      position: { x: 880, y: 840 },
    };

    const cues: TimelineCue[] = [
      {
        id: 'cue_1',
        timestampMs: 0,
        durationMs: 4500,
        narration: 'Tree traversal preserves parent state while recursively exploring children down branches.',
        actions: [
          { type: 'camera', panX: -260, panY: -220, zoom: 1.2, durationMs: 1000, triggerPhrase: 'parent state' },
        ],
      },
      {
        id: 'cue_2',
        timestampMs: 4500,
        durationMs: 5500,
        narration: 'Observe node 2 on our binary tree transitioning to visiting. A new stack frame is pushed onto our execution call stack.',
        actions: [
          { type: 'camera', panX: -880, panY: -350, zoom: 1.2, durationMs: 1000, triggerPhrase: 'transitioning to visiting' },
          { type: 'tree_graph:mark_node', targetId: 'tree_dfs_canvas', nodeId: '2', state: 'visiting', triggerPhrase: 'transitioning to visiting' },
          { type: 'stack_hashmap:push', targetId: 'call_stack_view', entry: { key: 'dfs(node=2)', value: 'frame 1', state: 'pushed' }, triggerPhrase: 'pushed onto our execution call stack' },
        ],
      },
      {
        id: 'cue_3',
        timestampMs: 10000,
        durationMs: 5000,
        narration: 'On line 4 of the trace, visit executes before branching to dfs(node.left), keeping stack depth perfectly synchronized.',
        actions: [
          { type: 'camera', panX: -1620, panY: -340, zoom: 1.2, durationMs: 1000, triggerPhrase: 'line 4 of the trace' },
          { type: 'code_trace:set_line', targetId: 'code_tree_dfs', activeLine: 5, variableWatch: { 'node.val': 2, stack_depth: 2 }, triggerPhrase: 'dfs(node.left)' },
        ],
      },
      {
        id: 'cue_socratic',
        timestampMs: 15000,
        durationMs: 4500,
        narration: `Socratic Checkpoint: ${socraticQuestion}`,
        actions: [
          { type: 'camera', panX: -920, panY: -440, zoom: 0.85, durationMs: 1200, triggerPhrase: 'Socratic Checkpoint' },
        ],
      },
      {
        id: 'cue_finale_zoomout',
        timestampMs: 19500,
        durationMs: 2500,
        narration: 'Backtracking safely pops stack frames to restore previous branch context.',
        actions: [
          { type: 'camera', panX: -950, panY: -460, zoom: 0.68, durationMs: 2500, triggerPhrase: 'restore previous branch context' },
        ],
      },
    ];

    return { entities: [nodeA, treeB, stackB, codeC, eqD], cues };
  }

  /* -------------------------------------------------------------------------- */
  /*                      ARCHETYPE 7: STACK & QUEUE                            */
  /* -------------------------------------------------------------------------- */
  private static buildStackQueueArchetype(title: string, socraticQuestion: string): ArchetypeSynthesisResult {
    const nodeA: InvestigationNodePrimitive = {
      id: 'node_bottleneck',
      type: 'investigation_node',
      title: 'LIFO Monotonic Invariant',
      subtitle: 'Last-In First-Out resolution of nested syntax',
      categoryBadge: 'Invariant',
      metricLabel: 'Stack State',
      metricValue: 'Push / Pop O(1)',
      accentColor: '#38BDF8',
      position: { x: 260, y: 220 },
      width: 260,
      height: 140,
    };

    const arrayB: ArrayPrimitive = {
      id: 'arr_tokens',
      type: 'array',
      title: 'Expression Tokens: "({[]})"',
      elements: [
        { value: '(', state: 'eliminated' },
        { value: '{', state: 'eliminated' },
        { value: '[', state: 'active' },
        { value: ']', state: 'default' },
        { value: '}', state: 'default' },
        { value: ')', state: 'default' },
      ],
      pointers: [
        { id: 'ptr_curr', name: 'char', targetIndex: 2, color: '#F59E0B', position: 'top' },
      ],
      position: { x: 880, y: 260 },
    };

    const stackB: StackHashMapPrimitive = {
      id: 'stack_bracket_view',
      type: 'stack_hashmap',
      title: 'Bracket Matcher Stack',
      variant: 'monotonic_stack',
      entries: [
        { key: 'frame_0', value: '(', state: 'default' },
        { key: 'frame_1', value: '{', state: 'default' },
        { key: 'frame_2', value: '[', state: 'pushed' },
      ],
      position: { x: 880, y: 460 },
    };

    const codeC: CodeTracePrimitive = {
      id: 'code_valid_parentheses',
      type: 'code_trace',
      title: 'valid_parentheses.py',
      language: 'python',
      codeLines: [
        'def is_valid(s):',
        '    stack = []',
        '    mapping = {")": "(", "}": "{", "]": "["}',
        '    for char in s:',
        '        if char in mapping:',
        '            top = stack.pop() if stack else "#"',
        '            if mapping[char] != top:',
        '                return False',
        '        else:',
        '            stack.append(char)',
        '    return not stack',
      ],
      activeLine: 10,
      highlightedLines: [9, 10],
      variableWatch: { char: '[', 'stack.len': 3, top: '[' },
      complexityBadge: { time: 'O(n)', space: 'O(n)' },
      position: { x: 1620, y: 340 },
    };

    const eqD: MathEquationPrimitive = {
      id: 'eq_complexity',
      type: 'equation',
      latex: 'T(n) = \\mathcal{O}(n), \\quad S(n) = \\mathcal{O}(n)',
      explanation: 'Every character pushed and popped exactly once in constant time',
      position: { x: 880, y: 840 },
    };

    const cues: TimelineCue[] = [
      {
        id: 'cue_1',
        timestampMs: 0,
        durationMs: 4500,
        narration: 'Matching nested brackets requires last-in first-out ordering so that the most recent opening bracket matches first.',
        actions: [
          { type: 'camera', panX: -260, panY: -220, zoom: 1.2, durationMs: 1000, triggerPhrase: 'most recent opening bracket' },
        ],
      },
      {
        id: 'cue_2',
        timestampMs: 4500,
        durationMs: 5500,
        narration: 'On our memory board, encountering an opening bracket pushes it directly into our active stack frame.',
        actions: [
          { type: 'camera', panX: -880, panY: -360, zoom: 1.25, durationMs: 1000, triggerPhrase: 'active stack frame' },
          { type: 'stack_hashmap:push', targetId: 'stack_bracket_view', entry: { key: 'frame_2', value: '[', state: 'pushed' }, triggerPhrase: 'active stack frame' },
        ],
      },
      {
        id: 'cue_3',
        timestampMs: 10000,
        durationMs: 5000,
        narration: 'Line 10 executes stack.append(char), updating our live variable watch with the new top of the stack.',
        actions: [
          { type: 'camera', panX: -1620, panY: -340, zoom: 1.2, durationMs: 1000, triggerPhrase: 'Line 10 executes' },
          { type: 'code_trace:set_line', targetId: 'code_valid_parentheses', activeLine: 10, variableWatch: { char: '[', 'stack.len': 3 }, triggerPhrase: 'live variable watch' },
        ],
      },
      {
        id: 'cue_socratic',
        timestampMs: 15000,
        durationMs: 4500,
        narration: `Socratic Checkpoint: ${socraticQuestion}`,
        actions: [
          { type: 'camera', panX: -920, panY: -440, zoom: 0.85, durationMs: 1200, triggerPhrase: 'Socratic Checkpoint' },
        ],
      },
      {
        id: 'cue_finale_zoomout',
        timestampMs: 19500,
        durationMs: 2500,
        narration: 'An empty stack at the end confirms all opening brackets were symmetrically closed.',
        actions: [
          { type: 'camera', panX: -950, panY: -460, zoom: 0.68, durationMs: 2500, triggerPhrase: 'symmetrically closed' },
        ],
      },
    ];

    return { entities: [nodeA, arrayB, stackB, codeC, eqD], cues };
  }

  /* -------------------------------------------------------------------------- */
  /*                      ARCHETYPE 8: DYNAMIC PROGRAMMING                      */
  /* -------------------------------------------------------------------------- */
  private static buildDynamicProgrammingArchetype(title: string, socraticQuestion: string): ArchetypeSynthesisResult {
    const nodeA: InvestigationNodePrimitive = {
      id: 'node_bottleneck',
      type: 'investigation_node',
      title: 'Optimal Substructure',
      subtitle: 'Exponential O(2ⁿ) branching vs O(n) memoized DAG',
      categoryBadge: 'Invariant',
      metricLabel: 'State Reuse',
      metricValue: 'O(1) Table Lookups',
      accentColor: '#A855F7',
      position: { x: 260, y: 220 },
      width: 260,
      height: 140,
    };

    const treeB: TreeGraphPrimitive = {
      id: 'tree_dp_dag',
      type: 'tree_graph',
      title: 'Recursion DAG with Memoized Cache',
      variant: 'recursion_tree',
      nodes: [
        { id: 'f4', label: 'fib(4)', state: 'visited' },
        { id: 'f3', label: 'fib(3)', state: 'visited' },
        { id: 'f2_a', label: 'fib(2) (cache hit)', state: 'target', color: '#10B981' },
        { id: 'f1', label: 'fib(1)=1', state: 'visited' },
        { id: 'f0', label: 'fib(0)=0', state: 'visited' },
      ],
      edges: [
        { from: 'f4', to: 'f3', directed: true },
        { from: 'f4', to: 'f2_a', directed: true, state: 'active' },
        { from: 'f3', to: 'f2_a', directed: true },
        { from: 'f3', to: 'f1', directed: true },
      ],
      activePointer: { nodeId: 'f2_a', label: 'O(1) Memo Hit', color: '#10B981' },
      position: { x: 880, y: 240 },
    };

    const stackB: StackHashMapPrimitive = {
      id: 'dp_memo_table',
      type: 'stack_hashmap',
      title: 'DP Memoization Table',
      variant: 'hashmap',
      entries: [
        { key: 'dp[0]', value: '0', state: 'default' },
        { key: 'dp[1]', value: '1', state: 'default' },
        { key: 'dp[2]', value: '1', state: 'lookup_hit' },
        { key: 'dp[3]', value: '2', state: 'lookup_hit' },
      ],
      position: { x: 880, y: 460 },
    };

    const codeC: CodeTracePrimitive = {
      id: 'code_dp_memo',
      type: 'code_trace',
      title: 'fib_memo.py',
      language: 'python',
      codeLines: [
        'def fib(n, memo={}):',
        '    if n in memo:',
        '        return memo[n]',
        '    if n <= 1:',
        '        return n',
        '    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)',
        '    return memo[n]',
      ],
      activeLine: 3,
      highlightedLines: [2, 3],
      variableWatch: { n: 2, 'memo[2]': 1, 'branch_pruned': 'true' },
      complexityBadge: { time: 'O(n)', space: 'O(n)' },
      position: { x: 1620, y: 340 },
    };

    const eqD: MathEquationPrimitive = {
      id: 'eq_complexity',
      type: 'equation',
      latex: 'T(n) = \\mathcal{O}(n) \\quad \\text{vs Naive } \\mathcal{O}(2^n)',
      explanation: 'Overlapping subproblems collapsed into unique states',
      position: { x: 880, y: 840 },
    };

    const cues: TimelineCue[] = [
      {
        id: 'cue_1',
        timestampMs: 0,
        durationMs: 4500,
        narration: 'Naive recursion recomputes the same subproblems repeatedly, exploding into exponential time.',
        actions: [
          { type: 'camera', panX: -260, panY: -220, zoom: 1.2, durationMs: 1000, triggerPhrase: 'exponential time' },
        ],
      },
      {
        id: 'cue_2',
        timestampMs: 4500,
        durationMs: 5500,
        narration: 'Notice the recursion tree: when evaluating fib(2), the answer is already cached in our memo table, pruning an entire subtree!',
        actions: [
          { type: 'camera', panX: -880, panY: -350, zoom: 1.25, durationMs: 1000, triggerPhrase: 'cached in our memo table' },
          { type: 'tree_graph:mark_node', targetId: 'tree_dp_dag', nodeId: 'f2_a', state: 'target', triggerPhrase: 'pruning an entire subtree' },
        ],
      },
      {
        id: 'cue_3',
        timestampMs: 10000,
        durationMs: 5000,
        narration: 'Line 3 returns the stored result instantly, updating our variable watch without redundant recursive calls.',
        actions: [
          { type: 'camera', panX: -1620, panY: -340, zoom: 1.2, durationMs: 1000, triggerPhrase: 'Line 3 returns' },
          { type: 'code_trace:set_line', targetId: 'code_dp_memo', activeLine: 3, variableWatch: { n: 2, 'memo[2]': 1 }, triggerPhrase: 'stored result instantly' },
        ],
      },
      {
        id: 'cue_socratic',
        timestampMs: 15000,
        durationMs: 4500,
        narration: `Socratic Checkpoint: ${socraticQuestion}`,
        actions: [
          { type: 'camera', panX: -920, panY: -440, zoom: 0.85, durationMs: 1200, triggerPhrase: 'Socratic Checkpoint' },
        ],
      },
      {
        id: 'cue_finale_zoomout',
        timestampMs: 19500,
        durationMs: 2500,
        narration: 'Memoization transforms an exponential recursion tree into a linear directed acyclic graph.',
        actions: [
          { type: 'camera', panX: -950, panY: -460, zoom: 0.68, durationMs: 2500, triggerPhrase: 'linear directed acyclic graph' },
        ],
      },
    ];

    return { entities: [nodeA, treeB, stackB, codeC, eqD], cues };
  }

  /* -------------------------------------------------------------------------- */
  /*                      ARCHETYPE 9: SORTING (QUICKSORT)                      */
  /* -------------------------------------------------------------------------- */
  private static buildSortingArchetype(title: string, socraticQuestion: string): ArchetypeSynthesisResult {
    const nodeA: InvestigationNodePrimitive = {
      id: 'node_bottleneck',
      type: 'investigation_node',
      title: 'Partition Invariant',
      subtitle: 'Pivot divides elements into smaller and larger subarrays',
      categoryBadge: 'Divide & Conquer',
      metricLabel: 'Comparisons',
      metricValue: 'O(n log n)',
      accentColor: '#38BDF8',
      position: { x: 260, y: 220 },
      width: 260,
      height: 140,
    };

    const arrayB: ArrayPrimitive = {
      id: 'arr_quicksort',
      type: 'array',
      title: 'Partition Stage: Pivot = 10',
      elements: [
        { value: 3, state: 'sorted' },
        { value: 9, state: 'sorted' },
        { value: 10, state: 'active' },
        { value: 43, state: 'comparing' },
        { value: 27, state: 'comparing' },
        { value: 38, state: 'comparing' },
      ],
      pointers: [
        { id: 'ptr_pivot', name: 'pivot', targetIndex: 2, color: '#10B981', position: 'top' },
      ],
      swapIndices: [1, 2],
      position: { x: 880, y: 260 },
    };

    const codeC: CodeTracePrimitive = {
      id: 'code_quicksort',
      type: 'code_trace',
      title: 'quicksort.py',
      language: 'python',
      codeLines: [
        'def partition(arr, low, high):',
        '    pivot = arr[high]',
        '    i = low - 1',
        '    for j in range(low, high):',
        '        if arr[j] <= pivot:',
        '            i += 1',
        '            arr[i], arr[j] = arr[j], arr[i]',
        '    arr[i + 1], arr[high] = arr[high], arr[i + 1]',
        '    return i + 1',
      ],
      activeLine: 7,
      highlightedLines: [6, 7],
      variableWatch: { pivot: 10, i: 1, j: 2, 'swapped': 'true' },
      complexityBadge: { time: 'O(n log n)', space: 'O(log n)' },
      position: { x: 1620, y: 340 },
    };

    const eqD: MathEquationPrimitive = {
      id: 'eq_complexity',
      type: 'equation',
      latex: 'T(n) = 2T(n/2) + \\mathcal{O}(n) \\implies \\mathcal{O}(n \\log n)',
      explanation: 'Balanced partitioning guarantees optimal comparison-based sorting',
      position: { x: 880, y: 840 },
    };

    const cues: TimelineCue[] = [
      {
        id: 'cue_1',
        timestampMs: 0,
        durationMs: 4500,
        narration: 'Comparison sorting cannot beat n log n in the worst case. Divide and conquer partitions elements around a pivot.',
        actions: [
          { type: 'camera', panX: -260, panY: -220, zoom: 1.2, durationMs: 1000, triggerPhrase: 'Comparison sorting' },
        ],
      },
      {
        id: 'cue_2',
        timestampMs: 4500,
        durationMs: 5500,
        narration: 'Watch our array partition stage: elements smaller than pivot 10 are swapped to the left side.',
        actions: [
          { type: 'camera', panX: -880, panY: -260, zoom: 1.25, durationMs: 1000, triggerPhrase: 'array partition stage' },
          { type: 'array:mark_state', targetId: 'arr_quicksort', indices: [0, 1], state: 'sorted', triggerPhrase: 'swapped to the left' },
        ],
      },
      {
        id: 'cue_3',
        timestampMs: 10000,
        durationMs: 5000,
        narration: 'Line 7 swaps elements in-place, while the variable watch confirms the updated boundary pointer.',
        actions: [
          { type: 'camera', panX: -1620, panY: -340, zoom: 1.2, durationMs: 1000, triggerPhrase: 'Line 7 swaps elements' },
          { type: 'code_trace:set_line', targetId: 'code_quicksort', activeLine: 7, variableWatch: { i: 1, j: 2 }, triggerPhrase: 'boundary pointer' },
        ],
      },
      {
        id: 'cue_socratic',
        timestampMs: 15000,
        durationMs: 4500,
        narration: `Socratic Checkpoint: ${socraticQuestion}`,
        actions: [
          { type: 'camera', panX: -920, panY: -440, zoom: 0.85, durationMs: 1200, triggerPhrase: 'Socratic Checkpoint' },
        ],
      },
      {
        id: 'cue_finale_zoomout',
        timestampMs: 19500,
        durationMs: 2500,
        narration: 'Recursive subproblems partition independently to achieve O(n log n) average runtime.',
        actions: [
          { type: 'camera', panX: -950, panY: -460, zoom: 0.68, durationMs: 2500, triggerPhrase: 'average runtime' },
        ],
      },
    ];

    return { entities: [nodeA, arrayB, codeC, eqD], cues };
  }

  /* -------------------------------------------------------------------------- */
  /*                      ARCHETYPE 10: SYSTEM DESIGN                           */
  /* -------------------------------------------------------------------------- */
  private static buildSystemDesignArchetype(title: string, socraticQuestion: string): ArchetypeSynthesisResult {
    const nodeA: InvestigationNodePrimitive = {
      id: 'node_bottleneck',
      type: 'investigation_node',
      title: 'Decentralized Scaling Bottleneck',
      subtitle: 'Single point of failure vs distributed replica consensus',
      categoryBadge: 'System Architecture',
      metricLabel: 'Availability',
      metricValue: '99.999% SLA',
      accentColor: '#10B981',
      position: { x: 260, y: 220 },
      width: 260,
      height: 140,
    };

    const graphB: TreeGraphPrimitive = {
      id: 'system_topology',
      type: 'tree_graph',
      title: 'Distributed System Topology',
      variant: 'directed_graph',
      nodes: [
        { id: 'client', label: 'Client Apps', state: 'visited' },
        { id: 'lb', label: 'Load Balancer', state: 'visiting' },
        { id: 'srv1', label: 'Server 1', state: 'default' },
        { id: 'srv2', label: 'Server 2', state: 'default' },
        { id: 'cache', label: 'Redis Cache', state: 'target', color: '#10B981' },
      ],
      edges: [
        { from: 'client', to: 'lb', directed: true, state: 'active' },
        { from: 'lb', to: 'srv1', directed: true },
        { from: 'lb', to: 'srv2', directed: true },
        { from: 'srv1', to: 'cache', directed: true },
        { from: 'srv2', to: 'cache', directed: true },
      ],
      activePointer: { nodeId: 'lb', label: 'Layer 7 Gateway', color: '#38BDF8' },
      position: { x: 880, y: 240 },
    };

    const stackB: StackHashMapPrimitive = {
      id: 'rate_limit_bucket',
      type: 'stack_hashmap',
      title: 'Token Bucket In-Memory Cache',
      variant: 'hashmap',
      entries: [
        { key: 'ip_192.168.1.1', value: 'tokens: 9', state: 'lookup_hit' },
        { key: 'ip_10.0.0.4', value: 'tokens: 0 (Throttled)', state: 'pushed' },
      ],
      position: { x: 880, y: 460 },
    };

    const codeC: CodeTracePrimitive = {
      id: 'code_rate_limiter',
      type: 'code_trace',
      title: 'token_bucket.py',
      language: 'python',
      codeLines: [
        'def allow_request(client_id, capacity=10, fill_rate=1):',
        '    now = time.time()',
        '    bucket = cache.get(client_id) or {"tokens": capacity, "last": now}',
        '    tokens += (now - bucket["last"]) * fill_rate',
        '    if tokens >= 1:',
        '        cache.set(client_id, {"tokens": tokens - 1, "last": now})',
        '        return True',
        '    return False',
      ],
      activeLine: 5,
      highlightedLines: [4, 5, 6],
      variableWatch: { client_id: '192.168.1.1', tokens: 9, allowed: 'true' },
      complexityBadge: { time: 'O(1) Redis', space: 'O(Clients)' },
      position: { x: 1620, y: 340 },
    };

    const eqD: MathEquationPrimitive = {
      id: 'eq_complexity',
      type: 'equation',
      latex: '\\text{Availability} \\ge 99.999\\%, \\quad \\mathcal{O}(1) \\text{ Atomic Token Check}',
      explanation: 'Distributed caching prevents cascading backend overload',
      position: { x: 880, y: 840 },
    };

    const cues: TimelineCue[] = [
      {
        id: 'cue_1',
        timestampMs: 0,
        durationMs: 4500,
        narration: 'Without rate limiting, sudden traffic spikes cascade into database lockups and system outages.',
        actions: [
          { type: 'camera', panX: -260, panY: -220, zoom: 1.2, durationMs: 1000, triggerPhrase: 'system outages' },
        ],
      },
      {
        id: 'cue_2',
        timestampMs: 4500,
        durationMs: 5500,
        narration: 'Observe our topology: requests arrive at the load balancer, which queries our in-memory token bucket cache.',
        actions: [
          { type: 'camera', panX: -880, panY: -350, zoom: 1.25, durationMs: 1000, triggerPhrase: 'token bucket cache' },
          { type: 'tree_graph:set_pointer', targetId: 'system_topology', nodeId: 'lb', label: 'Traffic Router', triggerPhrase: 'load balancer' },
        ],
      },
      {
        id: 'cue_3',
        timestampMs: 10000,
        durationMs: 5000,
        narration: 'Line 5 validates that remaining tokens exceed 1, allowing the request in constant O(1) time.',
        actions: [
          { type: 'camera', panX: -1620, panY: -340, zoom: 1.2, durationMs: 1000, triggerPhrase: 'Line 5 validates' },
          { type: 'code_trace:set_line', targetId: 'code_rate_limiter', activeLine: 6, variableWatch: { tokens: 9, allowed: 'true' }, triggerPhrase: 'constant O(1) time' },
        ],
      },
      {
        id: 'cue_socratic',
        timestampMs: 15000,
        durationMs: 4500,
        narration: `Socratic Checkpoint: ${socraticQuestion}`,
        actions: [
          { type: 'camera', panX: -920, panY: -440, zoom: 0.85, durationMs: 1200, triggerPhrase: 'Socratic Checkpoint' },
        ],
      },
      {
        id: 'cue_finale_zoomout',
        timestampMs: 19500,
        durationMs: 2500,
        narration: 'Decentralized caching guarantees five-nines availability under extreme concurrent load.',
        actions: [
          { type: 'camera', panX: -950, panY: -460, zoom: 0.68, durationMs: 2500, triggerPhrase: 'five-nines availability' },
        ],
      },
    ];

    return { entities: [nodeA, graphB, stackB, codeC, eqD], cues };
  }

  /* -------------------------------------------------------------------------- */
  /*                      ARCHETYPE 11: CALCULUS & MATH                         */
  /* -------------------------------------------------------------------------- */
  private static buildCalculusMathArchetype(title: string, socraticQuestion: string): ArchetypeSynthesisResult {
    const nodeA: InvestigationNodePrimitive = {
      id: 'node_bottleneck',
      type: 'investigation_node',
      title: 'Average vs Instantaneous Rate',
      subtitle: 'Ratio of finite changes Δy / Δx collapsing to zero',
      categoryBadge: 'Geometric Invariant',
      metricLabel: 'Secant Slope m',
      metricValue: 'Δy / Δx',
      accentColor: '#F59E0B',
      position: { x: 260, y: 220 },
      width: 260,
      height: 140,
    };

    const graphB: CoordinateGraphPrimitive = {
      id: 'graph_calculus_curve',
      type: 'graph',
      title: 'Parabola f(x) = 0.25x²',
      fnLatex: '0.25 * x^2',
      rangeX: [-1, 6],
      rangeY: [-1, 7],
      tangentAtX: 2.0,
      secantBetween: [2.0, 3.5],
      position: { x: 880, y: 260 },
    };

    const eqD: MathEquationPrimitive = {
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
      position: { x: 880, y: 840 },
    };

    const codeC: CodeTracePrimitive = {
      id: 'code_diff',
      type: 'code_trace',
      title: 'numerical_derivative.py',
      language: 'python',
      codeLines: [
        'def derivative(f, x, dx=1e-5):',
        '    df = f(x + dx) - f(x)',
        '    slope = df / dx',
        '    return slope',
        '# Instantaneous slope at x=2:',
        '# slope = 1.0',
      ],
      activeLine: 3,
      highlightedLines: [2, 3],
      variableWatch: { x: 2.0, dx: 0.0001, slope: 1.0 },
      complexityBadge: { time: 'O(1)', space: 'O(1)' },
      position: { x: 1620, y: 340 },
    };

    const cues: TimelineCue[] = [
      {
        id: 'cue_1',
        timestampMs: 0,
        durationMs: 4500,
        narration: 'Average rate of change connects two distinct points with a secant slope. But what happens at a single instant?',
        actions: [
          { type: 'camera', panX: -260, panY: -220, zoom: 1.2, durationMs: 1000, triggerPhrase: 'secant slope' },
        ],
      },
      {
        id: 'cue_2',
        timestampMs: 4500,
        durationMs: 5500,
        narration: 'Observe our interactive graph as delta x shrinks toward zero. The secant chord smoothly rotates into an instantaneous tangent slope.',
        actions: [
          { type: 'camera', panX: -880, panY: -260, zoom: 1.25, durationMs: 1000, triggerPhrase: 'interactive graph' },
          { type: 'graph:set_tangent', targetId: 'graph_calculus_curve', tangentAtX: 2.0, triggerPhrase: 'instantaneous tangent slope' },
        ],
      },
      {
        id: 'cue_3',
        timestampMs: 10000,
        durationMs: 5000,
        narration: 'Notice the color-locked formula below: the limit of the difference quotient converges to the exact derivative value.',
        actions: [
          { type: 'camera', panX: -880, panY: -840, zoom: 1.2, durationMs: 1000, triggerPhrase: 'color-locked formula' },
        ],
      },
      {
        id: 'cue_socratic',
        timestampMs: 15000,
        durationMs: 4500,
        narration: `Socratic Checkpoint: ${socraticQuestion}`,
        actions: [
          { type: 'camera', panX: -920, panY: -440, zoom: 0.85, durationMs: 1200, triggerPhrase: 'Socratic Checkpoint' },
        ],
      },
      {
        id: 'cue_finale_zoomout',
        timestampMs: 19500,
        durationMs: 2500,
        narration: 'Taking the limit yields exact instantaneous rate of change without dividing by zero.',
        actions: [
          { type: 'camera', panX: -950, panY: -460, zoom: 0.68, durationMs: 2500, triggerPhrase: 'without dividing by zero' },
        ],
      },
    ];

    return { entities: [nodeA, graphB, codeC, eqD], cues };
  }

  /**
   * Merges custom lesson steps (e.g. from LLM or API) while preserving
   * camera choreography and word-synchronized actions.
   */
  private static mergeCustomLessonSteps(
    steps: any[],
    defaultCues: TimelineCue[],
    entities: VisualPrimitive[]
  ): TimelineCue[] {
    const speakSteps = steps.filter(s => s.type === 'speak' && s.text?.trim().length > 0);
    if (speakSteps.length === 0) return defaultCues;

    let timeAccumulatorMs = 0;
    const cuesResult: TimelineCue[] = speakSteps.map((s, idx) => {
      const durationMs = 5000;
      const cueTimeMs = timeAccumulatorMs;
      timeAccumulatorMs += durationMs;

      // Borrow actions from corresponding default cue beat if available
      const fallbackCue = defaultCues[idx % defaultCues.length];
      const actions: KineticAction[] = fallbackCue ? fallbackCue.actions.map(a => ({ ...a })) : [];

      return {
        id: `cue_${idx}`,
        timestampMs: cueTimeMs,
        durationMs,
        narration: s.text,
        actions,
      };
    });

    const askStep = steps.find(s => s.type === 'ask');
    if (askStep) {
      cuesResult.push({
        id: 'cue_socratic',
        timestampMs: timeAccumulatorMs,
        durationMs: 4500,
        narration: `Socratic Checkpoint: ${askStep.question}`,
        actions: [
          {
            type: 'camera',
            panX: -920,
            panY: -440,
            zoom: 0.85,
            durationMs: 1200,
            triggerPhrase: 'Socratic Checkpoint',
          },
        ],
      });
      timeAccumulatorMs += 4500;
    }

    cuesResult.push({
      id: 'cue_finale_zoomout',
      timestampMs: timeAccumulatorMs,
      durationMs: 2500,
      narration: 'Observe the complete unified system: mathematical halving invariant, live memory board, and synchronized execution trace.',
      actions: [
        {
          type: 'camera',
          panX: -950,
          panY: -460,
          zoom: 0.68,
          durationMs: 2500,
          easing: 'cinema',
          triggerPhrase: 'complete unified system',
        },
      ],
    });

    return cuesResult;
  }
}
