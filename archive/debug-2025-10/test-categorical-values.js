/**
 * Test script for categorical values validation
 * Tests import, structure, and data integrity
 */

import { VALID_CATEGORICAL_VALUES } from './src/utils/validation/categoricalValues.js';

// ANSI color codes for better readability
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'yellow');
  }
}

// Track test results
let totalTests = 0;
let passedTests = 0;

function test(name, condition, details = '') {
  totalTests++;
  const passed = Boolean(condition);
  if (passed) passedTests++;
  logTest(name, passed, details);
  return passed;
}

console.log('\n' + '='.repeat(60));
log('CATEGORICAL VALUES VALIDATION TEST', 'bold');
console.log('='.repeat(60) + '\n');

// TEST 1: Can import VALID_CATEGORICAL_VALUES
log('Test 1: Import Check', 'blue');
test(
  'Can import VALID_CATEGORICAL_VALUES',
  typeof VALID_CATEGORICAL_VALUES === 'object',
  `Type: ${typeof VALID_CATEGORICAL_VALUES}`
);

// TEST 2: All expected fields exist
log('\nTest 2: Field Existence', 'blue');
const expectedFields = [
  // Climate fields
  'sunshine_level_actual',
  'precipitation_level_actual',
  'seasonal_variation_actual',

  // Lifestyle/Community fields
  'retirement_community_presence',
  'cultural_events_frequency',
  'expat_community_size',

  // Social/Pace fields
  'pace_of_life_actual',
  'social_atmosphere',
  'traditional_progressive_lean'
];

let missingFields = [];
for (const field of expectedFields) {
  const exists = field in VALID_CATEGORICAL_VALUES;
  if (!exists) missingFields.push(field);
  test(
    `Field exists: ${field}`,
    exists,
    exists ? `✓ Found` : `✗ Missing`
  );
}

// TEST 3: All values are arrays
log('\nTest 3: Value Type Check', 'blue');
let nonArrayFields = [];
for (const [field, value] of Object.entries(VALID_CATEGORICAL_VALUES)) {
  const isArray = Array.isArray(value);
  if (!isArray) nonArrayFields.push(field);
  test(
    `${field} is array`,
    isArray,
    isArray ? `Type: Array[${value?.length || 0}]` : `Type: ${typeof value}`
  );
}

// TEST 4: No undefined or null values
log('\nTest 4: Value Integrity Check', 'blue');
let fieldsWithBadValues = [];
for (const [field, values] of Object.entries(VALID_CATEGORICAL_VALUES)) {
  if (Array.isArray(values)) {
    const hasNullOrUndefined = values.some(v => v === null || v === undefined);
    const allStrings = values.every(v => typeof v === 'string');
    const passed = !hasNullOrUndefined && allStrings;

    if (!passed) fieldsWithBadValues.push(field);

    test(
      `${field} has valid values`,
      passed,
      passed
        ? `All ${values.length} values are strings`
        : `Contains null/undefined or non-strings`
    );
  }
}

// TEST 5: Each array has at least 2 values
log('\nTest 5: Minimum Value Count', 'blue');
let fieldsWithFewValues = [];
for (const [field, values] of Object.entries(VALID_CATEGORICAL_VALUES)) {
  if (Array.isArray(values)) {
    const hasEnough = values.length >= 2;
    if (!hasEnough) fieldsWithFewValues.push(field);

    test(
      `${field} has at least 2 values`,
      hasEnough,
      `Count: ${values.length}`
    );
  }
}

// BONUS TEST: Check for specific known values
log('\nBonus Test: Known Value Verification', 'blue');

const knownValues = {
  pace_of_life_actual: ['slow', 'relaxed', 'moderate', 'fast'],
  retirement_community_presence: ['none', 'minimal', 'limited', 'moderate', 'strong', 'extensive', 'very_strong'],
  social_atmosphere: ['reserved', 'quiet', 'moderate', 'friendly', 'vibrant', 'very friendly']
};

for (const [field, expectedValues] of Object.entries(knownValues)) {
  const actualValues = VALID_CATEGORICAL_VALUES[field];
  if (actualValues) {
    for (const expectedValue of expectedValues) {
      const hasValue = actualValues.includes(expectedValue);
      test(
        `${field} includes "${expectedValue}"`,
        hasValue,
        hasValue ? '✓ Present' : '✗ Missing'
      );
    }
  }
}

// SUMMARY
console.log('\n' + '='.repeat(60));
log('TEST SUMMARY', 'bold');
console.log('='.repeat(60));

const passRate = ((passedTests / totalTests) * 100).toFixed(1);
const color = passRate === 100 ? 'green' : passRate >= 80 ? 'yellow' : 'red';

log(`\nTotal Tests: ${totalTests}`, 'blue');
log(`Passed: ${passedTests}`, 'green');
log(`Failed: ${totalTests - passedTests}`, 'red');
log(`Pass Rate: ${passRate}%`, color);

// Report issues
if (missingFields.length > 0) {
  log('\n⚠️  Missing Fields:', 'red');
  missingFields.forEach(f => log(`   - ${f}`, 'yellow'));
}

if (nonArrayFields.length > 0) {
  log('\n⚠️  Non-Array Fields:', 'red');
  nonArrayFields.forEach(f => log(`   - ${f}`, 'yellow'));
}

if (fieldsWithBadValues.length > 0) {
  log('\n⚠️  Fields with Invalid Values:', 'red');
  fieldsWithBadValues.forEach(f => log(`   - ${f}`, 'yellow'));
}

if (fieldsWithFewValues.length > 0) {
  log('\n⚠️  Fields with < 2 Values:', 'red');
  fieldsWithFewValues.forEach(f => log(`   - ${f}`, 'yellow'));
}

// Final verdict
console.log('\n' + '='.repeat(60));
if (passRate == 100) {  // Use == for numeric comparison
  log('✅ ALL TESTS PASSED! Categorical values are valid.', 'green');
} else if (passRate >= 80) {
  log('⚠️  MOSTLY PASSING - Review warnings above', 'yellow');
} else {
  log('❌ CRITICAL ISSUES FOUND - Fix before using', 'red');
}
console.log('='.repeat(60) + '\n');

// Exit with appropriate code
process.exit(passRate === 100 ? 0 : 1);
