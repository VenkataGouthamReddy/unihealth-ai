import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserCircle, Check, X, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  
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

    try {
      const res = await sendOtp(name, email, password, role);
      // Pass email and demo_otp (if any) to verify page
      navigate('/verify-otp', { state: { email, demoOtp: res?.demo_otp } });
    } catch (err) {
      let errorMessage = 'Registration failed. Please check your connection.';
      
      if (err.response) {
        // The server responded with a status code outside the 2xx range
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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="premium-card max-w-lg w-full p-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Join UniHealth AI</h1>
          <p className="text-slate-500 mt-2 font-medium">Your campus health companion</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-semibold text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Full Name"
              className="premium-input pl-12"
              value={name} onChange={(e) => setName(e.target.value)} required
            />
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select className="premium-input pl-12 appearance-none" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="email" 
              placeholder="Email Address"
              className="premium-input pl-12"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="password" 
              placeholder="Secure Password"
              className="premium-input pl-12"
              value={password} 
              onFocus={() => setShowPasswordRequirements(true)}
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>

          {showPasswordRequirements && (
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RequirementItem met={validations.length} text="At least 8 characters" />
              <RequirementItem met={validations.uppercase} text="One uppercase letter" />
              <RequirementItem met={validations.number} text="One number (0-9)" />
              <RequirementItem met={validations.special} text="Special char (!@#$%^&*)" />
            </div>
          )}

          <button type="submit" className="premium-button text-lg group">
            <span>Create Free Account</span>
            <Check size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="mt-8 text-center text-slate-600 font-medium">
          Already a member? <Link to="/login" className="text-teal-600 font-bold hover:underline">Log in now</Link>
        </p>
      </div>
    </div>
  );
}

function RequirementItem({ met, text }) {
  return (
    <div className={`flex items-center space-x-2 text-xs font-bold transition-colors ${met ? 'text-emerald-600' : 'text-slate-400'}`}>
      <div className={`p-0.5 rounded-full ${met ? 'bg-emerald-100' : 'bg-slate-200'}`}>
        {met ? <Check size={10} /> : <X size={10} />}
      </div>
      <span>{text}</span>
    </div>
  );
}
