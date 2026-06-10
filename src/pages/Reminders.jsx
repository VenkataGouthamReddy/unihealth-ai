import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Clock, 
  Bell, 
  ArrowLeft, 
  Trash2, 
  CheckCircle2,
  Calendar,
  AlertCircle,
  Activity,
  Heart,
  Droplets,
  Timer,
  Zap,
  RotateCw,
  Edit2,
  X,
  Check,
  Loader2
} from 'lucide-react';

export default function Reminders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'Medicine',
    repeat: 'Daily'
  });

  const fetchReminders = async () => {
    try {
      const res = await axios.get(`/alerts/student/${user.email}`);
      setReminders(res.data);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchReminders();
  }, [user]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      type: 'Medicine',
      repeat: 'Daily'
    });
    setShowAdd(true);
  };

  const handleEdit = (reminder) => {
    setEditingId(reminder._id);
    setFormData({
      name: reminder.name,
      date: reminder.date || new Date().toISOString().split('T')[0],
      time: reminder.time,
      type: reminder.type,
      repeat: reminder.repeat || 'Daily'
    });
    setShowAdd(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingId) {
        await axios.put(`/alerts/${editingId}`, {
          ...formData,
          student_id: user.email
        });
      } else {
        await axios.post(`/alerts/`, {
          ...formData,
          student_id: user.email
        });
      }
      fetchReminders();
      setShowAdd(false);
      setEditingId(null);
    } catch (err) {
      console.error("Error saving alert:", err);
    }
  };

  const deleteReminder = async (id) => {
    try {
      await axios.delete(`/alerts/${id}`);
      fetchReminders();
    } catch (err) {
      console.error("Error deleting alert:", err);
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'Meditation': return 'bg-emerald-50 text-emerald-500 border-emerald-100';
      case 'Medicine': return 'bg-rose-50 text-rose-500 border-rose-100';
      case 'Hydration': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'Exercise': return 'bg-amber-50 text-amber-500 border-amber-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Meditation': return <Heart className="w-8 h-8" />;
      case 'Medicine': return <Activity className="w-8 h-8" />;
      case 'Hydration': return <Droplets className="w-8 h-8" />;
      case 'Exercise': return <Zap className="w-8 h-8" />;
      default: return <Bell className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="fixed top-0 w-full z-50 glass border-b border-white/20 px-8 py-4 flex items-center justify-between backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/student')} className="p-3 hover:bg-slate-100 rounded-2xl transition-all hover:scale-105 active:scale-95">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Health <span className="text-primary">Alerts</span></h1>
        </div>
        <button 
           onClick={handleOpenAdd}
           className="btn-premium bg-primary text-white shadow-xl shadow-blue-500/20 px-6"
        >
           <Plus className="w-5 h-5" /> New Alert
        </button>
      </header>

      <main className="mt-28 flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full mb-20">
         <div className="mb-12 text-center">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">Master Your <span className="text-primary">Health Timings</span></h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl mx-auto">Configure custom reminders for medications, clinical visits, and wellness activities.</p>
         </div>

         {showAdd && (
            <div className="bg-white p-10 rounded-[3.5rem] mb-12 border border-primary/20 shadow-3xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
               
               <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Timer className="w-6 h-6" />
                  </div>
                  {editingId ? 'Edit Health Alert' : 'Create New Health Alert'}
               </h3>
               
               <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3 md:col-span-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Alert Title / Medication Name</label>
                       <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="e.g. Paracetamol 500mg or Eye Drops"
                          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm focus:bg-white focus:border-primary"
                       />
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Alert Date</label>
                       <input 
                          type="date" 
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm focus:bg-white focus:border-primary"
                       />
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Alert Time</label>
                       <input 
                          type="time" 
                          required
                          value={formData.time}
                          onChange={(e) => setFormData({...formData, time: e.target.value})}
                          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm focus:bg-white focus:border-primary"
                       />
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Category</label>
                       <select 
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm appearance-none focus:bg-white focus:border-primary"
                       >
                          <option value="Medicine">Medicine</option>
                          <option value="Meditation">Meditation</option>
                          <option value="Hydration">Hydration</option>
                          <option value="Exercise">Exercise</option>
                       </select>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Repeat Option</label>
                       <select 
                          value={formData.repeat}
                          onChange={(e) => setFormData({...formData, repeat: e.target.value})}
                          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm appearance-none focus:bg-white focus:border-primary"
                       >
                          <option value="None">None</option>
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                       </select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 bg-primary text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:scale-[1.02] shadow-2xl shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" /> {editingId ? 'Update Alert' : 'Activate Alert System'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowAdd(false)}
                      className="px-10 bg-slate-100 text-slate-500 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
               </form>
            </div>
         )}

         {loading ? (
           <div className="flex flex-col items-center justify-center py-40">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Alerts...</p>
           </div>
         ) : (
           <div className="grid md:grid-cols-2 gap-6">
              {reminders.length === 0 ? (
                 <div className="md:col-span-2 text-center py-32 bg-white rounded-[4rem] border border-dashed border-slate-200">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-slate-50/50">
                       <Bell className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">No health alerts added yet</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed mb-8">Your alert schedule is clear. Use the button below to configure your first health notification.</p>
                    <button 
                      onClick={handleOpenAdd}
                      className="btn-premium bg-slate-900 text-white shadow-2xl px-10"
                    >
                      Add Health Alert
                    </button>
                 </div>
              ) : reminders.map(r => (
                 <div key={r._id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col gap-6 group hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                          onClick={() => handleEdit(r)}
                          className="p-3 bg-blue-50 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                          title="Edit Alert"
                       >
                          <Edit2 className="w-4 h-4" />
                       </button>
                       <button 
                          onClick={() => deleteReminder(r._id)}
                          className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                          title="Delete Alert"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>

                    <div className="flex items-center gap-6">
                       <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner transition-transform group-hover:rotate-6 ${getTypeStyles(r.type)}`}>
                          {getTypeIcon(r.type)}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border ${getTypeStyles(r.type)}`}>
                               {r.type}
                            </span>
                            {r.repeat !== 'None' && (
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border border-indigo-100 bg-indigo-50 text-indigo-600 flex items-center gap-1">
                                 <RotateCw className="w-2 h-2" /> {r.repeat}
                              </span>
                            )}
                          </div>
                          <h4 className="text-2xl font-black text-slate-900 truncate group-hover:text-primary transition-colors tracking-tight">{r.name}</h4>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                       <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                             <Calendar className="w-4 h-4 text-slate-300" />
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{r.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Clock className="w-4 h-4 text-primary" />
                             <span className="text-lg font-black text-slate-900 tracking-tighter">{r.time}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
                          <CheckCircle2 className="w-4 h-4" /> Active
                       </div>
                    </div>
                 </div>
              ))}
           </div>
         )}

         <div className="mt-16 p-12 bg-slate-900 rounded-[4rem] text-white relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20 backdrop-blur-md">
                   <Zap className="w-5 h-5 text-primary fill-primary" />
                 </div>
                 <h4 className="text-2xl font-black tracking-tight">Health Intelligence Sync</h4>
               </div>
               <p className="text-slate-400 text-lg font-medium mb-10 leading-relaxed">
                  Your health routine is encrypted and synchronized across your campus devices for real-time compliance and care tracking.
               </p>
               <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div> Active Synchronization Enabled
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
