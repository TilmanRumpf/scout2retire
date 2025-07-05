import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixMissingRetirementMonth() {
  console.log('Starting fix for missing target_month in retirement_timeline...\n');

  try {
    // First, check how many records have this issue
    console.log('1. Checking for records with missing target_month...');
    const { data: affectedRecords, error: checkError } = await supabase
      .from('onboarding_responses')
      .select('user_id, current_status')
      .not('current_status->retirement_timeline', 'is', null)
      .not('current_status->retirement_timeline->target_year', 'is', null)
      .is('current_status->retirement_timeline->target_month', null);

    if (checkError) {
      console.error('Error checking records:', checkError);
      return;
    }

    console.log(`Found ${affectedRecords?.length || 0} records with missing target_month`);
    
    if (affectedRecords && affectedRecords.length > 0) {
      console.log('\nAffected users:');
      affectedRecords.forEach(record => {
        console.log(`- User ID: ${record.user_id}`);
        console.log(`  Current retirement_timeline: ${JSON.stringify(record.current_status?.retirement_timeline)}`);
      });

      // Update records with missing target_month to January (1)
      console.log('\n2. Updating records to set target_month = 1 (January)...');
      
      for (const record of affectedRecords) {
        const updatedStatus = {
          ...record.current_status,
          retirement_timeline: {
            ...record.current_status.retirement_timeline,
            target_month: 1
          }
        };

        const { error: updateError } = await supabase
          .from('onboarding_responses')
          .update({ current_status: updatedStatus })
          .eq('user_id', record.user_id);

        if (updateError) {
          console.error(`Error updating user ${record.user_id}:`, updateError);
        } else {
          console.log(`✓ Updated user ${record.user_id}`);
        }
      }

      // Verify the fix for the specific user
      console.log('\n3. Verifying the fix for user 83d285b2-b21b-4d13-a1a1-6d51b6733d52...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('onboarding_responses')
        .select('user_id, current_status')
        .eq('user_id', '83d285b2-b21b-4d13-a1a1-6d51b6733d52')
        .single();

      if (verifyError) {
        console.error('Error verifying fix:', verifyError);
      } else if (verifyData) {
        console.log('\nRetirement timeline after fix:');
        console.log(JSON.stringify(verifyData.current_status?.retirement_timeline, null, 2));
      }

      console.log('\n✅ Fix completed successfully!');
    } else {
      console.log('\n✅ No records need fixing - all retirement timelines already have target_month set.');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the fix
fixMissingRetirementMonth();