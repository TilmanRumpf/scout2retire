import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log("🚨 CRITICAL: Testing Enhanced Matching Algorithm Execution");
console.log("==========================================================");

// Simulate the enhanced matching algorithm data transformation
function transformUserPreferencesData(userData) {
  return {
    region_preferences: {
      regions: userData.regions || [],
      countries: userData.countries || [],
      provinces: userData.provinces || [],
      geographic_features: userData.geographic_features || [],
      vegetation_types: userData.vegetation_types || []
    },
    climate_preferences: {
      summer_climate_preference: userData.summer_climate_preference || [],
      winter_climate_preference: userData.winter_climate_preference || [],
      humidity_level: userData.humidity_level || [],
      sunshine: userData.sunshine || [],
      precipitation: userData.precipitation || [],
      seasonal_preference: userData.seasonal_preference || ''
    },
    culture_preferences: {
      expat_community_preference: userData.expat_community_preference || [],
      language_comfort: userData.language_comfort || {},
      cultural_importance: userData.cultural_importance || {},
      lifestyle_preferences: userData.lifestyle_preferences || {}
    },
    hobbies_preferences: {
      activities: userData.activities || [],
      interests: userData.interests || [],
      travel_frequency: userData.travel_frequency || '',
      lifestyle_importance: userData.lifestyle_importance || {}
    },
    admin_preferences: {
      healthcare_quality: userData.healthcare_quality || [],
      health_considerations: userData.health_considerations || {},
      insurance_importance: userData.insurance_importance || [],
      safety_importance: userData.safety_importance || [],
      emergency_services: userData.emergency_services || [],
      political_stability: userData.political_stability || [],
      tax_preference: userData.tax_preference || [],
      government_efficiency: userData.government_efficiency || [],
      visa_preference: userData.visa_preference || [],
      stay_duration: userData.stay_duration || [],
      residency_path: userData.residency_path || [],
      property_tax_sensitive: userData.property_tax_sensitive || false,
      sales_tax_sensitive: userData.sales_tax_sensitive || false,
      income_tax_sensitive: userData.income_tax_sensitive || false
    },
    budget_preferences: {
      total_monthly_budget: userData.total_monthly_budget || 0,
      max_monthly_rent: userData.max_monthly_rent || 0,
      max_home_price: userData.max_home_price || 0,
      monthly_healthcare_budget: userData.monthly_healthcare_budget || 0,
      mobility: userData.mobility || {}
    },
    current_status: {
      citizenship: userData.primary_citizenship || 'USA'
    }
  };
}

// Simplified matching algorithm for testing
function calculateSimplifiedMatch(userPreferences, town) {
  let score = 0;
  let factors = [];
  
  // Budget check (critical)
  const budget = userPreferences.budget_preferences.total_monthly_budget;
  const cost = town.typical_monthly_living_cost || town.cost_index;
  
  if (budget > 0 && cost > 0) {
    const budgetRatio = budget / cost;
    if (budgetRatio >= 1.0) {
      score += 30;
      factors.push(`Budget adequate: $${budget} vs $${cost}`);
    } else if (budgetRatio >= 0.8) {
      score += 15;
      factors.push(`Budget tight: $${budget} vs $${cost}`);
    } else {
      factors.push(`Budget insufficient: $${budget} vs $${cost}`);
    }
  } else {
    factors.push('Missing budget or cost data');
  }
  
  // Country match
  const countries = userPreferences.region_preferences.countries;
  if (countries && countries.length > 0) {
    if (countries.includes(town.country)) {
      score += 40;
      factors.push(`Country match: ${town.country}`);
    } else {
      factors.push(`No country match: wanted ${countries.join(',')}, town is in ${town.country}`);
    }
  } else {
    score += 20; // No preference = partial credit
    factors.push('No country preference specified');
  }
  
  // Climate match
  const summerPref = userPreferences.climate_preferences.summer_climate_preference;
  if (summerPref && summerPref.length > 0) {
    if (town.summer_climate_actual && summerPref.includes(town.summer_climate_actual)) {
      score += 20;
      factors.push(`Summer climate match: ${town.summer_climate_actual}`);
    } else {
      factors.push(`No summer climate match: wanted ${summerPref.join(',')}, town has ${town.summer_climate_actual || 'unknown'}`);
    }
  } else {
    score += 10; // No preference = partial credit
    factors.push('No summer climate preference');
  }
  
  // Healthcare requirement
  if (town.healthcare_score) {
    if (town.healthcare_score >= 7) {
      score += 10;
      factors.push(`Good healthcare: ${town.healthcare_score}/10`);
    } else if (town.healthcare_score >= 5) {
      score += 5;
      factors.push(`Adequate healthcare: ${town.healthcare_score}/10`);
    } else {
      factors.push(`Poor healthcare: ${town.healthcare_score}/10`);
    }
  } else {
    factors.push('No healthcare score available');
  }
  
  return {
    town_id: town.id,
    town_name: town.name,
    town_country: town.country,
    match_score: score,
    factors: factors
  };
}

