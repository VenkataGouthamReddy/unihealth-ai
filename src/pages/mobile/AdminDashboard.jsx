import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Trash2, 
  Search, 
  Download, 
  Mail, 
  Calendar, 
  Loader2,
  BarChart3, 
  LogOut,
  Globe, 
  Bell, 
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Lock,
  Info
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [stats, setStats] = useState({ students: 0, doctors: 0, appointments: 0, revenue: '0' });
  const [appointments, setAppointments] = useState([]);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastDesc, setBroadcastDesc] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/admin/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'doctors') {
      setLoading(true);
      fetchUsers();
    } else if (activeTab === 'overview') {
      setLoading(true);
      fetchStats().then(() => setLoading(false));
    } else if (activeTab === 'appointments') {
      setLoading(true);
      fetchAppointments();
    }
  }, [activeTab]);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/admin/users/${userId}/role?role=${newRole}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      alert(`User role updated to ${newRole}`);
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update user role.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user.");
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/admin/appointments/${appointmentId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(appointments.map(a => a._id === appointmentId ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error("Error updating appointment status:", err);
      alert("Failed to update status.");
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastDesc) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/admin/notify-all', {
        title: broadcastTitle,
        desc: broadcastDesc
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Broadcast sent successfully to all students.");
      setBroadcastTitle('');
      setBroadcastDesc('');
    } catch (err) {
      console.error("Error sending broadcast:", err);
      alert("Failed to send broadcast.");
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans pb-4">
      
      {/* Mobile Top Header */}
      <div className="sticky top-0 z-40 bg-[#0f172a]/90 backdrop-blur-md pt-3 pb-2 px-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">Admin Panel</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">System Control</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="w-9 h-9 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center text-rose-400 pressable">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-3.5 h-3.5" /> },
            { id: 'users', label: 'Users', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'doctors', label: 'Doctors', icon: <UserCheck className="w-3.5 h-3.5" /> },
            { id: 'appointments', label: 'Appts', icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: 'broadcasts', label: 'Broadcasts', icon: <Bell className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0 transition-colors pressable ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                  : 'bg-slate-800/50 border border-slate-700/60 text-slate-400'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 pt-4 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-3" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Loading Admin Data...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <AdminStatCard title="Students" value={stats.students} trend="+12%" icon={<Users />} color="text-blue-400 bg-blue-500/10 border-blue-500/20" />
                  <AdminStatCard title="Doctors" value={stats.doctors} trend="+4%" icon={<UserCheck />} color="text-emerald-400 bg-emerald-500/10 border-emerald-500/20" />
                  <AdminStatCard title="Appts" value={stats.appointments} trend="+18%" icon={<Calendar />} color="text-amber-400 bg-amber-500/10 border-amber-500/20" />
                  <AdminStatCard title="Revenue" value={`$${stats.revenue}`} trend="+24%" icon={<Globe />} color="text-indigo-400 bg-indigo-500/10 border-indigo-500/20" />
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700/60 p-5 rounded-3xl">
                  <h3 className="text-sm font-black text-white mb-4">Critical Alerts</h3>
                  <div className="space-y-3">
                    <AlertItem type="emergency" title="SOS Alert" desc="Student reported emergency." time="2m ago" />
                    <AlertItem type="security" title="Login Failure" desc="Failed login from IP 45.x" time="15m ago" />
                    <AlertItem type="info" title="System Backup" desc="Database backup successful." time="1h ago" />
                  </div>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="space-y-4 animate-fade-in">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="search" 
                    placeholder="Search users..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/60 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder-slate-500 outline-none focus:border-teal-500 transition-colors" 
                  />
                </div>
                
                <div className="space-y-3">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-10"><p className="text-slate-500 font-bold">No users found.</p></div>
                  ) : (
                    filteredUsers.map(u => (
                      <div key={u._id} className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-black text-white">{u.full_name || u.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{u.email}</p>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                            u.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                            u.role === 'doctor' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 mt-1">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            Joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                          </p>
                          <div className="flex gap-2">
                            {u.role === 'student' && (
                              <button onClick={() => handleUpdateRole(u._id, 'doctor')} className="w-8 h-8 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center pressable" title="Promote to Doctor">
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => handleDeleteUser(u._id)} className="w-8 h-8 bg-rose-500/10 text-rose-400 rounded-lg flex items-center justify-center pressable">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* DOCTORS TAB */}
            {activeTab === 'doctors' && (
              <div className="space-y-3 animate-fade-in">
                {users.filter(u => u.role === 'doctor').length === 0 ? (
                  <div className="text-center py-16">
                    <UserCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">No doctors pending verification.</p>
                  </div>
                ) : (
                  users.filter(u => u.role === 'doctor').map(doc => (
                    <div key={doc._id} className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 flex-shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white truncate">{doc.full_name || doc.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{doc.email}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Verified</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div className="space-y-3 animate-fade-in">
                {appointments.length === 0 ? (
                  <div className="text-center py-16">
                    <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">No appointments found.</p>
                  </div>
                ) : (
                  appointments.map(apt => (
                    <div key={apt._id} className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Student</p>
                          <p className="text-sm font-black text-white">{apt.student_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Doctor</p>
                          <p className="text-sm font-black text-teal-400">{apt.doctor_name || apt.doctor_id || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-900/50 rounded-xl p-3 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-white">{apt.date}</p>
                          <p className="text-[10px] font-bold text-slate-400">{apt.time}</p>
                        </div>
                        <select 
                          value={apt.status}
                          onChange={(e) => handleUpdateAppointmentStatus(apt._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border outline-none appearance-none cursor-pointer ${
                            apt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            apt.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="expired">Expired</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* BROADCASTS TAB */}
            {activeTab === 'broadcasts' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-slate-800/50 border border-slate-700/60 p-5 rounded-3xl">
                  <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-black text-white mb-1">Global Broadcast</h2>
                  <p className="text-xs text-slate-400 mb-5">Send a push notification to all students.</p>
                  
                  <form onSubmit={handleSendBroadcast} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Title</label>
                      <input 
                        type="text" required value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)}
                        placeholder="e.g. Clinic Update"
                        className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Message</label>
                      <textarea 
                        required value={broadcastDesc} onChange={e => setBroadcastDesc(e.target.value)}
                        placeholder="Detailed message..."
                        className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-indigo-500 h-28 resize-none"
                      />
                    </div>
                    <button type="submit" className="w-full py-4 bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 pressable shadow-lg shadow-indigo-500/20">
                      <Bell className="w-4 h-4" /> Send to All
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function AdminStatCard({ title, value, trend, icon, color }) {
  return (
    <div className={`p-4 rounded-2xl border ${color} flex flex-col`}>
      <div className="flex justify-between items-start mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10">
          {React.cloneElement(icon, { className: "w-4 h-4" })}
        </div>
        <span className="text-[10px] font-black tracking-widest">{trend}</span>
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">{title}</div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  );
}

function AlertItem({ type, title, desc, time }) {
  const colors = {
    emergency: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    security: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    info: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${colors[type]}`}>
        {type === 'emergency' ? <ShieldAlert className="w-4 h-4" /> : type === 'security' ? <Lock className="w-4 h-4" /> : <Info className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-white">{title}</p>
        <p className="text-[10px] text-slate-400 font-bold truncate">{desc}</p>
      </div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{time}</p>
    </div>
  );
}
