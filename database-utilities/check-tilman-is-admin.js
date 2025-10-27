#!/usr/bin/env node

// CHECK TILMAN'S is_admin STATUS

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTilmanIsAdmin() {
  console.log('🔍 CHECKING is_admin STATUS FOR tilman.rumpf@gmail.com');
  console.log('='.repeat(80));
  console.log('');

  // Check Tilman's is_admin status
  const { data, error } = await supabase
    .from('users')
    .select('id, email, admin_role, is_admin')
    .eq('email', 'tilman.rumpf@gmail.com')
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('Tilman\'s current status:');
  console.log(`  Email: ${data.email}`);
  console.log(`  ID: ${data.id}`);
  console.log(`  admin_role: ${data.admin_role}`);
  console.log(`  is_admin: ${data.is_admin}`);
  console.log('');

  if (!data.is_admin) {
    console.log('🚨 PROBLEM FOUND: is_admin is FALSE/NULL');
    console.log('');
    console.log('Even though admin_role = "executive_admin", the is_admin flag is not set.');
    console.log('');
    console.log('💡 FIX: Run this SQL:');
    console.log('');
    console.log(`UPDATE users SET is_admin = true WHERE email = 'tilman.rumpf@gmail.com';`);
    console.log('');
  } else {
    console.log('✅ is_admin is TRUE - admin access should work');
    console.log('');
    console.log('If admin features still not working, the issue is likely:');
    console.log('  1. Frontend checking wrong field (checking is_admin vs admin_role)');
    console.log('  2. Auth context not loaded properly');
    console.log('  3. RLS policy blocking admin operations');
  }

  // Show all users with is_admin=true for comparison
  console.log('='.repeat(80));
  console.log('📊 ALL USERS WITH is_admin=true:');
  console.log('');

  const { data: adminUsers, error: adminError } = await supabase
    .from('users')
    .select('email, admin_role, is_admin')
    .eq('is_admin', true);

  if (adminError) {
    console.error('❌ Error fetching admin users:', adminError);
  } else {
    adminUsers.forEach(user => {
      const current = user.email === 'tilman.rumpf@gmail.com' ? ' ← CURRENT USER' : '';
      console.log(`  ${user.email.padEnd(35)} admin_role: ${(user.admin_role || 'NULL').padEnd(20)} is_admin: ${user.is_admin}${current}`);
    });
  }
}

checkTilmanIsAdmin().catch(console.error);
