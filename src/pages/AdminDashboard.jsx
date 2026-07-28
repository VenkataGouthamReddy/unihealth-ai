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
  Filter, 
  Download, 
  MoreVertical, 
  Shield, 
  Mail, 
  Calendar, 
  Loader2,
  UserX, 
  FileText, 
  CheckCircle, 
  BarChart3, 
  Settings, 
  PlusCircle, 
  LogOut,
  Globe, 
  Bell, 
  Save, 
  Lock, 
  Cpu, 
  History, 
  Activity,
  ArrowUpRight,
  TrendingUp,
  Info,
  UserPlus,
  CalendarCheck,
  Terminal,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  KeyRound,
  Menu,
  X
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [stats, setStats] = useState({ students: 0, doctors: 0, appointments: 0, revenue: '0' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'doctors') {
      setLoading(true);
      fetchUsers();
    } else if (activeTab === 'overview') {
      setLoading(true);
      fetchStats().then(() => setLoading(false));
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

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex font-sans relative">
      {/* Mobile Header (Hamburger) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 w-full absolute top-0 bg-[#0f172a] z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-black tracking-tight">Admin <span className="text-primary">Panel</span></h1>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-400">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 md:w-80 border-r border-slate-800 bg-[#0f172a] p-6 md:p-8 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 mb-12 hidden md:flex">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight">Admin <span className="text-primary">Panel</span></h1>
        </div>

        <nav className="flex-1 space-y-2 mt-12 md:mt-0">
          <SidebarItem icon={<BarChart3 className="w-5 h-5" />} label="Overview" active={activeTab === 'overview'} onClick={() => {setActiveTab('overview'); setSidebarOpen(false);}} />
          <SidebarItem icon={<Users className="w-5 h-5" />} label="Users" active={activeTab === 'users'} onClick={() => {setActiveTab('users'); setSidebarOpen(false);}} />
          <SidebarItem icon={<UserCheck className="w-5 h-5" />} label="Doctor Verification" active={activeTab === 'doctors'} onClick={() => {setActiveTab('doctors'); setSidebarOpen(false);}} />
          <SidebarItem icon={<Shield className="w-5 h-5" />} label="Security Hub" active={activeTab === 'security'} onClick={() => {setActiveTab('security'); setSidebarOpen(false);}} />
          <SidebarItem icon={<Settings className="w-5 h-5" />} label="Settings" active={activeTab === 'settings'} onClick={() => {setActiveTab('settings'); setSidebarOpen(false);}} />
        </nav>

        <button 
          onClick={logout}
          className="mt-auto flex items-center gap-3 p-4 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all font-bold"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 pt-24 md:p-12 md:pt-12 overflow-y-auto min-w-0">
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black">System Overview</h2>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all">
                  <Download className="w-4 h-4" /> Export Report
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdminStatCard title="Students" value={stats.students} trend="+12%" icon={<Users className="w-6 h-6" />} color="text-blue-500" />
              <AdminStatCard title="Doctors" value={stats.doctors} trend="+4%" icon={<UserCheck className="w-6 h-6" />} color="text-emerald-500" />
              <AdminStatCard title="Appointments" value={stats.appointments} trend="+18%" icon={<Calendar className="w-6 h-6" />} color="text-amber-500" />
              <AdminStatCard title="Revenue" value={`$${stats.revenue}`} trend="+24%" icon={<Globe className="w-6 h-6" />} color="text-indigo-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 md:p-8 rounded-3xl overflow-hidden">
                <h3 className="text-xl font-bold mb-6">User Growth Analytics</h3>
                <div className="h-64 flex items-end gap-2">
                  {[40, 70, 45, 90, 65, 80, 55, 75, 50, 85, 60, 95].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/20 rounded-t-lg relative group">
                      <div className="absolute inset-x-0 bottom-0 bg-primary rounded-t-lg transition-all" style={{ height: `${h}%` }}></div>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs">{h}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl">
                <h3 className="text-xl font-bold mb-6">Recent Critical Alerts</h3>
                <div className="space-y-6">
                  <AlertItem type="emergency" title="SOS Alert" desc="Student reported emergency." time="2m ago" />
                  <AlertItem type="security" title="Login Failure" desc="Failed login from IP 45.x.x.x" time="15m ago" />
                  <AlertItem type="info" title="System Backup" desc="Database backup successful." time="1h ago" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black">User Management</h2>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="Search users..." className="bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-primary transition-all" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">User</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Role</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Joined</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-20 text-slate-500 animate-pulse font-bold">Synchronizing Data...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-20 text-slate-500 font-bold">No users found.</td></tr>
                  ) : users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/30 transition-all">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-bold">{u.full_name || u.name}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${u.role === 'admin' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : u.role === 'doctor' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Active
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {u.role === 'student' && (
                            <button 
                              onClick={() => handleUpdateRole(u._id, 'doctor')}
                              title="Promote to Doctor"
                              className="p-2 text-slate-500 hover:text-indigo-500 transition-all"
                            >
                              <UserCheck className="w-5 h-5" />
                            </button>
                          )}
                          <button className="p-2 text-slate-500 hover:text-primary transition-all"><Mail className="w-5 h-5" /></button>
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-2 text-slate-500 hover:text-rose-500 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-3xl font-black">Doctor Verification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {users.filter(u => u.role === 'doctor').length === 0 ? (
                <div className="col-span-2 text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                  <p className="text-slate-500 font-bold uppercase tracking-widest">No doctors to verify.</p>
                </div>
              ) : users.filter(u => u.role === 'doctor').map(doc => (
                <div key={doc._id} className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                      <UserCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{doc.full_name || doc.name}</h3>
                      <p className="text-sm text-slate-500">{doc.email}</p>
                      <div className="mt-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Verified Professional
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-700 group-hover:text-white transition-all" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-10 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-white">Security Hub</h2>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 text-xs font-black uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> System Status: Optimal
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Database</div>
                <div className="text-lg font-bold">MongoDB Atlas</div>
                <div className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Encrypted</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Protocol</div>
                <div className="text-lg font-bold">HTTPS / TLS 1.3</div>
                <div className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Active Sessions</div>
                <div className="text-lg font-bold">142</div>
                <div className="text-xs text-indigo-400 font-bold mt-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Monitoring</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Threat Level</div>
                <div className="text-lg font-bold text-emerald-500">None</div>
                <div className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Clear</div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3"><Activity className="text-primary" /> Real-time Security Access Log</h3>
              <div className="space-y-4">
                <SecurityLogItem ip="192.168.1.45" action="Admin Login" status="Success" time="09:42:01" />
                <SecurityLogItem ip="45.12.8.21" action="User Login Attempt" status="Success" time="09:38:12" />
                <SecurityLogItem ip="103.4.1.9" action="API Token Generation" status="Success" time="09:35:45" />
                <SecurityLogItem ip="22.1.9.112" action="Unauthorized API Access" status="Blocked" time="09:12:04" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-10 animate-fade-in">
             <div className="mb-12">
                <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">Platform Settings</h1>
                <p className="text-slate-400 font-medium text-lg tracking-tight">Global configuration and notification engine orchestration.</p>
             </div>
             
             <div className="grid lg:grid-cols-2 gap-10">
                {/* Notification Engine */}
                <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] backdrop-blur-xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all"></div>
                   <h3 className="text-xl font-bold mb-10 flex items-center gap-4 text-white">
                      <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                         <Bell className="w-6 h-6" />
                      </div>
                      Notification Engine
                   </h3>
                   <div className="space-y-8">
                      <SettingToggle 
                         label="New User Registration" 
                         desc="Notify admins when a student or doctor joins." 
                         active={true} 
                         color="text-blue-400"
                         icon={<UserPlus className="w-4 h-4" />}
                      />
                      <SettingToggle 
                         label="Emergency SOS Alerts" 
                         desc="Immediate priority notification for medical emergencies." 
                         active={true} 
                         color="text-rose-400"
                         icon={<ShieldAlert className="w-4 h-4" />}
                      />
                      <SettingToggle 
                         label="Appointment Confirmations" 
                         desc="Send automated emails to students upon booking." 
                         active={false} 
                         color="text-emerald-400"
                         icon={<CalendarCheck className="w-4 h-4" />}
                      />
                      <SettingToggle 
                         label="Daily System Report" 
                         desc="Morning summary of campus health trends." 
                         active={true} 
                         color="text-amber-400"
                         icon={<FileText className="w-4 h-4" />}
                      />
                   </div>
                </div>

                {/* Advanced Controls */}
                <div className="space-y-10">
                   <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] backdrop-blur-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all"></div>
                      <h3 className="text-xl font-bold mb-10 flex items-center gap-4 text-white">
                         <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                            <Shield className="w-6 h-6" />
                         </div>
                         Advanced Control
                      </h3>
                      <div className="space-y-8">
                         <SettingToggle 
                            label="Maintenance Mode" 
                            desc="Take the entire platform offline for updates." 
                            active={false} 
                            color="text-indigo-400"
                            icon={<Settings className="w-4 h-4" />}
                         />
                         <SettingToggle 
                            label="Debug Logging" 
                            desc="Capture detailed API logs for development." 
                            active={true} 
                            color="text-slate-400"
                            icon={<Terminal className="w-4 h-4" />}
                         />
                      </div>
                   </div>

                   <button className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-8 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group">
                      Deploy System Changes 
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SettingToggle({ label, desc, active, color, icon }) {
   const [isActive, setIsActive] = React.useState(active);
   return (
      <div className="flex items-center justify-between group py-2">
         <div className="flex gap-5 max-w-[80%]">
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${color} border border-white/5 transition-all group-hover:scale-110`}>
               {icon}
            </div>
            <div>
               <div className="text-base font-bold text-white mb-1 group-hover:text-primary transition-colors">{label}</div>
               <div className="text-[11px] text-slate-500 font-medium leading-relaxed">{desc}</div>
            </div>
         </div>
         <button 
            onClick={() => setIsActive(!isActive)}
            className={`w-16 h-8 rounded-full p-1.5 transition-all duration-500 flex relative ${isActive ? 'bg-primary' : 'bg-slate-800'}`}
         >
            <div className={`w-5 h-5 bg-white rounded-full shadow-xl transition-all duration-500 transform ${isActive ? 'translate-x-8' : 'translate-x-0'}`}></div>
         </button>
      </div>
   );
}

function SecurityLogItem({ ip, action, status, time }) {
   return (
      <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
         <div className="flex items-center gap-6">
            <div className="text-xs font-black text-slate-400 font-mono tracking-tighter">{ip}</div>
            <div>
               <div className="text-sm font-bold text-white">{action}</div>
               <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{time} UTC</div>
            </div>
         </div>
         <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
            status === 'Success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
         }`}>
            {status}
         </div>
      </div>
   );
}

