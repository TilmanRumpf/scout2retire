/**
 * User Behavior Tracking System
 *
 * Tracks user sessions, page views, actions, and feature usage
 * for comprehensive analytics and product insights.
 *
 * Industry standard event tracking based on Google Analytics 4
 * and modern SaaS analytics best practices.
 */

import supabase from '../supabaseClient';

// Active session management
let activeSessionId = null;
let sessionStartTime = null;
let lastActivityTime = null;
let activityCheckInterval = null;
let pageViewCount = 0;
let actionCount = 0;

// Session timeout (30 minutes of inactivity)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// Activity heartbeat (update every 30 seconds if active)
const ACTIVITY_HEARTBEAT_MS = 30 * 1000;

/**
 * Start a new user session
 * @param {string} userId - User ID
 * @param {string} deviceHistoryId - Device history ID from device tracking
 * @param {string} entryPage - Initial page URL
 * @returns {Promise<string>} Session ID
 */
export const startSession = async (userId, deviceHistoryId = null, entryPage = null) => {
  if (!userId) {
    console.warn('startSession called without userId');
    return null;
  }

  // End any existing session first
  if (activeSessionId) {
    await endSession();
  }

  try {
    const page = entryPage || window.location.pathname;

    console.log('🎬 Starting new session:', { userId, deviceHistoryId, page });

    const { data, error } = await supabase.rpc('start_user_session', {
      p_user_id: userId,
      p_device_history_id: deviceHistoryId,
      p_entry_page: page
    });

    if (error) {
      console.error('Failed to start session:', error);
      return null;
    }

    activeSessionId = data;
    sessionStartTime = Date.now();
    lastActivityTime = Date.now();
    pageViewCount = 0;
    actionCount = 0;

    console.log('✅ Session started:', activeSessionId);

    // Start activity monitoring
    startActivityMonitoring(userId);

    // Track initial page view
    await trackPageView(userId, page);

    return activeSessionId;
  } catch (err) {
    console.error('Error starting session:', err);
    return null;
  }
};

/**
 * End the current session
 * @param {string} exitPage - Page where session ended
 * @returns {Promise<void>}
 */
export const endSession = async (exitPage = null) => {
  if (!activeSessionId) {
    return;
  }

  try {
    const page = exitPage || window.location.pathname;

    console.log('🛑 Ending session:', activeSessionId);

    const { error } = await supabase.rpc('end_user_session', {
      p_session_id: activeSessionId,
      p_exit_page: page
    });

    if (error) {
      console.error('Failed to end session:', error);
    }

    // Clear session data
    activeSessionId = null;
    sessionStartTime = null;
    lastActivityTime = null;
    pageViewCount = 0;
    actionCount = 0;

    // Stop activity monitoring
    stopActivityMonitoring();

    console.log('✅ Session ended');
  } catch (err) {
    console.error('Error ending session:', err);
  }
};

/**
 * Track a page view
 * @param {string} userId - User ID
 * @param {string} pageUrl - Page URL or path
 * @returns {Promise<void>}
 */
export const trackPageView = async (userId, pageUrl = null) => {
  if (!userId) return;

  const page = pageUrl || window.location.pathname;

  pageViewCount++;
  lastActivityTime = Date.now();

  await trackEvent(userId, 'view', 'page_view', 'navigation', {
    page_url: page,
    page_title: document.title
  }, page);
};

/**
 * Track a user action/event
 * @param {string} userId - User ID
 * @param {string} eventType - Event type: 'click', 'search', 'save', etc.
 * @param {string} eventName - Specific event name
 * @param {string} eventCategory - Event category for grouping
 * @param {Object} metadata - Additional event data
 * @param {string} pageUrl - Current page URL
 * @returns {Promise<void>}
 */
