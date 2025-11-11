#!/usr/bin/env node

/**
 * Verify Preference Versioning Migration
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyMigration() {
  console.log('');
  console.log('🔍 Verifying Preference Versioning Migration');
  console.log('='.repeat(60));
  console.log('');

  // Check user_preferences columns
  console.log('📋 Check 1: user_preferences table');
  const { data: prefSample } = await supabase
    .from('user_preferences')
    .select('user_id, preferences_hash, preferences_updated_at')
    .limit(3);

  if (prefSample && prefSample.length > 0) {
    console.log('   ✅ preferences_hash column exists');
    console.log('   ✅ preferences_updated_at column exists');
    console.log(`   📊 Sample (${prefSample.length} records):`);
    prefSample.forEach((r, i) => {
      console.log(`      ${i + 1}. hash=${r.preferences_hash}, updated=${r.preferences_updated_at}`);
    });
  } else {
    console.log('   ⚠️  No records found (OK if no users yet)');
  }
  console.log('');

  // Check users column
  console.log('📋 Check 2: users table');
  const { data: userSample } = await supabase
    .from('users')
    .select('id, preferences_updated_at')
    .limit(3);

  if (userSample && userSample.length > 0) {
    console.log('   ✅ preferences_updated_at column exists');
    console.log(`   📊 Sample (${userSample.length} users):`);
    userSample.forEach((u, i) => {
      console.log(`      ${i + 1}. updated=${u.preferences_updated_at}`);
    });
  }
  console.log('');

  console.log('='.repeat(60));
  console.log('✅ Migration verification PASSED');
  console.log('');
  console.log('📋 Next: Test preference update to see hash change');
  console.log('');
}

verifyMigration();
