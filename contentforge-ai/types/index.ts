export type ContentType = 'blog' | 'youtube';

export interface AgentStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  output?: string;
}

export interface GenerationRequest {
  topic: string;
  type: ContentType;
  tone: string;
  length: string;
}

export interface GenerationResult {
  title: string;
  content: string;
  outline: string[];
  wordCount: number;
}
