import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log("🔍 COMPREHENSIVE SCOUT2RETIRE MATCHING ANALYSIS");
console.log("================================================");

// Reconstruct the enhanced matching algorithm locally to avoid module issues
const CATEGORY_WEIGHTS = {
  region: 20,
  climate: 15,
  culture: 15,
  hobbies: 10,
  admin: 20,
  budget: 20
};

function calculateArrayOverlap(userArray, townArray, maxScore = 100) {
  if (!userArray?.length || !townArray?.length) return 0;
  
  const userSet = new Set(userArray.map(item => item.toLowerCase()));
  const townSet = new Set(townArray.map(item => item.toLowerCase()));
  
  let matches = 0;
  for (const item of userSet) {
    if (townSet.has(item)) matches++;
  }
  
  return (matches / userSet.size) * maxScore;
}

function calculateRegionScore(preferences, town) {
  let score = 0;
  let factors = [];
  
  // Direct country match (40 points)
  if (preferences.countries?.includes(town.country)) {
    score += 40;
    factors.push({ factor: 'Exact country match', score: 40 });
  }
  // Region match (30 points)
  else if (preferences.regions?.some(region => 
    town.regions?.includes(region))) {
    score += 30;
    factors.push({ factor: 'Region match', score: 30 });
  }
  
  return {
    score: Math.min(score, 100),
    factors,
    category: 'Region'
  };
}

function calculateBudgetScore(preferences, town) {
  let score = 0;
  let factors = [];
  
  // Overall budget fit (40 points)
  const budget = preferences.total_monthly_budget;
  const cost = town.typical_monthly_living_cost || town.cost_index;
  
  if (budget && cost) {
    const budgetRatio = budget / cost;
    
    if (budgetRatio >= 1.5) {
      score += 40;
      factors.push({ factor: 'Comfortable budget margin', score: 40 });
    } else if (budgetRatio >= 1.2) {
      score += 30;
      factors.push({ factor: 'Good budget fit', score: 30 });
    } else if (budgetRatio >= 1.0) {
      score += 20;
      factors.push({ factor: 'Budget adequate', score: 20 });
    } else if (budgetRatio >= 0.8) {
      score += 10;
      factors.push({ factor: 'Budget tight but possible', score: 10 });
    } else {
      factors.push({ factor: 'Budget insufficient', score: 0 });
    }
  } else {
    factors.push({ factor: 'Missing budget or cost data', score: 0 });
  }
  
  return {
    score: Math.min(score, 100),
    factors,
    category: 'Budget'
  };
}

async function calculateSimplifiedMatch(userPreferences, town) {
  // Test basic scoring components
  const regionResult = calculateRegionScore(userPreferences.region_preferences || {}, town);
  const budgetResult = calculateBudgetScore(userPreferences.budget_preferences || {}, town);
  
  // Add basic climate scoring
  let climateScore = 0;
  let climateFactors = [];
  
  const summerPref = userPreferences.climate_preferences?.summer_climate_preference;
  if (summerPref && summerPref.length > 0) {
    if (town.summer_climate_actual && summerPref.includes(town.summer_climate_actual)) {
      climateScore = 70;
      climateFactors.push({ factor: `Summer climate match: ${town.summer_climate_actual}`, score: 70 });
    } else {
      climateFactors.push({ factor: `No summer climate match: wanted ${summerPref.join(',')}, town has ${town.summer_climate_actual || 'unknown'}`, score: 0 });
    }
  } else {
    climateScore = 35; // No preference = partial credit
    climateFactors.push({ factor: 'No summer climate preference', score: 35 });
  }
  
  // Calculate weighted total score
  let totalScore = (
    (regionResult.score * CATEGORY_WEIGHTS.region / 100) +
    (climateScore * CATEGORY_WEIGHTS.climate / 100) +
    (budgetResult.score * CATEGORY_WEIGHTS.budget / 100) +
    (50 * CATEGORY_WEIGHTS.culture / 100) + // Default culture score
    (50 * CATEGORY_WEIGHTS.hobbies / 100) + // Default hobbies score
    (50 * CATEGORY_WEIGHTS.admin / 100)     // Default admin score
  );
  
  // Compile all factors
  const allFactors = [
    ...regionResult.factors,
    ...climateFactors,
    ...budgetResult.factors
  ];
  
  return {
    town_id: town.id,
    town_name: town.name,
    town_country: town.country,
    match_score: Math.round(totalScore),
    category_scores: {
      region: Math.round(regionResult.score),
      climate: Math.round(climateScore),
      budget: Math.round(budgetResult.score)
    },
    match_factors: allFactors,
    top_factors: allFactors.sort((a, b) => b.score - a.score).slice(0, 5)
  };
}

