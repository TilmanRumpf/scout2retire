/**
 * ADMIN FIELD METADATA TESTS
 *
 * Test suite for adminFieldMetadata.js validation, parsing, and formatting
 * Run with: npm test adminFieldMetadata
 *
 * Created: 2025-10-17
 */

import {
  ADMIN_FIELD_METADATA,
  getFieldMetadata,
  validateFieldValue,
  formatFieldValue,
  parseFieldInput,
  getFieldsByCategory,
  getEditableFields
} from '../adminFieldMetadata.js';

describe('Admin Field Metadata System', () => {

  // ========================================
  // METADATA RETRIEVAL TESTS
  // ========================================

  describe('getFieldMetadata()', () => {
    test('returns metadata for valid field', () => {
      const meta = getFieldMetadata('healthcare_score');
      expect(meta).toBeDefined();
      expect(meta.label).toBe('Healthcare Score');
      expect(meta.type).toBe('number');
      expect(meta.range).toBe('0.0-10.0');
    });

    test('returns null for invalid field', () => {
      const meta = getFieldMetadata('nonexistent_field');
      expect(meta).toBeNull();
    });

    test('all fields have required properties', () => {
      Object.entries(ADMIN_FIELD_METADATA).forEach(([fieldName, meta]) => {
        expect(meta.label).toBeDefined();
        expect(meta.type).toBeDefined();
        expect(meta.description).toBeDefined();
        expect(typeof meta.editable).toBe('boolean');
        expect(meta.category).toBeDefined();
      });
    });
  });

  // ========================================
  // CATEGORY FILTERING TESTS
  // ========================================

  describe('getFieldsByCategory()', () => {
    test('returns healthcare fields', () => {
      const fields = getFieldsByCategory('healthcare');
      expect(Object.keys(fields)).toContain('healthcare_score');
      expect(Object.keys(fields)).toContain('hospital_count');
      expect(Object.keys(fields)).toContain('nearest_major_hospital_km');
    });

    test('returns safety fields', () => {
      const fields = getFieldsByCategory('safety');
      expect(Object.keys(fields)).toContain('safety_score');
      expect(Object.keys(fields)).toContain('crime_rate');
    });

    test('returns only calculated fields', () => {
      const fields = getFieldsByCategory('calculated');
      expect(Object.keys(fields)).toContain('overall_score');
      expect(Object.keys(fields)).toContain('admin_score');
      expect(fields.overall_score.editable).toBe(false);
    });
  });

  describe('getEditableFields()', () => {
    test('excludes calculated fields', () => {
      const fields = getEditableFields();
      expect(Object.keys(fields)).not.toContain('overall_score');
      expect(Object.keys(fields)).not.toContain('admin_score');
    });

    test('includes all editable fields', () => {
      const fields = getEditableFields();
      expect(Object.keys(fields)).toContain('healthcare_score');
      expect(Object.keys(fields)).toContain('hospital_count');
      expect(Object.keys(fields)).toContain('crime_rate');
    });
  });

  // ========================================
  // NUMBER FIELD VALIDATION TESTS
  // ========================================

  describe('validateFieldValue() - Numbers', () => {
    test('healthcare_score: accepts valid decimal', () => {
      const result = validateFieldValue('healthcare_score', 7.5);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('healthcare_score: rejects value > 10', () => {
      const result = validateFieldValue('healthcare_score', 15);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('between');
    });

    test('healthcare_score: rejects value < 0', () => {
      const result = validateFieldValue('healthcare_score', -5);
      expect(result.valid).toBe(false);
    });

    test('hospital_count: accepts valid integer', () => {
      const result = validateFieldValue('hospital_count', 12);
      expect(result.valid).toBe(true);
    });

    test('hospital_count: rejects decimal', () => {
      const result = validateFieldValue('hospital_count', 5.7);
      expect(result.valid).toBe(false);
    });

    test('nearest_major_hospital_km: accepts decimals', () => {
      const result = validateFieldValue('nearest_major_hospital_km', 3.2);
      expect(result.valid).toBe(true);
    });

    test('government_efficiency_rating: accepts 0-100', () => {
      expect(validateFieldValue('government_efficiency_rating', 0).valid).toBe(true);
      expect(validateFieldValue('government_efficiency_rating', 50).valid).toBe(true);
      expect(validateFieldValue('government_efficiency_rating', 100).valid).toBe(true);
      expect(validateFieldValue('government_efficiency_rating', 150).valid).toBe(false);
    });
  });

  // ========================================
  // BOOLEAN FIELD VALIDATION TESTS
  // ========================================

  describe('validateFieldValue() - Booleans', () => {
    test('english_speaking_doctors: accepts true', () => {
      const result = validateFieldValue('english_speaking_doctors', true);
      expect(result.valid).toBe(true);
    });

    test('english_speaking_doctors: accepts false', () => {
      const result = validateFieldValue('english_speaking_doctors', false);
      expect(result.valid).toBe(true);
    });

    test('english_speaking_doctors: rejects string "yes"', () => {
      const result = validateFieldValue('english_speaking_doctors', 'yes');
      expect(result.valid).toBe(false);
    });

    test('retirement_visa_available: only accepts boolean', () => {
      expect(validateFieldValue('retirement_visa_available', true).valid).toBe(true);
      expect(validateFieldValue('retirement_visa_available', false).valid).toBe(true);
      expect(validateFieldValue('retirement_visa_available', 1).valid).toBe(false);
      expect(validateFieldValue('retirement_visa_available', 'true').valid).toBe(false);
    });
  });

  // ========================================
  // SELECT FIELD VALIDATION TESTS
  // ========================================

  describe('validateFieldValue() - Selects', () => {
    test('crime_rate: accepts valid option', () => {
      const result = validateFieldValue('crime_rate', 'low');
      expect(result.valid).toBe(true);
    });

    test('crime_rate: accepts case-insensitive', () => {
      const result = validateFieldValue('crime_rate', 'VERY_LOW');
      expect(result.valid).toBe(true);
    });

    test('crime_rate: rejects invalid option', () => {
      const result = validateFieldValue('crime_rate', 'medium');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Must be one of');
    });

    test('emergency_services_quality: accepts all valid options', () => {
      ['poor', 'basic', 'functional', 'good', 'excellent'].forEach(option => {
        expect(validateFieldValue('emergency_services_quality', option).valid).toBe(true);
      });
    });
  });

  // ========================================
  // ARRAY FIELD VALIDATION TESTS
  // ========================================

  describe('validateFieldValue() - Arrays', () => {
    test('visa_on_arrival_countries: accepts array of strings', () => {
      const result = validateFieldValue('visa_on_arrival_countries', ['USA', 'CAN', 'UK']);
      expect(result.valid).toBe(true);
    });

    test('visa_on_arrival_countries: rejects non-array', () => {
      const result = validateFieldValue('visa_on_arrival_countries', 'USA,CAN');
      expect(result.valid).toBe(false);
    });

    test('visa_on_arrival_countries: rejects array with non-strings', () => {
      const result = validateFieldValue('visa_on_arrival_countries', ['USA', 123, 'CAN']);
      expect(result.valid).toBe(false);
    });
  });

  // ========================================
  // NULL/EMPTY VALIDATION TESTS
  // ========================================

  describe('validateFieldValue() - Null/Empty', () => {
    test('allows null for optional fields', () => {
      expect(validateFieldValue('healthcare_score', null).valid).toBe(true);
      expect(validateFieldValue('hospital_count', null).valid).toBe(true);
      expect(validateFieldValue('crime_rate', null).valid).toBe(true);
    });

    test('allows empty string for optional fields', () => {
      expect(validateFieldValue('healthcare_score', '').valid).toBe(true);
      expect(validateFieldValue('visa_requirements', '').valid).toBe(true);
    });
  });

  // ========================================
  // CALCULATED FIELD PROTECTION TESTS
  // ========================================

  describe('validateFieldValue() - Calculated Fields', () => {
    test('rejects editing overall_score', () => {
      const result = validateFieldValue('overall_score', 75);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not editable');
    });

    test('rejects editing admin_score', () => {
      const result = validateFieldValue('admin_score', 80);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('calculated field');
    });
  });

  // ========================================
  // FORMAT FOR DISPLAY TESTS
  // ========================================

  describe('formatFieldValue()', () => {
    test('formats number with unit', () => {
      expect(formatFieldValue('healthcare_score', 7.5)).toBe('7.5 /10.0');
      expect(formatFieldValue('hospital_count', 12)).toBe('12 count');
      expect(formatFieldValue('nearest_major_hospital_km', 3.2)).toBe('3.2 km');
    });

    test('formats boolean as Yes/No', () => {
      expect(formatFieldValue('english_speaking_doctors', true)).toBe('Yes');
      expect(formatFieldValue('english_speaking_doctors', false)).toBe('No');
    });

    test('formats array as comma-separated', () => {
      expect(formatFieldValue('visa_on_arrival_countries', ['USA', 'CAN', 'UK'])).toBe('USA, CAN, UK');
    });

    test('formats null as (empty)', () => {
      expect(formatFieldValue('healthcare_score', null)).toBe('(empty)');
      expect(formatFieldValue('hospital_count', undefined)).toBe('(empty)');
    });

    test('formats string values directly', () => {
      expect(formatFieldValue('crime_rate', 'low')).toBe('low');
      expect(formatFieldValue('visa_requirements', 'Visa-free for 90 days')).toBe('Visa-free for 90 days');
    });
  });

  // ========================================
  // PARSE USER INPUT TESTS
  // ========================================

  describe('parseFieldInput()', () => {
    test('parses number string to number', () => {
      expect(parseFieldInput('healthcare_score', '7.5')).toBe(7.5);
      expect(parseFieldInput('hospital_count', '12')).toBe(12);
    });

    test('parses boolean string to boolean', () => {
      expect(parseFieldInput('english_speaking_doctors', 'true')).toBe(true);
      expect(parseFieldInput('english_speaking_doctors', 'false')).toBe(false);
      expect(parseFieldInput('english_speaking_doctors', 'yes')).toBe(true);
      expect(parseFieldInput('english_speaking_doctors', 'no')).toBe(false);
      expect(parseFieldInput('english_speaking_doctors', '1')).toBe(true);
      expect(parseFieldInput('english_speaking_doctors', '0')).toBe(false);
    });

    test('parses comma-separated string to array', () => {
      const result = parseFieldInput('visa_on_arrival_countries', 'USA,CAN,UK');
      expect(result).toEqual(['USA', 'CAN', 'UK']);
    });

    test('parses JSON array string to array', () => {
      const result = parseFieldInput('visa_on_arrival_countries', '["USA", "CAN", "UK"]');
      expect(result).toEqual(['USA', 'CAN', 'UK']);
    });

    test('returns null for empty input', () => {
      expect(parseFieldInput('healthcare_score', '')).toBeNull();
      expect(parseFieldInput('healthcare_score', null)).toBeNull();
      expect(parseFieldInput('healthcare_score', undefined)).toBeNull();
    });

    test('handles select field strings', () => {
      expect(parseFieldInput('crime_rate', 'low')).toBe('low');
      expect(parseFieldInput('emergency_services_quality', 'good')).toBe('good');
    });
  });

  // ========================================
  // INTEGRATION TESTS
  // ========================================

  describe('Full Workflow Integration', () => {
    test('parse → validate → format workflow', () => {
      // User enters "7.5" for healthcare_score
      const parsed = parseFieldInput('healthcare_score', '7.5');
      expect(parsed).toBe(7.5);

      // Validate the parsed value
      const validation = validateFieldValue('healthcare_score', parsed);
      expect(validation.valid).toBe(true);

      // Format for display
      const formatted = formatFieldValue('healthcare_score', parsed);
      expect(formatted).toBe('7.5 /10.0');
    });

    test('handles invalid input gracefully', () => {
      // User enters invalid value
      const parsed = parseFieldInput('healthcare_score', '15');
      expect(parsed).toBe(15);

      // Validation catches it
      const validation = validateFieldValue('healthcare_score', parsed);
      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('between 0.0 and 10.0');
    });

    test('round-trip: display → edit → validate → save → display', () => {
      const originalValue = 7.5;

      // Display
      const displayed = formatFieldValue('healthcare_score', originalValue);
      expect(displayed).toBe('7.5 /10.0');

      // User edits (simulated input)
      const userInput = '8.5';

      // Parse
      const parsed = parseFieldInput('healthcare_score', userInput);
      expect(parsed).toBe(8.5);

      // Validate
      const validation = validateFieldValue('healthcare_score', parsed);
      expect(validation.valid).toBe(true);

      // Save would happen here (database update)

      // Display updated value
      const newDisplay = formatFieldValue('healthcare_score', parsed);
      expect(newDisplay).toBe('8.5 /10.0');
    });
  });

  // ========================================
  // EDGE CASE TESTS
  // ========================================

  describe('Edge Cases', () => {
    test('handles boundary values correctly', () => {
      // Min boundary
      expect(validateFieldValue('healthcare_score', 0).valid).toBe(true);
      expect(validateFieldValue('healthcare_score', -0.1).valid).toBe(false);

      // Max boundary
      expect(validateFieldValue('healthcare_score', 10).valid).toBe(true);
      expect(validateFieldValue('healthcare_score', 10.1).valid).toBe(false);
    });

    test('handles zero values', () => {
      expect(validateFieldValue('hospital_count', 0).valid).toBe(true);
      expect(formatFieldValue('hospital_count', 0)).toBe('0 count');
    });

    test('handles very large numbers', () => {
      expect(validateFieldValue('nearest_major_hospital_km', 999).valid).toBe(true);
      expect(validateFieldValue('air_quality_index', 500).valid).toBe(true);
    });

    test('handles empty arrays', () => {
      expect(validateFieldValue('visa_on_arrival_countries', []).valid).toBe(true);
      expect(formatFieldValue('visa_on_arrival_countries', [])).toBe('');
    });

    test('handles whitespace in strings', () => {
      const parsed = parseFieldInput('visa_on_arrival_countries', 'USA, CAN, UK');
      expect(parsed).toEqual(['USA', 'CAN', 'UK']); // Trimmed
    });
  });

  // ========================================
  // FIELD COMPLETENESS TESTS
  // ========================================

  describe('Field Coverage', () => {
    test('all fields shown in ScoreBreakdownPanel have metadata', () => {
      const requiredFields = [
        'healthcare_score', 'hospital_count', 'nearest_major_hospital_km',
        'emergency_services_quality', 'english_speaking_doctors',
        'insurance_availability_rating', 'healthcare_cost',
        'safety_score', 'crime_rate', 'environmental_health_rating',
        'natural_disaster_risk', 'political_stability_rating',
        'walkability', 'air_quality_index', 'airport_distance',
        'government_efficiency_rating', 'visa_requirements',
        'visa_on_arrival_countries', 'retirement_visa_available',
        'tax_treaty_us', 'tax_haven_status'
      ];

      requiredFields.forEach(field => {
        expect(ADMIN_FIELD_METADATA[field]).toBeDefined();
      });
    });

    test('all metadata fields have valid types', () => {
      const validTypes = ['number', 'string', 'boolean', 'select', 'array', 'text'];

      Object.entries(ADMIN_FIELD_METADATA).forEach(([fieldName, meta]) => {
        expect(validTypes).toContain(meta.type);
      });
    });

    test('all select fields have valid range arrays', () => {
      Object.entries(ADMIN_FIELD_METADATA).forEach(([fieldName, meta]) => {
        if (meta.type === 'select') {
          expect(Array.isArray(meta.range)).toBe(true);
          expect(meta.range.length).toBeGreaterThan(0);
        }
      });
    });

    test('all number fields have valid range strings', () => {
      Object.entries(ADMIN_FIELD_METADATA).forEach(([fieldName, meta]) => {
        if (meta.type === 'number') {
          expect(typeof meta.range).toBe('string');
          expect(meta.range).toMatch(/^\d+(\.\d+)?-\d+(\.\d+)?$/);
        }
      });
    });
  });
});
