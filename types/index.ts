export type ContentType = 'blog' | 'youtube';

export interface AgentStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'done';
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

export interface HistoryItem {
  id: string;
  topic: string;
  type: ContentType;
  title: string;
  content: string;
  wordCount: number;
  createdAt: number;
  tone: string;
}
