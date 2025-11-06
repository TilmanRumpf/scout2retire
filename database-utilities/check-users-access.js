#!/usr/bin/env node

/**
 * CHECK USERS TABLE ACCESS
 *
 * Debug why Algorithm Manager can't see users
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Test with both anon and service role keys
const supabaseAnon = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const supabaseService = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsersAccess() {
  console.log('🔍 Checking Users Table Access...\n');

  // 1. Check with anon key (what the frontend uses)
  console.log('1️⃣ Testing with ANON key (frontend):');
  const { data: anonUsers, error: anonError } = await supabaseAnon
    .from('users')
    .select('id, email, full_name')
    .order('email');

  if (anonError) {
    console.log('❌ ANON key error:', anonError.message);
    console.log('   This means frontend cannot access users table!');
  } else {
    console.log(`✅ ANON key can see ${anonUsers.length} users`);

    // Check for Tobias users
    const tobiasUsers = anonUsers.filter(u =>
      u.email?.toLowerCase().includes('tobias') ||
      u.full_name?.toLowerCase().includes('tobias')
    );

    if (tobiasUsers.length > 0) {
      console.log('   Found Tobias users:');
      tobiasUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.full_name || 'no name'})`);
      });
    } else {
      console.log('   ⚠️ No Tobias users found!');
    }
  }

  console.log('\n2️⃣ Testing with SERVICE ROLE key:');
  const { data: serviceUsers, error: serviceError } = await supabaseService
    .from('users')
    .select('id, email, full_name')
    .order('email');

  if (serviceError) {
    console.log('❌ SERVICE key error:', serviceError.message);
  } else {
    console.log(`✅ SERVICE key can see ${serviceUsers.length} users`);

    // Check for Tobias users
    const tobiasUsers = serviceUsers.filter(u =>
      u.email?.toLowerCase().includes('tobias') ||
      u.full_name?.toLowerCase().includes('tobias')
    );

    if (tobiasUsers.length > 0) {
      console.log('   Found Tobias users:');
      tobiasUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.full_name || 'no name'})`);
      });
    }
  }

  // 3. Check RLS policies
  console.log('\n3️⃣ Checking RLS Policies:');

  const { data: policies, error: policyError } = await supabaseService
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'users');

  if (!policyError && policies) {
    console.log(`   Found ${policies.length} RLS policies on users table:`);
    policies.forEach(p => {
      console.log(`   - ${p.policyname}: ${p.cmd} (${p.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'})`);
    });
  }

  // 4. Check if RLS is enabled
  const { data: tables, error: tableError } = await supabaseService
    .from('pg_tables')
    .select('*')
    .eq('tablename', 'users')
    .single();

  if (!tableError && tables) {
    console.log('\n4️⃣ Table Info:');
    console.log(`   Schema: ${tables.schemaname}`);
    console.log(`   Owner: ${tables.tableowner}`);
  }

  console.log('\n📋 SUMMARY:');
  if (anonError) {
    console.log('❌ PROBLEM: Frontend cannot access users table!');
    console.log('   This is why the Algorithm Manager can\'t see users.');
    console.log('\n🔧 FIX NEEDED:');
    console.log('   Either:');
    console.log('   1. Add RLS policy to allow authenticated users to see all users');
    console.log('   2. Or make Algorithm Manager use service role key (not recommended)');
  } else if (anonUsers.length === 0) {
    console.log('⚠️ PROBLEM: No users visible to frontend!');
  } else {
    console.log('✅ Frontend can access users table');
    console.log(`✅ Can see ${anonUsers.length} users`);
  }
}

checkUsersAccess();