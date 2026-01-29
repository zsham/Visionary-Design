
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
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [shapeStart, setShapeStart] = useState<{ x: number, y: number } | null>(null);
  
  // Text Tool State
  const [textActive, setTextActive] = useState<{ x: number, y: number } | null>(null);
  const [textValue, setTextValue] = useState('');

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
      const previewCanvas = previewCanvasRef.current;
      if (container && drawCanvas && bgCanvas && previewCanvas) {
        const { clientWidth, clientHeight } = container;
        
        const tempCtx = drawCanvas.getContext('2d');
        let tempDrawData: ImageData | null = null;
        if (tempCtx && drawCanvas.width > 0 && drawCanvas.height > 0) {
          tempDrawData = tempCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
        }
        
        drawCanvas.width = clientWidth;
        drawCanvas.height = clientHeight;
        bgCanvas.width = clientWidth;
        bgCanvas.height = clientHeight;
        previewCanvas.width = clientWidth;
        previewCanvas.height = clientHeight;

        const drawCtx = drawCanvas.getContext('2d');
        if (drawCtx) {
          drawCtx.lineCap = 'round';
          drawCtx.lineJoin = 'round';
          if (tempDrawData) {
            drawCtx.putImageData(tempDrawData, 0, 0);
          }
        }
        
        if (backgroundImage) {
          drawBackgroundImage(backgroundImage);
        }
      }
    };

    const timer = setTimeout(resize, 50);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      clearTimeout(timer);
    };
  }, [state.aspectRatio]);

  useEffect(() => {
    if (backgroundImage) {
      drawBackgroundImage(backgroundImage);
    } else {
      const ctx = bgCanvasRef.current?.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, bgCanvasRef.current!.width, bgCanvasRef.current!.height);
    }
  }, [backgroundImage]);

  const commitText = () => {
    if (!textActive || !textValue.trim()) {
      setTextActive(null);
      setTextValue('');
      return;
    }

    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = state.color;
      ctx.font = `${state.isBold ? 'bold ' : ''}${state.fontSize}px ${state.fontFamily}`;
      ctx.textBaseline = 'top';
      
      const lines = textValue.split('\n');
      lines.forEach((line, i) => {
        ctx.fillText(line, textActive.x, textActive.y + (i * state.fontSize * 1.2));
      });
      
      ctx.restore();
      saveToHistory();
    }
    setTextActive(null);
    setTextValue('');
  };

  const floodFill = (startX: number, startY: number) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    const getPixel = (x: number, y: number) => {
      const i = (y * width + x) * 4;
      return (data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3];
    };

    const setPixel = (x: number, y: number, r: number, g: number, b: number, a: number) => {
      const i = (y * width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    };

    const hex = state.color.replace('#', '');
    const fillR = parseInt(hex.substring(0, 2), 16);
    const fillG = parseInt(hex.substring(2, 4), 16);
    const fillB = parseInt(hex.substring(4, 6), 16);
    const fillA = 255;
    const fillColor = (fillR << 24) | (fillG << 16) | (fillB << 8) | fillA;

    const targetColor = getPixel(startX, startY);

    if (targetColor === fillColor) return;

    const queue: [number, number][] = [[startX, startY]];
    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (getPixel(x, y) !== targetColor) continue;

      setPixel(x, y, fillR, fillG, fillB, fillA);
      queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
    saveToHistory();
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = drawCanvasRef.current!.getBoundingClientRect();
    const x = Math.round(('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left);
    const y = Math.round(('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top);

    if (state.tool === 'text') {
      if (textActive) commitText();
      setTextActive({ x, y });
      setTimeout(() => textInputRef.current?.focus(), 10);
      return;
    }

    if (state.tool === 'fill') {
      floodFill(x, y);
      return;
    }

    if (state.tool === 'rectangle' || state.tool === 'circle') {
      setIsDrawing(true);
      setShapeStart({ x, y });
      return;
    }

    setIsDrawing(true);
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
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
    const rect = drawCanvasRef.current!.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    if (state.tool === 'rectangle' || state.tool === 'circle') {
      const pCanvas = previewCanvasRef.current;
      const pCtx = pCanvas?.getContext('2d');
      if (pCtx && pCanvas && shapeStart) {
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
        pCtx.strokeStyle = state.color;
        pCtx.lineWidth = state.brushSize;
        pCtx.lineCap = 'round';
        pCtx.lineJoin = 'round';
        pCtx.setLineDash([5, 5]); // Dashed preview

        if (state.tool === 'rectangle') {
          pCtx.strokeRect(shapeStart.x, shapeStart.y, x - shapeStart.x, y - shapeStart.y);
        } else if (state.tool === 'circle') {
          const radiusX = Math.abs(x - shapeStart.x) / 2;
          const radiusY = Math.abs(y - shapeStart.y) / 2;
          const centerX = Math.min(x, shapeStart.x) + radiusX;
          const centerY = Math.min(y, shapeStart.y) + radiusY;
          pCtx.beginPath();
          pCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          pCtx.stroke();
        }
      }
      return;
    }

    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    if ((state.tool === 'rectangle' || state.tool === 'circle') && shapeStart) {
      const rect = drawCanvasRef.current!.getBoundingClientRect();
      const x = ('touches' in e) ? (e as React.TouchEvent).changedTouches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
      const y = ('touches' in e) ? (e as React.TouchEvent).changedTouches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
      
      const dCanvas = drawCanvasRef.current;
      const dCtx = dCanvas?.getContext('2d');
      const pCanvas = previewCanvasRef.current;
      const pCtx = pCanvas?.getContext('2d');

      if (dCtx && dCanvas) {
        dCtx.save();
        dCtx.globalCompositeOperation = 'source-over';
        dCtx.strokeStyle = state.color;
        dCtx.lineWidth = state.brushSize;
        dCtx.lineCap = 'round';
        dCtx.lineJoin = 'round';
        dCtx.setLineDash([]); // Solid committed shape

        if (state.tool === 'rectangle') {
          dCtx.strokeRect(shapeStart.x, shapeStart.y, x - shapeStart.x, y - shapeStart.y);
        } else if (state.tool === 'circle') {
          const radiusX = Math.abs(x - shapeStart.x) / 2;
          const radiusY = Math.abs(y - shapeStart.y) / 2;
          const centerX = Math.min(x, shapeStart.x) + radiusX;
          const centerY = Math.min(y, shapeStart.y) + radiusY;
          dCtx.beginPath();
          dCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          dCtx.stroke();
        }
        dCtx.restore();
        saveToHistory();
      }
      
      if (pCtx && pCanvas) {
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      }
      
      setShapeStart(null);
    }

    setIsDrawing(false);
    if (state.tool === 'pencil' || state.tool === 'eraser') {
      saveToHistory();
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-white rounded-xl shadow-inner relative overflow-hidden">
      <canvas ref={bgCanvasRef} className="absolute inset-0 pointer-events-none" />
      <canvas ref={drawCanvasRef} className="absolute inset-0 pointer-events-none" />
      <canvas
        ref={previewCanvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={(e) => isDrawing && stopDrawing(e)}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className={`absolute inset-0 ${state.tool === 'text' ? 'cursor-text' : state.tool === 'fill' ? 'cursor-alias' : 'cursor-crosshair'}`}
      />
      
      {/* Floating Text Input */}
      {textActive && (
        <div 
          className="absolute z-40 pointer-events-none"
          style={{ left: textActive.x, top: textActive.y }}
        >
          <textarea
            ref={textInputRef}
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={commitText}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) commitText(); }}
            className="bg-transparent border-none outline-none p-0 overflow-hidden pointer-events-auto resize-none"
            style={{
              color: state.color,
              fontFamily: state.fontFamily,
              fontSize: `${state.fontSize}px`,
              fontWeight: state.isBold ? 'bold' : 'normal',
              minWidth: '50px',
              minHeight: `${state.fontSize}px`,
              lineHeight: '1.2'
            }}
          />
        </div>
      )}
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
