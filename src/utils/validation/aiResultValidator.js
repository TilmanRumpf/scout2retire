/**
 * AI Result Validator
 * Detects garbage/suspicious values in AI-populated town data
 */

export const FIELD_VALIDATORS = {
  // Numeric fields - must be parseable integers
  airport_distance: {
    type: 'integer',
    min: 0,
    max: 500,
    validate: (value) => {
      if (!value) return null;
      const num = parseInt(value);
      if (isNaN(num)) return { severity: 'error', message: 'Not a valid number' };
      if (num < 0) return { severity: 'error', message: 'Cannot be negative' };
      if (num > 500) return { severity: 'warning', message: 'Unusually far from airport (>500km)' };
      return null;
    }
  },

  population: {
    type: 'integer',
    min: 1,
    max: 30000000,
    validate: (value) => {
      if (!value) return null;
      const num = parseInt(value);
      if (isNaN(num)) return { severity: 'error', message: 'Not a valid number' };
      if (num < 1) return { severity: 'error', message: 'Population must be > 0' };
      if (num > 30000000) return { severity: 'warning', message: 'Unusually large population' };
      return null;
    }
  },

  cost_of_living_usd: {
    type: 'integer',
    min: 300,
    max: 8000,
    validate: (value) => {
      if (!value) return null;
      const num = parseInt(value);
      if (isNaN(num)) return { severity: 'error', message: 'Not a valid number' };
      if (num < 300) return { severity: 'warning', message: 'Unusually low cost (<$300/month)' };
      if (num > 8000) return { severity: 'warning', message: 'Unusually high cost (>$8000/month)' };
      return null;
    }
  },

  // Text fields - check for garbage responses
  description: {
    type: 'text',
    minLength: 50,
    maxLength: 1500,
    validate: (value) => {
      if (!value) return { severity: 'error', message: 'Description is required' };
      const lower = value.toLowerCase();

      // Check for AI refusal patterns
      if (lower.includes("i don't know") || lower.includes("i cannot") || lower.includes("unknown")) {
        return { severity: 'error', message: 'AI could not generate description' };
      }

      if (value.length < 50) return { severity: 'warning', message: 'Description too short' };
      if (value.length > 1500) return { severity: 'warning', message: 'Description too long' };

      return null;
    }
  }
};

/**
 * Universal garbage detection patterns
 */
const GARBAGE_PATTERNS = [
  /i don'?t know/i,
  /i cannot/i,
  /unable to/i,
  /no information/i,
  /not available/i,
  /unknown/i,
  /n\/?a/i,
  /null/i,
  /undefined/i,
  /error/i,
  /^http/i  // URLs in non-photo fields
];

/**
 * Check if value contains garbage patterns
 */
function containsGarbagePattern(value) {
  if (!value) return false;
  const str = String(value);
  return GARBAGE_PATTERNS.some(pattern => pattern.test(str));
}

/**
 * Validate a single field value
 * @param {string} fieldName - The field name
 * @param {any} value - The value to validate
 * @returns {Object|null} - { severity: 'error'|'warning', message: string } or null if valid
 */
export function validateField(fieldName, value) {
  // Check for garbage patterns first
  if (containsGarbagePattern(value)) {
    return { severity: 'error', message: 'Contains invalid/unknown value' };
  }

  // Check field-specific validator
  const validator = FIELD_VALIDATORS[fieldName];
  if (validator?.validate) {
    return validator.validate(value);
  }

  return null;
}

/**
 * Validate all AI-populated data
 * @param {Object} data - The populated town data
 * @returns {Object} - { issues: Array<{field, severity, message}>, hasErrors: boolean, hasWarnings: boolean }
 */
export function validateAIResults(data) {
  const issues = [];

  Object.entries(data).forEach(([field, value]) => {
    // Skip null/undefined values
    if (value === null || value === undefined || value === '') return;

    const issue = validateField(field, value);
    if (issue) {
      issues.push({ field, ...issue, value });
    }
  });

  return {
    issues,
    hasErrors: issues.some(i => i.severity === 'error'),
    hasWarnings: issues.some(i => i.severity === 'warning'),
    totalIssues: issues.length
  };
}

/**
 * Get field category for display
 */
export function getFieldDisplayName(fieldName) {
  const displayNames = {
    airport_distance: 'Airport Distance',
    population: 'Population',
    cost_of_living_usd: 'Cost of Living (USD)',
    description: 'Description',
    healthcare_score: 'Healthcare Score',
    safety_score: 'Safety Score'
  };

  return displayNames[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format value for display in audit screen
 */
export function formatValueForDisplay(fieldName, value) {
  if (value === null || value === undefined) return 'Not set';

  const validator = FIELD_VALIDATORS[fieldName];
  if (validator?.type === 'integer') {
    return value.toLocaleString();
  }

  if (typeof value === 'string' && value.length > 100) {
    return value.substring(0, 100) + '...';
  }

  return String(value);
}
