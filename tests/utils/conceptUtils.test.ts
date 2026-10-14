import { describe, it, expect } from 'vitest';
import { 
  slugifyConcept, 
  inferConceptDomain, 
  extractCleanConceptTitle 
} from '../../src/lib/utils/conceptUtils';

describe('Concept Utilities & Title Cleaning', () => {
  it('slugifies concept queries properly', () => {
    expect(slugifyConcept('Teach me Binary Search visually')).toBe('binary_search_visually');
    expect(slugifyConcept("Explain Euler's Identity")).toBe('euler_s_identity');
    expect(slugifyConcept('What is Gradient Descent?')).toBe('gradient_descent');
    expect(slugifyConcept('')).toBe('interactive_concept');
  });

  it('infers concept domains accurately', () => {
    expect(inferConceptDomain('Derivatives and Tangents')).toBe('Calculus');
    expect(inferConceptDomain('Binary Search Algorithm')).toBe('Algorithms');
    expect(inferConceptDomain('Gradient Descent and Neural Networks')).toBe('Machine Learning');
    expect(inferConceptDomain('Projectile Motion and Velocity')).toBe('Physics');
    expect(inferConceptDomain('Microeconomics')).toBe('General');
  });

  describe('extractCleanConceptTitle', () => {
    it('cleans messy user prompt for Derivatives', () => {
      const res = extractCleanConceptTitle('Teach me derivatives from first principles with an interactive tangent curve');
      expect(res.cleanTitle).toBe('Derivatives from First Principles');
      expect(res.archetype).toBe('calculus_math');
      expect(res.category).toBe('Calculus & Optimization');
      expect(res.socraticQuestion).toContain('division-by-zero error');
    });

    it('cleans messy prompt for Reverse Linked List in O(n)', () => {
      const res = extractCleanConceptTitle('how do i solve reverse a linked list in O(n)?');
      expect(res.cleanTitle).toBe('Reverse a Linked List');
      expect(res.archetype).toBe('linked_list');
      expect(res.category).toBe('Data Structures');
      expect(res.socraticQuestion).toContain('curr.next');
    });

    it('cleans messy prompt for Sliding Window', () => {
      const res = extractCleanConceptTitle('explain sliding window maximum step by step in python');
      expect(res.cleanTitle).toBe('Sliding Window Maximum');
      expect(res.archetype).toBe('sliding_window');
      expect(res.category).toBe('Advanced Algorithms');
      expect(res.socraticQuestion).toContain('left window boundary to contract');
    });

    it('cleans prompt for Two Sum / HashMap', () => {
      const res = extractCleanConceptTitle('can you show me two sum with hashmap lookup in python?');
      expect(res.cleanTitle).toBe('Two Sum (HashMap Lookup)');
      expect(res.archetype).toBe('hashmap');
      expect(res.socraticQuestion).toContain('space-time tradeoff');
    });

    it('cleans prompt for Binary Search', () => {
      const res = extractCleanConceptTitle('teach me binary search on rotated sorted array');
      expect(res.cleanTitle).toBe('Rotated Sorted Array Search');
      expect(res.archetype).toBe('binary_search');
      expect(res.socraticQuestion).toContain('midpoint comparison');
    });

    it('cleans prompt for Valid Parentheses (Stack)', () => {
      const res = extractCleanConceptTitle('how to solve valid parentheses using a stack?');
      expect(res.cleanTitle).toBe('Valid Parentheses (Stack)');
      expect(res.archetype).toBe('stack_queue');
      expect(res.socraticQuestion).toContain('popped from the container');
    });

    it('cleans prompt for Dynamic Programming', () => {
      const res = extractCleanConceptTitle('teach me coin change problem with dynamic programming');
      expect(res.cleanTitle).toBe('Coin Change (Dynamic Programming)');
      expect(res.archetype).toBe('dynamic_programming');
      expect(res.socraticQuestion).toContain('optimal substructure');
    });

    it('cleans prompt for Sorting', () => {
      const res = extractCleanConceptTitle('how does merge sort divide and conquer work?');
      expect(res.cleanTitle).toBe('Merge Sort (Divide & Conquer)');
      expect(res.archetype).toBe('sorting');
      expect(res.socraticQuestion).toContain('O(n log n)');
    });

    it('cleans prompt for System Design', () => {
      const res = extractCleanConceptTitle('how to design a rate limiter in system design?');
      expect(res.cleanTitle).toBe('System Design: Rate Limiter');
      expect(res.archetype).toBe('system_design');
      expect(res.socraticQuestion).toContain('traffic spikes');
    });

    it('handles empty string or Visual Concept fallback cleanly', () => {
      const res1 = extractCleanConceptTitle('');
      expect(res1.cleanTitle).not.toBe('');
      expect(res1.cleanTitle).not.toBe('Visual Concept');

      const res2 = extractCleanConceptTitle('Visual Concept');
      expect(res2.cleanTitle).toBe('First Principles Concept');
      expect(res2.archetype).toBe('binary_search');
    });

    it('never produces titles exceeding 6 words', () => {
      const longPrompt = 'explain how to implement an advanced highly distributed cache with multi-tier evictions';
      const res = extractCleanConceptTitle(longPrompt);
      const wordCount = res.cleanTitle.split(/\s+/).length;
      expect(wordCount).toBeLessThanOrEqual(6);
    });
  });
});
