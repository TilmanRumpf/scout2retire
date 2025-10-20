/**
 * Device Detection and Tracking Utility
 *
 * Detects device type, platform, browser, and screen resolution
 * for user analytics and behavior tracking.
 *
 * Based on industry best practices for user agent parsing.
 * Enhanced with comprehensive device detection (40+ properties)
 * including exact device models, browser versions, and display capabilities.
 */

import supabase from '../supabaseClient';
import { UAParser } from 'ua-parser-js';

/**
 * Detect browser information from user agent
 * @param {string} userAgent - Navigator user agent string
 * @returns {string} Browser name
 */
export const detectBrowser = (userAgent) => {
  if (!userAgent) return 'Unknown';

  // Check for specific browsers in order of specificity
  if (userAgent.includes('Edg/')) return 'Edge';
  if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) return 'Chrome';
  if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) return 'Safari';
  if (userAgent.includes('Firefox/')) return 'Firefox';
  if (userAgent.includes('OPR/') || userAgent.includes('Opera/')) return 'Opera';
  if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'IE';

  return 'Other';
};

/**
 * Detect device type from user agent and screen size
 * @param {string} userAgent - Navigator user agent string
 * @param {number} screenWidth - Screen width in pixels
 * @returns {string} Device type: 'mobile', 'tablet', 'desktop', or 'unknown'
 */
export const detectDeviceType = (userAgent = '', screenWidth = window.innerWidth) => {
  // Check for tablets first (more specific)
  if (/iPad/i.test(userAgent)) return 'tablet';
  if (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) return 'tablet';
  if (/Tablet/i.test(userAgent)) return 'tablet';

  // Check for mobile devices
  if (/iPhone|iPod/i.test(userAgent)) return 'mobile';
  if (/Android.*Mobile/i.test(userAgent)) return 'mobile';
  if (/webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) return 'mobile';

  // Fallback to screen width if user agent is inconclusive
  if (screenWidth < 768) return 'mobile';
  if (screenWidth >= 768 && screenWidth < 1024) return 'tablet';
  if (screenWidth >= 1024) return 'desktop';

  return 'desktop'; // Default to desktop
};

/**
 * Detect platform/operating system
 * @param {string} userAgent - Navigator user agent string
 * @param {string} platform - Navigator platform string
 * @returns {string} Platform name
 */
export const detectPlatform = (userAgent = '', platform = '') => {
  // iOS devices
  if (/iPad|iPhone|iPod/.test(userAgent)) return 'iOS';

  // Android devices
  if (/Android/.test(userAgent)) return 'Android';

  // Desktop platforms
  if (/Win/i.test(platform) || /Windows/i.test(userAgent)) return 'Windows';
  if (/Mac/i.test(platform) && !/iPhone|iPad|iPod/.test(userAgent)) return 'macOS';
  if (/Linux/i.test(platform) || /Linux/i.test(userAgent)) return 'Linux';
  if (/CrOS/.test(userAgent)) return 'Chrome OS';

  return 'Unknown';
};

/**
 * Get screen resolution as string
 * @returns {string} Screen resolution (e.g., "1920x1080")
 */
export const getScreenResolution = () => {
  return `${window.screen.width}x${window.screen.height}`;
};

/**
 * Get IP-based geolocation data
 * Uses ipapi.co free API (1,000 requests/day, no auth required)
 * @returns {Promise<Object>} Location data or null if failed
 */
export const getGeolocation = async () => {
  try {
    // Use ipapi.co - free, no auth, 1k requests/day
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn('Geolocation API failed:', response.status);
      return null;
    }

    const data = await response.json();

    // Map to our schema
    return {
      countryCode: data.country_code || null,
      countryName: data.country_name || null,
      region: data.region || null,
      city: data.city || null,
      timezone: data.timezone || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      ip: data.ip || null
    };
  } catch (err) {
    console.error('Geolocation fetch error:', err);
    return null;
  }
};

/**
 * Get current device orientation
 * @returns {string} Orientation type
 */
