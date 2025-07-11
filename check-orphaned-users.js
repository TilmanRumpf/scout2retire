import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndFixOrphanedUsers() {
  console.log('🔍 Checking for orphaned users in Supabase...\n');
  
  try {
    // Check public.users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, created_at, onboarding_completed')
      .order('created_at', { ascending: false });
      
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    console.log(`Total users in public.users table: ${users.length}`);
    console.log('\nAll users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.full_name})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Onboarding completed: ${user.onboarding_completed}`);
      console.log(`   Created: ${user.created_at}\n`);
    });
    
    // Check for any signs of profile creation issues
    const incompleteProfiles = users.filter(user => 
      !user.full_name || 
      user.full_name === 'undefined' ||
      !user.email
    );
    
    if (incompleteProfiles.length > 0) {
      console.log('\n⚠️  Found incomplete profiles:');
      incompleteProfiles.forEach(user => console.log(user));
    } else {
      console.log('✅ All profiles appear complete');
    }
    
    // Try to use the RPC function to check for orphaned auth users
    const { data: orphanedCount, error: rpcError } = await supabase
      .rpc('find_orphaned_auth_users');
      
    if (!rpcError && orphanedCount) {
      console.log(`\n⚠️  RPC check found ${orphanedCount.length} orphaned auth users`);
    } else if (rpcError) {
      console.log('\n📝 Note: Cannot check auth.users table directly (requires service role key)');
      console.log('   To check for orphaned auth users, run the SQL query in Supabase dashboard');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
  
  process.exit(0);
}

// Run the check
checkAndFixOrphanedUsers();