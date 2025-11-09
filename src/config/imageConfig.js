/**
 * IMAGE SYSTEM CONFIGURATION
 *
 * Centralized configuration for Scout2Retire's town image system.
 * Eliminates hardcoding of field names, constraints, and valid values.
 *
 * Created: 2025-11-08
 * Migration: 20251109000000_create_town_images_table.sql
 *
 * Usage:
 *   import { IMAGE_CONFIG, IMAGE_FIELDS, IMAGE_SOURCES } from '@/config/imageConfig'
 *
 * NEVER hardcode these values - always reference this config.
 */

// =====================================================
// TABLE AND COLUMN NAMES
// =====================================================

export const IMAGE_CONFIG = {
  // Table names
  TABLE_NAME: 'town_images',
  LEGACY_TABLE: 'towns', // For backward compatibility

  // Column names in town_images table
  COLUMNS: {
    ID: 'id',
    TOWN_ID: 'town_id',
    IMAGE_URL: 'image_url',
    DISPLAY_ORDER: 'display_order',
    SOURCE: 'source',
    PHOTOGRAPHER: 'photographer',
    LICENSE: 'license',
    IS_FALLBACK: 'is_fallback',
    VALIDATED_AT: 'validated_at',
    VALIDATION_NOTE: 'validation_note',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },

  // Legacy columns in towns table (for migration/backward compat)
  LEGACY_COLUMNS: {
    IMAGE_URL_1: 'image_url_1',
    IMAGE_URL_2: 'image_url_2',
    IMAGE_URL_3: 'image_url_3',
    IMAGE_SOURCE: 'image_source',
    IMAGE_PHOTOGRAPHER: 'image_photographer',
    IMAGE_LICENSE: 'image_license',
    IMAGE_IS_FALLBACK: 'image_is_fallback',
    IMAGE_VALIDATED_AT: 'image_validated_at',
    IMAGE_VALIDATION_NOTE: 'image_validation_note'
  }
}

// =====================================================
// COLUMN SETS (like townColumnSets.js)
// =====================================================

export const IMAGE_COLUMN_SETS = {
  // Minimal - Just URL for display
  minimal: 'image_url, display_order',

  // Basic - URL + metadata
  basic: 'id, image_url, display_order, source, photographer, license',

  // Full - Everything including validation status
  full: 'id, town_id, image_url, display_order, source, photographer, license, is_fallback, validated_at, validation_note, created_at, updated_at',

  // Admin - For management interfaces
  admin: 'id, town_id, image_url, display_order, source, photographer, license, is_fallback, validated_at, validation_note, created_at, updated_at'
}

// =====================================================
// VALID VALUES FOR CATEGORICAL FIELDS
// =====================================================

export const IMAGE_SOURCES = {
  UNSPLASH: 'unsplash',
  PEXELS: 'pexels',
  PIXABAY: 'pixabay',
  FLICKR: 'flickr',
  WIKIMEDIA: 'wikimedia',
  MUNICIPAL: 'municipal', // Official town/city sources
  USER_UPLOAD: 'user_upload',
  PROFESSIONAL: 'professional', // Paid stock photos
  OTHER: 'other'
}

export const IMAGE_LICENSES = {
  CC0: 'CC0', // Public domain
  CC_BY: 'CC BY', // Attribution required
  CC_BY_SA: 'CC BY-SA', // Attribution + ShareAlike
  CC_BY_NC: 'CC BY-NC', // Attribution + NonCommercial
  UNSPLASH: 'Unsplash License',
  PEXELS: 'Pexels License',
  PIXABAY: 'Pixabay License',
  PROPRIETARY: 'Proprietary', // We own it or paid for it
  UNKNOWN: 'Unknown'
}

// Human-readable labels for dropdowns/UI
export const IMAGE_SOURCE_LABELS = {
  [IMAGE_SOURCES.UNSPLASH]: 'Unsplash',
  [IMAGE_SOURCES.PEXELS]: 'Pexels',
  [IMAGE_SOURCES.PIXABAY]: 'Pixabay',
  [IMAGE_SOURCES.FLICKR]: 'Flickr',
  [IMAGE_SOURCES.WIKIMEDIA]: 'Wikimedia Commons',
  [IMAGE_SOURCES.MUNICIPAL]: 'Official Municipal Source',
  [IMAGE_SOURCES.USER_UPLOAD]: 'User Upload',
  [IMAGE_SOURCES.PROFESSIONAL]: 'Professional Stock',
  [IMAGE_SOURCES.OTHER]: 'Other'
}

