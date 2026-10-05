export type SubjectId = 'calculus' | 'binary_search' | 'physics_projectile';

export type PedagogicalMode = 
  | 'explanation' 
  | 'socratic' 
  | 'visual' 
  | 'demonstration' 
  | 'worked_example' 
  | 'guided_practice' 
  | 'debugging' 
  | 'assessment';

export type TeacherState = 'speaking' | 'listening' | 'observing' | 'writing' | 'evaluating';

export interface ConceptNode {
  id: string;
  name: string;
  status: 'mastered' | 'current' | 'next';
  description: string;
}

export interface DialogueMessage {
  id: string;
  sender: 'teacher' | 'student';
  text: string;
  timestamp: string;
  actionTrigger?: string;
  highlightWords?: string[];
  formulaLatex?: string;
}

export interface LessonData {
  id: SubjectId;
  title: string;
  category: string;
  icon: string;
  overview: string;
  concepts: ConceptNode[];
  initialMode: PedagogicalMode;
  initialTeacherSpeech: string;
  socraticSuggestions: string[];
  // Math specific
  initialFormulaLatex?: string;
  formulaDerivationSteps?: { latex: string; explanation: string; deltaX: number }[];
  // 3D specific
  defaultParams3D?: { angle: number; velocity: number; gravity: number };
  // Code specific
  starterCode?: string;
  codeTraceSteps?: { line: number; variables: Record<string, any>; explanation: string }[];
}

export interface WhiteboardDrawingStroke {
  color: string;
  size: number;
  points: { x: number; y: number }[];
}
