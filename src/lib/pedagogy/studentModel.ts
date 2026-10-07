/**
 * MENTORA STUDENT MODEL & BAYESIAN KNOWLEDGE TRACING (BKT)
 * 
 * Implements standard Corbett & Anderson BKT algorithm for interpretable
 * mastery estimation and student knowledge state persistence.
 */

import { BktParameters, StudentState } from '../../types/pedagogy';

// Standard educational parameter defaults
export const DEFAULT_BKT_PARAMS: BktParameters = {
  p_l0: 0.25, // Initial prior probability of knowing concept
  p_t: 0.15,  // Learning transition probability per practice beat
  p_g: 0.20,  // Guess probability
  p_s: 0.10,  // Slip probability
};

export class StudentModelManager {
  private state: StudentState;
  private params: BktParameters;

  constructor(initialState?: Partial<StudentState>, params: BktParameters = DEFAULT_BKT_PARAMS) {
    this.params = params;
    this.state = {
      id: initialState?.id || 'student_local',
      concepts: {
        'math.algebra': 0.88,
        'math.functions': 0.79,
        'math.limits': 0.42,
        'math.derivative': 0.25,
        'cs.array': 0.90,
        'cs.binary_search': 0.40,
        ...(initialState?.concepts || {}),
      },
      misconceptions: initialState?.misconceptions || [],
      recent_errors: initialState?.recent_errors || [],
      preferred_modes: initialState?.preferred_modes || ['visual', 'worked_example', 'socratic'],
      confidence: initialState?.confidence ?? 0.6,
      totalInteractions: initialState?.totalInteractions ?? 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  getState(): StudentState {
    return { ...this.state };
  }

  getMastery(concept: string): number {
    return this.state.concepts[concept] ?? this.params.p_l0;
  }

  /**
   * Updates knowledge mastery probability via Bayesian Knowledge Tracing
   */
  updateMastery(concept: string, isCorrect: boolean): { before: number; after: number } {
    const prior = this.getMastery(concept);
    const { p_t, p_g, p_s } = this.params;

    // 1. Posterior calculation conditioned on student response correctness
    let posteriorGivenObs: number;
    if (isCorrect) {
      const numerator = prior * (1 - p_s);
      const denominator = numerator + (1 - prior) * p_g;
      posteriorGivenObs = denominator > 0 ? numerator / denominator : prior;
    } else {
      const numerator = prior * p_s;
      const denominator = numerator + (1 - prior) * (1 - p_g);
      posteriorGivenObs = denominator > 0 ? numerator / denominator : prior;
    }

    // 2. State transition probability (opportunity to learn from step)
    const newMastery = posteriorGivenObs + (1 - posteriorGivenObs) * p_t;
    const clampedMastery = Math.min(0.99, Math.max(0.01, Number(newMastery.toFixed(3))));

    this.state.concepts[concept] = clampedMastery;
    this.state.totalInteractions += 1;
    this.state.lastUpdated = new Date().toISOString();

    return { before: prior, after: clampedMastery };
  }

  addMisconception(misconceptionId: string) {
    if (!this.state.misconceptions.includes(misconceptionId)) {
      this.state.misconceptions.push(misconceptionId);
    }
  }

  clearMisconception(misconceptionId: string) {
    this.state.misconceptions = this.state.misconceptions.filter(id => id !== misconceptionId);
  }

  recordError(errorDescription: string) {
    this.state.recent_errors = [errorDescription, ...this.state.recent_errors].slice(0, 5);
  }
}

export const GlobalStudentModel = new StudentModelManager();
