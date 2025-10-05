#!/usr/bin/env node

// Fix case sensitivity issues in hobby system
// This script:
// 1. Backs up current hobbies table
// 2. Adds display_name column to preserve original capitalization
// 3. Converts all hobby names to lowercase for reliable matching

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function fixCaseSensitivity() {
  console.log('🔧 FIXING HOBBY CASE SENSITIVITY ISSUES');
  console.log('=' .repeat(80));
  console.log(`Started: ${new Date().toISOString()}`);
  console.log('');
  
  try {
    // 1. First, backup current hobbies data
    console.log('📦 Step 1: Backing up hobbies table...');
    const { data: hobbies, error: fetchError } = await supabase
      .from('hobbies')
      .select('*')
      .order('name');
    
    if (fetchError) {
      console.error('❌ Failed to fetch hobbies:', fetchError);
      return;
    }
    
    // Save backup
    const backupPath = `database-utilities/backups/hobbies-backup-${Date.now()}.json`;
    if (!fs.existsSync('database-utilities/backups')) {
      fs.mkdirSync('database-utilities/backups', { recursive: true });
    }
    fs.writeFileSync(backupPath, JSON.stringify(hobbies, null, 2));
    console.log(`✅ Backup saved to: ${backupPath}`);
    console.log(`   Total hobbies backed up: ${hobbies.length}`);
    console.log('');
    
    // 2. Check if display_name column exists
    console.log('🔍 Step 2: Checking for display_name column...');
    const { data: sampleHobby } = await supabase
      .from('hobbies')
      .select('*')
      .limit(1)
      .single();
    
    const hasDisplayName = sampleHobby && 'display_name' in sampleHobby;
    
    if (!hasDisplayName) {
      console.log('⚠️  display_name column does not exist');
      console.log('   Please run this SQL manually in Supabase:');
      console.log('   ALTER TABLE hobbies ADD COLUMN display_name TEXT;');
      console.log('');
      console.log('   Then re-run this script.');
      return;
    }
    console.log('✅ display_name column exists');
    console.log('');
    
    // 3. Update each hobby
    console.log('🔄 Step 3: Converting hobby names to lowercase...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const hobby of hobbies) {
      // Preserve original name in display_name if not already set
      const updates = {
        name: hobby.name.toLowerCase(),
        display_name: hobby.display_name || hobby.name
      };
      
      const { error: updateError } = await supabase
        .from('hobbies')
        .update(updates)
        .eq('id', hobby.id);
      
      if (updateError) {
        console.error(`❌ Failed to update "${hobby.name}":`, updateError.message);
        errorCount++;
      } else {
        if (hobby.name !== hobby.name.toLowerCase()) {
          console.log(`   ✓ ${hobby.name} → ${hobby.name.toLowerCase()}`);
        }
        successCount++;
      }
    }
    
    console.log('');
    console.log('📊 RESULTS:');
    console.log(`   ✅ Successfully updated: ${successCount} hobbies`);
    if (errorCount > 0) {
      console.log(`   ❌ Failed updates: ${errorCount} hobbies`);
    }
    console.log('');
    
    // 4. Verify the changes
    console.log('🔍 Step 4: Verifying changes...');
    const { data: updatedHobbies, error: verifyError } = await supabase
      .from('hobbies')
      .select('name, display_name')
      .order('name')
      .limit(10);
    
    if (!verifyError && updatedHobbies) {
      console.log('Sample of updated hobbies:');
      updatedHobbies.forEach(h => {
        console.log(`   name: "${h.name}" | display: "${h.display_name}"`);
      });
    }
    
    console.log('');
    console.log('=' .repeat(80));
    console.log('✅ CASE SENSITIVITY FIX COMPLETE!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update hobbiesMatching.js to use .toLowerCase()');
    console.log('2. Test matching with UI selections');
    console.log('3. Update compound mappings');
    console.log('');
    
    // Save completion report
    const report = {
      timestamp: new Date().toISOString(),
      backupPath,
      hobbiesProcessed: successCount,
      errors: errorCount,
      status: errorCount === 0 ? 'SUCCESS' : 'PARTIAL_SUCCESS'
    };
    
    fs.writeFileSync(
      'database-utilities/case-fix-report.json',
      JSON.stringify(report, null, 2)
    );
    console.log('📄 Report saved to: database-utilities/case-fix-report.json');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the fix
fixCaseSensitivity();