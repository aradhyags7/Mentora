/**
 * MENTORA DETERMINISTIC DOMAIN ENGINE — COMPUTER SCIENCE (Phase 12)
 * 
 * Computes exact ground-truth execution traces for algorithmic primitives,
 * pointer movements, array partitioning, and invariant assertions.
 */

export interface BinarySearchTraceStep {
  step: number;
  low: number;
  high: number;
  mid: number;
  midValue: number;
  target: number;
  comparison: 'less' | 'greater' | 'equal';
  eliminatedRange: [number, number];
  activeRange: [number, number];
  explanation: string;
}

export class CsDomainEngine {
  /**
   * Deterministically traces Binary Search with step-by-step invariant logging.
   */
  static traceBinarySearch(
    array: number[] = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
    target: number = 23
  ): {
    found: boolean;
    targetIndex: number;
    stepsCount: number;
    steps: BinarySearchTraceStep[];
  } {
    const steps: BinarySearchTraceStep[] = [];
    let low = 0;
    let high = array.length - 1;
    let stepNum = 1;
    let targetIndex = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midValue = array[mid];

      let comparison: 'less' | 'greater' | 'equal';
      let eliminated: [number, number] = [0, 0];
      let active: [number, number] = [low, high];
      let explanation = '';

      if (midValue === target) {
        comparison = 'equal';
        targetIndex = mid;
        explanation = `Target ${target} located at index ${mid} in ${stepNum} iterations!`;
        steps.push({
          step: stepNum,
          low,
          high,
          mid,
          midValue,
          target,
          comparison,
          eliminatedRange: [-1, -1],
          activeRange: [mid, mid],
          explanation,
        });
        break;
      } else if (midValue < target) {
        comparison = 'less';
        eliminated = [low, mid];
        explanation = `${midValue} < ${target}: Target must lie in upper partition. Discarding indices [${low}..${mid}].`;
        steps.push({
          step: stepNum,
          low,
          high,
          mid,
          midValue,
          target,
          comparison,
          eliminatedRange: eliminated,
          activeRange: [mid + 1, high],
          explanation,
        });
        low = mid + 1;
      } else {
        comparison = 'greater';
        eliminated = [mid, high];
        explanation = `${midValue} > ${target}: Target must lie in lower partition. Discarding indices [${mid}..${high}].`;
        steps.push({
          step: stepNum,
          low,
          high,
          mid,
          midValue,
          target,
          comparison,
          eliminatedRange: eliminated,
          activeRange: [low, mid - 1],
          explanation,
        });
        high = mid - 1;
      }

      stepNum++;
    }

    return {
      found: targetIndex !== -1,
      targetIndex,
      stepsCount: steps.length,
      steps,
    };
  }
}
