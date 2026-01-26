
import React, { useRef } from 'react';
import { Tool, CanvasState, AspectRatio } from '../types';

interface ControlPanelProps {
  state: CanvasState;
  setState: React.Dispatch<React.SetStateAction<CanvasState>>;
  onClear: () => void;
  onUndo: () => void;
  onDownload: () => void;
  onReset: () => void;
}

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
);

const EraserIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L22 11L20 20Z"></path><path d="M17 17L7 7"></path></svg>
);

const TextIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
);

const FrameIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
);

const ControlPanel: React.FC<ControlPanelProps> = ({ state, setState, onClear, onUndo, onDownload, onReset }) => {
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  const presets = [
    '#0f172a', '#e11d48', '#f59e0b', '#10b981', '#2563eb', '#7c3aed', '#db2777', '#64748b'
  ];

  const aspectRatios: { label: string; value: AspectRatio }[] = [
    { label: '1:1', value: '1:1' },
    { label: '16:9', value: '16:9' },
    { label: '4:3', value: '4:3' },
    { label: '9:16', value: '9:16' },
    { label: '3:2', value: '3:2' },
  ];

  const isCustomColor = !presets.includes(state.color.toLowerCase());

  const handleCustomColorClick = () => {
    colorInputRef.current?.click();
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, color: e.target.value, tool: 'pencil' }));
  };

  return (
    <div className="w-16 md:w-64 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Tool Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-6 space-y-8">
        {/* Tool Selector */}
        <section>
          <label className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Studio Tools</label>
          <div className="flex flex-col md:grid md:grid-cols-3 gap-2">
            <button
              onClick={() => setState(prev => ({ ...prev, tool: 'pencil' }))}
              className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
                state.tool === 'pencil' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
              title="Draw (P)"
            >
              <PencilIcon />
              <span className="text-[9px] mt-2 font-bold hidden md:block uppercase tracking-tighter">Draw</span>
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, tool: 'eraser' }))}
              className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
                state.tool === 'eraser' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
              title="Erase (E)"
            >
              <EraserIcon />
              <span className="text-[9px] mt-2 font-bold hidden md:block uppercase tracking-tighter">Erase</span>
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, tool: 'text' }))}
              className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
                state.tool === 'text' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
              title="Type (T)"
            >
              <TextIcon />
              <span className="text-[9px] mt-2 font-bold hidden md:block uppercase tracking-tighter">Type</span>
            </button>
          </div>
        </section>

        {/* Canvas Frame Configuration */}
        <section className="hidden md:block">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-1 flex items-center gap-2">
            <FrameIcon />
            Frame Layout
          </label>
          <div className="grid grid-cols-2 gap-2">
            {aspectRatios.map((ar) => (
              <button
                key={ar.value}
                onClick={() => setState(prev => ({ ...prev, aspectRatio: ar.value }))}
                className={`py-2 rounded-lg border text-[10px] font-bold transition-all ${
                  state.aspectRatio === ar.value 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </section>

        {/* Dynamic Context Settings */}
        {state.tool === 'text' ? (
          <section className="hidden md:block space-y-4 animate-in fade-in slide-in-from-left-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 block px-1">Typography</label>
              <div className="space-y-2">
                <select 
                  value={state.fontFamily}
                  onChange={(e) => setState(prev => ({ ...prev, fontFamily: e.target.value as any }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400"
                >
                  <option value="Inter">Sans (Inter)</option>
                  <option value="Georgia">Serif (Georgia)</option>
                  <option value="monospace">Mono (Source)</option>
                </select>
                <button
                  onClick={() => setState(prev => ({ ...prev, isBold: !prev.isBold }))}
                  className={`w-full py-2 rounded-lg border text-xs font-bold transition-all ${
                    state.isBold ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Bold Weight
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 block px-1">Font Size</label>
              <input
                type="range"
                min="12"
                max="120"
                value={state.fontSize}
                onChange={(e) => setState(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
                <span>{state.fontSize}px</span>
              </div>
            </div>
          </section>
        ) : (
          <section className="hidden md:block">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Brush Weight</label>
            <div className="px-1 pt-2">
              <input
                type="range"
                min="1"
                max="60"
                value={state.brushSize}
                onChange={(e) => setState(prev => ({ ...prev, brushSize: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-3 font-medium">
                <span>Thin</span>
                <span className="text-slate-900 bg-slate-100 px-1.5 rounded">{state.brushSize}px</span>
                <span>Bold</span>
              </div>
            </div>
          </section>
        )}

        {/* Color Palette */}
        <section>
          <label className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Global Color</label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
            {presets.map((c) => (
              <button
                key={c}
                onClick={() => setState(prev => ({ ...prev, color: c }))}
                className={`w-8 h-8 md:w-full aspect-square rounded-full md:rounded-lg transition-all duration-200 hover:scale-110 border-2 ${
                  state.color.toLowerCase() === c.toLowerCase()
                  ? 'border-indigo-500 ring-4 ring-indigo-50' 
                  : 'border-white md:border-transparent shadow-sm md:shadow-none'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
            
            <div className="relative group">
              <input 
                ref={colorInputRef}
                type="color" 
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer pointer-events-none"
                onChange={handleColorChange}
                value={state.color}
              />
              <button
                onClick={handleCustomColorClick}
                className={`w-8 h-8 md:w-full aspect-square rounded-full md:rounded-lg transition-all duration-200 hover:scale-105 border-2 flex items-center justify-center group-hover:shadow-md ${
                  isCustomColor
                  ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-sm' 
                  : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
                style={isCustomColor ? { backgroundColor: state.color } : {}}
                title="Custom Color"
              >
                {!isCustomColor && <span className="text-lg font-light leading-none">+</span>}
                {isCustomColor && <span className="w-1 h-1 rounded-full bg-white shadow-sm opacity-50"></span>}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-slate-50/50 border-t border-slate-200 space-y-2">
        <div className="flex gap-2">
          <button 
            onClick={onUndo}
            className="flex-1 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <span className="text-xs font-bold">Undo</span>
          </button>
          <button 
            onClick={onClear}
            className="flex-1 py-2.5 rounded-lg bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-95 shadow-sm"
          >
            <span className="text-xs font-bold">Clear</span>
          </button>
        </div>
        
        <button 
          onClick={onReset}
          className="w-full py-2.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-md"
        >
          Reset Studio
        </button>

        <button 
          onClick={onDownload}
          className="w-full py-3 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span className="hidden md:inline">Export Design</span>
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
