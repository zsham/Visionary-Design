
export type Tool = 'pencil' | 'eraser' | 'circle' | 'rectangle' | 'text';

export interface CanvasState {
  color: string;
  brushSize: number;
  tool: Tool;
  fontSize: number;
  fontFamily: 'Inter' | 'Georgia' | 'monospace';
  isBold: boolean;
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
