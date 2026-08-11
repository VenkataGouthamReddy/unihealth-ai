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
      await axios.post('/auth/reset-password', {
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
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-8 text-center bg-slate-950">
        <AlertCircle className="w-16 h-16 text-rose-400 mb-6" />
        <h1 className="text-2xl font-black text-white mb-2">Invalid Session</h1>
        <p className="text-slate-400 mb-8 text-sm">Your security session has expired. Please restart the recovery process.</p>
        <button onClick={() => navigate('/forgot-password')} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest pressable">Restart Recovery</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] flex items-center justify-center text-emerald-400 mb-8 animate-bounce shadow-xl shadow-emerald-500/10">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Access Restored</h1>
        <p className="text-slate-400 font-medium mb-8 text-center text-sm">Your password has been securely updated. Redirecting to login...</p>
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[0%] right-[0%] w-[400px] h-[400px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none -mt-32 -mr-32"></div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 z-10">
        
        <div className="mb-10 animate-fade-in">
            <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-3xl flex items-center justify-center text-teal-400 mb-6 shadow-xl shadow-teal-500/10">
                <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">New<br/>Credentials</h1>
            <p className="text-slate-400 font-medium text-sm">
                OTP verified for <span className="text-white font-black">{email}</span>. Please establish a robust new password.
            </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-6 flex items-start gap-3 text-xs font-bold animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Password</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                    <input 
                        type={showPassword ? "text" : "password"}
                        required 
                        placeholder="Must be at least 6 characters"
                        className="w-full bg-slate-900/60 border border-slate-700/60 rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-white outline-none focus:border-teal-500 focus:bg-slate-800 transition-all"
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className="space-y-1.5 mt-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm Password</label>
                <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                    <input 
                        type={showPassword ? "text" : "password"}
                        required 
                        placeholder="Re-enter to verify"
                        className="w-full bg-slate-900/60 border border-slate-700/60 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:border-teal-500 focus:bg-slate-800 transition-all"
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Confirm Update <ChevronRight className="w-5 h-5" />
                  </>
                )}
            </button>
        </form>
      </div>
    </div>
  );
}
