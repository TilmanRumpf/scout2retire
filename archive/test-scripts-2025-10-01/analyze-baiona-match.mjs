import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function analyzeBaiona() {
  // Get Baiona's data
  const { data: town } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Baiona')
    .eq('country', 'Spain')
    .single();

  if (!town) {
    console.log('Baiona not found in database');
    return;
  }

  console.log('=== BAIONA DATA ===');
  console.log('Name:', town.name);
  console.log('Country:', town.country);
  console.log('Region:', town.region);
  console.log('Geo Region:', town.geo_region);
  console.log('Regions array:', town.regions);
  console.log('Geographic Features:', town.geographic_features_actual);
  console.log('Vegetation Type:', town.vegetation_type_actual);
  console.log('Water Bodies:', town.water_bodies);
  console.log('Distance to Ocean:', town.distance_to_ocean_km, 'km');
  console.log('Elevation:', town.elevation_meters, 'm');
  console.log('Climate:', town.climate);

  // Get a sample user's preferences to understand scoring
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .limit(1)
    .single();

  console.log('\n=== SAMPLE USER PREFERENCES ===');
  console.log('Countries:', prefs.countries);
  console.log('Regions:', prefs.regions);
  console.log('Geographic Features:', prefs.geographic_features);
  console.log('Vegetation Types:', prefs.vegetation_types);

  // Analyze why it would score 100%
  console.log('\n=== SCORING ANALYSIS ===');
  
  // Check country match
  const countryMatch = prefs.countries?.includes('Spain');
  console.log('Country Match (Spain):', countryMatch ? 'YES ✓' : 'NO ✗');
  
  // Check region match
  const regionMatches = prefs.regions?.filter(r => 
    town.regions?.includes(r) || town.geo_region === r
  );
  console.log('Region Matches:', regionMatches?.length > 0 ? regionMatches : 'None');
  
  // Check geographic features
  const geoMatches = prefs.geographic_features?.filter(g => 
    town.geographic_features_actual?.map(f => f.toLowerCase()).includes(g.toLowerCase())
  );
  console.log('Geographic Matches:', geoMatches?.length > 0 ? geoMatches : 'None');
  
  // Check vegetation
  const vegMatches = prefs.vegetation_types?.filter(v => 
    town.vegetation_type_actual?.map(t => t.toLowerCase()).includes(v.toLowerCase())
  );
  console.log('Vegetation Matches:', vegMatches?.length > 0 ? vegMatches : 'None');
}

analyzeBaiona();
