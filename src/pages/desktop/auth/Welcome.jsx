import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, ShieldCheck, HeartPulse, Zap, Globe } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Premium Background Visuals */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] -ml-48 -mb-48 animate-pulse delay-1000"></div>

      <div className="max-w-xl w-full text-center relative z-10">
        <div className="mb-12 inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm animate-in slide-in-from-top-4 duration-700">
           <Zap className="text-amber-500 w-4 h-4 fill-amber-500" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Official Campus Portal</span>
        </div>

        <div className="mb-8 flex justify-center">
           <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
              <div className="relative bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-50">
                 <Activity className="text-primary w-12 h-12" />
              </div>
           </div>
        </div>

        <h1 className="text-6xl font-black text-slate-900 leading-[0.95] tracking-tighter mb-8 animate-in fade-in duration-1000">
           Future of <br/>
           <span className="text-primary">Campus Care.</span>
        </h1>

        <p className="text-slate-500 font-medium text-lg leading-relaxed mb-12 max-w-sm mx-auto">
           Experience UniHealth AI — the world's most advanced healthcare platform designed exclusively for university life.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-12">
           <WelcomeFeature icon={<HeartPulse />} label="AI Diagnostics" />
           <WelcomeFeature icon={<ShieldCheck />} label="Secure Records" />
           <WelcomeFeature icon={<Globe />} label="Instant Support" />
           <WelcomeFeature icon={<Activity />} label="Wellness Sync" />
        </div>

        <div className="space-y-4">
           <button 
               onClick={() => navigate('/onboarding/1')}
               className="w-full btn-premium bg-slate-900 text-white py-6 text-lg hover:bg-primary shadow-2xl flex items-center justify-center gap-3 group"
           >
               Begin Journey <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
           </button>
           
           <button 
              onClick={() => navigate('/login')}
              className="w-full py-4 text-slate-500 font-black uppercase text-xs tracking-widest hover:text-slate-900 transition-colors"
           >
              Already Registered? <span className="text-primary hover:underline">Log In</span>
           </button>
        </div>

        <div className="mt-16 flex items-center justify-center gap-4 text-slate-300">
           <div className="h-[1px] w-12 bg-slate-100"></div>
           <div className="text-[10px] font-bold uppercase tracking-widest">Trusted by 50+ Universities</div>
           <div className="h-[1px] w-12 bg-slate-100"></div>
        </div>
      </div>
    </div>
  );
}

function WelcomeFeature({ icon, label }) {
   return (
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-white transition-all cursor-default group">
         <div className="text-primary group-hover:scale-110 transition-transform w-5 h-5">{icon}</div>
         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
   );
}
