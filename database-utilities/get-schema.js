import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function getSchema() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT
        column_name,
        data_type,
        udt_name
      FROM information_schema.columns
      WHERE table_name = 'towns'
        AND column_name IN (
          'activity_infrastructure',
          'local_mobility_options',
          'medical_specialties_available',
          'data_sources',
          'environmental_factors',
          'easy_residency_countries',
          'secondary_languages'
        )
      ORDER BY column_name;
    `
  });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Column Types:');
    console.table(data);
  }
}

getSchema();
