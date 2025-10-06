#!/usr/bin/env node
/**
 * Verify healthcare budget is saved correctly in onboarding_progress
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verifyHealthcareSave() {
  console.log('\n🔍 Checking onboarding_progress for healthcare budget data...\n');

  const { data, error } = await supabase
    .from('onboarding_progress')
    .select('user_id, costs')
    .not('costs', 'is', null)
    .limit(5);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Found ${data.length} users with costs data:\n`);

  data.forEach((record, i) => {
    console.log(`User ${i + 1}:`);
    console.log(`  user_id: ${record.user_id}`);
    console.log(`  monthly_healthcare_budget: ${record.costs?.monthly_healthcare_budget || 'NOT SET'}`);
    console.log(`  Type: ${typeof record.costs?.monthly_healthcare_budget}`);
    console.log('');
  });
}

verifyHealthcareSave();
