import { createClient } from '@supabase/supabase-js';
import { calculateClimateScore } from './src/utils/enhancedMatchingAlgorithm.js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfc3JvbGUiLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('RUNNING ACTUAL MATCHING ALGORITHM FOR LEMMER\n');

// Get Lemmer
const { data: lemmer } = await supabase
  .from('towns')
  .select('*')
  .eq('name', 'Lemmer')
  .single();

// Get user preferences
const { data: user } = await supabase
  .from('users')
  .select('id')
  .eq('email', 'dory.drive.npr@gmail.com')
  .single();

const { data: prefs } = await supabase
  .from('onboarding_responses')
  .select('climate_preferences')
  .eq('user_id', user.id)
  .single();

// Run the actual climate scoring function
const result = calculateClimateScore(prefs.climate_preferences, lemmer);

console.log('CLIMATE SCORE RESULT:');
console.log(`Score: ${result.score}/100`);
console.log('\nFactors:');
result.factors.forEach(f => {
  console.log(`- ${f.factor}: ${f.score} points`);
});

// Show what the algorithm sees
console.log('\n\nWHAT THE ALGORITHM SEES:');
console.log('User preferences:');
console.log('- Summer:', prefs.climate_preferences.summer_climate_preference);
console.log('- Winter:', prefs.climate_preferences.winter_climate_preference);
console.log('- Humidity:', prefs.climate_preferences.humidity_level);
console.log('- Sunshine:', prefs.climate_preferences.sunshine);
console.log('- Precipitation:', prefs.climate_preferences.precipitation);
console.log('\nLemmer data:');
console.log('- Summer:', lemmer.summer_climate_actual);
console.log('- Winter:', lemmer.winter_climate_actual);
console.log('- Humidity:', lemmer.humidity_level_actual);
console.log('- Sunshine:', lemmer.sunshine_level_actual);
console.log('- Precipitation:', lemmer.precipitation_level_actual);

process.exit(0);