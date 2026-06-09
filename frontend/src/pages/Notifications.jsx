import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Bell, 
  Calendar, 
  Stethoscope, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Clock,
  Filter,
  MoreVertical,
  Check,
  Zap,
  ShieldCheck,
  X,
  Loader2,
  FileText
} from 'lucide-react';

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`/notifications/student/${user.email}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchNotifications();
  }, [user]);

  const categories = [
    { id: 'all', label: 'All Alerts' },
    { id: 'appointment', label: 'Visits' },
    { id: 'medicine', label: 'Meds' },
    { id: 'alert', label: 'Campus' },
    { id: 'message', label: 'Messages' }
  ];

  const filteredNotifications = activeCategory === 'all' 
    ? notifications 
    : notifications.filter(n => n.category === activeCategory);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`/notifications/mark-all-read/${user.email}`);
      fetchNotifications();
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const getIcon = (category) => {
    switch (category) {
      case 'appointment': return <Calendar className="w-6 h-6" />;
      case 'medicine': return <Stethoscope className="w-6 h-6" />;
      case 'alert': return <AlertCircle className="w-6 h-6" />;
      case 'message': return <MessageSquare className="w-6 h-6" />;
      case 'prescription': return <FileText className="w-6 h-6" />;
      default: return <Bell className="w-6 h-6" />;
    }
  };

  const getColor = (category) => {
    switch (category) {
      case 'appointment': return 'text-blue-500 bg-blue-50 border-blue-100';
      case 'medicine': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'alert': return 'text-rose-500 bg-rose-50 border-rose-100';
      case 'message': return 'text-primary bg-primary/5 border-primary/10';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60); // minutes
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="fixed top-0 w-full z-50 glass border-b border-white/20 px-8 py-4 flex items-center justify-between backdrop-blur-xl">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate('/student')} className="p-3 hover:bg-slate-100 rounded-2xl transition-all hover:scale-105 active:scale-95">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Notification <span className="text-primary">Center</span></h1>
         </div>
         <button 
           onClick={markAllRead}
           className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
         >
            Clear All Unread
         </button>
      </header>

      <main className="mt-28 flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full mb-20">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-md">
               <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight leading-none">Stay <span className="text-primary">Informed</span></h2>
               <p className="text-slate-500 font-medium text-lg leading-relaxed">Real-time updates on clinical visits, medical reports, and campus health alerts.</p>
            </div>
            
            {/* Category Pills */}
            <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
               {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeCategory === cat.id ? 'bg-primary text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {cat.label}
                  </button>
               ))}
            </div>
        </div>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-40">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Updating Feed...</p>
           </div>
        ) : filteredNotifications.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-40 text-center bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-inner">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center shadow-inner mb-8 ring-8 ring-slate-50/50">
                 <CheckCircle2 className="w-12 h-12 text-emerald-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No notifications available</h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">Your timeline is clean. Real-time updates from your clinic and health goals will appear here.</p>
           </div>
        ) : (
           <div className="space-y-6">
              {filteredNotifications.map(notification => (
                 <div 
                   key={notification._id} 
                   className={`bg-white p-8 rounded-[3.5rem] border flex flex-col sm:flex-row items-start gap-8 relative transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/40 group
                     ${notification.read ? 'opacity-80 border-slate-100' : 'border-primary/20 shadow-xl shadow-slate-200/20 ring-4 ring-primary/5'}
                   `}
                 >
                    {!notification.read && (
                       <div className="absolute top-8 right-8 flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
                          <span className="text-[8px] font-black text-primary uppercase tracking-widest">New Alert</span>
                       </div>
                    )}
                    
                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 border group-hover:rotate-6 transition-transform duration-500 shadow-inner ${getColor(notification.category)}`}>
                       {getIcon(notification.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start mb-2">
                          <h4 className={`text-2xl font-black tracking-tight group-hover:text-primary transition-colors ${notification.read ? 'text-slate-600' : 'text-slate-900'}`}>
                             {notification.title}
                          </h4>
                       </div>
                       <p className="text-lg font-medium text-slate-500 leading-relaxed mb-8">
                          {notification.desc}
                       </p>
                       
                       <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                          <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg">
                               <Clock className="w-3.5 h-3.5" /> {formatTime(notification.created_at)}
                            </span>
                            {!notification.read && (
                               <button 
                                 onClick={() => markAsRead(notification._id)}
                                 className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:scale-105 transition-all"
                               >
                                  <Check className="w-4 h-4" /> Mark as read
                               </button>
                            )}
                          </div>
                          <button 
                            onClick={() => deleteNotification(notification._id)}
                            className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all hover:scale-110 active:scale-95"
                            title="Dismiss Notification"
                          >
                             <Trash2 className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        )}

        <div className="mt-16 p-12 bg-slate-900 rounded-[4rem] text-white relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="relative z-10">
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                    <Zap className="w-6 h-6 text-primary fill-primary" />
                 </div>
                 <h4 className="text-2xl font-black tracking-tight">Active Intelligence Feed</h4>
               </div>
               <p className="text-slate-400 text-lg font-medium mb-10 leading-relaxed max-w-xl">
                  UniHealth AI monitors your clinical schedule and health timings to provide timely interventions. Your feed is encrypted and synced in real-time.
               </p>
               <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div> Network Active & Protected
               </div>
            </div>
        </div>
      </main>
    </div>
  );
}
