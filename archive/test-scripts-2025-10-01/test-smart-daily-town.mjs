import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Test scenarios for different user preferences
async function testSmartDailyTown() {
  console.log('=== TESTING SMART DAILY TOWN SELECTION ===\n');

  // Get a sample user who selected Netherlands
  const { data: dutchUser } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('countries', '["Netherlands"]')
    .limit(1)
    .single();

  if (dutchUser) {
    console.log('Dutch User Preferences:');
    console.log('  Countries:', dutchUser.countries);
    console.log('  Regions:', dutchUser.regions);
    console.log('  Expected Tier 1: Dutch towns');
    console.log('  Expected Tier 2: Belgium, Germany, UK, Denmark');
    console.log('  Expected Tier 3: Any European town');
    console.log('  Should NEVER see: Asian, American, African towns\n');
  }

  // Check what towns are available for each tier
  
  // Tier 1: Netherlands
  const { data: dutchTowns } = await supabase
    .from('towns')
    .select('name, country')
    .eq('country', 'Netherlands')
    .not('image_url_1', 'is', null);
  
  console.log(`Tier 1 (Netherlands): ${dutchTowns?.length || 0} towns available`);
  if (dutchTowns?.length > 0) {
    console.log('  Examples:', dutchTowns.slice(0, 3).map(t => t.name).join(', '));
  }
  
  // Tier 2: Neighbors
  const neighbors = ['Belgium', 'Germany', 'United Kingdom', 'Denmark'];
  const { data: neighborTowns } = await supabase
    .from('towns')
    .select('name, country')
    .in('country', neighbors)
    .not('image_url_1', 'is', null);
  
  console.log(`\nTier 2 (Neighbors): ${neighborTowns?.length || 0} towns available`);
  if (neighborTowns?.length > 0) {
    const examples = neighborTowns.slice(0, 3).map(t => `${t.name} (${t.country})`);
    console.log('  Examples:', examples.join(', '));
  }
  
  // Test Mediterranean selection
  console.log('\n--- Mediterranean User Test ---');
  const { data: medUser } = await supabase
    .from('user_preferences')
    .select('*')
    .limit(1)
    .single();
  
  if (medUser && medUser.regions?.includes('Mediterranean')) {
    console.log('User selected Mediterranean region');
    console.log('  Should see: Spain (including Atlantic coast), Portugal, Italy, Greece, France, Croatia');
    console.log('  Should NOT see: Northern Europe, Americas, Asia');
  }
  
  // Count Spanish towns to verify they're included
  const { data: spanishTowns } = await supabase
    .from('towns')
    .select('name, region')
    .eq('country', 'Spain')
    .not('image_url_1', 'is', null);
  
  console.log(`\nSpanish towns available: ${spanishTowns?.length || 0}`);
  const atlanticSpanish = spanishTowns?.filter(t => 
    t.region?.includes('Galicia') || 
    t.region?.includes('Basque') || 
    t.region?.includes('Cantabria') ||
    t.region?.includes('Asturias')
  );
  console.log(`  Atlantic coast: ${atlanticSpanish?.length || 0} towns`);
  console.log(`  Mediterranean coast: ${(spanishTowns?.length || 0) - (atlanticSpanish?.length || 0)} towns`);
  console.log('  All should be included for Mediterranean users');
}

testSmartDailyTown();
