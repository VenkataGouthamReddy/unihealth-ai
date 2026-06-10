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
    <div className="h-screen bg-slate-900 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
         <div className="relative mb-12">
            <div className="absolute inset-0 bg-primary rounded-[3rem] blur-2xl opacity-40 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-primary to-emerald-500 p-10 rounded-[3rem] shadow-2xl animate-in zoom-in spin-in-12 duration-1000">
               <Activity className="text-white w-20 h-20" />
            </div>
            <div className="absolute -top-4 -right-4 bg-white p-2 rounded-xl shadow-xl animate-bounce">
               <Sparkles className="text-amber-500 w-5 h-5" />
            </div>
         </div>
         
         <div className="text-center animate-in slide-in-from-bottom-10 duration-1000 delay-500">
            <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
               UniHealth <span className="text-primary">AI</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
               <span className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] ml-2">Initializing Core</span>
               <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
               </div>
            </div>
         </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-12 flex flex-col items-center gap-4 animate-fade-in delay-1000">
         <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
            <ShieldCheck className="text-emerald-500 w-4 h-4" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Health Security</span>
         </div>
         <p className="text-slate-600 font-bold text-[10px] uppercase tracking-[0.3em]">
            © 2026 UniHealth Technology Group
         </p>
      </div>
    </div>
  );
}
