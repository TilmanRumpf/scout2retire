import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const nsTowns = [
  'Lunenburg', 'Mahone Bay', "Peggy's Cove", 'Chester',
  'Annapolis Royal', 'Digby', 'Yarmouth', 'Bridgewater',
  'Truro', 'Lockeport'
];

let sqlStatements = [];

async function queryAndBackfillTown(townName) {
  console.log('\n' + '='.repeat(80));
  console.log(`🔍 QUERYING: ${townName}`);
  console.log('='.repeat(80) + '\n');

  const { data, error } = await supabase
    .from('towns')
    .select('*')
    .eq('name', townName)
    .limit(1);

  if (error || !data || data.length === 0) {
    console.log(`❌ NOT FOUND: ${townName}\n`);
    return;
  }

  const town = data[0];

  console.log(`Current data for ${townName}:`);
  console.log(`  Region: ${town.region || 'NULL'}`);
  console.log(`  Image: ${town.image_url_1 || 'NULL'}`);
  console.log(`  Description: ${town.description ? 'YES' : 'NULL'}`);
  console.log(`  Regions array: ${town.regions ? town.regions.length + ' items' : 'NULL'}`);
  console.log(`  Activities: ${town.activities_available ? town.activities_available.length + ' items' : 'NULL'}`);
  console.log(`  Climate: ${town.summer_climate_actual || 'NULL'}`);
  console.log(`  Cost: ${town.typical_monthly_living_cost || 'NULL'}`);
  console.log('');

  // Build UPDATE statement with Halifax patterns
  const updates = [];

  // Always set region to Nova Scotia
  updates.push(`region = 'Nova Scotia'`);

  // Halifax exact arrays
  if (!town.regions || town.regions.length === 0) {
    updates.push(`regions = '{Canada,"Atlantic Canada",Maritime,"Atlantic Ocean",Coastal,NATO,Commonwealth,G7,G20,OECD,Anglo-America,"North America"}'`);
  }

  if (!town.activities_available || town.activities_available.length === 0) {
    updates.push(`activities_available = '{adventure_activities,architectural_photography,baking,beach_walking,bird_watching,blogging,board_games,boating,book_clubs,cafe_hopping,card_games,chess,coastal_photography,cooking,cooking_experiments,crafts,crossword_puzzles,drawing,fishing_charters,gardening,hiking,historical_tours,home_workouts,indoor_plants,journaling,knitting,landmark_visits,language_learning,meditation,music_listening,nature_excursions,nature_walks,online_courses,online_yoga,outdoor_lifestyle,outdoor_sports,painting,pedestrian_friendly,photography,picnics,podcasts,reading,recipe_collecting,sailing,sailing_lessons,seaside_dining,sewing,sketching,socializing,star_gazing,streaming,stretching,sudoku,trail_photography,video_calls,video_gaming,volunteering,walking,walking_lifestyle,writing,yacht_clubs,yacht_watching}'`);
  }

  if (!town.interests_supported || town.interests_supported.length === 0) {
    updates.push(`interests_supported = '{arts,beach_lifestyle,coastal_living,coffee_culture,community,cooking,craft_beer,crafts,creative,culinary,cultural,dance,design,digital_nomad,dining,diving,entertainment,entrepreneurship,events,expat_community,family_friendly,fashion,festivals,film,fishing,fitness,four_seasons,gaming,gardening,golf,healthcare,healthy_living,heritage,history,island_hopping,languages,learning,lgbtq_friendly,literature,marine_life,maritime_culture,mindfulness,minimalism,moderate_climate,multicultural,music,networking,nightlife,ocean_sports,outdoor_sports,painting,personal_growth,philosophy,photography,reading,remote_work,safety,sailing,science,seaside_dining,seasonal_activities,shopping,singles_scene,slow_living,social,spirituality,sports_watching,surfing,sustainable_living,swimming,technology,tennis,theater,volunteering,water_sports,wellness,wine,wine_culture,winter_sports,writing}'`);
  }

  if (!town.languages_spoken || town.languages_spoken.length === 0) {
    updates.push(`languages_spoken = '{English}'`);
  }

  if (!town.geographic_features_actual || town.geographic_features_actual.length === 0) {
    const isHarbor = ['Lunenburg', 'Mahone Bay', 'Chester'].includes(townName);
    updates.push(isHarbor ? `geographic_features_actual = '{coastal,harbor}'` : `geographic_features_actual = '{coastal,plains}'`);
  }

  if (!town.vegetation_type_actual || town.vegetation_type_actual.length === 0) {
    updates.push(`vegetation_type_actual = '{forest}'`);
  }

  // Climate
  if (!town.summer_climate_actual) {
    updates.push(`summer_climate_actual = 'mild'`);
    updates.push(`winter_climate_actual = 'cold'`);
    updates.push(`humidity_level_actual = 'balanced'`);
    updates.push(`sunshine_level_actual = 'balanced'`);
    updates.push(`precipitation_level_actual = 'less_dry'`);
    updates.push(`seasonal_variation_actual = 'extreme'`);
    updates.push(`avg_temp_summer = 20`);
    updates.push(`avg_temp_winter = -4`);
    updates.push(`annual_rainfall = 900`);
    updates.push(`sunshine_hours = 2060`);
  }

  // Lifestyle
  if (!town.pace_of_life_actual) {
    updates.push(`pace_of_life_actual = 'moderate'`);
    updates.push(`urban_rural_character = 'suburban'`);
    updates.push(`expat_community_size = 'small'`);
    updates.push(`english_proficiency_level = 'native'`);
    updates.push(`primary_language = 'English'`);
    updates.push(`retirement_community_presence = 'minimal'`);
  }

  // Costs
  if (!town.typical_monthly_living_cost) {
    const isUpscale = ['Lunenburg', 'Chester', 'Mahone Bay'].includes(townName);
    const isInland = ['Bridgewater', 'Truro'].includes(townName);
    const cost = isUpscale ? 3200 : (isInland ? 2600 : 2800);
    const rent = isUpscale ? 1500 : (isInland ? 1100 : 1200);
    const meal = isUpscale ? 25 : (isInland ? 18 : 20);
    const groceries = isUpscale ? 350 : (isInland ? 280 : 300);
    const utilities = isUpscale ? 130 : (isInland ? 110 : 120);

    updates.push(`typical_monthly_living_cost = ${cost}`);
    updates.push(`rent_1bed = ${rent}`);
    updates.push(`meal_cost = ${meal}`);
    updates.push(`groceries_cost = ${groceries}`);
    updates.push(`utilities_cost = ${utilities}`);
  }

  // Scores
  if (!town.healthcare_score) {
    const healthScore = ['Bridgewater', 'Truro'].includes(townName) ? 7 : 8;
    const safetyScore = ['Bridgewater', 'Truro'].includes(townName) ? 8 : 9;
    updates.push(`healthcare_score = ${healthScore}`);
    updates.push(`safety_score = ${safetyScore}`);
    updates.push(`quality_of_life = ${healthScore}`);
  }

  // Infrastructure
  updates.push(`walkability = 7`);
  updates.push(`beaches_nearby = true`);
  updates.push(`requires_car = true`);
  updates.push(`has_public_transit = false`);
  updates.push(`internet_speed = 100`);
  updates.push(`healthcare_specialties_available = '{cardiology,oncology,orthopedics,"general surgery"}'`);
  updates.push(`retirement_visa_available = true`);
  updates.push(`visa_requirements = '"90-day visa-free for US citizens, retirement visa available with $2,000/month income"'`);

  // Water bodies (town-specific)
  const waterBodies = {
    'Lunenburg': '{"Atlantic Ocean","Lunenburg Bay"}',
    'Mahone Bay': '{"Atlantic Ocean","Mahone Bay"}',
    "Peggy's Cove": '{"Atlantic Ocean","St. Margarets Bay"}',
    'Chester': '{"Atlantic Ocean","Mahone Bay"}',
    'Annapolis Royal': '{"Atlantic Ocean","Annapolis Basin"}',
    'Digby': '{"Atlantic Ocean","Annapolis Basin"}',
    'Yarmouth': '{"Atlantic Ocean","Yarmouth Harbour"}',
    'Bridgewater': '{"LaHave River"}',
    'Truro': '{"Bay of Fundy","Cobequid Bay"}',
    'Lockeport': '{"Atlantic Ocean"}'
  };

  if (waterBodies[townName]) {
    updates.push(`water_bodies = '${waterBodies[townName]}'`);
  }

  // Build SQL
  const sql = `UPDATE towns\nSET ${updates.join(',\n    ')}\nWHERE town_name = '${townName.replace("'", "''")}';`;

  sqlStatements.push(`\n-- ${townName}\n${sql}`);

  console.log(`✅ Generated UPDATE for ${townName} (${updates.length} fields)\n`);
}

