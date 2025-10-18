/**
 * ADMIN FIELD METADATA - COMPREHENSIVE INLINE EDITING SYSTEM
 *
 * Complete metadata for all admin fields shown in ScoreBreakdownPanel.jsx
 * Defines field types, ranges, validation rules, and descriptions for inline editing.
 *
 * Created: 2025-10-17
 *
 * USAGE:
 *   import { ADMIN_FIELD_METADATA, getFieldMetadata, validateFieldValue } from './adminFieldMetadata'
 *   const metadata = getFieldMetadata('healthcare_score')
 *   const isValid = validateFieldValue('healthcare_score', 7.5)
 */

import { VALID_CATEGORICAL_VALUES } from '../validation/categoricalValues.js';

/**
 * Field metadata structure for each admin field
 * @typedef {Object} FieldMetadata
 * @property {string} label - User-friendly display name
 * @property {string} type - Data type: 'number', 'string', 'boolean', 'select', 'array', 'text'
 * @property {string|number[]|null} range - Valid range (for numbers: '0-10') or options (for select)
 * @property {number|null} step - Step increment for number inputs
 * @property {string} description - Tooltip/help text explaining what this field means
 * @property {boolean} editable - Whether this field can be edited inline
 * @property {string|null} unit - Unit of measurement (if applicable): 'km', '%', 'count', etc.
 * @property {string|null} category - Which section this field belongs to
 * @property {Function|null} validator - Custom validation function
 */

