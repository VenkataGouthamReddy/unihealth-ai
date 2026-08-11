import React, { useRef, useState, useCallback } from 'react';

const THRESHOLD = 70;   // px pull distance to trigger refresh
const MAX_PULL  = 110;  // px max visual pull distance

/**
 * PullToRefresh
 * Wraps any scrollable content and calls onRefresh() when pulled down beyond THRESHOLD.
 *
 * Usage:
 *   <PullToRefresh onRefresh={fetchData} disabled={loading}>
 *     <div>...content...</div>
 *   </PullToRefresh>
 */
export default function PullToRefresh({ children, onRefresh, disabled = false, className = '' }) {
  const [pullY, setPullY]         = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef   = useRef(null);
  const isPullingRef = useRef(false);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (disabled || refreshing) return;
    const el = containerRef.current;
    if (!el) return;
    // Only start pull if user is at the very top of the scroll container
    if (el.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = false;
    }
  }, [disabled, refreshing]);

  const handleTouchMove = useCallback((e) => {
    if (startYRef.current === null || disabled || refreshing) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) {
      isPullingRef.current = true;
      // Apply rubber-band resistance
      const dampened = Math.min(delta * 0.45, MAX_PULL);
      setPullY(dampened);
    }
  }, [disabled, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current) return;
    startYRef.current = null;
    isPullingRef.current = false;

    if (pullY >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullY(50); // settle at refresh indicator height
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullY(0);
      }
    } else {
      setPullY(0);
    }
  }, [pullY, refreshing, onRefresh]);

  const indicatorOpacity = Math.min(pullY / THRESHOLD, 1);
  const indicatorScale   = 0.6 + (pullY / MAX_PULL) * 0.4;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 pointer-events-none"
        style={{
          height: `${pullY}px`,
          opacity: indicatorOpacity,
          transition: refreshing ? 'height 300ms ease' : 'none'
        }}
      >
        <div
          style={{ transform: `scale(${indicatorScale})` }}
          className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg"
        >
          {refreshing ? (
            <svg
              className="w-4 h-4 text-teal-400"
              style={{ animation: 'spin 0.8s linear infinite' }}
              fill="none" viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 100 20v-2a8 8 0 01-8-8z"/>
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-teal-400"
              style={{ transform: pullY >= THRESHOLD ? 'rotate(180deg)' : `rotate(${(pullY / THRESHOLD) * 180}deg)`, transition: 'transform 150ms' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto"
        style={{ transform: `translateY(${pullY}px)`, transition: refreshing ? 'transform 300ms ease' : 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
