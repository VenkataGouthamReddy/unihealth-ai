import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, KeyRound, Sparkles, Loader2, AlertCircle, ShieldCheck, Timer, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSuccess, setIsSuccess] = useState(false);
  const [canResend, setCanResend] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuth();
  
  const email = location.state?.email || 'user@university.edu';

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setTimeLeft(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    // In a real app, call API to resend
    console.log("OTP Resent to", email);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const otpValue = otp.join('').trim();
    
    if (otpValue.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setIsVerifying(true);
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const user = await verifyOtp(cleanEmail, otpValue);
      setIsSuccess(true);
      setTimeout(() => {
        if (location.state?.isReset) {
          navigate('/reset-password', { state: { email: cleanEmail, otp: otpValue } });
        } else {
          if (user.role === 'student') navigate('/student');
          else if (user.role === 'doctor') navigate('/doctor');
          else navigate('/admin');
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed. Please check the code.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] flex items-center justify-center text-emerald-400 mb-8 animate-bounce shadow-xl shadow-emerald-500/10">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Identity Verified</h1>
        <p className="text-slate-400 font-medium mb-8">Accessing secure medical portal...</p>
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
      {/* Dynamic background particles */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center">
        <button 
           onClick={() => navigate(-1)} 
           className="w-10 h-10 bg-slate-900/80 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors pressable backdrop-blur-md"
        >
            <ArrowLeft className="w-5 h-5" />
        </button>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${timeLeft > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
            <Timer className="w-3.5 h-3.5" />
            {timeLeft > 0 ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : 'Expired'}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 z-10 mt-10">
        
        <div className="mb-8 animate-fade-in">
           <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-3xl flex items-center justify-center text-teal-400 mb-6 shadow-xl shadow-teal-500/10">
               <KeyRound className="w-8 h-8" />
           </div>
           <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Security<br/>Check</h1>
           <p className="text-slate-400 font-medium text-sm leading-relaxed mb-6">
               We've dispatched a 6-digit transmission code to your registered academic email:
               <span className="block font-black text-white mt-2 p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 truncate">{email}</span>
           </p>
        </div>

        {location.state?.demoOtp && (
          <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 mb-6 text-xs font-bold text-center animate-pulse">
            <AlertCircle className="w-4 h-4 inline-block mr-1" /> 
            Demo Mode Active! Use OTP: <span className="text-lg bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 ml-1">{location.state.demoOtp}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 mb-6 text-xs font-bold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex justify-between gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-full aspect-square text-center text-2xl font-black bg-slate-900/60 border border-slate-700/60 rounded-2xl text-white outline-none focus:border-teal-500 focus:bg-slate-800 transition-all shadow-inner"
                    />
                ))}
            </div>

            <button 
               type="submit" 
               disabled={isVerifying || otp.join('').length !== 6}
               className="w-full bg-teal-500 hover:bg-teal-400 active:scale-[0.98] text-slate-950 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-2 pressable disabled:opacity-50"
            >
                {isVerifying ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" /> Verify Identity
                  </>
                )}
            </button>
        </form>

        <div className="mt-8 flex justify-center animate-fade-in" style={{ animationDelay: '200ms' }}>
            <button 
                onClick={handleResend}
                disabled={!canResend}
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
                    canResend 
                        ? 'text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 pressable' 
                        : 'text-slate-600 cursor-not-allowed bg-slate-900/50'
                }`}
            >
                <RotateCcw className={`w-3.5 h-3.5 ${canResend ? 'animate-spin-slow' : ''}`} />
                {canResend ? 'Resend Secure Code' : `Resend available in ${timeLeft}s`}
            </button>
        </div>
      </div>
    </div>
  );
}
