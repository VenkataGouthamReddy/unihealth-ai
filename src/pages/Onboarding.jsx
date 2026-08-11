import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import { ArrowRight, Activity as ActivityIcon, Shield as ShieldIcon, Zap as ZapIcon } from 'lucide-react';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { registerStepHandler, unregisterStepHandler } = useNavigation();

  useEffect(() => {
    registerStepHandler('onboarding', () => step > 1, () => setStep((s) => s - 1));
    return () => unregisterStepHandler('onboarding');
  }, [step, registerStepHandler, unregisterStepHandler]);

  const slides = [
    {
      title: "Smart Symptom Analysis",
      desc: "Our AI core analyzes your symptoms in real-time to provide clinical-grade insights.",
      icon: <ActivityIcon size={48} />,
      color: "from-teal-600 to-emerald-500"
    },
    {
      title: "Secure Health Vault",
      desc: "End-to-end encrypted medical records accessible only by you and your doctor.",
      icon: <ShieldIcon size={48} />,
      color: "from-blue-600 to-indigo-500"
    },
    {
      title: "Instant Campus Care",
      desc: "Book appointments and get medical alerts directly from your campus health center.",
      icon: <ZapIcon size={48} />,
      color: "from-rose-600 to-orange-500"
    }
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else navigate('/register');
  };

  const currentSlide = slides[step - 1];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-br ${currentSlide.color} mx-auto mb-12 flex items-center justify-center text-white shadow-2xl animate-in zoom-in duration-500`}>
          {currentSlide.icon}
        </div>
        
        <div className="space-y-4 mb-16 animate-in slide-in-from-bottom-10 duration-700">
            <h1 className="text-4xl font-black text-white tracking-tight">{currentSlide.title}</h1>
            <p className="text-slate-400 font-medium leading-relaxed">{currentSlide.desc}</p>
        </div>

        <div className="flex justify-center space-x-2 mb-12">
            {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-teal-400' : 'w-2 bg-slate-800'}`}></div>
            ))}
        </div>

        <button 
            onClick={handleNext}
            className={`w-full py-5 rounded-[2rem] bg-teal-500 text-slate-950 font-black text-lg flex items-center justify-center space-x-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-teal-500/20`}
        >
            <span>{step === 3 ? 'Get Started' : 'Continue'}</span>
            <ArrowRight size={20} />
        </button>

        <button 
            onClick={() => navigate('/login')}
            className="mt-8 text-slate-400 font-bold uppercase text-xs tracking-widest hover:text-teal-400 transition-colors"
        >
            Skip to Login
        </button>
      </div>
    </div>
  );
}

