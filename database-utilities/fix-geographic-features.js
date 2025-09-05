/**
 * Script to normalize geographic_features_actual data
 * Converts all values to lowercase for consistency
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function normalizeGeographicFeatures() {
  console.log('Starting geographic features normalization...\n');

  try {
    // Fetch all towns with geographic_features_actual data
    const { data: towns, error } = await supabase
      .from('towns')
      .select('id, name, geographic_features_actual')
      .not('geographic_features_actual', 'is', null);

    if (error) {
      console.error('Error fetching towns:', error);
      return;
    }

    console.log(`Found ${towns.length} towns with geographic features data\n`);

    let updatedCount = 0;
    const normalizationMap = {
      'Coastal': 'coastal',
      'coastal': 'coastal',
      'Mountain': 'mountain',
      'Mountains': 'mountain',
      'mountain': 'mountain',
      'mountains': 'mountain',
      'Island': 'island',
      'island': 'island',
      'Lake': 'lake',
      'Lakes': 'lake',
      'lake': 'lake',
      'lakes': 'lake',
      'River': 'river',
      'river': 'river',
      'Valley': 'valley',
      'valley': 'valley',
      'Desert': 'desert',
      'desert': 'desert',
      'Forest': 'forest',
      'forest': 'forest',
      'Plains': 'plains',
      'plains': 'plains',
      'Peninsula': 'peninsula',
      'peninsula': 'peninsula',
      'Archipelago': 'archipelago',
      'archipelago': 'archipelago',
      'Highland': 'highland',
      'highland': 'highland',
      'Lowland': 'lowland',
      'lowland': 'lowland',
      'Urban': 'urban',
      'urban': 'urban'
    };

    for (const town of towns) {
      if (!town.geographic_features_actual) continue;

      // Parse the array if it's a string
      let features = town.geographic_features_actual;
      if (typeof features === 'string') {
        try {
          features = JSON.parse(features);
        } catch (e) {
          console.warn(`Could not parse features for ${town.name}:`, features);
          continue;
        }
      }

      if (!Array.isArray(features)) {
        console.warn(`Features not an array for ${town.name}:`, features);
        continue;
      }

      // Normalize each feature
      const normalizedFeatures = [...new Set(features.map(feature => {
        const normalized = normalizationMap[feature];
        if (!normalized) {
          console.warn(`Unknown feature "${feature}" in ${town.name}`);
          return feature.toLowerCase(); // Default to lowercase
        }
        return normalized;
      }))];

      // Check if normalization changed anything
      const featuresChanged = JSON.stringify(features.sort()) !== JSON.stringify(normalizedFeatures.sort());
      
      if (featuresChanged) {
        console.log(`${town.name}:`);
        console.log(`  Before: ${JSON.stringify(features)}`);
        console.log(`  After:  ${JSON.stringify(normalizedFeatures)}`);
        
        // Update the town
        const { error: updateError } = await supabase
          .from('towns')
          .update({ geographic_features_actual: normalizedFeatures })
          .eq('id', town.id);

        if (updateError) {
          console.error(`  Error updating ${town.name}:`, updateError);
        } else {
          console.log(`  ✓ Updated successfully\n`);
          updatedCount++;
        }
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total towns processed: ${towns.length}`);
    console.log(`Towns updated: ${updatedCount}`);
    console.log(`\nGeographic features normalization complete!`);

  } catch (error) {
    console.error('Script error:', error);
  }
}

// Run the script
normalizeGeographicFeatures();