export const trackEvent = async (
  userId,
  eventType,
  eventName,
  eventCategory = null,
  metadata = null,
  pageUrl = null
) => {
  if (!userId || !activeSessionId) {
    console.warn('trackEvent called without userId or active session');
    return;
  }

  try {
    const page = pageUrl || window.location.pathname;

    // Update activity time
    if (eventType !== 'view') {
      actionCount++;
    }
    lastActivityTime = Date.now();

    const { error } = await supabase.rpc('track_behavior_event', {
      p_user_id: userId,
      p_session_id: activeSessionId,
      p_event_type: eventType,
      p_event_name: eventName,
      p_event_category: eventCategory,
      p_event_metadata: metadata ? JSON.stringify(metadata) : null,
      p_page_url: page
    });

    if (error) {
      // Silent error handling: RPC function may not exist yet (404)
      // This is optional analytics, fail gracefully without console spam
      if (error.code !== '42883' && !error.message?.includes('not found')) {
        // Only log non-404 errors as warnings
        console.warn('Event tracking unavailable:', error.message);
      }
    }
  } catch (err) {
    console.error('Error tracking event:', err);
  }
};

/**
 * Track button/link click
 * @param {string} userId - User ID
 * @param {string} buttonName - Button identifier
 * @param {string} category - Button category
 * @param {Object} metadata - Additional data
 */
export const trackClick = async (userId, buttonName, category = 'button', metadata = {}) => {
  await trackEvent(userId, 'click', buttonName, category, metadata);
};

/**
 * Track search action
 * @param {string} userId - User ID
 * @param {string} searchQuery - Search query
 * @param {number} resultsCount - Number of results
 * @param {Object} filters - Applied filters
 */
export const trackSearch = async (userId, searchQuery, resultsCount = 0, filters = {}) => {
  await trackEvent(userId, 'search', 'town_search', 'search', {
    query: searchQuery,
    results_count: resultsCount,
    filters: filters
  });
};

/**
 * Track town view/visit
 * @param {string} userId - User ID
 * @param {string} townId - Town ID
 * @param {string} townName - Town name
 * @param {Object} metadata - Additional town data
 */
export const trackTownView = async (userId, townId, townName, metadata = {}) => {
  await trackEvent(userId, 'view', 'town_detail', 'towns', {
    town_id: townId,
    town_name: townName,
    ...metadata
  });
};

/**
 * Track feature usage
 * @param {string} userId - User ID
 * @param {string} featureName - Feature identifier
 * @param {Object} metadata - Feature-specific data
 */
export const trackFeatureUse = async (userId, featureName, metadata = {}) => {
  await trackEvent(userId, 'feature_use', featureName, 'features', metadata);
};

/**
 * Track chat message sent
 * @param {string} userId - User ID
 * @param {string} chatType - 'direct', 'group', 'scotty_ai'
 * @param {Object} metadata - Chat metadata
 */
export const trackChatMessage = async (userId, chatType, metadata = {}) => {
  await trackEvent(userId, 'chat', 'message_sent', chatType, metadata);
};

/**
 * Track save/favorite action
 * @param {string} userId - User ID
 * @param {string} itemType - 'town', 'search', 'thread'
 * @param {string} itemId - Item ID
 */
export const trackSave = async (userId, itemType, itemId, metadata = {}) => {
  await trackEvent(userId, 'save', `save_${itemType}`, 'engagement', {
    item_type: itemType,
    item_id: itemId,
    ...metadata
  });
};

/**
 * Track share action
 * @param {string} userId - User ID
 * @param {string} itemType - What was shared
 * @param {string} platform - Share platform/method
 */
export const trackShare = async (userId, itemType, platform, metadata = {}) => {
  await trackEvent(userId, 'share', `share_${itemType}`, 'social', {
    item_type: itemType,
    platform: platform,
    ...metadata
  });
};

/**
 * Track preference change
 * @param {string} userId - User ID
 * @param {string} preferenceName - Preference that changed
 * @param {any} oldValue - Previous value
 * @param {any} newValue - New value
 */
export const trackPreferenceChange = async (userId, preferenceName, oldValue, newValue) => {
  await trackEvent(userId, 'preference_change', preferenceName, 'settings', {
    preference: preferenceName,
    old_value: oldValue,
    new_value: newValue
  });
};

