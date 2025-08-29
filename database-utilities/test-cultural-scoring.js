/**
 * Test cultural scoring with _rating fields
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Simulate the cultural scoring logic from enhancedMatchingAlgorithm.js
function testCulturalScoring(town, preferences) {
  const factors = [];
  let score = 0;
  
  // Test DINING & NIGHTLIFE
  const diningImportance = preferences.cultural_importance?.dining_nightlife || 1;
  
  if (diningImportance === 1) {
    score += 10;
    factors.push({ factor: 'Flexible on dining & nightlife', score: 10 });
  } else if (town.restaurants_rating && town.nightlife_rating) {
    // Average the two ratings for comparison
    const townDiningNightlife = Math.round((town.restaurants_rating + town.nightlife_rating) / 2);
    const difference = Math.abs(diningImportance - townDiningNightlife);
    let points = 0;
    
    if (difference === 0) {
      points = 10; // Exact match
      factors.push({ factor: 'Dining & nightlife perfectly matched', score: 10 });
    } else if (difference === 1) {
      points = 7;  // Adjacent
      factors.push({ factor: 'Dining & nightlife good match', score: 7 });
    } else if (difference === 2) {
      points = 4;  // Near
      factors.push({ factor: 'Dining & nightlife acceptable', score: 4 });
    } else {
      factors.push({ factor: 'Dining & nightlife mismatch', score: 0 });
    }
    
    score += points;
  } else {
    score += 5;
    factors.push({ factor: 'Dining & nightlife data unavailable', score: 5 });
  }
  
  // Test CULTURAL EVENTS
  const eventsImportance = preferences.cultural_importance?.cultural_events || 1;
  
  if (eventsImportance === 1) {
    score += 10;
    factors.push({ factor: 'Flexible on cultural events', score: 10 });
  } else if (town.cultural_events_rating) {
    const difference = Math.abs(eventsImportance - town.cultural_events_rating);
    let points = 0;
    
    if (difference === 0) {
      points = 10;
      factors.push({ factor: 'Cultural events perfectly matched', score: 10 });
    } else if (difference === 1) {
      points = 7;
      factors.push({ factor: 'Cultural events good match', score: 7 });
    } else if (difference === 2) {
      points = 4;
      factors.push({ factor: 'Cultural events acceptable', score: 4 });
    } else {
      factors.push({ factor: 'Cultural events mismatch', score: 0 });
    }
    
    score += points;
  } else {
    score += 5;
    factors.push({ factor: 'Cultural events data unavailable', score: 5 });
  }
  
  // Test MUSEUMS
  const museumsImportance = preferences.cultural_importance?.museums || 1;
  
  if (museumsImportance === 1) {
    score += 10;
    factors.push({ factor: 'Flexible on museums & arts', score: 10 });
  } else if (town.museums_rating) {
    const difference = Math.abs(museumsImportance - town.museums_rating);
    let points = 0;
    
    if (difference === 0) {
      points = 10;
      factors.push({ factor: 'Museums & arts perfectly matched', score: 10 });
    } else if (difference === 1) {
      points = 7;
      factors.push({ factor: 'Museums & arts good match', score: 7 });
    } else if (difference === 2) {
      points = 4;
      factors.push({ factor: 'Museums & arts acceptable', score: 4 });
    } else {
      factors.push({ factor: 'Museums & arts mismatch', score: 0 });
    }
    
    score += points;
  } else {
    score += 5;
    factors.push({ factor: 'Museums & arts data unavailable', score: 5 });
  }
  
  return { score, factors };
}

async function runTests() {
  console.log('🧪 Testing cultural scoring with _rating fields...\n');
  
  // Get a sample town with all rating fields
  const { data: sampleTown, error } = await supabase
    .from('towns')
    .select('id, name, museums_rating, cultural_events_rating, restaurants_rating, nightlife_rating')
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
  
  // Test Case 1: User with high cultural preferences
  console.log('📝 Test Case 1: User with HIGH cultural preferences');
  const highCulturalPrefs = {
    cultural_importance: {
      museums: 5,
      cultural_events: 5,
      dining_nightlife: 5
    }
  };
  
  const result1 = testCulturalScoring(sampleTown, highCulturalPrefs);
  console.log(`  Total score: ${result1.score}/30 points`);
  result1.factors.forEach(f => console.log(`  - ${f.factor}: ${f.score}`));
  console.log();
  
  // Test Case 2: User with low cultural preferences
  console.log('📝 Test Case 2: User with LOW cultural preferences');
  const lowCulturalPrefs = {
    cultural_importance: {
      museums: 1,
      cultural_events: 1,
      dining_nightlife: 1
    }
  };
  
  const result2 = testCulturalScoring(sampleTown, lowCulturalPrefs);
  console.log(`  Total score: ${result2.score}/30 points`);
  result2.factors.forEach(f => console.log(`  - ${f.factor}: ${f.score}`));
  console.log();
  
  // Test Case 3: Dining/Nightlife averaging
  console.log('📝 Test Case 3: Dining/Nightlife averaging test');
  const avgDiningNightlife = Math.round((sampleTown.restaurants_rating + sampleTown.nightlife_rating) / 2);
  console.log(`  Restaurants: ${sampleTown.restaurants_rating}`);
  console.log(`  Nightlife: ${sampleTown.nightlife_rating}`);
  console.log(`  Average for comparison: ${avgDiningNightlife}`);
  console.log();
  
  // Test with multiple towns to ensure no errors
  console.log('🔍 Testing multiple towns for errors...');
  const { data: multipleTowns, error: multiError } = await supabase
    .from('towns')
    .select('id, name, museums_rating, cultural_events_rating, restaurants_rating, nightlife_rating')
    .limit(10);
  
  if (multiError) {
    console.error('❌ Error fetching towns:', multiError);
    return;
  }
  
  let errorCount = 0;
  multipleTowns.forEach(town => {
    try {
      const testResult = testCulturalScoring(town, highCulturalPrefs);
      if (testResult.score < 0 || testResult.score > 30) {
        console.error(`❌ Invalid score for ${town.name}: ${testResult.score}`);
        errorCount++;
      }
    } catch (err) {
      console.error(`❌ Error testing ${town.name}:`, err.message);
      errorCount++;
    }
  });
  
  if (errorCount === 0) {
    console.log(`✅ All ${multipleTowns.length} towns tested successfully!`);
  } else {
    console.log(`❌ ${errorCount} errors found`);
  }
  
  console.log('\n🎉 Cultural scoring test complete!');
}

runTests();