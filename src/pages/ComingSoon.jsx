import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Clock, Construction, Zap } from 'lucide-react';

export default function ComingSoon({ title }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/20 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse pointer-events-none"></div>
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center">
        <button 
           onClick={() => navigate(-1)} 
           className="w-10 h-10 bg-slate-900/80 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors pressable backdrop-blur-md"
        >
            <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10 mt-10">
        <div className="flex flex-col items-center text-center animate-fade-in">
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-teal-500 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-slate-900/80 border border-slate-700/60 rounded-3xl flex items-center justify-center shadow-xl shadow-teal-500/10 backdrop-blur-md">
                <Construction className="w-10 h-10 text-teal-400" />
              </div>
            </div>

            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-full mb-4">
              Feature Under Development
            </span>
            
            <h1 className="text-4xl font-black text-white tracking-tight mb-4">
              {title || 'Coming Soon'}
            </h1>
            
            <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-sm mb-10">
              We're crafting a premium AI experience for this feature. Our clinical experts and engineers are putting on the final touches.
            </p>

            <div className="flex items-center space-x-2 text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-900/60 px-5 py-3 rounded-2xl border border-slate-700/60 shadow-inner">
              <Clock size={14} className="text-teal-400" />
              <span>ETA: Coming in v2.0</span>
            </div>
        </div>

        {/* Feature Teasers */}
        <div className="mt-12 grid grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="p-4 rounded-[1.5rem] bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400 mb-2" />
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">AI Insights</p>
            </div>
            <div className="p-4 rounded-[1.5rem] bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center">
                <Zap className="w-5 h-5 text-blue-400 mb-2" />
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Fast Sync</p>
            </div>
            <div className="p-4 rounded-[1.5rem] bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center">
                <div className="w-5 h-5 bg-teal-500 rounded-full mb-2 animate-pulse shadow-lg shadow-teal-500/50"></div>
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Real-time</p>
            </div>
        </div>
      </div>
    </div>
  );
}
