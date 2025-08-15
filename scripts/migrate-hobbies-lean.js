#!/usr/bin/env node

/**
 * Migration script to set up lean hobby matching
 * This consolidates hobby data and creates efficient lookups
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://axlruvvsjepsulcbqlho.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

/**
 * Core hobby mapping - what users actually select vs what towns offer
 */
const HOBBY_MAPPING = {
  // Physical activities
  'walking': { universal: true, keywords: ['walk', 'stroll', 'pedestrian'] },
  'cycling': { universal: false, keywords: ['bike', 'cycling', 'bicycle'], requires: ['bike_paths', 'trails'] },
  'swimming': { universal: false, keywords: ['swim', 'pool', 'beach'], requires: ['beach', 'pool', 'lake'] },
  'golf': { universal: false, keywords: ['golf'], requires: ['golf_course'] },
  'tennis': { universal: false, keywords: ['tennis'], requires: ['tennis_courts'] },
  'fishing': { universal: false, keywords: ['fish', 'angling'], requires: ['coast', 'lake', 'river'] },
  'hiking': { universal: false, keywords: ['hike', 'trail', 'trek'], requires: ['trails', 'mountains'] },
  'water_sports': { universal: false, keywords: ['surf', 'sail', 'kayak', 'dive'], requires: ['beach', 'coast', 'lake'] },
  'gardening': { universal: true, keywords: ['garden', 'plant'] },
  
  // Cultural interests
  'theater': { universal: false, keywords: ['theater', 'theatre', 'drama'], requires: ['cultural_center'] },
  'wine': { universal: false, keywords: ['wine', 'vineyard', 'winery'], requires: ['wine_region'] },
  'music': { universal: true, keywords: ['music', 'concert'] },
  'reading': { universal: true, keywords: ['read', 'book', 'library'] },
  'cooking': { universal: true, keywords: ['cook', 'culinary', 'cuisine'] },
  'arts': { universal: true, keywords: ['art', 'paint', 'craft'] },
  'history': { universal: false, keywords: ['history', 'historic', 'heritage'], requires: ['historic_sites'] },
  'museums': { universal: false, keywords: ['museum', 'gallery'], requires: ['museums'] },
  'volunteering': { universal: true, keywords: ['volunteer', 'charity', 'community'] }
};

async function analyzeTownCapabilities(town) {
  const capabilities = new Set();
  
  // Combine all text sources
  const textSources = [
    town.description || '',
    (town.geographic_features_actual || []).join(' '),
    (town.activities_available || []).join(' '),
    (town.interests_supported || []).join(' ')
  ].join(' ').toLowerCase();
  
  // Check each hobby
  for (const [hobby, config] of Object.entries(HOBBY_MAPPING)) {
    // Universal hobbies are always available
    if (config.universal) {
      capabilities.add(hobby);
      continue;
    }
    
    // Check if town mentions the hobby or its keywords
    const hasKeyword = config.keywords.some(keyword => textSources.includes(keyword));
    
    // Check if town has required infrastructure
    const hasInfrastructure = config.requires ? 
      config.requires.some(req => textSources.includes(req)) : false;
    
    if (hasKeyword || hasInfrastructure) {
      capabilities.add(hobby);
    }
  }
  
  // Special cases based on geography
  if (textSources.includes('coast') || textSources.includes('beach') || textSources.includes('ocean')) {
    capabilities.add('swimming');
    capabilities.add('water_sports');
    capabilities.add('fishing');
  }
  
  if (textSources.includes('mountain') || textSources.includes('alps') || textSources.includes('trail')) {
    capabilities.add('hiking');
  }
  
  if (textSources.includes('lake') || textSources.includes('river')) {
    capabilities.add('fishing');
    capabilities.add('swimming');
  }
  
  return Array.from(capabilities);
}

async function migrateHobbies() {
  console.log('🚀 Starting lean hobby migration...\n');
  
  try {
    // 1. Get all towns
    console.log('📍 Fetching all towns...');
    const { data: towns, error: townsError } = await supabase
      .from('towns')
      .select('*');
    
    if (townsError) throw townsError;
    console.log(`✅ Found ${towns.length} towns\n`);
    
    // 2. Analyze each town's capabilities
    console.log('🔍 Analyzing town capabilities...');
    const updates = [];
    
    for (const town of towns) {
      const capabilities = await analyzeTownCapabilities(town);
      
      if (capabilities.length > 0) {
        updates.push({
          id: town.id,
          name: town.name,
          hobby_capabilities: capabilities,
          hobby_count: capabilities.length
        });
        
        // Log progress for towns with photos
        if (town.image_url_1) {
          console.log(`  ${town.name}: ${capabilities.length} hobbies - ${capabilities.slice(0, 5).join(', ')}...`);
        }
      }
    }
    
    console.log(`\n✅ Analyzed ${updates.length} towns with hobby capabilities\n`);
    
    // 3. Check if hobby_capabilities column exists
    console.log('🔧 Checking database schema...');
    
    // First, let's check if the column exists by trying to query it
    const { error: schemaError } = await supabase
      .from('towns')
      .select('hobby_capabilities')
      .limit(1);
    
    if (schemaError && schemaError.message.includes('column')) {
      console.log('📝 Column hobby_capabilities does not exist. Please add it with:');
      console.log(`
ALTER TABLE towns 
ADD COLUMN hobby_capabilities TEXT[] DEFAULT '{}',
ADD COLUMN hobby_count INTEGER DEFAULT 0;
      `);
      console.log('\nThen run this script again.');
      return;
    }
    
    // 4. Update towns with capabilities
    console.log('💾 Updating towns with hobby capabilities...');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Update in batches of 10
    for (let i = 0; i < updates.length; i += 10) {
      const batch = updates.slice(i, i + 10);
      
      for (const update of batch) {
        const { error } = await supabase
          .from('towns')
          .update({
            hobby_capabilities: update.hobby_capabilities,
            hobby_count: update.hobby_count
          })
          .eq('id', update.id);
        
        if (error) {
          console.error(`❌ Error updating ${update.name}:`, error.message);
          errorCount++;
        } else {
          successCount++;
        }
      }
      
      // Progress indicator
      process.stdout.write(`\r  Progress: ${Math.min(i + 10, updates.length)}/${updates.length} towns`);
    }
    
    console.log('\n');
    console.log(`✅ Successfully updated ${successCount} towns`);
    if (errorCount > 0) {
      console.log(`⚠️  Failed to update ${errorCount} towns`);
    }
    
    // 5. Summary statistics
    console.log('\n📊 Migration Summary:');
    console.log('─'.repeat(40));
    
    const townsWithPhotos = updates.filter(u => 
      towns.find(t => t.id === u.id)?.image_url_1
    );
    
    console.log(`Towns with photos: ${townsWithPhotos.length}`);
    console.log(`Average hobbies per town: ${
      Math.round(updates.reduce((sum, u) => sum + u.hobby_count, 0) / updates.length)
    }`);
    
    // Find most common hobbies
    const hobbyFrequency = {};
    updates.forEach(u => {
      u.hobby_capabilities.forEach(h => {
        hobbyFrequency[h] = (hobbyFrequency[h] || 0) + 1;
      });
    });
    
    const sortedHobbies = Object.entries(hobbyFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    console.log('\nMost common hobbies across all towns:');
    sortedHobbies.forEach(([hobby, count]) => {
      console.log(`  ${hobby}: ${count} towns (${Math.round(count / towns.length * 100)}%)`);
    });
    
    console.log('\n✨ Migration complete!');
    console.log('You can now use the lean hobby matching functions.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateHobbies();