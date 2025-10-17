/**
 * ADD NEW TOWN UTILITY
 *
 * Programmatic, repeatable, validated town addition to Scout2Retire database.
 *
 * Usage:
 *   node database-utilities/add-town.js --name "Bubaque" --country "Guinea-Bissau"
 *   node database-utilities/add-town.js --name "Bubaque" --country "Guinea-Bissau" --lat 11.2853 --lon -15.8394
 *
 * Algorithm: See docs/algorithms/ADD_NEW_TOWN_ALGORITHM.md
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {
  geocodeTown,
  determineRegion,
  determineGeoRegion,
  getTimezoneFromCoords,
  fetchClimateData,
  categorizeTemperature,
  categorizeSunshine,
  categorizePrecipitation,
  categorizeHumidity,
  fetchCostData,
  validateCategoricalValues,
  calculateDataCompleteness,
  getValidCountries
} from './add-town-helpers.js';
import {
  FIELD_TIERS,
  DEFAULT_STRUCTURES,
  NULL_DEFAULT_FIELDS,
  METADATA_DEFAULTS
} from './add-town-config.js';

// Load environment variables
dotenv.config();

// Initialize Supabase with service role key (for insert permission)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * STEP 1: Validate Input
 */
async function validateInput(townData) {
  console.log('\n📋 STEP 1: Validating input...');

  const { name, country } = townData;

  // Check required fields
  if (!name || !country) {
    throw new Error('❌ Missing required fields: name and country are required');
  }

  // Validate country against existing towns
  console.log('  → Checking country against database...');
  const validCountries = await getValidCountries(supabase);

  if (!validCountries.includes(country)) {
    console.warn(`  ⚠️ Country "${country}" not found in database.`);
    console.log(`  → Valid countries: ${validCountries.slice(0, 10).join(', ')}, ...`);
    console.log(`  → Continuing anyway - this will be a new country in the database.`);
  } else {
    console.log(`  ✅ Country "${country}" validated`);
  }

  console.log(`  ✅ Input validation passed: ${name}, ${country}`);
  return true;
}

/**
 * STEP 2: Enrich Geographic Data
 */
async function enrichGeography(townData) {
  console.log('\n🌍 STEP 2: Enriching geographic data...');

  let { name, country, latitude, longitude } = townData;

  // If coordinates not provided, attempt geocoding
  if (!latitude || !longitude) {
    console.log('  → Coordinates not provided, attempting geocoding...');
    const coords = await geocodeTown(name, country);

    if (!coords) {
      throw new Error(`❌ Cannot find coordinates for "${name}, ${country}". Please provide --lat and --lon manually.`);
    }

    latitude = coords.lat;
    longitude = coords.lon;
    console.log(`  ✅ Geocoded: ${latitude}, ${longitude}`);
    console.log(`  → Full name: ${coords.display_name}`);
  } else {
    console.log(`  ✅ Coordinates provided: ${latitude}, ${longitude}`);
  }

  // Determine region
  console.log('  → Determining region (continent)...');
  const region = determineRegion(latitude, longitude, country);
  console.log(`  ✅ Region: ${region}`);

  // Determine geo_region
  console.log('  → Determining geo_region...');
  const geo_region = determineGeoRegion(latitude, longitude, country);
  console.log(`  ✅ Geo-region: ${geo_region}`);

  return {
    latitude,
    longitude,
    region,
    geo_region
  };
}

/**
 * STEP 3: Gather Climate Data
 */
async function gatherClimateData(latitude, longitude, townName) {
  console.log('\n🌤️  STEP 3: Gathering climate data...');

  const dataGaps = [];

  try {
    console.log('  → Fetching climate data from Open-Meteo API...');
    const climate = await fetchClimateData(latitude, longitude);

    if (!climate) {
      console.warn('  ⚠️ No climate data available');
      dataGaps.push('climate_data_unavailable');
      return { _data_gaps: dataGaps };
    }

    console.log(`  ✅ Summer avg: ${climate.avgSummerTemp}°C`);
    console.log(`  ✅ Winter avg: ${climate.avgWinterTemp}°C`);
    console.log(`  ✅ Annual rainfall: ${climate.annualRainfall}mm`);

    // Categorize climate data
    const summer_climate_actual = categorizeTemperature(climate.avgSummerTemp, 'summer');
    const winter_climate_actual = categorizeTemperature(climate.avgWinterTemp, 'winter');
    const precipitation_level_actual = categorizePrecipitation(climate.annualRainfall);

    console.log(`  → Categorized summer climate: ${summer_climate_actual}`);
    console.log(`  → Categorized winter climate: ${winter_climate_actual}`);
    console.log(`  → Categorized precipitation: ${precipitation_level_actual}`);

    if (!climate.sunshineHours) {
      dataGaps.push('sunshine_hours_unavailable');
    }

    return {
      avg_temp_summer: climate.avgSummerTemp,
      avg_temp_winter: climate.avgWinterTemp,
      annual_rainfall: climate.annualRainfall,
      sunshine_hours: climate.sunshineHours,
      summer_climate_actual,
      winter_climate_actual,
      precipitation_level_actual,
      sunshine_level_actual: categorizeSunshine(climate.sunshineHours),
      humidity_level_actual: categorizeHumidity(climate.humidity),
      _data_gaps: dataGaps
    };

  } catch (error) {
    console.error(`  ❌ Climate data fetch failed: ${error.message}`);
    dataGaps.push('climate_data_error');
    return { _data_gaps: dataGaps };
  }
}

