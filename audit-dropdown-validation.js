/**
 * CRITICAL AUDIT #5: DROPDOWN VALIDATION TEST
 *
 * Tests that:
 * 1. VALID_CATEGORICAL_VALUES exports correctly
 * 2. All expected fields exist
 * 3. No values are null/undefined
 * 4. Array lengths match expectations
 * 5. Validation functions work correctly
 *
 * This script identifies runtime issues that would break dropdowns.
 *
 * Created: 2025-10-19
 */

import {
  VALID_CATEGORICAL_VALUES,
  isValidCategoricalValue,
  getValidValues,
  getCategoricalFields,
  normalizeCategoricalValue
} from './src/utils/validation/categoricalValues.js';

console.log('🔍 DROPDOWN VALIDATION AUDIT - Starting...\n');

// Track all issues found
const issues = [];
const warnings = [];
let testsRun = 0;
let testsPassed = 0;

// Helper to log test results
function test(description, fn) {
  testsRun++;
  try {
    const result = fn();
    if (result === true || result === undefined) {
      testsPassed++;
      console.log(`✅ ${description}`);
      return true;
    } else {
      issues.push(`❌ ${description}: ${result}`);
      console.log(`❌ ${description}: ${result}`);
      return false;
    }
  } catch (error) {
    issues.push(`❌ ${description}: ${error.message}`);
    console.log(`❌ ${description}: ${error.message}`);
    return false;
  }
}

function warn(description, message) {
  warnings.push(`⚠️ ${description}: ${message}`);
  console.log(`⚠️ ${description}: ${message}`);
}

// Expected fields based on admin panels usage
const EXPECTED_FIELDS = {
  // Climate Panel fields
  'summer_climate_actual': { minValues: 3, maxValues: 10 },
  'winter_climate_actual': { minValues: 3, maxValues: 10 },
  'sunshine_level_actual': { minValues: 3, maxValues: 10 },
  'precipitation_level_actual': { minValues: 3, maxValues: 10 },
  'seasonal_variation_actual': { minValues: 3, maxValues: 10 },
  'humidity_level_actual': { minValues: 2, maxValues: 5 },
  'climate': { minValues: 5, maxValues: 15 },

  // Culture Panel fields
  'english_proficiency_level': { minValues: 3, maxValues: 10 },
  'pace_of_life_actual': { minValues: 3, maxValues: 6 },
  'social_atmosphere': { minValues: 3, maxValues: 10 },
  'cultural_events_frequency': { minValues: 4, maxValues: 10 },
  'traditional_progressive_lean': { minValues: 3, maxValues: 6 },
  'urban_rural_character': { minValues: 3, maxValues: 6 },
  'expat_community_size': { minValues: 3, maxValues: 5 },

  // Region Panel fields
  'retirement_community_presence': { minValues: 3, maxValues: 10 }
};

console.log('═══════════════════════════════════════════════════════════');
console.log('TEST 1: EXPORT VALIDATION');
console.log('═══════════════════════════════════════════════════════════\n');

test('VALID_CATEGORICAL_VALUES exports as object', () => {
  if (typeof VALID_CATEGORICAL_VALUES !== 'object') {
    return 'Not an object';
  }
  if (VALID_CATEGORICAL_VALUES === null) {
    return 'Is null';
  }
  return true;
});

test('VALID_CATEGORICAL_VALUES is not empty', () => {
  const keys = Object.keys(VALID_CATEGORICAL_VALUES);
  if (keys.length === 0) {
    return 'Object has no keys';
  }
  return true;
});