async function runMatchingTest() {
  try {
    // Get a completed user
    console.log("\n1. Getting test user...");
    const { data: testUser, error: userError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('onboarding_completed', true)
      .limit(1)
      .single();
      
    if (userError) {
      console.error("❌ Cannot get test user:", userError);
      return;
    }
    
    console.log(`✅ Found test user: ${testUser.user_id}`);
    console.log(`   Budget: $${testUser.total_monthly_budget}`);
    console.log(`   Countries: ${JSON.stringify(testUser.countries)}`);
    console.log(`   Summer Climate: ${JSON.stringify(testUser.summer_climate_preference)}`);
    
    // Transform user data
    console.log("\n2. Transforming user preferences...");
    const userPreferences = transformUserPreferencesData(testUser);
    console.log("✅ User preferences transformed");
    
    // Get towns with photos
    console.log("\n3. Getting towns with photos...");
    const { data: towns, error: townsError } = await supabase
      .from('towns')
      .select('*')
      .not('image_url_1', 'is', null)
      .limit(10);
      
    if (townsError) {
      console.error("❌ Cannot get towns:", townsError);
      return;
    }
    
    console.log(`✅ Found ${towns.length} towns with photos`);
    
    // Test matching algorithm
    console.log("\n4. Running simplified matching algorithm...");
    const matches = towns.map(town => calculateSimplifiedMatch(userPreferences, town));
    
    // Sort by score
    matches.sort((a, b) => b.match_score - a.match_score);
    
    console.log("\n5. MATCHING RESULTS:");
    console.log("===================");
    
    const topMatches = matches.slice(0, 5);
    
    if (topMatches.length === 0) {
      console.log("❌ NO MATCHES FOUND!");
    } else {
      console.log(`✅ Found ${matches.length} total matches, top 5:`);
      
      topMatches.forEach((match, index) => {
        console.log(`\n${index + 1}. ${match.town_name}, ${match.town_country} - Score: ${match.match_score}`);
        console.log("   Factors:");
        match.factors.forEach(factor => {
          console.log(`   - ${factor}`);
        });
      });
    }
    
    // Check for zero scores
    const zeroScores = matches.filter(m => m.match_score === 0);
    if (zeroScores.length > 0) {
      console.log(`\n⚠️  WARNING: ${zeroScores.length} towns scored 0 points`);
      console.log("Sample zero-score town factors:");
      zeroScores.slice(0, 2).forEach(match => {
        console.log(`\n${match.town_name}, ${match.town_country}:`);
        match.factors.forEach(factor => {
          console.log(`   - ${factor}`);
        });
      });
    }
    
    // Check filtering criteria
    console.log("\n6. CHECKING FILTERING CRITERIA:");
    console.log("================================");
    
    const hasPhotos = towns.length;
    const { data: allTowns } = await supabase.from('towns').select('id');
    const totalTowns = allTowns ? allTowns.length : 0;
    
    console.log(`Total towns in database: ${totalTowns}`);
    console.log(`Towns with photos: ${hasPhotos}`);
    console.log(`Percentage with photos: ${((hasPhotos / totalTowns) * 100).toFixed(1)}%`);
    
    // Check if photos filter is too restrictive
    if (hasPhotos < 20) {
      console.log("⚠️  CRITICAL: Very few towns have photos! This might be causing zero matches.");
    }
    
    // Budget analysis
    const budgetabletowns = towns.filter(t => {
      const cost = t.typical_monthly_living_cost || t.cost_index;
      return cost && cost <= testUser.total_monthly_budget * 1.2; // 20% over budget tolerance
    });
    
    console.log(`Towns within budget (+20%): ${budgetabletowns.length}`);
    
    if (budgetabletowns.length === 0) {
      console.log("⚠️  CRITICAL: No towns within user's budget range!");
      console.log("Town costs:", towns.map(t => `${t.name}: $${t.typical_monthly_living_cost || t.cost_index}`));
    }
    
  } catch (error) {
    console.error("❌ Error in matching test:", error);
  }
}

// Run the test
runMatchingTest();