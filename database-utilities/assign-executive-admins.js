#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🔒 SECURITY: List your partners' email addresses here
const EXECUTIVE_ADMINS = [
  'tilman@example.com',           // Replace with actual email
  'partner2@example.com',         // Replace with actual email
  // Add more as needed
];

async function assignExecutiveAdmins() {
  console.log('🔒 Assigning Executive Admin roles...\n');

  // Get execadmin category ID
  const { data: category, error: catError } = await supabase
    .from('user_categories')
    .select('id')
    .eq('category_code', 'execadmin')
    .single();

  if (catError || !category) {
    console.error('❌ execadmin category not found:', catError);
    return;
  }

  console.log(`✓ Found execadmin category: ${category.id}\n`);

  // Process each email
  for (const email of EXECUTIVE_ADMINS) {
    console.log(`Processing: ${email}`);

    // Find user by email
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, category_id, admin_role')
      .ilike('email', email);

    if (userError) {
      console.error(`  ❌ Error finding user: ${userError.message}`);
      continue;
    }

    if (!users || users.length === 0) {
      console.log(`  ⚠️  User not found - they need to sign up first`);
      continue;
    }

    const user = users[0];

    // Update user to execadmin category + executive_admin role
    const { error: updateError } = await supabase
      .from('users')
      .update({
        category_id: category.id,
        admin_role: 'executive_admin',
        is_admin: true
      })
      .eq('id', user.id);

    if (updateError) {
      console.error(`  ❌ Error updating user: ${updateError.message}`);
    } else {
      console.log(`  ✅ Upgraded to Executive Admin`);
      console.log(`     - Category: execadmin (unlimited features)`);
      console.log(`     - Admin Role: executive_admin (full admin access)`);
    }
    console.log('');
  }

  console.log('🎉 Done!\n');
}

assignExecutiveAdmins();
