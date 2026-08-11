import React, { useState, useEffect } from 'react';
import DesktopApp from './DesktopApp';
import MobileApp from './MobileApp';

export default function App() {
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 768 || window.matchMedia('(display-mode: standalone)').matches
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768 || window.matchMedia('(display-mode: standalone)').matches);
    };

    window.addEventListener('resize', handleResize);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', handleResize);
    };
  }, []);

  return isMobile ? <MobileApp /> : <DesktopApp />;
}
