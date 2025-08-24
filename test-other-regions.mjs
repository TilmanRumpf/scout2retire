import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkGlobalFix() {
  // Check towns from different countries
  const countries = ['Italy', 'Portugal', 'Greece', 'Mexico', 'France'];
  
  for (const country of countries) {
    const { data: town } = await supabase
      .from('towns')
      .select('name, country, geographic_features_actual, vegetation_type_actual')
      .eq('country', country)
      .limit(1)
      .single();
    
    console.log(`${town.name}, ${town.country}:`);
    console.log(`  Geographic: ${JSON.stringify(town.geographic_features_actual)}`);
    console.log(`  Vegetation: ${JSON.stringify(town.vegetation_type_actual)}\n`);
  }
}

checkGlobalFix();
