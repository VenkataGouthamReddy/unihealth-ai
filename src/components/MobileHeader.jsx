import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Bell, Shield, Sparkles, LayoutDashboard, Settings } from 'lucide-react';

const ROUTE_TITLES = {
  '/':                          'UniHealth AI',
  '/splash':                    '',
  '/welcome':                   'Welcome',
  '/login':                     'Sign In',
  '/register':                  'Create Account',
  '/forgot-password':           'Reset Password',
  '/verify-otp':                'Verification',
  '/reset-password':            'New Password',
  '/role-selection':            'Select Portal',
  '/onboarding/1':              'Getting Started',
  '/onboarding/2':              'How it Works',
  '/onboarding/3':              'Your Health',
  '/student':                   'Home',
  '/student/smart-home':        'Smart Health',
  '/student/doctors':           'Find Doctors',
  '/student/appointments':      'My Appointments',
  '/student/records':           'Health Records',
  '/student/ai-assistant':      'AI Health',
  '/student/ai-chat':           'AI Consult',
  '/student/symptom-checker':   'Symptom Checker',
  '/student/reminders':         'Reminders',
  '/student/notifications':     'Notifications',
  '/student/profile':           'My Profile',
  '/student/settings':          'Settings',
  '/student/mood-tracker':      'Mood & Stress',
  '/student/upload-prescription': 'Upload Prescription',
  '/student/health-tips':       'Health Tips',
  '/student/emergency':         'Emergency',
  '/doctor':                    'Doctor Portal',
  '/doctor/appointments-today': 'Today\'s Patients',
  '/doctor/schedule':           'My Schedule',
  '/doctor/chat':               'Patient Messaging',
  '/doctor/add-prescription':   'New Prescription',
  '/admin':                     'Admin Console',
  '/admin/manage-doctors':      'Manage Doctors',
  '/admin/manage-users':        'Manage Users',
  '/admin/analytics':           'Analytics',
  '/admin/reports':             'Reports',
  '/admin/notifications':       'Notifications',
  '/admin/campus-alerts':       'Campus Alerts',
  '/profile':                   'My Profile',
  '/wellness-tracking':         'Wellness',
  '/ai-health-insights':        'AI Insights',
  '/health-statistics':         'Statistics',
  '/feedback':                  'Feedback',
};

// Routes where MobileHeader is hidden entirely
const HIDDEN_ROUTES = ['/', '/splash'];

// Routes that are "root" screens — no back button, show brand icon instead
const TAB_ROOT_ROUTES = [
  '/student', '/student/doctors', '/student/appointments',
  '/student/ai-assistant', '/student/profile',
  '/doctor', '/admin',
];

export default function MobileHeader() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const { goBack, canGoBack } = useNavigation();

  const path = location.pathname;

  // Hide on splash/landing
  if (HIDDEN_ROUTES.includes(path) || path.startsWith('/onboarding')) {
    return null;
  }

  const getTitle = () => {
    if (ROUTE_TITLES[path]) return ROUTE_TITLES[path];
    if (path.includes('/book/'))            return 'Book Appointment';
    if (path.includes('/patient-details/')) return 'Patient File';
    return 'UniHealth AI';
  };

  const isTabRoot   = TAB_ROOT_ROUTES.includes(path);
  const showBack    = !isTabRoot || canGoBack;

  // Right-side action differs by role and route
  const RightAction = () => {
    if (!user) return <div className="w-11" />;
    if (user.role === 'student') {
      return (
        <button
          onClick={() => navigate('/student/notifications')}
          aria-label="Notifications"
          className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 active:scale-90 transition-all pressable"
        >
          <Bell className="w-4.5 h-4.5" />
          {/* Live dot */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_6px_#2dd4bf]" />
        </button>
      );
    }
    if (user.role === 'doctor') {
      return (
        <button
          onClick={() => navigate('/doctor')}
          aria-label="Dashboard"
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 active:scale-90 transition-all pressable"
        >
          <LayoutDashboard className="w-4.5 h-4.5" />
        </button>
      );
    }
    if (user.role === 'admin') {
      return (
        <button
          onClick={() => navigate('/admin')}
          aria-label="Admin Dashboard"
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 active:scale-90 transition-all pressable"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>
      );
    }
    return <div className="w-11" />;
  };

  const title = getTitle();
  const isAI  = path.includes('ai');

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[990] glass-dark border-b border-white/[0.07]"
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      <div
        className="flex items-center justify-between px-4"
        style={{ height: 'var(--header-height)' }}
      >
        {/* Left — Back or Brand */}
        <div className="flex items-center gap-2 min-w-[44px]">
          {showBack ? (
            <button
              onClick={goBack}
              aria-label="Go Back"
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 active:scale-90 transition-all pressable"
            >
              <ChevronLeft className="w-5 h-5 text-teal-400" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Shield className="w-4.5 h-4.5 fill-slate-950 text-slate-950" />
            </div>
          )}
        </div>

        {/* Center — Title */}
        <div className="flex-1 text-center px-2">
          <h1 className="text-[15px] font-bold text-white tracking-tight leading-none flex items-center justify-center gap-1.5">
            {title}
            {isAI && <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse flex-shrink-0" />}
          </h1>
          {user && !isTabRoot && (
            <p className="text-[10px] font-semibold text-teal-400/80 uppercase tracking-widest leading-none mt-0.5">
              UniHealth Native
            </p>
          )}
        </div>

        {/* Right — Contextual Action */}
        <div className="flex items-center justify-end min-w-[44px]">
          <RightAction />
        </div>
      </div>
    </header>
  );
}
