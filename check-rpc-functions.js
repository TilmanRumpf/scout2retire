import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔍 CHECKING FOR MISSING RPC FUNCTIONS');
console.log('================================================\n');

// Test check_username_available
try {
  const { data, error } = await supabase.rpc('check_username_available', {
    username_param: 'testuser'
  });
  
  if (error) {
    console.log('❌ check_username_available:', error.message);
  } else {
    console.log('✅ check_username_available exists');
  }
} catch (e) {
  console.log('❌ check_username_available error:', e.message);
}

// Test complete_user_profile
try {
  const { data, error } = await supabase.rpc('complete_user_profile', {
    user_id: 'test-id'
  });
  
  if (error) {
    console.log('❌ complete_user_profile:', error.message);
  } else {
    console.log('✅ complete_user_profile exists');
  }
} catch (e) {
  console.log('❌ complete_user_profile error:', e.message);
}

console.log('\n📝 CURRENT ISSUES:');
console.log('1. Vercel is still serving old build with nationality column');
console.log('2. Missing RPC functions causing 404 errors');
console.log('3. Build not updating despite multiple attempts');
console.log('\n🎯 SOLUTION: Need to wait for Vercel to actually rebuild with new code');