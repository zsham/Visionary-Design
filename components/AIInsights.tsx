
import React, { useState } from 'react';
import { analyzeSketch, generateBackgroundImage } from '../services/gemini';
import { AIResponse } from '../types';

interface AIInsightsProps {
  onAnalyze: () => string;
  onBackgroundGenerated: (url: string) => void;
}

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>
);

const AIInsights: React.FC<AIInsightsProps> = ({ onAnalyze, onBackgroundGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<AIResponse | null>(null);
  const [bgPrompt, setBgPrompt] = useState('');

  const handleAnalyze = async () => {
    const imageData = onAnalyze();
    if (!imageData) return;
    setLoading(true);
    try {
      const result = await analyzeSketch(imageData);
      setInsight(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBg = async () => {
    if (!bgPrompt) return;
    setLoading(true);
    try {
      const url = await generateBackgroundImage(bgPrompt);
      if (url) onBackgroundGenerated(url);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:w-[340px] bg-slate-50 border-l border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="px-6 py-6 border-b border-slate-200 bg-white">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2.5 uppercase tracking-wider">
          <span className="text-indigo-600 bg-indigo-50 p-1.5 rounded-lg"><SparkleIcon /></span>
          Design Intelligence
        </h3>
        <p className="text-[11px] text-slate-500 font-medium mt-1.5 ml-9">Gemini AI Creative Co-pilot</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Analysis Section */}
        <section className="space-y-4">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 group ${
              loading 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </span>
            ) : 'Analyze Composition'}
          </button>

          {insight && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-3">Professional Insight</label>
                <p className="text-[13px] text-slate-600 leading-[1.6] font-medium">{insight.analysis}</p>
              </div>

              <div className="bg-indigo-900 p-5 rounded-2xl shadow-xl shadow-indigo-100">
                <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block mb-4">Strategic Steps</label>
                <ul className="space-y-3">
                  {insight.suggestions.map((s, i) => (
                    <li key={i} className="text-[12px] text-indigo-50 flex gap-3 leading-snug">
                      <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span> 
                      <span className="font-medium opacity-90">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        <div className="h-px bg-slate-200"></div>

        {/* Concept Generation Section */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Environment Engine</label>
            <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">BETA</span>
          </div>
          
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={bgPrompt}
                onChange={(e) => setBgPrompt(e.target.value)}
                placeholder="Ex: Minimalist brutalist architecture, dusk lighting, 8k..."
                className="w-full p-4 text-[13px] font-medium rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none resize-none h-28 bg-white transition-all placeholder:text-slate-400 placeholder:italic"
              />
            </div>
            
            <button
              onClick={handleGenerateBg}
              disabled={loading || !bgPrompt}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                loading || !bgPrompt 
                ? 'bg-slate-100 text-slate-300' 
                : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-lg shadow-sm'
              }`}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              Generate Context
            </button>
          </div>
        </section>
      </div>

      {/* Panel Footer */}
      <div className="px-6 py-4 border-t border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-center gap-2">
          <div className="flex -space-x-1.5">
            {[1,2,3].map(i => (
              <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                <div className={`w-full h-full ${['bg-blue-400', 'bg-indigo-400', 'bg-slate-400'][i-1]}`}></div>
              </div>
            ))}
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Visionary Design 1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