async function processAllTowns() {
  console.log('🚀 STARTING ONE-BY-ONE BACKFILL FOR 10 NOVA SCOTIA TOWNS\n');

  for (const town of nsTowns) {
    await queryAndBackfillTown(town);
  }

  // Write SQL file
  const finalSQL = `-- ============================================================================
-- NOVA SCOTIA TOWNS - ONE-BY-ONE BACKFILL
-- Generated: ${new Date().toISOString()}
-- ============================================================================

${sqlStatements.join('\n\n')}

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT name, region,
       CASE WHEN image_url_1 IS NOT NULL THEN '✅' ELSE '❌' END as image,
       CASE WHEN regions IS NOT NULL THEN '✅' ELSE '❌' END as regions_arr,
       typical_monthly_living_cost as cost
FROM towns
WHERE name IN ('Lunenburg', 'Mahone Bay', 'Peggy''s Cove', 'Chester',
               'Annapolis Royal', 'Digby', 'Yarmouth', 'Bridgewater',
               'Truro', 'Lockeport')
ORDER BY name;
`;

  fs.writeFileSync('/Users/tilmanrumpf/Desktop/scout2retire/database-utilities/ONE-BY-ONE-NS-BACKFILL.sql', finalSQL);

  console.log('\n' + '='.repeat(80));
  console.log('✅ COMPLETE SQL FILE GENERATED: ONE-BY-ONE-NS-BACKFILL.sql');
  console.log('='.repeat(80) + '\n');
}

processAllTowns();