export const getOrientation = () => {
  if (window.screen.orientation?.type) {
    return window.screen.orientation.type.startsWith('portrait') ? 'portrait' : 'landscape';
  }
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};

/**
 * Extract exact browser version from user agent
 * @param {string} userAgent - Navigator user agent string
 * @returns {string} Browser version
 */
export const extractBrowserVersion = (userAgent) => {
  // Edge (check first, contains Chrome)
  const edgeMatch = userAgent.match(/Edg\/([\d.]+)/);
  if (edgeMatch) return edgeMatch[1];

  // Chrome
  const chromeMatch = userAgent.match(/Chrome\/([\d.]+)/);
  if (chromeMatch) return chromeMatch[1];

  // Safari (Version/xx.x is user-facing version)
  const safariMatch = userAgent.match(/Version\/([\d.]+)/);
  if (safariMatch && userAgent.includes('Safari')) return safariMatch[1];

  // Firefox
  const firefoxMatch = userAgent.match(/Firefox\/([\d.]+)/);
  if (firefoxMatch) return firefoxMatch[1];

  return 'Unknown';
};

/**
 * Extract OS version from user agent
 * @param {string} userAgent - Navigator user agent string
 * @returns {string} OS version
 */
export const extractOSVersion = (userAgent) => {
  // iOS
  const iosMatch = userAgent.match(/OS ([\d_]+)/);
  if (iosMatch) return iosMatch[1].replace(/_/g, '.');

  // Android
  const androidMatch = userAgent.match(/Android ([\d.]+)/);
  if (androidMatch) return androidMatch[1];

  // Windows
  const winMatch = userAgent.match(/Windows NT ([\d.]+)/);
  if (winMatch) {
    const winMap = {
      '10.0': '10/11',
      '6.3': '8.1',
      '6.2': '8',
      '6.1': '7'
    };
    return winMap[winMatch[1]] || winMatch[1];
  }

  // macOS
  const macMatch = userAgent.match(/Mac OS X ([\d_]+)/);
  if (macMatch) return macMatch[1].replace(/_/g, '.');

  return 'Unknown';
};

/**
 * Get exact device model using multiple detection methods
 * @param {string} userAgent - Navigator user agent string
 * @returns {Object} Device model information with confidence level
 */
export const getExactDeviceModel = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Screen dimension mapping for iOS devices
  const screenDimensionMap = {
    '393x852': ['iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro'],
    '430x932': ['iPhone 15 Pro Max', 'iPhone 15 Plus', 'iPhone 14 Pro Max'],
    '390x844': ['iPhone 14', 'iPhone 13', 'iPhone 12'],
    '375x812': ['iPhone 13 mini', 'iPhone 12 mini', 'iPhone 11 Pro', 'iPhone X'],
    '375x667': ['iPhone SE (2nd/3rd gen)', 'iPhone 8', 'iPhone 7', 'iPhone 6s'],
    '414x896': ['iPhone 11 Pro Max', 'iPhone 11', 'iPhone XS Max', 'iPhone XR'],
    '1024x1366': ['iPad Pro 12.9"'],
    '834x1194': ['iPad Pro 11"'],
    '820x1180': ['iPad Air (4th/5th gen)', 'iPad 10.9"'],
    '810x1080': ['iPad 10.2"'],
    '768x1024': ['iPad', 'iPad Mini']
  };

  const vendor = result.device.vendor || 'Unknown';
  let model = result.device.model || 'Unknown';
  let confidence = 'basic'; // basic, group, exact

  // For generic iOS devices, try screen dimensions
  if (['iPhone', 'iPad', 'iPod'].includes(model)) {
    const screenKey = `${window.screen.width}x${window.screen.height}`;
    const possibleModels = screenDimensionMap[screenKey];

    if (possibleModels) {
      if (possibleModels.length === 1) {
        model = possibleModels[0];
        confidence = 'exact';
      } else {
        model = possibleModels.join(' / ');
        confidence = 'group';
      }
    }
  } else if (model !== 'Unknown' && !['iPhone', 'iPad', 'iPod'].includes(model)) {
    // Specific Android/other device model detected
    confidence = 'exact';
  }

  return {
    manufacturer: vendor,
    model: model,
    confidence: confidence,
    deviceFamily: result.device.type || 'desktop'
  };
};

