import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const show = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);

    // Auto-dismiss
    setTimeout(() => {
      setToasts(prev =>
        prev.map(t => t.id === id ? { ...t, exiting: true } : t)
      );
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 280);
    }, duration);

    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev =>
      prev.map(t => t.id === id ? { ...t, exiting: true } : t)
    );
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 280);
  }, []);

  const success = useCallback((msg, dur) => show(msg, 'success', dur), [show]);
  const error   = useCallback((msg, dur) => show(msg, 'error',   dur), [show]);
  const info    = useCallback((msg, dur) => show(msg, 'info',    dur), [show]);
  const warning = useCallback((msg, dur) => show(msg, 'warning', dur), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, info, warning, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const CONFIG = {
  success: {
    bg:   'bg-emerald-500',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    )
  },
  error: {
    bg:   'bg-rose-500',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  },
  warning: {
    bg:   'bg-amber-500',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    )
  },
  info: {
    bg:   'bg-sky-500',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
};

function ToastContainer({ toasts, dismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed z-[99999] left-1/2 flex flex-col items-center gap-2 pointer-events-none"
      style={{
        bottom: 'calc(var(--nav-total) + 12px)',
        transform: 'translateX(-50%)',
        width: 'min(calc(100vw - 32px), 380px)'
      }}
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} dismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, dismiss }) {
  const cfg = CONFIG[toast.type] || CONFIG.info;
  return (
    <div
      className={`
        pointer-events-auto w-full flex items-center gap-3 px-4 py-3 rounded-2xl
        text-white text-sm font-semibold shadow-xl cursor-pointer
        ${cfg.bg}
        ${toast.exiting ? 'toast-exit' : 'toast-enter'}
      `}
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}
      onClick={() => dismiss(toast.id)}
      role="alert"
    >
      {cfg.icon}
      <span className="flex-1 leading-snug">{toast.message}</span>
      <svg className="w-3.5 h-3.5 opacity-70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );
}
