import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Existing Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AIAssistant from './pages/AIAssistant';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HealthRecords from './pages/HealthRecords';
import Landing from './pages/Landing';
import ComingSoon from './pages/ComingSoon';
import Onboarding from './pages/Onboarding';
import Splash from './pages/auth/Splash';
import Welcome from './pages/auth/Welcome';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOTP from './pages/auth/VerifyOTP';
import ResetPassword from './pages/auth/ResetPassword';
import RoleSelection from './pages/auth/RoleSelection';
import SmartHealthHome from './pages/SmartHealthHome';
import AIChat from './pages/AIChat';
import SymptomChecker from './pages/SymptomChecker';
import Reminders from './pages/Reminders';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center font-black text-teal-600 animate-pulse">UniHealth AI Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'student' ? '/student' : '/doctor'} />;
  return children;
}

export default function App() {
  return (
    <Router>
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
        <Route path="/student/report-viewer" element={<ComingSoon title="Medical Reports Viewer" />} />
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
