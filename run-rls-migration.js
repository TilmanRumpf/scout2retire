#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🔧 Running RLS Migration - Step 1: onboarding_responses\n');

  // Migration 1: onboarding_responses
  const sql1 = `
    DROP POLICY IF EXISTS "onboarding_responses_select_policy" ON onboarding_responses;
    DROP POLICY IF EXISTS "Users can view own onboarding responses" ON onboarding_responses;
    DROP POLICY IF EXISTS "Enable read access for own responses" ON onboarding_responses;

    CREATE POLICY "onboarding_responses_select_policy"
    ON onboarding_responses
    FOR SELECT
    USING (
      auth.uid() = user_id
      OR
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_admin = true
      )
    );
  `;

  const { data: data1, error: error1 } = await supabase.rpc('exec_sql', { sql: sql1 });

  if (error1) {
    console.log('❌ Migration 1 failed:', error1.message);
    console.log('Trying alternative method...\n');
    
    // Alternative: Use raw SQL through postgrest
    const { error: altError1 } = await supabase.from('_migrations').select('*').limit(0);
    console.log('Will run SQL manually through Supabase dashboard');
    return false;
  } else {
    console.log('✅ Migration 1 SUCCESS: onboarding_responses policy updated\n');
  }

  console.log('🔧 Running RLS Migration - Step 2: user_preferences\n');

  // Migration 2: user_preferences
  const sql2 = `
    DROP POLICY IF EXISTS "user_preferences_select_policy" ON user_preferences;
    DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
    DROP POLICY IF EXISTS "Enable read access for own preferences" ON user_preferences;

    CREATE POLICY "user_preferences_select_policy"
    ON user_preferences
    FOR SELECT
    USING (
      auth.uid() = user_id
      OR
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_admin = true
      )
    );
  `;

  const { data: data2, error: error2 } = await supabase.rpc('exec_sql', { sql: sql2 });

  if (error2) {
    console.log('❌ Migration 2 failed:', error2.message);
    return false;
  } else {
    console.log('✅ Migration 2 SUCCESS: user_preferences policy updated\n');
  }

  console.log('🎉 Both migrations completed successfully!\n');
  return true;
}

runMigration();
