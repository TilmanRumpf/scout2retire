#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRLS() {
  console.log('🔍 Checking RLS policies on onboarding_responses table...\n');

  const { data: policies, error } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE tablename = 'onboarding_responses'
        ORDER BY policyname;
      `
    });

  if (error) {
    // Try direct SQL query instead
    const { data: policies2, error: error2 } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'onboarding_responses');

    if (error2) {
      console.log('❌ Cannot query policies:', error2.message);
      console.log('Will use SQL editor query instead...\n');
      console.log('Run this in Supabase SQL Editor:');
      console.log(`
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename = 'onboarding_responses';
      `);
      return;
    }

    console.log('Policies:', policies2);
    return;
  }

  console.log('✅ Found policies:');
  console.log(JSON.stringify(policies, null, 2));
}

checkRLS();
