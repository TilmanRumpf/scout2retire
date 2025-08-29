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
  
  humidity_level: ['low', 'moderate', 'high', null],
  
  temperature_summer: ['hot', 'warm', 'moderate', 'cool', null],
  
  temperature_winter: ['warm', 'mild', 'cool', 'cold', 'very_cold', null],
  
  geographic_features_actual: [
    'coastal', 'mountains', 'desert', 'plains', 'volcanic', 
    'islands', 'forests', 'valleys', 'lake', 'river', 'hills',
    'fjords', 'cliffs', 'beaches', 'wetlands'
  ],
  
  vegetation_type_actual: [
    'mediterranean', 'tropical', 'temperate', 'arid', 'alpine',
    'rainforest', 'forest', 'grassland', 'subtropical', 
    'deciduous', 'coniferous', 'savanna', 'tundra'
  ]
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
  if (!validateValue('humidity_level', town.humidity_level)) {
    errors.push(`Invalid humidity: ${town.humidity_level}`);
  }
  
  // Check temperatures
  if (!validateValue('temperature_summer', town.temperature_summer)) {
    errors.push(`Invalid summer temp: ${town.temperature_summer}`);
  }
  
  if (!validateValue('temperature_winter', town.temperature_winter)) {
    errors.push(`Invalid winter temp: ${town.temperature_winter}`);
  }
  
  // Check geographic features
  if (town.geographic_features_actual && !validateValue('geographic_features_actual', town.geographic_features_actual)) {
    errors.push(`Invalid geographic features: ${town.geographic_features_actual}`);
  }
  
  // Check vegetation
  if (town.vegetation_type_actual && !validateValue('vegetation_type_actual', town.vegetation_type_actual)) {
    errors.push(`Invalid vegetation: ${town.vegetation_type_actual}`);
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
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
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