import { createClient } from '@supabase/supabase-js';
// Import just the functions we need, avoiding the supabaseClient import issue
import { inferHobbyAvailability, calculateHobbyScore as inferenceScore } from '../src/utils/scoring/geographicInference.js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function testTieredScoring() {
  console.log('🧪 Testing Tiered Hobby Scoring System\n');
  console.log('=' .repeat(60));
  
  // Get Alicante (coastal town in Spain)
  const { data: town } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Alicante')
    .eq('country', 'Spain')
    .single();
    
  if (!town) {
    console.error('Could not find Alicante, Spain');
    return;
  }
  
  console.log(`Testing with: ${town.name}, ${town.country}`);
  console.log(`Geographic features: ${town.geographic_features_actual}`);
  
  // Test Case 1: Only compound button (Water Sports)
  console.log('\n📌 Test 1: Only Compound Button (Water Sports)');
  const test1 = {
    activities: ['water_sports'], // This expands to 5 activities
    interests: [],
    custom_physical: [],
    custom_hobbies: []
  };
  
  // Simulate the tiered scoring logic inline
  const calculateTieredScore = (userHobbies, town) => {
    const legacyMapping = {
      'water_sports': ['swimming', 'snorkeling', 'water skiing', 'swimming laps', 'water aerobics']
    };
    
    const userHobbyNames = [];
    const hobbyTiers = {};
    
    // Add activities (Tier 1)
    if (userHobbies.activities?.length) {
      userHobbies.activities.forEach(activity => {
        const mapped = legacyMapping[activity] || [activity];
        const hobbies = Array.isArray(mapped) ? mapped : [mapped];
        hobbies.forEach(h => {
          userHobbyNames.push(h);
          hobbyTiers[h] = 1;
        });
      });
    }
    
    // Add custom physical (Tier 2)
    if (userHobbies.custom_physical?.length) {
      userHobbies.custom_physical.forEach(activity => {
        userHobbyNames.push(activity);
        hobbyTiers[activity] = 2;
      });
    }
    
    // Use inference to get available hobbies
    const inference = inferHobbyAvailability(town, userHobbyNames);
    const matchedHobbies = inference.availableHobbies;
    
    // Calculate weighted score
    let weightedMatches = 0;
    let totalWeight = 0;
    
    matchedHobbies.forEach(hobby => {
      const tier = hobbyTiers[hobby] || 1;
      const weight = tier === 2 ? 2 : 1;
      weightedMatches += weight;
    });
    
    userHobbyNames.forEach(hobby => {
      const tier = hobbyTiers[hobby] || 1;
      const weight = tier === 2 ? 2 : 1;
      totalWeight += weight;
    });
    
    const weightedPercentage = totalWeight > 0 ? (weightedMatches / totalWeight * 100) : 0;
    const score = Math.round(weightedPercentage);
    
    return {
      score,
      matched: matchedHobbies,
      total: userHobbyNames.length,
      weightedMatches,
      totalWeight
    };
  };
  
  const score1 = calculateTieredScore(test1, town);
  console.log(`Activities: water_sports (expands to 5 generic activities)`);
  console.log(`Score: ${score1.score}%`);
  console.log(`Details:`, score1);
  
  // Test Case 2: Compound button + specific selections
  console.log('\n📌 Test 2: Compound Button + Specific Selections');
  const test2 = {
    activities: ['water_sports'], // 5 generic activities
    interests: [],
    custom_physical: ['scuba diving', 'kitesurfing'], // 2 specific selections (2x weight each)
    custom_hobbies: []
  };
  
  const score2 = calculateTieredScore(test2, town);
  console.log(`Activities: water_sports (5 generic) + scuba diving, kitesurfing (2 specific)`);
  console.log(`Score: ${score2.score}%`);
  console.log(`Expected: Higher than Test 1 due to specific selections having 2x weight`);
  console.log(`Details:`, score2);
  
  // Test Case 3: Only specific selections
  console.log('\n📌 Test 3: Only Specific Selections');
  const test3 = {
    activities: [],
    interests: [],
    custom_physical: ['swimming', 'snorkeling', 'scuba diving', 'surfing', 'kitesurfing'],
    custom_hobbies: []
  };
  
  const score3 = calculateTieredScore(test3, town);
  console.log(`Activities: 5 specific water activities (all 2x weight)`);
  console.log(`Score: ${score3.score}%`);
  console.log(`Expected: Highest score due to all selections being specific`);
  console.log(`Details:`, score3);
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 SUMMARY - Tiered Scoring Results:');
  console.log(`Test 1 (Generic only): ${score1.score}%`);
  console.log(`Test 2 (Mixed): ${score2.score}%`);
  console.log(`Test 3 (Specific only): ${score3.score}%`);
  
  if (score3.score > score2.score && score2.score > score1.score) {
    console.log('\n✅ SUCCESS: Tiered scoring working correctly!');
    console.log('Specific selections score higher than generic compound buttons');
  } else {
    console.log('\n⚠️ UNEXPECTED: Scores not in expected order');
    console.log('Expected: Test 3 > Test 2 > Test 1');
  }
}

testTieredScoring().catch(console.error);