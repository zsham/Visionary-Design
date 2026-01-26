
import React, { useState, useRef, useEffect } from 'react';
import DrawingCanvas, { DrawingCanvasHandle } from './components/DrawingCanvas';
import ControlPanel from './components/ControlPanel';
import AIInsights from './components/AIInsights';
import AuthModal from './components/AuthModal';
import { CanvasState, User } from './types';

const App: React.FC = () => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    color: '#000000',
    brushSize: 5,
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
      link.download = 'visionary-design.png';
      link.href = dataUrl;
      link.click();
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
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
            V
          </div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight hidden sm:block">Visionary Design</h1>
        </div>
        
        <div className="flex items-center gap-4">
           <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full hidden md:inline-block">
            {currentUser ? `Project: ${currentUser.name}'s Canvas` : 'Guest Mode'}
          </span>

          {currentUser ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-700 leading-none">{currentUser.name}</span>
                <button 
                  onClick={handleLogout}
                  className="text-[10px] font-semibold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
                >
                  Sign Out
                </button>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-sm">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-blue-100 transform active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Toolbar */}
        <ControlPanel 
          state={canvasState} 
          setState={setCanvasState}
          onClear={() => canvasRef.current?.clear()}
          onUndo={() => canvasRef.current?.undo()}
          onDownload={handleDownload}
        />

        {/* Canvas Area */}
        <main className="flex-1 p-4 md:p-8 bg-slate-100 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 min-h-0 relative group">
            <DrawingCanvas 
              ref={canvasRef} 
              state={canvasState} 
              backgroundImage={bgImage}
            />
            {/* Tooltip hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-[10px] px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Shift + Sketch for straighter lines
            </div>
          </div>
        </main>

        {/* Right AI Sidebar */}
        <AIInsights 
          onAnalyze={() => canvasRef.current?.getImageData() || ''} 
          onBackgroundGenerated={handleBackgroundGenerated}
        />
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin}
      />

      {/* Status Bar */}
      <footer className="h-8 bg-white border-t border-slate-200 px-4 flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
        <div className="flex gap-4">
          <span>{canvasState.tool} tool active</span>
          <span>{canvasState.brushSize}px size</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span>AI Systems Online</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
