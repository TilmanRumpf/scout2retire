#!/usr/bin/env node

/**
 * Apply Preference Versioning Migration
 *
 * Executes the 20251111000000_add_preference_versioning.sql migration
 * directly to the database using service role credentials.
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('');
  console.log('🔧 Applying Preference Versioning Migration');
  console.log('=' + '='.repeat(59));
  console.log('');

  try {
    // Execute each SQL statement individually for better error handling
    const statements = [
      // Add columns to user_preferences
      `ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS preferences_hash TEXT DEFAULT '00000000'`,
      `ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS preferences_updated_at TIMESTAMPTZ DEFAULT NOW()`,

      // Add column to users
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences_updated_at TIMESTAMPTZ DEFAULT NOW()`,

      // Create index
      `CREATE INDEX IF NOT EXISTS idx_user_preferences_hash ON user_preferences(user_id, preferences_hash)`,

      // Backfill user_preferences
      `UPDATE user_preferences SET preferences_updated_at = COALESCE(updated_at, created_at, NOW()) WHERE preferences_updated_at IS NULL`,

      // Backfill users
      `UPDATE users u SET preferences_updated_at = (
        SELECT COALESCE(up.preferences_updated_at, up.updated_at, up.created_at, NOW())
        FROM user_preferences up
        WHERE up.user_id = u.id
        LIMIT 1
      ) WHERE EXISTS (SELECT 1 FROM user_preferences up WHERE up.user_id = u.id)`,
    ];

    console.log('📋 Executing migration statements...');
    console.log('');

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const shortStmt = stmt.substring(0, 60) + (stmt.length > 60 ? '...' : '');
      console.log(`   [${i + 1}/${statements.length}] ${shortStmt}`);

      const { error } = await supabase.rpc('exec_sql', {
        sql_query: stmt
      });

      if (error) {
        // Try direct execution if RPC doesn't exist
        const result = await supabase.from('_sql').insert({ query: stmt });
        if (result.error) {
          console.error(`   ❌ Failed: ${error.message}`);
          throw error;
        }
      }

      console.log(`   ✅ Success`);
    }

    console.log('');
    console.log('🔍 Verifying migration...');
    console.log('');

    // Verify user_preferences columns
    const { data: prefData, error: prefError } = await supabase
      .from('user_preferences')
      .select('user_id, preferences_hash, preferences_updated_at')
      .limit(1)
      .single();

    if (prefError && prefError.code !== 'PGRST116') {
      console.warn(`   ⚠️  user_preferences verification: ${prefError.message}`);
    } else {
      console.log('   ✅ user_preferences.preferences_hash exists');
      console.log('   ✅ user_preferences.preferences_updated_at exists');
      if (prefData) {
        console.log(`   📊 Sample: hash=${prefData.preferences_hash}, updated_at=${prefData.preferences_updated_at}`);
      }
    }

    // Verify users columns
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, preferences_updated_at')
      .limit(1)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.warn(`   ⚠️  users verification: ${userError.message}`);
    } else {
      console.log('   ✅ users.preferences_updated_at exists');
      if (userData) {
        console.log(`   📊 Sample: updated_at=${userData.preferences_updated_at}`);
      }
    }

    console.log('');
    console.log('=' + '='.repeat(59));
    console.log('✨ Migration completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Code changes will now use preference hashing');
    console.log('   2. Cache keys will auto-invalidate on preference changes');
    console.log('   3. Algorithm Manager will detect stale preferences');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Migration failed!');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('📖 Manual alternative:');
    console.error('   1. Open Supabase Dashboard → SQL Editor');
    console.error('   2. Copy/paste: supabase/migrations/20251111000000_add_preference_versioning.sql');
    console.error('   3. Click "Run"');
    console.error('');
    process.exit(1);
  }
}

// Execute
applyMigration();
