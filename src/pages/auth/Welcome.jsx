import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, ShieldCheck, HeartPulse, Zap, Globe } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col p-6 relative overflow-hidden">
      {/* Premium Background Visuals */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/20 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] -ml-32 -mb-32 animate-pulse delay-1000"></div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
        <div className="mb-10 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full shadow-lg self-start animate-fade-in">
           <Zap className="text-teal-400 w-3 h-3 fill-teal-400" />
           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Official Campus Portal</span>
        </div>

        <div className="mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
           <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-teal-500/10">
              <Activity className="text-teal-400 w-8 h-8" />
           </div>
        </div>

        <h1 className="text-5xl font-black text-white leading-[1] tracking-tighter mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
           Future of <br/>
           <span className="text-teal-400">Campus Care.</span>
        </h1>

        <p className="text-slate-400 font-medium text-sm leading-relaxed mb-10 max-w-sm animate-fade-in" style={{ animationDelay: '300ms' }}>
           Experience UniHealth AI — the world's most advanced healthcare platform designed exclusively for university life.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
           <WelcomeFeature icon={<HeartPulse />} label="AI Diagnostics" />
           <WelcomeFeature icon={<ShieldCheck />} label="Secure Records" />
           <WelcomeFeature icon={<Globe />} label="Instant Support" />
           <WelcomeFeature icon={<Activity />} label="Wellness Sync" />
        </div>
      </div>

      <div className="w-full relative z-10 pb-4 animate-fade-in" style={{ animationDelay: '500ms' }}>
         <button 
             onClick={() => navigate('/onboarding/1')}
             className="w-full bg-teal-500 hover:bg-teal-400 active:scale-[0.98] text-slate-950 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-2 pressable mb-4"
         >
             Begin Journey <ArrowRight className="w-5 h-5" />
         </button>
         
         <button 
            onClick={() => navigate('/login')}
            className="w-full py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest flex justify-center pressable"
         >
            Already Registered? <span className="text-teal-400 ml-1">Log In</span>
         </button>
      </div>
    </div>
  );
}

function WelcomeFeature({ icon, label }) {
   return (
      <div className="flex items-center gap-2.5 p-3.5 bg-slate-900/60 rounded-[1.2rem] border border-slate-800 transition-colors">
         <div className="text-teal-400 w-4 h-4">{React.cloneElement(icon, { size: 16 })}</div>
         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</span>
      </div>
   );
}