export const ADMIN_FIELD_METADATA = {
  // ========================================
  // HEALTHCARE SECTION (30 points)
  // ========================================

  healthcare_score: {
    label: 'Healthcare Score',
    type: 'number',
    range: '0.0-10.0',
    step: 0.1,
    description: 'Overall healthcare quality rating on 0-10 scale. Used as base for healthcare scoring (30 admin points max). System adds auto-bonuses for hospital count, distance, etc.',
    editable: true,
    unit: '/10.0',
    category: 'healthcare',
    validator: (val) => val >= 0 && val <= 10
  },

  hospital_count: {
    label: 'Hospital Count',
    type: 'number',
    range: '0-100',
    step: 1,
    description: 'Number of hospitals in the town. AUTO-BONUS: 10+ hospitals = +1.0 pts, 5-9 = +0.7, 2-4 = +0.5, 1 = +0.3 pts added to healthcare score',
    editable: true,
    unit: 'count',
    category: 'healthcare',
    validator: (val) => val >= 0 && Number.isInteger(Number(val))
  },

  nearest_major_hospital_km: {
    label: 'Nearest Hospital Distance',
    type: 'number',
    range: '0-999',
    step: 0.1,
    description: 'Distance to nearest major hospital in kilometers. AUTO-PENALTY: <5km = +1.0 pts, 5-10km = +0.7, 10-30km = +0.5, 30-60km = +0.3, >60km = 0 pts',
    editable: true,
    unit: 'km',
    category: 'healthcare',
    validator: (val) => val >= 0
  },

  emergency_services_quality: {
    label: 'Emergency Services Quality',
    type: 'select',
    range: ['poor', 'basic', 'functional', 'good', 'excellent'],
    step: null,
    description: 'Quality of emergency medical services (ambulance, paramedics, ER)',
    editable: true,
    unit: null,
    category: 'healthcare',
    validator: (val) => ['poor', 'basic', 'functional', 'good', 'excellent'].includes(val?.toLowerCase())
  },

  english_speaking_doctors: {
    label: 'English Speaking Doctors',
    type: 'boolean',
    range: 'true/false',
    step: null,
    description: 'Whether English-speaking doctors are readily available',
    editable: true,
    unit: null,
    category: 'healthcare',
    validator: (val) => typeof val === 'boolean'
  },

  insurance_availability_rating: {
    label: 'Insurance Availability',
    type: 'number',
    range: '0-10',
    step: 1,
    description: 'Availability and quality of health insurance options (0=none, 10=excellent)',
    editable: true,
    unit: '/10',
    category: 'healthcare',
    validator: (val) => val >= 0 && val <= 10 && Number.isInteger(Number(val))
  },

  healthcare_cost: {
    label: 'Healthcare Cost',
    type: 'number',
    range: '0-10000',
    step: 10,
    description: 'Monthly healthcare cost estimate in USD',
    editable: true,
    unit: 'USD/month',
    category: 'healthcare',
    validator: (val) => val >= 0
  },

  // ========================================
  // SAFETY SECTION (25 points)
  // ========================================

  safety_score: {
    label: 'Safety Score',
    type: 'number',
    range: '0.0-10.0',
    step: 0.1,
    description: 'Overall safety rating on 0-10 scale. Base safety score (25 admin points max). System adds/deducts for crime_rate, environmental_health_rating, etc.',
    editable: true,
    unit: '/10.0',
    category: 'safety',
    validator: (val) => val >= 0 && val <= 10
  },

  crime_rate: {
    label: 'Crime Rate',
    type: 'select',
    range: ['very_low', 'low', 'moderate', 'high', 'very_high'],
    step: null,
    description: 'General crime level descriptor. AUTO-IMPACT: very_low = +0.5 safety, low = +0.2, moderate = 0, high = -0.3, very_high = -0.5 to safety_score',
    editable: true,
    unit: null,
    category: 'safety',
    validator: (val) => ['very_low', 'low', 'moderate', 'high', 'very_high'].includes(val?.toLowerCase())
  },

  environmental_health_rating: {
    label: 'Environmental Health Rating',
    type: 'number',
    range: '0-10',
    step: 1,
    description: 'Air/water quality, pollution levels (0=poor, 10=excellent). Used for conditional 15-point environmental bonus if user is sensitive',
    editable: true,
    unit: '/10',
    category: 'safety',
    validator: (val) => val >= 0 && val <= 10 && Number.isInteger(Number(val))
  },

  natural_disaster_risk: {
    label: 'Natural Disaster Risk',
    type: 'number',
    range: '0-10',
    step: 1,
    description: 'Risk of earthquakes, floods, hurricanes, etc. (0=no risk, 10=extreme risk)',
    editable: true,
    unit: '/10',
    category: 'safety',
    validator: (val) => val >= 0 && val <= 10 && Number.isInteger(Number(val))
  },

  political_stability_rating: {
    label: 'Political Stability',
    type: 'number',
    range: '0-100',
    step: 1,
    description: 'Political stability and government continuity (0-100 scale, converted to /10 for scoring). Worth 10 admin points with gradual scoring',
    editable: true,
    unit: '/100',
    category: 'safety',
    validator: (val) => val >= 0 && val <= 100 && Number.isInteger(Number(val))
  },

  // ========================================
  // INFRASTRUCTURE SECTION (15 points)
  // ========================================

  walkability: {
    label: 'Walkability Score',
    type: 'number',
    range: '0-100',
    step: 1,
    description: 'How walkable the town is (0=car-dependent, 100=very walkable)',
    editable: true,
    unit: '/100',
    category: 'infrastructure',
    validator: (val) => val >= 0 && val <= 100 && Number.isInteger(Number(val))
  },

  air_quality_index: {
    label: 'Air Quality Index',
    type: 'number',
    range: '0-500',
    step: 1,
    description: 'Air Quality Index (AQI): 0-50=Good, 51-100=Moderate, 101-150=Unhealthy for sensitive, 151-200=Unhealthy, 201+=Very unhealthy',
    editable: true,
    unit: 'AQI',
    category: 'infrastructure',
    validator: (val) => val >= 0 && val <= 500
  },

  regional_airport_distance: {
    label: 'Regional Airport Distance',
    type: 'number',
    range: '0-1000',
    step: 1,
    description: 'Distance to nearest regional airport (domestic flights only) in kilometers',
    editable: true,
    unit: 'km',
    category: 'infrastructure',
    validator: (val) => val === null || val >= 0
  },

  international_airport_distance: {
    label: 'International Airport Distance',
    type: 'number',
    range: '0-1000',
    step: 1,
    description: 'Distance to nearest international airport (direct international flights) in kilometers',
    editable: true,
    unit: 'km',
    category: 'infrastructure',
    validator: (val) => val === null || val >= 0
  },

  airport_distance: {
    label: 'Airport Distance (Fallback)',
    type: 'number',
    range: '0-1000',
    step: 1,
    description: 'Distance to nearest airport of any type in kilometers (legacy field - use regional/international for clarity)',
    editable: true,
    unit: 'km',
    category: 'infrastructure',
    validator: (val) => val >= 0
  },

  government_efficiency_rating: {
    label: 'Government Efficiency',
    type: 'number',
    range: '0-100',
    step: 1,
    description: 'Government service quality and bureaucratic efficiency (0-100 scale). Divided by 10 = Infrastructure score. Worth 15 admin points with gradual scoring',
    editable: true,
    unit: '/100',
    category: 'infrastructure',
    validator: (val) => val >= 0 && val <= 100 && Number.isInteger(Number(val))
  },

  // ========================================
  // LEGAL & ADMIN SECTION (10 points)
  // ========================================

  visa_requirements: {
    label: 'Visa Requirements',
    type: 'text',
    range: 'text',
    step: null,
    description: 'Summary of visa/entry requirements for various nationalities',
    editable: true,
    unit: null,
    category: 'legal',
    validator: (val) => typeof val === 'string' && val.length <= 500
  },

  visa_on_arrival_countries: {
    label: 'Visa-Free Countries',
    type: 'array',
    range: 'array',
    step: null,
    description: 'Array of country codes that can enter visa-free or with visa-on-arrival. Used for 10-point visa matching bonus if user citizenship matches',
    editable: true,
    unit: null,
    category: 'legal',
    validator: (val) => Array.isArray(val) && val.every(c => typeof c === 'string')
  },

  retirement_visa_available: {
    label: 'Retirement Visa Available',
    type: 'boolean',
    range: 'true/false',
    step: null,
    description: 'Whether a retirement visa program exists. Worth 8 admin points if user wants easy visa access',
    editable: true,
    unit: null,
    category: 'legal',
    validator: (val) => typeof val === 'boolean'
  },

  tax_treaty_us: {
    label: 'US Tax Treaty',
    type: 'boolean',
    range: 'true/false',
    step: null,
    description: 'Whether country has tax treaty with United States',
    editable: true,
    unit: null,
    category: 'legal',
    validator: (val) => typeof val === 'boolean'
  },

  tax_haven_status: {
    label: 'Tax Haven Status',
    type: 'boolean',
    range: 'true/false',
    step: null,
    description: 'Whether recognized as tax haven (low/no income tax)',
    editable: true,
    unit: null,
    category: 'legal',
    validator: (val) => typeof val === 'boolean'
  },

  // ========================================
  // ADDITIONAL FIELDS (referenced in scoring)
  // ========================================

  income_tax_rate_pct: {
    label: 'Income Tax Rate',
    type: 'number',
    range: '0-100',
    step: 0.1,
    description: 'Effective income tax rate percentage. Lower is better. Thresholds: 0-10%=excellent, 10-20%=good, 20-30%=fair, 30-40%=poor, 40%+=very high',
    editable: true,
    unit: '%',
    category: 'legal',
    validator: (val) => val >= 0 && val <= 100
  },

  property_tax_rate_pct: {
    label: 'Property Tax Rate',
    type: 'number',
    range: '0-10',
    step: 0.1,
    description: 'Property tax rate percentage. Lower is better. Thresholds: 0-1%=excellent, 1-2%=good, 2-3%=fair, 3-4%=poor, 4%+=very high',
    editable: true,
    unit: '%',
    category: 'legal',
    validator: (val) => val >= 0 && val <= 10
  },

  sales_tax_rate_pct: {
    label: 'Sales/VAT Tax Rate',
    type: 'number',
    range: '0-30',
    step: 0.1,
    description: 'Sales or VAT tax rate percentage. Thresholds: 0-10%=excellent, 10-17%=good, 17-22%=fair, 22-27%=poor, 27%+=very high',
    editable: true,
    unit: '%',
    category: 'legal',
    validator: (val) => val >= 0 && val <= 30
  },

  foreign_income_taxed: {
    label: 'Foreign Income Taxed',
    type: 'boolean',
    range: 'true/false',
    step: null,
    description: 'Whether foreign-sourced income is subject to local taxation (false = bonus)',
    editable: true,
    unit: null,
    category: 'legal',
    validator: (val) => typeof val === 'boolean'
  },

  easy_residency_countries: {
    label: 'Easy Residency Countries',
    type: 'array',
    range: 'array',
    step: null,
    description: 'Array of country codes with simplified residency paths. Worth 10 admin points if user citizenship matches',
    editable: true,
    unit: null,
    category: 'legal',
    validator: (val) => Array.isArray(val) && val.every(c => typeof c === 'string')
  },

  // ========================================
  // CALCULATED/DISPLAY FIELDS (not editable)
  // ========================================

  overall_score: {
    label: 'Overall Score',
    type: 'number',
    range: '0-100',
    step: 0.1,
    description: 'CALCULATED: Total matching score (0-100). Weighted average of all category scores. READ ONLY - changes when underlying scores change',
    editable: false,
    unit: '/100',
    category: 'calculated',
    validator: null
  },

  admin_score: {
    label: 'Admin Category Score',
    type: 'number',
    range: '0-100',
    step: 0.1,
    description: 'CALCULATED: Administration category score based on user preferences and admin field data. Worth 20% of overall match score. READ ONLY',
    editable: false,
    unit: '/100',
    category: 'calculated',
    validator: null
  }
};

