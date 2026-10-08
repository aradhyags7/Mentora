/**
 * MENTORA CONCEPT UTILITIES
 * 
 * Helper functions to slugify concepts, infer educational domains,
 * and format dynamic lesson metadata on-the-fly.
 */

export function slugifyConcept(prompt: string): string {
  return prompt
    .toLowerCase()
    .trim()
    .replace(/^(explain|teach me|what is|how does|show me)\s+/i, '')
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 32)
    .replace(/^_+|_+$/g, '') || 'interactive_concept';
}

export function inferConceptDomain(prompt: string): 'Calculus' | 'Algorithms' | 'Physics' | 'Machine Learning' | 'General' {
  const lower = prompt.toLowerCase();
  if (lower.includes('derivative') || lower.includes('calculus') || lower.includes('integral') || lower.includes('limit')) {
    return 'Calculus';
  }
  if (lower.includes('search') || lower.includes('sort') || lower.includes('tree') || lower.includes('graph') || lower.includes('algorithm')) {
    return 'Algorithms';
  }
  if (lower.includes('neural') || lower.includes('gradient') || lower.includes('learning') || lower.includes('loss')) {
    return 'Machine Learning';
  }
  if (lower.includes('motion') || lower.includes('velocity') || lower.includes('gravity') || lower.includes('force')) {
    return 'Physics';
  }
  return 'General';
}
