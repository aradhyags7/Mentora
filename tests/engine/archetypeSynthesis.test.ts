import { describe, it, expect } from 'vitest';
import { TeachingDslCompiler } from '../../src/lib/dsl/dslCompiler';
import { TeachingDslLesson } from '../../src/types/teachingDsl';

describe('Universal Algorithmic Archetype Synthesis', () => {
  const archetypes = [
    { name: 'binary_search', prompt: 'Binary Search' },
    { name: 'two_pointers', prompt: 'Two Pointers 3Sum' },
    { name: 'sliding_window', prompt: 'Sliding Window Maximum' },
    { name: 'hashmap', prompt: 'Two Sum with HashMap' },
    { name: 'linked_list', prompt: 'Reverse a Linked List' },
    { name: 'tree_graph', prompt: 'Binary Tree DFS' },
    { name: 'stack_queue', prompt: 'Valid Parentheses Stack' },
    { name: 'dynamic_programming', prompt: 'Dynamic Programming Coin Change' },
    { name: 'sorting', prompt: 'QuickSort Partitioning' },
    { name: 'system_design', prompt: 'System Design Rate Limiter' },
    { name: 'calculus_math', prompt: 'Derivatives from First Principles' },
  ];

  archetypes.forEach(({ name, prompt }) => {
    it(`synthesizes a valid, non-overlapping 4-zone timeline for ${name}`, () => {
      const lesson: TeachingDslLesson = {
        lesson_id: `test_${name}`,
        mode: 'visual',
        objective: prompt,
        action: 'VISUALIZE',
        timeline: [
          { t: 0, type: 'speak', text: `Learning ${prompt}` },
        ],
        meta: { concept: prompt },
      };

      const timeline = TeachingDslCompiler.compileToTimeline(lesson);

      // 1. Basic Timeline Contract
      expect(timeline.id).toBeDefined();
      expect(timeline.title).toBeDefined();
      expect(timeline.title).not.toBe('Visual Concept');
      expect(timeline.concept).toBeDefined();
      expect(timeline.totalDurationMs).toBeGreaterThan(10000);
      expect(timeline.initialEntities.length).toBeGreaterThanOrEqual(3);
      expect(timeline.cues.length).toBeGreaterThanOrEqual(4);

      // 2. Spatial Zone Validation (Zero Overlap Check)
      const entitiesWithPos = timeline.initialEntities.filter(e => 'position' in e && e.position);
      expect(entitiesWithPos.length).toBeGreaterThanOrEqual(3);

      for (let i = 0; i < entitiesWithPos.length; i++) {
        for (let j = i + 1; j < entitiesWithPos.length; j++) {
          const e1 = entitiesWithPos[i] as any;
          const e2 = entitiesWithPos[j] as any;
          if (e1.position && e2.position) {
            // Either distinct X positions (> 200px apart) or distinct Y positions (> 120px apart)
            const dx = Math.abs(e1.position.x - e2.position.x);
            const dy = Math.abs(e1.position.y - e2.position.y);
            const isDistinct = dx >= 200 || dy >= 120;
            expect(isDistinct).toBe(true);
          }
        }
      }

      // 3. Word-Level triggerPhrase Verification
      // Every action with a triggerPhrase must appear verbatim in that cue's narration
      timeline.cues.forEach(cue => {
        const textLower = cue.narration.toLowerCase();
        cue.actions.forEach(action => {
          const act = action as any;
          if (act.triggerPhrase) {
            const phraseLower = act.triggerPhrase.toLowerCase();
            const appearsInNarration = textLower.includes(phraseLower);
            expect(appearsInNarration).toBe(true);
            // Trigger offset was computed by alignTimelineTriggersWithNarration
            expect(act.triggerOffsetMs).toBeDefined();
            expect(act.triggerOffsetMs).toBeGreaterThanOrEqual(0);
          }
        });
      });

      // 4. Pedagogical Beats Coverage
      // Must include Socratic Checkpoint cue and Finale Zoom-Out cue
      const socraticCue = timeline.cues.find(c => c.narration.includes('Socratic Checkpoint'));
      expect(socraticCue).toBeDefined();

      const finaleCue = timeline.cues[timeline.cues.length - 1];
      expect(finaleCue).toBeDefined();
      expect(finaleCue.actions.some(a => a.type === 'camera' && (a as any).zoom < 1.0)).toBe(true);
    });
  });

  it('correctly handles specific DSA primitives for Binary Search', () => {
    const lesson: TeachingDslLesson = {
      lesson_id: 'test_bs_details',
      mode: 'visual',
      objective: 'Binary Search',
      action: 'VISUALIZE',
      timeline: [],
    };

    const timeline = TeachingDslCompiler.compileToTimeline(lesson);

    // Initial entities must include ArrayPrimitive and CodeTracePrimitive
    const arrayEntity = timeline.initialEntities.find(e => e.type === 'array') as any;
    expect(arrayEntity).toBeDefined();
    expect(arrayEntity.pointers.length).toBeGreaterThanOrEqual(3); // low, high, mid

    const codeEntity = timeline.initialEntities.find(e => e.type === 'code_trace') as any;
    expect(codeEntity).toBeDefined();
    expect(codeEntity.codeLines.length).toBeGreaterThanOrEqual(5);
    expect(codeEntity.complexityBadge.time).toBe('O(log n)');

    const equationEntity = timeline.initialEntities.find(e => e.type === 'equation') as any;
    expect(equationEntity).toBeDefined();
    expect(equationEntity.latex).toContain('\\log n');
  });

  it('correctly handles Linked List pointer capsules', () => {
    const lesson: TeachingDslLesson = {
      lesson_id: 'test_ll_details',
      mode: 'visual',
      objective: 'Reverse a Linked List in O(n)',
      action: 'VISUALIZE',
      timeline: [],
    };

    const timeline = TeachingDslCompiler.compileToTimeline(lesson);
    const listGraph = timeline.initialEntities.find(e => e.type === 'tree_graph') as any;
    expect(listGraph).toBeDefined();
    expect(listGraph.variant).toBe('linked_list');
    expect(listGraph.nodes.length).toBeGreaterThanOrEqual(3);
  });

  it('correctly handles HashMap lookup table and complement tracking', () => {
    const lesson: TeachingDslLesson = {
      lesson_id: 'test_hm_details',
      mode: 'visual',
      objective: 'Two Sum HashMap Lookup',
      action: 'VISUALIZE',
      timeline: [],
    };

    const timeline = TeachingDslCompiler.compileToTimeline(lesson);
    const mapEntity = timeline.initialEntities.find(e => e.type === 'stack_hashmap') as any;
    expect(mapEntity).toBeDefined();
    expect(mapEntity.variant).toBe('hashmap');
  });
});
