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
      await axios.post('http://127.0.0.1:8000/auth/forgot-password', { email });
      setSubmitted(true);
      setTimeout(() => navigate('/verify-otp', { state: { email, isReset: true } }), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "We couldn't locate that account. Please check the email address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Premium background particles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -ml-48 -mt-48 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -mr-48 -mb-48"></div>

      <div className="max-w-md w-full relative z-10">
        <button 
           onClick={() => navigate('/login')} 
           className="group flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-black uppercase text-[10px] tracking-[0.2em] mb-12"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Portal</span>
        </button>

        <div className="card-premium p-10 bg-white shadow-2xl border-white">
            <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-primary mb-8 shadow-inner border border-slate-100">
                <Key className="w-10 h-10" />
            </div>

            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Access Recovery</h1>
            <p className="text-slate-500 font-medium leading-relaxed mb-10 text-sm">
                Lost your key? Enter your verified university email and we'll dispatch a secure reset code to your inbox.
            </p>

            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 mb-8 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                <ShieldAlert className="w-4 h-4" /> {error}
              </div>
            )}

            {submitted ? (
                <div className="bg-emerald-50/50 border border-emerald-100 p-8 rounded-[2rem] flex flex-col items-center text-center animate-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                       <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-emerald-900 mb-2 tracking-tight">Transmission Sent!</h3>
                    <p className="text-sm text-emerald-600/80 font-medium mb-6">We've dispatched a unique 6-digit code to your academic mail. Verifying now...</p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                       Redirecting <div className="flex gap-1"><div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce"></div><div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce delay-75"></div><div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce delay-150"></div></div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Academic Identifier</label>
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                            <input 
                                type="email" 
                                required 
                                placeholder="name@university.edu"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold focus:ring-8 focus:ring-primary/5 focus:bg-white focus:border-primary transition-all outline-none"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                       type="submit" 
                       disabled={loading}
                       className="btn-premium bg-slate-900 text-white w-full py-5 hover:bg-primary shadow-2xl flex items-center justify-center gap-2 group transition-all"
                    >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Secure Reset Code <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                    </button>
                    
                    <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 backdrop-blur-sm">
                       <ShieldAlert className="text-primary w-5 h-5 shrink-0" />
                       <p className="text-[10px] font-bold text-blue-800/60 leading-relaxed uppercase tracking-widest">
                          AES-256 military-grade encryption is active for this transmission.
                       </p>
                    </div>
                </form>
            )}
        </div>
      </div>
      
      <div className="mt-12 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">
         <Sparkles className="w-3 h-3 text-primary" /> Multi-factor Authentication Protocol
      </div>
    </div>
  );
}
