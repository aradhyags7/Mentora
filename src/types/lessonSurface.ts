/**
 * MENTORA LESSON SURFACE & ARTIFACT RUNTIME SPECIFICATION
 * 
 * Defines stateful, bidirectional interactive environment types.
 * Mentora lessons are LIVE SCENE STATES, NOT pre-rendered video frames.
 */

export type TeacherStateStatus = 
  | 'thinking'
  | 'building'
  | 'teaching'
  | 'waiting'
  | 'evaluating'
  | 'adapting'
  | 'completed'
  | 'paused';

export interface SemanticInteractionEvent {
  type: 'student.interaction' | 'teacher.action' | 'artifact.variable_changed' | 'lesson.completed';
  artifact: string;
  action?: string;
  value?: any;
  variable?: string;
  oldValue?: any;
  newValue?: any;
  timestamp?: number;
}

export interface LessonVariable {
  key: string;
  label: string;
  value: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface InteractiveArtifactProps {
  id: string;
  concept: string;
  initialState?: Record<string, any>;
  onInteraction?: (event: SemanticInteractionEvent) => void;
  isTeacherActive?: boolean;
}
