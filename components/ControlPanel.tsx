
import React from 'react';
import { Tool, CanvasState } from '../types';

interface ControlPanelProps {
  state: CanvasState;
  setState: React.Dispatch<React.SetStateAction<CanvasState>>;
  onClear: () => void;
  onUndo: () => void;
  onDownload: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ state, setState, onClear, onUndo, onDownload }) => {
  const colors = [
    '#000000', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'
  ];

  const tools: { id: Tool; label: string; icon: string }[] = [
    { id: 'pencil', label: 'Pencil', icon: '✎' },
    { id: 'eraser', label: 'Eraser', icon: '⌫' },
  ];

  return (
    <div className="w-20 md:w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-8 h-full overflow-y-auto">
      <div className="hidden md:block">
        <h2 className="text-xl font-bold text-slate-800">Studio Tools</h2>
        <p className="text-xs text-slate-500 mt-1">Refine your project</p>
      </div>

      {/* Tools Section */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Main Tools</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setState(prev => ({ ...prev, tool: t.id }))}
              className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all ${
                state.tool === t.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-[10px] mt-1 font-medium hidden md:block">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brush Size */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Size</label>
        <input
          type="range"
          min="1"
          max="50"
          value={state.brushSize}
          onChange={(e) => setState(prev => ({ ...prev, brushSize: parseInt(e.target.value) }))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>1px</span>
          <span>{state.brushSize}px</span>
          <span>50px</span>
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Palette</label>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setState(prev => ({ ...prev, color: c, tool: 'pencil' }))}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                state.color === c && state.tool === 'pencil' ? 'border-blue-400 scale-110 ring-2 ring-blue-100' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto space-y-2">
        <button 
          onClick={onUndo}
          className="w-full py-2 px-4 rounded-lg bg-slate-100 text-slate-700 font-medium text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          <span>↩</span> <span className="hidden md:inline">Undo</span>
        </button>
        <button 
          onClick={onClear}
          className="w-full py-2 px-4 rounded-lg bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <span>🗑</span> <span className="hidden md:inline">Clear All</span>
        </button>
        <button 
          onClick={onDownload}
          className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>⬇</span> <span className="hidden md:inline">Download</span>
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
