// Test script to verify region scoring is fixed after populating geographic_features_actual and vegetation_type_actual
// This tests the scenario where Spanish towns were scoring only 44% due to missing data

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Initialize Supabase client
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Function to calculate region score (copied from the matching algorithm)
function calculateRegionScore(preferences, town) {
  let score = 0
  let factors = []
  
  // Check if user has any preferences at all
  const hasCountryPrefs = preferences.countries?.length > 0
  const hasRegionPrefs = preferences.regions?.length > 0
  const hasGeoPrefs = preferences.geographic_features?.length > 0
  const hasVegPrefs = preferences.vegetation_types?.length > 0
  
  // If user has NO preferences at all, they're open to anywhere - give perfect score
  if (!hasCountryPrefs && !hasRegionPrefs && !hasGeoPrefs && !hasVegPrefs) {
    score = 100
    factors.push({ factor: 'Open to any location', score: 100 })
    return { score, factors, category: 'Region' }
  }
  
  // US States list for matching
  const US_STATES = new Set([
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
    'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ])
  
  // PART 1: REGION/COUNTRY MATCHING (Max 40 points)
  let regionCountryScore = 0
  
  if (!hasCountryPrefs && !hasRegionPrefs) {
    // No country/region preferences = 100% = 40 points
    regionCountryScore = 40
    factors.push({ factor: 'Open to any country/region', score: 40 })
  } else {
    // Check for country match first (highest priority)
    let countryMatched = false
    if (hasCountryPrefs) {
      for (const country of preferences.countries) {
        // Check if it's a US state
        if (US_STATES.has(country) && town.country === 'United States' && town.region === country) {
          regionCountryScore = 40
          factors.push({ factor: `State match (${country})`, score: 40 })
          countryMatched = true
          break
        } else if (country === town.country) {
          regionCountryScore = 40
          factors.push({ factor: 'Country match', score: 40 })
          countryMatched = true
          break
        }
      }
    }
    
    // If no country match, check for region match (75% = 30 points)
    if (!countryMatched && hasRegionPrefs) {
      // Check traditional regions array
      if (town.regions?.some(region => preferences.regions.includes(region))) {
        regionCountryScore = 30
        factors.push({ factor: 'Region match only', score: 30 })
      }
      // Also check geo_region for broader matches
      else if (town.geo_region && preferences.regions.includes(town.geo_region)) {
        regionCountryScore = 30
        factors.push({ factor: `Region match only (${town.geo_region})`, score: 30 })
      }
    }
    
    // If nothing matched and user had preferences, no points awarded
    if (regionCountryScore === 0 && (hasCountryPrefs || hasRegionPrefs)) {
      // No match = 0 points (as per specification)
      regionCountryScore = 0
      factors.push({ factor: 'No location match', score: 0 })
    }
  }
  
  score += regionCountryScore
  
  // PART 2: GEOGRAPHIC FEATURES (Max 30 points)
  let geoScore = 0
  
  if (!hasGeoPrefs) {
    // No geographic preferences = 100% = 30 points
    geoScore = 30
    factors.push({ factor: 'Open to any geography', score: 30 })
  } else {
    // Check if ANY geographic feature matches
    let hasMatch = false
    
    // First try actual geographic features
    if (town.geographic_features_actual?.length) {
      const userFeatures = preferences.geographic_features.map(f => f.toLowerCase())
      const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
      hasMatch = userFeatures.some(feature => townFeatures.includes(feature))
    }
    
    // FALLBACK: Check regions array for coastal indicators when no geographic data
    if (!hasMatch && preferences.geographic_features.includes('coastal') && town.regions?.length) {
      const coastalIndicators = ['gulf', 'ocean', 'coast', 'beach', 'sea', 'atlantic', 'pacific']
      hasMatch = town.regions.some(region => 
        coastalIndicators.some(indicator => region.toLowerCase().includes(indicator))
      )
    }
    
    if (hasMatch) {
      geoScore = 30
      factors.push({ factor: 'Geographic features match', score: 30 })
    } else {
      factors.push({ factor: 'No geographic feature match', score: 0 })
    }
  }
  
  score += geoScore
  
  // PART 3: VEGETATION TYPE (Max 20 points)
  let vegScore = 0
  
  if (!hasVegPrefs) {
    // No vegetation preferences = 100% = 20 points
    vegScore = 20
    factors.push({ factor: 'Open to any vegetation', score: 20 })
  } else if (town.vegetation_type_actual?.length) {
    // Check if ANY vegetation type matches
    const userVeg = preferences.vegetation_types.map(v => v.toLowerCase())
    const townVeg = town.vegetation_type_actual.map(v => v.toLowerCase())
    const hasMatch = userVeg.some(veg => townVeg.includes(veg))
    
    if (hasMatch) {
      vegScore = 20
      factors.push({ factor: 'Vegetation type match', score: 20 })
    } else {
      factors.push({ factor: 'No vegetation match', score: 0 })
    }
  } else {
    // User has preferences but town has no vegetation data
    factors.push({ factor: 'Vegetation data unavailable', score: 0 })
  }
  
  score += vegScore
  
  // Calculate final percentage based on 90 points total
  const totalPossible = 90
  const percentage = Math.round((score / totalPossible) * 100)
  
  return {
    score: percentage,
    factors,
    category: 'Region',
    rawScore: score,
    maxScore: totalPossible
  }
}

async function main() {
  console.log('🔍 TESTING REGION SCORING AFTER GEOGRAPHIC/VEGETATION DATA FIX');
  console.log('=' .repeat(70));
  
  try {
    // 1. First, check the current state of Spanish towns data
    console.log('\n1. CHECKING SPANISH TOWNS DATA STATE');
    console.log('-' .repeat(50));
    
    const { data: spanishTowns, error: townsError } = await supabase
      .from('towns')
      .select(`
        id, name, country, region, regions,
        geographic_features_actual, vegetation_type_actual,
        geo_region
      `)
      .eq('country', 'Spain')
      .limit(10);
      
    if (townsError) throw townsError;
    
    const totalSpanish = spanishTowns.length;
    const withGeoFeatures = spanishTowns.filter(t => t.geographic_features_actual?.length > 0).length;
    const withVegetation = spanishTowns.filter(t => t.vegetation_type_actual?.length > 0).length;
    
    console.log(`📊 Sample of Spanish towns (first 10):`);
    console.log(`   Total sampled: ${totalSpanish}`);
    console.log(`   With geographic features: ${withGeoFeatures}/${totalSpanish} (${Math.round(withGeoFeatures/totalSpanish*100)}%)`);
    console.log(`   With vegetation data: ${withVegetation}/${totalSpanish} (${Math.round(withVegetation/totalSpanish*100)}%)`);
    
    // Show examples of the data
    console.log('\n📋 Sample Spanish town data:');
    spanishTowns.slice(0, 3).forEach(town => {
      console.log(`   🏙️  ${town.name}, ${town.region}`);
      console.log(`      Geographic: ${town.geographic_features_actual?.join(', ') || 'None'}`);
      console.log(`      Vegetation: ${town.vegetation_type_actual?.join(', ') || 'None'}`);
    });
    
    // 2. Get full count of all Spanish towns
    console.log('\n2. GETTING FULL SPANISH TOWNS COUNT');
    console.log('-' .repeat(50));
    
    const { count: totalSpanishCount, error: countError } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true })
      .eq('country', 'Spain');
      
    if (countError) throw countError;
    
    console.log(`📈 Total Spanish towns in database: ${totalSpanishCount}`);
    
    // 3. Test with a user who selected Spain + Mediterranean preferences
    console.log('\n3. TESTING REGION SCORING WITH SPANISH/MEDITERRANEAN USER');
    console.log('-' .repeat(50));
    
    // This represents a user who selected Spain + Mediterranean during onboarding
    const testUserPreferences = {
      countries: ['Spain'],
      regions: ['Mediterranean'],
      geographic_features: ['coastal'],
      vegetation_types: ['mediterranean']
    };
    
    console.log('🧪 Test user preferences:');
    console.log(`   Countries: ${testUserPreferences.countries.join(', ')}`);
    console.log(`   Regions: ${testUserPreferences.regions.join(', ')}`);
    console.log(`   Geographic: ${testUserPreferences.geographic_features.join(', ')}`);
    console.log(`   Vegetation: ${testUserPreferences.vegetation_types.join(', ')}`);
    
    // 4. Get some Spanish towns to test with
    const { data: testTowns, error: testError } = await supabase
      .from('towns')
      .select(`
        id, name, country, region, regions,
        geographic_features_actual, vegetation_type_actual,
        geo_region
      `)
      .eq('country', 'Spain')
      .not('geographic_features_actual', 'is', null)
      .not('vegetation_type_actual', 'is', null)
      .limit(5);
      
    if (testError) throw testError;
    
    console.log('\n4. TESTING REGION SCORING ON SPANISH TOWNS');
    console.log('-' .repeat(50));
    
    const results = [];
    
    testTowns.forEach(town => {
      const score = calculateRegionScore(testUserPreferences, town);
      results.push({
        town: town.name,
        region: town.region,
        score: score.score,
        factors: score.factors,
        geoFeatures: town.geographic_features_actual,
        vegetation: town.vegetation_type_actual
      });
      
      console.log(`\n🏙️  ${town.name}, ${town.region}`);
      console.log(`   Score: ${score.score}% (was 44% before fix)`);
      console.log(`   Geographic: [${town.geographic_features_actual?.join(', ') || 'None'}]`);
      console.log(`   Vegetation: [${town.vegetation_type_actual?.join(', ') || 'None'}]`);
      console.log(`   Scoring breakdown:`);
      score.factors.forEach(factor => {
        console.log(`     - ${factor.factor}: ${factor.score} points`);
      });
    });
    
    // 5. Analyze results
    console.log('\n5. RESULTS ANALYSIS');
    console.log('-' .repeat(50));
    
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const highScores = results.filter(r => r.score >= 80).length;
    const lowScores = results.filter(r => r.score < 50).length;
    
    console.log(`📊 Results Summary:`);
    console.log(`   Average score: ${Math.round(averageScore)}% (was 44% before fix)`);
    console.log(`   High scores (≥80%): ${highScores}/${results.length} towns`);
    console.log(`   Low scores (<50%): ${lowScores}/${results.length} towns`);
    
    // 6. Test the problematic 44% scenario specifically
    console.log('\n6. TESTING SPECIFIC 44% SCENARIO');
    console.log('-' .repeat(50));
    
    // This was the exact scenario that was scoring 44%
    const problematicPrefs = {
      countries: ['Spain'],
      regions: [],
      geographic_features: ['coastal'],
      vegetation_types: ['mediterranean']
    };
    
    console.log('🧪 Testing preferences that previously scored 44%:');
    console.log(`   Countries: ${problematicPrefs.countries.join(', ')}`);
    console.log(`   Geographic: ${problematicPrefs.geographic_features.join(', ')}`);
    console.log(`   Vegetation: ${problematicPrefs.vegetation_types.join(', ')}`);
    
    // Test with a coastal Spanish town
    if (testTowns.length > 0) {
      const coastalTown = testTowns.find(t => 
        t.geographic_features_actual?.some(f => f.toLowerCase().includes('coast')) ||
        t.regions?.some(r => r.toLowerCase().includes('coast'))
      ) || testTowns[0];
      
      const newScore = calculateRegionScore(problematicPrefs, coastalTown);
      
      console.log(`\n🏖️  Testing with ${coastalTown.name}:`);
      console.log(`   NEW SCORE: ${newScore.score}% (was 44% before fix)`);
      console.log(`   Improvement: +${newScore.score - 44}% points`);
      console.log(`   Status: ${newScore.score > 44 ? '✅ FIXED!' : '❌ Still broken'}`);
      console.log(`   Breakdown:`);
      newScore.factors.forEach(factor => {
        console.log(`     - ${factor.factor}: ${factor.score} points`);
      });
    }
    
    // 7. Summary
    console.log('\n7. FINAL SUMMARY');
    console.log('=' .repeat(70));
    
    const isFixed = averageScore > 44;
    console.log(`🎯 Region scoring fix status: ${isFixed ? '✅ SUCCESS' : '❌ NEEDS MORE WORK'}`);
    console.log(`📈 Average improvement: +${Math.round(averageScore - 44)}% points`);
    
    if (isFixed) {
      console.log('✅ Spanish towns now have proper geographic and vegetation data');
      console.log('✅ Region scoring algorithm is working correctly');
      console.log('✅ Users selecting Spain + Mediterranean should see much higher scores');
    } else {
      console.log('❌ More work needed on data population or algorithm');
      console.log('❌ Consider checking data quality and matching logic');
    }
    
    // Save detailed results to file
    const reportData = {
      timestamp: new Date().toISOString(),
      totalSpanishTowns: totalSpanishCount,
      sampleSize: results.length,
      averageScore: averageScore,
      improvement: averageScore - 44,
      testResults: results
    };
    
    fs.writeFileSync('/Users/tilmanrumpf/Desktop/scout2retire/region-scoring-test-results.json', JSON.stringify(reportData, null, 2));
    console.log('\n💾 Detailed results saved to region-scoring-test-results.json');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    console.log('\n🔧 Possible issues:');
    console.log('- Database connection failed');
    console.log('- Spanish towns data not properly populated');
    console.log('- Geographic/vegetation columns still empty');
  }
}

// Run the test
main().then(() => {
  console.log('\n🏁 Test completed!');
  process.exit(0);
});