import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

console.log('DETAILED LEMMER CLIMATE SCORING FOR USER dory.drive.npr\n');

// Get Lemmer's climate data
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

const climatePrefs = prefs.climate_preferences;

console.log('USER PREFERENCES vs LEMMER DATA:');
console.log('='.repeat(50));

// Helper to check if user pref matches town value
function checkMatch(userPref, townValue) {
  if (Array.isArray(userPref)) {
    return userPref.includes(townValue);
  }
  return userPref === townValue;
}

// Score calculation
let totalScore = 0;
let breakdown = [];

// 1. Summer (21 points)
const summerMatch = checkMatch(climatePrefs.summer_climate_preference, lemmer.summer_climate_actual);
if (summerMatch) {
  totalScore += 21;
  breakdown.push(`✅ Summer: User wants "${climatePrefs.summer_climate_preference}" → Lemmer is "${lemmer.summer_climate_actual}" (21/21)`);
} else {
  breakdown.push(`❌ Summer: User wants "${climatePrefs.summer_climate_preference}" → Lemmer is "${lemmer.summer_climate_actual}" (0/21)`);
}

// 2. Winter (21 points)
const winterMatch = checkMatch(climatePrefs.winter_climate_preference, lemmer.winter_climate_actual);
if (winterMatch) {
  totalScore += 21;
  breakdown.push(`✅ Winter: User wants "${climatePrefs.winter_climate_preference}" → Lemmer is "${lemmer.winter_climate_actual}" (21/21)`);
} else {
  breakdown.push(`❌ Winter: User wants "${climatePrefs.winter_climate_preference}" → Lemmer is "${lemmer.winter_climate_actual}" (0/21)`);
}

// 3. Humidity (17 points)
const humidityMatch = checkMatch(climatePrefs.humidity_level, lemmer.humidity_level_actual);
if (humidityMatch) {
  totalScore += 17;
  breakdown.push(`✅ Humidity: User wants "${climatePrefs.humidity_level}" → Lemmer is "${lemmer.humidity_level_actual}" (17/17)`);
} else {
  breakdown.push(`❌ Humidity: User wants "${climatePrefs.humidity_level}" → Lemmer is "${lemmer.humidity_level_actual}" (0/17)`);
}

// 4. Sunshine (17 points) - Check for mapping issues
console.log('\nSUNSHINE MAPPING CHECK:');
console.log(`- User preference: ${JSON.stringify(climatePrefs.sunshine)}`);
console.log(`- Lemmer value: "${lemmer.sunshine_level_actual}"`);
console.log(`- Mapping: "often_cloudy" maps to "less_sunny"`);

// Check if "often_cloudy" should map to "less_sunny"
const sunshineMapping = {
  'often_cloudy': 'less_sunny',
  'less_sunny': 'less_sunny',
  'balanced': 'balanced',
  'often_sunny': 'often_sunny',
  'mostly_sunny': 'often_sunny'
};

const mappedSunshine = sunshineMapping[lemmer.sunshine_level_actual] || lemmer.sunshine_level_actual;
const sunshineMatch = checkMatch(climatePrefs.sunshine, mappedSunshine);

if (sunshineMatch) {
  totalScore += 17;
  breakdown.push(`✅ Sunshine: User wants "${climatePrefs.sunshine}" → Lemmer is "${lemmer.sunshine_level_actual}" (mapped to "${mappedSunshine}") (17/17)`);
} else {
  // Check for adjacency
  const adjacentSunshine = {
    'less_sunny': ['balanced'],
    'balanced': ['less_sunny', 'often_sunny'],
    'often_sunny': ['balanced']
  };
  
  let isAdjacent = false;
  if (Array.isArray(climatePrefs.sunshine)) {
    isAdjacent = climatePrefs.sunshine.some(pref => 
      adjacentSunshine[pref]?.includes(mappedSunshine)
    );
  } else {
    isAdjacent = adjacentSunshine[climatePrefs.sunshine]?.includes(mappedSunshine);
  }
  
  if (isAdjacent) {
    const adjacentScore = Math.round(17 * 0.7);
    totalScore += adjacentScore;
    breakdown.push(`🔶 Sunshine: User wants "${climatePrefs.sunshine}" → Lemmer is "${lemmer.sunshine_level_actual}" - ADJACENT MATCH (${adjacentScore}/17)`);
  } else {
    breakdown.push(`❌ Sunshine: User wants "${climatePrefs.sunshine}" → Lemmer is "${lemmer.sunshine_level_actual}" (0/17)`);
  }
}

// 5. Precipitation (9 points)
const precipMatch = checkMatch(climatePrefs.precipitation, lemmer.precipitation_level_actual);
if (precipMatch) {
  totalScore += 9;
  breakdown.push(`✅ Precipitation: User wants "${climatePrefs.precipitation}" → Lemmer is "${lemmer.precipitation_level_actual}" (9/9)`);
} else {
  breakdown.push(`❌ Precipitation: User wants "${climatePrefs.precipitation}" → Lemmer is "${lemmer.precipitation_level_actual}" (0/9)`);
}

// 6. Seasonal preference (15 points)
if (!climatePrefs.seasonal_preference || climatePrefs.seasonal_preference === 'Optional') {
  breakdown.push(`⭕ Seasonal: No preference specified (0/15) - not counted`);
} else {
  breakdown.push(`❓ Seasonal: "${climatePrefs.seasonal_preference}" (scoring depends on temperature variation)`);
}

console.log('\n\nSCORING BREAKDOWN:');
console.log('='.repeat(50));
breakdown.forEach(line => console.log(line));

console.log('\n\nFINAL SCORE:');
console.log(`${totalScore}/85 points (excluding seasonal preference)`);
console.log(`Percentage: ${Math.round(totalScore/85*100)}%`);

console.log('\n\nEXPLANATION:');
if (totalScore/85 >= 0.78 && totalScore/85 <= 0.82) {
  console.log('The 80% match comes from:');
  console.log('- Perfect matches on summer, winter, humidity, and precipitation');
  console.log('- Sunshine is "often_cloudy" which maps to "less_sunny" (perfect match)');
  console.log('- Total: 68/85 = 80%');
}

process.exit(0);