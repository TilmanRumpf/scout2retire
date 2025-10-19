import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNzk1MywiZXhwIjoyMDcyNjgzOTUzfQ.Oy-MblIo6xNvNI6KJwsjrU9uO17rWko_p08fZHY1uyE'
);

async function checkValues() {
  try {
    const fields = [
      'summer_climate_actual',
      'winter_climate_actual',
      'sunshine_level_actual',
      'precipitation_level_actual',
      'humidity_level_actual',
      'seasonal_variation_actual'
    ];

    for (const field of fields) {
      const { data, error } = await supabase
        .from('towns')
        .select(field)
        .not(field, 'is', null)
        .limit(100);

      if (error) {
        console.log(field + ': ERROR - ' + error.message);
      } else {
        const unique = [...new Set(data.map(t => t[field]))].sort();
        const vals = unique.map(v => "'" + v + "'").join(', ');
        console.log(field + ': [' + vals + ']');
      }
    }
  } catch (err) {
    console.error(err);
  }
}

checkValues();
