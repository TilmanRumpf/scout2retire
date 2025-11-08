import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTriggers() {
  console.log('\n🔍 Checking for triggers on towns table...\n');

  // Check for triggers
  const { data: triggers, error: triggersError } = await supabase.rpc('exec_sql', {
    sql_query: `
      SELECT
        trigger_name,
        event_manipulation,
        action_statement,
        action_timing
      FROM information_schema.triggers
      WHERE event_object_table = 'towns'
      ORDER BY trigger_name;
    `
  });

  if (triggersError) {
    console.error('❌ Error checking triggers:', triggersError);
  } else {
    console.log('📋 Triggers on towns table:');
    if (triggers && triggers.length > 0) {
      console.table(triggers);
    } else {
      console.log('✅ No triggers found');
    }
  }

  // Check column names
  console.log('\n🔍 Checking column names in towns table...\n');
  const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
    sql_query: `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'towns'
      AND table_schema = 'public'
      AND column_name ILIKE '%name%'
      ORDER BY ordinal_position;
    `
  });

  if (columnsError) {
    console.error('❌ Error checking columns:', columnsError);
  } else {
    console.log('📋 Columns with "name" in towns table:');
    console.table(columns);
  }

  // Try to get trigger function definitions
  console.log('\n🔍 Checking for trigger functions that might reference "name"...\n');
  const { data: functions, error: functionsError } = await supabase.rpc('exec_sql', {
    sql_query: `
      SELECT
        n.nspname as schema,
        p.proname as function_name,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE p.prorettype = 'pg_catalog.trigger'::regtype
      AND pg_get_functiondef(p.oid) ILIKE '%NEW.name%'
      ORDER BY p.proname;
    `
  });

  if (functionsError) {
    console.error('❌ Error checking trigger functions:', functionsError);
  } else {
    console.log('📋 Trigger functions that reference NEW.name:');
    if (functions && functions.length > 0) {
      functions.forEach(fn => {
        console.log(`\n🔧 ${fn.schema}.${fn.function_name}:`);
        console.log(fn.definition);
      });
    } else {
      console.log('✅ No trigger functions found that reference NEW.name');
    }
  }
}

checkTriggers().catch(console.error);
