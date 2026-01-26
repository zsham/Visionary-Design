
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Tool, CanvasState } from '../types';

interface DrawingCanvasProps {
  state: CanvasState;
  backgroundImage?: string | null;
}

export interface DrawingCanvasHandle {
  clear: () => void;
  getImageData: () => string;
  undo: () => void;
}

const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(({ state, backgroundImage }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (backgroundImage) {
          drawBackgroundImage(ctx, backgroundImage);
        }
        saveToHistory();
      }
    },
    getImageData: () => {
      return canvasRef.current?.toDataURL('image/png') || '';
    },
    undo: () => {
      if (history.length > 1) {
        const newHistory = history.slice(0, -1);
        const lastState = newHistory[newHistory.length - 1];
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && lastState) {
          ctx.putImageData(lastState, 0, 0);
          setHistory(newHistory);
        }
      }
    }
  }));

  const saveToHistory = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) {
      const currentData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHistory(prev => [...prev.slice(-19), currentData]); // Keep last 20 states
    }
  };

  const drawBackgroundImage = (ctx: CanvasRenderingContext2D, url: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;
      ctx.drawImage(img, 0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
      saveToHistory();
    };
    img.src = url;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        saveToHistory();
      }
    }
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && backgroundImage) {
      drawBackgroundImage(ctx, backgroundImage);
    }
  }, [backgroundImage]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = state.tool === 'eraser' ? '#ffffff' : state.color;
      ctx.lineWidth = state.brushSize;
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-inner relative overflow-hidden">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="cursor-crosshair w-full h-full"
      />
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
