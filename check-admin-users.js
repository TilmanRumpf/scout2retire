#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdmins() {
  console.log('🔍 Checking for admin users...\n');

  // Check by admin_role
  const { data: adminsByRole } = await supabase
    .from('users')
    .select('id, email, is_admin, admin_role')
    .not('admin_role', 'is', null)
    .limit(5);

  console.log('📊 Users with admin_role set:');
  if (adminsByRole && adminsByRole.length > 0) {
    console.log(JSON.stringify(adminsByRole, null, 2));
  } else {
    console.log('  None found');
  }

  // Check all users to see who might be admin
  console.log('\n📊 All users (first 5):');
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, email, is_admin, admin_role')
    .limit(5);

  if (allUsers) {
    console.log(JSON.stringify(allUsers, null, 2));
  }

  // Check who tobiasrumpf is
  console.log('\n📊 Checking tobiasrumpf@gmx.de specifically:');
  const { data: tobias } = await supabase
    .from('users')
    .select('id, email, is_admin, admin_role')
    .eq('email', 'tobiasrumpf@gmx.de')
    .maybeSingle();

  if (tobias) {
    console.log(JSON.stringify(tobias, null, 2));
  } else {
    console.log('  Not found');
  }
}

checkAdmins();
