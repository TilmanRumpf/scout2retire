import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

// For use with SERVICE_ROLE_KEY
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

/**
 * Proper user deletion that preserves data for research while removing PII
 * @param {string} userId - The user ID to delete
 * @param {boolean} preserveDataForResearch - Whether to anonymize data instead of deleting
 */
async function properUserDeletion(userId, preserveDataForResearch = true) {
  try {
    console.log(`🗑️  Starting proper deletion for user ${userId}...\n`);

    if (preserveDataForResearch) {
      console.log('📊 Anonymizing user data for research purposes...');
      
      // Step 1: Anonymize the user in public.users table
      const anonymizedEmail = `deleted-user-${Date.now()}@deleted.local`;
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email: anonymizedEmail,
          full_name: `Deleted User ${userId.slice(-6)}`,
          // Keep all other data for research
        })
        .eq('id', userId);

      if (updateError) {
        console.log('❌ Error anonymizing user data:', updateError.message);
        return false;
      }

      console.log('✅ User data anonymized in public.users');
    } else {
      console.log('🗑️  Complete deletion mode...');
      
      // Delete from all related tables
      const tables = ['favorites', 'user_preferences', 'users'];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', userId);
        
        if (error && !error.message.includes('No rows')) {
          console.log(`❌ Error deleting from ${table}:`, error.message);
        } else {
          console.log(`✅ Deleted from ${table}`);
        }
      }
    }

    // Step 2: Delete from auth.users (requires admin access)
    console.log('\n🔐 Attempting to delete from auth.users...');
    
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authDeleteError) {
      console.log('❌ Error deleting auth user:', authDeleteError.message);
      console.log('💡 Manual step required: Delete from Supabase Dashboard > Authentication > Users');
      return false;
    }

    console.log('✅ Auth user deleted successfully');
    console.log('✅ User can now register again with the same email');
    
    return true;

  } catch (error) {
    console.error('Proper deletion failed:', error);
    return false;
  }
}

/**
 * Find and delete user by email (for cases like Tobias)
 */
async function findAndDeleteUserByEmail(email) {
  try {
    console.log(`🔍 Finding user with email: ${email}`);
    
    // First check if user exists in public.users
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .ilike('email', `%${email}%`)
      .single();

    if (publicError && publicError.code !== 'PGRST116') {
      console.log('Error finding user in public.users:', publicError.message);
    }

    if (publicUser) {
      console.log('Found in public.users:', publicUser);
      return await properUserDeletion(publicUser.id, true);
    }

    // If not in public.users, try to find in auth.users
    console.log('Not found in public.users, checking auth.users...');
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Cannot access auth.users:', authError.message);
      return false;
    }

    const authUser = authUsers.users.find(user => 
      user.email?.toLowerCase().includes(email.toLowerCase())
    );

    if (authUser) {
      console.log('Found in auth.users:', authUser.email);
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id);
      
      if (deleteError) {
        console.log('❌ Error deleting auth user:', deleteError.message);
        return false;
      }
      
      console.log('✅ Auth user deleted - can now register again');
      return true;
    }

    console.log('❌ User not found in either table');
    return false;

  } catch (error) {
    console.error('Find and delete failed:', error);
    return false;
  }
}

// Example usage (uncomment to run):
// findAndDeleteUserByEmail('tobias');

console.log('🔧 PROPER USER DELETION TOOL');
console.log('');
console.log('To delete Tobias and allow re-registration:');
console.log('1. Add your SERVICE_ROLE_KEY to this file');
console.log('2. Run: findAndDeleteUserByEmail("tobias")');
console.log('');
console.log('This will:');
console.log('- Keep research data but anonymize PII');
console.log('- Delete from auth.users to allow re-registration');
console.log('- Preserve user preferences/favorites for analytics');