function SidebarItem({ icon, label, active, onClick }) {
   return (
      <button 
         onClick={onClick}
         className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
            active 
            ? 'bg-primary text-white shadow-lg shadow-blue-500/20' 
            : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
         }`}
      >
         <span className={active ? 'text-white' : 'text-slate-600'}>{icon}</span>
         {label}
         {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
      </button>
   );
}

function AdminStatCard({ title, value, trend, icon, color }) {
   return (
      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
         <div className="flex justify-between items-center mb-4">
            <div className={`p-3 bg-slate-800 rounded-2xl ${color}`}>{icon}</div>
            <div className={`text-xs font-black ${trend.includes('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
               {trend}
            </div>
         </div>
         <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</div>
         <div className="text-3xl font-black text-white">{value}</div>
      </div>
   );
}

function AlertItem({ type, title, desc, time }) {
   const colors = {
      emergency: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      security: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      info: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
   };

   return (
      <div className="flex gap-4 p-4 hover:bg-slate-800/50 rounded-2xl transition-all">
         <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${colors[type]}`}>
            {type === 'emergency' ? <ShieldAlert className="w-5 h-5" /> : type === 'security' ? <Lock className="w-5 h-5" /> : <Info className="w-5 h-5" />}
         </div>
         <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
               <h5 className="text-xs font-black text-white">{title}</h5>
               <span className="text-[10px] font-bold text-slate-500">{time}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold truncate">{desc}</p>
         </div>
      </div>
   );
}
