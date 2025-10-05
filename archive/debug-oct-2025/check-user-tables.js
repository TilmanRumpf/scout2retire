#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserTables() {
  console.log('🔍 Checking user data tables...\n');

  // Try public.users
  console.log('1. Checking public.users table:');
  const { data: publicUsers, error: publicError } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (publicError) {
    console.log('   ❌ Error:', publicError.message);
  } else {
    console.log(`   ✅ Found ${publicUsers?.length || 0} users`);
    if (publicUsers?.length > 0) {
      console.log('   Sample:', publicUsers[0]);
    }
  }

  // Try auth.users (via admin API)
  console.log('\n2. Checking auth.users (via Admin API):');
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 3
  });

  if (authError) {
    console.log('   ❌ Error:', authError.message);
  } else {
    console.log(`   ✅ Found ${authUsers?.users?.length || 0} auth users`);
    if (authUsers?.users?.length > 0) {
      console.log('   Sample:', {
        id: authUsers.users[0].id,
        email: authUsers.users[0].email,
        created_at: authUsers.users[0].created_at
      });
    }
  }

  // Check if we need to join auth.users with public.users
  console.log('\n3. Relationship check:');
  console.log('   Auth users have user metadata that can store profile data');
  console.log('   Public.users table likely stores extended profile + tier info');
  console.log('   Need to join: auth.users.id = public.users.id');
}

checkUserTables();
