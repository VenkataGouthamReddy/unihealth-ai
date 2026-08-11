import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, HeartPulse, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role === 'student') navigate('/student');
      else if (user.role === 'doctor') navigate('/doctor');
      else navigate('/admin');
    } catch (err) {
      if (err.message && (err.message.includes('Network Error') || err.message.includes('Failed to fetch') || err.code === 'ECONNABORTED')) {
        setError('Server is waking up... Please wait a few seconds.');
      } else if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 z-10">
        
        {/* Header Section */}
        <div className="mb-10 animate-fade-in">
          <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-teal-500/10">
            <HeartPulse className="text-teal-400 w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Welcome<br/>Back</h1>
          <p className="text-slate-400 font-medium text-sm">Sign in to continue your secure health journey.</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-6 flex items-start gap-3 text-xs font-bold animate-shake">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
              <input
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="name@university.edu"
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:border-teal-500 focus:bg-slate-800 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-end ml-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-teal-400 hover:text-teal-300">Forgot?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:border-teal-500 focus:bg-slate-800 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-teal-500 hover:bg-teal-400 active:scale-[0.98] text-slate-950 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-2 pressable"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
          <p className="text-xs font-bold text-slate-500">
            New to UniHealth? <Link to="/register" className="text-teal-400 hover:text-teal-300 uppercase tracking-widest ml-1">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
