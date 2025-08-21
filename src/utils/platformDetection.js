// Platform detection utilities
export const isIOS = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isAndroid = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  
  return /Android/.test(navigator.userAgent);
};

export const isMobile = () => {
  return isIOS() || isAndroid();
};

export const getPlatform = () => {
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  return 'desktop';
};