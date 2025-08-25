import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkWaterBodiesIssues() {
  console.log('💩 CHECKING WATER_BODIES DATA QUALITY\n');
  console.log('=====================================\n');
  
  // Get all towns with water bodies
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, water_bodies, geographic_features')
    .order('country, name');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Total towns: ${towns.length}\n`);
  
  // Analyze issues
  let hasWaterBodies = 0;
  let nullWaterBodies = 0;
  let emptyArrays = 0;
  const issues = [];
  const suspicious = [];
  
  for (const town of towns) {
    if (!town.water_bodies || town.water_bodies === null) {
      nullWaterBodies++;
      
      // Check if geographic features mention water
      if (town.geographic_features) {
        const features = town.geographic_features.join(' ').toLowerCase();
        if (features.includes('coast') || features.includes('beach') || 
            features.includes('sea') || features.includes('ocean') ||
            features.includes('lake') || features.includes('river') ||
            features.includes('harbor') || features.includes('port') ||
            features.includes('island') || features.includes('bay')) {
          issues.push(`${town.name}, ${town.country}: Has water in features but no water_bodies: ${town.geographic_features.join(', ')}`);
        }
      }
    } else if (Array.isArray(town.water_bodies)) {
      if (town.water_bodies.length === 0) {
        emptyArrays++;
      } else {
        hasWaterBodies++;
        
        // Check for stupid entries
        for (const water of town.water_bodies) {
          // Check for generic or wrong entries
          if (water === 'Ocean' || water === 'Sea' || water === 'River' || 
              water === 'Lake' || water === 'Bay' || water === 'Gulf') {
            suspicious.push(`${town.name}: Has generic "${water}"`);
          }
          
          // Check for duplicates or variations
          const lowerWater = water.toLowerCase();
          const otherWaters = town.water_bodies.filter(w => w !== water);
          for (const other of otherWaters) {
            if (other.toLowerCase() === lowerWater) {
              suspicious.push(`${town.name}: Duplicate entries "${water}" and "${other}"`);
            }
          }
        }
      }
    }
  }
  
  console.log('📊 STATISTICS:\n');
  console.log(`Towns with water_bodies: ${hasWaterBodies}`);
  console.log(`Towns with NULL water_bodies: ${nullWaterBodies}`);
  console.log(`Towns with empty arrays: ${emptyArrays}`);
  
  console.log('\n🚨 MAJOR ISSUES:\n');
  
  // Show coastal cities without water bodies
  const coastalNoWater = towns.filter(t => 
    (!t.water_bodies || t.water_bodies === null || t.water_bodies.length === 0) &&
    t.geographic_features && 
    t.geographic_features.some(f => f.toLowerCase().includes('coast') || f.toLowerCase().includes('beach'))
  );
  
  console.log(`\nCoastal cities with NO water_bodies (${coastalNoWater.length}):`);
  coastalNoWater.slice(0, 20).forEach(t => {
    console.log(`  ❌ ${t.name}, ${t.country} - Features: ${t.geographic_features.join(', ')}`);
  });
  
  // Show island cities without water bodies
  const islandNoWater = towns.filter(t => 
    (!t.water_bodies || t.water_bodies === null || t.water_bodies.length === 0) &&
    (t.name.toLowerCase().includes('island') || 
     (t.geographic_features && t.geographic_features.some(f => f.toLowerCase().includes('island'))))
  );
  
  console.log(`\nIsland cities with NO water_bodies (${islandNoWater.length}):`);
  islandNoWater.forEach(t => {
    console.log(`  ❌ ${t.name}, ${t.country}`);
  });
  
  // Show suspicious entries
  if (suspicious.length > 0) {
    console.log('\n⚠️ SUSPICIOUS ENTRIES:');
    suspicious.slice(0, 20).forEach(s => console.log(`  - ${s}`));
  }
  
  // Sample of actual data
  console.log('\n📋 SAMPLE OF ACTUAL DATA:\n');
  const withWater = towns.filter(t => t.water_bodies && t.water_bodies.length > 0);
  for (let i = 0; i < Math.min(15, withWater.length); i++) {
    const town = withWater[i];
    console.log(`${town.name}, ${town.country}:`);
    console.log(`  Water bodies: [${town.water_bodies.join(', ')}]`);
  }
  
  // Check for landlocked cities with water bodies
  console.log('\n🤔 LANDLOCKED CITIES WITH WATER (verify these):\n');
  const landlocked = ['Switzerland', 'Austria', 'Czech Republic', 'Hungary', 'Paraguay', 'Bolivia', 'Nepal', 'Botswana', 'Rwanda'];
  const landlockedWithWater = towns.filter(t => 
    landlocked.includes(t.country) && 
    t.water_bodies && t.water_bodies.length > 0
  );
  
  landlockedWithWater.forEach(t => {
    console.log(`${t.name}, ${t.country}: ${t.water_bodies.join(', ')}`);
  });
}

// Run check
checkWaterBodiesIssues().catch(console.error);