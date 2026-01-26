
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
  const containerRef = useRef<HTMLDivElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      const drawCtx = drawCanvasRef.current?.getContext('2d');
      if (drawCtx && drawCanvasRef.current) {
        drawCtx.clearRect(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);
        saveToHistory();
      }
    },
    getImageData: () => {
      const drawCanvas = drawCanvasRef.current;
      const bgCanvas = bgCanvasRef.current;
      if (!drawCanvas || !bgCanvas) return '';

      // Create a temporary canvas to merge both layers for export
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = drawCanvas.width;
      tempCanvas.height = drawCanvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(bgCanvas, 0, 0);
        tempCtx.drawImage(drawCanvas, 0, 0);
      }
      return tempCanvas.toDataURL('image/png');
    },
    undo: () => {
      if (history.length > 1) {
        const newHistory = history.slice(0, -1);
        const lastState = newHistory[newHistory.length - 1];
        const ctx = drawCanvasRef.current?.getContext('2d');
        if (ctx && lastState) {
          ctx.putImageData(lastState, 0, 0);
          setHistory(newHistory);
        }
      } else if (history.length === 1) {
        const ctx = drawCanvasRef.current?.getContext('2d');
        if (ctx && drawCanvasRef.current) {
          ctx.clearRect(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);
          setHistory([]);
        }
      }
    }
  }));

  const saveToHistory = () => {
    const ctx = drawCanvasRef.current?.getContext('2d');
    if (ctx && drawCanvasRef.current) {
      const currentData = ctx.getImageData(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);
      setHistory(prev => [...prev.slice(-19), currentData]);
    }
  };

  const drawBackgroundImage = (url: string) => {
    const bgCanvas = bgCanvasRef.current;
    const ctx = bgCanvas?.getContext('2d');
    if (!bgCanvas || !ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      const hRatio = bgCanvas.width / img.width;
      const vRatio = bgCanvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (bgCanvas.width - img.width * ratio) / 2;
      const centerShift_y = (bgCanvas.height - img.height * ratio) / 2;
      ctx.drawImage(img, 0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    };
    img.src = url;
  };

  useEffect(() => {
    const resize = () => {
      const container = containerRef.current;
      const drawCanvas = drawCanvasRef.current;
      const bgCanvas = bgCanvasRef.current;
      if (container && drawCanvas && bgCanvas) {
        const { clientWidth, clientHeight } = container;
        
        // Preserve drawing on resize if possible
        const tempDraw = drawCanvas.getContext('2d')?.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
        
        drawCanvas.width = clientWidth;
        drawCanvas.height = clientHeight;
        bgCanvas.width = clientWidth;
        bgCanvas.height = clientHeight;

        const drawCtx = drawCanvas.getContext('2d');
        if (drawCtx) {
          drawCtx.lineCap = 'round';
          drawCtx.lineJoin = 'round';
          if (tempDraw) drawCtx.putImageData(tempDraw, 0, 0);
        }
        
        if (backgroundImage) {
          drawBackgroundImage(backgroundImage);
        } else {
          const ctx = bgCanvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []); // Initial mount and resize events

  useEffect(() => {
    if (backgroundImage) {
      drawBackgroundImage(backgroundImage);
    } else {
      const bgCanvas = bgCanvasRef.current;
      const ctx = bgCanvas?.getContext('2d');
      if (bgCanvas && ctx) {
        ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      }
    }
  }, [backgroundImage]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      if (state.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = state.color;
      }
      
      ctx.lineWidth = state.brushSize;
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
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
    <div ref={containerRef} className="w-full h-full bg-white rounded-xl shadow-inner relative overflow-hidden">
      {/* Background Layer */}
      <canvas
        ref={bgCanvasRef}
        className="absolute inset-0 pointer-events-none"
      />
      {/* Drawing Layer */}
      <canvas
        ref={drawCanvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="absolute inset-0 cursor-crosshair"
      />
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
