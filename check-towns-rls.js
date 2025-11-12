#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRLS() {
  console.log('🔍 Checking current RLS policies on towns table...\n');

  const { data, error } = await supabase
    .rpc('exec_sql', {
      sql: `SELECT policyname, roles, cmd, qual FROM pg_policies WHERE tablename = 'towns' AND cmd = 'SELECT';`
    });

  if (error) {
    console.log('Cannot query directly, checking with test query...\n');
    
    // Test with anon key
    const anonClient = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: testData, error: testError } = await anonClient
      .from('towns')
      .select('id, town_name')
      .ilike('town_name', '%lemmer%');

    console.log('Test with anon key:');
    console.log('  Results:', testData?.length || 0, 'towns');
    console.log('  Error:', testError?.message || 'none');
    
    if (testData && testData.length > 0) {
      console.log('\n✅ RLS is allowing access!');
    } else {
      console.log('\n❌ RLS is BLOCKING access!');
      console.log('\nNeed to run the SQL fix in Supabase dashboard.');
    }
  } else {
    console.log('Current SELECT policies:');
    console.log(JSON.stringify(data, null, 2));
  }
}

checkRLS();
