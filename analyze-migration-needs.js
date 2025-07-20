import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function analyzeMigrationNeeds() {
  // Get all onboarding responses
  const { data: responses, error: respError } = await supabase
    .from('onboarding_responses')
    .select('*');

  if (respError) {
    console.error('Error fetching responses:', respError);
    return;
  }

  console.log(`📊 Total onboarding responses: ${responses.length}`);

  // Get existing user preferences
  const { data: preferences, error: prefError } = await supabase
    .from('user_preferences')
    .select('user_id, onboarding_completed');

  if (prefError) {
    console.error('Error fetching preferences:', prefError);
    return;
  }

  // Analyze migration needs
  const preferencesByUser = {};
  preferences.forEach(p => {
    preferencesByUser[p.user_id] = p;
  });

  const needsMigration = [];
  const alreadyMigrated = [];
  
  responses.forEach(resp => {
    const pref = preferencesByUser[resp.user_id];
    if (!pref) {
      needsMigration.push(resp);
    } else if (!pref.onboarding_completed) {
      needsMigration.push(resp);
    } else {
      alreadyMigrated.push(resp.user_id);
    }
  });

  console.log(`\n✅ Already migrated: ${alreadyMigrated.length} users`);
  console.log(`⚠️  Needs migration: ${needsMigration.length} users`);

  // Analyze field mapping
  console.log('\n📋 Field Mapping Analysis:');
  console.log('=' .repeat(80));
  
  if (needsMigration.length > 0) {
    const sample = needsMigration[0];
    console.log('\nSample onboarding data structure:');
    
    // Current Status mapping
    console.log('\n🔄 CURRENT STATUS MAPPING:');
    if (sample.current_status) {
      const cs = sample.current_status;
      console.log('  citizenship.primary_citizenship → primary_citizenship');
      console.log('  citizenship.secondary_citizenship → secondary_citizenship');
      console.log('  citizenship.visa_concerns → visa_concerns');
      console.log('  family_situation → family_status');
      console.log('  current_location → current_location');
      console.log('  moving_motivation → moving_motivation');
      console.log('  retirement_timeline.status → retirement_status');
      console.log('  retirement_timeline.target_year → target_retirement_year');
      console.log('  retirement_timeline.flexibility → timeline_flexibility');
      
      // Handle new structure where family_situation is an object
      if (typeof cs.family_situation === 'object') {
        console.log('  family_situation.status → family_status');
        console.log('  family_situation.partner_agreement → partner_agreement');
        console.log('  family_situation.bringing_children → bringing_children');
        console.log('  family_situation.bringing_pets → bringing_pets');
      }
      
      // Handle pet_owner array
      if (cs.pet_owner) {
        console.log('  pet_owner array → bringing_pets (convert to boolean)');
      }
    }

    // Partner citizenship mapping
    console.log('\n👫 PARTNER CITIZENSHIP MAPPING:');
    if (sample.current_status?.partner_citizenship) {
      console.log('  partner_citizenship.primary_citizenship → partner_primary_citizenship');
      console.log('  partner_citizenship.secondary_citizenship → partner_secondary_citizenship');
      console.log('  (Note: Only migrate if family_status is couple/family)');
    }

    // Rest of the mappings
    console.log('\n🌍 REGION PREFERENCES MAPPING:');
    console.log('  region_preferences.regions → regions');
    console.log('  region_preferences.countries → countries');
    console.log('  region_preferences.continents → regions (merge with regions)');
    console.log('  region_preferences.geographic_features → geographic_features');
    console.log('  region_preferences.vegetation_types → vegetation_types');

    console.log('\n☀️ CLIMATE PREFERENCES MAPPING:');
    console.log('  climate_preferences.summer_climate_preference → summer_climate_preference');
    console.log('  climate_preferences.winter_climate_preference → winter_climate_preference');
    console.log('  climate_preferences.humidity_level → humidity_level');
    console.log('  climate_preferences.sunshine → sunshine');
    console.log('  climate_preferences.precipitation → precipitation');
    console.log('  climate_preferences.seasonal_preference → seasonal_preference');

    console.log('\n🎭 CULTURE PREFERENCES MAPPING:');
    console.log('  culture_preferences.expat_community_preference → expat_community_preference');
    console.log('  culture_preferences.language_comfort → language_comfort');
    console.log('  culture_preferences.cultural_importance → cultural_importance');
    console.log('  culture_preferences.lifestyle_preferences → lifestyle_preferences');

    console.log('\n🎯 HOBBIES MAPPING:');
    console.log('  hobbies.activities → activities');
    console.log('  hobbies.interests → interests');
    console.log('  hobbies.travel_frequency → travel_frequency');
    console.log('  hobbies.lifestyle_importance → lifestyle_importance');

    console.log('\n🏥 ADMINISTRATION MAPPING:');
    console.log('  administration.healthcare_quality → healthcare_quality');
    console.log('  administration.health_considerations → health_considerations');
    console.log('  administration.insurance_importance → insurance_importance');
    console.log('  administration.safety_importance → safety_importance');
    console.log('  administration.emergency_services → emergency_services');
    console.log('  administration.political_stability → political_stability');
    console.log('  administration.tax_preference → tax_preference');
    console.log('  administration.government_efficiency → government_efficiency');
    console.log('  administration.visa_preference → visa_preference');
    console.log('  administration.stay_duration → stay_duration');
    console.log('  administration.residency_path → residency_path');

    console.log('\n💰 COSTS MAPPING:');
    console.log('  costs.total_monthly_budget → total_monthly_budget');
    console.log('  costs.max_monthly_rent → max_monthly_rent');
    console.log('  costs.max_home_price → max_home_price');
    console.log('  costs.monthly_healthcare_budget → monthly_healthcare_budget');
    console.log('  costs.mobility → mobility');
    console.log('  costs.property_tax_sensitive → property_tax_sensitive');
    console.log('  costs.sales_tax_sensitive → sales_tax_sensitive');
    console.log('  costs.income_tax_sensitive → income_tax_sensitive');
  }

  // Show users that need migration
  console.log('\n\n📝 Users needing migration:');
  needsMigration.forEach(nm => {
    console.log(`- User ${nm.user_id} (submitted: ${nm.submitted_at})`);
  });

  return { needsMigration, alreadyMigrated };
}

analyzeMigrationNeeds().catch(console.error);