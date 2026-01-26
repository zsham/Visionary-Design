
import React, { useState } from 'react';
import { analyzeSketch, generateBackgroundImage } from '../services/gemini';
import { AIResponse } from '../types';

interface AIInsightsProps {
  onAnalyze: () => string;
  onBackgroundGenerated: (url: string) => void;
}

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
    <div className="w-full md:w-80 bg-slate-50 border-l border-slate-200 p-6 flex flex-col gap-6 h-full overflow-y-auto">
      <div>
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="text-blue-600">✦</span> AI Creative Studio
        </h3>
        <p className="text-xs text-slate-500 mt-1">Let Gemini enhance your vision</p>
      </div>

      {/* Analysis Trigger */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
          loading 
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-200'
        }`}
      >
        {loading ? 'Thinking...' : 'Analyze Current Sketch'}
      </button>

      {/* Analysis Results */}
      {insight && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div>
            <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-2">Analysis</label>
            <p className="text-sm text-slate-600 leading-relaxed">{insight.analysis}</p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-2">AI Suggestions</label>
            <ul className="space-y-2">
              {insight.suggestions.map((s, i) => (
                <li key={i} className="text-xs text-slate-600 flex gap-2">
                  <span className="text-indigo-400">•</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <hr className="border-slate-200" />

      {/* Background Generator */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Magic Background</label>
        <textarea
          value={bgPrompt}
          onChange={(e) => setBgPrompt(e.target.value)}
          placeholder="Describe a background mood or setting..."
          className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none h-24 bg-white"
        />
        <button
          onClick={handleGenerateBg}
          disabled={loading || !bgPrompt}
          className="w-full py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Generate Concept Art
        </button>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-200">
        <p className="text-[10px] text-slate-400 text-center">
          Powered by Gemini 3 Flash & 2.5 Image
        </p>
      </div>
    </div>
  );
};

export default AIInsights;
