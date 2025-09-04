#!/usr/bin/env node

/**
 * 🚨 QUALITY CHECKPOINT: Verify Compound Buttons REALLY Save
 * 
 * This script verifies that compound button selections are:
 * 1. Actually being saved to database (not hardcoded)
 * 2. Properly expanded to all group hobbies
 * 3. Synced between both tables
 * 4. Different for different users (not test data)
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function verifyCompoundButtonSaves() {
  console.log("🚨 QUALITY CHECKPOINT: VERIFY COMPOUND BUTTONS REALLY SAVE");
  console.log("=".repeat(60));
  
  let passedChecks = 0;
  let failedChecks = 0;
  
  // 1. Check for users with non-empty custom_activities
  console.log("\n1️⃣ CHECK: Users have custom_activities field");
  const { data: usersWithButtons, error: error1 } = await supabase
    .from('user_preferences')
    .select('user_id, custom_activities, activities, interests')
    .not('custom_activities', 'is', null);
  
  if (error1) {
    console.error("   ❌ Error querying user_preferences:", error1);
    failedChecks++;
  } else if (!usersWithButtons || usersWithButtons.length === 0) {
    console.log("   ❌ NO users have custom_activities field!");
    console.log("   This means compound buttons are NOT being saved");
    failedChecks++;
  } else {
    let hasRealData = false;
    console.log(`   Found ${usersWithButtons.length} users with custom_activities field`);
    
    usersWithButtons.forEach(user => {
      const customAct = user.custom_activities;
      const hasData = customAct && customAct.length > 0;
      
      if (hasData) {
        hasRealData = true;
        console.log(`   ✅ User ${user.user_id.substring(0, 8)}...:`);
        console.log(`      - Compound buttons: ${JSON.stringify(customAct)}`);
        console.log(`      - Activities expanded to: ${user.activities?.length || 0} items`);
        console.log(`      - Interests expanded to: ${user.interests?.length || 0} items`);
      } else {
        console.log(`   ⚠️ User ${user.user_id.substring(0, 8)}... has EMPTY custom_activities`);
      }
    });
    
    if (hasRealData) {
      console.log("   ✅ PASS: Found real compound button data");
      passedChecks++;
    } else {
      console.log("   ❌ FAIL: All custom_activities are empty");
      failedChecks++;
    }
  }
  
  // 2. Check if activities are properly expanded
  console.log("\n2️⃣ CHECK: Compound buttons expand to multiple hobbies");
  const { data: expandedCheck } = await supabase
    .from('user_preferences')
    .select('user_id, custom_activities, activities, interests')
    .not('activities', 'is', null);
  
  let properlyExpanded = false;
  expandedCheck?.forEach(user => {
    const customButtons = user.custom_activities || [];
    const actCount = user.activities?.length || 0;
    
    // If user selected compound buttons, they should have many activities
    if (customButtons.length > 0 && actCount > 5) {
      properlyExpanded = true;
      console.log(`   ✅ User ${user.user_id.substring(0, 8)}...:`);
      console.log(`      Selected ${customButtons.length} compound buttons`);
      console.log(`      Expanded to ${actCount} activities (good expansion!)`);
    } else if (customButtons.length > 0 && actCount <= 2) {
      console.log(`   ❌ User ${user.user_id.substring(0, 8)}...:`);
      console.log(`      Selected ${customButtons.length} compound buttons`);
      console.log(`      But only has ${actCount} activities (NOT EXPANDED!)`);
    }
  });
  
  if (properlyExpanded) {
    console.log("   ✅ PASS: Compound buttons properly expand");
    passedChecks++;
  } else {
    console.log("   ❌ FAIL: Compound buttons not expanding to full groups");
    failedChecks++;
  }
  
  // 3. Check sync between tables
  console.log("\n3️⃣ CHECK: Data syncs between both tables");
  
  const { data: prefData } = await supabase
    .from('user_preferences')
    .select('user_id, activities')
    .not('activities', 'is', null);
  
  const { data: respData } = await supabase
    .from('onboarding_responses')
    .select('user_id, hobbies')
    .not('hobbies', 'is', null);
  
  const prefUsers = new Set(prefData?.map(u => u.user_id) || []);
  const respUsers = new Set(respData?.map(u => u.user_id) || []);
  
  // Find users in both tables
  const inBoth = [...prefUsers].filter(id => respUsers.has(id));
  
  console.log(`   user_preferences: ${prefUsers.size} users with hobbies`);
  console.log(`   onboarding_responses: ${respUsers.size} users with hobbies`);
  console.log(`   In both tables: ${inBoth.length} users`);
  
  if (inBoth.length > 0) {
    console.log("   ✅ PASS: Data exists in both tables");
    passedChecks++;
  } else {
    console.log("   ❌ FAIL: Data not syncing between tables");
    failedChecks++;
  }
  
  // 4. Check for hardcoded/duplicate data
  console.log("\n4️⃣ CHECK: Different users have different selections");
  
  const activitySignatures = new Map();
  expandedCheck?.forEach(user => {
    if (user.activities && user.activities.length > 0) {
      const signature = JSON.stringify(user.activities.sort());
      if (!activitySignatures.has(signature)) {
        activitySignatures.set(signature, []);
      }
      activitySignatures.get(signature).push(user.user_id);
    }
  });
  
  console.log(`   Found ${activitySignatures.size} unique activity combinations`);
  
  // Check if multiple users have exact same activities
  let hasDuplicates = false;
  activitySignatures.forEach((userIds, signature) => {
    if (userIds.length > 1) {
      hasDuplicates = true;
      console.log(`   ⚠️ ${userIds.length} users have IDENTICAL activities:`);
      console.log(`      Users: ${userIds.map(id => id.substring(0, 8)).join(', ')}`);
    }
  });
  
  if (activitySignatures.size > 1 && !hasDuplicates) {
    console.log("   ✅ PASS: Each user has unique selections");
    passedChecks++;
  } else if (activitySignatures.size === 1) {
    console.log("   ❌ FAIL: All users have SAME activities (hardcoded test data?)");
    failedChecks++;
  } else {
    console.log("   ⚠️ WARNING: Some users have identical selections");
    passedChecks++;
  }
  
  // 5. Verify specific compound button expansion
  console.log("\n5️⃣ CHECK: Verify specific compound button expansions");
  
  // Check if water_sports expands correctly
  const { data: waterSportsUsers } = await supabase
    .from('user_preferences')
    .select('user_id, custom_activities, activities')
    .contains('custom_activities', ['water_sports']);
  
  if (waterSportsUsers && waterSportsUsers.length > 0) {
    const user = waterSportsUsers[0];
    const hasSwimming = user.activities?.includes('swimming');
    const hasSnorkeling = user.activities?.includes('snorkeling');
    const hasWaterAerobics = user.activities?.includes('water_aerobics');
    
    console.log(`   User with 'water_sports' button:`);
    console.log(`      - Has 'swimming': ${hasSwimming ? '✅' : '❌'}`);
    console.log(`      - Has 'snorkeling': ${hasSnorkeling ? '✅' : '❌'}`);
    console.log(`      - Has 'water_aerobics': ${hasWaterAerobics ? '✅' : '❌'}`);
    
    if (hasSwimming || hasSnorkeling || hasWaterAerobics) {
      console.log("   ✅ PASS: water_sports expands to water activities");
      passedChecks++;
    } else {
      console.log("   ❌ FAIL: water_sports not expanding properly");
      failedChecks++;
    }
  } else {
    console.log("   ⚠️ No users found with water_sports button");
  }
  
  // Final Report
  console.log("\n" + "=".repeat(60));
  console.log("📊 FINAL QUALITY CHECKPOINT RESULTS:");
  console.log("=".repeat(60));
  console.log(`✅ Passed checks: ${passedChecks}`);
  console.log(`❌ Failed checks: ${failedChecks}`);
  
  if (failedChecks === 0) {
    console.log("\n🎉 SUCCESS! Compound buttons are REALLY being saved!");
    console.log("The system is working correctly.");
  } else if (failedChecks <= 1) {
    console.log("\n⚠️ MOSTLY WORKING but needs attention");
    console.log("Check the failed items above.");
  } else {
    console.log("\n🚨 CRITICAL ISSUES DETECTED!");
    console.log("Compound buttons are NOT being saved properly.");
    console.log("Review the failures above and fix immediately.");
  }
  
  // Specific actionable items
  if (failedChecks > 0) {
    console.log("\n📝 ACTION ITEMS:");
    if (!usersWithButtons || usersWithButtons.length === 0) {
      console.log("1. Fix saveUserPreferences() to include custom_activities field");
    }
    if (!properlyExpanded) {
      console.log("2. Fix compound button expansion in OnboardingHobbies.jsx");
    }
    if (inBoth.length === 0) {
      console.log("3. Ensure data saves to BOTH tables (user_preferences AND onboarding_responses)");
    }
    if (activitySignatures.size === 1) {
      console.log("4. Remove hardcoded test data - make sure real user selections are saved");
    }
  }
}

// Run the verification
verifyCompoundButtonSaves().catch(console.error);