/**
 * Application-wide constants
 * Created 2025-09-29 to fix hardcoded values shithole
 */

// Debug constants
export const DEBUG_CONFIG = {
  // Set to null to disable debug logging for specific users
  DEBUG_USER_ID: process.env.NODE_ENV === 'development' ? '83d285b2-b21b-4d13-a1a1-6d51b6733d52' : null,
  ENABLE_DETAILED_LOGGING: process.env.NODE_ENV === 'development'
};

// Scoring thresholds
export const SCORING_THRESHOLDS = {
  // Climate scoring
  PERFECT_MATCH: 100,
  GOOD_MATCH: 75,
  ACCEPTABLE_MATCH: 50,
  POOR_MATCH: 25,

  // Admin scoring thresholds (fixed from 9+ to 7+ after disaster #3)
  ADMIN_GOOD: 7,
  ADMIN_ACCEPTABLE: 5,
  ADMIN_POOR: 3,

  // Hobby scoring
  HOBBY_MATCH_THRESHOLD: 0.3, // 30% overlap for positive score

  // Overall match categories
  EXCELLENT: 90,
  VERY_GOOD: 80,
  GOOD: 70,
  FAIR: 60,
  POOR: 50
};

// API endpoints
export const API_ENDPOINTS = {
  SUPABASE_URL: 'https://axlruvvsjepsulcbqlho.supabase.co',
  // Other endpoints as needed
};

// Time constants
export const TIME_CONSTANTS = {
  AUTOSAVE_DELAY: 1500, // 1.5 seconds
  DEBOUNCE_DELAY: 300,
  CACHE_DURATION: 15 * 60 * 1000, // 15 minutes
};

// UI constants
export const UI_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_FAVORITES: 10,
  MIN_SEARCH_LENGTH: 2,
};