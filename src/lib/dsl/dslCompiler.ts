/**
 * MENTORA TEACHING DSL COMPILER (Phase 1, 3B1B & Nitish Rajput Upgrades)
 * 
 * Compiles high-level semantic Teaching DSL lessons into deterministic,
 * 60 FPS kinetic timeline representations executed by the Classroom Runtime.
 * 
 * Upgrades:
 * - 3Blue1Brown color-locked LaTeX token maps & progressive SVG geometry
 * - Nitish Rajput infinite canvas camera choreography, spatial investigation nodes,
 *   animated causal connectors, and signature zoom-out finale.
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
  CameraAction
} from '../../types/kinetic';
import { ArtifactRegistry } from '../artifacts/registry';
import { validateAndCompileTimeline } from '../engine/validator';

export class TeachingDslCompiler {
  /**
   * Compiles a Teaching DSL lesson into a runnable KineticTimeline
   * with 3Blue1Brown math-color locking and Nitish Rajput camera choreography.
   */
  static compileToTimeline(lesson: TeachingDslLesson): KineticTimeline {
    const rawEntities: VisualPrimitive[] = [];
    const cues: TimelineCue[] = [];
    let accumulatedTimeMs = 0;
    const conceptName = (lesson.meta?.concept || lesson.objective || '').toLowerCase();

    // Map of entity positions for auto-camera choreography
    const entityPositions: Record<string, { x: number; y: number; connectedIds?: string[] }> = {};

    // 1. Search for artifact creation steps to seed initial entities
    for (const step of lesson.timeline) {
      if (step.type === 'artifact.create') {
        const registered = ArtifactRegistry.get(step.artifact);
        if (registered && registered.timeline.initialEntities) {
          rawEntities.push(...registered.timeline.initialEntities);
        }
      }
    }

    // 2. If no entities were created, synthesize 3B1B + Nitish Rajput visual primitives
    if (rawEntities.length === 0) {
      if (conceptName.includes('deriv') || conceptName.includes('calculus') || conceptName.includes('tangent')) {
        // Calculus: Secant -> Tangent limit mind-map & color-locked equation
        const nodeA: InvestigationNodePrimitive = {
          id: 'node_secant_rate',
          type: 'investigation_node',
          title: 'Average Velocity (Secant)',
          categoryBadge: 'Geometric Invariant',
          subtitle: 'Ratio of finite changes Δy / Δx',
          metricLabel: 'Secant Slope m',
          metricValue: 'Δy / Δx',
          accentColor: '#F59E0B',
          position: { x: -280, y: -140 },
          width: 260,
          height: 140,
        };

        const nodeB: InvestigationNodePrimitive = {
          id: 'node_tangent_deriv',
          type: 'investigation_node',
          title: 'Instantaneous Rate (Tangent)',
          categoryBadge: 'The Derivative',
          subtitle: 'Limit as interval collapses to zero',
          metricLabel: "Slope f'(x₀)",
          metricValue: 'lim Δx → 0',
          accentColor: '#10B981',
          position: { x: 280, y: -140 },
          width: 260,
          height: 140,
        };

        const connector: CausalConnectorPrimitive = {
          id: 'conn_secant_to_tangent',
          type: 'causal_connector',
          fromEntityId: 'node_secant_rate',
          toEntityId: 'node_tangent_deriv',
          fromPoint: { x: -150, y: -140 },
          toPoint: { x: 150, y: -140 },
          label: 'Take Limit Δx → 0',
          color: '#38BDF8',
          curveOffset: -30,
        };

        const equation: MathEquationPrimitive = {
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
          position: { x: 0, y: 160 },
        };

        const graph: CoordinateGraphPrimitive = {
          id: 'graph_derivative_parabola',
          type: 'graph',
          title: 'Parabola f(x) = 0.25x²',
          fnLatex: '0.25 * x^2',
          rangeX: [-1, 6],
          rangeY: [-1, 7],
          tangentAtX: 2.0,
          secantBetween: [2.0, 3.5],
          position: { x: 0, y: 10 },
        };

        rawEntities.push(nodeA, nodeB, connector, equation, graph);

        entityPositions['node_secant_rate'] = { x: -280, y: -140, connectedIds: ['node_tangent_deriv'] };
        entityPositions['node_tangent_deriv'] = { x: 280, y: -140, connectedIds: ['node_secant_rate'] };
        entityPositions['eq_derivative_def'] = { x: 0, y: 160 };
        entityPositions['graph_derivative_parabola'] = { x: 0, y: 10 };
      } else if (conceptName.includes('binary') || conceptName.includes('search') || conceptName.includes('algorithm')) {
        // Computer Science: Search space halving investigation board
        const nodeA: InvestigationNodePrimitive = {
          id: 'node_search_space',
          type: 'investigation_node',
          title: 'Search Window [Low, High]',
          categoryBadge: 'Invariant',
          subtitle: 'Active monotonic range',
          metricLabel: 'Search Space Size',
          metricValue: 'N Elements',
          accentColor: '#38BDF8',
          position: { x: -260, y: -120 },
        };

        const nodeB: InvestigationNodePrimitive = {
          id: 'node_pivot_split',
          type: 'investigation_node',
          title: 'Midpoint Pivot & Branch',
          categoryBadge: 'Halving',
          subtitle: 'Single comparison discards half',
          metricLabel: 'Remaining Elements',
          metricValue: 'N / 2',
          accentColor: '#10B981',
          position: { x: 260, y: -120 },
        };

        const connector: CausalConnectorPrimitive = {
          id: 'conn_binary_halve',
          type: 'causal_connector',
          fromEntityId: 'node_search_space',
          toEntityId: 'node_pivot_split',
          fromPoint: { x: -130, y: -120 },
          toPoint: { x: 130, y: -120 },
          label: 'Mid = (Low + High) / 2',
          color: '#F59E0B',
        };

        rawEntities.push(nodeA, nodeB, connector);
        entityPositions['node_search_space'] = { x: -260, y: -120, connectedIds: ['node_pivot_split'] };
        entityPositions['node_pivot_split'] = { x: 260, y: -120, connectedIds: ['node_search_space'] };
      } else {
        // Generic First-Principles Investigation Board
        const nodeMain: InvestigationNodePrimitive = {
          id: 'node_concept_core',
          type: 'investigation_node',
          title: lesson.meta?.concept || lesson.objective,
          categoryBadge: 'Foundational Axiom',
          subtitle: 'First-principles core dynamic',
          metricLabel: 'Pedagogical Mode',
          metricValue: lesson.mode.toUpperCase(),
          accentColor: '#38BDF8',
          position: { x: -220, y: -100 },
        };

        const nodeTarget: InvestigationNodePrimitive = {
          id: 'node_concept_target',
          type: 'investigation_node',
          title: 'Target Mental Model',
          categoryBadge: 'Understanding',
          subtitle: 'Intuitive grasp & mathematical invariant',
          metricLabel: 'Mastery Objective',
          metricValue: 'Conceptual Proof',
          accentColor: '#10B981',
          position: { x: 220, y: -100 },
        };

        const conn: CausalConnectorPrimitive = {
          id: 'conn_core_target',
          type: 'causal_connector',
          fromEntityId: 'node_concept_core',
          toEntityId: 'node_concept_target',
          fromPoint: { x: -110, y: -100 },
          toPoint: { x: 110, y: -100 },
          label: 'First Principles Derivation',
          color: '#F59E0B',
        };

        rawEntities.push(nodeMain, nodeTarget, conn);
        entityPositions['node_concept_core'] = { x: -220, y: -100, connectedIds: ['node_concept_target'] };
        entityPositions['node_concept_target'] = { x: 220, y: -100, connectedIds: ['node_concept_core'] };
      }
    } else {
      // Record existing entity positions
      for (const ent of rawEntities) {
        if ('position' in ent && ent.position) {
          entityPositions[ent.id] = { x: ent.position.x, y: ent.position.y };
        }
      }
    }

    // 3. Translate DSL timeline steps into sequentially timed Kinetic Cues with Auto-Camera Choreography
    lesson.timeline.forEach((step, idx) => {
      const cueTimeMs = Math.max(step.t * 1000, accumulatedTimeMs);
      const cueDurationMs = 4000;

      if (step.type === 'speak') {
        const actions: CameraAction[] = [];

        // Auto-Camera Choreography: If beat mentions or references an entity, center camera on it
        const spokenText = step.text.toLowerCase();
        let targetEntityId: string | undefined;

        if (spokenText.includes('secant') || spokenText.includes('average')) {
          targetEntityId = 'node_secant_rate';
        } else if (spokenText.includes('tangent') || spokenText.includes('instant') || spokenText.includes('derivative')) {
          targetEntityId = 'node_tangent_deriv';
        } else if (spokenText.includes('equation') || spokenText.includes('formula') || spokenText.includes('limit')) {
          targetEntityId = 'eq_derivative_def';
        } else if (spokenText.includes('graph') || spokenText.includes('curve') || spokenText.includes('parabola')) {
          targetEntityId = 'graph_derivative_parabola';
        } else if (idx === 0) {
          targetEntityId = Object.keys(entityPositions)[0];
        }

        if (targetEntityId && entityPositions[targetEntityId]) {
          const pos = entityPositions[targetEntityId];
          actions.push({
            type: 'camera',
            panX: -pos.x,
            panY: -pos.y,
            zoom: 1.25,
            durationMs: 1200,
            easing: 'cinema',
            focusEntityIds: [targetEntityId, ...(pos.connectedIds || [])],
            spotlightIntensity: 0.8,
          });
        }

        cues.push({
          id: `cue_${idx}`,
          timestampMs: cueTimeMs,
          durationMs: cueDurationMs,
          narration: step.text,
          words: step.words,
          actions,
        });
        accumulatedTimeMs = cueTimeMs + cueDurationMs;
      } else if (step.type === 'camera') {
        cues.push({
          id: `cue_${idx}`,
          timestampMs: cueTimeMs,
          durationMs: step.durationMs || 1000,
          narration: '',
          actions: [
            {
              type: 'camera',
              panX: step.panX,
              panY: step.panY,
              zoom: step.zoom,
              durationMs: step.durationMs,
              easing: 'cinema',
            },
          ],
        });
        accumulatedTimeMs = cueTimeMs + (step.durationMs || 1000);
      } else if (step.type === 'artifact.animate') {
        const actions: any[] = [];
        if (step.animation === 'secant_to_tangent' || step.animation.includes('tangent')) {
          actions.push({
            type: 'card:update',
            targetId: 'card_calc_status',
            items: [
              { label: 'f(x)', value: '0.5x² - 2' },
              { label: 'x₀', value: '2.0' },
              { label: 'Δx', value: '→ 0.001' },
              { label: 'Instant Slope', value: "f'(2) = 2.0" },
            ],
          });
        }
        cues.push({
          id: `cue_${idx}`,
          timestampMs: cueTimeMs,
          durationMs: step.durationMs || 2500,
          narration: '',
          actions,
        });
        accumulatedTimeMs = cueTimeMs + (step.durationMs || 2500);
      } else if (step.type === 'ask') {
        cues.push({
          id: `cue_${idx}`,
          timestampMs: cueTimeMs,
          durationMs: 5000,
          narration: `Question: ${step.question}`,
          actions: [
            {
              type: 'camera',
              panX: 0,
              panY: 0,
              zoom: 1.0,
              durationMs: 1500,
              easing: 'cinema',
              focusEntityIds: [],
              spotlightIntensity: 0,
            },
          ],
        });
        accumulatedTimeMs = cueTimeMs + 5000;
      }
    });

    // 4. THE SIGNATURE ZOOM-OUT FINALE:
    // Append a majestic documentary zoom-out so the student sees the whole connected system
    cues.push({
      id: `cue_finale_zoomout`,
      timestampMs: accumulatedTimeMs,
      durationMs: 2500,
      narration: 'Observe how the foundational axioms connect into the complete mathematical reality.',
      actions: [
        {
          type: 'camera',
          panX: 0,
          panY: 0,
          zoom: 0.65,
          durationMs: 2500,
          easing: 'cinema',
          focusEntityIds: [],
          spotlightIntensity: 0,
        },
      ],
    });
    accumulatedTimeMs += 2500;

    const rawTimeline = {
      id: lesson.lesson_id,
      title: lesson.objective || 'Interactive Lesson',
      concept: lesson.meta?.concept || 'Lesson',
      totalDurationMs: Math.max(accumulatedTimeMs + 1000, 10000),
      initialEntities: rawEntities,
      cues: cues.length > 0 ? cues : [
        {
          id: 'cue_default',
          timestampMs: 0,
          durationMs: 4000,
          narration: `Exploring ${lesson.objective}`,
          actions: [],
        },
      ],
    };

    return validateAndCompileTimeline(rawTimeline);
  }
}
