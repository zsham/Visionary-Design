
export type Tool = 'pencil' | 'eraser' | 'circle' | 'rectangle' | 'text' | 'fill' | 'transform' | 'crop';
export type AspectRatio = '1:1' | '16:9' | '4:3' | '9:16' | '3:2';

export interface CanvasState {
  color: string;
  brushSize: number;
  tool: Tool;
  fontSize: number;
  fontFamily: 'Inter' | 'Georgia' | 'monospace';
  isBold: boolean;
  aspectRatio: AspectRatio;
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
