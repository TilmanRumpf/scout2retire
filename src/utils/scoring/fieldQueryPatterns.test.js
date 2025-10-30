/**
 * TEST FILE - Demonstrates usage of fieldQueryPatterns.js
 *
 * Run with: node src/utils/scoring/fieldQueryPatterns.test.js
 */

import {
  getQueryPattern,
  shouldQueryField,
  getQueryPatterns,
  buildLocationString,
  EDGE_CASES
} from './fieldQueryPatterns.js';

// Sample town data
const sampleTowns = [
  {
    town_name: 'Venice',
    region: 'Florida',
    country: 'United States',
    distance_to_ocean_km: 0, // Coastal
    latitude: 27.0998,
    longitude: -82.4543
  },
  {
    town_name: 'Budva',
    region: null,
    country: 'Montenegro',
    distance_to_ocean_km: 0, // Coastal
    latitude: 42.2864,
    longitude: 18.8400
  },
  {
    town_name: 'Denver',
    region: 'Colorado',
    country: 'United States',
    distance_to_ocean_km: 1609, // Landlocked
    latitude: 39.7392,
    longitude: -104.9903
  }
];

console.log('='.repeat(80));
console.log('FIELD QUERY PATTERNS - TEST SUITE');
console.log('='.repeat(80));

// TEST 1: Build Location Strings
console.log('\n📍 TEST 1: Location String Building\n');
sampleTowns.forEach(town => {
  const location = buildLocationString(town);
  console.log(`  ${location}`);
});

// TEST 2: COUNT Pattern
console.log('\n\n🔢 TEST 2: COUNT Pattern - hospital_count\n');
const veniceCoastal = sampleTowns[0];
const pattern = getQueryPattern('hospital_count', veniceCoastal);
console.log(`Primary Query: "${pattern.primaryQuery}"`);
console.log(`Expected Format: ${pattern.expectedFormat}`);
console.log(`\nVariations:`);
pattern.variations.forEach((v, i) => console.log(`  ${i + 1}. "${v}"`));

// TEST 3: RATING Pattern
console.log('\n\n⭐ TEST 3: RATING Pattern - healthcare_score\n');
const healthcarePattern = getQueryPattern('healthcare_score', veniceCoastal);
console.log(`Primary Query: "${healthcarePattern.primaryQuery}"`);
console.log(`Expected Format: ${healthcarePattern.expectedFormat}`);
console.log(`Search Tips: ${healthcarePattern.searchTips}`);

// TEST 4: DISTANCE Pattern
console.log('\n\n📏 TEST 4: DISTANCE Pattern - airport_distance\n');
const distancePattern = getQueryPattern('airport_distance', veniceCoastal);
console.log(`Primary Query: "${distancePattern.primaryQuery}"`);
console.log(`Expected Format: ${distancePattern.expectedFormat}`);

// TEST 5: COST Pattern
console.log('\n\n💰 TEST 5: COST Pattern - cost_of_living_usd\n');
const costPattern = getQueryPattern('cost_of_living_usd', veniceCoastal);
console.log(`Primary Query: "${costPattern.primaryQuery}"`);
console.log(`Expected Format: ${costPattern.expectedFormat}`);

// TEST 6: BOOLEAN Pattern
console.log('\n\n✓ TEST 6: BOOLEAN Pattern - has_uber\n');
const booleanPattern = getQueryPattern('has_uber', veniceCoastal);
console.log(`Primary Query: "${booleanPattern.primaryQuery}"`);
console.log(`Expected Format: ${booleanPattern.expectedFormat}`);

// TEST 7: Conditional Field Logic
console.log('\n\n🔀 TEST 7: Conditional Field Logic - marinas_count\n');
sampleTowns.forEach(town => {
  const location = buildLocationString(town);
  const shouldQuery = shouldQueryField('marinas_count', town);
  console.log(`  ${location}`);
  console.log(`    Distance to ocean: ${town.distance_to_ocean_km}km`);
  console.log(`    Should query marinas_count? ${shouldQuery ? '✅ YES' : '❌ NO (not coastal)'}`);
});

