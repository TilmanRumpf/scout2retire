/**
 * Bulk Update Town Utility
 * Analyzes town data completeness and generates AI-powered update suggestions
 *
 * Updated: November 13, 2025 - Added tab-aware filtering for Smart Update
 */

import { researchFieldWithContext } from '../aiResearch';
import { FIELD_CATEGORIES } from '../fieldCategories.js';
import { ARRAY_FIELDS, isArrayField } from '../config/arrayFields.js';
import { normalizeFieldValue } from '../fieldNormalization.js';

// NOTE: ARRAY_FIELDS now imported from ../config/arrayFields.js
// This is the SINGLE SOURCE OF TRUTH for text[] fields (no more duplication)

/**
 * Normalize field value for database storage
 * NOW USING CONSOLIDATED NORMALIZATION - November 14, 2025
 *
 * @param {string} fieldName - Field name
 * @param {any} rawValue - Raw value from UI
 * @returns {any} Normalized value ready for DB
 */
function normalizeFieldValueForDb(fieldName, rawValue) {
  return normalizeFieldValue(fieldName, rawValue, 'db');
}

// Field categories for wizard-based updates
const CRITICAL_FIELDS = new Set([
  // Algorithm-blocking fields - Session 1
  'climate',
  'population',
  'cost_of_living_usd',
  'healthcare_score',
  'safety_score',
  'description',
  'image_url_1',
  'town_name',
  'climate_description',
  'geographic_features_actual',  // 🔧 FIX: Use actual DB column name (not 'geographic_features')
  'water_bodies',  // 🔧 FIX (water_bodies bug): Critical for region/location matching
  'avg_temp_summer',
  'avg_temp_winter',
  'annual_rainfall'
]);

const SUPPLEMENTAL_FIELDS = new Set([
  // Nice-to-have fields - Session 2
  'verbose_description',
  'cultural_events_rating',
  'restaurants_rating',
  'walkability',
  'cultural_landmark_1',
  'museum_count',
  'nightlife_rating',
  'shopping_rating'
]);

// Priority weight for each field (higher = more important)
const FIELD_PRIORITIES = {
  // Critical - Algorithm-blocking (weight: 10-8)
  town_name: 10,
  description: 10,
  image_url_1: 10,
  climate: 9,
  population: 9,
  cost_of_living_usd: 9,
  healthcare_score: 8,
  safety_score: 8,
  climate_description: 8,
  geographic_features_actual: 8,  // 🔧 FIX: Use actual DB column name
  water_bodies: 8,  // 🔧 FIX (water_bodies bug): Same priority as geographic_features
  avg_temp_summer: 7,
  avg_temp_winter: 7,
  annual_rainfall: 7,

  // Supplemental - Nice to have (weight: 1-6)
  verbose_description: 6,
  cultural_events_rating: 5,
  restaurants_rating: 5,
  walkability: 4,
  nightlife_rating: 4,
  shopping_rating: 3,
  cultural_landmark_1: 2,
  museum_count: 1
};

/**
 * Plain English explanations for why each field matters
 * Used to help non-technical admins understand what needs fixing
 */
