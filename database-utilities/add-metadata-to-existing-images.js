/**
 * ADD METADATA TO EXISTING TOWN IMAGES
 *
 * Purpose: Add town_id metadata to existing 23 images in town-images bucket
 * Required for: Per-town RLS policies to work correctly
 *
 * How it works:
 * 1. List all files in town-images bucket
 * 2. Parse filename format: {countryCode}-{townSlug}-{slot}.jpg
 * 3. Match to town in database by parsing town name from slug
 * 4. Update storage object metadata with town_id
 *
 * Safe to run multiple times - only updates missing metadata
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addMetadataToExistingImages() {
  console.log('🔧 ADDING METADATA TO EXISTING TOWN IMAGES\n');
  console.log('='.repeat(80));

  try {
    // Step 1: List all files in town-images bucket
    console.log('\n📂 Listing files in town-images bucket...');
    const { data: files, error: listError } = await supabase.storage
      .from('town-images')
      .list('', { limit: 1000 });

    if (listError) throw listError;

    console.log(`✅ Found ${files.length} files in bucket`);

    if (files.length === 0) {
      console.log('\n⚠️  No files found in bucket. Nothing to do.');
      return;
    }

    // Step 2: Load all towns from database (for matching)
    console.log('\n📊 Loading towns from database...');
    const { data: towns, error: townsError } = await supabase
      .from('towns')
      .select('id, town_name, name, country');

    if (townsError) throw townsError;

    console.log(`✅ Loaded ${towns.length} towns from database`);

    // Create lookup map for fast matching
    // Map by normalized name (lowercase, no spaces, no special chars)
    const townMap = new Map();
    towns.forEach(town => {
      const normalizedName = (town.town_name || town.name || '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      if (normalizedName) {
        townMap.set(normalizedName, town);
      }
    });

    console.log(`✅ Created lookup map with ${townMap.size} normalized town names`);

    // Step 3: Process each file
    console.log('\n' + '='.repeat(80));
    console.log('🔄 Processing files...\n');

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const file of files) {
      const fileName = file.name;

      // Skip folders
      if (!fileName.includes('.')) {
        console.log(`⏭️  Skipping folder: ${fileName}`);
        skippedCount++;
        continue;
      }

      console.log(`\n📄 Processing: ${fileName}`);

      // Parse filename: {countryCode}-{townSlug}-{slot}.jpg
      // Example: us-miami-1.jpg, pt-lisbon-2.jpg
      const match = fileName.match(/^([a-z]{2})-(.+)-(\d+)\.(jpg|jpeg|png|webp)$/i);

      if (!match) {
        console.log(`   ⚠️  Cannot parse filename format (expected: cc-townname-slot.ext)`);
        skippedCount++;
        continue;
      }

      const [, countryCode, townSlug, slot, ext] = match;
      console.log(`   Parsed: country=${countryCode}, townSlug=${townSlug}, slot=${slot}`);

      // Find matching town
      const matchingTown = townMap.get(townSlug);

      if (!matchingTown) {
        console.log(`   ❌ No matching town found for slug: "${townSlug}"`);
        errorCount++;
        continue;
      }

      console.log(`   ✅ Matched to town: ${matchingTown.town_name || matchingTown.name} (ID: ${matchingTown.id})`);

      // Update metadata using REST API
      // Note: Storage SDK doesn't have update-metadata-only method
      // We need to use the REST API directly
      try {
        const response = await fetch(
          `${process.env.VITE_SUPABASE_URL}/storage/v1/object/town-images/${fileName}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
            },
            body: JSON.stringify({
              metadata: {
                town_id: matchingTown.id,
                updated_at: new Date().toISOString()
              }
            })
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.log(`   ❌ Failed to update metadata: ${errorText}`);
          errorCount++;
        } else {
          console.log(`   ✅ Metadata updated successfully`);
          updatedCount++;
        }
      } catch (error) {
        console.log(`   ❌ Error updating: ${error.message}`);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY:\n');
    console.log(`Total files: ${files.length}`);
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    if (errorCount > 0) {
      console.log('\n⚠️  Some files could not be updated. Check logs above for details.');
    } else if (updatedCount > 0) {
      console.log('\n✅ All files updated successfully!');
    }

  } catch (error) {
    console.error('\n💥 FATAL ERROR:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    process.exit(1);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ DONE\n');
}

addMetadataToExistingImages().catch(console.error);
