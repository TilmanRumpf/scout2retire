#!/usr/bin/env node

/**
 * EMERGENCY FIX: Restore Tilman's Executive Admin Access
 * This script ensures tilman.rumpf@gmail.com has full admin access
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

async function fixTilmanAdminAccess() {
  console.log('🔧 EMERGENCY FIX: Restoring Tilman\'s Executive Admin Access...\n');

  try {
    // 1. Check current state
    console.log('📊 Checking current state of tilman.rumpf@gmail.com...');
    const { data: currentUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, admin_role, is_admin, full_name')
      .eq('email', 'tilman.rumpf@gmail.com')
      .single();

    if (checkError) {
      console.error('❌ Error checking user:', checkError);
      return;
    }

    if (!currentUser) {
      console.error('❌ User tilman.rumpf@gmail.com not found!');
      return;
    }

    console.log('Current state:', {
      id: currentUser.id,
      email: currentUser.email,
      admin_role: currentUser.admin_role,
      is_admin: currentUser.is_admin,
      full_name: currentUser.full_name
    });

    // 2. Fix BOTH admin fields to ensure compatibility
    console.log('\n🔧 Applying comprehensive admin fix...');
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        admin_role: 'executive_admin',  // New system
        is_admin: true                   // Legacy system
      })
      .eq('email', 'tilman.rumpf@gmail.com')
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating user:', updateError);
      return;
    }

    console.log('✅ Successfully updated user:', {
      id: updatedUser.id,
      email: updatedUser.email,
      admin_role: updatedUser.admin_role,
      is_admin: updatedUser.is_admin
    });

    // 3. Verify the fix worked
    console.log('\n🔍 Verifying admin access...');

    // Check if is_user_admin() function recognizes the user
    const { data: adminCheck, error: adminCheckError } = await supabase.rpc(
      'is_user_admin',
      {},
      {
        // Simulate being logged in as Tilman
        headers: {
          'x-user-id': currentUser.id
        }
      }
    );

    if (!adminCheckError && adminCheck === true) {
      console.log('✅ is_user_admin() function confirms admin access!');
    } else if (adminCheckError) {
      console.log('⚠️ Could not verify with is_user_admin() function:', adminCheckError.message);
    }

    // 4. Check all admin users to confirm Tilman is in the list
    console.log('\n📊 All users with admin access:');
    const { data: allAdmins } = await supabase
      .from('users')
      .select('email, admin_role, is_admin')
      .or('admin_role.eq.executive_admin,admin_role.eq.assistant_admin,is_admin.eq.true')
      .order('email');

    if (allAdmins) {
      allAdmins.forEach(admin => {
        const marker = admin.email === 'tilman.rumpf@gmail.com' ? ' ⭐' : '';
        console.log(`  - ${admin.email}: admin_role=${admin.admin_role}, is_admin=${admin.is_admin}${marker}`);
      });
    }

    // 5. Final instructions
    console.log('\n✅ ADMIN ACCESS RESTORED!\n');
    console.log('📋 Next steps:');
    console.log('1. Log out of the application');
    console.log('2. Log back in with tilman.rumpf@gmail.com');
    console.log('3. You should now see:');
    console.log('   - Admin gear icon in the header');
    console.log('   - Admin Panel in the QuickNav menu');
    console.log('   - Access to /admin route');
    console.log('\n🔄 Frontend components will now check BOTH:');
    console.log('   - admin_role = "executive_admin" (new system) ✅');
    console.log('   - is_admin = true (legacy system) ✅');
    console.log('\nYour account has both, ensuring maximum compatibility!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixTilmanAdminAccess();