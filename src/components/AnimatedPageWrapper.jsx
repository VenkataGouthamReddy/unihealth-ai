import React from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';

export default function AnimatedPageWrapper({ children }) {
  const location = useLocation();
  const { transitionDirection } = useNavigation();

  const cls =
    transitionDirection === 'push' ? 'page-push-enter' :
    transitionDirection === 'pop'  ? 'page-pop-enter'  :
    'page-fade-enter';

  return (
    <div key={location.pathname} className={`w-full min-h-screen gpu ${cls}`}>
      {children}
    </div>
  );
}