/**
 * Track conversion event
 * @param {string} userId - User ID
 * @param {string} conversionType - Type of conversion
 * @param {number} value - Monetary value (if applicable)
 */
export const trackConversion = async (userId, conversionType, value = null, metadata = {}) => {
  await trackEvent(userId, 'conversion', conversionType, 'conversion', {
    conversion_type: conversionType,
    value: value,
    ...metadata
  });
};

/**
 * Track error event
 * @param {string} userId - User ID
 * @param {string} errorType - Error type
 * @param {string} errorMessage - Error message
 * @param {Object} errorStack - Error stack trace
 */
export const trackError = async (userId, errorType, errorMessage, errorStack = null) => {
  await trackEvent(userId, 'error', errorType, 'errors', {
    error_type: errorType,
    error_message: errorMessage,
    error_stack: errorStack,
    user_agent: navigator.userAgent
  });
};

/**
 * Start monitoring user activity
 * @param {string} userId - User ID
 */
const startActivityMonitoring = (userId) => {
  // Clear any existing interval
  stopActivityMonitoring();

  // Check for inactivity every minute
  activityCheckInterval = setInterval(() => {
    const timeSinceLastActivity = Date.now() - lastActivityTime;

    // If inactive for more than 30 minutes, end session
    if (timeSinceLastActivity > SESSION_TIMEOUT_MS) {
      console.log('⏱️ Session timeout due to inactivity');
      endSession();
    }
  }, 60 * 1000); // Check every minute

  // Track user activity events
  const updateActivity = () => {
    lastActivityTime = Date.now();
  };

  // Listen for user activity
  window.addEventListener('mousemove', updateActivity);
  window.addEventListener('keydown', updateActivity);
  window.addEventListener('scroll', updateActivity);
  window.addEventListener('click', updateActivity);
  window.addEventListener('touchstart', updateActivity);

  // End session on page unload
  window.addEventListener('beforeunload', () => {
    if (activeSessionId) {
      // Use sendBeacon for reliable tracking on page unload
      const endpoint = `${supabase.supabaseUrl}/rest/v1/rpc/end_user_session`;
      const payload = JSON.stringify({
        p_session_id: activeSessionId,
        p_exit_page: window.location.pathname
      });

      navigator.sendBeacon(endpoint, payload);
    }
  });
};

/**
 * Stop monitoring user activity
 */
const stopActivityMonitoring = () => {
  if (activityCheckInterval) {
    clearInterval(activityCheckInterval);
    activityCheckInterval = null;
  }
};

/**
 * Get current session info
 * @returns {Object} Session info
 */
export const getSessionInfo = () => {
  if (!activeSessionId) {
    return null;
  }

  return {
    sessionId: activeSessionId,
    duration: sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0,
    pageViews: pageViewCount,
    actions: actionCount,
    lastActivity: lastActivityTime ? Math.floor((Date.now() - lastActivityTime) / 1000) : 0
  };
};

/**
 * Check if session is active
 * @returns {boolean}
 */
export const isSessionActive = () => {
  return activeSessionId !== null;
};

/**
 * Get user's session history
 * @param {string} userId - User ID
 * @param {number} limit - Number of sessions to retrieve
 * @returns {Promise<Array>} Array of sessions
 */
export const getUserSessions = async (userId, limit = 20) => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.error('Error fetching user sessions:', err);
    return [];
  }
};

/**
 * Get user's behavior events
 * @param {string} userId - User ID
 * @param {number} limit - Number of events to retrieve
 * @returns {Promise<Array>} Array of events
 */
export const getUserBehaviorEvents = async (userId, limit = 100) => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('user_behavior_events')
      .select('*')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.error('Error fetching behavior events:', err);
    return [];
  }
};

export default {
  startSession,
  endSession,
  trackPageView,
  trackEvent,
  trackClick,
  trackSearch,
  trackTownView,
  trackFeatureUse,
  trackChatMessage,
  trackSave,
  trackShare,
  trackPreferenceChange,
  trackConversion,
  trackError,
  getSessionInfo,
  isSessionActive,
  getUserSessions,
  getUserBehaviorEvents
};
