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

async function getConstraintSQL() {
  // Use edge function to run raw SQL
  const { data, error } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT conname, pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE conrelid = 'towns'::regclass
        AND conname LIKE '%cultural_events%'
      `
    });

  if (error) {
    console.log('exec_sql failed:', error.message);
    console.log('\nTrying direct query...\n');

    // Try fetching from pg_catalog directly
    const { data: data2, error: error2 } = await supabase
      .from('pg_constraint')
      .select('*')
      .like('conname', '%cultural_events%');

    if (error2) {
      console.log('Direct query failed:', error2.message);
    } else {
      console.log('Constraint data:', JSON.stringify(data2, null, 2));
    }
  } else {
    console.log('Constraint definition:', JSON.stringify(data, null, 2));
  }
}

getConstraintSQL();
