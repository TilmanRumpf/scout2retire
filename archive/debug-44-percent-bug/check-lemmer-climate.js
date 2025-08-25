import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('CHECKING LEMMER CLIMATE MATCH FOR USER dory.drive.npr\n');

// Get Lemmer's climate data
const { data: lemmer } = await supabase
  .from('towns')
  .select('*')
  .eq('name', 'Lemmer')
  .single();

console.log('LEMMER CLIMATE DATA:');
console.log('- Summer climate:', lemmer.summer_climate_actual);
console.log('- Winter climate:', lemmer.winter_climate_actual);
console.log('- Humidity:', lemmer.humidity_level_actual);
console.log('- Sunshine:', lemmer.sunshine_level_actual);
console.log('- Precipitation:', lemmer.precipitation_level_actual);
console.log('- Summer temp:', lemmer.avg_temp_summer, '°C');
console.log('- Winter temp:', lemmer.avg_temp_winter, '°C');
console.log('- Annual rainfall:', lemmer.annual_rainfall, 'mm');
console.log('- Sunshine hours:', lemmer.sunshine_hours);

// Get user preferences
const { data: user } = await supabase
  .from('users')
  .select('id, email')
  .eq('email', 'dory.drive.npr@gmail.com')
  .single();

if (!user) {
  console.log('\nUser not found!');
  process.exit(1);
}

const { data: prefs } = await supabase
  .from('onboarding_responses')
  .select('climate_preferences')
  .eq('user_id', user.id)
  .single();

console.log('\n\nUSER CLIMATE PREFERENCES:');
console.log('- Summer preference:', prefs.climate_preferences.summer_climate_preference);
console.log('- Winter preference:', prefs.climate_preferences.winter_climate_preference);
console.log('- Humidity preference:', prefs.climate_preferences.humidity_level);
console.log('- Sunshine preference:', prefs.climate_preferences.sunshine);
console.log('- Precipitation preference:', prefs.climate_preferences.precipitation);
console.log('- Seasonal preference:', prefs.climate_preferences.seasonal_preference);

// Manual scoring breakdown
console.log('\n\nCLIMATE SCORING BREAKDOWN:');
console.log('Total possible: 100 points');
console.log('- Summer climate: 21 points');
console.log('- Winter climate: 21 points');
console.log('- Humidity: 17 points');
console.log('- Sunshine: 17 points');
console.log('- Precipitation: 9 points');
console.log('- Seasonal preference: 15 points');

// Check each match
console.log('\n\nMATCHING ANALYSIS:');

// Summer
if (prefs.climate_preferences.summer_climate_preference === lemmer.summer_climate_actual) {
  console.log('✅ Summer: PERFECT MATCH (21/21 points)');
} else {
  console.log(`❌ Summer: User wants "${prefs.climate_preferences.summer_climate_preference}", Lemmer is "${lemmer.summer_climate_actual}"`);
}

// Winter
if (prefs.climate_preferences.winter_climate_preference === lemmer.winter_climate_actual) {
  console.log('✅ Winter: PERFECT MATCH (21/21 points)');
} else {
  console.log(`❌ Winter: User wants "${prefs.climate_preferences.winter_climate_preference}", Lemmer is "${lemmer.winter_climate_actual}"`);
}

// Humidity
if (Array.isArray(prefs.climate_preferences.humidity_level)) {
  if (prefs.climate_preferences.humidity_level.includes(lemmer.humidity_level_actual)) {
    console.log('✅ Humidity: PERFECT MATCH (17/17 points)');
  } else {
    console.log(`❓ Humidity: User wants ${JSON.stringify(prefs.climate_preferences.humidity_level)}, Lemmer is "${lemmer.humidity_level_actual}"`);
  }
} else if (prefs.climate_preferences.humidity_level === lemmer.humidity_level_actual) {
  console.log('✅ Humidity: PERFECT MATCH (17/17 points)');
} else {
  console.log(`❓ Humidity: User wants "${prefs.climate_preferences.humidity_level}", Lemmer is "${lemmer.humidity_level_actual}"`);
}

// Sunshine
if (Array.isArray(prefs.climate_preferences.sunshine)) {
  if (prefs.climate_preferences.sunshine.includes(lemmer.sunshine_level_actual)) {
    console.log('✅ Sunshine: PERFECT MATCH (17/17 points)');
  } else {
    console.log(`❓ Sunshine: User wants ${JSON.stringify(prefs.climate_preferences.sunshine)}, Lemmer is "${lemmer.sunshine_level_actual}"`);
  }
} else if (prefs.climate_preferences.sunshine === lemmer.sunshine_level_actual) {
  console.log('✅ Sunshine: PERFECT MATCH (17/17 points)');
} else {
  console.log(`❓ Sunshine: User wants "${prefs.climate_preferences.sunshine}", Lemmer is "${lemmer.sunshine_level_actual}"`);
}

// Precipitation
if (Array.isArray(prefs.climate_preferences.precipitation)) {
  if (prefs.climate_preferences.precipitation.includes(lemmer.precipitation_level_actual)) {
    console.log('✅ Precipitation: PERFECT MATCH (9/9 points)');
  } else {
    console.log(`❓ Precipitation: User wants ${JSON.stringify(prefs.climate_preferences.precipitation)}, Lemmer is "${lemmer.precipitation_level_actual}"`);
  }
} else if (prefs.climate_preferences.precipitation === lemmer.precipitation_level_actual) {
  console.log('✅ Precipitation: PERFECT MATCH (9/9 points)');
} else {
  console.log(`❓ Precipitation: User wants "${prefs.climate_preferences.precipitation}", Lemmer is "${lemmer.precipitation_level_actual}"`);
}

// Check adjacency scoring
console.log('\n\nADJACENCY SCORING (70% for near matches):');
console.log('- Humidity: dry ↔ balanced, balanced ↔ humid');
console.log('- Sunshine: often_sunny ↔ balanced, balanced ↔ less_sunny');
console.log('- Precipitation: mostly_dry ↔ balanced, balanced ↔ often_rainy');

process.exit(0);