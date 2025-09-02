#!/usr/bin/env node

/**
 * ADD VERIFICATION COLUMNS TO HOBBIES TABLE
 * 
 * Adds three admin-friendly columns for hobby verification management:
 * - verification_method: How to verify (universal, database, ai_facilities, etc.)
 * - verification_query: SQL or AI query to run
 * - verification_notes: Admin notes about verification
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function addVerificationColumns() {
  console.log('🔧 ADDING VERIFICATION COLUMNS TO HOBBIES TABLE');
  console.log('=' .repeat(60));
  
  try {
    // First, check current columns
    console.log('\n1. Checking current table structure...');
    const { data: sample, error: sampleError } = await supabase
      .from('hobbies')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Error checking table:', sampleError);
      return;
    }
    
    const currentColumns = sample && sample.length > 0 ? Object.keys(sample[0]) : [];
    console.log('Current columns:', currentColumns.join(', '));
    
    // Check if columns already exist
    const hasVerificationMethod = currentColumns.includes('verification_method');
    const hasVerificationQuery = currentColumns.includes('verification_query');
    const hasVerificationNotes = currentColumns.includes('verification_notes');
    
    if (hasVerificationMethod && hasVerificationQuery && hasVerificationNotes) {
      console.log('\n✅ All verification columns already exist!');
      return;
    }
    
    // Since we can't run ALTER TABLE directly, we need to use a workaround
    // We'll update the schema through Supabase dashboard or use the migration approach
    
    console.log('\n⚠️  MANUAL STEP REQUIRED:');
    console.log('Please run the following SQL in your Supabase dashboard:');
    console.log('https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/editor');
    console.log('\n--- COPY THIS SQL ---\n');
    
    if (!hasVerificationMethod) {
      console.log('ALTER TABLE hobbies ADD COLUMN verification_method TEXT;');
    }
    if (!hasVerificationQuery) {
      console.log('ALTER TABLE hobbies ADD COLUMN verification_query TEXT;');
    }
    if (!hasVerificationNotes) {
      console.log('ALTER TABLE hobbies ADD COLUMN verification_notes TEXT;');
    }
    
    console.log('\n--- END SQL ---\n');
    
    console.log('After running the SQL, press Enter to continue...');
    
    // Wait for user input
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
    // Verify columns were added
    console.log('\n2. Verifying columns were added...');
    const { data: verify, error: verifyError } = await supabase
      .from('hobbies')
      .select('id, name, verification_method, verification_query, verification_notes')
      .limit(1);
    
    if (verifyError) {
      console.error('❌ Columns not found:', verifyError);
      return;
    }
    
    console.log('✅ Columns successfully added!');
    console.log('Sample row:', verify[0]);
    
    // Migrate data from required_conditions.verification if it exists
    console.log('\n3. Checking for existing verification data to migrate...');
    const { data: hobbies, error: fetchError } = await supabase
      .from('hobbies')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching hobbies:', fetchError);
      return;
    }
    
    let migratedCount = 0;
    const updates = [];
    
    for (const hobby of hobbies) {
      if (hobby.required_conditions?.verification) {
        const verification = hobby.required_conditions.verification;
        updates.push({
          id: hobby.id,
          verification_method: verification.method,
          verification_query: verification.query || verification.verification_query || null,
          verification_notes: verification.notes || null
        });
        migratedCount++;
      }
    }
    
    if (updates.length > 0) {
      console.log(`\n4. Migrating ${migratedCount} existing verification records...`);
      
      for (const update of updates) {
        const { error } = await supabase
          .from('hobbies')
          .update({
            verification_method: update.verification_method,
            verification_query: update.verification_query,
            verification_notes: update.verification_notes
          })
          .eq('id', update.id);
        
        if (error) {
          console.error(`❌ Failed to migrate hobby ${update.id}:`, error);
        }
      }
      
      console.log(`✅ Migrated ${migratedCount} verification records!`);
    } else {
      console.log('✅ No existing verification data to migrate');
    }
    
    // Show summary
    console.log('\n📊 SUMMARY:');
    console.log('- Total hobbies:', hobbies.length);
    console.log('- With verification data:', migratedCount);
    console.log('- Need classification:', hobbies.length - migratedCount);
    
    console.log('\n✨ Column addition complete!');
    console.log('You can now use the hobby-verification-classifier.js tool');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the migration
addVerificationColumns().catch(console.error);