/**
 * STEP 4: Gather Cost Data
 */
async function gatherCostData(townName, country) {
  console.log('\n💰 STEP 4: Gathering cost data...');

  const dataGaps = [];

  try {
    const costData = await fetchCostData(townName, country);

    if (!costData) {
      console.warn('  ⚠️ Cost data unavailable - manual research required');
      dataGaps.push('cost_data_unavailable_needs_research');
      return { _data_gaps: dataGaps };
    }

    return {
      cost_of_living_usd: costData.costIndex,
      typical_monthly_living_cost: costData.monthlyLivingCost,
      rent_1bed: costData.rent1Bedroom,
      meal_cost: costData.mealCost,
      groceries_cost: costData.groceriesCost,
      utilities_cost: costData.utilitiesCost,
      _data_gaps: dataGaps
    };

  } catch (error) {
    console.error(`  ❌ Cost data fetch failed: ${error.message}`);
    dataGaps.push('cost_data_error');
    return { _data_gaps: dataGaps };
  }
}

/**
 * STEP 5: Set Defaults & Initialize Structures
 */
function setDefaults(townData) {
  console.log('\n🔧 STEP 5: Setting defaults and initializing structures...');

  const defaults = {};

  // Initialize array fields to empty arrays
  DEFAULT_STRUCTURES.arrays.forEach(field => {
    defaults[field] = [];
  });

  // Initialize object fields to empty objects
  DEFAULT_STRUCTURES.objects.forEach(field => {
    defaults[field] = {};
  });

  // Set null defaults for specific fields
  NULL_DEFAULT_FIELDS.forEach(field => {
    defaults[field] = null;
  });

  // Set metadata
  Object.entries(METADATA_DEFAULTS).forEach(([field, valueFn]) => {
    defaults[field] = valueFn();
  });

  console.log(`  ✅ Initialized ${DEFAULT_STRUCTURES.arrays.length} array fields`);
  console.log(`  ✅ Initialized ${DEFAULT_STRUCTURES.objects.length} object fields`);
  console.log(`  ✅ Set metadata: created_at, last_ai_update, needs_update`);

  // Merge defaults with provided data (provided data takes precedence)
  return { ...defaults, ...townData };
}

/**
 * STEP 6: Validate Categorical Values
 */
function validateCategoricals(townData) {
  console.log('\n✅ STEP 6: Validating categorical values...');

  try {
    validateCategoricalValues(townData);
    console.log('  ✅ All categorical values valid');
    return true;
  } catch (error) {
    console.error(`  ❌ Validation failed: ${error.message}`);
    throw error;
  }
}

/**
 * STEP 7: Calculate Data Completeness Score
 */
function calculateCompleteness(townData) {
  console.log('\n📊 STEP 7: Calculating data completeness score...');

  const quality = calculateDataCompleteness(townData, FIELD_TIERS);

  console.log(`  → Critical fields: ${quality.breakdown.critical}% complete`);
  console.log(`  → Important fields: ${quality.breakdown.important}% complete`);
  console.log(`  → Nice-to-have fields: ${quality.breakdown.nice_to_have}% complete`);
  console.log(`  ✅ Overall completeness: ${quality.data_completeness_score}%`);

  if (quality.missing_critical.length > 0) {
    console.warn(`  ⚠️ Missing critical: ${quality.missing_critical.join(', ')}`);
  }

  if (quality.missing_important.length > 0) {
    console.warn(`  ⚠️ Missing important: ${quality.missing_important.join(', ')}`);
  }

  return quality;
}

/**
 * STEP 8: Insert Into Database & Generate Report
 */
