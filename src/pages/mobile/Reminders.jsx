import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import {
  Plus,
  Clock,
  Bell,
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
import { SkeletonReminderCard } from '../components/Skeleton';

const TYPE_ICONS = {
  'Medicine':  <Heart className="w-4 h-4" />,
  'Hydration': <Droplets className="w-4 h-4" />,
  'Exercise':  <Activity className="w-4 h-4" />,
  'Checkup':   <AlertCircle className="w-4 h-4" />,
  'Sleep':     <Timer className="w-4 h-4" />,
  'Custom':    <Bell className="w-4 h-4" />,
};

const TYPE_COLORS = {
  'Medicine':  'bg-blue-500/20 text-blue-400',
  'Hydration': 'bg-sky-500/20 text-sky-400',
  'Exercise':  'bg-emerald-500/20 text-emerald-400',
  'Checkup':   'bg-amber-500/20 text-amber-400',
  'Sleep':     'bg-indigo-500/20 text-indigo-400',
  'Custom':    'bg-slate-500/20 text-slate-400',
};

export default function Reminders() {
  const { user }   = useAuth();
  const { registerModal, unregisterModal } = useNavigation();

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData]   = useState({
    name:   '',
    date:   new Date().toISOString().split('T')[0],
    time:   '09:00',
    type:   'Medicine',
    repeat: 'Daily',
  });

  useEffect(() => {
    if (showAdd) {
      registerModal('add-reminder', () => setShowAdd(false));
    } else {
      unregisterModal('add-reminder');
    }
  }, [showAdd, registerModal, unregisterModal]);

  const fetchReminders = async () => {
    try {
      const res = await axios.get(`/alerts/student/${user.email}`);
      setReminders(res.data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchReminders();
  }, [user]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', date: new Date().toISOString().split('T')[0], time: '09:00', type: 'Medicine', repeat: 'Daily' });
    setShowAdd(true);
  };

  const handleEdit = (reminder) => {
    setEditingId(reminder._id);
    setFormData({
      name:   reminder.name,
      date:   reminder.date || new Date().toISOString().split('T')[0],
      time:   reminder.time,
      type:   reminder.type,
      repeat: reminder.repeat || 'Daily',
    });
    setShowAdd(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    try {
      if (editingId) {
        await axios.put(`/alerts/${editingId}`, { ...formData, student_id: user.email });
      } else {
        await axios.post('/alerts/', { ...formData, student_id: user.email });
      }
      fetchReminders();
      setShowAdd(false);
      setEditingId(null);
    } catch (err) {
      console.error('Error saving alert:', err);
    }
  };

  const deleteReminder = async (id) => {
    try {
      await axios.delete(`/alerts/${id}`);
      fetchReminders();
    } catch (err) {
      console.error('Error deleting alert:', err);
    }
  };

  const toggleActive = async (reminder) => {
    try {
      await axios.put(`/alerts/${reminder._id}`, {
        ...reminder,
        student_id: user.email,
        active: !reminder.active,
      });
      fetchReminders();
    } catch (err) {
      console.error('Error toggling alert:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">

      {/* Add/Edit Bottom Sheet */}
      {showAdd && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/70 backdrop-blur-sm sheet-overlay-enter"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-slate-800 border border-slate-700/60 rounded-t-[2rem] w-full max-w-lg p-6 sheet-enter"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-black text-white mb-5">
              {editingId ? 'Edit Reminder' : 'Add Reminder'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Reminder Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Take Vitamin D"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-600/60 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-900/60 border border-slate-600/60 rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-teal-500 transition-colors min-h-[44px]"
                  />
                </div>
                {/* Time */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-slate-900/60 border border-slate-600/60 rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-teal-500 transition-colors min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Type */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-900/60 border border-slate-600/60 rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-teal-500 transition-colors min-h-[44px]"
                  >
                    {Object.keys(TYPE_ICONS).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {/* Repeat */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Repeat</label>
                  <select
                    value={formData.repeat}
                    onChange={e => setFormData({ ...formData, repeat: e.target.value })}
                    className="w-full bg-slate-900/60 border border-slate-600/60 rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-teal-500 transition-colors min-h-[44px]"
                  >
                    {['Daily', 'Weekly', 'Monthly', 'Once'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-teal-500 text-slate-950 font-black text-sm rounded-2xl pressable"
                >
                  {editingId ? 'Save Changes' : 'Add Reminder'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-3.5 bg-white/8 border border-white/10 text-slate-300 font-bold text-sm rounded-2xl pressable"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reminder list */}
      <main className="px-4 pt-4 pb-4">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map(i => <SkeletonReminderCard key={i} />)}
          </div>
        ) : reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-slate-500" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">No Reminders</h3>
            <p className="text-slate-400 text-sm mb-6">Add medication, hydration, or wellness reminders.</p>
            <button
              onClick={handleOpenAdd}
              className="px-6 py-3 bg-teal-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl pressable flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add First Reminder
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((rem, i) => {
              const typeColor = TYPE_COLORS[rem.type] || TYPE_COLORS.Custom;
              const TypeIcon  = TYPE_ICONS[rem.type]  || TYPE_ICONS.Custom;
              return (
                <div
                  key={rem._id || i}
                  className={`bg-slate-800 border rounded-2xl p-4 flex items-center gap-3 ${
                    rem.active !== false ? 'border-slate-700/60' : 'border-slate-700/30 opacity-60'
                  }`}
                >
                  {/* Type icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor}`}>
                    {TypeIcon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white leading-tight truncate">{rem.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {rem.time}
                      </span>
                      <span className="text-[10px] text-slate-500">·</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{rem.type}</span>
                      {rem.repeat && <span className="text-[9px] text-slate-600 uppercase tracking-wide">· {rem.repeat}</span>}
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleActive(rem)}
                    className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 pressable ${
                      rem.active !== false ? 'bg-teal-500' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
                      rem.active !== false ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>

                  {/* Actions */}
                  <button
                    onClick={() => handleEdit(rem)}
                    className="w-9 h-9 flex items-center justify-center bg-slate-700/60 text-slate-400 rounded-xl pressable flex-shrink-0"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteReminder(rem._id)}
                    className="w-9 h-9 flex items-center justify-center bg-rose-500/15 text-rose-400 rounded-xl pressable flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FAB — Add Reminder */}
      {!showAdd && (
        <button
          onClick={handleOpenAdd}
          className="fixed right-4 z-50 w-14 h-14 bg-teal-500 text-slate-950 rounded-full shadow-xl shadow-teal-500/30 flex items-center justify-center pressable"
          style={{ bottom: 'calc(var(--nav-total) + 16px)' }}
          aria-label="Add reminder"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
