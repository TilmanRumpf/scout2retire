#!/usr/bin/env node

// INVESTIGATE ADMIN ACCESS FOR tilman.rumpf@gmail.com

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

async function investigateAdminAccess() {
  console.log('🔍 INVESTIGATING ADMIN ACCESS FOR tilman.rumpf@gmail.com');
  console.log('='.repeat(80));
  console.log('');

  try {
    // 1. Check Tilman's current user record
    console.log('📊 Step 1: Checking Tilman\'s user record...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, admin_role, community_role, created_at')
      .eq('email', 'tilman.rumpf@gmail.com')
      .single();

    if (userError) {
      console.error('❌ Error fetching user:', userError);
    } else if (!userData) {
      console.log('❌ User not found in database!');
    } else {
      console.log('✅ User found:');
      console.log(`   ID: ${userData.id}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Admin Role: ${userData.admin_role || 'NULL'}`);
      console.log(`   Community Role: ${userData.community_role || 'NULL'}`);
      console.log(`   Created: ${userData.created_at}`);
    }
    console.log('');

    // 2. Check what columns actually exist in users table
    console.log('📋 Step 2: Checking users table schema...');
    const { data: columnsData, error: columnsError } = await supabase.rpc('get_table_columns', {
      table_name: 'users'
    });

    if (columnsError) {
      // Try alternate method if RPC doesn't exist
      console.log('⚠️ RPC method not available, using direct query...');

      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'users')
        .in('column_name', ['is_admin', 'admin_role', 'community_role'])
        .order('column_name');

      if (schemaError) {
        console.log('❌ Could not query schema directly:', schemaError.message);
        console.log('   Checking columns via user record instead...');

        // Check what columns exist in the actual user record
        if (userData) {
          console.log('✅ Columns present in user record:');
          Object.keys(userData).forEach(col => {
            console.log(`   - ${col}: ${typeof userData[col]}`);
          });

          console.log('');
          console.log(`❓ Does 'is_admin' column exist? ${userData.hasOwnProperty('is_admin') ? 'YES' : 'NO'}`);
          if (userData.hasOwnProperty('is_admin')) {
            console.log(`   Value: ${userData.is_admin}`);
          }
        }
      } else {
        console.log('✅ Admin-related columns in users table:');
        schemaData.forEach(col => {
          console.log(`   - ${col.column_name} (${col.data_type})`);
        });
      }
    } else {
      console.log('✅ Columns found:', columnsData);
    }
    console.log('');

    // 3. Check if is_user_admin() function exists and works
    console.log('🔧 Step 3: Testing is_user_admin() function...');
    const { data: adminCheckData, error: adminCheckError } = await supabase.rpc('is_user_admin');

    if (adminCheckError) {
      console.log('❌ is_user_admin() function error:', adminCheckError.message);

      // Check if function exists
      const { data: funcExists, error: funcError } = await supabase
        .from('pg_proc')
        .select('proname')
        .eq('proname', 'is_user_admin')
        .single();

      if (funcError || !funcExists) {
        console.log('   ❌ Function does not exist in database');
      } else {
        console.log('   ✅ Function exists but cannot be called (may require auth context)');
      }
    } else {
      console.log(`✅ is_user_admin() returned: ${adminCheckData}`);
    }
    console.log('');

    // 4. Check what admin roles exist in the database
    console.log('👥 Step 4: Checking all admin roles in database...');
    const { data: adminRoles, error: rolesError } = await supabase
      .from('users')
      .select('admin_role')
      .not('admin_role', 'is', null);

    if (rolesError) {
      console.log('❌ Error fetching admin roles:', rolesError.message);
    } else {
      const roleCounts = {};
      adminRoles.forEach(user => {
        roleCounts[user.admin_role] = (roleCounts[user.admin_role] || 0) + 1;
      });

      console.log('✅ Admin roles distribution:');
      Object.entries(roleCounts).forEach(([role, count]) => {
        console.log(`   - ${role}: ${count} user(s)`);
      });
      console.log(`   Total users with admin_role: ${adminRoles.length}`);
    }
    console.log('');

    // 5. Check if is_admin column exists by trying to select it
    console.log('🔍 Step 5: Checking if is_admin column exists...');
    const { data: isAdminCheck, error: isAdminError } = await supabase
      .from('users')
      .select('id, is_admin')
      .limit(1);

    if (isAdminError) {
      if (isAdminError.message.includes('column') && isAdminError.message.includes('does not exist')) {
        console.log('❌ is_admin column does NOT exist in users table');
      } else {
        console.log('❌ Error checking is_admin column:', isAdminError.message);
      }
    } else {
      console.log('✅ is_admin column EXISTS');
      const trueCount = isAdminCheck.filter(u => u.is_admin === true).length;
      console.log(`   Found ${isAdminCheck.length} users, ${trueCount} with is_admin=true`);

      // Get count of all users with is_admin=true
      const { count, error: countError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('is_admin', true);

      if (!countError) {
        console.log(`   Total users with is_admin=true: ${count}`);
      }
    }
    console.log('');

    // 6. Summary and recommendations
    console.log('='.repeat(80));
    console.log('📋 SUMMARY AND RECOMMENDATIONS:');
    console.log('');

    if (userData) {
      console.log('Current state:');
      console.log(`  Email: ${userData.email}`);
      console.log(`  admin_role: ${userData.admin_role || 'NULL'}`);
      console.log(`  community_role: ${userData.community_role || 'NULL'}`);
      console.log('');

      if (!userData.admin_role) {
        console.log('⚠️ PROBLEM IDENTIFIED:');
        console.log('   admin_role is NULL for tilman.rumpf@gmail.com');
        console.log('');
        console.log('💡 RECOMMENDED FIX:');
        console.log('   Run this SQL to grant admin access:');
        console.log('');
        console.log(`   UPDATE users SET admin_role = 'super_admin' WHERE email = 'tilman.rumpf@gmail.com';`);
        console.log('');
      } else {
        console.log('✅ admin_role is set to:', userData.admin_role);
        console.log('');
        console.log('🔍 If admin features still not working, check:');
        console.log('   1. Frontend code checking admin permissions');
        console.log('   2. RLS policies on admin-restricted tables');
        console.log('   3. is_user_admin() function implementation');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

investigateAdminAccess().catch(console.error);
