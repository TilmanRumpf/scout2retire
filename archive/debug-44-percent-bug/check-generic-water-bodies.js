import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkGenericWaterBodies() {
  console.log('🤮 CHECKING FOR GENERIC/STUPID WATER BODY ENTRIES\n');
  console.log('==================================================\n');
  
  // Get all towns with water bodies
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, water_bodies')
    .not('water_bodies', 'is', null)
    .order('country, name');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  // Find stupid generic entries
  const genericTerms = [
    'coastal water', 'coastal waters', 'Coastal water', 'Coastal waters',
    'ocean', 'Ocean', 'sea', 'Sea', 
    'river', 'River', 'rivers', 'Rivers',
    'lake', 'Lake', 'lakes', 'Lakes',
    'bay', 'Bay', 'gulf', 'Gulf',
    'harbor', 'Harbor', 'port', 'Port',
    'beach', 'Beach', 'coast', 'Coast',
    'waterfront', 'Waterfront', 'water', 'Water'
  ];
  
  const townsWithGeneric = [];
  const allWaterBodies = new Set();
  
  for (const town of towns) {
    if (!town.water_bodies || !Array.isArray(town.water_bodies)) continue;
    
    let hasGeneric = false;
    const genericFound = [];
    
    for (const water of town.water_bodies) {
      allWaterBodies.add(water);
      
      // Check for exact generic matches
      if (genericTerms.includes(water) || 
          water.toLowerCase() === 'coastal water' ||
          water.toLowerCase() === 'coastal waters' ||
          water === 'Ocean' || water === 'Sea' || 
          water === 'River' || water === 'Lake' ||
          water === 'Bay' || water === 'Gulf') {
        hasGeneric = true;
        genericFound.push(water);
      }
      
      // Check for vague entries
      if (water.match(/^(North|South|East|West)\s+(Sea|Ocean|River|Lake)$/i) ||
          water.match(/^(Big|Small|Large|Great)\s+(Sea|Ocean|River|Lake)$/i) ||
          water.match(/^(Local|Nearby|Adjacent)\s+/i) ||
          water.match(/^(Main|Central|Primary)\s+/i)) {
        hasGeneric = true;
        genericFound.push(water);
      }
    }
    
    if (hasGeneric) {
      townsWithGeneric.push({
        name: town.name,
        country: town.country,
        water_bodies: town.water_bodies,
        generic: genericFound
      });
    }
  }
  
  console.log(`Found ${townsWithGeneric.length} towns with generic/stupid water body entries:\n`);
  
  console.log('🤮 WORST OFFENDERS:\n');
  townsWithGeneric.forEach(t => {
    console.log(`${t.name}, ${t.country}:`);
    console.log(`  Current: [${t.water_bodies.join(', ')}]`);
    console.log(`  Generic crap: [${t.generic.join(', ')}]`);
    console.log('');
  });
  
  // Show all unique water body values to find more issues
  console.log('\n📋 ALL UNIQUE WATER BODY VALUES (check for more generic ones):\n');
  const sortedWaters = Array.from(allWaterBodies).sort();
  
  console.log('Suspicious ones:');
  sortedWaters.forEach(w => {
    // Flag suspicious ones
    if (w.match(/^(coastal|ocean|sea|river|lake|bay|gulf|harbor|beach|water)/i) ||
        w.match(/^(North|South|East|West|Big|Small|Great|Local|Nearby|Main|Central)/i) ||
        w.length < 5 || // Too short to be a real name
        !w.includes(' ') && w.length < 8) { // Single word that's too generic
      console.log(`  ⚠️ "${w}"`);
    }
  });
}

// Run check
checkGenericWaterBodies().catch(console.error);