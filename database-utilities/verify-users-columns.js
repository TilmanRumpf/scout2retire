#!/usr/bin/env node

/**
 * Verify the actual columns in the users table
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyUsersColumns() {
  console.log('🔍 Verifying users table columns...\n');

  try {
    // Just query a single row to see what columns exist
    console.log('📊 Checking columns by querying a sample user...\n');
    const { data: sampleUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single();

    if (selectError) {
      console.error('❌ Error querying users:', selectError);
    } else if (sampleUser) {
      const columnNames = Object.keys(sampleUser);
      console.log('📋 Columns found in users table:');
      columnNames.forEach(col => {
        const isAdminRelated = col.includes('admin') || col.includes('role');
        const marker = isAdminRelated ? ' ⭐' : '';
        console.log(`  - ${col}${marker}`);
      });

      console.log('\n🔍 Admin-related columns:');
      console.log(`  - has 'is_admin' column: ${columnNames.includes('is_admin') ? '✅ YES' : '❌ NO'}`);
      console.log(`  - has 'admin_role' column: ${columnNames.includes('admin_role') ? '✅ YES' : '❌ NO'}`);
      console.log(`  - has 'community_role' column: ${columnNames.includes('community_role') ? '✅ YES' : '❌ NO'}`);

      if (columnNames.includes('is_admin')) {
        console.log(`  - is_admin type: ${typeof sampleUser.is_admin}`);
        console.log(`  - is_admin value: ${sampleUser.is_admin}`);
      }

      if (columnNames.includes('admin_role')) {
        console.log(`  - admin_role type: ${typeof sampleUser.admin_role}`);
        console.log(`  - admin_role value: ${sampleUser.admin_role}`);
      }
    }

    // Now check Tilman's specific record
    console.log('\n📊 Checking Tilman\'s user record...');
    const { data: tilman, error: tilmanError } = await supabase
      .from('users')
      .select('id, email, admin_role, community_role, full_name')
      .eq('email', 'tilman.rumpf@gmail.com')
      .single();

    if (tilmanError) {
      console.error('❌ Error fetching Tilman:', tilmanError);
    } else if (tilman) {
      console.log('\nTilman\'s record:');
      Object.entries(tilman).forEach(([key, value]) => {
        console.log(`  - ${key}: ${value}`);
      });
    }

    // Check if is_admin column exists by trying to query it
    console.log('\n🔍 Testing if is_admin column exists...');
    const { data: isAdminTest, error: isAdminError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('email', 'tilman.rumpf@gmail.com')
      .single();

    if (isAdminError && isAdminError.message.includes('column')) {
      console.log('❌ Column "is_admin" DOES NOT EXIST');
      console.log('   Error:', isAdminError.message);
    } else if (isAdminTest) {
      console.log('✅ Column "is_admin" EXISTS');
      console.log('   Value for Tilman:', isAdminTest.is_admin);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the verification
verifyUsersColumns();