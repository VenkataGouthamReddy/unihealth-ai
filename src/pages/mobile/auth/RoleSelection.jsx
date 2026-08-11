import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Stethoscope, ShieldCheck, ArrowRight } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none -mt-32 -mr-32"></div>

      <div className="flex-1 flex flex-col justify-center relative z-10 mt-10">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Choose<br/>Portal</h1>
          <p className="text-slate-400 font-medium text-sm leading-relaxed">
              Select your role to access personalized campus tools and resources.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <RoleCard 
                icon={<GraduationCap size={24} />} 
                title="Student" 
                desc="Access health insights and book appointments."
                color="teal"
                onClick={() => navigate('/student')}
            />
            <RoleCard 
                icon={<Stethoscope size={24} />} 
                title="Doctor" 
                desc="Manage your patients and clinical schedule."
                color="indigo"
                onClick={() => navigate('/doctor')}
            />
            <RoleCard 
                icon={<ShieldCheck size={24} />} 
                title="Admin" 
                desc="Configure system health and analytics."
                color="rose"
                onClick={() => navigate('/admin')}
            />
        </div>

        <button 
            onClick={() => navigate('/login')}
            className="mt-12 py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest pressable w-full text-center"
        >
            Switch Account
        </button>
      </div>
    </div>
  );
}

function RoleCard({ icon, title, desc, color, onClick }) {
    const colors = {
        teal: "bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500/20",
        indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20",
        rose: "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
    };

    return (
        <div 
            onClick={onClick}
            className={`p-5 rounded-[2rem] border transition-all duration-300 flex items-center gap-4 pressable ${colors[color]}`}
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white/5`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-white">{title}</h3>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed truncate">{desc}</p>
            </div>
            <ArrowRight size={18} className="opacity-50 flex-shrink-0" />
        </div>
    )
}
