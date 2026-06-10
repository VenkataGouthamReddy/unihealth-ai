import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Stethoscope, ShieldCheck, ArrowRight } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Choose Your Portal</h1>
        <p className="text-slate-500 font-medium leading-relaxed mb-16">
            Select your professional role to access personalized campus tools and resources.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <RoleCard 
                icon={<GraduationCap size={40} />} 
                title="Student" 
                desc="Access health insights and book appointments."
                color="teal"
                onClick={() => navigate('/student')}
            />
            <RoleCard 
                icon={<Stethoscope size={40} />} 
                title="Doctor" 
                desc="Manage your patients and clinical schedule."
                color="indigo"
                onClick={() => navigate('/doctor')}
            />
            <RoleCard 
                icon={<ShieldCheck size={40} />} 
                title="Admin" 
                desc="Configure system health and analytics."
                color="rose"
                onClick={() => navigate('/admin')}
            />
        </div>

        <button 
            onClick={() => navigate('/login')}
            className="mt-16 text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] hover:text-slate-900 transition-colors"
        >
            Switch Account
        </button>
      </div>
    </div>
  );
}

function RoleCard({ icon, title, desc, color, onClick }) {
    const colors = {
        teal: "bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white border-teal-100",
        indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border-indigo-100",
        rose: "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border-rose-100"
    };

    return (
        <div 
            onClick={onClick}
            className={`p-10 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 group shadow-sm hover:shadow-2xl hover:-translate-y-2 ${colors[color]}`}
        >
            <div className="mb-8 transform group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <h3 className="text-2xl font-black mb-2">{title}</h3>
            <p className="text-sm opacity-60 font-medium leading-relaxed">{desc}</p>
            <div className="mt-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={20} />
            </div>
        </div>
    )
}
