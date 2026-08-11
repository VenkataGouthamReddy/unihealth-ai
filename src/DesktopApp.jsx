import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Existing Pages
import Login from './pages/desktop/Login';
import Register from './pages/desktop/Register';
import StudentDashboard from './pages/desktop/StudentDashboard';
import AIAssistant from './pages/desktop/AIAssistant';
import Doctors from './pages/desktop/Doctors';
import Appointments from './pages/desktop/Appointments';
import BookAppointment from './pages/desktop/BookAppointment';
import DoctorDashboard from './pages/desktop/DoctorDashboard';
import AdminDashboard from './pages/desktop/AdminDashboard';
import HealthRecords from './pages/desktop/HealthRecords';
import Landing from './pages/desktop/Landing';
import ComingSoon from './pages/desktop/ComingSoon';
import Onboarding from './pages/desktop/Onboarding';
import Splash from './pages/desktop/auth/Splash';
import Welcome from './pages/desktop/auth/Welcome';
import ForgotPassword from './pages/desktop/auth/ForgotPassword';
import VerifyOTP from './pages/desktop/auth/VerifyOTP';
import ResetPassword from './pages/desktop/auth/ResetPassword';
import RoleSelection from './pages/desktop/auth/RoleSelection';
import SmartHealthHome from './pages/desktop/SmartHealthHome';
import AIChat from './pages/desktop/AIChat';
import SymptomChecker from './pages/desktop/SymptomChecker';
import Reminders from './pages/desktop/Reminders';
import Profile from './pages/desktop/Profile';
import Notifications from './pages/desktop/Notifications';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-teal-500">
            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2">UniHealth AI</h2>
        <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em] animate-pulse">Synchronizing Session...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'doctor' ? '/doctor' : '/student'} />;
  return children;
}

export default function App() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Router>
      {!isOnline && (
        <div className="fixed bottom-4 left-4 right-4 z-[9999] bg-rose-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-rose-500 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-3.536 5 5 0 011.414-3.536m0 0l2.829 2.829m-2.829 4.243L3 21M7.757 16.243L10.586 13.41M12 12a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <div className="text-xs font-black uppercase tracking-widest">
              Offline Mode — Check your connection
            </div>
          </div>
          <button onClick={() => setIsOnline(navigator.onLine)} className="text-[10px] font-black uppercase bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 active:scale-95 transition-all">
            Retry
          </button>
        </div>
      )}
      <Routes>
        {/* LANDING & AUTH */}
        <Route path="/" element={<Landing />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/onboarding/1" element={<Onboarding />} />
        <Route path="/onboarding/2" element={<Onboarding />} />
        <Route path="/onboarding/3" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/role-selection" element={<RoleSelection />} />

        {/* STUDENT PORTAL */}
        <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/smart-home" element={<ProtectedRoute role="student"><SmartHealthHome /></ProtectedRoute>} />
        <Route path="/student/doctors" element={<ProtectedRoute role="student"><Doctors /></ProtectedRoute>} />
        <Route path="/student/book/:doctorId" element={<ProtectedRoute role="student"><BookAppointment /></ProtectedRoute>} />
        <Route path="/student/appointments" element={<ProtectedRoute role="student"><Appointments /></ProtectedRoute>} />
        <Route path="/student/records" element={<ProtectedRoute role="student"><HealthRecords /></ProtectedRoute>} />
        
        {/* AI & WELLNESS */}
        <Route path="/student/ai-assistant" element={<ProtectedRoute role="student"><AIAssistant /></ProtectedRoute>} />
        <Route path="/student/ai-chat" element={<ProtectedRoute role="student"><AIChat /></ProtectedRoute>} />
        <Route path="/student/symptom-checker" element={<ProtectedRoute role="student"><SymptomChecker /></ProtectedRoute>} />
        <Route path="/student/mood-tracker" element={<ComingSoon title="Mood & Stress Tracker" />} />
        <Route path="/student/reminders" element={<ProtectedRoute role="student"><Reminders /></ProtectedRoute>} />
        <Route path="/student/notifications" element={<ProtectedRoute role="student"><Notifications /></ProtectedRoute>} />
        
        {/* HEALTH SERVICES */}
        <Route path="/student/upload-prescription" element={<ComingSoon title="Upload Prescription" />} />
        <Route path="/student/report-viewer" element={<ProtectedRoute role="student"><HealthRecords /></ProtectedRoute>} />
        <Route path="/student/health-tips" element={<ComingSoon title="Health Tips Feed" />} />
        <Route path="/student/emergency" element={<ComingSoon title="Emergency Support" />} />
        <Route path="/student/profile" element={<ProtectedRoute role="student"><Profile /></ProtectedRoute>} />
        <Route path="/student/settings" element={<ComingSoon title="Setting Screen" />} />

        {/* DOCTOR PORTAL */}
        <Route path="/doctor" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/appointments-today" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/patient-details/:id" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/schedule" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/add-prescription" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/chat" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />

        {/* ADMIN PORTAL */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/manage-doctors" element={<ComingSoon title="Manage Doctors" />} />
        <Route path="/admin/manage-users" element={<ComingSoon title="Manage Users" />} />
        <Route path="/admin/analytics" element={<ComingSoon title="Appointment Analytics" />} />
        <Route path="/admin/reports" element={<ComingSoon title="Report Management" />} />
        <Route path="/admin/notifications" element={<ComingSoon title="Notification Management" />} />
        <Route path="/admin/campus-alerts" element={<ComingSoon title="Campus Health Alerts" />} />

        {/* AI ENHANCED VIEWS */}
        <Route path="/student/dashboard-ai" element={<ComingSoon title="Student Dashboard (AI Enhanced)" />} />
        <Route path="/student/ai-assistant-pro" element={<ComingSoon title="AI Assistant Home (AI Enhanced)" />} />
        <Route path="/student/smart-home-pro" element={<ComingSoon title="Smart Health Home (AI Enhanced)" />} />
        
        {/* ANALYTICS & STATS */}
        <Route path="/wellness-tracking" element={<ComingSoon title="Wellness Tracking" />} />
        <Route path="/ai-health-insights" element={<ComingSoon title="AI Health Insights" />} />
        <Route path="/health-statistics" element={<ComingSoon title="Health Statistics" />} />
        <Route path="/feedback" element={<ComingSoon title="Feedback & Rating" />} />
        <Route path="/secure-access" element={<ComingSoon title="Secure Access Verification" />} />
        <Route path="/logout-confirm" element={<ComingSoon title="Logout Confirmation" />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
