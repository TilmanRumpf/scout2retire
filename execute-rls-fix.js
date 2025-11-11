#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔧 Fixing RLS Policies for Algorithm Manager\n');
console.log('Step 1: Updating onboarding_responses policy...');

// We'll use the REST API to query, but for DDL we need psql or dashboard
// Let me print the SQL for the user to run

const sql1 = `
-- Migration 1: Fix onboarding_responses RLS
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

const sql2 = `
-- Migration 2: Fix user_preferences RLS
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

console.log('\n📋 COPY AND RUN THIS SQL IN SUPABASE DASHBOARD:\n');
console.log('=' .repeat(80));
console.log(sql1);
console.log(sql2);
console.log('=' .repeat(80));
console.log('\n📍 Where to run:');
console.log('1. Go to: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new');
console.log('2. Paste the SQL above');
console.log('3. Click RUN');
console.log('4. Should see: "Success. No rows returned"\n');

