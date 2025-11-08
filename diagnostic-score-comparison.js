/**
 * DIAGNOSTIC SCRIPT: Compare Scoring Inputs
 *
 * This script will log EXACTLY what data is being passed to scoreTownsBatch
 * from both /favorites and /admin/algorithm to identify discrepancies
 */

// Add this console.log at the START of scoreTownsBatch function
// Location: src/utils/scoring/unifiedScoring.js line 329

/*
export const scoreTownsBatch = async (towns, userPreferences) => {
  // 🔍 DIAGNOSTIC LOGGING - START
  console.group('🔍 scoreTownsBatch called');
  console.log('Number of towns:', towns.length);
  console.log('First town:', towns[0]?.town_name, towns[0]?.id);

  console.log('User preferences structure:', {
    has_region_preferences: !!userPreferences.region_preferences,
    has_climate_preferences: !!userPreferences.climate_preferences,
    has_culture_preferences: !!userPreferences.culture_preferences,
    has_hobbies: !!userPreferences.hobbies,
    has_admin: !!userPreferences.administration,
    has_costs: !!userPreferences.costs,
    has_current_status: !!userPreferences.current_status
  });

  console.log('Climate preferences detail:', {
    full: userPreferences.climate_preferences,
    summer: userPreferences.climate_preferences?.summer_climate_preference,
    winter: userPreferences.climate_preferences?.winter_climate_preference,
    humidity: userPreferences.climate_preferences?.humidity_level,
    sunshine: userPreferences.climate_preferences?.sunshine,
    precipitation: userPreferences.climate_preferences?.precipitation,
    seasonal: userPreferences.climate_preferences?.seasonal_preference
  });

  console.log('Town climate data:', {
    summer_climate_actual: towns[0]?.summer_climate_actual,
    winter_climate_actual: towns[0]?.winter_climate_actual,
    avg_temp_summer: towns[0]?.avg_temp_summer,
    avg_temp_winter: towns[0]?.avg_temp_winter,
    humidity_level_actual: towns[0]?.humidity_level_actual,
    sunshine_level_actual: towns[0]?.sunshine_level_actual,
    precipitation_level_actual: towns[0]?.precipitation_level_actual,
    seasonal_variation_actual: towns[0]?.seasonal_variation_actual
  });

  console.log('Administration preferences:', {
    full: userPreferences.administration,
    healthcare_quality: userPreferences.administration?.healthcare_quality,
    safety_importance: userPreferences.administration?.safety_importance,
    visa_preference: userPreferences.administration?.visa_preference
  });

  console.log('Town admin data:', {
    healthcare_score: towns[0]?.healthcare_score,
    safety_score: towns[0]?.safety_score,
    visa_requirements: towns[0]?.visa_requirements
  });

  console.groupEnd();
  // 🔍 DIAGNOSTIC LOGGING - END

  return Promise.all(towns.map(town => scoreTown(town, userPreferences)));
};
*/

// INSTRUCTIONS:
// 1. Add the above logging to src/utils/scoring/unifiedScoring.js line 329
// 2. Open /favorites in one tab
// 3. Click "Refresh Scores" button
// 4. Open browser console (F12)
// 5. Copy ALL console output for /favorites
//
// 6. Open /admin/algorithm in another tab
// 7. Select same user + town (Gainesville)
// 8. Click "Test Scoring" button
// 9. Copy ALL console output for /admin/algorithm
//
// 10. Compare the two outputs side-by-side
//
// WHAT TO LOOK FOR:
// - Are userPreferences structures identical?
// - Are town data fields identical?
// - Are any fields undefined in one but not the other?
// - Are values different (e.g., temp values, preference strings)?

console.log('Diagnostic script created. See instructions above.');
