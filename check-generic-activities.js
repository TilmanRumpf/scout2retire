import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkGenericActivities() {
  console.log('💩 CHECKING FOR GENERIC USELESS ACTIVITIES\n');
  console.log('==========================================\n');
  
  // Get all towns with activities
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, activities_available')
    .not('activities_available', 'is', null)
    .order('country, name');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  // Count the generic pattern
  const genericPattern = ['walking', 'dining', 'local_markets', 'photography'];
  let genericCount = 0;
  let hasWalking = 0;
  let hasPhotography = 0;
  let hasDining = 0;
  const genericTowns = [];
  
  for (const town of towns) {
    if (!town.activities_available) continue;
    
    // Check for the exact generic pattern
    const activities = town.activities_available.sort().join(',');
    const genericStr = genericPattern.sort().join(',');
    
    if (activities === genericStr) {
      genericCount++;
      genericTowns.push(`${town.name}, ${town.country}`);
    }
    
    // Count individual useless activities
    if (town.activities_available.includes('walking')) hasWalking++;
    if (town.activities_available.includes('photography')) hasPhotography++;
    if (town.activities_available.includes('dining')) hasDining++;
  }
  
  console.log('🤮 THE HORRIBLE TRUTH:\n');
  console.log(`Total towns with activities: ${towns.length}`);
  console.log(`Towns with EXACT generic pattern [walking, dining, local_markets, photography]: ${genericCount}`);
  console.log(`Percentage with generic crap: ${((genericCount/towns.length)*100).toFixed(1)}%\n`);
  
  console.log('📊 USELESS ACTIVITIES COUNT:\n');
  console.log(`"walking": ${hasWalking} towns (${((hasWalking/towns.length)*100).toFixed(1)}%)`);
  console.log(`"photography": ${hasPhotography} towns (${((hasPhotography/towns.length)*100).toFixed(1)}%)`);
  console.log(`"dining": ${hasDining} towns (${((hasDining/towns.length)*100).toFixed(1)}%)\n`);
  
  console.log('🎯 FIRST 20 GENERIC OFFENDERS:\n');
  genericTowns.slice(0, 20).forEach(t => console.log(`  - ${t}`));
  
  // Find towns with actual unique activities
  console.log('\n✨ TOWNS WITH ACTUAL UNIQUE ACTIVITIES:\n');
  
  const uniqueTowns = towns.filter(t => {
    if (!t.activities_available) return false;
    
    // Remove the generic crap and see what's left
    const realActivities = t.activities_available.filter(a => 
      !['walking', 'photography', 'dining', 'local_markets'].includes(a)
    );
    
    return realActivities.length >= 3; // At least 3 real activities
  });
  
  console.log(`Found ${uniqueTowns.length} towns with real activities:\n`);
  uniqueTowns.slice(0, 10).forEach(t => {
    const real = t.activities_available.filter(a => 
      !['walking', 'photography', 'dining', 'local_markets'].includes(a)
    );
    console.log(`${t.name}, ${t.country}: [${real.join(', ')}]`);
  });
}

// Run check
checkGenericActivities().catch(console.error);