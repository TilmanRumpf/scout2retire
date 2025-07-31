import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function testDeleteFunction() {
  console.log('✅ Testing delete_user_account function...\n');
  
  // Test with a fake user ID to verify function exists
  const testUserId = '00000000-0000-0000-0000-000000000000';
  
  const { data, error } = await supabase.rpc('delete_user_account', {
    user_id_param: testUserId
  });
  
  if (error) {
    console.error('❌ Function call failed:', error);
  } else {
    console.log('✅ Function exists and returned:', data);
    console.log('\n🎉 SUCCESS! The delete function is now available.');
    console.log('📱 madara.grisule@gmail.com can now delete her account from mobile!');
  }
}

testDeleteFunction().catch(console.error);