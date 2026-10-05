export type DomainType = 
  | 'computer_science' 
  | 'mathematics' 
  | 'physics' 
  | 'biology' 
  | 'chemistry' 
  | 'engineering';

export type ArtifactComponentType =
  | 'binary_search'
  | 'derivative_graph'
  | 'projectile_kinematics'
  | 'cpu_pipeline'
  | 'dna_helix';

export interface TeachingArtifactSpec {
  id: string;
  type: 'interactive_visualization' | 'simulation' | '3d_scene' | 'code_playground';
  domain: DomainType;
  topic: string;
  title: string;
  component: ArtifactComponentType;
  props: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  artifact?: TeachingArtifactSpec;
}