/**
 * ENHANCED: Get comprehensive device information with 40+ properties
 * Includes exact device model, browser version, display capabilities, and more
 * @returns {Object} Complete device information for UI troubleshooting
 */
export const getEnhancedDeviceInfo = () => {
  const userAgent = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const screenWidth = window.innerWidth;

  // Parse with ua-parser-js
  const parser = new UAParser(userAgent);
  const parsedUA = parser.getResult();

  // Get exact device model
  const deviceModel = getExactDeviceModel(userAgent);

  return {
    // TIER 1: ESSENTIAL - Core Device Identification
    deviceType: detectDeviceType(userAgent, screenWidth),
    platform: detectPlatform(userAgent, platform),
    platformVersion: parsedUA.os.version || extractOSVersion(userAgent),
    browser: detectBrowser(userAgent),
    browserVersion: parsedUA.browser.version || extractBrowserVersion(userAgent),
    browserMajorVersion: parsedUA.browser.major || parsedUA.browser.version?.split('.')[0],
    userAgent: userAgent,

    // Device Details (Enhanced)
    deviceManufacturer: deviceModel.manufacturer,
    deviceModel: deviceModel.model,
    deviceModelConfidence: deviceModel.confidence,
    deviceFamily: deviceModel.deviceFamily,

    // TIER 1: ESSENTIAL - Screen & Display
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      resolution: getScreenResolution(),
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth
    },

    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      documentWidth: document.documentElement.clientWidth,
      documentHeight: document.documentElement.clientHeight
    },

    // Device Pixel Ratio (Critical for Retina displays)
    pixelRatio: window.devicePixelRatio || 1,
    isRetina: (window.devicePixelRatio || 1) >= 2,

    // TIER 1: ESSENTIAL - Orientation
    orientation: getOrientation(),
    orientationType: window.screen.orientation?.type || 'unknown',
    orientationAngle: window.screen.orientation?.angle || 0,

    // TIER 2: HIGH VALUE - Input Capabilities
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    hasPointer: window.matchMedia('(pointer: fine)').matches,
    hasCoarsePointer: window.matchMedia('(pointer: coarse)').matches,
    hasHover: window.matchMedia('(hover: hover)').matches,

    // TIER 2: HIGH VALUE - Browser Capabilities
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || 'unknown',
    onLine: navigator.onLine,

    // TIER 2: HIGH VALUE - Hardware/Performance
    hardwareConcurrency: navigator.hardwareConcurrency || null, // CPU cores
    deviceMemory: navigator.deviceMemory || null, // RAM in GB (Chrome only)

    // TIER 2: HIGH VALUE - Network Information
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType || 'unknown',
      downlink: navigator.connection.downlink || null,
      rtt: navigator.connection.rtt || null,
      saveData: navigator.connection.saveData || false
    } : null,

    // TIER 2: HIGH VALUE - Display Preferences & Capabilities
    prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' :
                         window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'no-preference',
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersContrast: window.matchMedia('(prefers-contrast: high)').matches ? 'high' :
                     window.matchMedia('(prefers-contrast: low)').matches ? 'low' : 'no-preference',

    // Color Gamut Support
    colorGamut: window.matchMedia('(color-gamut: rec2020)').matches ? 'rec2020' :
                window.matchMedia('(color-gamut: p3)').matches ? 'p3' :
                window.matchMedia('(color-gamut: srgb)').matches ? 'srgb' : 'unknown',

    // HDR Support
    supportsHDR: window.matchMedia('(dynamic-range: high)').matches,

    // TIER 1: ESSENTIAL - Localization
    language: navigator.language || 'unknown',
    languages: navigator.languages || [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),

    // Metadata
    timestamp: new Date().toISOString(),
    detectionMethod: 'enhanced-ua-parser-js'
  };
};

