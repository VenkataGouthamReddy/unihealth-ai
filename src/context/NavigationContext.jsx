import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationContext = createContext();

const ROOT_PATHS = [
  '/',
  '/student',
  '/student/smart-home',
  '/student/doctors',
  '/student/appointments',
  '/student/ai-assistant',
  '/student/profile',
  '/doctor',
  '/admin',
  '/login',
  '/register',
  '/welcome',
  '/splash'
];

export function NavigationProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Internal history stack independent of raw browser history
  const [stack, setStack] = useState([location.pathname]);
  const [transitionDirection, setTransitionDirection] = useState('fade'); // 'push', 'pop', 'fade'
  
  // Modals and Step handlers stacks
  const modalsRef = useRef([]);
  const stepHandlerRef = useRef(null);

  // Synchronize location changes with stack
  useEffect(() => {
    const currentPath = location.pathname;
    
    setStack((prevStack) => {
      // If path is a top-level tab root, reset or set single item
      if (ROOT_PATHS.includes(currentPath) && !currentPath.includes('/book/') && !currentPath.includes('/patient-details/')) {
        if (prevStack[prevStack.length - 1] === currentPath) return prevStack;
        return [currentPath];
      }
      
      // If pushing new sub-page
      if (prevStack[prevStack.length - 1] !== currentPath) {
        // If going back to a page already in stack
        if (prevStack.length > 1 && prevStack[prevStack.length - 2] === currentPath) {
          return prevStack.slice(0, prevStack.length - 1);
        }
        return [...prevStack, currentPath];
      }
      return prevStack;
    });
  }, [location.pathname]);

  // Modal Registration
  const registerModal = useCallback((id, closeFn) => {
    modalsRef.current = modalsRef.current.filter((m) => m.id !== id);
    modalsRef.current.push({ id, closeFn });
  }, []);

  const unregisterModal = useCallback((id) => {
    modalsRef.current = modalsRef.current.filter((m) => m.id !== id);
  }, []);

  // Multi-step Flow Registration
  const registerStepHandler = useCallback((id, canGoBackFn, onBackStepFn) => {
    stepHandlerRef.current = { id, canGoBackFn, onBackStepFn };
  }, []);

  const unregisterStepHandler = useCallback((id) => {
    if (stepHandlerRef.current?.id === id) {
      stepHandlerRef.current = null;
    }
  }, []);

  // Master Logical Back Handler
  const goBack = useCallback(() => {
    // 1. Priority: Close open modal/drawer if present
    if (modalsRef.current.length > 0) {
      const topModal = modalsRef.current.pop();
      if (topModal && typeof topModal.closeFn === 'function') {
        topModal.closeFn();
        return true;
      }
    }

    // 2. Priority: Multi-step form step back
    if (stepHandlerRef.current) {
      const { canGoBackFn, onBackStepFn } = stepHandlerRef.current;
      if (typeof canGoBackFn === 'function' && canGoBackFn()) {
        if (typeof onBackStepFn === 'function') {
          onBackStepFn();
          return true;
        }
      }
    }

    // 3. Priority: Internal history stack pop
    if (stack.length > 1) {
      const newStack = [...stack];
      newStack.pop(); // Remove current
      const previousPath = newStack[newStack.length - 1];
      setStack(newStack);
      setTransitionDirection('pop');
      navigate(previousPath);
      return true;
    }

    // 4. Priority: On tab root, navigate to primary home or maintain state
    setTransitionDirection('fade');
    return false;
  }, [stack, navigate]);

  // Custom Navigation Push
  const navigatePush = useCallback((path) => {
    setTransitionDirection('push');
    navigate(path);
  }, [navigate]);

  // Custom Navigation Tab Switch
  const navigateTab = useCallback((path) => {
    setTransitionDirection('fade');
    setStack([path]);
    navigate(path);
  }, [navigate]);

  // Intercept browser popstate / PWA back gesture & Android Hardware Back Button
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      // Push state back so browser back button doesn't exit URL unexpectedly
      window.history.pushState(null, '', window.location.href);
      goBack();
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [goBack]);

  const value = {
    stack,
    transitionDirection,
    goBack,
    navigatePush,
    navigateTab,
    registerModal,
    unregisterModal,
    registerStepHandler,
    unregisterStepHandler,
    canGoBack: stack.length > 1 || modalsRef.current.length > 0 || !!stepHandlerRef.current
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