export const IMAGE_LICENSE_LABELS = {
  [IMAGE_LICENSES.CC0]: 'CC0 - Public Domain',
  [IMAGE_LICENSES.CC_BY]: 'CC BY - Attribution Required',
  [IMAGE_LICENSES.CC_BY_SA]: 'CC BY-SA - Attribution + ShareAlike',
  [IMAGE_LICENSES.CC_BY_NC]: 'CC BY-NC - Attribution + NonCommercial',
  [IMAGE_LICENSES.UNSPLASH]: 'Unsplash License',
  [IMAGE_LICENSES.PEXELS]: 'Pexels License',
  [IMAGE_LICENSES.PIXABAY]: 'Pixabay License',
  [IMAGE_LICENSES.PROPRIETARY]: 'Proprietary/Purchased',
  [IMAGE_LICENSES.UNKNOWN]: 'Unknown/Unspecified'
}

// =====================================================
// FILE UPLOAD CONSTRAINTS
// =====================================================

export const UPLOAD_CONSTRAINTS = {
  // File size limits (in bytes)
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILE_SIZE_MB: 5,

  // Allowed MIME types
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ],

  // Allowed file extensions
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],

  // Image dimension constraints
  MIN_WIDTH: 800,
  MIN_HEIGHT: 600,
  MAX_WIDTH: 4000,
  MAX_HEIGHT: 3000,
  RECOMMENDED_WIDTH: 1920,
  RECOMMENDED_HEIGHT: 1080,

  // Aspect ratio constraints (for validation)
  MIN_ASPECT_RATIO: 1.2, // Minimum width/height ratio (e.g., 4:3)
  MAX_ASPECT_RATIO: 2.5, // Maximum width/height ratio (e.g., 21:9)
  IDEAL_ASPECT_RATIO: 1.78 // 16:9
}

// =====================================================
// IMAGE OPTIMIZATION SETTINGS
// =====================================================

export const OPTIMIZATION_SETTINGS = {
  // Target dimensions for optimized images
  DISPLAY_SIZE: {
    width: 1920,
    height: 1080,
    quality: 85
  },

  // Thumbnail size
  THUMBNAIL_SIZE: {
    width: 400,
    height: 300,
    quality: 80
  },

  // Card preview size
  CARD_SIZE: {
    width: 800,
    height: 600,
    quality: 85
  },

  // Output format preferences
  OUTPUT_FORMAT: 'webp', // Primary format
  FALLBACK_FORMAT: 'jpeg', // For older browsers

  // Compression quality (0-100)
  DEFAULT_QUALITY: 85,
  HIGH_QUALITY: 92,
  LOW_QUALITY: 75
}

// =====================================================
// DISPLAY ORDER CONSTRAINTS
// =====================================================

export const DISPLAY_ORDER = {
  MIN: 1,
  MAX: 10, // Support up to 10 images per town (currently using 3)
  DEFAULT: 1,
  PRIMARY: 1, // The main/hero image
  SECONDARY: 2,
  TERTIARY: 3
}

// =====================================================
// VALIDATION RULES
// =====================================================

export const VALIDATION_RULES = {
  // Required fields for image upload
  REQUIRED_FIELDS: ['image_url', 'town_id', 'display_order'],

  // Optional but recommended fields
  RECOMMENDED_FIELDS: ['source', 'license', 'photographer'],

  // URL validation pattern
  URL_PATTERN: /^https?:\/\/.+\.(jpg|jpeg|png|webp)(\?.*)?$/i,

  // Photographer name constraints
  MAX_PHOTOGRAPHER_LENGTH: 100,

  // Validation note constraints
  MAX_VALIDATION_NOTE_LENGTH: 500
}

// =====================================================
// ERROR MESSAGES
// =====================================================

