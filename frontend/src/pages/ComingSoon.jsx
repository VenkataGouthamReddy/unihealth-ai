import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Clock, Construction, Zap } from 'lucide-react';

export default function ComingSoon({ title }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-400/5 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="glass-card p-12 md:p-16 rounded-[4rem] text-center border border-white/20 shadow-2xl relative overflow-hidden group">
          {/* Animated Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-tr from-slate-900 to-slate-800 p-6 rounded-3xl shadow-xl shadow-slate-900/20 animate-bounce-slow">
                <Construction className="w-10 h-10 text-teal-400" />
              </div>
            </div>

            <div className="space-y-4 mb-12">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 bg-teal-50 px-4 py-2 rounded-full">
                Feature Under Development
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                {title || 'Coming Soon'}
              </h1>
              <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-md mx-auto">
                We're crafting a premium AI experience for this feature. Our clinical experts and engineers are putting on the final touches.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-teal-600 transition-all active:scale-95 group/btn shadow-xl shadow-slate-900/20"
              >
                <ArrowLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" />
                <span>Go Back</span>
              </button>
              
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                <Clock size={14} className="text-teal-500" />
                <span>ETA: Coming in v2.0</span>
              </div>
            </div>

            {/* Feature Teasers */}
            <div className="mt-16 grid grid-cols-3 gap-4">
               <div className="p-4 rounded-2xl bg-white/50 border border-white/20">
                  <Sparkles className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">AI Insights</p>
               </div>
               <div className="p-4 rounded-2xl bg-white/50 border border-white/20">
                  <Zap className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Fast Sync</p>
               </div>
               <div className="p-4 rounded-2xl bg-white/50 border border-white/20">
                  <div className="w-5 h-5 bg-teal-500 rounded-full mx-auto mb-2 animate-pulse"></div>
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Real-time</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
