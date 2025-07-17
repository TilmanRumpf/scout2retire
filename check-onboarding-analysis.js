import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log("🔍 Scout2Retire Onboarding Analysis - Checking Zero Matches Issue");
console.log("================================================================");

// 1. Check user_preferences table structure
console.log("\n1. USER_PREFERENCES TABLE STRUCTURE:");
try {
  const { data: userPrefsSchema, error: schemaError } = await supabase
    .from('user_preferences')
    .select('*')
    .limit(1);
    
  if (schemaError) {
    console.error("Error getting user_preferences schema:", schemaError);
  } else if (userPrefsSchema && userPrefsSchema.length > 0) {
    console.log("Sample user_preferences record structure:");
    console.log(Object.keys(userPrefsSchema[0]));
  } else {
    console.log("No records found in user_preferences table");
  }
} catch (error) {
  console.error("Error checking user_preferences:", error);
}

// 2. Check actual user data
console.log("\n2. CHECKING ACTUAL USER DATA:");
try {
  const { data: users, error: usersError } = await supabase
    .from('user_preferences')
    .select('user_id, onboarding_completed, total_monthly_budget, countries, regions, summer_climate_preference, winter_climate_preference')
    .eq('onboarding_completed', true)
    .limit(5);
    
  if (usersError) {
    console.error("Error getting users:", usersError);
  } else {
    console.log(`Found ${users.length} completed onboarding users:`);
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1} (${user.user_id}):`);
      console.log(`  Budget: $${user.total_monthly_budget}`);
      console.log(`  Countries: ${JSON.stringify(user.countries)}`);
      console.log(`  Regions: ${JSON.stringify(user.regions)}`);
      console.log(`  Summer Climate: ${JSON.stringify(user.summer_climate_preference)}`);
      console.log(`  Winter Climate: ${JSON.stringify(user.winter_climate_preference)}`);
    });
  }
} catch (error) {
  console.error("Error checking user data:", error);
}

// 3. Check towns table structure and sample data
console.log("\n3. TOWNS TABLE STRUCTURE AND DATA:");
try {
  const { data: townsSchema, error: townsError } = await supabase
    .from('towns')
    .select('*')
    .not('image_url_1', 'is', null)
    .limit(3);
    
  if (townsError) {
    console.error("Error getting towns:", townsError);
  } else {
    console.log(`Found ${townsSchema.length} towns with photos:`);
    townsSchema.forEach((town, index) => {
      console.log(`\nTown ${index + 1}: ${town.name}, ${town.country}`);
      console.log(`  Cost Index: ${town.cost_index}`);
      console.log(`  Living Cost: ${town.typical_monthly_living_cost}`);
      console.log(`  Healthcare Score: ${town.healthcare_score}`);
      console.log(`  Safety Score: ${town.safety_score}`);
      console.log(`  Summer Climate: ${town.summer_climate_actual || town.avg_temp_summer}`);
      console.log(`  Winter Climate: ${town.winter_climate_actual || town.avg_temp_winter}`);
      console.log(`  Country: ${town.country}`);
      console.log(`  Geographic Features: ${JSON.stringify(town.geographic_features_actual)}`);
    });
  }
} catch (error) {
  console.error("Error checking towns:", error);
}

// 4. Check data format mismatches
console.log("\n4. CHECKING FOR DATA FORMAT MISMATCHES:");
try {
  // Get a user with preferences
  const { data: sampleUser, error: userError } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('onboarding_completed', true)
    .limit(1)
    .single();
    
  if (userError) {
    console.error("Error getting sample user:", userError);
  } else {
    console.log("Sample user preferences format:");
    console.log(`Countries: ${JSON.stringify(sampleUser.countries)} (Type: ${typeof sampleUser.countries})`);
    console.log(`Regions: ${JSON.stringify(sampleUser.regions)} (Type: ${typeof sampleUser.regions})`);
    console.log(`Summer Climate: ${JSON.stringify(sampleUser.summer_climate_preference)} (Type: ${typeof sampleUser.summer_climate_preference})`);
    
    // Get a town for comparison
    const { data: sampleTown, error: townError } = await supabase
      .from('towns')
      .select('*')
      .not('image_url_1', 'is', null)
      .limit(1)
      .single();
      
    if (townError) {
      console.error("Error getting sample town:", townError);
    } else {
      console.log("\nSample town data format:");
      console.log(`Country: ${sampleTown.country} (Type: ${typeof sampleTown.country})`);
      console.log(`Summer Climate: ${sampleTown.summer_climate_actual} (Type: ${typeof sampleTown.summer_climate_actual})`);
      console.log(`Geographic Features: ${JSON.stringify(sampleTown.geographic_features_actual)} (Type: ${typeof sampleTown.geographic_features_actual})`);
    }
  }
} catch (error) {
  console.error("Error checking data formats:", error);
}

// 5. Test matching algorithm with real data
console.log("\n5. TESTING MATCHING ALGORITHM:");
try {
  const { data: testUser, error: testUserError } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('onboarding_completed', true)
    .limit(1)
    .single();
    
  const { data: testTowns, error: testTownsError } = await supabase
    .from('towns')
    .select('*')
    .not('image_url_1', 'is', null)
    .limit(5);
    
  if (testUserError || testTownsError) {
    console.error("Error getting test data:", testUserError || testTownsError);
  } else {
    console.log(`Testing user ${testUser.user_id} against ${testTowns.length} towns...`);
    
    // Transform user data to match expected format
    const userPreferences = {
      region_preferences: {
        regions: testUser.regions || [],
        countries: testUser.countries || [],
        provinces: testUser.provinces || [],
        geographic_features: testUser.geographic_features || [],
        vegetation_types: testUser.vegetation_types || []
      },
      climate_preferences: {
        summer_climate_preference: testUser.summer_climate_preference || [],
        winter_climate_preference: testUser.winter_climate_preference || [],
        humidity_level: testUser.humidity_level || [],
        sunshine: testUser.sunshine || [],
        precipitation: testUser.precipitation || [],
        seasonal_preference: testUser.seasonal_preference || ''
      },
      budget_preferences: {
        total_monthly_budget: testUser.total_monthly_budget || 0,
        max_monthly_rent: testUser.max_monthly_rent || 0,
        max_home_price: testUser.max_home_price || 0,
        monthly_healthcare_budget: testUser.monthly_healthcare_budget || 0
      }
    };
    
    console.log("\nUser preferences structure:");
    console.log("- Budget:", userPreferences.budget_preferences.total_monthly_budget);
    console.log("- Countries:", userPreferences.region_preferences.countries);
    console.log("- Summer Climate:", userPreferences.climate_preferences.summer_climate_preference);
    
    // Check basic budget matching
    testTowns.forEach(town => {
      const budget = userPreferences.budget_preferences.total_monthly_budget;
      const cost = town.typical_monthly_living_cost || town.cost_index;
      const budgetRatio = budget / cost;
      
      console.log(`\nTown: ${town.name}, ${town.country}`);
      console.log(`  Budget: $${budget}, Cost: $${cost}, Ratio: ${budgetRatio.toFixed(2)}`);
      console.log(`  Budget match: ${budgetRatio >= 0.8 ? 'YES' : 'NO'}`);
      
      // Check country match
      const countryMatch = userPreferences.region_preferences.countries.includes(town.country);
      console.log(`  Country match: ${countryMatch ? 'YES' : 'NO'}`);
    });
  }
} catch (error) {
  console.error("Error testing matching:", error);
}

// 6. Check for restrictive filters
console.log("\n6. CHECKING FOR RESTRICTIVE FILTERS:");
try {
  const { data: townStats, error: statsError } = await supabase
    .from('towns')
    .select('*')
    .not('image_url_1', 'is', null);
    
  if (statsError) {
    console.error("Error getting town stats:", statsError);
  } else {
    console.log(`Total towns with photos: ${townStats.length}`);
    
    const countries = [...new Set(townStats.map(t => t.country))];
    console.log(`Available countries: ${countries.join(', ')}`);
    
    const climates = [...new Set(townStats.map(t => t.summer_climate_actual).filter(Boolean))];
    console.log(`Summer climates: ${climates.join(', ')}`);
    
    const costs = townStats.map(t => t.typical_monthly_living_cost || t.cost_index).filter(Boolean);
    console.log(`Cost range: $${Math.min(...costs)} - $${Math.max(...costs)}`);
  }
} catch (error) {
  console.error("Error checking restrictive filters:", error);
}

console.log("\n================================================================");
console.log("Analysis complete. Check output above for potential issues.");