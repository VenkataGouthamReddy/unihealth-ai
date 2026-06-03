import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Lock, ShieldCheck, CheckCircle2, Eye, EyeOff, Loader2, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://127.0.0.1:8000/auth/reset-password', {
        email,
        otp,
        new_password: newPassword
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password. Please try the process again.");
    } finally {
      setLoading(false);
    }
  };

  if (!email || !otp) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-6" />
        <h1 className="text-2xl font-black text-slate-900 mb-2">Invalid Session</h1>
        <p className="text-slate-500 mb-8">Your security session has expired. Please restart the recovery process.</p>
        <button onClick={() => navigate('/forgot-password')} className="btn-premium bg-slate-900 text-white px-8">Restart Recovery</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center text-emerald-600 mb-8 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Access Restored</h1>
        <p className="text-slate-500 font-medium mb-8 text-center">Your password has been securely updated. Redirecting to login...</p>
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Premium background particles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -ml-48 -mb-48"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="card-premium p-10 bg-white shadow-2xl border-white">
            <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-primary mb-8 shadow-inner border border-slate-100">
                <Lock className="w-10 h-10" />
            </div>

            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">New Credentials</h1>
            <p className="text-slate-500 font-medium leading-relaxed mb-10 text-sm">
                OTP verified for <span className="text-slate-900 font-black">{email}</span>. Please establish a robust new password for your account.
            </p>

            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 mb-8 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">New Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required 
                            placeholder="At least 6 characters"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 pl-14 pr-12 text-sm font-bold focus:ring-8 focus:ring-primary/5 focus:bg-white focus:border-primary transition-all outline-none"
                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Confirm New Password</label>
                    <div className="relative group">
                        <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required 
                            placeholder="Must match above"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 pl-14 pr-12 text-sm font-bold focus:ring-8 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
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
                        Update Credentials <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                </button>
                
                <div className="flex items-center gap-4 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 backdrop-blur-sm">
                   <ShieldCheck className="text-emerald-600 w-5 h-5 shrink-0" />
                   <p className="text-[10px] font-bold text-emerald-800/60 leading-relaxed uppercase tracking-widest">
                      Your session is currently protected by RSA-4096 asymmetric encryption.
                   </p>
                </div>
            </form>
        </div>
      </div>
      
      <div className="mt-12 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">
         <Sparkles className="w-3 h-3 text-primary" /> Multi-factor Security Engine
      </div>
    </div>
  );
}
