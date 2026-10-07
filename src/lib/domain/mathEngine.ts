/**
 * MENTORA DETERMINISTIC DOMAIN ENGINE — MATHEMATICS (Phase 12)
 * 
 * Performs ground-truth symbolic and numerical computation for mathematical concepts.
 * Prevents LLM mathematical hallucinations by strictly computing derivatives, limits,
 * secants, and tangent slopes through deterministic algorithms.
 */

export interface DerivativeStep {
  deltaX: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  deltaY: number;
  secantSlope: number;
  isTangentLimit: boolean;
  explanation: string;
}

export class MathDomainEngine {
  /**
   * Evaluates standard polynomial/rational mathematical expressions deterministically.
   * Default test function: f(x) = 0.5x^2 - 2
   */
  static evaluateFunction(x: number, fn: (val: number) => number = (x) => 0.5 * x * x - 2): number {
    return fn(x);
  }

  /**
   * Calculates exact numerical derivative using central finite difference
   */
  static computeInstantaneousSlope(
    x0: number, 
    fn: (val: number) => number = (x) => 0.5 * x * x - 2,
    h: number = 1e-6
  ): number {
    const slope = (fn(x0 + h) - fn(x0 - h)) / (2 * h);
    return Number(slope.toFixed(4));
  }

  /**
   * Traces the limit process of the secant slope approaching the tangent slope as Δx -> 0.
   * This is the mathematical core of the derivative:
   * m_sec = [f(x0 + Δx) - f(x0)] / Δx
   * m_tan = lim(Δx -> 0) m_sec
   */
  static traceDerivativeLimit(
    x0: number = 2.0,
    deltas: number[] = [2.0, 1.0, 0.5, 0.1, 0.01, 0.001],
    fn: (val: number) => number = (x) => 0.5 * x * x - 2
  ): {
    exactDerivative: number;
    steps: DerivativeStep[];
  } {
    const y0 = fn(x0);
    const exactDerivative = this.computeInstantaneousSlope(x0, fn);

    const steps: DerivativeStep[] = deltas.map(dx => {
      const x1 = x0 + dx;
      const y1 = fn(x1);
      const dy = y1 - y0;
      const secantSlope = Number((dy / dx).toFixed(4));
      const isTangentLimit = Math.abs(secantSlope - exactDerivative) < 0.05;

      return {
        deltaX: dx,
        x0,
        x1,
        y0,
        y1,
        deltaY: Number(dy.toFixed(4)),
        secantSlope,
        isTangentLimit,
        explanation: isTangentLimit
          ? `At Δx = ${dx}, average slope ${secantSlope} converges to exact tangent slope f'(${x0}) = ${exactDerivative}.`
          : `For interval Δx = ${dx}, average secant slope = Δy / Δx = ${dy.toFixed(2)} / ${dx} = ${secantSlope}.`,
      };
    });

    return { exactDerivative, steps };
  }

  /**
   * Computes equation of tangent line: y - y0 = m(x - x0) -> y = m*x + (y0 - m*x0)
   */
  static getTangentLineEquation(x0: number, fn: (val: number) => number = (x) => 0.5 * x * x - 2): {
    slope: number;
    intercept: number;
    formulaLatex: string;
  } {
    const y0 = fn(x0);
    const slope = this.computeInstantaneousSlope(x0, fn);
    const intercept = Number((y0 - slope * x0).toFixed(4));
    return {
      slope,
      intercept,
      formulaLatex: `y = ${slope}x ${intercept >= 0 ? '+ ' + intercept : '- ' + Math.abs(intercept)}`,
    };
  }
}
