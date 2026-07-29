import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogOut, 
  Calendar, 
  Stethoscope, 
  Activity, 
  MessageSquare, 
  Bell, 
  Settings, 
  Search, 
  ArrowRight,
  Heart,
  Droplets,
  Flame,
  Zap,
  Shield,
  ShieldAlert,
  Clock,
  AlertCircle,
  FileText,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [upcomingApt, setUpcomingApt] = useState(null);
  const [completedApt, setCompletedApt] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const baseURL = ''; // Vite proxy (dev) and FastAPI (prod) both serve /static/*

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const fetchLatestAppointment = async () => {
      if (user?.email) {
        try {
          const res = await axios.get(`/appointments/student/${user.email}`);
          const today = new Date().toISOString().split('T')[0];
          // Only show genuinely upcoming (not expired/past) scheduled appointments
          const scheduled = res.data.find(
            apt => apt.status === 'scheduled' && apt.date >= today
          );
          if (scheduled) {
            setUpcomingApt({
              doctor: scheduled.doctor_name || 'Campus Specialist',
              time: `${scheduled.date} at ${scheduled.time}`,
              location: 'Campus Clinic'
            });
          } else {
            setUpcomingApt(null);
          }
          
          const completed = res.data.filter(apt => apt.status === 'completed');
          if (completed.length > 0) {
            setCompletedApt(completed[0]);
          }

          // Fetch notifications for alerts and prescriptions
          const notifRes = await axios.get(`/notifications/student/${user.email}`);
          setNotifications(notifRes.data.slice(0, 4)); // Get top 4 recent notifications
        } catch (err) {
          console.error("Error fetching latest appointment:", err);
        }
      }
    };
    fetchLatestAppointment();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/20 px-8 py-4 flex justify-between items-center backdrop-blur-xl">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/student')}>
          <div className="bg-primary p-2.5 rounded-2xl shadow-xl shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-500">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">UniHealth <span className="text-primary">AI</span></span>
        </div>

        <div className="flex items-center space-x-4 sm:space-x-8">
          <button 
            className="relative p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:text-primary hover:border-primary/20 hover:shadow-xl transition-all group" 
            onClick={() => navigate('/student/notifications')}
          >
            <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
            {upcomingApt && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
          
          <div className="flex items-center space-x-4 sm:border-l border-slate-200 sm:pl-8">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-black text-slate-900 tracking-tight">{user?.name || 'Student User'}</div>
              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center justify-end gap-1">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Secure Session
              </div>
            </div>
            <div 
               onClick={() => navigate('/student/profile')}
               className="w-12 h-12 bg-white rounded-[1.25rem] border-2 border-white shadow-xl flex items-center justify-center text-primary font-black cursor-pointer hover:scale-105 transition-all overflow-hidden ring-4 ring-primary/5"
            >
               {user?.profile_picture ? (
                 <img src={`${baseURL}${user.profile_picture}`} alt="" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-xl font-black">{user?.name?.charAt(0) || 'S'}</span>
               )}
            </div>
            <button 
              onClick={() => { logout(); navigate('/login'); }} 
              className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all shadow-sm"
              title="Logout Securely"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mt-28 flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Welcome Hero Section */}
        <section className="mb-12 relative rounded-[3.5rem] overflow-hidden bg-slate-900 p-8 sm:p-14 shadow-3xl group">
          <div className="absolute top-0 right-0 w-2/3 h-full opacity-30 bg-gradient-to-l from-primary to-transparent pointer-events-none group-hover:opacity-40 transition-opacity"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
               <span className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                  Personal Health Intelligence
               </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-[1.1]">
              {greeting}, <br />
              <span className="text-slate-400">{user?.name?.split(' ')[0] || 'Student'}</span>
            </h2>
            <p className="text-slate-400 font-medium text-lg mb-10 leading-relaxed max-w-md">
               Your academic health dashboard is synchronized. Monitor your vitals, access AI assistance, and manage clinical visits in one secure space.
            </p>
            
            <div className="flex flex-wrap gap-4">
               <button 
                  onClick={() => navigate('/student/ai-assistant')}
                  className="btn-premium bg-primary text-white border-primary shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-5 h-5" /> Launch AI Assistant
               </button>
               <button 
                  onClick={() => navigate('/student/emergency')}
                  className="btn-premium bg-white/10 text-white backdrop-blur-md border-white/10 hover:bg-white/20 px-8">
                  Emergency Support
               </button>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-12 gap-8">
           {/* Primary Actions Grid */}
           <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ActionCard 
                icon={<Calendar className="w-8 h-8 text-blue-500" />} 
                title="Clinical Visits" 
                desc="Manage scheduled appointments and review visit history." 
                onClick={() => navigate('/student/appointments')}
                badge={upcomingApt ? "Confirmed" : null}
              />
              <ActionCard 
                icon={<Stethoscope className="w-8 h-8 text-emerald-500" />} 
                title="Book Specialist" 
                desc="Find and book verified campus doctors instantly." 
                onClick={() => navigate('/student/doctors')}
                isNew
              />
              <ActionCard 
                icon={<FileText className="w-8 h-8 text-primary" />} 
                title="Medical Vault" 
                desc="Encrypted storage for prescriptions and lab reports." 
                onClick={() => navigate('/student/records')}
              />
              <ActionCard 
                icon={<Bell className="w-8 h-8 text-amber-500" />} 
                title="Health Alerts" 
                desc="Configure medication timings and wellness notices." 
                onClick={() => navigate('/student/reminders')}
              />
              {completedApt && (
                <ActionCard 
                  icon={<ShieldCheck className="w-8 h-8 text-indigo-500" />} 
                  title="Completed Visit" 
                  desc={`Dr. ${completedApt.doctor_name} on ${completedApt.date}`} 
                  onClick={() => navigate('/student/appointments')}
                  badge="Recent"
                />
              )}
           </div>

           {/* Sidebar: Vitals & Status */}
           <div className="lg:col-span-4 space-y-8">
              {/* Dynamic Health Alerts / Activity Stream */}
              <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8">
                    <Bell className="w-6 h-6 text-amber-100 group-hover:text-amber-500 transition-colors" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Recent Activity</h3>
                 
                 {notifications.length > 0 ? (
                    <div className="space-y-6">
                       {notifications.map((notif, idx) => (
                          <div key={idx} className="flex items-start gap-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                notif.category === 'prescription' ? 'bg-blue-50 text-blue-500' :
                                notif.category === 'alert' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-500'
                             }`}>
                                {notif.category === 'prescription' ? <FileText className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                             </div>
                             <div>
                                <h4 className="text-sm font-black text-slate-900">{notif.title}</h4>
                                <p className="text-xs font-medium text-slate-500 leading-snug mt-1">{notif.desc}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="space-y-8">
                       <VitalItem label="Heart Rate" value="72" unit="bpm" color="rose" status="Normal Range" />
                       <VitalItem label="Blood Pressure" value="120/80" unit="mmHg" color="blue" status="Optimal" />
                    </div>
                 )}
              </div>

              {/* Active Appointment Sidebar Widget */}
              <div className="bg-slate-900 p-8 rounded-[3.5rem] shadow-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-all duration-700"></div>
                 
                 <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Active Schedule
                 </h3>
                 
                 {upcomingApt ? (
                    <div className="space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-primary backdrop-blur-md border border-white/5">
                             <Stethoscope className="w-7 h-7" />
                          </div>
                          <div>
                             <h4 className="text-white font-black tracking-tight">{upcomingApt.doctor}</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campus Specialist</p>
                          </div>
                       </div>
                       <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                          <div className="flex justify-between items-center text-xs font-bold">
                             <span className="text-slate-400">Date</span>
                             <span className="text-white">{upcomingApt.time.split(' at ')[0]}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-bold">
                             <span className="text-slate-400">Time</span>
                             <span className="text-white">{upcomingApt.time.split(' at ')[1]}</span>
                          </div>
                       </div>
                       <button 
                         onClick={() => navigate('/student/appointments')}
                         className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl"
                       >
                          View Details
                       </button>
                    </div>
                 ) : (
                    <div className="text-center py-6">
                       <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                          <Calendar className="w-8 h-8 text-slate-500" />
                       </div>
                       <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed">No active clinical appointments in your schedule.</p>
                       <button 
                         onClick={() => navigate('/student/doctors')}
                         className="btn-premium bg-primary text-white border-primary w-full"
                       >
                          Book Visit
                       </button>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </main>

      {/* Mobile Floating Action Button */}
      <button 
        onClick={() => navigate('/student/ai-assistant')}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-3xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all z-50 lg:hidden"
      >
        <Sparkles className="w-7 h-7" />
      </button>
    </div>
  );
}

function ActionCard({ icon, title, desc, onClick, isNew, badge }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:border-white group cursor-pointer transition-all duration-500 flex flex-col justify-between h-72 relative overflow-hidden"
    >
       <div className="absolute top-0 right-0 p-8">
          {isNew && <span className="px-3 py-1 bg-emerald-50 text-[8px] font-black text-emerald-600 uppercase tracking-widest rounded-full border border-emerald-100">Functional</span>}
          {badge && <span className="px-3 py-1 bg-blue-50 text-[8px] font-black text-blue-600 uppercase tracking-widest rounded-full border border-blue-100">{badge}</span>}
       </div>
       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-primary/20">
          {icon}
       </div>
       <div>
          <h4 className="text-2xl font-black text-slate-900 mb-2 tracking-tight group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}

function VitalItem({ label, value, unit, color, status }) {
  const colors = {
    rose: 'text-rose-500 bg-rose-50 border-rose-100',
    blue: 'text-blue-500 bg-blue-50 border-blue-100',
    amber: 'text-amber-500 bg-amber-50 border-amber-100',
    emerald: 'text-emerald-500 bg-emerald-50 border-emerald-100'
  };
  
  return (
    <div className="flex items-center justify-between group/item">
       <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colors[color]} group-hover/item:scale-110 transition-transform`}>
             <Activity className="w-6 h-6" />
          </div>
          <div>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</div>
             <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 tracking-tighter">{value}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{unit}</span>
             </div>
          </div>
       </div>
       <div className="text-right">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${colors[color]}`}>
             {status}
          </span>
       </div>
    </div>
  );
}
