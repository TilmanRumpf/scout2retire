// src/components/AuthenticatedLayout.jsx
import React, { useState, useEffect } from 'react';
import MobileNavigation from './MobileNavigation';

export default function AuthenticatedLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Main content with padding for mobile nav */}
      <div className={isMobile ? "pb-20" : ""}>
        {children}
      </div>
      
      {/* Mobile Navigation - only show on mobile */}
      {isMobile && <MobileNavigation />}
    </div>
  );
}