import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Use SERVICE ROLE KEY for admin access
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // This has full admin access
);

async function testServiceRole() {
  console.log('🔍 TESTING WITH SERVICE ROLE KEY\n');
  
  const { data, error } = await supabase
    .from('towns')
    .update({ 
      activity_infrastructure: ["parks","trails","beaches","cultural_sites","shopping","dining"]
    })
    .eq('name', 'Annapolis Royal')
    .select('name, activity_infrastructure');

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Success:', data);
  }
}

testServiceRole();
