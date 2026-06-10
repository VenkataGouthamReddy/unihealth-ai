import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, HeartPulse, ShieldCheck, ArrowRight } from 'lucide-react';

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
      const user = await login(email, password);
      if (user.role === 'student') navigate('/student');
      else if (user.role === 'doctor') navigate('/doctor');
      else navigate('/admin');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 vibrant-gradient">
      <div className="glass-card p-10 rounded-[2.5rem] w-full max-w-lg flex flex-col items-center">
        <div className="bg-teal-100 p-4 rounded-3xl mb-4 animate-pulse">
          <HeartPulse className="text-teal-600" size={48} />
        </div>
        <h2 className="text-4xl font-black text-slate-800 mb-2 text-center">Welcome Back</h2>
        <p className="text-slate-500 mb-8 text-center font-medium">Log in to access your UniHealth AI dashboard.</p>

        {error && (
          <div className="w-full bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 flex items-center space-x-3 text-sm font-semibold animate-shake">
            <ShieldCheck size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              className="premium-input pl-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="premium-input pl-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="premium-button text-lg group"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-600 font-medium">
          New to UniHealth? <Link to="/register" className="text-teal-600 font-bold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
