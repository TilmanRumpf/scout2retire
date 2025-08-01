import { useState, useEffect } from 'react';

export function useStandaloneMode() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as installed PWA
    const checkStandalone = () => {
      // Standard way to check
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
      }
      
      // iOS specific check
      if (window.navigator.standalone === true) {
        return true;
      }
      
      // Fallback check for iOS
      if (window.navigator.userAgent.match(/iPhone|iPod|iPad/) && 
          !window.navigator.userAgent.match(/Safari/)) {
        return true;
      }
      
      return false;
    };

    setIsStandalone(checkStandalone());

    // Listen for changes (though unlikely to change during session)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e) => setIsStandalone(e.matches);
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange); // Fallback for older browsers
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return isStandalone;
}