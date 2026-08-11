import React, { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home, Stethoscope, Calendar, Bot, User,
  LayoutDashboard, Users, ClipboardList, Wallet, Bell,
  BarChart3, Shield, Settings,
} from 'lucide-react';

// Haptic feedback helper
function haptic(pattern = [8]) {
  try {
    if (navigator?.vibrate) navigator.vibrate(pattern);
  } catch (_) {}
}

// ─── Student Nav ─────────────────────────────────────────────────────────────
const STUDENT_NAV = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/student',
    match: (p) => p === '/student',
  },
  {
    id: 'doctors',
    label: 'Doctors',
    icon: Stethoscope,
    path: '/student/doctors',
    match: (p) => p.startsWith('/student/doctors') || p.startsWith('/student/book'),
  },
  {
    id: 'appointments',
    label: 'Bookings',
    icon: Calendar,
    path: '/student/appointments',
    match: (p) => p.startsWith('/student/appointments'),
  },
  {
    id: 'ai',
    label: 'AI Health',
    icon: Bot,
    path: '/student/ai-assistant',
    badge: 'AI',
    match: (p) =>
      p.startsWith('/student/ai') ||
      p.startsWith('/student/symptom'),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    match: (p) => p.startsWith('/profile'),
  },
];

// ─── Doctor Nav ───────────────────────────────────────────────────────────────
const DOCTOR_NAV = [
  {
    id: 'home',
    label: 'Overview',
    icon: LayoutDashboard,
    path: '/doctor',
    match: (p) => p === '/doctor',
  },
  {
    id: 'appointments',
    label: 'Patients',
    icon: Users,
    path: '/doctor/appointments-today',
    match: (p) => p.startsWith('/doctor/appointments'),
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: Calendar,
    path: '/doctor/schedule',
    match: (p) => p.startsWith('/doctor/schedule'),
  },
  {
    id: 'prescriptions',
    label: 'Scripts',
    icon: ClipboardList,
    path: '/doctor/add-prescription',
    match: (p) => p.startsWith('/doctor/add-prescription'),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    match: (p) => p.includes('/profile'),
  },
];

// ─── Admin Nav ────────────────────────────────────────────────────────────────
const ADMIN_NAV = [
  {
    id: 'home',
    label: 'Overview',
    icon: BarChart3,
    path: '/admin',
    match: (p) => p === '/admin',
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    path: '/admin/manage-users',
    match: (p) => p.startsWith('/admin/manage-users'),
  },
  {
    id: 'appointments',
    label: 'Bookings',
    icon: Calendar,
    path: '/admin/analytics',
    match: (p) => p.startsWith('/admin/analytics'),
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: Bell,
    path: '/admin/campus-alerts',
    match: (p) => p.startsWith('/admin/campus-alerts') || p.startsWith('/admin/notifications'),
  },
  {
    id: 'settings',
    label: 'System',
    icon: Settings,
    path: '/admin',
    match: () => false,
  },
];

export default function MobileBottomNav() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const path        = location.pathname;

  const hideOnPaths = [
    '/', '/login', '/register', '/splash', '/welcome', 
    '/onboarding/1', '/onboarding/2', '/onboarding/3',
    '/role-selection', '/forgot-password', '/verify-otp', '/reset-password'
  ];

  if (!user || hideOnPaths.includes(path)) return null;

  const navItems =
    user.role === 'doctor' ? DOCTOR_NAV :
    user.role === 'admin'  ? ADMIN_NAV  :
    STUDENT_NAV;

  const handleTab = useCallback((item) => {
    haptic([6]);
    navigate(item.path);
  }, [navigate]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[995] glass-dark border-t border-white/[0.07] shadow-[0_-8px_32px_rgba(0,0,0,0.4)]"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="flex items-stretch justify-around" style={{ height: 'var(--nav-height)' }}>
        {navItems.map((item) => {
          const Icon   = item.icon;
          const active = item.match(path);

          return (
            <button
              key={item.id}
              onClick={() => handleTab(item)}
              aria-label={item.label}
              className={`
                relative flex flex-col items-center justify-center flex-1 gap-0.5
                transition-all duration-200 active:scale-90
                min-w-[44px] min-h-[44px]
                ${active ? 'text-teal-400' : 'text-slate-500'}
              `}
            >
              {/* Active top pill */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-teal-400 rounded-b-full shadow-[0_2px_10px_#2dd4bf]" />
              )}

              {/* Icon with optional badge */}
              <div className="relative">
                <Icon
                  className={`transition-all duration-200 ${
                    active ? 'scale-110' : 'scale-100'
                  }`}
                  style={{
                    width:       active ? 22 : 20,
                    height:      active ? 22 : 20,
                    strokeWidth: active ? 2.5 : 1.8,
                  }}
                />
                {item.badge && (
                  <span className="absolute -top-2 -right-3.5 bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide shadow-sm leading-none">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] leading-none font-${active ? 'bold' : 'medium'} tracking-tight`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
