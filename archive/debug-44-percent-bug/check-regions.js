import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function checkRegions() {
  // Get all unique country-region combinations
  const { data, error } = await supabase
    .from('towns')
    .select('country, region')
    .order('country', { ascending: true })
    .order('region', { ascending: true });
  
  if (error) {
    console.error('Error fetching data:', error);
    return;
  }
  
  // Group regions by country
  const regionsByCountry = {};
  data.forEach(town => {
    if (town.country && town.region) {
      if (!regionsByCountry[town.country]) {
        regionsByCountry[town.country] = new Set();
      }
      regionsByCountry[town.country].add(town.region);
    }
  });
  
  // Convert Sets to Arrays and sort
  Object.keys(regionsByCountry).forEach(country => {
    regionsByCountry[country] = Array.from(regionsByCountry[country]).sort();
  });
  
  console.log('Countries with regions:', Object.keys(regionsByCountry).length);
  console.log('\nSample data:');
  console.log('Greece regions:', regionsByCountry['Greece']);
  console.log('United States regions:', regionsByCountry['United States']);
  console.log('Mexico regions:', regionsByCountry['Mexico']);
  console.log('Spain regions:', regionsByCountry['Spain']);
  console.log('Portugal regions:', regionsByCountry['Portugal']);
  
  // Save to file for reference
  const fs = await import('fs');
  fs.writeFileSync(
    'regions-by-country.json', 
    JSON.stringify(regionsByCountry, null, 2)
  );
  console.log('\nFull data saved to regions-by-country.json');
}

checkRegions();