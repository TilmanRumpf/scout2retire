import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Helper function to safely extract nested values
function safeGet(obj, path, defaultValue = null) {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  
  return current === undefined || current === null ? defaultValue : current;
}

// Convert pet_owner array to boolean
function convertPetOwner(petOwner) {
  if (!petOwner || !Array.isArray(petOwner)) return false;
  return petOwner.length > 0 && petOwner[0] !== 'no';
}

// Merge regions and continents
function mergeRegions(regions, continents) {
  const combined = new Set();
  
  if (regions && Array.isArray(regions)) {
    regions.forEach(r => combined.add(r));
  }
  
  if (continents && Array.isArray(continents)) {
    continents.forEach(c => combined.add(c));
  }
  
  const result = Array.from(combined);
  return result.length > 0 ? result : null;
}

// Transform onboarding data to user_preferences format
function transformOnboardingData(onboardingData) {
  const data = onboardingData;
  const preferences = {};

  // Current Status mappings
  if (data.current_status) {
    const cs = data.current_status;
    
    // Handle different citizenship structures
    if (cs.citizenship) {
      preferences.primary_citizenship = cs.citizenship.primary_citizenship || null;
      preferences.secondary_citizenship = cs.citizenship.secondary_citizenship || null;
      preferences.visa_concerns = cs.citizenship.visa_concerns || false;
    }
    
    // Handle family situation - could be string or object
    if (typeof cs.family_situation === 'string') {
      preferences.family_status = cs.family_situation === 'Not specified' ? null : cs.family_situation;
    } else if (typeof cs.family_situation === 'object' && cs.family_situation?.status) {
      preferences.family_status = cs.family_situation.status;
      preferences.partner_agreement = cs.family_situation.partner_agreement || null;
      preferences.bringing_children = cs.family_situation.bringing_children || false;
      preferences.bringing_pets = cs.family_situation.bringing_pets || false;
    }
    
    // Handle pet_owner array
    if (cs.pet_owner) {
      preferences.bringing_pets = convertPetOwner(cs.pet_owner);
    }
    
    // Location and motivation
    preferences.current_location = cs.current_location || null;
    preferences.moving_motivation = cs.moving_motivation || null;
    
    // Retirement timeline
    if (cs.retirement_timeline) {
      preferences.retirement_status = cs.retirement_timeline.status || null;
      preferences.target_retirement_year = cs.retirement_timeline.target_year || null;
      preferences.timeline_flexibility = cs.retirement_timeline.flexibility || null;
    }
    
    // Partner citizenship (only if family status indicates couple/family)
    if (cs.partner_citizenship && 
        (preferences.family_status === 'couple' || preferences.family_status === 'family')) {
      preferences.partner_primary_citizenship = cs.partner_citizenship.primary_citizenship || null;
      preferences.partner_secondary_citizenship = cs.partner_citizenship.secondary_citizenship || null;
    }
  }

  // Region Preferences
  if (data.region_preferences) {
    const rp = data.region_preferences;
    preferences.regions = mergeRegions(rp.regions, rp.continents);
    preferences.countries = rp.countries && rp.countries.length > 0 ? rp.countries : null;
    preferences.provinces = rp.provinces && rp.provinces.length > 0 ? rp.provinces : null;
    preferences.geographic_features = rp.geographic_features && rp.geographic_features.length > 0 ? rp.geographic_features : null;
    preferences.vegetation_types = rp.vegetation_types && rp.vegetation_types.length > 0 ? rp.vegetation_types : null;
  }

  // Climate Preferences
  if (data.climate_preferences) {
    const cp = data.climate_preferences;
    preferences.summer_climate_preference = cp.summer_climate_preference && cp.summer_climate_preference.length > 0 ? cp.summer_climate_preference : null;
    preferences.winter_climate_preference = cp.winter_climate_preference && cp.winter_climate_preference.length > 0 ? cp.winter_climate_preference : null;
    preferences.humidity_level = cp.humidity_level && cp.humidity_level.length > 0 ? cp.humidity_level : null;
    preferences.sunshine = cp.sunshine && cp.sunshine.length > 0 ? cp.sunshine : null;
    preferences.precipitation = cp.precipitation && cp.precipitation.length > 0 ? cp.precipitation : null;
    preferences.seasonal_preference = cp.seasonal_preference || null;
  }

  // Culture Preferences
  if (data.culture_preferences) {
    const cp = data.culture_preferences;
    preferences.expat_community_preference = cp.expat_community_preference && cp.expat_community_preference.length > 0 ? cp.expat_community_preference : null;
    preferences.language_comfort = cp.language_comfort || null;
    preferences.cultural_importance = cp.cultural_importance || null;
    preferences.lifestyle_preferences = cp.lifestyle_preferences || null;
  }

  // Hobbies
  if (data.hobbies) {
    const h = data.hobbies;
    preferences.activities = h.activities && h.activities.length > 0 ? h.activities : null;
    preferences.interests = h.interests && h.interests.length > 0 ? h.interests : null;
    preferences.travel_frequency = h.travel_frequency || null;
    preferences.lifestyle_importance = h.lifestyle_importance || null;
  }

  // Administration
  if (data.administration) {
    const a = data.administration;
    preferences.healthcare_quality = a.healthcare_quality && a.healthcare_quality.length > 0 ? a.healthcare_quality : null;
    preferences.health_considerations = a.health_considerations || null;
    preferences.insurance_importance = a.insurance_importance && a.insurance_importance.length > 0 ? a.insurance_importance : null;
    preferences.safety_importance = a.safety_importance && a.safety_importance.length > 0 ? a.safety_importance : null;
    preferences.emergency_services = a.emergency_services && a.emergency_services.length > 0 ? a.emergency_services : null;
    preferences.political_stability = a.political_stability && a.political_stability.length > 0 ? a.political_stability : null;
    preferences.tax_preference = a.tax_preference && a.tax_preference.length > 0 ? a.tax_preference : null;
    preferences.government_efficiency = a.government_efficiency && a.government_efficiency.length > 0 ? a.government_efficiency : null;
    preferences.visa_preference = a.visa_preference && a.visa_preference.length > 0 ? a.visa_preference : null;
    preferences.stay_duration = a.stay_duration && a.stay_duration.length > 0 ? a.stay_duration : null;
    preferences.residency_path = a.residency_path && a.residency_path.length > 0 ? a.residency_path : null;
  }

  // Costs
  if (data.costs) {
    const c = data.costs;
    preferences.total_monthly_budget = c.total_monthly_budget || null;
    preferences.max_monthly_rent = c.max_monthly_rent || null;
    preferences.max_home_price = c.max_home_price || null;
    preferences.monthly_healthcare_budget = c.monthly_healthcare_budget || null;
    preferences.mobility = c.mobility || null;
    preferences.property_tax_sensitive = c.property_tax_sensitive || false;
    preferences.sales_tax_sensitive = c.sales_tax_sensitive || false;
    preferences.income_tax_sensitive = c.income_tax_sensitive || false;
  }

  // Mark as onboarding completed
  preferences.onboarding_completed = true;

  return preferences;
}

