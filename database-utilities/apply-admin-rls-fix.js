#!/usr/bin/env node

/**
 * Apply the admin RLS fix migration programmatically
 * This fixes the column mismatch in RLS policies
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

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

async function applyAdminRLSFix() {
  console.log('🔧 Applying Admin RLS Fix Migration...\n');
  console.log('This will fix the column mismatch in RLS policies that broke admin access.\n');

  try {
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251105_fix_admin_rls_column_mismatch.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');

    console.log('📋 Migration file loaded successfully');
    console.log('📊 Migration will:');
    console.log('  1. Fix users table RLS policies to check both is_admin AND admin_role');
    console.log('  2. Fix admin_score_adjustments policies');
    console.log('  3. Fix towns table admin policies');
    console.log('  4. Fix category_limits, feature_definitions, user_categories policies');
    console.log('  5. Update is_user_admin() function');
    console.log('  6. Ensure Tilman has both admin fields set correctly\n');

    // Since we can't run raw SQL directly, we need to break it into parts
    // and use individual operations

    console.log('🔧 Step 1: Updating Tilman\'s admin fields...');

    const { data: tilmanUpdate, error: tilmanError } = await supabase
      .from('users')
      .update({
        is_admin: true,
        admin_role: 'executive_admin'
      })
      .eq('email', 'tilman.rumpf@gmail.com')
      .select()
      .single();

    if (tilmanError) {
      console.error('❌ Error updating Tilman:', tilmanError);
      return;
    }

    console.log('✅ Tilman updated:', {
      email: tilmanUpdate.email,
      is_admin: tilmanUpdate.is_admin,
      admin_role: tilmanUpdate.admin_role
    });

    // Update other admins
    console.log('\n🔧 Step 2: Updating other admin users...');

    const adminEmails = [
      'tobias.rumpf1@gmail.com',
      'madara.grisule@gmail.com',
      'tobiasrumpf@gmx.de'
    ];

    for (const email of adminEmails) {
      const { data: adminUpdate, error: adminError } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('email', email)
        .not('admin_role', 'is', null)
        .select('email, is_admin, admin_role')
        .single();

      if (adminError) {
        console.log(`  ⚠️ Skipping ${email}:`, adminError.message);
      } else if (adminUpdate) {
        console.log(`  ✅ ${email}: is_admin=${adminUpdate.is_admin}, admin_role=${adminUpdate.admin_role}`);
      }
    }

    // Verify all admins
    console.log('\n🔍 Step 3: Verifying all admin users...');

    const { data: allAdmins, error: verifyError } = await supabase
      .from('users')
      .select('email, is_admin, admin_role')
      .or('is_admin.eq.true,admin_role.in.(executive_admin,assistant_admin,admin)');

    if (verifyError) {
      console.error('❌ Error verifying admins:', verifyError);
    } else if (allAdmins) {
      console.log(`\n📊 Total admin users: ${allAdmins.length}`);
      allAdmins.forEach(admin => {
        const isTilman = admin.email === 'tilman.rumpf@gmail.com' ? ' ⭐' : '';
        console.log(`  - ${admin.email}: is_admin=${admin.is_admin}, admin_role=${admin.admin_role}${isTilman}`);
      });
    }

    console.log('\n⚠️  IMPORTANT: RLS policies cannot be updated via JavaScript SDK.');
    console.log('📝 To complete the fix, you need to run the migration in Supabase:');
    console.log('\n1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy the contents of: supabase/migrations/20251105_fix_admin_rls_column_mismatch.sql');
    console.log('3. Paste and run the migration');
    console.log('4. Log out and log back in to refresh your session\n');

    console.log('✅ User data has been fixed. Admin fields are now correct.');
    console.log('🔄 Next steps:');
    console.log('  1. Run the SQL migration in Supabase Dashboard');
    console.log('  2. Log out of the application');
    console.log('  3. Log back in as tilman.rumpf@gmail.com');
    console.log('  4. You should see the admin gear icon and access /admin');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
applyAdminRLSFix();