async function runCompleteAnalysis() {
  try {
    console.log("\n1. GETTING USERS WITH COMPLETED ONBOARDING...");
    const { data: completedUsers, error: usersError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('onboarding_completed', true);
      
    if (usersError) {
      console.error("❌ Cannot get users:", usersError);
      return;
    }
    
    console.log(`✅ Found ${completedUsers.length} users with completed onboarding`);
    
    if (completedUsers.length === 0) {
      console.log("❌ CRITICAL: No users have completed onboarding!");
      console.log("This could be why users see zero matches.");
      return;
    }
    
    // Test with each completed user
    for (let i = 0; i < Math.min(completedUsers.length, 2); i++) {
      const testUser = completedUsers[i];
      console.log(`\n${'='.repeat(50)}`);
      console.log(`TESTING USER ${i + 1}: ${testUser.user_id}`);
      console.log(`${'='.repeat(50)}`);
      
      console.log("User preferences:");
      console.log(`  Budget: $${testUser.total_monthly_budget}`);
      console.log(`  Countries: ${JSON.stringify(testUser.countries)}`);
      console.log(`  Regions: ${JSON.stringify(testUser.regions)}`);
      console.log(`  Summer Climate: ${JSON.stringify(testUser.summer_climate_preference)}`);
      console.log(`  Winter Climate: ${JSON.stringify(testUser.winter_climate_preference)}`);
      
      // Transform user data to expected format
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
      
      // Test against towns WITHOUT photo filter first
      console.log("\n--- Testing WITHOUT photo filter ---");
      const { data: allTowns, error: allTownsError } = await supabase
        .from('towns')
        .select('*')
        .limit(20);
        
      if (allTownsError) {
        console.error("Error getting all towns:", allTownsError);
        continue;
      }
      
      console.log(`Testing against ${allTowns.length} towns (no photo filter)...`);
      
      const allMatches = await Promise.all(
        allTowns.map(town => calculateSimplifiedMatch(userPreferences, town))
      );
      
      allMatches.sort((a, b) => b.match_score - a.match_score);
      const topAllMatches = allMatches.slice(0, 5);
      
      console.log("Top 5 matches (no photo filter):");
      topAllMatches.forEach((match, index) => {
        console.log(`  ${index + 1}. ${match.town_name}, ${match.town_country} - Score: ${match.match_score}`);
        console.log(`     Budget: ${match.category_scores.budget}, Region: ${match.category_scores.region}, Climate: ${match.category_scores.climate}`);
      });
      
      // Test against towns WITH photo filter
      console.log("\n--- Testing WITH photo filter (current implementation) ---");
      const { data: townsWithPhotos, error: photosError } = await supabase
        .from('towns')
        .select('*')
        .not('image_url_1', 'is', null)
        .limit(20);
        
      if (photosError) {
        console.error("Error getting towns with photos:", photosError);
        continue;
      }
      
      console.log(`Testing against ${townsWithPhotos.length} towns (with photo filter)...`);
      
      if (townsWithPhotos.length === 0) {
        console.log("❌ NO TOWNS WITH PHOTOS FOUND!");
        console.log("This is likely the root cause of zero matches.");
        continue;
      }
      
      const photoMatches = await Promise.all(
        townsWithPhotos.map(town => calculateSimplifiedMatch(userPreferences, town))
      );
      
      photoMatches.sort((a, b) => b.match_score - a.match_score);
      const topPhotoMatches = photoMatches.slice(0, 5);
      
      console.log("Top 5 matches (with photo filter):");
      if (topPhotoMatches.length === 0) {
        console.log("❌ NO MATCHES WITH PHOTOS!");
      } else {
        topPhotoMatches.forEach((match, index) => {
          console.log(`  ${index + 1}. ${match.town_name}, ${match.town_country} - Score: ${match.match_score}`);
          console.log(`     Budget: ${match.category_scores.budget}, Region: ${match.category_scores.region}, Climate: ${match.category_scores.climate}`);
        });
      }
      
      // Analysis of the differences
      console.log("\n--- ANALYSIS ---");
      console.log(`Available towns: ${allTowns.length} total, ${townsWithPhotos.length} with photos`);
      console.log(`Match reduction: ${((1 - townsWithPhotos.length / allTowns.length) * 100).toFixed(1)}% of towns eliminated by photo filter`);
      
      if (topAllMatches.length > 0 && topPhotoMatches.length === 0) {
        console.log("🚨 ISSUE IDENTIFIED: Photo filter eliminates ALL possible matches!");
        console.log("Root cause: .not('image_url_1', 'is', null) filter in getTopMatches()");
      }
    }
    
    // Final recommendation
    console.log("\n" + "=".repeat(60));
    console.log("🎯 ANALYSIS COMPLETE - RECOMMENDATIONS:");
    console.log("=".repeat(60));
    
    console.log("\n1. PHOTO FILTER ISSUE:");
    const { data: photoStats } = await supabase
      .from('towns')
      .select('id, image_url_1');
    
    const totalTowns = photoStats.length;
    const townsWithPhotos = photoStats.filter(t => t.image_url_1).length;
    const photoPercentage = ((townsWithPhotos / totalTowns) * 100).toFixed(1);
    
    console.log(`   - Only ${townsWithPhotos}/${totalTowns} towns (${photoPercentage}%) have photos`);
    
    if (photoPercentage < 30) {
      console.log("   ❌ CRITICAL: Photo filter is too restrictive!");
      console.log("   💡 SOLUTION: Remove .not('image_url_1', 'is', null) from getTopMatches()");
      console.log("   💡 OR: Run photo import script to add more photos");
    }
    
    console.log("\n2. DATA COMPLETENESS:");
    const sampleTown = photoStats[0];
    if (sampleTown) {
      const { data: townDetail } = await supabase
        .from('towns')
        .select('*')
        .eq('id', sampleTown.id)
        .single();
      
      const missingFields = [];
      const criticalFields = ['summer_climate_actual', 'winter_climate_actual', 'typical_monthly_living_cost', 'healthcare_score', 'safety_score'];
      
      criticalFields.forEach(field => {
        if (!townDetail[field]) missingFields.push(field);
      });
      
      if (missingFields.length > 0) {
        console.log(`   ⚠️  Towns missing critical data: ${missingFields.join(', ')}`);
        console.log("   💡 SOLUTION: Update town data or modify matching algorithm to handle missing data");
      }
    }
    
    console.log("\n3. USER DATA QUALITY:");
    const usersWithCountries = completedUsers.filter(u => u.countries && u.countries.length > 0).length;
    const usersWithBudget = completedUsers.filter(u => u.total_monthly_budget > 0).length;
    
    console.log(`   - ${usersWithCountries}/${completedUsers.length} users have country preferences`);
    console.log(`   - ${usersWithBudget}/${completedUsers.length} users have budget set`);
    
    if (usersWithCountries < completedUsers.length * 0.5) {
      console.log("   ⚠️  Many users have no country preferences - algorithm may need to be more flexible");
    }
    
  } catch (error) {
    console.error("❌ Critical error in analysis:", error);
  }
}

// Run the analysis
runCompleteAnalysis();