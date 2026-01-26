
import React, { useState, useRef, useEffect } from 'react';
import DrawingCanvas, { DrawingCanvasHandle } from './components/DrawingCanvas';
import ControlPanel from './components/ControlPanel';
import AIInsights from './components/AIInsights';
import AuthModal from './components/AuthModal';
import { CanvasState, User } from './types';

const App: React.FC = () => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    color: '#0f172a',
    brushSize: 4,
    tool: 'pencil'
  });
  
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('visionary_session');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleDownload = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.getImageData();
      const link = document.createElement('a');
      link.download = `Visionary-${new Date().toISOString().slice(0,10)}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleReset = () => {
    if (window.confirm('Wipe current workspace? This cannot be undone.')) {
      canvasRef.current?.clear();
      setBgImage(null);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('visionary_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('visionary_session');
  };

  const handleBackgroundGenerated = (url: string) => {
    setBgImage(url);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden selection:bg-indigo-100">
      {/* Precision Header */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-slate-900 rounded-md flex items-center justify-center text-white font-black text-sm tracking-tighter">
              VD
            </div>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight hidden sm:block uppercase">Visionary Design</h1>
          </div>
          
          <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Project: {currentUser ? `${currentUser.name}'s Studio` : 'Sandbox'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 pl-4">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold text-slate-900">{currentUser.name}</span>
                <button 
                  onClick={handleLogout}
                  className="text-[9px] font-extrabold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                >
                  Log out
                </button>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold border-2 border-slate-100 shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-indigo-100 transform active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        <ControlPanel 
          state={canvasState} 
          setState={setCanvasState}
          onClear={() => canvasRef.current?.clear()}
          onUndo={() => canvasRef.current?.undo()}
          onDownload={handleDownload}
          onReset={handleReset}
        />

        {/* Studio Canvas */}
        <main className="flex-1 p-4 md:p-12 design-grid relative overflow-hidden flex items-center justify-center">
          <div className="w-full h-full max-w-6xl aspect-[16/9] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden bg-white border border-slate-200 relative group transition-all duration-500">
            <DrawingCanvas 
              ref={canvasRef} 
              state={canvasState} 
              backgroundImage={bgImage}
            />
            
            {/* Status Overlays */}
            <div className="absolute top-4 right-4 flex gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <div className="px-3 py-1.5 bg-slate-900/90 text-white text-[10px] font-bold rounded-full backdrop-blur-md">
                 {canvasState.brushSize}px • {canvasState.tool.toUpperCase()}
               </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-200 px-4 py-1.5 rounded-full text-[10px] font-extrabold text-slate-500 tracking-wider shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
              WORKSPACE ACTIVE • PRESS SHIFT FOR PRECISION
            </div>
          </div>
        </main>

        <AIInsights 
          onAnalyze={() => canvasRef.current?.getImageData() || ''} 
          onBackgroundGenerated={handleBackgroundGenerated}
        />
      </div>

      {/* Command Bar / Status Bar */}
      <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between z-30">
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Engine Connected</span>
          </div>
          <div className="h-3 w-px bg-slate-200"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Layer: 01 (Drawing)</span>
        </div>
        
        <div className="flex items-center gap-1 group cursor-help">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] group-hover:text-indigo-600 transition-colors">Gemini Flash Core v2.5</span>
        </div>
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin}
      />
    </div>
  );
};

export default App;
