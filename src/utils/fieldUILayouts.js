/**
 * Field UI Layout Configuration
 * Defines whether fields should render as compact (single-line) or long-form (multi-line) in Smart Update modal
 *
 * Created: November 14, 2025 - Smart Update UX optimization
 */

/**
 * Fields that require tall, multi-line layout with auto-resizing textareas
 * These are narrative/paragraph fields where content is expected to be multiple sentences
 */
const LONG_FORM_FIELDS = new Set([
  // Core descriptive fields
  'description',
  'verbose_description',
  'overview',

  // Climate & geography narratives
  'climate_description',
  // Note: geographic_features_actual is an array field, NOT long-form text

  // Cultural & lifestyle narratives
  'cultural_events_description',
  'nightlife_description',
  'local_cuisine_description',

  // Activities & recreation narratives
  'activities_description',
  'outdoor_activities_description',

  // Healthcare & services narratives
  'healthcare_description',
  'public_services_description',

  // Any field ending in _description or _overview
  // (will be checked with pattern matching in getFieldUILayout)
]);

/**
 * Get UI layout type for a field
 * @param {string} fieldName - Database field name
 * @returns {string} 'longForm' or 'compact'
 */
export function getFieldUILayout(fieldName) {
  if (!fieldName) return 'compact';

  // Check explicit long-form fields
  if (LONG_FORM_FIELDS.has(fieldName)) {
    return 'longForm';
  }

  // Pattern matching for description/overview fields
  const lowerField = fieldName.toLowerCase();
  if (lowerField.endsWith('_description') ||
      lowerField.endsWith('_overview') ||
      lowerField.includes('_description_') ||
      lowerField === 'notes' ||
      lowerField === 'remarks') {
    return 'longForm';
  }

  // Default to compact for all other fields
  // (numbers, ratings, short text, enums, etc.)
  return 'compact';
}

/**
 * Get CSS classes for field layout
 * @param {string} layout - 'longForm' or 'compact'
 * @returns {Object} CSS class strings for different elements
 */
export function getLayoutClasses(layout) {
  if (layout === 'longForm') {
    return {
      // Long-form: tall boxes with auto-resize
      baseBox: "w-full rounded-md border px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap font-mono min-h-[180px]",
      container: "grid grid-cols-3 gap-4 mb-4",
      label: "text-xs font-medium text-gray-500 dark:text-gray-400"
    };
  } else {
    return {
      // Compact: single-line height, dense spacing
      baseBox: "w-full rounded-md border px-2 py-1.5 text-sm leading-normal min-h-[44px]",
      container: "grid grid-cols-3 gap-3 mb-3",
      label: "text-xs font-medium text-gray-500 dark:text-gray-400"
    };
  }
}

/**
 * Determine if field should use input vs textarea for "Your Final Value"
 * @param {string} fieldName - Database field name
 * @param {string} layout - 'longForm' or 'compact'
 * @returns {string} 'input' or 'textarea'
 */
export function getInputType(fieldName, layout) {
  // Long-form fields always use textarea
  if (layout === 'longForm') {
    return 'textarea';
  }

  // Compact numeric/short fields can use input for better UX
  const numericFields = [
    'population', 'cost_of_living_usd', 'healthcare_score', 'safety_score',
    'avg_temp_summer', 'avg_temp_winter', 'annual_rainfall', 'elevation_m',
    'elevation_meters', 'latitude', 'longitude', 'museum_count', 'hospitals_count',
    'walkability_score', 'internet_speed_mbps'
  ];

  if (numericFields.includes(fieldName)) {
    return 'input';
  }

  // For other compact fields, use textarea but with single row
  // This maintains consistency and allows for slightly longer text if needed
  return 'textarea';
}

/**
 * Export for easy field checking
 */
export const FIELD_LAYOUTS = {
  LONG_FORM_FIELDS: Array.from(LONG_FORM_FIELDS)
};
