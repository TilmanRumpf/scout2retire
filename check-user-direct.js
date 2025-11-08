import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const email = 'tilman.rumpf@gmail.com';

// Check if user exists in users table
const { data: userData, error: userError } = await supabase
  .from('users')
  .select('id, email, admin_role, is_admin')
  .eq('email', email);

console.log('\n🔍 Checking user profile in database...\n');

if (userError) {
  console.error('Error:', userError);
} else if (!userData || userData.length === 0) {
  console.log('❌ NO USER PROFILE FOUND');
  console.log('\nThis explains why admin pages appear empty:');
  console.log('- User can authenticate (has auth account)');
  console.log('- But has NO row in users table');
  console.log('- Admin pages query users table for admin_role');
  console.log('- Query fails → redirect to /admin');
  console.log('- /admin route doesnt exist → shows blank page');
  console.log('\nSOLUTION: Create user profile for', email);
} else {
  console.log('✅ User profile exists:');
  console.log(JSON.stringify(userData[0], null, 2));
  
  if (userData[0].admin_role === 'executive_admin') {
    console.log('\n✅ Admin pages should be accessible');
  } else {
    console.log('\n❌ Admin pages NOT accessible');
    console.log('Current role:', userData[0].admin_role || 'none');
    console.log('Required role: executive_admin');
  }
}
