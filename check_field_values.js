import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkValues() {
  // Get all towns with specific fields
  const { data, error } = await supabase
    .from('towns')
    .select('id, name, public_transport_quality, beaches_nearby, cultural_events_frequency, government_efficiency_rating')
    .limit(20);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample data from 20 towns:');
  console.log('');
  data.forEach(town => {
    console.log(`${town.name}:`);
    console.log(`  public_transport_quality: ${town.public_transport_quality}`);
    console.log(`  beaches_nearby: ${town.beaches_nearby}`);
    console.log(`  cultural_events_frequency: ${town.cultural_events_frequency}`);
    console.log(`  government_efficiency_rating: ${town.government_efficiency_rating}`);
    console.log('');
  });
  
  // Get unique values for these fields
  const { data: allTowns } = await supabase
    .from('towns')
    .select('public_transport_quality, beaches_nearby, cultural_events_frequency, government_efficiency_rating');
  
  const uniqueValues = {
    public_transport_quality: new Set(),
    beaches_nearby: new Set(),
    cultural_events_frequency: new Set(),
    government_efficiency_rating: new Set()
  };
  
  allTowns.forEach(town => {
    if (town.public_transport_quality) uniqueValues.public_transport_quality.add(town.public_transport_quality);
    if (town.beaches_nearby) uniqueValues.beaches_nearby.add(town.beaches_nearby);
    if (town.cultural_events_frequency) uniqueValues.cultural_events_frequency.add(town.cultural_events_frequency);
    if (town.government_efficiency_rating) uniqueValues.government_efficiency_rating.add(town.government_efficiency_rating);
  });
  
  console.log('\n\n=== UNIQUE VALUES ACROSS ALL TOWNS ===\n');
  Object.entries(uniqueValues).forEach(([field, values]) => {
    console.log(`${field}:`);
    Array.from(values).sort().forEach(v => console.log(`  - "${v}"`));
    console.log('');
  });
}

checkValues();