async function migrateData() {
  console.log('🚀 Starting onboarding data migration...\n');

  // First, check if we need to add partner citizenship columns
  const { data: partnerColumns, error: colError } = await supabase
    .rpc('query', { 
      query_text: `
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_name = 'user_preferences'
        AND column_name IN ('partner_primary_citizenship', 'partner_secondary_citizenship')
      ` 
    });

  if (!partnerColumns || partnerColumns.length === 0) {
    console.log('📋 Partner citizenship columns not found. Please run this SQL in Supabase Dashboard:\n');
    console.log(`ALTER TABLE user_preferences 
  ADD COLUMN IF NOT EXISTS partner_primary_citizenship TEXT,
  ADD COLUMN IF NOT EXISTS partner_secondary_citizenship TEXT;`);
    console.log('\n⚠️  Migration paused. Please add the columns and run this script again.');
    return;
  }

  // Get all onboarding responses
  const { data: responses, error: respError } = await supabase
    .from('onboarding_responses')
    .select('*');

  if (respError) {
    console.error('Error fetching onboarding responses:', respError);
    return;
  }

  // Get existing user preferences to check who needs migration
  const { data: existingPrefs, error: prefError } = await supabase
    .from('user_preferences')
    .select('user_id, onboarding_completed');

  if (prefError) {
    console.error('Error fetching user preferences:', prefError);
    return;
  }

  const existingUsers = {};
  existingPrefs.forEach(p => {
    existingUsers[p.user_id] = p;
  });

  // Process each response
  const results = {
    migrated: [],
    updated: [],
    errors: []
  };

  for (const response of responses) {
    const userId = response.user_id;
    const existing = existingUsers[userId];
    
    // Skip if already completed
    if (existing && existing.onboarding_completed) {
      console.log(`✅ User ${userId} already migrated, skipping...`);
      continue;
    }

    try {
      const transformedData = transformOnboardingData(response);
      
      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update(transformedData)
          .eq('user_id', userId);

        if (updateError) {
          console.error(`❌ Error updating user ${userId}:`, updateError);
          results.errors.push({ userId, error: updateError });
        } else {
          console.log(`✅ Updated preferences for user ${userId}`);
          results.updated.push(userId);
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({ user_id: userId, ...transformedData });

        if (insertError) {
          console.error(`❌ Error inserting user ${userId}:`, insertError);
          results.errors.push({ userId, error: insertError });
        } else {
          console.log(`✅ Created preferences for user ${userId}`);
          results.migrated.push(userId);
        }
      }
    } catch (err) {
      console.error(`❌ Error processing user ${userId}:`, err);
      results.errors.push({ userId, error: err.message });
    }
  }

  // Summary
  console.log('\n📊 Migration Summary:');
  console.log(`✅ New records created: ${results.migrated.length}`);
  console.log(`📝 Records updated: ${results.updated.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Error details:');
    results.errors.forEach(e => {
      console.log(`  - User ${e.userId}: ${e.error.message || e.error}`);
    });
  }

  // Verify migration
  console.log('\n🔍 Verifying migration...');
  const { data: finalCheck, error: checkError } = await supabase
    .from('user_preferences')
    .select('user_id, onboarding_completed, family_status, partner_primary_citizenship')
    .eq('onboarding_completed', true);

  if (!checkError && finalCheck) {
    console.log(`\n✅ Total users with completed onboarding: ${finalCheck.length}`);
    
    const withPartners = finalCheck.filter(u => u.partner_primary_citizenship);
    console.log(`👫 Users with partner citizenship data: ${withPartners.length}`);
  }
}

// Run migration
migrateData().catch(console.error);