const FIELD_EXPLANATIONS = {
  // Critical fields
  town_name: 'Town name is required for users to find this location',
  description: 'Short description appears in search results - helps users decide if they want to learn more',
  image_url_1: 'Main photo is the first thing users see - towns without photos get skipped',
  climate: 'Climate type (tropical, temperate, etc.) is required for the matching algorithm to work',
  population: 'Population size helps users find towns that match their preference (small village vs city)',
  cost_of_living_usd: 'Monthly cost helps users filter by cost - algorithm cannot work without this',
  healthcare_score: 'Healthcare quality score (0-100) - critical for retirees making health decisions',
  safety_score: 'Safety score (0-100) - users filter by this when choosing where to live',
  climate_description: 'Detailed climate info helps users understand what weather to expect year-round',
  geographic_features_actual: 'Location type (coastal, mountains, etc.) - users have strong preferences about this',  // 🔧 FIX: Use actual DB column name
  water_bodies: 'Nearby water bodies (ocean, lake, river) - users have strong preferences about proximity to water',  // 🔧 FIX (water_bodies bug): Added explanation
  avg_temp_summer: 'Summer temperature in Celsius - users need this to plan visits and understand comfort',
  avg_temp_winter: 'Winter temperature in Celsius - critical for users avoiding cold or seeking seasons',
  annual_rainfall: 'Rainfall in mm/year - helps users avoid too wet or too dry climates',

  // Supplemental fields
  verbose_description: 'Long description with details - makes town profile more appealing and informative',
  cultural_events_rating: 'Cultural events score helps users find active vs quiet communities',
  restaurants_rating: 'Restaurant quality score - important for food-focused retirees',
  walkability: 'Walkability score shows if town is pedestrian-friendly or car-dependent',
  nightlife_rating: 'Nightlife score helps users find lively vs peaceful towns',
  shopping_rating: 'Shopping options score - some retirees want access to stores and malls',
  cultural_landmark_1: 'Notable landmark makes town profile more interesting and memorable',
  museum_count: 'Number of museums indicates cultural richness of the area'
};

/**
 * Get plain English explanation for why a field matters
 * @param {string} fieldName - Database field name
 * @returns {string} Simple explanation
 */
export function getFieldExplanation(fieldName) {
  return FIELD_EXPLANATIONS[fieldName] || 'This field helps provide complete information about the town';
}

/**
 * Filter fields by mode (critical vs supplemental)
 * @param {Array} fields - Array of field objects
 * @param {string} mode - 'critical' or 'supplemental'
 * @returns {Array} Filtered fields
 */
export function filterFieldsByMode(fields, mode = 'critical') {
  if (mode === 'critical') {
    return fields.filter(f => CRITICAL_FIELDS.has(f.fieldName));
  } else if (mode === 'supplemental') {
    return fields.filter(f => SUPPLEMENTAL_FIELDS.has(f.fieldName));
  }
  return fields;
}

/**
 * Analyze town to find fields needing updates
 * @param {Object} town - Town data object
 * @param {Object} auditResults - Audit confidence results (field_name -> confidence)
 * @param {string} mode - 'critical', 'supplemental', or 'all' (default: 'all')
 * @param {string|null} tabFilter - Optional tab name to filter by (e.g., 'Region', 'Climate')
 * @returns {Object} Analysis with fields categorized by priority
 */
