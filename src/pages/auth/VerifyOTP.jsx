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
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setIsVerifying(true);
    try {
      // Simulate verification for premium feel
      await new Promise(resolve => setTimeout(resolve, 1500));
      const user = await verifyOtp(email, otpValue);
      setIsSuccess(true);
      setTimeout(() => {
        if (location.state?.isReset) {
          navigate('/reset-password', { state: { email, otp: otpValue } });
        } else {
          if (user.role === 'student') navigate('/student');
          else if (user.role === 'doctor') navigate('/doctor');
          else navigate('/admin');
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed. Please check the code.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center text-emerald-600 mb-8 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Identity Verified</h1>
        <p className="text-slate-500 font-medium mb-8">Accessing secure medical portal...</p>
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
      {/* Dynamic background particles */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -ml-24 -mb-24"></div>
      
      <div className="max-w-md w-full relative z-10">
        <button 
           onClick={() => navigate(-1)} 
           className="group flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-black uppercase text-[10px] tracking-widest mb-12"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Go Back</span>
        </button>

        <div className="card-premium p-10 bg-white shadow-2xl border-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${timeLeft > 0 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                 <Timer className="w-3.5 h-3.5" />
                 {timeLeft > 0 ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : 'Expired'}
              </div>
           </div>

           <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-8 border border-slate-100 shadow-inner">
               <KeyRound className="w-10 h-10" />
           </div>

           <h1 className="text-3xl font-black text-slate-900 text-center mb-2 tracking-tight">Security Check</h1>
           <p className="text-slate-500 font-medium text-center text-sm leading-relaxed mb-8">
               We've dispatched a 6-digit transmission code to your registered academic email:
               <span className="block font-black text-slate-900 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100">{email}</span>
           </p>

           {error && (
             <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 mb-8 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
               <AlertCircle className="w-4 h-4" /> {error}
             </div>
           )}

           <form onSubmit={handleVerify} className="space-y-10">
                <div className="flex justify-center gap-2 sm:gap-3 p-5 bg-slate-50 rounded-[2.5rem] border border-slate-100/50 shadow-inner">
                    {otp.map((digit, i) => (
                        <input 
                            key={i}
                            id={`otp-${i}`}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            className={`w-10 h-14 sm:w-12 sm:h-16 rounded-2xl border-2 text-center text-2xl font-black transition-all duration-300 outline-none
                                ${digit 
                                  ? 'border-primary bg-white text-primary shadow-[0_0_20px_rgba(37,99,235,0.1)]' 
                                  : 'border-slate-200 bg-white text-slate-400 hover:border-primary/30'
                                }
                                focus:border-primary focus:bg-white focus:ring-8 focus:ring-primary/5 focus:scale-110 focus:shadow-[0_0_25px_rgba(37,99,235,0.2)]
                            `}
                            value={digit}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onChange={(e) => handleChange(i, e.target.value)}
                        />
                    ))}
                </div>

               <button 
                 type="submit" 
                 disabled={isVerifying || timeLeft === 0}
                 className="btn-premium bg-slate-900 text-white w-full py-5 flex items-center justify-center gap-2 group hover:bg-primary shadow-2xl transition-all disabled:opacity-50 disabled:hover:bg-slate-900"
               >
                   {isVerifying ? (
                     <Loader2 className="animate-spin w-5 h-5" />
                   ) : (
                     <>
                        Unlock Secure Access <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                     </>
                   )}
               </button>
           </form>

           <div className="mt-10 text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  Trouble receiving the code?
               </p>
               <button 
                 onClick={handleResend}
                 disabled={!canResend}
                 className={`flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl border transition-all font-bold text-xs
                    ${canResend 
                      ? 'border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40' 
                      : 'border-slate-100 text-slate-300 cursor-not-allowed'
                    }
                 `}
               >
                  <RotateCcw className={`w-3.5 h-3.5 ${!canResend ? '' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                  {canResend ? 'Resend New Code' : `Wait ${timeLeft}s to Resend`}
               </button>
           </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 text-emerald-500 bg-emerald-50/50 py-3 rounded-2xl border border-emerald-100/50 backdrop-blur-sm">
           <ShieldCheck className="w-4 h-4" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">Quantum-Safe Transmission Tunnel</span>
        </div>
      </div>
    </div>
  );
}
