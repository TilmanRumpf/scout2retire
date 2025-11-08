import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const email = 'tilman.rumpf@gmail.com';

// Check admin role for test account
const { data: userData, error } = await supabase
  .from('users')
  .select('id, email, admin_role, is_admin')
  .eq('email', email)
  .single();

if (error) {
  console.error('Error:', error);
} else {
  console.log('\nUser Admin Access:');
  console.log('==================');
  console.log('Email:', userData.email);
  console.log('Admin Role:', userData.admin_role);
  console.log('Is Admin:', userData.is_admin);
  console.log('\nResult: Admin pages', userData.admin_role === 'executive_admin' ? '✅ ACCESSIBLE' : '❌ NOT ACCESSIBLE');
  console.log('Reason:', userData.admin_role === 'executive_admin' ? 'User is executive admin' : `User has role "${userData.admin_role}" but needs "executive_admin"`);
}