export function analyzeTownCompleteness(town, auditResults = {}, mode = 'all', tabFilter = null) {
  const missingFields = [];
  const lowConfidenceFields = [];
  const allFieldsNeedingAttention = [];

  // Iterate through all fields in the town
  Object.keys(town).forEach(fieldName => {
    const value = town[fieldName];
    const confidence = auditResults[fieldName]?.confidence || 'unknown';
    const priority = FIELD_PRIORITIES[fieldName] || 1;

    // Skip system fields
    if (['id', 'created_at', 'updated_at', 'created_by', 'updated_by'].includes(fieldName)) {
      return;
    }

    // Check if field is missing/empty
    const isEmpty = value === null ||
                    value === undefined ||
                    value === '' ||
                    value === 'NULL' ||
                    value === 'null';

    // Check if field has low confidence
    const hasLowConfidence = ['low', 'unknown'].includes(confidence);

    if (isEmpty) {
      missingFields.push({
        fieldName,
        confidence,
        priority,
        currentValue: null,
        reason: 'Empty/NULL value'
      });

      allFieldsNeedingAttention.push({
        fieldName,
        confidence,
        priority,
        currentValue: null,
        reason: 'Empty/NULL value'
      });
    } else if (hasLowConfidence) {
      lowConfidenceFields.push({
        fieldName,
        confidence,
        priority,
        currentValue: value,
        reason: `Low confidence (${confidence})`
      });

      allFieldsNeedingAttention.push({
        fieldName,
        confidence,
        priority,
        currentValue: value,
        reason: `Low confidence (${confidence})`
      });
    }
  });

  // Sort by priority (highest first)
  const sortByPriority = (a, b) => b.priority - a.priority;
  missingFields.sort(sortByPriority);
  lowConfidenceFields.sort(sortByPriority);
  allFieldsNeedingAttention.sort(sortByPriority);

  // 🆕 TAB-AWARE FILTERING (Added: November 13, 2025)
  // If tabFilter is provided, it takes precedence over mode filtering
  let filteredFields = allFieldsNeedingAttention;

  if (tabFilter) {
    // Tab-specific Smart Update: ignore mode, filter by tab only
    console.log(`[SmartUpdate] mode: ${mode}, tab: ${tabFilter}`);
    console.log(`[SmartUpdate] candidate fields BEFORE tab filter:`, allFieldsNeedingAttention.map(f => f.fieldName).join(', '));

    filteredFields = allFieldsNeedingAttention.filter(field => {
      const fieldCategory = FIELD_CATEGORIES[field.fieldName];

      // Match exact tab name
      if (fieldCategory === tabFilter) {
        return true;
      }

      // For fields not in FIELD_CATEGORIES, exclude them (strict filtering)
      if (!fieldCategory) {
        console.warn(`⚠️ Field "${field.fieldName}" not found in FIELD_CATEGORIES, excluding from tab filter`);
        return false;
      }

      return false;
    });

    console.log(`[SmartUpdate] priority fields AFTER tab filter:`, filteredFields.map(f => f.fieldName).join(', '));
    console.log(`   ✓ Found ${filteredFields.length} fields for tab "${tabFilter}"`);
  } else {
    // Global Smart Update: use mode filtering (critical/supplemental/all)
    console.log(`[SmartUpdate] mode: ${mode}, tab: (none - global)`);

    if (mode === 'critical') {
      filteredFields = filterFieldsByMode(allFieldsNeedingAttention, 'critical');
    } else if (mode === 'supplemental') {
      filteredFields = filterFieldsByMode(allFieldsNeedingAttention, 'supplemental');
    }

    console.log(`[SmartUpdate] priority fields:`, filteredFields.map(f => f.fieldName).join(', '));
  }

  return {
    missingFields,
    lowConfidenceFields,
    allFieldsNeedingAttention: filteredFields,
    totalIssues: filteredFields.length,
    priorityFields: filteredFields, // Return all filtered fields
    tabFilter: tabFilter || null // Include tab filter in result for transparency
  };
}

/**
 * Generate AI suggestions for missing/low-confidence fields
 * @param {Object} town - Town data object
 * @param {Array} fieldsToUpdate - Array of field objects to update
 * @param {Function} onProgress - Callback for progress updates (optional)
 * @returns {Array} Suggestions with AI-generated values
 */
