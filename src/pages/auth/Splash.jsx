import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Sparkles } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/welcome');
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-[100dvh] bg-slate-950 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-500/20 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px] animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
         <div className="relative mb-10">
            <div className="absolute inset-0 bg-teal-500 rounded-[2.5rem] blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-teal-400 to-cyan-500 p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in spin-in-12 duration-1000">
               <Activity className="text-slate-950 w-16 h-16" />
            </div>
            <div className="absolute -top-3 -right-3 bg-slate-900 p-2 rounded-xl shadow-xl animate-bounce border border-slate-800">
               <Sparkles className="text-amber-400 w-4 h-4" />
            </div>
         </div>
         
         <div className="text-center animate-in slide-in-from-bottom-10 duration-1000 delay-500">
            <h1 className="text-4xl font-black text-white tracking-tighter mb-3">
               UniHealth <span className="text-teal-400">AI</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">Initializing Core</span>
               <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"></div>
               </div>
            </div>
         </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-10 flex flex-col items-center gap-3 animate-fade-in delay-1000">
         <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-full border border-slate-800 backdrop-blur-md">
            <ShieldCheck className="text-teal-400 w-3.5 h-3.5" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Enterprise Health Security</span>
         </div>
         <p className="text-slate-600 font-bold text-[8px] uppercase tracking-[0.2em]">
            © 2026 UniHealth AI
         </p>
      </div>
    </div>
  );
}
