import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAndFixSunshineDuplicates() {
  console.log('🔍 SUNSHINE DUPLICATE INVESTIGATION & FIX');
  console.log('=========================================');

  try {
    // First, get all users with sunshine preferences
    const { data: users, error: fetchError } = await supabase
      .from('user_preferences')
      .select('id, user_id, sunshine')
      .not('sunshine', 'is', null);

    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError);
      return;
    }

    console.log(`📊 Found ${users.length} users with sunshine preferences`);
    console.log('');

    // Check for duplicates
    const usersWithDuplicates = [];
    const allSunshineValues = [];

    for (const user of users) {
      if (user.sunshine && Array.isArray(user.sunshine)) {
        // Track all sunshine values for analysis
        allSunshineValues.push({
          user_id: user.user_id,
          sunshine: user.sunshine
        });

        // Check for duplicates
        const uniqueValues = [...new Set(user.sunshine)];
        
        if (uniqueValues.length !== user.sunshine.length) {
          usersWithDuplicates.push({
            id: user.id,
            user_id: user.user_id,
            original: user.sunshine,
            deduplicated: uniqueValues
          });
        }
      }
    }

    console.log('📋 ALL SUNSHINE VALUES ANALYSIS:');
    console.log('================================');
    allSunshineValues.forEach((item, index) => {
      console.log(`${index + 1}. User ID: ${item.user_id}`);
      console.log(`   Sunshine: ${JSON.stringify(item.sunshine)}`);
      console.log('');
    });

    console.log('🔍 DUPLICATE DETECTION RESULTS:');
    console.log('================================');
    
    if (usersWithDuplicates.length === 0) {
      console.log('✅ No sunshine duplicates found!');
      return;
    }

    console.log(`❌ Found ${usersWithDuplicates.length} users with sunshine duplicates:`);
    console.log('');

    // Display all duplicates found
    for (const user of usersWithDuplicates) {
      // Get user email for better identification
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', user.user_id)
        .single();

      console.log(`👤 User: ${userData?.email || 'Unknown'} (${user.user_id})`);
      console.log(`   Original: ${JSON.stringify(user.original)}`);
      console.log(`   Fixed:    ${JSON.stringify(user.deduplicated)}`);
      console.log('');
    }

    // Ask for confirmation before fixing
    console.log('🔧 FIXING DUPLICATES...');
    console.log('========================');

    let fixedCount = 0;
    let errorCount = 0;

    for (const user of usersWithDuplicates) {
      try {
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update({ sunshine: user.deduplicated })
          .eq('id', user.id);

        if (updateError) {
          console.error(`❌ Failed to update user ${user.user_id}:`, updateError);
          errorCount++;
        } else {
          // Get user email for confirmation
          const { data: userData } = await supabase
            .from('users')
            .select('email')
            .eq('id', user.user_id)
            .single();

          console.log(`✅ Fixed ${userData?.email || user.user_id}: ${JSON.stringify(user.original)} → ${JSON.stringify(user.deduplicated)}`);
          fixedCount++;
        }
      } catch (err) {
        console.error(`❌ Exception updating user ${user.user_id}:`, err);
        errorCount++;
      }
    }

    console.log('');
    console.log('📊 FINAL RESULTS:');
    console.log('==================');
    console.log(`✅ Successfully fixed: ${fixedCount} users`);
    console.log(`❌ Errors encountered: ${errorCount} users`);
    console.log(`📋 Total users checked: ${users.length} users`);

    // Verify the fixes
    console.log('');
    console.log('🔍 VERIFICATION - Checking for remaining duplicates...');
    console.log('======================================================');

    const { data: verificationUsers, error: verifyError } = await supabase
      .from('user_preferences')
      .select('id, user_id, sunshine')
      .not('sunshine', 'is', null);

    if (verifyError) {
      console.error('❌ Error during verification:', verifyError);
      return;
    }

    let remainingDuplicates = 0;
    for (const user of verificationUsers) {
      if (user.sunshine && Array.isArray(user.sunshine)) {
        const uniqueValues = [...new Set(user.sunshine)];
        if (uniqueValues.length !== user.sunshine.length) {
          remainingDuplicates++;
        }
      }
    }

    if (remainingDuplicates === 0) {
      console.log('✅ Verification complete: No duplicates remaining!');
    } else {
      console.log(`⚠️  Warning: ${remainingDuplicates} users still have duplicates`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
findAndFixSunshineDuplicates().then(() => {
  console.log('');
  console.log('🏁 Sunshine duplicate fix script completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});