#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixTilmanAdmin() {
  console.log('🔍 Checking Tilman\'s admin role...\n');

  // Check current role
  const { data: user, error: checkError } = await supabase
    .from('users')
    .select('id, email, admin_role, is_admin')
    .ilike('email', '%tilman%')
    .single();

  if (checkError) {
    console.error('❌ Error finding user:', checkError);
    return;
  }

  console.log('Current status:');
  console.log('Email:', user.email);
  console.log('admin_role:', user.admin_role);
  console.log('is_admin:', user.is_admin);
  console.log('');

  // Update to executive_admin
  const { data: updated, error: updateError } = await supabase
    .from('users')
    .update({
      admin_role: 'executive_admin',
      is_admin: true
    })
    .eq('id', user.id)
    .select()
    .single();

  if (updateError) {
    console.error('❌ Error updating role:', updateError);
    return;
  }

  console.log('✅ Updated to executive_admin!');
  console.log('New status:');
  console.log('Email:', updated.email);
  console.log('admin_role:', updated.admin_role);
  console.log('is_admin:', updated.is_admin);
  console.log('');
  console.log('🎉 You now have full access to /admin/paywall');
}

fixTilmanAdmin();
