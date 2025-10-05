// Auto-connect uploaded photos to towns based on filename pattern
// Filename format: CC-CityName.jpg (e.g., "US-Miami.jpg", "ES-Barcelona.jpg")

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// ISO 3166-1 alpha-2 to country name mapping (most common)
const countryCodeMap = {
  'US': 'United States',
  'CA': 'Canada',
  'MX': 'Mexico',
  'ES': 'Spain',
  'PT': 'Portugal',
  'IT': 'Italy',
  'FR': 'France',
  'GR': 'Greece',
  'CR': 'Costa Rica',
  'PA': 'Panama',
  'EC': 'Ecuador',
  'CO': 'Colombia',
  'PE': 'Peru',
  'AR': 'Argentina',
  'UY': 'Uruguay',
  'CL': 'Chile',
  'BR': 'Brazil',
  'TH': 'Thailand',
  'VN': 'Vietnam',
  'MY': 'Malaysia',
  'ID': 'Indonesia',
  'PH': 'Philippines',
  'AU': 'Australia',
  'NZ': 'New Zealand',
  'FJ': 'Fiji',
  'DE': 'Germany',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'GB': 'United Kingdom',
  'IE': 'Ireland',
  'MA': 'Morocco',
  'TN': 'Tunisia',
  'ZA': 'South Africa',
  'DO': 'Dominican Republic',
  'IN': 'India',
  'TR': 'Turkey',
  'HR': 'Croatia',
  'MT': 'Malta',
  'CY': 'Cyprus'
};

async function autoConnectPhotos() {
  console.log('🔍 Step 1: Listing files in Supabase storage bucket "town-images"...\n');

  // List all files in the town-images bucket
  const { data: files, error: listError } = await supabase
    .storage
    .from('town-images')
    .list('', { limit: 1000 });

  if (listError) {
    console.error('❌ Error listing files:', listError.message);
    process.exit(1);
  }

  console.log(`✅ Found ${files.length} files in bucket\n`);

  // Parse filenames and extract country code + city name
  const photoMap = new Map(); // Key: "country|cityname", Value: [file1, file2, ...]

  files.forEach(file => {
    const filename = file.name;

    // Match pattern: CC-CityName.extension
    const match = filename.match(/^([A-Z]{2})-(.+)\.(jpg|jpeg|png|webp)$/i);

    if (match) {
      const countryCode = match[1].toUpperCase();
      const cityName = match[2].replace(/-/g, ' '); // Replace hyphens with spaces
      const country = countryCodeMap[countryCode] || countryCode;

      const key = `${country}|${cityName.toLowerCase()}`;

      if (!photoMap.has(key)) {
        photoMap.set(key, []);
      }
      photoMap.get(key).push(filename);
    } else {
      console.log(`⚠️  Skipping non-matching filename: ${filename}`);
    }
  });

  console.log(`\n📊 Parsed ${photoMap.size} unique town photo sets\n`);

  // Fetch all towns from database
  console.log('🔍 Step 2: Fetching all towns from database...\n');

  const { data: towns, error: townError } = await supabase
    .from('towns')
    .select('id, name, country, image_url_1, image_url_2, image_url_3');

  if (townError) {
    console.error('❌ Error fetching towns:', townError.message);
    process.exit(1);
  }

  console.log(`✅ Found ${towns.length} towns in database\n`);

  // Match photos to towns
  console.log('🔗 Step 3: Matching photos to towns...\n');

  const updates = [];
  let matchCount = 0;
  let skipCount = 0;

  for (const town of towns) {
    // Normalize town name for matching (lowercase, trim)
    const normalizedName = town.name.toLowerCase().trim();
    const normalizedCountry = town.country.trim();

    // Try to find photos for this town
    const key = `${normalizedCountry}|${normalizedName}`;
    const photos = photoMap.get(key);

    if (photos && photos.length > 0) {
      // Check if already has photos
      if (town.image_url_1 || town.image_url_2 || town.image_url_3) {
        console.log(`⏭️  ${town.name}, ${town.country} - Already has photos, skipping`);
        skipCount++;
        continue;
      }

      // Build public URLs
      const baseUrl = `${process.env.VITE_SUPABASE_URL}/storage/v1/object/public/town-images`;

      const update = {
        id: town.id,
        name: town.name,
        country: town.country,
        image_url_1: photos[0] ? `${baseUrl}/${photos[0]}` : null,
        image_url_2: photos[1] ? `${baseUrl}/${photos[1]}` : null,
        image_url_3: photos[2] ? `${baseUrl}/${photos[2]}` : null
      };

      updates.push(update);
      matchCount++;

      console.log(`✅ ${town.name}, ${town.country} - Matched ${photos.length} photo(s)`);
      if (photos.length > 3) {
        console.log(`   ⚠️  Note: Found ${photos.length} photos, using first 3`);
      }
    }
  }

  console.log(`\n📊 Match Summary:`);
  console.log(`   ✅ Matched: ${matchCount} towns`);
  console.log(`   ⏭️  Skipped (already has photos): ${skipCount} towns`);
  console.log(`   ❌ No match: ${towns.length - matchCount - skipCount} towns\n`);

  if (updates.length === 0) {
    console.log('ℹ️  No updates needed. Exiting.');
    return;
  }

  // Apply updates
  console.log(`🚀 Step 4: Updating ${updates.length} towns in database...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const update of updates) {
    const { error } = await supabase
      .from('towns')
      .update({
        image_url_1: update.image_url_1,
        image_url_2: update.image_url_2,
        image_url_3: update.image_url_3
      })
      .eq('id', update.id);

    if (error) {
      console.error(`❌ Failed to update ${update.name}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`✅ Updated ${update.name}, ${update.country}`);
      successCount++;
    }
  }

  console.log(`\n🎉 COMPLETE!`);
  console.log(`   ✅ Successfully updated: ${successCount} towns`);
  console.log(`   ❌ Failed: ${errorCount} towns`);
}

// Run the script
autoConnectPhotos().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
