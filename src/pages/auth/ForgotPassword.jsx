import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Mail, ShieldAlert, CheckCircle2, Key, ChevronRight, Loader2, Sparkles } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post('/auth/forgot-password', { email });
      setSubmitted(true);
      setTimeout(() => navigate('/verify-otp', { state: { email, isReset: true } }), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "We couldn't locate that account. Please check the email address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[0%] left-[0%] w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 z-20">
        <button 
           onClick={() => navigate('/login')} 
           className="w-10 h-10 bg-slate-900/80 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors pressable backdrop-blur-md"
        >
            <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 z-10 mt-10">
        
        <div className="mb-10 animate-fade-in">
            <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-3xl flex items-center justify-center text-teal-400 mb-6 shadow-xl shadow-teal-500/10">
                <Key className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Access<br/>Recovery</h1>
            <p className="text-slate-400 font-medium text-sm">
                Lost your key? Enter your verified university email to receive a secure reset code.
            </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-6 flex items-start gap-3 text-xs font-bold animate-shake">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {submitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2rem] flex flex-col items-center text-center animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-[1.5rem] flex items-center justify-center shadow-sm mb-6 border border-emerald-500/30">
                   <CheckCircle2 className="text-emerald-400 w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white mb-2 tracking-tight">Transmission Sent!</h3>
                <p className="text-sm text-slate-400 font-medium mb-6">We've dispatched a unique 6-digit code to your academic mail.</p>
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                   Redirecting <Loader2 className="w-3 h-3 animate-spin" />
                </div>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Academic Identifier</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                        <input 
                            type="email" 
                            required 
                            placeholder="name@university.edu"
                            className="w-full bg-slate-900/60 border border-slate-700/60 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:border-teal-500 focus:bg-slate-800 transition-all"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                   type="submit" 
                   disabled={loading}
                   className="w-full mt-6 bg-teal-500 hover:bg-teal-400 active:scale-[0.98] text-slate-950 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-2 pressable disabled:opacity-50"
                >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Secure Reset Code <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                </button>
            </form>
        )}
      </div>
    </div>
  );
}
