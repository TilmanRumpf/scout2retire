import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log("🎯 Testing REAL Enhanced Matching Algorithm");
console.log("==========================================");

// Import and use the actual enhanced matching algorithm
async function testEnhancedMatching() {
  try {
    // Dynamic import to use the actual matching algorithm
    console.log("1. Importing enhanced matching algorithm...");
    const { getTopMatches } = await import('./src/utils/enhancedMatchingAlgorithm.js');
    console.log("✅ Algorithm imported successfully");
    
    // Get a test user
    console.log("\n2. Getting test user...");
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
    console.log(`   Regions: ${JSON.stringify(testUser.regions)}`);
    console.log(`   Summer Climate: ${JSON.stringify(testUser.summer_climate_preference)}`);
    console.log(`   Winter Climate: ${JSON.stringify(testUser.winter_climate_preference)}`);
    
    // Test the actual enhanced matching algorithm
    console.log("\n3. Running enhanced matching algorithm...");
    const startTime = Date.now();
    
    try {
      const matches = await getTopMatches(testUser.user_id, 10);
      const endTime = Date.now();
      
      console.log(`✅ Algorithm completed in ${endTime - startTime}ms`);
      console.log(`   Found ${matches.length} matches`);
      
      if (matches.length === 0) {
        console.log("\n❌ ZERO MATCHES FOUND!");
        console.log("This confirms the user is experiencing the bug.");
        
        // Let's debug why no matches were found
        console.log("\n4. DEBUGGING: Testing towns directly...");
        
        // Get a few towns and test them manually
        const { data: sampleTowns, error: townsError } = await supabase
          .from('towns')
          .select('*')
          .not('image_url_1', 'is', null)
          .limit(3);
          
        if (townsError) {
          console.error("Error getting sample towns:", townsError);
          return;
        }
        
        console.log(`Testing ${sampleTowns.length} towns manually...`);
        
        // Transform user data for manual testing
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
          culture_preferences: {
            expat_community_preference: testUser.expat_community_preference || [],
            language_comfort: testUser.language_comfort || {},
            cultural_importance: testUser.cultural_importance || {},
            lifestyle_preferences: testUser.lifestyle_preferences || {}
          },
          hobbies_preferences: {
            activities: testUser.activities || [],
            interests: testUser.interests || [],
            travel_frequency: testUser.travel_frequency || '',
            lifestyle_importance: testUser.lifestyle_importance || {}
          },
          admin_preferences: {
            healthcare_quality: testUser.healthcare_quality || [],
            health_considerations: testUser.health_considerations || {},
            insurance_importance: testUser.insurance_importance || [],
            safety_importance: testUser.safety_importance || [],
            emergency_services: testUser.emergency_services || [],
            political_stability: testUser.political_stability || [],
            tax_preference: testUser.tax_preference || [],
            government_efficiency: testUser.government_efficiency || [],
            visa_preference: testUser.visa_preference || [],
            stay_duration: testUser.stay_duration || [],
            residency_path: testUser.residency_path || [],
            property_tax_sensitive: testUser.property_tax_sensitive || false,
            sales_tax_sensitive: testUser.sales_tax_sensitive || false,
            income_tax_sensitive: testUser.income_tax_sensitive || false
          },
          budget_preferences: {
            total_monthly_budget: testUser.total_monthly_budget || 0,
            max_monthly_rent: testUser.max_monthly_rent || 0,
            max_home_price: testUser.max_home_price || 0,
            monthly_healthcare_budget: testUser.monthly_healthcare_budget || 0,
            mobility: testUser.mobility || {}
          },
          current_status: {
            citizenship: testUser.primary_citizenship || 'USA'
          }
        };
        
        // Import and test individual matching functions
        const { calculateEnhancedMatch } = await import('./src/utils/enhancedMatchingAlgorithm.js');
        
        for (const town of sampleTowns) {
          console.log(`\n--- Testing: ${town.name}, ${town.country} ---`);
          
          try {
            const result = await calculateEnhancedMatch(userPreferences, town);
            console.log(`Score: ${result.match_score}`);
            console.log(`Quality: ${result.match_quality}`);
            console.log("Top factors:");
            result.top_factors.slice(0, 3).forEach(factor => {
              console.log(`  - ${factor.factor}: ${factor.score}`);
            });
            
            if (result.warnings && result.warnings.length > 0) {
              console.log("Warnings:");
              result.warnings.forEach(warning => {
                console.log(`  ⚠️  ${warning}`);
              });
            }
          } catch (matchError) {
            console.error(`Error matching ${town.name}:`, matchError);
          }
        }
        
      } else {
        console.log("\n✅ MATCHES FOUND!");
        console.log("Top matches:");
        
        matches.slice(0, 5).forEach((match, index) => {
          console.log(`\n${index + 1}. ${match.town_name}, ${match.town_country}`);
          console.log(`   Score: ${match.match_score} (${match.match_quality})`);
          console.log(`   Top factors:`);
          match.top_factors.slice(0, 3).forEach(factor => {
            console.log(`     - ${factor.factor}: ${factor.score}`);
          });
        });
      }
    } catch (matchingError) {
      console.error("❌ Error in enhanced matching algorithm:", matchingError);
      console.error("Stack trace:", matchingError.stack);
      
      // This might reveal the actual error causing zero matches
      if (matchingError.message.includes('getTopMatches')) {
        console.log("\n🔍 Detected error in getTopMatches function");
      }
      if (matchingError.message.includes('user_preferences')) {
        console.log("\n🔍 Detected error related to user_preferences table");
      }
      if (matchingError.message.includes('towns')) {
        console.log("\n🔍 Detected error related to towns table");
      }
    }
    
  } catch (error) {
    console.error("❌ Critical error:", error);
    console.error("Stack trace:", error.stack);
  }
}

// Also test the photo filtering issue
async function testPhotoFiltering() {
  console.log("\n===========================================");
  console.log("🖼️  Testing Photo Filtering Issue");
  console.log("===========================================");
  
  try {
    // Check total towns vs towns with photos
    const { data: allTowns, error: allError } = await supabase
      .from('towns')
      .select('id, name, country, image_url_1, image_url_2, image_url_3');
      
    if (allError) {
      console.error("Error getting all towns:", allError);
      return;
    }
    
    const townsWithPhotos = allTowns.filter(t => t.image_url_1 || t.image_url_2 || t.image_url_3);
    const townsWithImage1 = allTowns.filter(t => t.image_url_1);
    
    console.log(`Total towns: ${allTowns.length}`);
    console.log(`Towns with any photo: ${townsWithPhotos.length}`);
    console.log(`Towns with image_url_1: ${townsWithImage1.length}`);
    console.log(`Percentage with photos: ${((townsWithImage1.length / allTowns.length) * 100).toFixed(1)}%`);
    
    if (townsWithImage1.length < 50) {
      console.log("\n❌ CRITICAL ISSUE: Too few towns have photos!");
      console.log("The enhanced matching algorithm filters for .not('image_url_1', 'is', null)");
      console.log("This is eliminating most towns from consideration.");
      console.log("\nRecommendation: Remove or modify the photo filter in getTopMatches()");
    }
    
    // Check if photo import is needed
    console.log("\nSample towns without photos:");
    allTowns.filter(t => !t.image_url_1).slice(0, 5).forEach(town => {
      console.log(`  - ${town.name}, ${town.country}`);
    });
    
  } catch (error) {
    console.error("Error testing photo filtering:", error);
  }
}

// Run both tests
testEnhancedMatching().then(() => {
  return testPhotoFiltering();
}).then(() => {
  console.log("\n🎯 Analysis complete. Check output above for issues.");
});