export const ERROR_MESSAGES = {
  // File upload errors
  FILE_TOO_LARGE: `File size must be less than ${UPLOAD_CONSTRAINTS.MAX_FILE_SIZE_MB}MB`,
  INVALID_FILE_TYPE: `File must be one of: ${UPLOAD_CONSTRAINTS.ALLOWED_EXTENSIONS.join(', ')}`,
  DIMENSIONS_TOO_SMALL: `Image must be at least ${UPLOAD_CONSTRAINTS.MIN_WIDTH}x${UPLOAD_CONSTRAINTS.MIN_HEIGHT}px`,
  DIMENSIONS_TOO_LARGE: `Image must be no larger than ${UPLOAD_CONSTRAINTS.MAX_WIDTH}x${UPLOAD_CONSTRAINTS.MAX_HEIGHT}px`,
  INVALID_ASPECT_RATIO: 'Image aspect ratio is not suitable for display',

  // Data validation errors
  INVALID_URL: 'Image URL must be a valid HTTP(S) URL ending in .jpg, .jpeg, .png, or .webp',
  MISSING_TOWN_ID: 'Town ID is required',
  INVALID_DISPLAY_ORDER: `Display order must be between ${DISPLAY_ORDER.MIN} and ${DISPLAY_ORDER.MAX}`,
  INVALID_SOURCE: `Source must be one of: ${Object.values(IMAGE_SOURCES).join(', ')}`,
  INVALID_LICENSE: `License must be one of: ${Object.values(IMAGE_LICENSES).join(', ')}`,

  // Database errors
  DUPLICATE_DISPLAY_ORDER: 'An image with this display order already exists for this town',
  TOWN_NOT_FOUND: 'Town not found',
  IMAGE_NOT_FOUND: 'Image not found'
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get all valid source values
 * @returns {string[]} Array of valid source values
 */
export function getValidSources() {
  return Object.values(IMAGE_SOURCES)
}

/**
 * Get all valid license values
 * @returns {string[]} Array of valid license values
 */
export function getValidLicenses() {
  return Object.values(IMAGE_LICENSES)
}

/**
 * Check if a source value is valid
 * @param {string} source - Source to validate
 * @returns {boolean} True if valid
 */
export function isValidSource(source) {
  return getValidSources().includes(source)
}

/**
 * Check if a license value is valid
 * @param {string} license - License to validate
 * @returns {boolean} True if valid
 */
export function isValidLicense(license) {
  return getValidLicenses().includes(license)
}

/**
 * Check if a display order is valid
 * @param {number} order - Display order to validate
 * @returns {boolean} True if valid
 */
export function isValidDisplayOrder(order) {
  return Number.isInteger(order) && order >= DISPLAY_ORDER.MIN && order <= DISPLAY_ORDER.MAX
}

/**
 * Validate image URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false
  return VALIDATION_RULES.URL_PATTERN.test(url)
}

/**
 * Get column set by name
 * @param {string} setName - Name of the column set
 * @returns {string} Column set string for SELECT queries
 */
export function getImageColumns(setName = 'basic') {
  return IMAGE_COLUMN_SETS[setName] || IMAGE_COLUMN_SETS.basic
}

/**
 * Build custom column set by combining predefined sets
 * @param {...string} sets - Column set names to combine
 * @returns {string} Combined column list
 */
export function combineImageColumnSets(...sets) {
  const columns = new Set()

  sets.forEach(setName => {
    if (!IMAGE_COLUMN_SETS[setName]) {
      console.warn(`Unknown image column set: ${setName}`)
      return
    }

    const setColumns = IMAGE_COLUMN_SETS[setName]
      .split(',')
      .map(col => col.trim())
      .filter(col => col.length > 0)

    setColumns.forEach(col => columns.add(col))
  })

  return Array.from(columns).join(', ')
}

// =====================================================
// STORAGE CONFIGURATION
// =====================================================

export const STORAGE_CONFIG = {
  // Supabase storage bucket name
  BUCKET_NAME: 'town-images',

  // Folder structure within bucket
  FOLDERS: {
    ORIGINALS: 'originals',
    OPTIMIZED: 'optimized',
    THUMBNAILS: 'thumbnails'
  },

  // File naming pattern
  FILE_NAME_PATTERN: '{town_id}_{display_order}_{timestamp}',

  // Public URL base (if using CDN)
  CDN_BASE_URL: null // Set when CDN is configured
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  IMAGE_CONFIG,
  IMAGE_COLUMN_SETS,
  IMAGE_SOURCES,
  IMAGE_LICENSES,
  IMAGE_SOURCE_LABELS,
  IMAGE_LICENSE_LABELS,
  UPLOAD_CONSTRAINTS,
  OPTIMIZATION_SETTINGS,
  DISPLAY_ORDER,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  STORAGE_CONFIG,
  // Helper functions
  getValidSources,
  getValidLicenses,
  isValidSource,
  isValidLicense,
  isValidDisplayOrder,
  isValidImageUrl,
  getImageColumns,
  combineImageColumnSets
}
