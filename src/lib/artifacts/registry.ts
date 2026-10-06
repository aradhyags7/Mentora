/**
 * MENTORA ARTIFACT REGISTRY
 * 
 * Reusable registry of semantic educational artifacts and reference lessons.
 * Provides lesson outlines, active variable definitions, and timelines.
 */

import { KineticTimeline } from '../../types/kinetic';
import fixtureBinarySearch from '../../../fixtures/binary-search.timeline.json';
import fixtureDerivative from '../../../fixtures/derivative-calculus.timeline.json';
import { validateAndCompileTimeline } from '../engine/validator';

export interface LessonVariable {
  name: string;
  value: string | number;
  description: string;
  badge?: string;
}

export interface LessonOutlineItem {
  id: string;
  title: string;
  timestampMs: number;
  summary: string;
}

export interface RegisteredArtifact {
  id: string;
  semanticKey: string;
  title: string;
  domain: 'Algorithms' | 'Calculus' | 'Physics' | 'Systems' | 'Chemistry';
  timeline: KineticTimeline;
  outline: LessonOutlineItem[];
  variables: LessonVariable[];
  suggestedPrompts: string[];
}

class ArtifactRegistryClass {
  private artifacts: Map<string, RegisteredArtifact> = new Map();

  register(artifact: RegisteredArtifact) {
    this.artifacts.set(artifact.semanticKey, artifact);
  }

  get(semanticKey: string): RegisteredArtifact | undefined {
    return this.artifacts.get(semanticKey);
  }

  getAll(): RegisteredArtifact[] {
    return Array.from(this.artifacts.values());
  }

  findByQuery(query: string): RegisteredArtifact | undefined {
    const q = query.toLowerCase();
    for (const art of this.artifacts.values()) {
      if (
        art.title.toLowerCase().includes(q) ||
        art.semanticKey.toLowerCase().includes(q) ||
        art.domain.toLowerCase().includes(q)
      ) {
        return art;
      }
    }
    return undefined;
  }
}

export const ArtifactRegistry = new ArtifactRegistryClass();

// 1. Binary Search
ArtifactRegistry.register({
  id: 'art_binary_search',
  semanticKey: 'cs.binary_search',
  title: 'Binary Search Algorithm',
  domain: 'Algorithms',
  timeline: validateAndCompileTimeline(fixtureBinarySearch as unknown as KineticTimeline),
  outline: [
    { id: '1', title: 'Initialize Search Space', timestampMs: 0, summary: 'Pointers low (0) and high (9) enclose the sorted array' },
    { id: '2', title: 'Calculate Pivot Element', timestampMs: 5000, summary: 'mid = floor((0 + 9) / 2) = 4, value = 16' },
    { id: '3', title: 'Eliminate Subarray', timestampMs: 11000, summary: '16 < 23: Discard indices 0 through 4' },
    { id: '4', title: 'Halve Active Range', timestampMs: 17500, summary: 'Advance low pointer to mid + 1 = 5' },
    { id: '5', title: 'Second Pivot Check', timestampMs: 24000, summary: 'mid = 7 (56) > 23: Discard right partition' },
    { id: '6', title: 'Target Located in O(log n)', timestampMs: 29500, summary: 'mid = 5 contains 23! Solved in 3 checks' },
  ],
  variables: [
    { name: 'low', value: 0, description: 'Left boundary pointer' },
    { name: 'high', value: 9, description: 'Right boundary pointer' },
    { name: 'mid', value: 4, description: 'Calculated midpoint pivot' },
    { name: 'target', value: 23, description: 'Value being hunted' },
    { name: 'search_space', value: '10 elements', description: 'Active candidate elements' },
    { name: 'complexity', value: 'O(log n)', description: 'Logarithmic time invariant', badge: 'Optimal' },
  ],
  suggestedPrompts: [
    'Why does binary search require a sorted array?',
    'What happens if the target element is missing?',
    'Show me the edge case where low equals high.',
  ],
});

// 2. Calculus: Derivatives
ArtifactRegistry.register({
  id: 'art_derivatives',
  semanticKey: 'math.derivative',
  title: 'Essence of Calculus: Instantaneous Rate of Change',
  domain: 'Calculus',
  timeline: validateAndCompileTimeline(fixtureDerivative as unknown as KineticTimeline),
  outline: [
    { id: '1', title: 'Geometric Intuition', timestampMs: 0, summary: 'Speedometer analogy on continuous curves' },
    { id: '2', title: 'Secant Line Between Two Points', timestampMs: 5000, summary: 'Average slope = Δy / Δx' },
    { id: '3', title: 'The Shrinking Limit (Δx → 0)', timestampMs: 11500, summary: 'Secant approaches tangent line at x = 2' },
    { id: '4', title: 'Exact Instantaneous Slope', timestampMs: 19000, summary: "f'(2) = 2.0: Instantaneous derivative verified" },
  ],
  variables: [
    { name: 'f(x)', value: '0.5x² - 2', description: 'Primary continuous function' },
    { name: 'x₀', value: '2.0', description: 'Point of tangency' },
    { name: 'f(x₀)', value: '0.0', description: 'Function value at tangent point' },
    { name: "f'(x₀)", value: '2.0', description: 'Instantaneous slope', badge: 'Tangent' },
    { name: 'Δx', value: '0.001', description: 'Limit infinitesimal increment' },
  ],
  suggestedPrompts: [
    'How does this relate to the power rule?',
    'What is the slope where the curve hits its minimum?',
    'Explain the difference between secant and tangent lines.',
  ],
});
