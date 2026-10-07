/**
 * MENTORA CLASSROOM RUNTIME (LessonRuntime)
 * 
 * Stateful, decoupled runtime managing interactive lesson environments,
 * semantic event dispatching, and bidirectional shared control.
 */

import { TeacherStateStatus, SemanticInteractionEvent } from '../../types/lessonSurface';
import { TeachingDslLesson } from '../../types/teachingDsl';

export interface LessonRuntimeState {
  lessonId: string;
  topic: string;
  objective: string;
  mode: string;
  status: TeacherStateStatus;
  activeArtifact: string;
  artifactProps: Record<string, any>;
  variables: Record<string, any>;
  currentStepIndex: number;
  totalSteps: number;
  isCollapsed: boolean;
  history: Array<{
    timestamp: number;
    actor: 'teacher' | 'student';
    action: string;
    payload?: any;
  }>;
}

export type LessonStateListener = (state: LessonRuntimeState) => void;
export type SemanticEventListener = (event: SemanticInteractionEvent) => void;

export class LessonRuntime {
  private state: LessonRuntimeState;
  private stateListeners: Set<LessonStateListener> = new Set();
  private eventListeners: Set<SemanticEventListener> = new Set();
  private dslLesson: TeachingDslLesson | null = null;

  constructor(initialTopic: string = 'Calculus: Derivatives', initialArtifact: string = 'math.derivative') {
    this.state = {
      lessonId: `lesson_${Date.now()}`,
      topic: initialTopic,
      objective: 'Build conceptual invariants from first principles',
      mode: 'visual',
      status: 'teaching',
      activeArtifact: initialArtifact,
      artifactProps: {},
      variables: {
        x0: 2.0,
        deltaX: 2.0,
        tangentSlope: 2.0,
      },
      currentStepIndex: 0,
      totalSteps: 1,
      isCollapsed: false,
      history: [],
    };
  }

  public getState(): LessonRuntimeState {
    return { ...this.state };
  }

  public subscribe(listener: LessonStateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.getState());
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public onSemanticEvent(listener: SemanticEventListener): () => void {
    this.eventListeners.add(listener);
    return () => {
      this.eventListeners.delete(listener);
    };
  }

  public emitEvent(event: SemanticInteractionEvent): void {
    event.timestamp = event.timestamp || Date.now();

    // Record interaction in lesson history
    this.state.history.push({
      timestamp: event.timestamp,
      actor: event.type.startsWith('student') ? 'student' : 'teacher',
      action: event.action || 'interaction',
      payload: event.value ?? event.newValue,
    });

    // Notify listeners
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in semantic event listener:', err);
      }
    });

    this.notifyState();
  }

  public handleStudentInteraction(artifact: string, action: string, value: any): void {
    this.state.status = 'evaluating';
    this.notifyState();

    this.emitEvent({
      type: 'student.interaction',
      artifact,
      action,
      value,
    });
  }

  public setStatus(status: TeacherStateStatus): void {
    this.state.status = status;
    this.notifyState();
  }

  public toggleCollapse(): void {
    this.state.isCollapsed = !this.state.isCollapsed;
    this.notifyState();
  }

  public setCollapsed(collapsed: boolean): void {
    this.state.isCollapsed = collapsed;
    this.notifyState();
  }

  public loadDslLesson(lesson: TeachingDslLesson): void {
    this.dslLesson = lesson;
    this.state.lessonId = lesson.lesson_id;
    this.state.objective = lesson.objective;
    this.state.mode = lesson.mode;
    this.state.totalSteps = lesson.timeline.length;
    this.state.currentStepIndex = 0;
    this.state.status = 'teaching';

    if (lesson.meta?.concept) {
      this.state.activeArtifact = lesson.meta.concept;
    }

    this.notifyState();
  }

  private notifyState(): void {
    const current = this.getState();
    this.stateListeners.forEach(listener => {
      try {
        listener(current);
      } catch (err) {
        console.error('Error in lesson state listener:', err);
      }
    });
  }
}
