import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Heart, Zap, Shield, Sparkles, Wind, Droplets, Thermometer, ArrowRight } from 'lucide-react';

export default function SmartHealthHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Smart Health <span className="text-teal-600">Home</span></h1>
                <p className="text-slate-500 font-medium">Real-time biometrics and environmental wellness.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center space-x-4 shadow-sm">
                <div className="bg-teal-50 p-2 rounded-lg text-teal-600"><Sparkles size={20} /></div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">AI Monitoring Active</p>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <BiometricCard icon={<Heart size={24} />} label="Heart Rate" value="72" unit="BPM" color="rose" status="Normal" />
            <BiometricCard icon={<Activity size={24} />} label="Step Count" value="8,432" unit="Steps" color="teal" status="Good" />
            <BiometricCard icon={<Zap size={24} />} label="Sleep Quality" value="94" unit="%" color="indigo" status="Optimal" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
            <EnvironmentalStat icon={<Wind size={20}/>} label="Air Quality" value="Good" color="teal" />
            <EnvironmentalStat icon={<Droplets size={20}/>} label="Humidity" value="45%" color="blue" />
            <EnvironmentalStat icon={<Thermometer size={20}/>} label="Temperature" value="24°C" color="orange" />
            <EnvironmentalStat icon={<Shield size={20}/>} label="UV Index" value="Low" color="emerald" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl">
                <div className="relative z-10">
                    <h3 className="text-3xl font-black mb-4">Wellness Score</h3>
                    <div className="flex items-end space-x-4 mb-8">
                        <p className="text-7xl font-black text-teal-400">92</p>
                        <p className="text-slate-400 font-bold uppercase tracking-widest mb-3">Excellent</p>
                    </div>
                    <p className="text-slate-400 font-medium max-w-sm mb-10 leading-relaxed">
                        Your biometrics are in the top 5% for your age group. Keep maintaining your sleep schedule.
                    </p>
                    <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-teal-400 transition-all flex items-center space-x-2">
                        <span>Full Analysis</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
                <Activity className="absolute -right-20 -bottom-20 text-white/5 group-hover:text-teal-400/10 transition-colors duration-700" size={320} />
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                <h3 className="text-2xl font-black text-slate-800 mb-8">Recent Activity</h3>
                <div className="space-y-6">
                    <ActivityLog icon={<Heart size={16}/>} label="Heart rate spike detected" time="2h ago" type="Warning" />
                    <ActivityLog icon={<Zap size={16}/>} label="Daily step goal achieved" time="5h ago" type="Success" />
                    <ActivityLog icon={<Activity size={16}/>} label="Blood pressure recorded" time="Yesterday" type="Info" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function BiometricCard({ icon, label, value, unit, color, status }) {
    const colors = {
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        teal: "bg-teal-50 text-teal-600 border-teal-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100"
    };
    return (
        <div className={`p-10 rounded-[2.5rem] border-2 bg-white transition-all hover:shadow-2xl hover:-translate-y-1 group`}>
            <div className={`p-4 rounded-2xl w-fit mb-8 ${colors[color]}`}>
                {icon}
            </div>
            <div className="flex justify-between items-end mb-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</h4>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{status}</span>
            </div>
            <div className="flex items-baseline space-x-2">
                <p className="text-5xl font-black text-slate-800 tracking-tight group-hover:text-teal-600 transition-colors">{value}</p>
                <p className="text-lg font-bold text-slate-400 uppercase tracking-widest">{unit}</p>
            </div>
        </div>
    )
}

function EnvironmentalStat({ icon, label, value, color }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4 group hover:bg-slate-50 transition-colors">
            <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-teal-600 transition-colors">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                <p className="text-sm font-black text-slate-800">{value}</p>
            </div>
        </div>
    )
}

function ActivityLog({ icon, label, time, type }) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
            <div className="flex items-center space-x-4">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400 group-hover:text-teal-600">
                    {icon}
                </div>
                <p className="text-sm font-bold text-slate-700">{label}</p>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{time}</p>
        </div>
    )
}
