#!/usr/bin/env node

/**
 * Apply leave_group function migration
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Applying leave_group function...\n');

  try {
    const sql = fs.readFileSync(
      resolve(__dirname, '../supabase/migrations/20251007130000_leave_group_function.sql'),
      'utf8'
    );

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      throw error;
    }

    console.log('✅ leave_group function created successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);

    // Try alternative: use service role to query directly
    console.log('\n🔧 Trying alternative method...\n');

    const sql = `
CREATE OR REPLACE FUNCTION leave_group(p_thread_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_role member_role;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT role INTO v_user_role
  FROM group_chat_members
  WHERE thread_id = p_thread_id AND user_id = v_user_id;

  IF v_user_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are not a member of this group');
  END IF;

  IF v_user_role = 'creator' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Creator must transfer ownership before leaving');
  END IF;

  DELETE FROM group_chat_members
  WHERE thread_id = p_thread_id AND user_id = v_user_id;

  INSERT INTO group_role_audit (thread_id, actor_id, action, target_user_id, old_role, new_role)
  VALUES (p_thread_id, v_user_id, 'leave', v_user_id, v_user_role, NULL);

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION leave_group TO authenticated;
`;

    console.log('📋 SQL to run in Supabase Dashboard:');
    console.log('=' .repeat(60));
    console.log(sql);
    console.log('=' .repeat(60));

    process.exit(1);
  }
}

applyMigration();
