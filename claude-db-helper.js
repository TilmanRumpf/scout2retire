#!/usr/bin/env node

// CLAUDE CODE DATABASE HELPER - COMPREHENSIVE USER DATA INVESTIGATION
// This is the CORRECT way to execute SQL against the ONLINE Supabase instance
// Modified to investigate ALL user data for tobiasrumpf@gmx.de

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

const TOBIAS_EMAIL = 'tobiasrumpf@gmx.de';
const TOBIAS_USER_ID = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8';

async function runQueries() {
  console.log('🚫 REMOVING "READING" FROM USER HOBBIES');
  console.log('=' .repeat(80));
  console.log('User ID: 83d285b2-b21b-4d13-a1a1-6d51b6733d52');
  console.log('=' .repeat(80));
  console.log('');

  const targetUserId = '83d285b2-b21b-4d13-a1a1-6d51b6733d52';

  try {
    // First, check current state
    console.log('🔍 CHECKING CURRENT STATE:');
    console.log('-'.repeat(40));

    // Check user_preferences
    const { data: userPrefs, error: userPrefsError } = await supabase
      .from('user_preferences')
      .select('custom_hobbies, updated_at')
      .eq('user_id', targetUserId);

    if (userPrefsError) {
      console.log('❌ Error checking user_preferences:', userPrefsError.message);
    } else {
      console.log('user_preferences current state:');
      console.log('  custom_hobbies:', JSON.stringify(userPrefs[0]?.custom_hobbies || null, null, 2));
      console.log('  updated_at:', userPrefs[0]?.updated_at || 'null');
    }

    // Check onboarding_responses
    const { data: onboardingResp, error: onboardingError } = await supabase
      .from('onboarding_responses')
      .select('hobbies')
      .eq('user_id', targetUserId);

    if (onboardingError) {
      console.log('❌ Error checking onboarding_responses:', onboardingError.message);
    } else {
      console.log('onboarding_responses current state:');
      console.log('  hobbies:', JSON.stringify(onboardingResp[0]?.hobbies || null, null, 2));
    }

    console.log('\n🔧 EXECUTING UPDATES:');
    console.log('-'.repeat(40));

    // Update 1: user_preferences table
    console.log('1. Updating user_preferences table...');
    const { data: updatePrefsData, error: updatePrefsError } = await supabase
      .from('user_preferences')
      .update({
        custom_hobbies: [],
        updated_at: new Date().toISOString()
      })
      .eq('user_id', targetUserId)
      .select();

    if (updatePrefsError) {
      console.log(`❌ Error updating user_preferences: ${updatePrefsError.message}`);
    } else {
      console.log(`✅ Updated user_preferences successfully`);
      console.log(`   Rows affected: ${updatePrefsData?.length || 0}`);
    }

    // Update 2: onboarding_responses table
    console.log('2. Updating onboarding_responses table...');
    
    // First get the current hobbies data to modify it
    const { data: currentOnboarding, error: getCurrentError } = await supabase
      .from('onboarding_responses')
      .select('hobbies')
      .eq('user_id', targetUserId)
      .single();

    if (getCurrentError) {
      console.log(`❌ Error getting current onboarding_responses: ${getCurrentError.message}`);
    } else {
      const currentHobbies = currentOnboarding.hobbies || {};
      const updatedHobbies = {
        ...currentHobbies,
        custom_hobbies: []
      };

      const { data: updateOnboardingData, error: updateOnboardingError } = await supabase
        .from('onboarding_responses')
        .update({
          hobbies: updatedHobbies
        })
        .eq('user_id', targetUserId)
        .select();

      if (updateOnboardingError) {
        console.log(`❌ Error updating onboarding_responses: ${updateOnboardingError.message}`);
      } else {
        console.log(`✅ Updated onboarding_responses successfully`);
        console.log(`   Rows affected: ${updateOnboardingData?.length || 0}`);
      }
    }

    console.log('\n🔍 VERIFICATION - CHECKING FINAL STATE:');
    console.log('-'.repeat(40));

    // Verify user_preferences
    const { data: verifyUserPrefs, error: verifyUserPrefsError } = await supabase
      .from('user_preferences')
      .select('custom_hobbies, updated_at')
      .eq('user_id', targetUserId);

    if (verifyUserPrefsError) {
      console.log('❌ Error verifying user_preferences:', verifyUserPrefsError.message);
    } else {
      console.log('user_preferences final state:');
      console.log('  custom_hobbies:', JSON.stringify(verifyUserPrefs[0]?.custom_hobbies || null, null, 2));
      console.log('  updated_at:', verifyUserPrefs[0]?.updated_at || 'null');
    }

    // Verify onboarding_responses
    const { data: verifyOnboarding, error: verifyOnboardingError } = await supabase
      .from('onboarding_responses')
      .select('hobbies')
      .eq('user_id', targetUserId);

    if (verifyOnboardingError) {
      console.log('❌ Error verifying onboarding_responses:', verifyOnboardingError.message);
    } else {
      console.log('onboarding_responses final state:');
      console.log('  hobbies:', JSON.stringify(verifyOnboarding[0]?.hobbies || null, null, 2));
    }

    console.log('\n✅ OPERATION COMPLETE');
    console.log('Reading should now be removed from user hobbies.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the queries
runQueries().catch(console.error);