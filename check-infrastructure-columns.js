import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkInfrastructureColumns() {
  console.log('🏗️ CHECKING INFRASTRUCTURE COLUMNS IN TOWNS TABLE\n');
  console.log('================================================\n');
  
  // Get a sample town to see all columns
  const { data: sampleTown, error } = await supabase
    .from('towns')
    .select('*')
    .limit(1)
    .single();
    
  if (error) {
    console.error('Error fetching sample:', error);
    return;
  }
  
  // Find all infrastructure-related columns
  const infrastructureColumns = [];
  const columnNames = Object.keys(sampleTown);
  
  columnNames.forEach(col => {
    if (col.includes('count') || col.includes('nearby') || col.includes('facilities') || 
        col.includes('trails') || col.includes('km') || col.includes('resorts') ||
        col.includes('courses') || col.includes('courts') || col.includes('beaches') ||
        col.includes('marinas') || col.includes('swimming')) {
      infrastructureColumns.push(col);
    }
  });
  
  console.log('📊 INFRASTRUCTURE COLUMNS FOUND:\n');
  infrastructureColumns.forEach(col => {
    console.log(`  - ${col}: ${typeof sampleTown[col]} (value: ${sampleTown[col]})`);
  });
  
  // Get statistics on these columns
  console.log('\n📈 INFRASTRUCTURE DATA STATISTICS:\n');
  
  // Check golf courses
  const { data: golfStats } = await supabase
    .from('towns')
    .select('golf_courses_count')
    .not('golf_courses_count', 'is', null)
    .gt('golf_courses_count', 0);
  
  console.log(`Towns with golf courses: ${golfStats?.length || 0}/341`);
  
  // Check tennis courts
  const { data: tennisStats } = await supabase
    .from('towns')
    .select('tennis_courts_count')
    .not('tennis_courts_count', 'is', null)
    .gt('tennis_courts_count', 0);
  
  console.log(`Towns with tennis courts: ${tennisStats?.length || 0}/341`);
  
  // Check beaches
  const { data: beachStats } = await supabase
    .from('towns')
    .select('beaches_nearby')
    .not('beaches_nearby', 'is', null)
    .eq('beaches_nearby', true);
  
  console.log(`Towns with beaches nearby: ${beachStats?.length || 0}/341`);
  
  // Check ski resorts
  const { data: skiStats } = await supabase
    .from('towns')
    .select('ski_resorts_within_100km')
    .not('ski_resorts_within_100km', 'is', null)
    .gt('ski_resorts_within_100km', 0);
  
  console.log(`Towns with ski resorts within 100km: ${skiStats?.length || 0}/341`);
  
  // Get sample of towns with good infrastructure
  console.log('\n🏆 SAMPLE TOWNS WITH INFRASTRUCTURE:\n');
  
  const { data: wellEquipped } = await supabase
    .from('towns')
    .select('name, country, golf_courses_count, tennis_courts_count, swimming_facilities, beaches_nearby, ski_resorts_within_100km, marinas_count, hiking_trails_km')
    .or('golf_courses_count.gt.0,tennis_courts_count.gt.0,ski_resorts_within_100km.gt.0')
    .limit(10);
  
  wellEquipped?.forEach(town => {
    console.log(`\n${town.name}, ${town.country}:`);
    if (town.golf_courses_count > 0) console.log(`  ⛳ Golf courses: ${town.golf_courses_count}`);
    if (town.tennis_courts_count > 0) console.log(`  🎾 Tennis courts: ${town.tennis_courts_count}`);
    if (town.swimming_facilities) console.log(`  🏊 Swimming facilities: ${town.swimming_facilities}`);
    if (town.beaches_nearby) console.log(`  🏖️ Beaches nearby: Yes`);
    if (town.ski_resorts_within_100km > 0) console.log(`  ⛷️ Ski resorts: ${town.ski_resorts_within_100km}`);
    if (town.marinas_count > 0) console.log(`  ⛵ Marinas: ${town.marinas_count}`);
    if (town.hiking_trails_km > 0) console.log(`  🥾 Hiking trails: ${town.hiking_trails_km}km`);
  });
}

// Run check
checkInfrastructureColumns().catch(console.error);