import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔍 CHECKING DATABASE STATE AFTER API CHANGES (2 DAYS AGO)');
console.log('=========================================================\n');

// Check what RPC functions exist
try {
  console.log('📋 LISTING ALL RPC FUNCTIONS:');
  const { data: functions, error: funcError } = await supabase
    .from('pg_proc')
    .select('proname, prosrc')
    .eq('pronamespace', '2200'); // public schema
  
  if (funcError) {
    console.log('❌ Error querying pg_proc:', funcError.message);
    
    // Alternative approach - query information_schema
    const { data: altFunctions, error: altError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type')
      .eq('routine_schema', 'public');
    
    if (altError) {
      console.log('❌ Alternative query failed:', altError.message);
    } else {
      console.log('✅ Functions found via information_schema:');
      altFunctions?.forEach(f => {
        console.log(`  - ${f.routine_name} (${f.routine_type})`);
      });
    }
  } else {
    console.log('✅ Functions found via pg_proc:');
    functions?.forEach(f => {
      console.log(`  - ${f.proname}`);
    });
  }
} catch (e) {
  console.log('❌ Error listing functions:', e.message);
}

console.log('\n🏗️ CHECKING USERS TABLE STRUCTURE:');
try {
  const { data: columns, error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'users')
    .eq('table_schema', 'public');
  
  if (error) {
    console.log('❌ Error:', error.message);
  } else {
    console.log('✅ Users table columns:');
    columns?.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
  }
} catch (e) {
  console.log('❌ Error:', e.message);
}

console.log('\n🔍 TESTING SPECIFIC RPC FUNCTIONS:');

// Test check_username_available
try {
  console.log('Testing check_username_available...');
  const { data, error } = await supabase.rpc('check_username_available', {
    check_username: 'testuser123'
  });
  
  if (error) {
    console.log('❌ check_username_available error:', error.message);
  } else {
    console.log('✅ check_username_available works, returned:', data);
  }
} catch (e) {
  console.log('❌ check_username_available error:', e.message);
}

// Test complete_user_profile
try {
  console.log('Testing complete_user_profile...');
  const { data, error } = await supabase.rpc('complete_user_profile', {
    user_id: 'test-id'
  });
  
  if (error) {
    console.log('❌ complete_user_profile error:', error.message);
  } else {
    console.log('✅ complete_user_profile works, returned:', data);
  }
} catch (e) {
  console.log('❌ complete_user_profile error:', e.message);
}

console.log('\n📊 SAMPLE USERNAME CHECK TO VERIFY FALLBACK:');
try {
  const { data: userData, error: queryError } = await supabase
    .from('users')
    .select('username')
    .eq('username', 'testuser123')
    .maybeSingle();
  
  if (queryError) {
    console.log('❌ Direct username query error:', queryError.message);
  } else {
    console.log('✅ Direct username query works. Found user:', userData ? 'YES' : 'NO');
  }
} catch (e) {
  console.log('❌ Direct username query error:', e.message);
}