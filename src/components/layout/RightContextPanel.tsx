'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  ListOrdered, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Calculator, 
  Code2, 
  Activity,
  Layers,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { LessonVariable, LessonOutlineItem } from '../../lib/artifacts/registry';
import { StudentState } from '../../types/pedagogy';
import { DEFAULT_BKT_PARAMS } from '../../lib/pedagogy/studentModel';
import { MISCONCEPTION_CATALOG } from '../../lib/pedagogy/misconceptions';
import { MathDomainEngine } from '../../lib/domain/mathEngine';
import { CsDomainEngine } from '../../lib/domain/csEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  variables: LessonVariable[];
  outline: LessonOutlineItem[];
  onSeekStep?: (timestampMs: number) => void;
  studentState?: StudentState;
  activeConcept?: string;
  activeMode?: string;
  activeAction?: string;
  onResetStudentState?: () => void;
}

export const RightContextPanel: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  variables,
  outline,
  onSeekStep,
  studentState,
  activeConcept = 'math.derivative',
  activeMode = 'visual',
  activeAction = 'VISUALIZE',
  onResetStudentState,
}) => {
  const [panelTab, setPanelTab] = useState<'outline' | 'brain' | 'domain'>('brain');
  const [domainSubTab, setDomainSubTab] = useState<'math' | 'cs'>('math');

  // Math Domain ground truth
  const mathLimitTrace = MathDomainEngine.traceDerivativeLimit(2.0, [2.0, 1.0, 0.5, 0.1, 0.01, 0.001]);
  const mathTangent = MathDomainEngine.getTangentLineEquation(2.0);

  // CS Domain ground truth
  const csTrace = CsDomainEngine.traceBinarySearch([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23);

  // Safe fallback concepts map
  const concepts = studentState?.concepts || {
    'math.algebra': 0.88,
    'math.functions': 0.79,
    'math.limits': 0.42,
    'math.derivative': 0.25,
    'cs.array': 0.90,
    'cs.binary_search': 0.40,
  };

  // Active concept mastery
  const activeMastery = concepts[activeConcept] ?? 0.25;

  // Active detected misconceptions from catalog
  const activeMisconceptions = MISCONCEPTION_CATALOG.filter(m => 
    (studentState?.misconceptions || []).includes(m.id)
  );

  const interactionsCount = studentState?.totalInteractions ?? 0;

  return (
    <aside className={`mentora-right-panel ${isOpen ? '' : 'collapsed'}`}>
      {/* Panel Top Header */}
      <div className="panel-header">
        <div className="panel-tab-pills">
          <button
            type="button"
            className={`panel-tab-btn ${panelTab === 'brain' ? 'active' : ''}`}
            onClick={() => setPanelTab('brain')}
            title="Pedagogical Brain & BKT Model"
          >
            <Brain size={13} />
            <span>Teacher Brain</span>
          </button>
          <button
            type="button"
            className={`panel-tab-btn ${panelTab === 'domain' ? 'active' : ''}`}
            onClick={() => setPanelTab('domain')}
            title="Deterministic Domain Engine Ground Truth"
          >
            <Calculator size={13} />
            <span>Engine</span>
          </button>
          <button
            type="button"
            className={`panel-tab-btn ${panelTab === 'outline' ? 'active' : ''}`}
            onClick={() => setPanelTab('outline')}
            title="Lesson Outline & State Variables"
          >
            <Sliders size={13} />
            <span>Outline</span>
          </button>
        </div>
        <button
          className="topbar-icon-btn"
          onClick={onClose}
          title="Close panel"
          style={{ width: 24, height: 24 }}
        >
          <X size={14} />
        </button>
      </div>

      {/* TAB 1: TEACHER BRAIN & BKT (PEDAGOGICAL INTELLIGENCE) */}
      {panelTab === 'brain' && (
        <div className="panel-tab-content">
          {/* Active Policy Status Card */}
          <div className="brain-policy-card">
            <div className="brain-policy-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={14} className="accent-pulse" />
                <span className="brain-section-title">Cognitive Policy Status</span>
              </div>
              <span className="policy-badge-live">Active</span>
            </div>

            <div className="policy-metrics-grid">
              <div className="policy-metric-pill">
                <span className="metric-k">Action</span>
                <span className="metric-v action">{activeAction}</span>
              </div>
              <div className="policy-metric-pill">
                <span className="metric-k">Mode</span>
                <span className="metric-v mode">{activeMode}</span>
              </div>
              <div className="policy-metric-pill">
                <span className="metric-k">Bloom Depth</span>
                <span className="metric-v depth">Comprehension</span>
              </div>
            </div>

            <div className="policy-rationale-note">
              {activeAction === 'REMEDIATE'
                ? 'Targeted remediation: clearing intuitive barrier before advancing.'
                : activeAction === 'ADVANCE'
                ? 'High comprehension: advancing to higher-order invariant exploration.'
                : 'Scaffolding visual models and probing conceptual intuition with Socratic questions.'}
            </div>
          </div>

          {/* Bayesian Knowledge Tracing (Corbett & Anderson standard model) */}
          <div className="context-section">
            <div className="context-section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={13} />
                <span>Knowledge Tracing P(L)</span>
              </div>
              <span className="interactions-pill">{interactionsCount} interactions</span>
            </div>

            {/* Concept Mastery Bars */}
            <div className="bkt-concept-list">
              {Object.entries(concepts).map(([conceptKey, mastery]) => {
                const isSelected = conceptKey === activeConcept;
                const percentage = Math.round(mastery * 100);
                const colorClass = percentage >= 80 ? 'mastered' : percentage >= 40 ? 'emerging' : 'novice';

                return (
                  <div key={conceptKey} className={`bkt-concept-item ${isSelected ? 'highlight' : ''}`}>
                    <div className="bkt-item-meta">
                      <span className="bkt-concept-name">
                        {conceptKey.replace('math.', 'Math: ').replace('cs.', 'CS: ').replace('_', ' ')}
                      </span>
                      <span className={`bkt-percentage ${colorClass}`}>{percentage}%</span>
                    </div>
                    <div className="bkt-bar-track">
                      <div 
                        className={`bkt-bar-fill ${colorClass}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BKT Standard Parameters Note */}
            <div className="bkt-params-card">
              <div className="bkt-params-title">Corbett & Anderson (BKT) Parameters</div>
              <div className="bkt-params-grid">
                <div><span>Prior P(L₀):</span> <strong>{DEFAULT_BKT_PARAMS.p_l0}</strong></div>
                <div><span>Transition P(T):</span> <strong>{DEFAULT_BKT_PARAMS.p_t}</strong></div>
                <div><span>Guess P(G):</span> <strong>{DEFAULT_BKT_PARAMS.p_g}</strong></div>
                <div><span>Slip P(S):</span> <strong>{DEFAULT_BKT_PARAMS.p_s}</strong></div>
              </div>
            </div>
          </div>

          {/* Active Misconception Diagnostic */}
          <div className="context-section">
            <div className="context-section-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={13} />
                <span>Active Misconceptions</span>
              </div>
              <span className={`misconception-count-badge ${activeMisconceptions.length > 0 ? 'alert' : 'clear'}`}>
                {activeMisconceptions.length}
              </span>
            </div>

            {activeMisconceptions.length === 0 ? (
              <div className="misconception-empty-state">
                <CheckCircle2 size={16} className="text-emerald" />
                <span>No active misconceptions detected in cognitive model.</span>
              </div>
            ) : (
              <div className="misconceptions-active-list">
                {activeMisconceptions.map(m => (
                  <div key={m.id} className="misconception-alert-card">
                    <div className="m-alert-header">
                      <span className="m-alert-title">{m.title}</span>
                      <span className={`m-severity-badge ${m.severity}`}>{m.severity}</span>
                    </div>
                    <p className="m-alert-explanation">{m.explanation}</p>
                    <div className="m-alert-remediation">
                      <strong>Remediation:</strong> {m.remediationGuidance}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reset Student Model Control */}
          {onResetStudentState && (
            <div className="panel-footer-actions">
              <button 
                type="button" 
                className="reset-state-btn"
                onClick={onResetStudentState}
                title="Reset student model state to initial priors"
              >
                <RotateCcw size={12} />
                <span>Reset Cognitive Model</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DETERMINISTIC DOMAIN ENGINE */}
      {panelTab === 'domain' && (
        <div className="panel-tab-content">
          <div className="domain-engine-toggle">
            <button
              type="button"
              className={`domain-toggle-btn ${domainSubTab === 'math' ? 'active' : ''}`}
              onClick={() => setDomainSubTab('math')}
            >
              <Calculator size={13} />
              <span>Calculus Engine</span>
            </button>
            <button
              type="button"
              className={`domain-toggle-btn ${domainSubTab === 'cs' ? 'active' : ''}`}
              onClick={() => setDomainSubTab('cs')}
            >
              <Code2 size={13} />
              <span>CS Engine</span>
            </button>
          </div>

          {domainSubTab === 'math' ? (
            <div className="domain-engine-details">
              <div className="domain-info-card">
                <div className="domain-card-title">Function: f(x) = 0.5x² - 2</div>
                <div className="domain-data-row">
                  <span>Point of Tangency (x₀):</span>
                  <strong>2.0</strong>
                </div>
                <div className="domain-data-row">
                  <span>Altitude f(x₀):</span>
                  <strong>0.0</strong>
                </div>
                <div className="domain-data-row">
                  <span>Exact Derivative f'(x₀):</span>
                  <strong className="text-emerald">{mathLimitTrace.exactDerivative}</strong>
                </div>
                <div className="domain-data-row">
                  <span>Tangent Line Equation:</span>
                  <code>{mathTangent.formulaLatex}</code>
                </div>
              </div>

              <div className="context-section-heading" style={{ marginTop: 14 }}>
                Limit Convergence Trace (Δx → 0)
              </div>
              <div className="engine-table-container">
                <table className="engine-table">
                  <thead>
                    <tr>
                      <th>Δx</th>
                      <th>Secant Slope</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mathLimitTrace.steps.map((s, idx) => (
                      <tr key={idx} className={s.isTangentLimit ? 'highlight-row' : ''}>
                        <td>{s.deltaX}</td>
                        <td><strong>{s.secantSlope}</strong></td>
                        <td>
                          {s.isTangentLimit ? (
                            <span className="limit-converged-pill">Converged</span>
                          ) : (
                            <span className="limit-secant-pill">Chord</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="domain-engine-details">
              <div className="domain-info-card">
                <div className="domain-card-title">Binary Search Invariant Engine</div>
                <div className="domain-data-row">
                  <span>Sorted Array:</span>
                  <code>[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]</code>
                </div>
                <div className="domain-data-row">
                  <span>Search Target:</span>
                  <strong>23</strong>
                </div>
                <div className="domain-data-row">
                  <span>Target Index:</span>
                  <strong className="text-emerald">{csTrace.targetIndex}</strong>
                </div>
                <div className="domain-data-row">
                  <span>Convergence:</span>
                  <strong>{csTrace.stepsCount} iterations (O(log n))</strong>
                </div>
              </div>

              <div className="context-section-heading" style={{ marginTop: 14 }}>
                Step-by-Step Execution Invariants
              </div>
              <div className="cs-steps-list">
                {csTrace.steps.map(s => (
                  <div key={s.step} className="cs-step-card">
                    <div className="cs-step-top">
                      <span className="step-tag">Step {s.step}</span>
                      <span className="step-pointers">
                        low: {s.low} | high: {s.high} | mid: {s.mid} ({s.midValue})
                      </span>
                    </div>
                    <div className="cs-step-desc">{s.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LESSON OUTLINE & STATE VARIABLES */}
      {panelTab === 'outline' && (
        <div className="panel-tab-content">
          {/* Variables Inspector */}
          {variables && variables.length > 0 && (
            <div className="context-section">
              <div className="context-section-heading">State Variables</div>
              <div>
                {variables.map((v, idx) => (
                  <div key={idx} className="variable-row">
                    <span className="variable-name">{v.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {v.badge && (
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'var(--accent-subtle)',
                          color: 'var(--accent-text)',
                        }}>
                          {v.badge}
                        </span>
                      )}
                      <span className="variable-val">{String(v.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lesson Outline / Sequence */}
          {outline && outline.length > 0 && (
            <div className="context-section" style={{ borderBottom: 'none' }}>
              <div className="context-section-heading">Lesson Outline</div>
              <div>
                {outline.map((step, idx) => (
                  <div
                    key={step.id || idx}
                    className="outline-step-item"
                    onClick={() => onSeekStep && onSeekStep(step.timestampMs)}
                    title={`Jump to ${step.title}`}
                  >
                    <div className="outline-step-num">{idx + 1}</div>
                    <div>
                      <div className="outline-step-title">{step.title}</div>
                      <div className="outline-step-summary">{step.summary}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
