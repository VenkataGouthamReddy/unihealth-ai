import React, { useEffect, useState, useRef } from 'react';
import { useNavigation } from '../context/NavigationContext';

export default function EdgeSwipeBack() {
  const { goBack, canGoBack } = useNavigation();
  const [swipeWidth, setSwipeWidth] = useState(0);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isEdgeSwipeRef = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      if (touch.clientX <= 32) {
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        isEdgeSwipeRef.current = true;
      } else {
        isEdgeSwipeRef.current = false;
      }
    };

    const handleTouchMove = (e) => {
      if (!isEdgeSwipeRef.current) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

      if (deltaX > 0 && deltaY < 60) {
        setSwipeWidth(Math.min(deltaX, 100));
      } else {
        setSwipeWidth(0);
      }
    };

    const handleTouchEnd = (e) => {
      if (!isEdgeSwipeRef.current) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

      if (deltaX > 75 && deltaY < 60 && canGoBack) {
        goBack();
      }
      setSwipeWidth(0);
      isEdgeSwipeRef.current = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goBack, canGoBack]);

  if (swipeWidth <= 0) return null;

  return (
    <div
      className="fixed inset-y-0 left-0 z-[9999] pointer-events-none flex items-center"
      style={{ width: `${swipeWidth}px` }}
    >
      <div className="w-full h-full bg-gradient-to-r from-teal-500/30 to-transparent border-l-4 border-teal-400 backdrop-blur-xs transition-all duration-75" />
    </div>
  );
}
