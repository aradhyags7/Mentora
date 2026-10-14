/**
 * MENTORA CONCEPT UTILITIES (Phase 3 Core Evolution)
 * 
 * Extracts clean, human-readable concept titles, detects algorithmic
 * archetypes, and synthesizes natural Socratic checkpoint questions.
 */

export type AlgorithmicArchetype = 
  | 'binary_search' 
  | 'two_pointers' 
  | 'sliding_window' 
  | 'linked_list' 
  | 'tree_graph' 
  | 'stack_queue' 
  | 'hashmap' 
  | 'dynamic_programming' 
  | 'sorting' 
  | 'calculus_math' 
  | 'system_design';

export interface CleanConceptResult {
  cleanTitle: string;
  category: string;
  archetype: AlgorithmicArchetype;
  socraticQuestion: string;
}

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
  if (lower.includes('search') || lower.includes('sort') || lower.includes('tree') || lower.includes('graph') || lower.includes('algorithm') || lower.includes('list') || lower.includes('array')) {
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

/**
 * Strips conversational fluff and formats clean Title-Casing
 */
function toTitleCase(str: string): string {
  const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'in', 'of', 'vs']);
  return str
    .split(/\s+/)
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx > 0 && minorWords.has(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Extracts a concise, beautifully formatted concept title and detects
 * the algorithmic archetype with a custom Socratic checkpoint question.
 */
export function extractCleanConceptTitle(rawPrompt: string): CleanConceptResult {
  if (!rawPrompt || rawPrompt.trim().length === 0 || rawPrompt.toLowerCase() === 'visual concept') {
    return {
      cleanTitle: 'First Principles Concept',
      category: 'Data Structures & Algorithms',
      archetype: 'binary_search',
      socraticQuestion: 'What invariant guarantees that our optimal strategy makes monotonic progress?',
    };
  }

  let text = rawPrompt.trim();

  // Strip enclosing quotes if present
  text = text.replace(/^["'`](.+)["'`]$/, '$1').trim();

  // 1. Strip conversational leading prefixes repeatedly
  let prevText = '';
  while (prevText !== text) {
    prevText = text;
    text = text.replace(
      /^(teach me (about|how to)?|explain (to me)?|how (do i|can i|to) (solve|implement|code|do|master)?|can you (show|teach|explain|tell) me|show me|what is|why is|help me understand|walk me through|visualize|guide me through|give me|learn|i want to understand|i want to learn|tell me about)\s+/i,
      ''
    ).trim();
  }

  // 2. Strip conversational trailing suffixes repeatedly
  prevText = '';
  while (prevText !== text) {
    prevText = text;
    text = text.replace(
      /\s+(from first principles|with an interactive.*|step by step|visually|in (python|c\+\+|javascript|typescript|java|rust|go)|using (python|two pointers|hashmap|recursion|a stack|a queue)|in o\([^)]*\)|with diagrams?|please|[?!.]+)+$/i,
      ''
    ).trim();
  }

  // Strip trailing punctuation
  text = text.replace(/[?!.]+$/, '').trim();

  const lower = text.toLowerCase();

  // 3. Archetype Detection & Socratic Question Selection
  let archetype: AlgorithmicArchetype = 'binary_search';
  let category = 'Data Structures & Algorithms';
  let socraticQuestion = 'What invariant guarantees that our optimal strategy makes monotonic progress?';
  let canonicalName = '';

  if (lower.includes('binary search') || lower.includes('bisect') || lower.includes('halv') || lower.includes('rotated sorted')) {
    archetype = 'binary_search';
    category = 'Data Structures & Algorithms';
    canonicalName = lower.includes('rotated') ? 'Rotated Sorted Array Search' : 'Binary Search (O(log n))';
    socraticQuestion = 'Why does sorted order allow us to eliminate half the search space with a single midpoint comparison?';
  } else if (lower.includes('sliding window') || lower.includes('longest substring') || lower.includes('min window')) {
    archetype = 'sliding_window';
    category = 'Advanced Algorithms';
    canonicalName = lower.includes('longest') ? 'Longest Substring Window' : 'Sliding Window Maximum';
    socraticQuestion = 'What exact condition triggers the left window boundary to contract while expanding the right pointer?';
  } else if (lower.includes('two pointer') || lower.includes('2 pointer') || (lower.includes('3sum') && !lower.includes('hash'))) {
    archetype = 'two_pointers';
    category = 'Algorithm Design';
    canonicalName = lower.includes('3sum') ? '3Sum (Two Pointers)' : 'Two Pointers Technique';
    socraticQuestion = 'How do the two converging pointers guarantee we never bypass a valid pair while maintaining O(n) time?';
  } else if (lower.includes('two sum') || lower.includes('2sum') || lower.includes('hash') || lower.includes('dict') || lower.includes('map') || lower.includes('frequency') || lower.includes('anagram')) {
    archetype = 'hashmap';
    category = 'Algorithm Design';
    canonicalName = (lower.includes('two sum') || lower.includes('2sum')) ? 'Two Sum (HashMap Lookup)' : 'HashMap Invariant & Lookup';
    socraticQuestion = 'What is the space-time tradeoff of trading O(n) auxiliary memory for instantaneous O(1) complement lookups?';
  } else if ((lower.includes('reverse') && lower.includes('linked list')) || lower.includes('linked list') || lower.includes('linkedlist') || lower.includes('cycle')) {
    archetype = 'linked_list';
    category = 'Data Structures';
    canonicalName = lower.includes('reverse') ? 'Reverse a Linked List' : lower.includes('cycle') ? 'Linked List Cycle Detection' : 'Linked List Operations';
    socraticQuestion = 'Why is storing a temporary next reference crucial before overwriting curr.next during list reversal?';
  } else if (lower.includes('tree') || lower.includes('dfs') || lower.includes('bfs') || lower.includes('graph') || lower.includes('recursion')) {
    archetype = 'tree_graph';
    category = 'Data Structures';
    canonicalName = lower.includes('dfs') ? 'Binary Tree DFS Traversal' : lower.includes('bfs') ? 'Binary Tree BFS Traversal' : 'Binary Tree & Recursion';
    socraticQuestion = 'What is the difference in call stack memory between traversing a balanced tree versus a completely degenerate branch?';
  } else if (lower.includes('stack') || lower.includes('queue') || lower.includes('parenthes') || lower.includes('monotonic')) {
    archetype = 'stack_queue';
    category = 'Data Structures';
    canonicalName = lower.includes('parenthes') ? 'Valid Parentheses (Stack)' : 'Monotonic Stack';
    socraticQuestion = 'What invariant governs when an element is popped from the container versus pushed into the active frame?';
  } else if (lower.includes('dp') || lower.includes('dynamic programming') || lower.includes('knapsack') || lower.includes('coin change')) {
    archetype = 'dynamic_programming';
    category = 'Algorithm Design';
    canonicalName = lower.includes('coin change') ? 'Coin Change (Dynamic Programming)' : 'Dynamic Programming & Memoization';
    socraticQuestion = 'How does the optimal substructure of smaller subproblems prevent redundant exponential recomputation?';
  } else if (lower.includes('sort') || lower.includes('quicksort') || lower.includes('merge sort')) {
    archetype = 'sorting';
    category = 'Algorithms';
    canonicalName = lower.includes('merge') ? 'Merge Sort (Divide & Conquer)' : 'QuickSort Partitioning';
    socraticQuestion = 'Why can comparison-based sorting algorithms never achieve a time complexity faster than O(n log n) in the worst case?';
  } else if (lower.includes('system design') || lower.includes('rate limiter') || lower.includes('load balancer') || lower.includes('cache') || lower.includes('sharding')) {
    archetype = 'system_design';
    category = 'System Design';
    canonicalName = lower.includes('rate limiter') ? 'System Design: Rate Limiter' : 'System Design: Architecture';
    socraticQuestion = 'How does your design handle sudden traffic spikes and node failures without degrading availability across replicas?';
  } else if (lower.includes('deriv') || lower.includes('calculus') || lower.includes('tangent') || lower.includes('integral') || lower.includes('gradient')) {
    archetype = 'calculus_math';
    category = 'Calculus & Optimization';
    canonicalName = lower.includes('gradient') ? 'Gradient Descent & Loss Valleys' : 'Derivatives from First Principles';
    socraticQuestion = 'Why does taking the limit as the interval collapses to zero avoid a division-by-zero error in the slope ratio?';
  }

  // 4. Clean up title words if no canonical match
  let cleanTitle = canonicalName;
  if (!cleanTitle) {
    cleanTitle = toTitleCase(text);
    // Limit to 5-6 words max
    const words = cleanTitle.split(/\s+/);
    if (words.length > 5) {
      cleanTitle = words.slice(0, 5).join(' ');
    }
  }

  return {
    cleanTitle,
    category,
    archetype,
    socraticQuestion,
  };
}
