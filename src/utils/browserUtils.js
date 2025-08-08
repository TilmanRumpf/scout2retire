/**
 * Browser Detection Utilities
 * 
 * Provides SSR-safe browser and device detection functions.
 * Use these instead of directly accessing window/navigator to avoid hydration issues.
 */

/**
 * Safely check if we're in a browser environment
 * @returns {boolean} True if running in browser
 */
export const isBrowser = () => typeof window !== 'undefined';

/**
 * Get current viewport width safely
 * @returns {number} Window width or 0 if not in browser
 */
export const getViewportWidth = () => {
  if (!isBrowser()) return 0;
  return window.innerWidth;
};

/**
 * Detect if device is mobile based on width and user agent
 * @param {number} breakpoint - Width breakpoint for mobile detection (default: 768)
 * @returns {boolean} True if mobile device detected
 */
export const isMobileDevice = (breakpoint = 768) => {
  if (!isBrowser()) return false;
  
  const width = getViewportWidth();
  const userAgent = navigator.userAgent;
  
  const isMobileWidth = width <= breakpoint;
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  return isMobileWidth || isMobileUserAgent;
};

/**
 * Get detailed device information
 * @returns {object} Device information object
 */
export const getDeviceInfo = () => {
  if (!isBrowser()) {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: false,
      width: 0,
      height: 0,
      userAgent: '',
      platform: '',
      isTouchDevice: false
    };
  }
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  const userAgent = navigator.userAgent;
  const platform = navigator.platform || '';
  
  const isMobile = isMobileDevice();
  const isTablet = width > 768 && width <= 1024 && isMobile;
  const isDesktop = width > 1024;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    width,
    height,
    userAgent,
    platform,
    isTouchDevice
  };
};

/**
 * Detect iOS devices specifically
 * @returns {boolean} True if iOS device
 */
export const isIOS = () => {
  if (!isBrowser()) return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Detect Android devices specifically
 * @returns {boolean} True if Android device
 */
export const isAndroid = () => {
  if (!isBrowser()) return false;
  return /Android/.test(navigator.userAgent);
};

/**
 * Detect Safari browser
 * @returns {boolean} True if Safari browser
 */
export const isSafari = () => {
  if (!isBrowser()) return false;
  const userAgent = navigator.userAgent;
  return /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
};

/**
 * Create a custom hook for reactive mobile detection
 * Usage: const isMobile = useMobileDetection();
 * 
 * This function returns the hook logic, not the hook itself.
 * Import { useState, useEffect } from React and use this pattern:
 * 
 * export const useMobileDetection = () => {
 *   const [isMobile, setIsMobile] = useState(false);
 *   useEffect(() => {
 *     // Use createMobileDetectionHook logic here
 *   }, []);
 *   return isMobile;
 * }
 */
export const createMobileDetectionHook = () => {
  return {
    initialState: false,
    setupDetection: (setIsMobile) => {
      const detectAndUpdate = () => {
        const mobile = isMobileDevice();
        setIsMobile(mobile);
        return mobile;
      };
      
      // Initial detection
      detectAndUpdate();
      
      // Setup resize listener
      const handleResize = () => detectAndUpdate();
      
      if (isBrowser()) {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }
      
      return () => {}; // No cleanup needed if not in browser
    }
  };
};

/**
 * Debug information for troubleshooting
 * @returns {object} Debug information
 */
export const getBrowserDebugInfo = () => {
  if (!isBrowser()) {
    return { error: 'Not in browser environment' };
  }
  
  return {
    ...getDeviceInfo(),
    timestamp: new Date().toISOString(),
    location: window.location.href,
    referrer: document.referrer,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    language: navigator.language,
    languages: navigator.languages,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory,
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    } : null
  };
};