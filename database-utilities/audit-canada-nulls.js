import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function auditCanadaNulls() {
  console.log('🔍 AUDITING ALL CANADIAN TOWNS FOR NULL VALUES\n');
  console.log('='.repeat(80) + '\n');

  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .eq('country', 'Canada')
    .order('town_name');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Found ${towns.length} Canadian towns\n`);

  // Track which columns have NULLs
  const nullColumns = {};
  const criticalFields = [
    'cost_index', 'climate', 'description', 'climate_description',
    'avg_temp_summer', 'avg_temp_winter', 'annual_rainfall', 'sunshine_hours',
    'cost_description', 'rent_1bed', 'meal_cost', 'groceries_cost', 'utilities_cost',
    'healthcare_description', 'lifestyle_description', 'safety_description',
    'infrastructure_description', 'internet_speed', 'public_transport_quality',
    'nearest_airport', 'airport_distance', 'walkability',
    'regions', 'water_bodies', 'summer_climate_actual', 'winter_climate_actual',
    'humidity_level_actual', 'sunshine_level_actual', 'precipitation_level_actual',
    'seasonal_variation_actual', 'activities_available', 'interests_supported',
    'pace_of_life_actual', 'urban_rural_character', 'social_atmosphere',
    'expat_community_size', 'english_proficiency_level', 'languages_spoken',
    'typical_monthly_living_cost', 'typical_rent_1bed', 'geographic_features_actual',
    'vegetation_type_actual', 'primary_language', 'retirement_community_presence'
  ];

  towns.forEach(town => {
    criticalFields.forEach(field => {
      const value = town[field];
      if (value === null || value === undefined || value === '' ||
          (Array.isArray(value) && value.length === 0)) {
        if (!nullColumns[field]) nullColumns[field] = [];
        nullColumns[field].push(town.town_name);
      }
    });
  });

  // Report
  console.log('❌ COLUMNS WITH NULL VALUES:\n');
  Object.keys(nullColumns).sort().forEach(field => {
    console.log(`${field}: ${nullColumns[field].length} towns`);
    console.log(`  Towns: ${nullColumns[field].slice(0, 5).join(', ')}${nullColumns[field].length > 5 ? '...' : ''}`);
    console.log('');
  });

  // Generate backfill plan
  const backfillPlan = {
    totalTowns: towns.length,
    nullColumns: Object.keys(nullColumns).length,
    affectedTowns: [...new Set(Object.values(nullColumns).flat())],
    details: nullColumns
  };

  fs.writeFileSync(
    '/Users/tilmanrumpf/Desktop/scout2retire/database-utilities/CANADA-NULL-AUDIT.json',
    JSON.stringify(backfillPlan, null, 2)
  );

  console.log('='.repeat(80));
  console.log(`\n📋 SUMMARY:`);
  console.log(`Total Canadian towns: ${towns.length}`);
  console.log(`Columns with NULLs: ${Object.keys(nullColumns).length}`);
  console.log(`Towns affected: ${backfillPlan.affectedTowns.length}`);
  console.log(`\n✅ Audit saved to: CANADA-NULL-AUDIT.json\n`);
}

auditCanadaNulls();
