import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserCircle, Check, ShieldCheck, Loader2, Info } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { sendOtp } = useAuth();
  const navigate = useNavigate();

  // Password Validation States
  const [validations, setValidations] = useState({
    length: false,
    number: false,
    special: false,
    uppercase: false
  });

  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
      uppercase: /[A-Z]/.test(password)
    });
  }, [password]);

  const isPasswordValid = Object.values(validations).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Please meet all password requirements before registering.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(name, email, password, role);
      navigate('/verify-otp', { state: { email, demoOtp: res?.demo_otp } });
    } catch (err) {
      let errorMessage = 'Registration failed. Please check your connection.';
      
      if (err.response) {
        const detail = err.response.data?.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map(d => d.msg).join(', ');
        } else if (detail) {
          errorMessage = JSON.stringify(detail);
        } else {
          errorMessage = `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = 'Cannot reach the server. Is the backend running?';
      } else {
        errorMessage = err.message || 'An unexpected error occurred.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 z-10">
        
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/10">
            <ShieldCheck className="text-cyan-400 w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Join<br/>UniHealth AI</h1>
          <p className="text-slate-400 font-medium text-sm">Your campus health companion</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-6 flex items-start gap-3 text-xs font-bold animate-shake">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="John Doe"
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:border-cyan-500 focus:bg-slate-800 transition-all"
                value={name} onChange={(e) => setName(e.target.value)} required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 pressable ${
                  role === 'student' ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'bg-slate-900/60 border-slate-700/60 text-slate-500 hover:bg-slate-800'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 pressable ${
                  role === 'doctor' ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'bg-slate-900/60 border-slate-700/60 text-slate-500 hover:bg-slate-800'
                }`}
              >
                Doctor
              </button>
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off" 
                placeholder="name@university.edu"
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:border-cyan-500 focus:bg-slate-800 transition-all"
                value={email} onChange={(e) => setEmail(e.target.value)} required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Secure Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="password" 
                placeholder="Create a strong password"
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:border-cyan-500 focus:bg-slate-800 transition-all"
                value={password} 
                onFocus={() => setShowPasswordRequirements(true)}
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </div>
          </div>

          {showPasswordRequirements && (
            <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 grid grid-cols-2 gap-3 mt-3 animate-fade-in">
              <RequirementItem met={validations.length} text="8+ chars" />
              <RequirementItem met={validations.uppercase} text="1 uppercase" />
              <RequirementItem met={validations.number} text="1 number" />
              <RequirementItem met={validations.special} text="1 special" />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 pressable disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
          <p className="text-xs font-bold text-slate-500">
            Already a member? <Link to="/login" className="text-cyan-400 hover:text-cyan-300 uppercase tracking-widest ml-1">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RequirementItem({ met, text }) {
  return (
    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${met ? 'text-emerald-400' : 'text-slate-600'}`}>
      <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${met ? 'bg-emerald-500/20 border-emerald-500/30' : 'border-slate-700'}`}>
        {met && <Check size={8} strokeWidth={4} />}
      </div>
      {text}
    </div>
  );
}