/**
 * Get metadata for a specific field
 * @param {string} fieldName - Database field name
 * @returns {FieldMetadata|null} Field metadata or null if not found
 */
export function getFieldMetadata(fieldName) {
  return ADMIN_FIELD_METADATA[fieldName] || null;
}

/**
 * Validate a field value against its metadata
 * @param {string} fieldName - Database field name
 * @param {any} value - Value to validate
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validateFieldValue(fieldName, value) {
  const metadata = ADMIN_FIELD_METADATA[fieldName];

  if (!metadata) {
    return { valid: false, error: `Unknown field: ${fieldName}` };
  }

  if (!metadata.editable) {
    return { valid: false, error: `Field ${fieldName} is not editable (calculated field)` };
  }

  // Handle null/undefined
  if (value === null || value === undefined || value === '') {
    // Most fields allow null (empty)
    return { valid: true, error: null };
  }

  // Type validation
  switch (metadata.type) {
    case 'number':
      const num = Number(value);
      if (isNaN(num)) {
        return { valid: false, error: 'Must be a valid number' };
      }

      // Range validation
      if (metadata.range && typeof metadata.range === 'string') {
        const [min, max] = metadata.range.split('-').map(Number);
        if (num < min || num > max) {
          return { valid: false, error: `Must be between ${min} and ${max}` };
        }
      }

      // Custom validator
      if (metadata.validator && !metadata.validator(num)) {
        return { valid: false, error: `Invalid value for ${metadata.label}` };
      }

      return { valid: true, error: null };

    case 'boolean':
      if (typeof value !== 'boolean') {
        return { valid: false, error: 'Must be true or false' };
      }
      return { valid: true, error: null };

    case 'select':
      const options = metadata.range;
      if (!Array.isArray(options)) {
        return { valid: false, error: 'Invalid select configuration' };
      }

      const valueLower = String(value).toLowerCase();
      const validOption = options.some(opt => opt.toLowerCase() === valueLower);

      if (!validOption) {
        return { valid: false, error: `Must be one of: ${options.join(', ')}` };
      }
      return { valid: true, error: null };

    case 'array':
      if (!Array.isArray(value)) {
        return { valid: false, error: 'Must be an array' };
      }

      if (metadata.validator && !metadata.validator(value)) {
        return { valid: false, error: 'Invalid array contents' };
      }

      return { valid: true, error: null };

    case 'text':
    case 'string':
      if (typeof value !== 'string') {
        return { valid: false, error: 'Must be text' };
      }

      if (metadata.validator && !metadata.validator(value)) {
        return { valid: false, error: 'Invalid text value' };
      }

      return { valid: true, error: null };

    default:
      return { valid: false, error: `Unknown field type: ${metadata.type}` };
  }
}

/**
 * Get all fields in a specific category
 * @param {string} categoryName - Category name (healthcare, safety, infrastructure, legal, calculated)
 * @returns {Object} Object with field names as keys and metadata as values
 */
