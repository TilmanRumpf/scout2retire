import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
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