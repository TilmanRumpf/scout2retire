/**
 * React Hook for Mobile Detection
 * 
 * Provides SSR-safe, reactive mobile device detection.
 * Updates on window resize and properly handles server-side rendering.
 */

import { useState, useEffect } from 'react';
import { isMobileDevice, getDeviceInfo } from '../utils/browserUtils';

/**
 * Hook for reactive mobile detection
 * @param {number} breakpoint - Width breakpoint for mobile detection (default: 768)
 * @returns {object} { isMobile, deviceInfo, isLoading }
 */
export const useMobileDetection = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectAndUpdate = () => {
      const mobile = isMobileDevice(breakpoint);
      const info = getDeviceInfo();
      
      setIsMobile(mobile);
      setDeviceInfo(info);
      setIsLoading(false);
      
      return { mobile, info };
    };
    
    // Initial detection
    detectAndUpdate();
    
    // Setup resize listener
    const handleResize = () => {
      detectAndUpdate();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return { isMobile, deviceInfo, isLoading };
};

/**
 * Simple hook that only returns mobile status
 * @param {number} breakpoint - Width breakpoint for mobile detection (default: 768)
 * @returns {boolean} True if mobile device
 */
export const useIsMobile = (breakpoint = 768) => {
  const { isMobile } = useMobileDetection(breakpoint);
  return isMobile;
};

/**
 * Hook for device information only
 * @returns {object} Device information object
 */
export const useDeviceInfo = () => {
  const { deviceInfo } = useMobileDetection();
  return deviceInfo;
};

export default useMobileDetection;