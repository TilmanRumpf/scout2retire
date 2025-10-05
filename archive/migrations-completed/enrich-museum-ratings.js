import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Museum rating logic based on town characteristics
function calculateMuseumRating(town) {
  let score = 5; // Base score
  
  // POPULATION FACTOR (bigger cities = more museums)
  if (town.population > 5000000) score += 3;
  else if (town.population > 1000000) score += 2;
  else if (town.population > 500000) score += 1;
  else if (town.population < 50000) score -= 2;
  else if (town.population < 10000) score -= 3;
  
  // CAPITAL CITIES get bonus
  const capitals = ['Rome', 'Paris', 'Athens', 'Vienna', 'Prague', 'Budapest', 'Dublin', 
                    'Reykjavik', 'Tallinn', 'Riga', 'Vilnius', 'Warsaw', 'Berlin', 
                    'Madrid', 'Lisbon', 'Stockholm', 'Oslo', 'Copenhagen', 'Amsterdam',
                    'Brussels', 'London', 'Edinburgh', 'Cardiff', 'Canberra', 'Wellington',
                    'Ottawa', 'Washington', 'Mexico City', 'San José', 'Panama City',
                    'Quito', 'Lima', 'Santiago', 'Buenos Aires', 'Montevideo', 'Cairo'];
  if (capitals.includes(town.name)) score += 2;
  
  // CULTURAL LANDMARKS indicate museums
  if (town.cultural_landmark_1 || town.cultural_landmark_2 || town.cultural_landmark_3) {
    score += 1;
    // Check for specific museum mentions
    const landmarks = [town.cultural_landmark_1, town.cultural_landmark_2, town.cultural_landmark_3]
      .filter(l => l)
      .join(' ');
    if (landmarks.toLowerCase().includes('museum')) score += 2;
    if (landmarks.toLowerCase().includes('gallery')) score += 1;
    if (landmarks.toLowerCase().includes('palace')) score += 1;
  }
  
  // COUNTRY/REGION CULTURAL FACTOR
  const highCultureCountries = ['Italy', 'France', 'Spain', 'Greece', 'Germany', 
                                 'Austria', 'Czech Republic', 'Hungary', 'Poland',
                                 'Netherlands', 'Belgium', 'United Kingdom', 'Ireland'];
  const mediumCultureCountries = ['Portugal', 'Croatia', 'Turkey', 'Mexico', 'Peru',
                                   'Chile', 'Argentina', 'India', 'Thailand', 'Vietnam'];
  const beachIslandCountries = ['Fiji', 'Maldives', 'Seychelles', 'Bahamas', 'Barbados',
                                 'Antigua and Barbuda', 'Grenada', 'Saint Lucia'];
  
  if (highCultureCountries.includes(town.country)) score += 1;
  else if (mediumCultureCountries.includes(town.country)) score += 0;
  else if (beachIslandCountries.includes(town.country)) score -= 2;
  
  // DESCRIPTION ANALYSIS
  if (town.description) {
    const desc = town.description.toLowerCase();
    if (desc.includes('museum')) score += 2;
    if (desc.includes('art') || desc.includes('gallery')) score += 1;
    if (desc.includes('history') || desc.includes('historic')) score += 1;
    if (desc.includes('culture') || desc.includes('cultural')) score += 1;
    if (desc.includes('beach') && !desc.includes('museum')) score -= 1;
    if (desc.includes('rural') || desc.includes('village')) score -= 1;
  }
  
  // TOURISM INFRASTRUCTURE
  if (town.tourist_season_impact === 'high') score += 1;
  
  // GEOGRAPHIC FEATURES (cities vs nature)
  if (town.geographic_features && Array.isArray(town.geographic_features)) {
    const features = town.geographic_features.join(' ').toLowerCase();
    if (features.includes('urban') || features.includes('metropolitan')) score += 1;
    if (features.includes('rural') || features.includes('remote')) score -= 2;
    if (features.includes('island') && town.population < 100000) score -= 1;
  }
  
  // SPECIAL CASES - Known museum cities
  const museumCapitals = ['Paris', 'Rome', 'London', 'New York', 'Florence', 'Venice',
                          'Amsterdam', 'Vienna', 'Prague', 'Barcelona', 'Madrid',
                          'Berlin', 'Munich', 'Athens', 'Istanbul', 'Cairo'];
  if (museumCapitals.includes(town.name)) score = Math.max(score, 9);
  
  // Ensure score is within 1-10 range
  score = Math.max(1, Math.min(10, score));
  
  return score;
}

async function enrichMuseumRatings() {
  console.log('🎨 ENRICHING MUSEUM RATINGS\n');
  
  // Get all towns without museum ratings
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .is('museums_rating', null);
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Found ${towns.length} towns without museum ratings\n`);
  
  let updateCount = 0;
  let errorCount = 0;
  const updates = [];
  
  // Calculate ratings for all towns
  for (const town of towns) {
    const rating = calculateMuseumRating(town);
    
    updates.push({
      id: town.id,
      name: town.name,
      country: town.country,
      population: town.population,
      rating
    });
  }
  
  // Sort by rating to show distribution
  updates.sort((a, b) => b.rating - a.rating);
  
  // Show sample of ratings
  console.log('SAMPLE RATINGS (Top 10):');
  updates.slice(0, 10).forEach(u => {
    console.log(`  ${u.name}, ${u.country}: ${u.rating}/10 (pop: ${u.population?.toLocaleString() || 'unknown'})`);
  });
  
  console.log('\nSAMPLE RATINGS (Bottom 10):');
  updates.slice(-10).forEach(u => {
    console.log(`  ${u.name}, ${u.country}: ${u.rating}/10 (pop: ${u.population?.toLocaleString() || 'unknown'})`);
  });
  
  // Show distribution
  const distribution = {};
  updates.forEach(u => {
    distribution[u.rating] = (distribution[u.rating] || 0) + 1;
  });
  
  console.log('\nRATING DISTRIBUTION:');
  for (let i = 1; i <= 10; i++) {
    const count = distribution[i] || 0;
    const bar = '█'.repeat(Math.floor(count / 5));
    console.log(`  ${i}/10: ${count} towns ${bar}`);
  }
  
  // Update database
  console.log('\nUpdating database...');
  
  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('towns')
      .update({ museums_rating: update.rating })
      .eq('id', update.id);
      
    if (updateError) {
      console.log(`❌ Failed to update ${update.name}: ${updateError.message}`);
      errorCount++;
    } else {
      updateCount++;
      if (updateCount % 50 === 0) {
        console.log(`  Updated ${updateCount}/${updates.length} towns...`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('MUSEUM RATING ENRICHMENT COMPLETE');
  console.log('='.repeat(50));
  console.log(`✅ Successfully updated: ${updateCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Verify final stats
  const { data: final } = await supabase
    .from('towns')
    .select('museums_rating');
    
  const populated = final.filter(t => t.museums_rating !== null).length;
  console.log(`\n📊 Final coverage: ${populated}/${final.length} towns (${(populated*100/final.length).toFixed(1)}%)`);
}

// Run enrichment
enrichMuseumRatings().catch(console.error);