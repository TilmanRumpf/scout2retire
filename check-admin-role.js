#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminRole() {
  console.log('🔍 Checking users table for admin role column...\n');

  // Get schema for users table
  const { data: columns } = await supabase
    .from('users')
    .select('*')
    .limit(1)
    .single();

  if (columns) {
    console.log('📋 Users table columns:');
    console.log(Object.keys(columns).sort().join(', '));

    console.log('\n🔍 Admin-related columns:');
    const adminCols = Object.keys(columns).filter(k => 
      k.includes('admin') || k.includes('role') || k.includes('is_')
    );
    
    if (adminCols.length > 0) {
      console.log('Found:', adminCols.join(', '));
      
      // Check actual admin users
      console.log('\n📊 Sample admin users:');
      const { data: adminUsers } = await supabase
        .from('users')
        .select('id, email, is_admin, user_type')
        .eq('is_admin', true)
        .limit(3);

      if (adminUsers && adminUsers.length > 0) {
        console.log(JSON.stringify(adminUsers, null, 2));
      } else {
        console.log('No users with is_admin = true found');
      }
    } else {
      console.log('⚠️  No admin-related columns found');
    }
  }
}

checkAdminRole();
