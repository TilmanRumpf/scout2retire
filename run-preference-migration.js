/**
 * Manual Migration Executor for Preference Versioning
 *
 * Run this script to apply the preference versioning migration to your database.
 * This is needed because of migration history conflicts with supabase db push.
 *
 * Usage: node run-preference-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('   Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('📦 Preference Versioning Migration');
  console.log('=' .repeat(60));
  console.log('');

  try {
    // Read migration file
    const migrationPath = join(__dirname, 'supabase/migrations/20251111000000_add_preference_versioning.sql');
    console.log(`📄 Reading migration file: ${migrationPath}`);

    const sql = readFileSync(migrationPath, 'utf8');
    console.log(`✅ Migration file loaded (${sql.length} characters)`);
    console.log('');

    // Execute migration
    console.log('⚙️  Executing migration...');
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try direct query if RPC doesn't exist
      console.log('   RPC method not available, trying direct query...');
      const { error: directError } = await supabase.from('_sql').insert({ query: sql });

      if (directError) {
        throw directError;
      }
    }

    console.log('');
    console.log('✅ Migration executed successfully!');
    console.log('');
    console.log('🔍 Verifying columns...');

    // Verify the columns were created
    const { data: prefColumns, error: prefError } = await supabase
      .from('user_preferences')
      .select('preferences_hash, preferences_updated_at')
      .limit(1);

    if (prefError) {
      console.warn('⚠️  Could not verify user_preferences columns:', prefError.message);
    } else {
      console.log('✅ user_preferences columns exist');
    }

    const { data: userColumns, error: userError } = await supabase
      .from('users')
      .select('preferences_updated_at')
      .limit(1);

    if (userError) {
      console.warn('⚠️  Could not verify users columns:', userError.message);
    } else {
      console.log('✅ users columns exist');
    }

    console.log('');
    console.log('=' .repeat(60));
    console.log('✨ Migration complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Restart your development server');
    console.log('2. Test preference updates to verify hash generation');
    console.log('3. Check Algorithm Manager for cache invalidation');

  } catch (error) {
    console.error('');
    console.error('❌ Migration failed!');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('Manual alternative:');
    console.error('1. Open Supabase Dashboard > SQL Editor');
    console.error('2. Paste contents of: supabase/migrations/20251111000000_add_preference_versioning.sql');
    console.error('3. Click "Run"');
    console.error('');
    process.exit(1);
  }
}

// Run migration
runMigration();