export async function generateUpdateSuggestions(town, fieldsToUpdate, onProgress = null) {
  const suggestions = [];

  for (let i = 0; i < fieldsToUpdate.length; i++) {
    const field = fieldsToUpdate[i];

    if (typeof onProgress === 'function') {
      onProgress({
        current: i + 1,
        total: fieldsToUpdate.length,
        fieldName: field.fieldName
      });
    }

    // 🎯 PRE-FILTER: Skip API call if current value looks valid
    // For text fields, if non-empty and reasonable length, assume it's correct
    const currentValue = field.currentValue;
    const hasValidValue = currentValue !== null &&
                          currentValue !== undefined &&
                          String(currentValue).trim().length > 0;

    // SMART SKIP: For certain fields, if they have ANY value, trust it
    // These are stable fields that rarely need AI correction
    const trustExistingFields = new Set([
      'town_name',      // Town names are manually entered, trust them
      'country',        // Countries are from authoritative sources
      'climate',        // Climate is stable, rarely changes
      'latitude',       // Geographic coordinates are fixed
      'longitude',
      'state_code',     // Administrative codes are fixed
      'region',         // Regional classification is stable
      'population'      // Population data from census, trust existing
    ]);

    if (trustExistingFields.has(field.fieldName) && hasValidValue) {
      console.log(`✓ ${field.fieldName}: Already has valid value "${currentValue}", skipping AI research`);
      continue; // Skip this field entirely - no API call, no suggestion
    }

    try {
      // Use existing AI research infrastructure
      const aiResult = await researchFieldWithContext(
        town.id,
        field.fieldName,
        town,
        {} // options
      );

      if (aiResult.success && aiResult.suggestedValue) {
        // 🚨 CRITICAL: Don't suggest if value is identical to current
        // Normalize for comparison (trim, lowercase for case-insensitive fields)
        const currentNormalized = String(field.currentValue || '').trim();
        const suggestedNormalized = String(aiResult.suggestedValue).trim();

        // Skip if identical (waste of API credits and user time)
        if (currentNormalized === suggestedNormalized) {
          console.log(`✓ ${field.fieldName}: Current value already correct, skipping suggestion`);
          // Don't add to suggestions array at all
          continue;
        }

        // Only suggest if value is actually different
        suggestions.push({
          fieldName: field.fieldName,
          currentValue: field.currentValue,
          suggestedValue: aiResult.suggestedValue,
          confidence: aiResult.confidence || 'limited',
          reason: aiResult.reasoning || field.reason,
          priority: field.priority,
          selected: true // Default to selected
        });
      } else {
        // AI couldn't generate a suggestion
        suggestions.push({
          fieldName: field.fieldName,
          currentValue: field.currentValue,
          suggestedValue: null,
          confidence: 'unknown',
          reason: 'AI could not generate suggestion',
          priority: field.priority,
          selected: false
        });
      }
    } catch (error) {
      console.error(`Error generating suggestion for ${field.fieldName}:`, error);
      suggestions.push({
        fieldName: field.fieldName,
        currentValue: field.currentValue,
        suggestedValue: null,
        confidence: 'unknown',
        reason: `Error: ${error.message}`,
        priority: field.priority,
        selected: false
      });
    }
  }

  return suggestions;
}

/**
 * Apply selected updates to database
 * @param {string} townId - Town ID
 * @param {Array} selectedUpdates - Array of selected update suggestions
 * @param {Object} supabase - Supabase client
 * @returns {Object} Result with success status and details
 */
