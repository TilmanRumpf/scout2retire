import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function testScoring() {
  // Get a Spanish town
  const { data: town } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Valencia')
    .single();

  // Get user preferences (assuming user ID from your session)
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .limit(1)
    .single();

  console.log('Valencia data:');
  console.log('  geographic_features_actual:', town.geographic_features_actual);
  console.log('  vegetation_type_actual:', town.vegetation_type_actual);
  
  console.log('\nUser preferences:');
  console.log('  countries:', prefs.countries);
  console.log('  geographic_features:', prefs.geographic_features);
  console.log('  vegetation_types:', prefs.vegetation_types);
}

testScoring();
