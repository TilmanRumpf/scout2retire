/**
 * PERMISSION SYSTEM AUDIT
 * Analyzes the three overlapping permission systems
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function auditPermissions() {
  console.log('=== PERMISSION SYSTEM AUDIT ===\n');

  // Get all users with their permission columns
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, admin_role, account_tier, category_id, is_admin');

  if (error) {
    console.error('Error fetching users:', error);
    process.exit(1);
  }

  console.log('Total users:', users?.length || 0, '\n');

  // Group by admin_role
  const adminRoles = {};
  users?.forEach(u => {
    const role = u.admin_role || 'null';
    adminRoles[role] = (adminRoles[role] || 0) + 1;
  });

  console.log('=== admin_role distribution ===');
  Object.entries(adminRoles).sort(([,a], [,b]) => b - a).forEach(([role, count]) => {
    console.log(`  ${role}: ${count}`);
  });

  // Group by account_tier
  const tiers = {};
  users?.forEach(u => {
    const tier = u.account_tier || 'null';
    tiers[tier] = (tiers[tier] || 0) + 1;
  });

  console.log('\n=== account_tier distribution ===');
  Object.entries(tiers).sort(([,a], [,b]) => b - a).forEach(([tier, count]) => {
    console.log(`  ${tier}: ${count}`);
  });

  // Check category_id
  const categoryCounts = {};
  users?.forEach(u => {
    const cat = u.category_id ? 'has_category_id' : 'null';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  console.log('\n=== category_id distribution ===');
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });

  // Check is_admin
  const isAdminCount = users?.filter(u => u.is_admin === true).length || 0;
  console.log('\n=== is_admin boolean ===');
  console.log(`  true: ${isAdminCount}`);
  console.log(`  false: ${(users?.length || 0) - isAdminCount}`);

  // Show mismatches
  console.log('\n=== MISMATCHES (admin_role vs account_tier) ===');
  const mismatches = users?.filter(u => {
    if (u.account_tier === 'execadmin' && u.admin_role !== 'executive_admin') return true;
    if (u.admin_role === 'executive_admin' && u.account_tier !== 'execadmin') return true;
    if (u.account_tier === 'assistant_admin' && u.admin_role !== 'admin') return true;
    if (u.account_tier === 'town_manager' && !u.admin_role) return true;
    return false;
  });

  console.log(`Found ${mismatches?.length || 0} mismatches`);
  mismatches?.forEach(u => {
    console.log(`  ${u.email}:`);
    console.log(`    admin_role: ${u.admin_role || 'null'}`);
    console.log(`    account_tier: ${u.account_tier || 'null'}`);
  });

  // Show executive admins
  console.log('\n=== EXECUTIVE ADMINS ===');
  const execs = users?.filter(u => u.admin_role === 'executive_admin' || u.account_tier === 'execadmin');
  console.log(`Found ${execs?.length || 0} executive admins:`);
  execs?.forEach(u => {
    console.log(`  ${u.email}:`);
    console.log(`    admin_role: ${u.admin_role || 'null'}`);
    console.log(`    account_tier: ${u.account_tier || 'null'}`);
    console.log(`    category_id: ${u.category_id || 'null'}`);
    console.log(`    is_admin: ${u.is_admin || false}`);
  });

  // Recommendations
  console.log('\n=== RECOMMENDATIONS ===');
  console.log('1. Migrate account_tier admin values to admin_role');
  console.log('2. Use account_tier ONLY for subscription tiers (free/freemium/premium/enterprise)');
  console.log('3. Use admin_role for ALL admin hierarchy (user/moderator/admin/executive_admin)');
  console.log('4. Deprecate account_tier enum values: town_manager, assistant_admin, execadmin');
  console.log('5. Use category_id FK for subscription tier features');
  console.log('6. Consider removing is_admin boolean (redundant with admin_role)');

  process.exit(0);
}

auditPermissions().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
