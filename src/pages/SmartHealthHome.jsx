import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Heart, Zap, Shield, Sparkles, Wind, Droplets, Thermometer, ArrowRight } from 'lucide-react';

export default function SmartHealthHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 px-4 pt-4 pb-4">

      {/* AI Monitoring badge */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Biometrics</p>
        <div className="flex items-center gap-2 bg-teal-500/15 border border-teal-500/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest">AI Monitoring Active</span>
        </div>
      </div>

      {/* Biometric Cards — 1 col on mobile, 3 col on md */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <BiometricCard icon={<Heart   size={20} />} label="Heart Rate"    value="72"    unit="BPM"   color="rose"   status="Normal" />
        <BiometricCard icon={<Activity size={20} />} label="Step Count"   value="8,432" unit="Steps" color="teal"   status="Good" />
        <BiometricCard icon={<Zap     size={20} />} label="Sleep Quality" value="94"    unit="%"     color="indigo" status="Optimal" />
      </div>

      {/* Environmental Stats — 2x2 on mobile */}
      <div className="mb-5">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Environment</p>
        <div className="grid grid-cols-2 gap-3">
          <EnvironmentalStat icon={<Wind       size={16}/>} label="Air Quality" value="Good" color="teal" />
          <EnvironmentalStat icon={<Droplets   size={16}/>} label="Humidity"    value="45%"  color="blue" />
          <EnvironmentalStat icon={<Thermometer size={16}/>} label="Temperature" value="24°C" color="orange" />
          <EnvironmentalStat icon={<Shield     size={16}/>} label="UV Index"    value="Low"  color="emerald" />
        </div>
      </div>

      {/* Wellness Score */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-teal-500/20 rounded-2xl p-5 mb-4 relative overflow-hidden">
        <Activity className="absolute -right-8 -bottom-8 text-teal-500/10" size={160} />
        <div className="relative z-10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Wellness Score</p>
          <div className="flex items-end gap-3 mb-3">
            <p className="text-5xl font-black text-teal-400 leading-none">92</p>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-1">Excellent</p>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">
            Your biometrics are in the top 5% for your age group. Keep maintaining your sleep schedule.
          </p>
          <button className="flex items-center gap-2 bg-white/8 border border-white/10 text-white text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl pressable">
            Full Analysis <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-4">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Recent Activity</p>
        <div className="space-y-3">
          <ActivityLog icon={<Heart size={14}/>}    label="Heart rate spike detected"  time="2h ago"   type="Warning" />
          <ActivityLog icon={<Zap size={14}/>}      label="Daily step goal achieved"    time="5h ago"   type="Success" />
          <ActivityLog icon={<Activity size={14}/>} label="Blood pressure recorded"     time="Yesterday" type="Info" />
        </div>
      </div>
    </div>
  );
}

function BiometricCard({ icon, label, value, unit, color, status }) {
  const colors = {
    rose:   'bg-rose-500/20 text-rose-400 border-rose-500/20',
    teal:   'bg-teal-500/20 text-teal-400 border-teal-500/20',
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
  };
  const statusColors = {
    Normal:  'text-emerald-400',
    Good:    'text-teal-400',
    Optimal: 'text-indigo-400',
  };
  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 border ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-black text-white leading-none">{value}</span>
        <span className="text-xs text-slate-500 font-bold mb-0.5">{unit}</span>
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest mt-1 block ${statusColors[status] || 'text-teal-400'}`}>
        ● {status}
      </span>
    </div>
  );
}

function EnvironmentalStat({ icon, label, value, color }) {
  const bg = {
    teal:   'bg-teal-500/20 text-teal-400',
    blue:   'bg-blue-500/20 text-blue-400',
    orange: 'bg-orange-500/20 text-orange-400',
    emerald:'bg-emerald-500/20 text-emerald-400',
  };
  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-3.5 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-black text-white">{value}</p>
      </div>
    </div>
  );
}

function ActivityLog({ icon, label, time, type }) {
  const typeColors = {
    Warning: 'bg-amber-500/20 text-amber-400',
    Success: 'bg-emerald-500/20 text-emerald-400',
    Info:    'bg-blue-500/20 text-blue-400',
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[type] || typeColors.Info}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white leading-tight truncate">{label}</p>
      </div>
      <span className="text-[10px] text-slate-500 font-semibold flex-shrink-0">{time}</span>
    </div>
  );
}
