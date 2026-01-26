
export type Tool = 'pencil' | 'eraser' | 'circle' | 'rectangle';

export interface CanvasState {
  color: string;
  brushSize: number;
  tool: Tool;
}

export interface AIResponse {
  analysis: string;
  suggestions: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
}
