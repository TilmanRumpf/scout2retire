#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listAllCategories() {
  console.log('🔍 Listing all user categories...\n');

  const { data: categories, error } = await supabase
    .from('user_categories')
    .select('*')
    .order('sort_order');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📊 All User Categories:');
  console.log('='.repeat(80));
  categories.forEach((cat, idx) => {
    console.log(`${idx + 1}. ${cat.display_name} (${cat.category_code})`);
    console.log(`   Sort Order: ${cat.sort_order}`);
    console.log(`   Visible: ${cat.is_visible}, Active: ${cat.is_active}`);
    console.log(`   Monthly: $${cat.price_monthly || 0}, Yearly: $${cat.price_yearly || 0}`);
    console.log('');
  });

  console.log(`Total categories: ${categories.length}`);
}

listAllCategories();
