#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkExecutiveAdminLimits() {
  console.log('🔍 Checking Executive Admin limits in database...\n');

  // Get execadmin category
  const { data: category, error: catError } = await supabase
    .from('user_categories')
    .select('*')
    .eq('category_code', 'execadmin')
    .single();

  if (catError) {
    console.error('❌ Error finding executive_admin category:', catError);
    return;
  }

  console.log('Category:', category);
  console.log('');

  // Get all limits for executive_admin
  const { data: limits, error: limitsError } = await supabase
    .from('category_limits')
    .select(`
      *,
      feature:feature_definitions(feature_code, display_name)
    `)
    .eq('category_id', category.id)
    .order('feature_id');

  if (limitsError) {
    console.error('❌ Error fetching limits:', limitsError);
    return;
  }

  console.log('📊 Executive Admin Feature Limits:');
  console.log('='.repeat(60));
  limits.forEach(limit => {
    const value = limit.limit_value === null ? '∞ (UNLIMITED)' : limit.limit_value;
    console.log(`${limit.feature.display_name.padEnd(30)} → ${value}`);
  });
  console.log('');

  // Check for any limits that should be NULL but aren't
  const wrongLimits = limits.filter(l =>
    l.limit_value !== null &&
    !['white_label_reports', 'api_access', 'top_matches', 'compare_towns'].includes(l.feature.feature_code)
  );

  if (wrongLimits.length > 0) {
    console.log('⚠️  INCORRECT LIMITS FOUND:');
    wrongLimits.forEach(l => {
      console.log(`  - ${l.feature.feature_code}: ${l.limit_value} (should be NULL/unlimited)`);
    });
  } else {
    console.log('✅ All limits look correct!');
  }
}

checkExecutiveAdminLimits();
