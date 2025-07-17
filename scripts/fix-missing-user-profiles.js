import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.log('Please ensure you have VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

// Create admin client - we need service role key for auth.admin functions
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixMissingUserProfiles() {
  console.log('🔍 Searching for auth users without profiles...\n');

  try {
    // Get all users from auth
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      console.log('\n⚠️  Note: This script requires SUPABASE_SERVICE_ROLE_KEY to access auth.admin functions');
      console.log('You can find this in your Supabase dashboard under Settings > API');
      return;
    }

    console.log(`Found ${authUsers.length} users in auth system\n`);

    // Get all existing user profiles
    const { data: userProfiles, error: profileError } = await supabase
      .from('users')
      .select('id, email');

    if (profileError) {
      console.error('Error fetching user profiles:', profileError);
      return;
    }

    // Create a set of existing profile IDs for fast lookup
    const existingProfileIds = new Set(userProfiles.map(p => p.id));

    // Find auth users without profiles
    const missingProfiles = authUsers.filter(authUser => !existingProfileIds.has(authUser.id));

    if (missingProfiles.length === 0) {
      console.log('✅ All auth users have profiles! No action needed.');
      return;
    }

    console.log(`⚠️  Found ${missingProfiles.length} users without profiles:\n`);
    missingProfiles.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`);
    });

    console.log('\n📝 Creating missing profiles...\n');

    // Create profiles for users who don't have them
    for (const authUser of missingProfiles) {
      const profileData = {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
        nationality: 'usa', // Default value
        retirement_year_estimate: new Date().getFullYear() + 5, // Default to 5 years from now
        onboarding_completed: false,
        created_at: authUser.created_at
      };

      const { error: insertError } = await supabase
        .from('users')
        .insert([profileData]);

      if (insertError) {
        console.error(`❌ Failed to create profile for ${authUser.email}:`, insertError.message);
      } else {
        console.log(`✅ Created profile for ${authUser.email}`);
      }
    }

    console.log('\n🎉 Profile creation complete!');

    // Verify the fix
    const { count: finalCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    console.log(`\nTotal user profiles now: ${finalCount}`);
    console.log('Total auth users: ' + authUsers.length);
    
    if (finalCount === authUsers.length) {
      console.log('\n✅ SUCCESS: All auth users now have profiles!');
    } else {
      console.log('\n⚠️  WARNING: Some users may still be missing profiles');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the fix
fixMissingUserProfiles();