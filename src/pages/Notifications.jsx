import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  Calendar,
  Stethoscope,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Clock,
  Check,
  FileText,
} from 'lucide-react';
import { SkeletonNotificationCard } from '../components/Skeleton';
import PullToRefresh from '../components/PullToRefresh';

const CATEGORIES = [
  { id: 'all',         label: 'All' },
  { id: 'appointment', label: 'Visits' },
  { id: 'medicine',    label: 'Meds' },
  { id: 'alert',       label: 'Campus' },
  { id: 'message',     label: 'Messages' },
];

const ICON_MAP = {
  appointment: <Calendar   className="w-4 h-4" />,
  medicine:    <Stethoscope className="w-4 h-4" />,
  alert:       <AlertCircle className="w-4 h-4" />,
  message:     <MessageSquare className="w-4 h-4" />,
  prescription:<FileText   className="w-4 h-4" />,
  default:     <Bell        className="w-4 h-4" />,
};

const COLOR_MAP = {
  appointment: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
  medicine:    'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
  alert:       'bg-rose-500/20 text-rose-400 border-rose-500/20',
  message:     'bg-sky-500/20 text-sky-400 border-sky-500/20',
  prescription:'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
  default:     'bg-slate-700 text-slate-400 border-slate-700',
};

export default function Notifications() {
  const { user }           = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [notifications, setNotifications]   = useState([]);
  const [loading, setLoading]               = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`/notifications/student/${user.email}`);
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchNotifications();
  }, [user]);

  const filteredNotifications = activeCategory === 'all'
    ? notifications
    : notifications.filter(n => n.category === activeCategory);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`/notifications/mark-all-read/${user.email}`);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const diff  = Math.floor((Date.now() - date) / 1000 / 60);
    if (diff < 1)    return 'Just now';
    if (diff < 60)   return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-900">

      {/* Category chips + mark-all-read */}
      <div
        className="sticky z-10 bg-slate-900 px-4 pt-3 pb-3 space-y-3"
        style={{ top: 'var(--header-total)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0 border transition-all pressable ${
                  activeCategory === cat.id
                    ? 'bg-teal-500 text-slate-950 border-teal-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="ml-3 flex items-center gap-1.5 text-[10px] font-black text-teal-400 uppercase tracking-widest whitespace-nowrap pressable flex-shrink-0"
            >
              <Check className="w-3 h-3" /> All Read
            </button>
          )}
        </div>

        {unreadCount > 0 && (
          <p className="text-xs text-slate-500 font-semibold">
            <span className="text-teal-400 font-black">{unreadCount}</span> unread notification{unreadCount > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* List with Pull-to-Refresh */}
      <PullToRefresh onRefresh={fetchNotifications} className="flex-1">
        <main className="px-4 pt-2 pb-4">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map(i => <SkeletonNotificationCard key={i} />)}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
                <Bell className="w-7 h-7 text-slate-500" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">All Clear</h3>
              <p className="text-slate-400 text-sm">No notifications in this category.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notif, i) => {
                const icon  = ICON_MAP[notif.category]  || ICON_MAP.default;
                const color = COLOR_MAP[notif.category] || COLOR_MAP.default;
                return (
                  <div
                    key={notif._id || i}
                    className={`bg-slate-800 border rounded-2xl p-4 flex items-start gap-3 transition-all ${
                      notif.read ? 'border-slate-700/40 opacity-70' : 'border-teal-500/20'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${color}`}>
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className={`text-sm font-black leading-tight ${notif.read ? 'text-slate-400' : 'text-white'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-teal-400 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-snug line-clamp-2 mb-1">{notif.desc}</p>
                      <span className="text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(notif.created_at)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif._id)}
                          className="w-8 h-8 bg-teal-500/15 border border-teal-500/20 text-teal-400 rounded-lg flex items-center justify-center pressable"
                          title="Mark as read"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif._id)}
                        className="w-8 h-8 bg-slate-700/60 text-slate-500 rounded-lg flex items-center justify-center pressable"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </PullToRefresh>
    </div>
  );
}
