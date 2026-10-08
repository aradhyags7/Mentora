import { describe, it, expect } from 'vitest';
import { slugifyConcept, inferConceptDomain } from '../../src/lib/utils/conceptUtils';

describe('Concept Utilities', () => {
  it('slugifies concept queries properly', () => {
    expect(slugifyConcept('Teach me Binary Search visually')).toBe('binary_search_visually');
    expect(slugifyConcept('Explain Euler\'s Identity')).toBe('euler_s_identity');
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
});
