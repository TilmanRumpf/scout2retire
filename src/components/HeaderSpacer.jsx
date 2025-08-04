import { useEffect, useRef } from 'react';

/**
 * HeaderSpacer - Adds spacing for fixed header on all devices
 * This prevents content from going under the fixed header
 * VERCEL FIX: Dynamically measures actual header height
 * @param {boolean} hasFilters - Whether the header has a second row with filters
 */
export default function HeaderSpacer({ hasFilters = false }) {
  const spacerRef = useRef(null);
  
  useEffect(() => {
    // VERCEL FIX: Measure actual header height on production
    const measureHeader = () => {
      const header = document.querySelector('.ios-header');
      if (header && spacerRef.current) {
        const headerHeight = header.getBoundingClientRect().height;
        spacerRef.current.style.height = `${headerHeight}px`;
        spacerRef.current.style.minHeight = `${headerHeight}px`;
      }
    };
    
    // Measure immediately
    measureHeader();
    
    // Re-measure on resize
    window.addEventListener('resize', measureHeader);
    
    // Re-measure after a delay to catch any async rendering
    setTimeout(measureHeader, 100);
    setTimeout(measureHeader, 500);
    
    return () => window.removeEventListener('resize', measureHeader);
  }, [hasFilters]);
  
  return (
    <div 
      ref={spacerRef}
      className={hasFilters ? "ios-header-spacer-with-filters" : "ios-header-spacer"}
      aria-hidden="true"
    />
  );
}