export function getFieldsByCategory(categoryName) {
  const result = {};

  Object.entries(ADMIN_FIELD_METADATA).forEach(([fieldName, metadata]) => {
    if (metadata.category === categoryName) {
      result[fieldName] = metadata;
    }
  });

  return result;
}

/**
 * Get all editable fields
 * @returns {Object} Object with field names as keys and metadata as values
 */
export function getEditableFields() {
  const result = {};

  Object.entries(ADMIN_FIELD_METADATA).forEach(([fieldName, metadata]) => {
    if (metadata.editable) {
      result[fieldName] = metadata;
    }
  });

  return result;
}

/**
 * Format field value for display
 * @param {string} fieldName - Database field name
 * @param {any} value - Raw value from database
 * @returns {string} Formatted display value
 */
export function formatFieldValue(fieldName, value) {
  const metadata = ADMIN_FIELD_METADATA[fieldName];

  if (!metadata) return String(value || '(unknown field)');
  if (value === null || value === undefined) return '(empty)';

  switch (metadata.type) {
    case 'number':
      const num = Number(value);
      if (isNaN(num)) return '(invalid)';

      // Format with unit
      const formatted = metadata.step && metadata.step < 1
        ? num.toFixed(1)
        : num.toString();

      return metadata.unit ? `${formatted} ${metadata.unit}` : formatted;

    case 'boolean':
      return value ? 'Yes' : 'No';

    case 'array':
      return Array.isArray(value) ? value.join(', ') : '(invalid array)';

    case 'select':
    case 'text':
    case 'string':
    default:
      return String(value);
  }
}

/**
 * Parse user input string to proper field value
 * @param {string} fieldName - Database field name
 * @param {string} inputValue - User input string
 * @returns {any} Parsed value in correct type
 */
export function parseFieldInput(fieldName, inputValue) {
  const metadata = ADMIN_FIELD_METADATA[fieldName];

  if (!metadata) return inputValue;
  if (inputValue === null || inputValue === undefined || inputValue === '') return null;

  switch (metadata.type) {
    case 'number':
      const num = Number(inputValue);
      return isNaN(num) ? null : num;

    case 'boolean':
      const lower = String(inputValue).toLowerCase().trim();
      if (lower === 'true' || lower === 'yes' || lower === '1') return true;
      if (lower === 'false' || lower === 'no' || lower === '0') return false;
      return null;

    case 'array':
      // If already array, return as-is
      if (Array.isArray(inputValue)) return inputValue;
      // Try to parse JSON
      try {
        const parsed = JSON.parse(inputValue);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        // Split by comma
        return String(inputValue).split(',').map(s => s.trim()).filter(s => s.length > 0);
      }

    case 'select':
    case 'text':
    case 'string':
    default:
      return String(inputValue);
  }
}

export default ADMIN_FIELD_METADATA;
