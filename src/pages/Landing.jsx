import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, Zap, Heart, ArrowRight, Star, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);

  const apiBase = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetch(`${apiBase}/public/stats`)
      .then(res => res.json())
      .then(data => {
        setUserCount(data.total_users || 0);
        setRecentUsers(data.recent_users || []);
      })
      .catch(err => console.error("Failed to fetch stats", err));
  }, [apiBase]);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-12 py-8 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center space-x-2">
          <div className="bg-teal-600 p-2 rounded-xl">
            <Activity className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">UniHealth <span className="text-teal-600">AI</span></h1>
        </div>
        <div className="hidden md:flex items-center space-x-12 text-sm font-black uppercase tracking-widest text-slate-500">
          <a href="#features" className="hover:text-teal-600 transition-colors">Features</a>
          <a href="#doctors" className="hover:text-teal-600 transition-colors">Our Doctors</a>
          <a href="#security" className="hover:text-teal-600 transition-colors">Security</a>
        </div>
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate('/login')} className="text-slate-600 font-bold hover:text-teal-600 transition-colors">Login</button>
          <button onClick={() => navigate('/register')} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-teal-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
            Join Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="animate-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center space-x-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <Zap size={14} fill="currentColor" />
              <span>Next-Gen Campus Care</span>
            </div>
            <h2 className="text-7xl font-black text-slate-900 leading-[1.1] mb-8">
              Your Health, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Intelligently</span> <br />
              Managed.
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12 max-w-lg">
              Experience the future of campus healthcare. AI-powered diagnostics, seamless doctor bookings, and secure digital records—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button onClick={() => navigate('/register')} className="w-full sm:w-auto bg-teal-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-teal-700 transition-all shadow-2xl shadow-teal-600/30 flex items-center justify-center space-x-3 group">
                <span>Start Free Trial</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex -space-x-3 items-center">
                {recentUsers.map((u, idx) => {
                  const avatarSrc = u.profile_picture 
                    ? (u.profile_picture.startsWith?.('http') ? u.profile_picture : `${apiBase}${u.profile_picture}`)
                    : null;
                  return (
                    <div key={idx} className="w-10 h-10 rounded-full border-2 border-white bg-slate-800 text-white font-bold flex items-center justify-center overflow-hidden text-sm shadow-sm" title={u.name}>
                      {avatarSrc ? (
                        <img src={avatarSrc} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{(u.name || 'U').charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  );
                })}
                {userCount > recentUsers.length && (
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-teal-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                    +{userCount - recentUsers.length}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative animate-in zoom-in duration-1000">
            <div className="relative z-10 bg-gradient-to-br from-teal-500 to-emerald-400 rounded-[4rem] p-4 shadow-3xl transform hover:rotate-2 transition-transform duration-700">
              <div className="bg-white rounded-[3.5rem] overflow-hidden shadow-inner">
                <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000" alt="App Preview" className="w-full h-auto" />
              </div>
            </div>
            {/* Floating Elements */}
            <div className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl animate-bounce delay-700">
              <div className="flex items-center space-x-3">
                <div className="bg-rose-500 p-2 rounded-lg text-white"><Heart size={16} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Heart Rate</p>
                  <p className="text-xl font-black text-slate-800 leading-none">72 BPM</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-2 rounded-lg text-white"><Star size={16} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Accuracy</p>
                  <p className="text-xl font-black text-slate-800 leading-none">99.4%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-50 py-24 px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-2 gap-12 justify-center">
          <StatItem value="99.9%" label="Security Uptime" />
          <StatItem value="2min" label="Avg. AI Response" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h3 className="text-4xl font-black text-slate-900 mb-4">Why Choose UniHealth AI?</h3>
          <p className="text-slate-500 font-medium">Built for the modern student, powered by modern intelligence.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard
            icon={<Activity size={40} />}
            title="AI Symptom Checker"
            desc="Instantly analyze your symptoms with our clinical-grade AI core."
          />
          <FeatureCard
            icon={<Shield size={40} />}
            title="Secure Records"
            desc="Your health data is encrypted and accessible only by you."
          />
          <FeatureCard
            icon={<CheckCircle2 size={40} />}
            title="Instant Booking"
            desc="Skip the queue. Book your medical visits in under 30 seconds."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-20 px-12 text-center text-white">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="bg-teal-600 p-2 rounded-xl">
            <Activity className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">UniHealth <span className="text-teal-600">AI</span></h1>
        </div>
        <p className="text-slate-500 text-sm font-medium mb-12 max-w-md mx-auto">Providing innovative healthcare solutions for the next generation of campus leaders.</p>
        <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
          &copy; 2024 UniHealth AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function StatItem({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-black text-slate-900 mb-2">{value}</p>
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-12 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
      <div className="text-teal-600 mb-8 transform group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <h4 className="text-2xl font-black text-slate-800 mb-4">{title}</h4>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  )
}