test('Helper functions export correctly', () => {
  if (typeof isValidCategoricalValue !== 'function') {
    return 'isValidCategoricalValue is not a function';
  }
  if (typeof getValidValues !== 'function') {
    return 'getValidValues is not a function';
  }
  if (typeof getCategoricalFields !== 'function') {
    return 'getCategoricalFields is not a function';
  }
  if (typeof normalizeCategoricalValue !== 'function') {
    return 'normalizeCategoricalValue is not a function';
  }
  return true;
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log('TEST 2: FIELD EXISTENCE');
console.log('═══════════════════════════════════════════════════════════\n');

for (const [field, expectations] of Object.entries(EXPECTED_FIELDS)) {
  test(`Field "${field}" exists`, () => {
    if (!(field in VALID_CATEGORICAL_VALUES)) {
      return `Field missing from VALID_CATEGORICAL_VALUES`;
    }
    return true;
  });
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('TEST 3: VALUE ARRAY VALIDATION');
console.log('═══════════════════════════════════════════════════════════\n');

for (const [field, values] of Object.entries(VALID_CATEGORICAL_VALUES)) {
  // Check if it's an array
  test(`Field "${field}" is an array`, () => {
    if (!Array.isArray(values)) {
      return `Not an array (type: ${typeof values})`;
    }
    return true;
  });

  // Check if array is not empty
  test(`Field "${field}" has values`, () => {
    if (values.length === 0) {
      return 'Array is empty';
    }
    return true;
  });

  // Check for null/undefined values
  test(`Field "${field}" has no null/undefined values`, () => {
    const nullCount = values.filter(v => v === null || v === undefined).length;
    if (nullCount > 0) {
      return `Found ${nullCount} null/undefined values`;
    }
    return true;
  });

  // Check for empty strings
  test(`Field "${field}" has no empty strings`, () => {
    const emptyCount = values.filter(v => v === '').length;
    if (emptyCount > 0) {
      return `Found ${emptyCount} empty strings`;
    }
    return true;
  });

  // Check expected array length
  if (field in EXPECTED_FIELDS) {
    const { minValues, maxValues } = EXPECTED_FIELDS[field];
    test(`Field "${field}" has ${minValues}-${maxValues} values`, () => {
      if (values.length < minValues) {
        return `Too few values: ${values.length} < ${minValues}`;
      }
      if (values.length > maxValues) {
        return `Too many values: ${values.length} > ${maxValues}`;
      }
      return true;
    });
  }

  // Check for duplicate values (case-insensitive)
  test(`Field "${field}" has no duplicate values`, () => {
    const lowercaseValues = values.map(v => String(v).toLowerCase());
    const uniqueValues = [...new Set(lowercaseValues)];
    if (lowercaseValues.length !== uniqueValues.length) {
      const duplicates = lowercaseValues.filter((v, i) => lowercaseValues.indexOf(v) !== i);
      return `Found duplicates: ${duplicates.join(', ')}`;
    }
    return true;
  });
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('TEST 4: VALIDATION FUNCTION TESTS');
console.log('═══════════════════════════════════════════════════════════\n');

// Test isValidCategoricalValue
test('isValidCategoricalValue accepts valid values', () => {
  const valid = isValidCategoricalValue('pace_of_life_actual', 'relaxed');
  if (!valid) {
    return 'Valid value "relaxed" rejected';
  }
  return true;
});

test('isValidCategoricalValue rejects invalid values', () => {
  const invalid = isValidCategoricalValue('pace_of_life_actual', 'super_fast');
  if (invalid) {
    return 'Invalid value "super_fast" accepted';
  }
  return true;
});

test('isValidCategoricalValue handles null/undefined', () => {
  const nullValid = isValidCategoricalValue('pace_of_life_actual', null);
  const undefinedValid = isValidCategoricalValue('pace_of_life_actual', undefined);
  if (!nullValid || !undefinedValid) {
    return 'Null/undefined should be valid (optional fields)';
  }
  return true;
});

test('isValidCategoricalValue is case-insensitive', () => {
  const upperValid = isValidCategoricalValue('pace_of_life_actual', 'RELAXED');
  const mixedValid = isValidCategoricalValue('pace_of_life_actual', 'ReLaXeD');
  if (!upperValid || !mixedValid) {
    return 'Case-insensitive matching failed';
  }
  return true;
});

test('isValidCategoricalValue handles whitespace', () => {
  const spacedValid = isValidCategoricalValue('pace_of_life_actual', '  relaxed  ');
  if (!spacedValid) {
    return 'Whitespace trimming failed';
  }
  return true;
});

// Test getValidValues
test('getValidValues returns correct array', () => {
  const values = getValidValues('pace_of_life_actual');
  if (!Array.isArray(values)) {
    return 'Did not return an array';
  }
  if (!values.includes('relaxed')) {
    return 'Missing expected value "relaxed"';
  }
  return true;
});

test('getValidValues returns null for unknown field', () => {
  const values = getValidValues('nonexistent_field');
  if (values !== null) {
    return `Expected null, got: ${values}`;
  }
  return true;
});

// Test getCategoricalFields
test('getCategoricalFields returns all field names', () => {
  const fields = getCategoricalFields();
  if (!Array.isArray(fields)) {
    return 'Did not return an array';
  }
  if (!fields.includes('pace_of_life_actual')) {
    return 'Missing expected field "pace_of_life_actual"';
  }
  return true;
});

// Test normalizeCategoricalValue
test('normalizeCategoricalValue lowercases and trims', () => {
  const normalized = normalizeCategoricalValue('  RELAXED  ');
  if (normalized !== 'relaxed') {
    return `Expected "relaxed", got "${normalized}"`;
  }
  return true;
});

test('normalizeCategoricalValue handles null', () => {
  const normalized = normalizeCategoricalValue(null);
  if (normalized !== null) {
    return `Expected null, got "${normalized}"`;
  }
  return true;
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log('TEST 5: SPECIFIC VALUE CHECKS');
console.log('═══════════════════════════════════════════════════════════\n');

// Check for critical values used in 48% of database
test('pace_of_life_actual includes "relaxed"', () => {
  const values = VALID_CATEGORICAL_VALUES.pace_of_life_actual;
  if (!values.includes('relaxed')) {
    return 'Missing critical value "relaxed" used by 48% of towns';
  }
  return true;
});

// Check retirement community values
test('retirement_community_presence includes "extensive"', () => {
  const values = VALID_CATEGORICAL_VALUES.retirement_community_presence;
  if (!values.includes('extensive')) {
    return 'Missing descriptive value "extensive"';
  }
  return true;
});

// Check seasonal variation
test('seasonal_variation_actual includes "distinct_seasons"', () => {
  const values = VALID_CATEGORICAL_VALUES.seasonal_variation_actual;
  if (!values.includes('distinct_seasons')) {
    return 'Missing descriptive value "distinct_seasons"';
  }
  return true;
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log('TEST 6: DROPDOWN COMPATIBILITY');
console.log('═══════════════════════════════════════════════════════════\n');

// Simulate dropdown rendering
for (const [field, values] of Object.entries(VALID_CATEGORICAL_VALUES)) {
  test(`Field "${field}" values can be rendered in dropdown`, () => {
    try {
      // Simulate what React would do
      const options = values.map((value, index) => ({
        key: `${field}-${index}`,
        value: value,
        label: value
      }));

      if (options.length === 0) {
        return 'No options generated';
      }

      // Check for undefined keys/values
      const invalidOptions = options.filter(opt =>
        opt.key === undefined ||
        opt.value === undefined ||
        opt.label === undefined
      );

      if (invalidOptions.length > 0) {
        return `${invalidOptions.length} options have undefined properties`;
      }

      return true;
    } catch (error) {
      return `Dropdown rendering would fail: ${error.message}`;
    }
  });
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('TEST 7: FIELD COVERAGE ANALYSIS');
console.log('═══════════════════════════════════════════════════════════\n');

// Check which expected fields are missing
const actualFields = Object.keys(VALID_CATEGORICAL_VALUES);
const expectedFieldNames = Object.keys(EXPECTED_FIELDS);

const missingFields = expectedFieldNames.filter(f => !actualFields.includes(f));
const extraFields = actualFields.filter(f => !expectedFieldNames.includes(f));

if (missingFields.length > 0) {
  warn('Missing expected fields', missingFields.join(', '));
}

if (extraFields.length > 0) {
  console.log(`ℹ️  Extra fields (not used in admin panels): ${extraFields.join(', ')}`);
}

console.log(`\nTotal fields defined: ${actualFields.length}`);
console.log(`Expected fields: ${expectedFieldNames.length}`);
console.log(`Coverage: ${((expectedFieldNames.length / actualFields.length) * 100).toFixed(1)}%`);

console.log('\n═══════════════════════════════════════════════════════════');
console.log('DETAILED FIELD REPORT');
console.log('═══════════════════════════════════════════════════════════\n');

for (const [field, values] of Object.entries(VALID_CATEGORICAL_VALUES)) {
  console.log(`📋 ${field}:`);
  console.log(`   Values (${values.length}): ${values.join(', ')}`);

  if (field in EXPECTED_FIELDS) {
    const { minValues, maxValues } = EXPECTED_FIELDS[field];
    const status = values.length >= minValues && values.length <= maxValues ? '✅' : '⚠️';
    console.log(`   Expected: ${minValues}-${maxValues} values ${status}`);
  } else {
    console.log(`   Note: Not used in admin panels`);
  }
  console.log('');
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('SUMMARY');
console.log('═══════════════════════════════════════════════════════════\n');

console.log(`Tests run: ${testsRun}`);
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsRun - testsPassed}`);
console.log(`Issues found: ${issues.length}`);
console.log(`Warnings: ${warnings.length}`);

if (issues.length > 0) {
  console.log('\n🚨 CRITICAL ISSUES THAT WOULD BREAK DROPDOWNS:');
  issues.forEach(issue => console.log(issue));
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach(warning => console.log(warning));
}

if (issues.length === 0 && warnings.length === 0) {
  console.log('\n✅ ALL TESTS PASSED - DROPDOWNS SHOULD WORK CORRECTLY');
} else if (issues.length === 0) {
  console.log('\n✅ NO CRITICAL ISSUES - Dropdowns should work (warnings are informational)');
} else {
  console.log('\n❌ CRITICAL ISSUES FOUND - Dropdowns may be broken!');
}

console.log('\n═══════════════════════════════════════════════════════════');

// Exit with error code if issues found
process.exit(issues.length > 0 ? 1 : 0);
