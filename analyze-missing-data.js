import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function analyzeMissingData() {
  console.log('🔍 ANALYZING MISSING DATA IN TOWNS TABLE\n');
  
  const { data: towns } = await supabase
    .from('towns')
    .select('*')
    .order('name');
    
  // Key fields to check
  const fieldsToCheck = {
    // Basic info
    'state_province': 0,
    'latitude': 0,
    'longitude': 0,
    'population': 0,
    'population_source_year': 0,
    
    // Cost data
    'typical_monthly_living_cost': 0,
    'typical_rent_1bed': 0,
    'typical_rent_2bed': 0,
    'groceries_cost_monthly': 0,
    'utilities_cost_monthly': 0,
    'transportation_cost_monthly': 0,
    'healthcare_cost_monthly': 0,
    'dining_out_cost_meal': 0,
    
    // Climate data (already complete)
    'avg_temp_summer': 0,
    'avg_temp_winter': 0,
    'humidity_level_actual': 0,
    'sunshine_level_actual': 0,
    'precipitation_level_actual': 0,
    
    // Language/Culture
    'primary_language': 0,
    'languages_spoken': 0,
    'english_proficiency_level': 0,
    
    // Activities
    'activities_available': 0,
    'interests_supported': 0,
    
    // Ratings
    'outdoor_activities_rating': 0,
    'cultural_events_rating': 0,
    'shopping_rating': 0,
    'dining_scene_rating': 0,
    'nightlife_rating': 0,
    'wellness_facilities_rating': 0,
    
    // Infrastructure
    'internet_speed_mbps': 0,
    'walkability_score': 0,
    'public_transport_quality': 0,
    
    // Visa/Tax
    'visa_on_arrival_countries': 0,
    'visa_duration_days': 0,
    'income_tax_rate': 0,
    'sales_tax_rate': 0,
    'property_tax_rate': 0,
    
    // Images
    'image_url_1': 0,
    'image_url_2': 0,
    'image_url_3': 0
  };
  
  // Count missing data
  towns.forEach(town => {
    Object.keys(fieldsToCheck).forEach(field => {
      const value = town[field];
      if (value === null || value === undefined || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        fieldsToCheck[field]++;
      }
    });
  });
  
  // Sort by most missing
  const sortedFields = Object.entries(fieldsToCheck)
    .sort((a, b) => b[1] - a[1]);
    
  console.log('MISSING DATA ANALYSIS (out of 342 towns):');
  console.log('─'.repeat(60));
  console.log('Field'.padEnd(35) + 'Missing'.padEnd(10) + 'Percentage');
  console.log('─'.repeat(60));
  
  sortedFields.forEach(([field, count]) => {
    const percentage = ((count / towns.length) * 100).toFixed(1);
    console.log(
      field.padEnd(35) + 
      count.toString().padEnd(10) + 
      percentage + '%'
    );
  });
  
  // Specific analysis for visible towns (with photos)
  const visibleTowns = towns.filter(t => t.image_url_1);
  console.log(`\n\nFOR VISIBLE TOWNS ONLY (${visibleTowns.length} towns with photos):`);
  console.log('─'.repeat(60));
  
  const visibleMissing = {};
  Object.keys(fieldsToCheck).forEach(field => {
    visibleMissing[field] = 0;
  });
  
  visibleTowns.forEach(town => {
    Object.keys(visibleMissing).forEach(field => {
      const value = town[field];
      if (value === null || value === undefined || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        visibleMissing[field]++;
      }
    });
  });
  
  const sortedVisible = Object.entries(visibleMissing)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count > 0);
    
  console.log('Field'.padEnd(35) + 'Missing'.padEnd(10) + 'Percentage');
  console.log('─'.repeat(60));
  
  sortedVisible.forEach(([field, count]) => {
    const percentage = ((count / visibleTowns.length) * 100).toFixed(1);
    console.log(
      field.padEnd(35) + 
      count.toString().padEnd(10) + 
      percentage + '%'
    );
  });
  
  // Priority recommendations
  console.log('\n\n📋 ENRICHMENT PRIORITIES:');
  console.log('─'.repeat(60));
  console.log('1. PRIMARY LANGUAGE - Critical for culture matching (100% missing)');
  console.log('2. ACTIVITIES/INTERESTS - Critical for hobby matching');
  console.log('3. COST BREAKDOWNS - Important for budget planning');
  console.log('4. RATINGS - Help with lifestyle matching');
  console.log('5. MORE PHOTOS - Only 21% of towns visible to users');
}

analyzeMissingData().catch(console.error);