export async function applyBulkUpdates(townId, selectedUpdates, supabase) {
  if (!selectedUpdates || selectedUpdates.length === 0) {
    return {
      success: false,
      error: 'No updates selected'
    };
  }

  // Build update object with normalization for all array fields
  const updateData = {};

  selectedUpdates.forEach(update => {
    if (update.suggestedValue !== null && update.suggestedValue !== undefined) {
      // 🔧 FIX: Use centralized normalization for ALL fields (especially array fields)
      const valueToStore = normalizeFieldValueForDb(update.fieldName, update.suggestedValue);

      // 🔍 DEBUG: Log normalization for array fields
      if (ARRAY_FIELDS.has(update.fieldName)) {
        console.log(`[ArrayField] ${update.fieldName} normalization:`, {
          rawFinalValue: update.suggestedValue,
          valueToStore,
          isArrayField: true,
          typeOfValueToStore: typeof valueToStore,
          isArray: Array.isArray(valueToStore)
        });
      }

      updateData[update.fieldName] = valueToStore;
    }
  });

  // 🔍 DEBUG: Log final payload for geographic_features_actual
  if (updateData.geographic_features_actual !== undefined) {
    console.log('[GeoFeatures] Final DB payload (about to send to Supabase):', {
      townId,
      fieldName: 'geographic_features_actual',
      value: updateData.geographic_features_actual,
      valueType: typeof updateData.geographic_features_actual,
      isArray: Array.isArray(updateData.geographic_features_actual),
      arrayLength: Array.isArray(updateData.geographic_features_actual) ? updateData.geographic_features_actual.length : 'N/A'
    });
  }

  // 🔍 DEBUG: Log final payload for water_bodies (BUG FIX LOGGING)
  if (updateData.water_bodies !== undefined) {
    console.log('[WaterBodies][BulkUpdate] about to send DB update:', {
      townId,
      fieldName: 'water_bodies',
      valueToStore: updateData.water_bodies,
      typeofValueToStore: typeof updateData.water_bodies,
      isArray: Array.isArray(updateData.water_bodies),
      arrayLength: Array.isArray(updateData.water_bodies) ? updateData.water_bodies.length : 'N/A'
    });
  }

  // AUTO-TRACK: Add current user as last modifier
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      updateData.updated_by = user.id;
    }
  } catch (error) {
    console.warn('Could not get current user for tracking:', error);
    // Continue anyway - tracking is nice-to-have, not critical
  }

  // Apply update to database
  try {
    const { data, error } = await supabase
      .from('towns')
      .update(updateData)
      .eq('id', townId)
      .select();

    if (error) {
      // 🔍 DEBUG: Enhanced error logging for geographic_features_actual
      if (updateData.geographic_features_actual !== undefined) {
        console.error('[GeoFeatures] DB update error:', error);
      }
      // 🔍 DEBUG: Error logging for water_bodies (BUG FIX LOGGING)
      if (updateData.water_bodies !== undefined) {
        console.error('[WaterBodies][BulkUpdate] DB update ERROR:', error);
      }
      return {
        success: false,
        error: error.message
      };
    }

    // 🔍 DEBUG: Log successful update for geographic_features_actual
    if (updateData.geographic_features_actual !== undefined) {
      console.log('[GeoFeatures] DB update SUCCESS:', {
        updatedValue: data[0]?.geographic_features_actual
      });
    }

    // 🔍 DEBUG: Log successful update for water_bodies (BUG FIX LOGGING)
    if (updateData.water_bodies !== undefined) {
      console.log('[WaterBodies][BulkUpdate] DB update result:', {
        data: data[0]?.water_bodies,
        error: null,
        success: true
      });
    }

    return {
      success: true,
      updatedFields: Object.keys(updateData),
      data: data[0]
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get human-readable field name with database column name
 * @param {string} fieldName - Database field name
 * @returns {string} Display name with column name in parentheses
 */
export function getFieldDisplayName(fieldName) {
  const displayNames = {
    image_url_1: 'Primary Photo',
    description: 'Description',
    town_name: 'Town Name',
    verbose_description: 'Detailed Description',
    climate: 'Climate Type',
    climate_description: 'Climate Description',
    population: 'Population',
    cost_of_living_usd: 'Cost of Living (USD)',
    healthcare_score: 'Healthcare Score',
    safety_score: 'Safety Score',
    geographic_features_actual: 'Geographic Features',  // 🔧 FIX: Use actual DB column name
    avg_temp_summer: 'Summer Temperature',
    avg_temp_winter: 'Winter Temperature',
    annual_rainfall: 'Annual Rainfall',
    cultural_events_rating: 'Cultural Events Rating',
    restaurants_rating: 'Restaurants Rating',
    walkability: 'Walkability Score',
    cultural_landmark_1: 'Main Cultural Landmark',
    museum_count: 'Museum Count'
  };

  const humanName = displayNames[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Always show column name in parentheses
  return `${humanName} (${fieldName})`;
}

/**
 * Get confidence indicator icon
 * @param {string} confidence - Confidence level
 * @returns {string} Emoji icon
 */
export function getConfidenceIcon(confidence) {
  const icons = {
    high: '⚡',
    limited: '⭐',
    low: '⚠️',
    unknown: '❓',
    not_editable: '🔒'
  };

  return icons[confidence] || '❓';
}