// TEST 8: Country-Level Fields
console.log('\n\n🌍 TEST 8: Country-Level Fields\n');
console.log('These should be queried ONCE per country:');
EDGE_CASES.countryLevel.forEach(field => {
  console.log(`  - ${field}`);
});

// TEST 9: Never Query Fields
console.log('\n\n🚫 TEST 9: Fields That Should NEVER Be Queried\n');
EDGE_CASES.noQuery.forEach(field => {
  console.log(`  - ${field}`);
});

// TEST 10: Multiple Fields for One Town
console.log('\n\n📊 TEST 10: Multiple Field Queries for One Town\n');
const fieldsToQuery = [
  'hospital_count',
  'healthcare_score',
  'airport_distance',
  'cost_of_living_usd',
  'has_uber'
];

const multiplePatterns = getQueryPatterns(fieldsToQuery, veniceCoastal);
console.log(`Querying ${fieldsToQuery.length} fields for ${buildLocationString(veniceCoastal)}:\n`);
multiplePatterns.forEach(({ field, primaryQuery, expectedFormat }) => {
  console.log(`${field}:`);
  console.log(`  Query: "${primaryQuery}"`);
  console.log(`  Expected: ${expectedFormat}\n`);
});

// TEST 11: Edge Case - Coastal vs Landlocked
console.log('\n🏖️ TEST 11: Coastal vs Landlocked Field Differences\n');

const coastalFields = ['marinas_count', 'water_sports_available', 'beaches_nearby'];
const coastal = sampleTowns[0]; // Venice, FL
const landlocked = sampleTowns[2]; // Denver, CO

console.log(`COASTAL TOWN: ${buildLocationString(coastal)}`);
coastalFields.forEach(field => {
  const should = shouldQueryField(field, coastal);
  console.log(`  ${field}: ${should ? '✅ Query' : '❌ Skip'}`);
});

console.log(`\nLANDLOCKED TOWN: ${buildLocationString(landlocked)}`);
coastalFields.forEach(field => {
  const should = shouldQueryField(field, landlocked);
  console.log(`  ${field}: ${should ? '✅ Query' : '❌ Skip'}`);
});

// TEST 12: Pattern Coverage
console.log('\n\n📈 TEST 12: Pattern Coverage Analysis\n');

const allFields = [
  'hospital_count', 'golf_courses_count', 'healthcare_score', 'safety_score',
  'airport_distance', 'cost_of_living_usd', 'has_uber', 'sunshine_level_actual',
  'pace_of_life_actual', 'public_transport_quality', 'activities_available'
];

let covered = 0;
let notCovered = 0;

allFields.forEach(field => {
  const pattern = getQueryPattern(field, veniceCoastal);
  if (pattern && pattern.primaryQuery) {
    covered++;
  } else {
    notCovered++;
    console.log(`  ⚠️  No pattern for: ${field}`);
  }
});

console.log(`\nCoverage: ${covered}/${allFields.length} fields (${Math.round(covered / allFields.length * 100)}%)`);

// TEST 13: Real-World Scenario
console.log('\n\n🌟 TEST 13: Real-World Query Scenario\n');
console.log('Simulating data collection for a new town...\n');

const newTown = {
  town_name: 'Lagos',
  region: 'Algarve',
  country: 'Portugal',
  distance_to_ocean_km: 0
};

const priorityFields = [
  'cost_of_living_usd',
  'healthcare_score',
  'safety_score',
  'airport_distance',
  'rent_2bed_usd'
];

console.log(`Town: ${buildLocationString(newTown)}\n`);
console.log('Priority fields to query:\n');

priorityFields.forEach((field, index) => {
  const pattern = getQueryPattern(field, newTown);
  if (pattern) {
    console.log(`${index + 1}. ${field}`);
    console.log(`   Query: "${pattern.primaryQuery}"`);
    console.log(`   Expected: ${pattern.expectedFormat}\n`);
  }
});

console.log('='.repeat(80));
console.log('✅ ALL TESTS COMPLETE');
console.log('='.repeat(80));
