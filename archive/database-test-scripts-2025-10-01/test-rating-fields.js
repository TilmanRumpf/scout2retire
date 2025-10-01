/**
 * Test that algorithms work correctly with _rating fields
 */

import { createClient } from '@supabase/supabase-js';
import { calculateEnhancedMatch } from '../src/utils/scoring/enhancedMatchingAlgorithm.js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function testRatingFields() {
  console.log('🧪 Testing algorithm with _rating fields...\n');
  
  // Get a sample town with all rating fields
  const { data: sampleTown, error } = await supabase
    .from('towns')
    .select('*')
    .not('museums_rating', 'is', null)
    .not('cultural_events_rating', 'is', null)
    .not('restaurants_rating', 'is', null)
    .not('nightlife_rating', 'is', null)
    .limit(1)
    .single();
  
  if (error || !sampleTown) {
    console.error('❌ Could not fetch sample town:', error);
    return;
  }
  
  console.log(`📍 Testing with town: ${sampleTown.name}`);
  console.log(`  - museums_rating: ${sampleTown.museums_rating}`);
  console.log(`  - cultural_events_rating: ${sampleTown.cultural_events_rating}`);
  console.log(`  - restaurants_rating: ${sampleTown.restaurants_rating}`);
  console.log(`  - nightlife_rating: ${sampleTown.nightlife_rating}`);
  console.log();
  
  // Create test user preferences
  const testPreferences = {
    cultural_importance: {
      museums: 3,
      cultural_events: 4,
      dining_nightlife: 5
    },
    climate_preferences: {
      temperature_summer: 'warm',
      temperature_winter: 'mild'
    },
    budget: {
      max_monthly: 3000
    }
  };
  
  console.log('🧑 Test user preferences:');
  console.log(`  - Museums importance: ${testPreferences.cultural_importance.museums}`);
  console.log(`  - Cultural events importance: ${testPreferences.cultural_importance.cultural_events}`);
  console.log(`  - Dining/nightlife importance: ${testPreferences.cultural_importance.dining_nightlife}`);
  console.log();
  
  // Test the algorithm
  try {
    const result = await calculateEnhancedMatch(testPreferences, sampleTown);
    
    console.log('✅ Algorithm executed successfully!');
    console.log(`📊 Match score: ${result.score.toFixed(1)}%`);
    console.log('\n🎯 Cultural scoring breakdown:');
    
    // Find cultural-related factors
    result.factors.forEach(factor => {
      if (factor.factor.toLowerCase().includes('museum') ||
          factor.factor.toLowerCase().includes('cultural') ||
          factor.factor.toLowerCase().includes('dining') ||
          factor.factor.toLowerCase().includes('nightlife')) {
        console.log(`  - ${factor.factor}: ${factor.score} points`);
      }
    });
    
    // Check if the dining/nightlife averaging is working
    const avgDiningNightlife = Math.round((sampleTown.restaurants_rating + sampleTown.nightlife_rating) / 2);
    console.log(`\n📈 Dining/Nightlife averaging:`);
    console.log(`  - Restaurants: ${sampleTown.restaurants_rating}`);
    console.log(`  - Nightlife: ${sampleTown.nightlife_rating}`);
    console.log(`  - Average used for comparison: ${avgDiningNightlife}`);
    
  } catch (error) {
    console.error('❌ Algorithm error:', error.message);
    console.error(error.stack);
  }
}

testRatingFields();