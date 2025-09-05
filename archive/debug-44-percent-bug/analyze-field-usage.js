// Analyze which fields are actually populated in the database
// and which are used in the matching algorithm

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

// Fields declared in towns-manager as "used" for matching
const FIELDS_IN_TOWNS_MANAGER = {
  Region: ['country', 'region', 'regions', 'geo_region', 'geographic_features_actual', 'vegetation_type_actual'],
  Climate: ['avg_temp_summer', 'avg_temp_winter', 'summer_climate_actual', 'winter_climate_actual', 
            'humidity_level_actual', 'sunshine_level_actual', 'sunshine_hours', 'precipitation_level_actual', 
            'annual_rainfall', 'climate_description', 'climate'],
  Culture: ['language', 'languages_spoken', 'english_proficiency', 'expat_rating'],
  Hobbies: [], // None used according to towns-manager
  Admin: ['healthcare_score', 'safety_score', 'walkability', 'air_quality_index', 
          'english_speaking_doctors', 'airport_distance'],
  Costs: ['cost_of_living_usd', 'typical_monthly_living_cost', 'rent_1bed']
};

// Fields actually referenced in enhancedMatchingAlgorithm.js
const FIELDS_IN_ALGORITHM = {
  Region: ['country', 'region', 'regions', 'geo_region', 'geographic_features_actual', 'vegetation_type_actual'],
  Climate: ['avg_temp_summer', 'avg_temp_winter', 'summer_climate_actual', 'winter_climate_actual',
            'humidity_level_actual', 'sunshine_level_actual', 'sunshine_hours', 'precipitation_level_actual',
            'annual_rainfall', 'climate_description'],
  Culture: ['language', 'languages_spoken', 'english_proficiency', 'expat_friendly'],
  Hobbies: ['outdoor_activities', 'cultural_attractions', 'golf_courses', 'beaches_nearby'],
  Admin: ['healthcare_score', 'safety_score', 'walkability', 'english_speaking_doctors', 
          'visa_requirements', 'airport_distance'],
  Budget: ['cost_of_living_usd', 'typical_monthly_living_cost', 'rent_1bed']
};

async function analyzeFieldUsage() {
  console.log('📊 Analyzing field usage in database...\n');
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Total towns: ${towns.length}\n`);
  
  // Analyze each category
  const allFieldsInManager = [];
  const allFieldsInAlgorithm = [];
  
  for (const [category, fields] of Object.entries(FIELDS_IN_TOWNS_MANAGER)) {
    allFieldsInManager.push(...fields);
  }
  
  for (const [category, fields] of Object.entries(FIELDS_IN_ALGORITHM)) {
    allFieldsInAlgorithm.push(...fields);
  }
  
  // Get unique fields
  const uniqueFieldsManager = [...new Set(allFieldsInManager)];
  const uniqueFieldsAlgorithm = [...new Set(allFieldsInAlgorithm)];
  
  console.log('=== FIELD ANALYSIS ===\n');
  console.log(`Fields declared in towns-manager: ${uniqueFieldsManager.length}`);
  console.log(`Fields used in algorithm: ${uniqueFieldsAlgorithm.length}\n`);
  
  // Analyze population of each field
  const fieldStats = {};
  
  for (const field of [...new Set([...uniqueFieldsManager, ...uniqueFieldsAlgorithm])]) {
    let populated = 0;
    let nonNull = 0;
    let hasValue = 0;
    
    for (const town of towns) {
      if (town[field] !== null && town[field] !== undefined) {
        nonNull++;
        
        // Check if it has actual value (not empty string, empty array, etc)
        if (
          (typeof town[field] === 'string' && town[field].trim() !== '' && town[field] !== 'NULL') ||
          (Array.isArray(town[field]) && town[field].length > 0) ||
          (typeof town[field] === 'number') ||
          (typeof town[field] === 'boolean')
        ) {
          hasValue++;
        }
      }
    }
    
    fieldStats[field] = {
      nonNull,
      hasValue,
      percentage: Math.round((hasValue / towns.length) * 100)
    };
  }
  
  // Sort by percentage populated
  const sortedFields = Object.entries(fieldStats)
    .sort(([,a], [,b]) => b.percentage - a.percentage);
  
  console.log('=== FIELD POPULATION ANALYSIS ===\n');
  console.log('Field Name                                    | Has Value | Percentage | In Manager | In Algorithm');
  console.log('----------------------------------------------|-----------|------------|------------|-------------');
  
  for (const [field, stats] of sortedFields) {
    const inManager = uniqueFieldsManager.includes(field) ? '✓' : ' ';
    const inAlgorithm = uniqueFieldsAlgorithm.includes(field) ? '✓' : ' ';
    const fieldName = field.padEnd(45);
    const hasValue = stats.hasValue.toString().padStart(9);
    const percentage = `${stats.percentage}%`.padStart(10);
    
    // Color code based on population
    let emoji = '';
    if (stats.percentage === 100) emoji = '✅';
    else if (stats.percentage >= 80) emoji = '🟢';
    else if (stats.percentage >= 50) emoji = '🟡';
    else if (stats.percentage >= 20) emoji = '🟠';
    else emoji = '🔴';
    
    console.log(`${fieldName} | ${hasValue} | ${percentage} ${emoji} |     ${inManager}      |      ${inAlgorithm}`);
  }
  
  // Find discrepancies
  console.log('\n=== DISCREPANCIES ===\n');
  
  const inAlgorithmNotManager = uniqueFieldsAlgorithm.filter(f => !uniqueFieldsManager.includes(f));
  const inManagerNotAlgorithm = uniqueFieldsManager.filter(f => !uniqueFieldsAlgorithm.includes(f));
  
  if (inAlgorithmNotManager.length > 0) {
    console.log('Fields used in algorithm but NOT declared in towns-manager:');
    for (const field of inAlgorithmNotManager) {
      const stats = fieldStats[field];
      console.log(`  - ${field} (${stats?.percentage || 0}% populated)`);
    }
  }
  
  if (inManagerNotAlgorithm.length > 0) {
    console.log('\nFields declared in towns-manager but NOT used in algorithm:');
    for (const field of inManagerNotAlgorithm) {
      const stats = fieldStats[field];
      console.log(`  - ${field} (${stats?.percentage || 0}% populated)`);
    }
  }
  
  // Summary statistics
  console.log('\n=== SUMMARY ===\n');
  
  const wellPopulated = sortedFields.filter(([,stats]) => stats.percentage >= 80).length;
  const moderatelyPopulated = sortedFields.filter(([,stats]) => stats.percentage >= 50 && stats.percentage < 80).length;
  const poorlyPopulated = sortedFields.filter(([,stats]) => stats.percentage < 50).length;
  const emptyFields = sortedFields.filter(([,stats]) => stats.percentage === 0).length;
  
  console.log(`Well populated (≥80%): ${wellPopulated} fields`);
  console.log(`Moderately populated (50-79%): ${moderatelyPopulated} fields`);
  console.log(`Poorly populated (<50%): ${poorlyPopulated} fields`);
  console.log(`Empty fields (0%): ${emptyFields} fields`);
  
  // Critical missing data
  console.log('\n=== CRITICAL MISSING DATA (Used in algorithm but <50% populated) ===\n');
  for (const [field, stats] of sortedFields) {
    if (uniqueFieldsAlgorithm.includes(field) && stats.percentage < 50) {
      console.log(`  🚨 ${field}: Only ${stats.percentage}% populated (${stats.hasValue}/${towns.length} towns)`);
    }
  }
}

analyzeFieldUsage().catch(console.error);