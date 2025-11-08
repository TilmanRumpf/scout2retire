import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const email = 'tilman.rumpf@gmail.com';

// Check if user exists in auth
const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

if (authError) {
  console.error('Auth Error:', authError);
} else {
  const user = authData.users.find(u => u.email === email);
  if (user) {
    console.log('\n✅ User exists in Auth:');
    console.log('==================');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Created:', user.created_at);

    // Now check if they have a profile
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      console.log('\n❌ NO PROFILE IN USERS TABLE');
      console.log('This is the "Tobias bug" - user can auth but has no profile');
      console.log('\nAdmin pages will fail because:');
      console.log('1. User has no row in users table');
      console.log('2. Admin pages check admin_role from users table');
      console.log('3. Query fails → user is redirected');
    } else {
      console.log('\n✅ Profile exists in users table');
      console.log('Admin Role:', profileData.admin_role || 'none');
      console.log('Is Admin:', profileData.is_admin || false);
    }
  } else {
    console.log('\n❌ User not found in Auth system');
  }
}
