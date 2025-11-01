import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getConstraintDefinition() {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        conname AS constraint_name,
        pg_get_constraintdef(oid) AS constraint_definition
      FROM pg_constraint
      WHERE conname LIKE '%cultural_events_frequency%'
        AND conrelid = 'towns'::regclass
    `
  });

  if (error) {
    console.log('Error fetching constraint:', error.message);
    console.log('\nTrying alternative query...\n');

    // Alternative: Query information_schema
    const { data: data2, error: error2 } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          constraint_name,
          check_clause
        FROM information_schema.check_constraints
        WHERE constraint_name LIKE '%cultural_events_frequency%'
      `
    });

    if (error2) {
      console.log('Alternative query also failed:', error2.message);
      return;
    }

    console.log('Constraint definition:');
    console.log(JSON.stringify(data2, null, 2));
  } else {
    console.log('Constraint definition:');
    console.log(JSON.stringify(data, null, 2));
  }
}

getConstraintDefinition();