/**
 * Get comprehensive device information (Legacy compatibility)
 * @returns {Object} Complete device information
 */
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const screenWidth = window.innerWidth;

  return {
    deviceType: detectDeviceType(userAgent, screenWidth),
    platform: detectPlatform(userAgent, platform),
    browser: detectBrowser(userAgent),
    userAgent: userAgent,
    screenResolution: getScreenResolution(),
    timestamp: new Date().toISOString(),
    // Additional metadata
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language || navigator.userLanguage || 'unknown'
  };
};

/**
 * Update user's device information in database (ENHANCED with 40+ properties)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result object with success status
 */
export const updateUserDevice = async (userId) => {
  if (!userId) {
    console.warn('updateUserDevice called without userId');
    return { success: false, error: 'No user ID provided' };
  }

  try {
    // Get ENHANCED device info (40+ properties)
    const deviceInfo = getEnhancedDeviceInfo();

    // Get geolocation (non-blocking)
    let geoData = null;
    try {
      geoData = await getGeolocation();
    } catch (geoError) {
      console.warn('Geolocation failed, continuing without location:', geoError);
    }

    console.log('📱 Updating ENHANCED device info:', {
      userId,
      device: `${deviceInfo.deviceManufacturer} ${deviceInfo.deviceModel} (${deviceInfo.deviceModelConfidence})`,
      os: `${deviceInfo.platform} ${deviceInfo.platformVersion}`,
      browser: `${deviceInfo.browser} ${deviceInfo.browserVersion}`,
      screen: `${deviceInfo.screen.resolution} @ ${deviceInfo.pixelRatio}x`,
      viewport: `${deviceInfo.viewport.width}x${deviceInfo.viewport.height}`,
      orientation: deviceInfo.orientation,
      touch: deviceInfo.touchSupport,
      location: geoData ? `${geoData.city}, ${geoData.region}, ${geoData.countryName}` : 'unknown'
    });

    // Call the database function with ALL enhanced parameters
    const { data, error } = await supabase.rpc('update_user_device', {
      // Basic identification
      p_user_id: userId,
      p_device_type: deviceInfo.deviceType,
      p_platform: deviceInfo.platform,
      p_browser: deviceInfo.browser,
      p_user_agent: deviceInfo.userAgent,
      p_screen_resolution: deviceInfo.screen.resolution,

      // Geographic
      p_ip_address: geoData?.ip || null,
      p_country_code: geoData?.countryCode || null,
      p_country_name: geoData?.countryName || null,
      p_region: geoData?.region || null,
      p_city: geoData?.city || null,
      p_timezone: geoData?.timezone || deviceInfo.timezone,
      p_latitude: geoData?.latitude || null,
      p_longitude: geoData?.longitude || null,

      // ENHANCED: Device details
      p_device_manufacturer: deviceInfo.deviceManufacturer,
      p_device_model: deviceInfo.deviceModel,
      p_device_model_confidence: deviceInfo.deviceModelConfidence,
      p_platform_version: deviceInfo.platformVersion,
      p_browser_version: deviceInfo.browserVersion,
      p_browser_major_version: deviceInfo.browserMajorVersion,

      // ENHANCED: Display
      p_viewport_width: deviceInfo.viewport.width,
      p_viewport_height: deviceInfo.viewport.height,
      p_pixel_ratio: deviceInfo.pixelRatio,
      p_is_retina: deviceInfo.isRetina,
      p_color_depth: deviceInfo.screen.colorDepth,
      p_orientation: deviceInfo.orientation,
      p_orientation_angle: deviceInfo.orientationAngle,

      // ENHANCED: Input capabilities
      p_touch_support: deviceInfo.touchSupport,
      p_max_touch_points: deviceInfo.maxTouchPoints,
      p_has_pointer: deviceInfo.hasPointer,
      p_has_coarse_pointer: deviceInfo.hasCoarsePointer,
      p_has_hover: deviceInfo.hasHover,

      // ENHANCED: Browser capabilities
      p_cookies_enabled: deviceInfo.cookiesEnabled,
      p_do_not_track: deviceInfo.doNotTrack,
      p_online_status: deviceInfo.onLine,

      // ENHANCED: Performance
      p_hardware_concurrency: deviceInfo.hardwareConcurrency,
      p_device_memory: deviceInfo.deviceMemory,

      // ENHANCED: Network
      p_connection_type: deviceInfo.connection?.effectiveType || null,
      p_connection_downlink: deviceInfo.connection?.downlink || null,
      p_connection_rtt: deviceInfo.connection?.rtt || null,
      p_connection_save_data: deviceInfo.connection?.saveData || null,

      // ENHANCED: Display preferences
      p_prefers_color_scheme: deviceInfo.prefersColorScheme,
      p_prefers_reduced_motion: deviceInfo.prefersReducedMotion,
      p_prefers_contrast: deviceInfo.prefersContrast,
      p_color_gamut: deviceInfo.colorGamut,
      p_supports_hdr: deviceInfo.supportsHDR
    });

    if (error) {
      console.error('Failed to update enhanced device info:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ ENHANCED device info updated successfully (40+ properties tracked)');
    return {
      success: true,
      deviceInfo,
      geoData,
      deviceHistoryId: data
    };
  } catch (err) {
    console.error('Enhanced device tracking error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Get user's device history
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of device history records
 */
export const getUserDeviceHistory = async (userId) => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('user_device_history')
      .select('*')
      .eq('user_id', userId)
      .order('last_seen_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.error('Error fetching device history:', err);
    return [];
  }
};

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
export const isMobileDevice = () => {
  const deviceType = detectDeviceType(navigator.userAgent);
  return deviceType === 'mobile';
};

/**
 * Check if device is tablet
 * @returns {boolean} True if tablet device
 */
export const isTabletDevice = () => {
  const deviceType = detectDeviceType(navigator.userAgent);
  return deviceType === 'tablet';
};

/**
 * Check if device is desktop
 * @returns {boolean} True if desktop device
 */
export const isDesktopDevice = () => {
  const deviceType = detectDeviceType(navigator.userAgent);
  return deviceType === 'desktop';
};

/**
 * Get device analytics summary
 * @returns {Promise<Object>} Device analytics data
 */
export const getDeviceAnalytics = async () => {
  try {
    // Get device distribution
    const { data: deviceData, error: deviceError } = await supabase
      .from('users')
      .select('last_device_type')
      .not('last_device_type', 'is', null);

    if (deviceError) throw deviceError;

    // Get platform distribution
    const { data: platformData, error: platformError } = await supabase
      .from('users')
      .select('last_platform')
      .not('last_platform', 'is', null);

    if (platformError) throw platformError;

    // Count by device type
    const deviceCounts = deviceData.reduce((acc, user) => {
      acc[user.last_device_type] = (acc[user.last_device_type] || 0) + 1;
      return acc;
    }, {});

    // Count by platform
    const platformCounts = platformData.reduce((acc, user) => {
      acc[user.last_platform] = (acc[user.last_platform] || 0) + 1;
      return acc;
    }, {});

    return {
      deviceDistribution: deviceCounts,
      platformDistribution: platformCounts,
      totalUsers: deviceData.length
    };
  } catch (err) {
    console.error('Error fetching device analytics:', err);
    return {
      deviceDistribution: {},
      platformDistribution: {},
      totalUsers: 0
    };
  }
};

export default {
  getDeviceInfo,
  updateUserDevice,
  getUserDeviceHistory,
  detectDeviceType,
  detectPlatform,
  detectBrowser,
  isMobileDevice,
  isTabletDevice,
  isDesktopDevice,
  getDeviceAnalytics
};
