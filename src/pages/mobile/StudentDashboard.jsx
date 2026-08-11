import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Calendar,
  Stethoscope,
  Activity,
  Bell,
  ArrowRight,
  Heart,
  FileText,
  Sparkles,
  Clock,
  AlertCircle,
  ShieldCheck,
  BrainCircuit,
  ShieldAlert,
  Zap,
  Wind
} from 'lucide-react';
import { SkeletonCard, SkeletonListItem } from '../components/Skeleton';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [upcomingApt, setUpcomingApt] = useState(null);
  const [completedApt, setCompletedApt] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const baseURL = '';

  // Mandatory Profile Completion State
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [profileForm, setProfileForm] = useState({
    department: '',
    roll_number: '',
    phone: '',
    age: '',
    gender: 'Male',
    dob: '',
    course: '',
    branch: '',
    university_register_number: '',
    university_name: '',
    blood_group: '',
    emergency_contact: '',
    address: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const checkStudentProfileAndData = async () => {
      if (user?.email) {
        try {
          const meRes = await axios.get('/auth/me');
          const d = meRes.data;
          setProfileForm({
            department: d.department || '',
            roll_number: d.roll_number || '',
            phone: d.phone || '',
            age: d.age || '',
            gender: d.gender || 'Male',
            dob: d.dob || '',
            course: d.course || '',
            branch: d.branch || '',
            university_register_number: d.university_register_number || '',
            university_name: d.university_name || '',
            blood_group: d.blood_group || '',
            emergency_contact: d.emergency_contact || '',
            address: d.address || ''
          });

          if (!d.department || !d.roll_number || !d.phone || !d.dob || !d.blood_group || !d.emergency_contact) {
            setProfileIncomplete(true);
          }

          const res = await axios.get(`/appointments/student/${user.email}`);
          const today = new Date().toISOString().split('T')[0];
          const scheduled = res.data.find(apt => apt.status === 'scheduled' && apt.date >= today);
          if (scheduled) {
            setUpcomingApt({
              doctor:   scheduled.doctor_name || 'Campus Specialist',
              time:     `${scheduled.date} at ${scheduled.time}`,
              location: 'Campus Clinic'
            });
          } else {
            setUpcomingApt(null);
          }

          const completed = res.data.filter(apt => apt.status === 'completed');
          if (completed.length > 0) setCompletedApt(completed[0]);

          const notifRes = await axios.get(`/notifications/student/${user.email}`);
          setNotifications(notifRes.data.slice(0, 4));
        } catch (err) {
          console.error('Error checking student profile/dashboard:', err);
        } finally {
          setLoadingData(false);
        }
      }
    };
    checkStudentProfileAndData();
  }, [user]);

  const handleSaveMandatoryProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await axios.put('/auth/update-profile', {
        ...profileForm,
        age: profileForm.age ? parseInt(profileForm.age) : null
      });
      setProfileIncomplete(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'Student';

  return (
    <div className="min-h-screen bg-slate-900 pb-4">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 pt-6 pb-8">
        {/* Glow orbs */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full text-[10px] font-black text-teal-400 uppercase tracking-widest">
                Personal Health
              </span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              {greeting},<br />
              <span className="text-teal-400">{firstName}</span>
            </h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-[260px]">
              Your health dashboard is synced and secure.
            </p>
          </div>

          {/* Avatar */}
          <button
            onClick={() => navigate('/student/profile')}
            className="w-14 h-14 rounded-2xl border-2 border-teal-500/30 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl flex-shrink-0 pressable"
          >
            {user?.profile_picture ? (
              <img
                src={user.profile_picture.startsWith('data:') || user.profile_picture.startsWith('http')
                  ? user.profile_picture
                  : `${baseURL}${user.profile_picture}`}
                alt=""
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=0D9488&color=fff&bold=true`;
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-black text-teal-400">{user?.name?.charAt(0) || 'S'}</span>
            )}
          </button>
        </div>

        {/* Quick action buttons */}
        <div className="relative z-10 flex gap-3">
          <button
            onClick={() => navigate('/student/ai-assistant')}
            className="flex-1 flex items-center justify-center gap-2 bg-teal-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl py-3.5 shadow-lg shadow-teal-500/30 pressable"
          >
            <Sparkles className="w-4 h-4" /> AI Assistant
          </button>
          <button
            onClick={() => navigate('/student/emergency')}
            className="flex-1 flex items-center justify-center gap-2 bg-white/8 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-2xl py-3.5 pressable"
          >
            Emergency
          </button>
        </div>
      </section>

      {/* ── Upcoming Appointment Card ──────────────────────────────────── */}
      <div className="px-4 -mt-4 relative z-10 mb-5">
        <div className="bg-slate-800 rounded-3xl p-4 border border-slate-700/60 shadow-xl">
          {loadingData ? (
            <div className="flex items-center gap-4">
              <div className="skeleton w-12 h-12 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3.5 rounded-full w-2/3" />
                <div className="skeleton h-2.5 rounded-full w-1/2" />
              </div>
            </div>
          ) : upcomingApt ? (
            <button
              onClick={() => navigate('/student/appointments')}
              className="w-full flex items-center gap-4 text-left pressable"
            >
              <div className="w-12 h-12 bg-teal-500/15 border border-teal-500/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-5 h-5 text-teal-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-teal-400 uppercase tracking-widest mb-0.5">Upcoming Visit</p>
                <p className="text-sm font-bold text-white truncate">{upcomingApt.doctor}</p>
                <p className="text-xs text-slate-400">{upcomingApt.time}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/student/doctors')}
              className="w-full flex items-center gap-4 text-left pressable"
            >
              <div className="w-12 h-12 bg-slate-700/60 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">No upcoming appointments</p>
                <p className="text-xs text-teal-400 font-semibold mt-0.5">Tap to book a visit →</p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* ── Quick Actions Grid ─────────────────────────────────────────── */}
      <section className="px-4 mb-5">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <ActionCard
            icon={<Calendar className="w-6 h-6 text-blue-400" />}
            title="Clinical Visits"
            desc="View &amp; manage your appointments"
            onClick={() => navigate('/student/appointments')}
            badge={upcomingApt ? 'Confirmed' : null}
            accent="blue"
          />
          <ActionCard
            icon={<Stethoscope className="w-6 h-6 text-emerald-400" />}
            title="Book Specialist"
            desc="Find campus doctors"
            onClick={() => navigate('/student/doctors')}
            accent="emerald"
          />
          <ActionCard
            icon={<FileText className="w-6 h-6 text-sky-400" />}
            title="Medical Vault"
            desc="Prescriptions &amp; reports"
            onClick={() => navigate('/student/records')}
            accent="sky"
          />
          <ActionCard
            icon={<Bell className="w-6 h-6 text-amber-400" />}
            title="Reminders"
            desc="Medication &amp; wellness alerts"
            onClick={() => navigate('/student/reminders')}
            accent="amber"
          />
          {completedApt && (
            <ActionCard
              icon={<ShieldCheck className="w-6 h-6 text-indigo-400" />}
              title="Last Visit"
              desc={`Dr. ${completedApt.doctor_name || 'Campus Doctor'}`}
              onClick={() => navigate('/student/appointments')}
              badge="Recent"
              accent="indigo"
            />
          )}
          <ActionCard
            icon={<Activity className="w-6 h-6 text-rose-400" />}
            title="Smart Health"
            desc="Biometrics &amp; wellness"
            onClick={() => navigate('/student/smart-home')}
            accent="rose"
          />
        </div>
      </section>

      {/* ── Recent Activity / Notifications ──────────────────────────── */}
      <section className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Recent Activity</p>
          <button
            onClick={() => navigate('/student/notifications')}
            className="text-[10px] font-black text-teal-400 uppercase tracking-widest pressable"
          >
            See All
          </button>
        </div>

        {loadingData ? (
          <div className="space-y-2">
            {[0,1,2].map(i => (
              <div key={i} className="flex items-center gap-3 p-4 bg-slate-800 rounded-2xl">
                <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 rounded-full w-2/3" />
                  <div className="skeleton h-2.5 rounded-full w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notif, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-slate-800 border border-slate-700/60 rounded-2xl pressable"
                onClick={() => navigate('/student/notifications')}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notif.category === 'prescription' ? 'bg-blue-500/15 text-blue-400' :
                  notif.category === 'alert'        ? 'bg-amber-500/15 text-amber-400' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {notif.category === 'prescription' ? <FileText className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white leading-snug">{notif.title}</p>
                  <p className="text-xs text-slate-400 leading-snug mt-0.5 line-clamp-2">{notif.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-slate-800 rounded-2xl text-center border border-slate-700/60">
            <div className="w-14 h-14 bg-slate-700/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-sm font-bold text-slate-400">No recent activity</p>
          </div>
        )}
      </section>

      {/* ── AI Feature Chips ─────────────────────────────────────────────── */}
      <section className="px-4 mb-2">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">AI Features</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { icon: <BrainCircuit className="w-4 h-4" />, label: 'AI Chat',        path: '/student/ai-assistant' },
            { icon: <Activity className="w-4 h-4" />,     label: 'Symptom Check', path: '/student/symptom-checker' },
            { icon: <Zap className="w-4 h-4" />,          label: 'Smart Home',    path: '/student/smart-home' },
          ].map((chip) => (
            <button
              key={chip.path}
              onClick={() => navigate(chip.path)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700/60 rounded-full text-xs font-bold text-slate-300 whitespace-nowrap pressable hover:border-teal-500/50 hover:text-teal-400 transition-colors flex-shrink-0"
            >
              <span className="text-teal-400">{chip.icon}</span>
              {chip.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── MANDATORY PROFILE COMPLETION MODAL ─────────────────────────── */}
      {profileIncomplete && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-md">
          <div className="bg-slate-800 rounded-t-[2.5rem] sm:rounded-[2rem] w-full sm:max-w-2xl p-6 sm:p-8 border border-slate-700/60 max-h-[90vh] overflow-y-auto sheet-enter">
            <div className="w-12 h-1 bg-slate-600 rounded-full mx-auto mb-6 sm:hidden" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white leading-tight">Complete Your Profile</h3>
                <p className="text-slate-400 text-xs mt-0.5">Required for campus health records</p>
              </div>
            </div>

            <form onSubmit={handleSaveMandatoryProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Department / Major *',          key: 'department',    type: 'text',  placeholder: 'e.g. Computer Science',   required: true },
                  { label: 'Roll Number / Student ID *',    key: 'roll_number',   type: 'text',  placeholder: 'e.g. 21CSE101',           required: true },
                  { label: 'Phone *',                       key: 'phone',         type: 'tel',   placeholder: 'e.g. +91 98765 43210',    required: true },
                  { label: 'Date of Birth *',               key: 'dob',           type: 'date',  placeholder: '',                        required: true },
                  { label: 'Age *',                         key: 'age',           type: 'number',placeholder: 'e.g. 21',                 required: true },
                  { label: 'Blood Group *',                 key: 'blood_group',   type: 'text',  placeholder: 'e.g. O+',                 required: true },
                  { label: 'Emergency Contact *',           key: 'emergency_contact', type: 'tel', placeholder: 'Parent/Guardian number', required: true },
                  { label: 'Course / Degree',               key: 'course',        type: 'text',  placeholder: 'e.g. B.Tech',             required: false },
                  { label: 'University Name',               key: 'university_name', type: 'text', placeholder: 'e.g. UniHealth University', required: false },
                ].map(({ label, key, type, placeholder, required }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>
                    <input
                      type={type}
                      required={required}
                      placeholder={placeholder}
                      value={profileForm[key]}
                      onChange={(e) => setProfileForm({ ...profileForm, [key]: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600/60 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors min-h-[44px]"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender *</label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600/60 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-teal-500 transition-colors min-h-[44px]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address</label>
                <input
                  type="text"
                  placeholder="e.g. Hostel Block A, Room 304"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600/60 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors min-h-[44px]"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-4 bg-teal-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-teal-500/25 active:scale-95 transition-all disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save & Complete Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({ icon, title, desc, onClick, badge, accent = 'teal' }) {
  const accentBg = {
    blue:    'bg-blue-500/10 border-blue-500/20',
    emerald: 'bg-emerald-500/10 border-emerald-500/20',
    sky:     'bg-sky-500/10 border-sky-500/20',
    amber:   'bg-amber-500/10 border-amber-500/20',
    indigo:  'bg-indigo-500/10 border-indigo-500/20',
    rose:    'bg-rose-500/10 border-rose-500/20',
    teal:    'bg-teal-500/10 border-teal-500/20',
  };
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col p-4 rounded-2xl border text-left w-full pressable transition-all
        ${accentBg[accent] || accentBg.teal} bg-slate-800/80`}
    >
      {badge && (
        <span className="absolute top-3 right-3 px-2 py-0.5 bg-white/10 text-white text-[9px] font-black uppercase tracking-wider rounded-full border border-white/10">
          {badge}
        </span>
      )}
      <div className="mb-3 w-10 h-10 bg-slate-900/50 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm font-black text-white leading-tight mb-1">{title}</p>
      <p className="text-[11px] text-slate-400 leading-snug">{desc}</p>
    </button>
  );
}
