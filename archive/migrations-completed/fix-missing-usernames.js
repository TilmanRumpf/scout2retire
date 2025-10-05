import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Generates a username from an email address
 * Takes the part before @ and sanitizes it for use as username
 *
 * @param {string} email - User's email address
 * @returns {string} - Generated username
 */
function generateUsernameFromEmail(email) {
  if (!email) return null;

  // Get the part before @
  const localPart = email.split('@')[0];

  // Remove any special characters and convert to lowercase
  // Keep only letters, numbers, underscores, and hyphens
  const sanitized = localPart
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');

  return sanitized;
}

/**
 * Finds all users with null or empty usernames and generates appropriate usernames
 * Updates the users table with the generated usernames
 */
async function fixMissingUsernames() {
  console.log('👤 FIXING MISSING USERNAMES\n');
  console.log('====================================\n');

  try {
    // 1. Find all users with missing usernames
    console.log('🔍 Finding users with missing usernames...\n');

    const { data: usersWithoutUsername, error: fetchError } = await supabase
      .from('users')
      .select('id, email, username')
      .or('username.is.null,username.eq.');

    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError.message);
      return;
    }

    if (!usersWithoutUsername || usersWithoutUsername.length === 0) {
      console.log('✅ All users already have usernames!');
      return;
    }

    console.log(`Found ${usersWithoutUsername.length} user(s) with missing usernames:\n`);
    usersWithoutUsername.forEach(user => {
      console.log(`  - ${user.email || 'NO EMAIL'} (ID: ${user.id})`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('GENERATING AND UPDATING USERNAMES');
    console.log('='.repeat(60) + '\n');

    // 2. Generate and update usernames
    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (const user of usersWithoutUsername) {
      const generatedUsername = generateUsernameFromEmail(user.email);

      if (!generatedUsername) {
        console.log(`⚠️  ${user.email || user.id}: No email available, skipping`);
        errorCount++;
        results.push({
          email: user.email,
          status: 'skipped',
          reason: 'No email available'
        });
        continue;
      }

      // Check if username already exists (avoid duplicates)
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', generatedUsername)
        .single();

      let finalUsername = generatedUsername;

      // If username exists, append a number
      if (existingUser && existingUser.id !== user.id) {
        let counter = 1;
        let isUnique = false;

        while (!isUnique && counter < 100) {
          const testUsername = `${generatedUsername}${counter}`;
          const { data: duplicate } = await supabase
            .from('users')
            .select('id')
            .eq('username', testUsername)
            .single();

          if (!duplicate) {
            finalUsername = testUsername;
            isUnique = true;
          } else {
            counter++;
          }
        }

        if (!isUnique) {
          console.log(`❌ ${user.email}: Could not generate unique username after 100 attempts`);
          errorCount++;
          results.push({
            email: user.email,
            status: 'error',
            reason: 'Could not generate unique username'
          });
          continue;
        }
      }

      // Update the user with the generated username
      const { error: updateError } = await supabase
        .from('users')
        .update({ username: finalUsername })
        .eq('id', user.id);

      if (updateError) {
        console.log(`❌ ${user.email}: Update failed - ${updateError.message}`);
        errorCount++;
        results.push({
          email: user.email,
          status: 'error',
          reason: updateError.message
        });
      } else {
        console.log(`✅ ${user.email}: → "${finalUsername}"`);
        successCount++;
        results.push({
          email: user.email,
          username: finalUsername,
          status: 'success'
        });
      }
    }

    // 3. Summary
    console.log('\n' + '='.repeat(60));
    console.log('USERNAME FIX COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${successCount} user(s)`);
    console.log(`❌ Errors/Skipped: ${errorCount} user(s)`);

    // 4. Final verification
    console.log('\n📊 FINAL VERIFICATION:\n');

    const { data: stillMissing, error: verifyError } = await supabase
      .from('users')
      .select('id, email, username')
      .or('username.is.null,username.eq.');

    if (verifyError) {
      console.log('⚠️  Error during verification:', verifyError.message);
    } else if (stillMissing && stillMissing.length > 0) {
      console.log(`⚠️  Still missing usernames: ${stillMissing.length} user(s)`);
      stillMissing.forEach(user => {
        console.log(`  - ${user.email || user.id}: ${user.username || 'NULL'}`);
      });
    } else {
      console.log('✅ All users now have usernames!');
    }

    // 5. Show all usernames
    console.log('\n📋 ALL CURRENT USERNAMES:\n');

    const { data: allUsers } = await supabase
      .from('users')
      .select('email, username')
      .order('email');

    if (allUsers) {
      allUsers.forEach(user => {
        console.log(`  ${user.email}: "${user.username || 'NULL'}"`);
      });
    }

  } catch (error) {
    console.error('\n💥 Unexpected error:', error);
  }
}

// Run the fix
fixMissingUsernames().catch(console.error);
