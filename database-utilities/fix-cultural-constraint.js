import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixConstraint() {
  console.log('Fixing cultural_events_frequency constraint...\n');

  // Step 1: Drop old constraint
  console.log('1. Dropping old constraint...');
  const dropSQL = `
    ALTER TABLE towns
    DROP CONSTRAINT IF EXISTS towns_cultural_events_frequency_check;
  `;

  const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropSQL });

  if (dropError) {
    // Try alternative: direct ALTER TABLE (might work with service role)
    console.log('   exec_sql not available, trying direct execution...');

    // Just continue - constraint might not exist
  } else {
    console.log('   ✅ Old constraint dropped');
  }

  // Step 2: Add new constraint
  console.log('2. Adding new constraint with all valid values...');
  const addSQL = `
    ALTER TABLE towns
    ADD CONSTRAINT towns_cultural_events_frequency_check
    CHECK (
      cultural_events_frequency IS NULL OR
      cultural_events_frequency IN (
        'rare',
        'occasional',
        'monthly',
        'frequent',
        'weekly',
        'constant',
        'daily'
      )
    );
  `;

  const { error: addError } = await supabase.rpc('exec_sql', { sql: addSQL });

  if (addError) {
    console.log('   ❌ Failed:', addError.message);
    console.log('\n⚠️  Cannot execute DDL via Supabase client');
    console.log('   Will use workaround: map AI values to working values\n');
    return false;
  } else {
    console.log('   ✅ New constraint added');
    return true;
  }
}

fixConstraint().then(success => {
  if (success) {
    console.log('\n✅ Constraint fixed! Now testing...\n');
    // Test it
    import('./test-all-cultural-values.js');
  }
});