async function insertTown(townData) {
  console.log('\n💾 STEP 8: Inserting into database...');

  // Clean up internal metadata fields before insert
  const cleanData = { ...townData };
  delete cleanData._data_gaps;

  // Remove any undefined values (convert to null)
  Object.keys(cleanData).forEach(key => {
    if (cleanData[key] === undefined) {
      cleanData[key] = null;
    }
  });

  console.log(`  → Inserting ${Object.keys(cleanData).length} fields`);
  console.log(`  → Field names:`, Object.keys(cleanData).sort().join(', '));

  // Debug: Check for problematic field names
  const suspiciousFields = Object.keys(cleanData).filter(k => k.includes('lat') || k.includes('lon'));
  if (suspiciousFields.length > 0) {
    console.log(`  → Coordinate-related fields:`, suspiciousFields);
    suspiciousFields.forEach(f => {
      console.log(`    - ${f}: ${cleanData[f]}`);
    });
  }

  try {
    const { data, error } = await supabase
      .from('towns')
      .insert([cleanData])
      .select();

    if (error) {
      console.error(`  ❌ Supabase error details:`, error);
      throw new Error(`Database insert failed: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Insert succeeded but no data returned');
    }

    console.log(`  ✅ Successfully inserted town with ID: ${data[0].id}`);

    return data[0];

  } catch (error) {
    console.error(`  ❌ Insert failed: ${error.message}`);
    throw error;
  }
}

/**
 * Generate Final Report
 */
function generateReport(insertedTown, quality, dataGaps) {
  console.log('\n\n📄 ═══════════════════════════════════════════════════════════');
  console.log('   TOWN ADDITION COMPLETE - QUALITY REPORT');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`✅ Town Name: ${insertedTown.name}`);
  console.log(`✅ Country: ${insertedTown.country}`);
  console.log(`✅ Database ID: ${insertedTown.id}`);
  console.log(`\n📊 Data Completeness: ${quality.data_completeness_score}%`);
  console.log(`   → Critical: ${quality.breakdown.critical}%`);
  console.log(`   → Important: ${quality.breakdown.important}%`);
  console.log(`   → Nice-to-have: ${quality.breakdown.nice_to_have}%\n`);

  if (quality.missing_critical.length > 0) {
    console.log(`❌ MISSING CRITICAL FIELDS:`);
    quality.missing_critical.forEach(f => console.log(`   - ${f}`));
    console.log('');
  }

  if (quality.missing_important.length > 0) {
    console.log(`⚠️  MISSING IMPORTANT FIELDS:`);
    quality.missing_important.forEach(f => console.log(`   - ${f}`));
    console.log('');
  }

  if (dataGaps.length > 0) {
    console.log(`📋 DATA GAPS IDENTIFIED:`);
    dataGaps.forEach(gap => console.log(`   - ${gap}`));
    console.log('');
  }

  console.log(`🔍 NEXT STEPS:`);
  console.log(`   1. Review in Admin UI: http://localhost:5173/admin/towns-manager`);
  console.log(`   2. Search for "${insertedTown.name}" in the admin panel`);
  console.log(`   3. Add missing important fields (especially cost data)`);
  console.log(`   4. Add photos (image_url_1)`);
  console.log(`   5. Research and populate activities/interests arrays`);
  console.log(`   6. Run scoring algorithm to calculate scores`);
  console.log('\n═══════════════════════════════════════════════════════════\n');

  return {
    success: true,
    town_id: insertedTown.id,
    town_name: insertedTown.name,
    data_completeness_score: quality.data_completeness_score,
    breakdown: quality.breakdown,
    missing_critical: quality.missing_critical,
    missing_important: quality.missing_important,
    data_gaps: dataGaps
  };
}

/**
 * MAIN FUNCTION - Orchestrates all steps
 */
async function addTown(inputData) {
  console.log('🚀 Starting town addition process...');
  console.log(`📍 Town: ${inputData.name}, ${inputData.country}`);

  const allDataGaps = [];

  try {
    // STEP 1: Validate input
    await validateInput(inputData);

    // STEP 2: Enrich geography
    const geography = await enrichGeography(inputData);
    Object.assign(inputData, geography);

    // STEP 3: Gather climate data
    const climate = await gatherClimateData(inputData.latitude, inputData.longitude, inputData.name);
    if (climate._data_gaps) allDataGaps.push(...climate._data_gaps);
    delete climate._data_gaps;
    Object.assign(inputData, climate);

    // STEP 4: Gather cost data
    const cost = await gatherCostData(inputData.name, inputData.country);
    if (cost._data_gaps) allDataGaps.push(...cost._data_gaps);
    delete cost._data_gaps;
    Object.assign(inputData, cost);

    // STEP 5: Set defaults
    const townData = setDefaults(inputData);

    // STEP 6: Validate categorical values
    validateCategoricals(townData);

    // STEP 7: Calculate completeness
    const quality = calculateCompleteness(townData);
    townData.data_completeness_score = quality.data_completeness_score;

    // STEP 8: Insert into database
    const insertedTown = await insertTown(townData);

    // Generate final report
    const report = generateReport(insertedTown, quality, allDataGaps);

    return report;

  } catch (error) {
    console.error(`\n❌ FAILED: ${error.message}\n`);
    throw error;
  }
}

/**
 * CLI INTERFACE
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    params[key] = value;
  }

  // Convert lat/lon to latitude/longitude (database column names)
  if (params.lat) {
    params.latitude = parseFloat(params.lat);
    delete params.lat; // Remove the shortened version
  }
  if (params.lon) {
    params.longitude = parseFloat(params.lon);
    delete params.lon; // Remove the shortened version
  }

  if (!params.name || !params.country) {
    console.error('\n❌ Usage: node add-town.js --name "Town Name" --country "Country"\n');
    console.error('Optional: --lat 12.34 --lon -56.78\n');
    process.exit(1);
  }

  try {
    await addTown(params);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { addTown };
