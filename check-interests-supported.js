import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkInterestsSupported() {
  console.log('🎯 CHECKING INTERESTS_SUPPORTED DATA\n');
  console.log('====================================\n');
  
  // Get all towns with their interests data
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, interests_supported, activities_available')
    .order('country, name');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Total towns: ${towns.length}\n`);
  
  // Analyze interests data
  const stats = {
    total: towns.length,
    hasInterests: 0,
    nullInterests: 0,
    emptyArrays: 0,
    uniqueInterests: new Set(),
    byInterestCount: {}
  };
  
  for (const town of towns) {
    if (!town.interests_supported || town.interests_supported === null) {
      stats.nullInterests++;
    } else if (Array.isArray(town.interests_supported)) {
      if (town.interests_supported.length === 0) {
        stats.emptyArrays++;
      } else {
        stats.hasInterests++;
        
        // Track unique interests
        town.interests_supported.forEach(interest => {
          stats.uniqueInterests.add(interest);
        });
        
        // Track by count
        const count = town.interests_supported.length;
        stats.byInterestCount[count] = (stats.byInterestCount[count] || 0) + 1;
      }
    }
  }
  
  console.log('📊 STATISTICS:\n');
  console.log(`Towns with interests: ${stats.hasInterests}`);
  console.log(`Towns with NULL interests: ${stats.nullInterests}`);
  console.log(`Towns with empty arrays: ${stats.emptyArrays}`);
  console.log(`Unique interests found: ${stats.uniqueInterests.size}`);
  
  if (stats.uniqueInterests.size > 0) {
    console.log('\n🔍 CURRENT UNIQUE INTERESTS:\n');
    Array.from(stats.uniqueInterests).sort().forEach(interest => {
      console.log(`  - ${interest}`);
    });
  }
  
  console.log('\n📋 SAMPLE DATA:\n');
  const samples = towns.filter(t => t.interests_supported && t.interests_supported.length > 0).slice(0, 10);
  samples.forEach(town => {
    console.log(`${town.name}, ${town.country}:`);
    console.log(`  Interests: [${town.interests_supported?.join(', ') || 'null'}]`);
  });
  
  // Compare with activities
  console.log('\n🔄 ACTIVITIES vs INTERESTS COMPARISON:\n');
  const comparison = towns.slice(0, 5);
  comparison.forEach(town => {
    console.log(`${town.name}:`);
    console.log(`  Activities: ${town.activities_available?.length || 0} items`);
    console.log(`  Interests: ${town.interests_supported?.length || 0} items`);
  });
}

// Run check
checkInterestsSupported().catch(console.error);