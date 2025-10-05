#!/usr/bin/env node

/**
 * STRICT DATA VALIDATOR
 * PREVENTS BAD DATA FROM EVER ENTERING THE DATABASE
 * 
 * Run this BEFORE any database updates to ensure data quality
 */

// THE ONLY ALLOWED VALUES - PERIOD!
export const ALLOWED_VALUES = {
  precipitation_level_actual: ['mostly_dry', 'balanced', 'less_dry', null],
  
  sunshine_level_actual: ['often_sunny', 'balanced', 'less_sunny', null],
  // NEVER: mostly_sunny, abundant, sunny, partly_sunny, often_cloudy
  
  humidity_level_actual: ['dry', 'balanced', 'humid', null],
  // ONLY user preference values allowed: dry, balanced, humid
  
  
  summer_climate_actual: ['hot', 'warm', 'mild', null],
  // ONLY these 3 values - NEVER 'moderate' or 'cool'
  
  winter_climate_actual: ['cold', 'cool', 'mild', null],
  // ONLY user preference values: cold, cool, mild - NO WARM!
  
  geographic_features_actual: [
    'coastal', 'mountain', 'island', 'lake', 'river', 
    'valley', 'desert', 'forest', 'plains'
  ],
  // ONLY user preference values - no plurals, no compounds
  
  vegetation_type_actual: [
    'tropical', 'subtropical', 'mediterranean', 'forest', 'grassland', 'desert'
  ],
  // ONLY user preference values - 6 types from UI
  
  // Culture fields
  expat_community_size: ['small', 'moderate', 'large', null],
  // ONLY user preference values - NO expat_population field exists
  
  pace_of_life_actual: ['relaxed', 'moderate', 'fast', null],
  // ONLY user preference values
  
  urban_rural_character: ['rural', 'suburban', 'urban', null]
  // ONLY user preference values
};

/**
 * Validate a single value
 */
export function validateValue(field, value) {
  const allowed = ALLOWED_VALUES[field];
  if (!allowed) {
    console.warn(`⚠️ No validation rules for field: ${field}`);
    return true;
  }
  
  // Handle null
  if (value === null || value === undefined) {
    return allowed.includes(null);
  }
  
  // For comma-separated values
  if (typeof value === 'string' && value.includes(',')) {
    const parts = value.split(',').map(p => p.trim().toLowerCase());
    return parts.every(part => allowed.includes(part));
  }
  
  // Single value
  const normalized = typeof value === 'string' ? value.toLowerCase() : value;
  return allowed.includes(normalized);
}

/**
 * Validate an entire town object before saving
 */
export function validateTown(town) {
  const errors = [];
  
  // Check precipitation
  if (!validateValue('precipitation_level_actual', town.precipitation_level_actual)) {
    errors.push(`Invalid precipitation: ${town.precipitation_level_actual}`);
  }
  
  // Check humidity
  if (!validateValue('humidity_level_actual', town.humidity_level_actual)) {
    errors.push(`Invalid humidity: ${town.humidity_level_actual}`);
  }
  
  // Check temperatures
  if (!validateValue('summer_climate_actual', town.summer_climate_actual)) {
    errors.push(`Invalid summer temp: ${town.summer_climate_actual}`);
  }
  
  if (!validateValue('winter_climate_actual', town.winter_climate_actual)) {
    errors.push(`Invalid winter temp: ${town.winter_climate_actual}`);
  }
  
  // Check geographic features (array)
  if (town.geographic_features_actual && Array.isArray(town.geographic_features_actual)) {
    const invalidFeatures = town.geographic_features_actual.filter(
      f => !ALLOWED_VALUES.geographic_features_actual.includes(f)
    );
    if (invalidFeatures.length > 0) {
      errors.push(`Invalid geographic features: ${invalidFeatures.join(', ')}`);
    }
  }
  
  // Check vegetation (array)
  if (town.vegetation_type_actual && Array.isArray(town.vegetation_type_actual)) {
    const invalidVeg = town.vegetation_type_actual.filter(
      v => !ALLOWED_VALUES.vegetation_type_actual.includes(v)
    );
    if (invalidVeg.length > 0) {
      errors.push(`Invalid vegetation: ${invalidVeg.join(', ')}`);
    }
  }
  
  // Check culture fields
  if (!validateValue('expat_community_size', town.expat_community_size)) {
    errors.push(`Invalid expat community size: ${town.expat_community_size}`);
  }
  
  if (!validateValue('pace_of_life_actual', town.pace_of_life_actual)) {
    errors.push(`Invalid pace of life: ${town.pace_of_life_actual}`);
  }
  
  if (!validateValue('urban_rural_character', town.urban_rural_character)) {
    errors.push(`Invalid urban/rural: ${town.urban_rural_character}`);
  }
  
  if (errors.length > 0) {
    console.error('❌ VALIDATION FAILED for', town.name || 'unknown town');
    errors.forEach(e => console.error('  -', e));
    return false;
  }
  
  return true;
}

/**
 * Run validation on all towns in database
 */
export async function validateDatabase() {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    'https://axlruvvsjepsulcbqlho.supabase.co',
    'process.env.SUPABASE_SERVICE_ROLE_KEY'
  );
  
  console.log('🔍 VALIDATING DATABASE...');
  console.log('=' .repeat(50));
  
  const { data: towns } = await supabase.from('towns').select('*');
  
  let valid = 0;
  let invalid = 0;
  const invalidTowns = [];
  
  for (const town of towns || []) {
    if (validateTown(town)) {
      valid++;
    } else {
      invalid++;
      invalidTowns.push(town.name);
    }
  }
  
  console.log('\n📊 VALIDATION RESULTS:');
  console.log(`  ✅ Valid towns: ${valid}`);
  console.log(`  ❌ Invalid towns: ${invalid}`);
  
  if (invalid > 0) {
    console.log('\n❌ INVALID TOWNS:');
    invalidTowns.forEach(t => console.log(`  - ${t}`));
    throw new Error('Database contains invalid data!');
  }
  
  console.log('\n✅ DATABASE VALIDATION PASSED!');
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateDatabase().catch(console.error);
}

// Export for use in other scripts
export default {
  ALLOWED_VALUES,
  validateValue,
  validateTown,
  validateDatabase
};