import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Specific corrections for known towns
const MANUAL_CORRECTIONS = {
  'Lemmer': 2,  // Small water sports town, minimal museums
  'Savusavu': 1,  // Small Fiji island town
  'Victoria (Mahé)': 3,  // Small capital but limited museums
  'Plettenberg Bay': 2,  // Beach resort, not cultural
  'Castries': 3,  // Small Caribbean capital
  'Loreto': 2,  // Small Mexican beach town
  'Rincón': 2,  // Puerto Rico surf town
  'Olhão': 3,  // Portuguese fishing town, some heritage
  'Port Macquarie': 3,  // Australian coastal, has a few museums
  'Venice (FL)': 3,  // Florida retirement town, minimal culture
  'Myrtle Beach': 2,  // Beach resort, entertainment not museums
};

// Better museum rating logic
function calculateBetterMuseumRating(town) {
  // Start with base score based on population
  let score;
  if (town.population > 5000000) score = 7;
  else if (town.population > 1000000) score = 6;
  else if (town.population > 500000) score = 5;
  else if (town.population > 100000) score = 4;
  else if (town.population > 50000) score = 3;
  else if (town.population > 20000) score = 2;
  else score = 1;
  
  // Major capitals get significant boost
  const majorCapitals = ['Rome', 'Paris', 'Athens', 'Vienna', 'Prague', 'Budapest', 
                         'Berlin', 'Madrid', 'London', 'Amsterdam', 'Brussels'];
  if (majorCapitals.includes(town.name)) score += 3;
  
  // Museum cities (known for museums specifically)
  const museumCities = ['Florence', 'Venice', 'Barcelona', 'Munich', 'St. Petersburg',
                        'New York', 'Washington', 'Boston', 'Chicago', 'San Francisco'];
  if (museumCities.includes(town.name)) score = Math.max(score, 8);
  
  // Check description for museum-specific mentions
  if (town.description) {
    const desc = town.description.toLowerCase();
    if (desc.includes('museum') || desc.includes('galleries')) score += 2;
    else if (desc.includes('art') || desc.includes('cultural')) score += 1;
    
    // Negative indicators
    if (desc.includes('beach') || desc.includes('water sports') || 
        desc.includes('sailing') || desc.includes('diving')) score -= 1;
    if (desc.includes('rural') || desc.includes('peaceful') || 
        desc.includes('quiet')) score -= 1;
  }
  
  // Small town penalty (overrides country bonus)
  if (town.population < 20000) {
    score = Math.min(score, 3);  // Cap at 3 for small towns
  }
  if (town.population < 10000) {
    score = Math.min(score, 2);  // Cap at 2 for very small towns
  }
  
  // Beach/Island destinations typically have fewer museums
  if (town.geographic_features && Array.isArray(town.geographic_features)) {
    const features = town.geographic_features.join(' ').toLowerCase();
    if (features.includes('island') || features.includes('beach')) score -= 1;
    if (features.includes('tropical')) score -= 1;
  }
  
  // Ensure score is within 1-10 range
  score = Math.max(1, Math.min(10, score));
  
  return score;
}

async function fixMuseumRatings() {
  console.log('🔧 FIXING MUSEUM RATINGS\n');
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Recalculating ratings for ${towns.length} towns\n`);
  
  const updates = [];
  let changedCount = 0;
  
  for (const town of towns) {
    // Check for manual correction first
    let newRating;
    if (MANUAL_CORRECTIONS[town.name]) {
      newRating = MANUAL_CORRECTIONS[town.name];
    } else {
      newRating = calculateBetterMuseumRating(town);
    }
    
    if (newRating !== town.museums_rating) {
      changedCount++;
      updates.push({
        id: town.id,
        name: town.name,
        oldRating: town.museums_rating,
        newRating: newRating,
        population: town.population
      });
    }
  }
  
  console.log(`Found ${changedCount} towns needing rating adjustments\n`);
  
  // Show sample of changes
  console.log('SAMPLE CHANGES:');
  const samples = updates.slice(0, 20);
  samples.forEach(u => {
    console.log(`  ${u.name}: ${u.oldRating} → ${u.newRating} (pop: ${u.population?.toLocaleString() || 'unknown'})`);
  });
  
  // Update database
  console.log('\nUpdating database...');
  let updateCount = 0;
  let errorCount = 0;
  
  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('towns')
      .update({ museums_rating: update.newRating })
      .eq('id', update.id);
      
    if (updateError) {
      console.log(`❌ Failed to update ${update.name}: ${updateError.message}`);
      errorCount++;
    } else {
      updateCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('MUSEUM RATING FIX COMPLETE');
  console.log('='.repeat(50));
  console.log(`✅ Successfully updated: ${updateCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Check specific towns
  console.log('\nVERIFYING KEY TOWNS:');
  const checkTowns = ['Lemmer', 'Paris', 'Rome', 'Savusavu', 'Myrtle Beach'];
  for (const name of checkTowns) {
    const { data } = await supabase
      .from('towns')
      .select('name, museums_rating, population')
      .eq('name', name)
      .single();
    if (data) {
      console.log(`  ${data.name}: ${data.museums_rating}/10 (pop: ${data.population?.toLocaleString()})`);
    }
  }
}

// Run fix
fixMuseumRatings().catch(console.error);