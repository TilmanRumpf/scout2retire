import { createClient } from '@supabase/supabase-js';

// This requires your SERVICE_ROLE_KEY (not the anon key)
// Replace 'YOUR_SERVICE_ROLE_KEY' with your actual service role key from Supabase settings
const supabaseAdmin = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'YOUR_SERVICE_ROLE_KEY', // Replace with service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function deleteAuthUser() {
  try {
    console.log('🗑️  Attempting to delete auth user...\n');

    // First, find the user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.log('❌ Error listing users:', listError.message);
      console.log('Make sure you have the correct SERVICE_ROLE_KEY');
      return;
    }

    // Find Tobias's user ID
    const tobiasUser = users.users.find(user => 
      user.email?.toLowerCase().includes('tobias') || 
      user.email?.toLowerCase().includes('tumpf')
    );

    if (!tobiasUser) {
      console.log('✅ No auth user found with Tobias email');
      return;
    }

    console.log('Found auth user:', tobiasUser.email, 'ID:', tobiasUser.id);

    // Delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(tobiasUser.id);

    if (deleteError) {
      console.log('❌ Error deleting auth user:', deleteError.message);
    } else {
      console.log('✅ Auth user deleted successfully');
      console.log('Tobias can now register again with the same email');
    }

  } catch (error) {
    console.error('Admin delete failed:', error);
  }
}

// Uncomment the line below and add your service role key to run this
// deleteAuthUser();

console.log('🔧 To use this script:');
console.log('1. Get your SERVICE_ROLE_KEY from Supabase Dashboard > Settings > API');
console.log('2. Replace YOUR_SERVICE_ROLE_KEY in this file');
console.log('3. Uncomment the deleteAuthUser() call');
console.log('4. Run: node admin-delete-user.js');