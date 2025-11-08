#!/usr/bin/env node

/**
 * HOBBIES MASTER TABLE RESTORATION
 *
 * Restores the hobbies master table that was accidentally emptied.
 * Based on archived migration data showing 173 hobbies existed.
 *
 * This script:
 * 1. Populates hobbies table with comprehensive hobby list
 * 2. Marks universal vs location-specific hobbies
 * 3. Categorizes as activities or interests
 * 4. Sets up for AI-powered town-hobby association (next step)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

/**
 * Master hobbies list with metadata
 * Format: { name, category, is_universal }
 * - category: 'activity' or 'interest'
 * - is_universal: true if available everywhere, false if location-dependent
 */
const MASTER_HOBBIES = [
  // ===== UNIVERSAL HOBBIES (available everywhere) =====
  { name: 'Walking', category: 'activity', is_universal: true },
  { name: 'Reading', category: 'interest', is_universal: true },
  { name: 'Cooking', category: 'interest', is_universal: true },
  { name: 'Gardening', category: 'interest', is_universal: true },
  { name: 'Photography', category: 'interest', is_universal: true },
  { name: 'Yoga', category: 'activity', is_universal: true },
  { name: 'Meditation', category: 'interest', is_universal: true },
  { name: 'Birdwatching', category: 'interest', is_universal: true },
  { name: 'Writing', category: 'interest', is_universal: true },
  { name: 'Painting', category: 'interest', is_universal: true },
  { name: 'Music', category: 'interest', is_universal: true },
  { name: 'Chess', category: 'interest', is_universal: true },
  { name: 'Board Games', category: 'interest', is_universal: true },
  { name: 'Knitting', category: 'interest', is_universal: true },
  { name: 'Hiking', category: 'activity', is_universal: true },
  { name: 'Cycling', category: 'activity', is_universal: true },
  { name: 'Jogging', category: 'activity', is_universal: true },
  { name: 'Drawing', category: 'interest', is_universal: true },
  { name: 'Crafts', category: 'interest', is_universal: true },
  { name: 'Pottery', category: 'interest', is_universal: true },

  // ===== WATER ACTIVITIES (coastal/lake towns) =====
  { name: 'Swimming', category: 'activity', is_universal: false },
  { name: 'Swimming Laps', category: 'activity', is_universal: false },
  { name: 'Sailing', category: 'activity', is_universal: false },
  { name: 'Surfing', category: 'activity', is_universal: false },
  { name: 'Scuba Diving', category: 'activity', is_universal: false },
  { name: 'Kayaking', category: 'activity', is_universal: false },
  { name: 'Fishing', category: 'activity', is_universal: false },
  { name: 'Boating', category: 'activity', is_universal: false },
  { name: 'Snorkeling', category: 'activity', is_universal: false },
  { name: 'Water Skiing', category: 'activity', is_universal: false },
  { name: 'Water Aerobics', category: 'activity', is_universal: false },
  { name: 'Water Polo', category: 'activity', is_universal: false },
  { name: 'Canoeing', category: 'activity', is_universal: false },
  { name: 'Paddleboarding', category: 'activity', is_universal: false },
  { name: 'Stand-up Paddleboarding', category: 'activity', is_universal: false },
  { name: 'Windsurfing', category: 'activity', is_universal: false },
  { name: 'Kitesurfing', category: 'activity', is_universal: false },
  { name: 'Jet Skiing', category: 'activity', is_universal: false },
  { name: 'Deep Sea Fishing', category: 'activity', is_universal: false },
  { name: 'Yacht Racing', category: 'activity', is_universal: false },
  { name: 'Rowing', category: 'activity', is_universal: false },

  // ===== WINTER SPORTS (mountain/cold climate towns) =====
  { name: 'Downhill Skiing', category: 'activity', is_universal: false },
  { name: 'Cross-country Skiing', category: 'activity', is_universal: false },
  { name: 'Snowboarding', category: 'activity', is_universal: false },
  { name: 'Ice Skating', category: 'activity', is_universal: false },
  { name: 'Ice Hockey', category: 'activity', is_universal: false },
  { name: 'Ice Fishing', category: 'activity', is_universal: false },
  { name: 'Snowshoeing', category: 'activity', is_universal: false },
  { name: 'Sledding', category: 'activity', is_universal: false },
  { name: 'Curling', category: 'activity', is_universal: false },
  { name: 'Snowmobiling', category: 'activity', is_universal: false },

  // ===== RACQUET SPORTS (infrastructure-dependent) =====
  { name: 'Golf', category: 'activity', is_universal: false },
  { name: 'Tennis', category: 'activity', is_universal: false },
  { name: 'Pickleball', category: 'activity', is_universal: false },
  { name: 'Padel', category: 'activity', is_universal: false },
  { name: 'Bocce Ball', category: 'activity', is_universal: false },
  { name: 'Petanque', category: 'activity', is_universal: false },
  { name: 'Shuffleboard', category: 'activity', is_universal: false },
  { name: 'Ping Pong', category: 'activity', is_universal: false },
  { name: 'Badminton', category: 'activity', is_universal: false },

  // ===== OUTDOOR ACTIVITIES =====
  { name: 'Mountain Biking', category: 'activity', is_universal: false },
  { name: 'Nordic Walking', category: 'activity', is_universal: false },
  { name: 'Running', category: 'activity', is_universal: true },
  { name: 'Walking Groups', category: 'activity', is_universal: true },
  { name: 'Rock Climbing', category: 'activity', is_universal: false },
  { name: 'Horseback Riding', category: 'activity', is_universal: false },
  { name: 'Hot Air Ballooning', category: 'activity', is_universal: false },
  { name: 'Geocaching', category: 'activity', is_universal: true },
  { name: 'Orienteering', category: 'activity', is_universal: false },

  // ===== FITNESS & WELLNESS =====
  { name: 'Fitness Classes', category: 'activity', is_universal: true },
  { name: 'Martial Arts', category: 'activity', is_universal: true },
  { name: 'Tai Chi', category: 'activity', is_universal: true },
  { name: 'Pilates', category: 'activity', is_universal: true },
  { name: 'Spa & Wellness', category: 'interest', is_universal: false },

  // ===== CULTURAL ACTIVITIES (urban areas) =====
  { name: 'Museums', category: 'interest', is_universal: false },
  { name: 'Theater', category: 'interest', is_universal: false },
  { name: 'Opera', category: 'interest', is_universal: false },
  { name: 'Art Galleries', category: 'interest', is_universal: false },
  { name: 'Ballet', category: 'interest', is_universal: false },
  { name: 'Concerts', category: 'interest', is_universal: false },
  { name: 'Film Appreciation', category: 'interest', is_universal: true },
  { name: 'Community Theater', category: 'interest', is_universal: false },

  // ===== ARTS & CRAFTS =====
  { name: 'Arts & Crafts', category: 'interest', is_universal: true },
  { name: 'Sculpture', category: 'interest', is_universal: true },
  { name: 'Woodworking', category: 'interest', is_universal: true },
  { name: 'Jewelry Making', category: 'interest', is_universal: true },
  { name: 'Calligraphy', category: 'interest', is_universal: true },
  { name: 'Embroidery', category: 'interest', is_universal: true },
  { name: 'Quilting', category: 'interest', is_universal: true },
  { name: 'Sewing', category: 'interest', is_universal: true },
  { name: 'Scrapbooking', category: 'interest', is_universal: true },
  { name: 'Sketching', category: 'interest', is_universal: true },
  { name: 'Watercolor', category: 'interest', is_universal: true },
  { name: 'Glass Blowing', category: 'interest', is_universal: false },
  { name: 'Leather Crafting', category: 'interest', is_universal: true },
  { name: 'Needlepoint', category: 'interest', is_universal: true },
  { name: 'Stained Glass', category: 'interest', is_universal: true },
  { name: 'Crochet', category: 'interest', is_universal: true },

  // ===== MUSIC & PERFORMANCE =====
  { name: 'Dancing', category: 'activity', is_universal: true },
  { name: 'Ballroom Dancing', category: 'activity', is_universal: false },
  { name: 'Salsa Dancing', category: 'activity', is_universal: false },
  { name: 'Tango Dancing', category: 'activity', is_universal: false },
  { name: 'Line Dancing', category: 'activity', is_universal: true },
  { name: 'Square Dancing', category: 'activity', is_universal: true },
  { name: 'Folk Dancing', category: 'activity', is_universal: false },
  { name: 'Latin Dancing', category: 'activity', is_universal: false },
  { name: 'Choir Singing', category: 'interest', is_universal: true },
  { name: 'Karaoke', category: 'interest', is_universal: true },
  { name: 'Singing', category: 'interest', is_universal: true },
  { name: 'Instruments', category: 'interest', is_universal: true },
  { name: 'Jazz Appreciation', category: 'interest', is_universal: true },

  // ===== CULINARY =====
  { name: 'Baking', category: 'interest', is_universal: true },
  { name: 'Cooking Classes', category: 'interest', is_universal: false },
  { name: 'Wine Tasting', category: 'interest', is_universal: false },
  { name: 'Wine Tours', category: 'interest', is_universal: false },
  { name: 'Wine', category: 'interest', is_universal: false },
  { name: 'Food Tours', category: 'interest', is_universal: false },
  { name: 'Culinary Arts', category: 'interest', is_universal: false },
  { name: 'Fine Dining', category: 'interest', is_universal: false },
  { name: 'Cheese Making', category: 'interest', is_universal: true },
  { name: 'Home Brewing', category: 'interest', is_universal: true },
  { name: 'Coffee Culture', category: 'interest', is_universal: false },

  // ===== GARDENING & NATURE =====
  { name: 'Vegetable Gardening', category: 'interest', is_universal: true },
  { name: 'Herb Gardening', category: 'interest', is_universal: true },
  { name: 'Flower Arranging', category: 'interest', is_universal: true },
  { name: 'Greenhouse Gardening', category: 'interest', is_universal: true },
  { name: 'Orchid Growing', category: 'interest', is_universal: true },
  { name: 'Beekeeping', category: 'interest', is_universal: false },
  { name: 'Aquarium Keeping', category: 'interest', is_universal: true },
  { name: 'Nature Walks', category: 'activity', is_universal: true },
  { name: 'Bird Watching', category: 'interest', is_universal: true },

  // ===== SOCIAL & COMMUNITY =====
  { name: 'Volunteering', category: 'interest', is_universal: true },
  { name: 'Dog Walking', category: 'activity', is_universal: true },
  { name: 'Dog Training', category: 'interest', is_universal: true },
  { name: 'Farmers Markets', category: 'interest', is_universal: false },
  { name: 'Flea Markets', category: 'interest', is_universal: false },
  { name: 'Dining', category: 'interest', is_universal: true },
  { name: 'Shopping', category: 'interest', is_universal: true },

  // ===== ACADEMIC & LEARNING =====
  { name: 'History', category: 'interest', is_universal: true },
  { name: 'Genealogy', category: 'interest', is_universal: true },
  { name: 'Antique Collecting', category: 'interest', is_universal: true },
  { name: 'Astronomy', category: 'interest', is_universal: true },
  { name: 'Language Classes', category: 'interest', is_universal: true },
];

async function restoreHobbiesTable() {
  console.log('🎯 RESTORING HOBBIES MASTER TABLE\n');
  console.log('═'.repeat(60));

  // Check current state
  const { count: currentCount, error: countError } = await supabase
    .from('hobbies')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error checking hobbies table:', countError);
    process.exit(1);
  }

  console.log(`\n📊 Current state: ${currentCount} hobbies in database`);
  console.log(`📥 Will insert: ${MASTER_HOBBIES.length} hobbies`);

  if (currentCount > 0) {
    console.log('\n⚠️  WARNING: Table already has data!');
    console.log('   This script will add NEW hobbies only (no duplicates)');
    console.log('   To start fresh, manually truncate the hobbies table first.');
  }

  console.log('\n' + '═'.repeat(60));
  console.log('Starting insertion...\n');

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const hobby of MASTER_HOBBIES) {
    // Check if hobby already exists
    const { data: existing } = await supabase
      .from('hobbies')
      .select('id')
      .eq('name', hobby.name)
      .single();

    if (existing) {
      console.log(`⏭️  ${hobby.name} - already exists`);
      skipped++;
      continue;
    }

    // Insert the hobby
    const { error } = await supabase
      .from('hobbies')
      .insert({
        name: hobby.name,
        category: hobby.category,
        is_universal: hobby.is_universal
      });

    if (error) {
      console.log(`❌ ${hobby.name} - ERROR: ${error.message}`);
      errors++;
    } else {
      const icon = hobby.is_universal ? '🌍' : '📍';
      console.log(`✅ ${icon} ${hobby.name} (${hobby.category})`);
      inserted++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 SUMMARY:');
  console.log(`   ✅ Inserted: ${inserted} hobbies`);
  console.log(`   ⏭️  Skipped: ${skipped} hobbies (already existed)`);
  console.log(`   ❌ Errors: ${errors}`);

  // Final count
  const { count: finalCount } = await supabase
    .from('hobbies')
    .select('*', { count: 'exact', head: true });

  const { count: universalCount } = await supabase
    .from('hobbies')
    .select('*', { count: 'exact', head: true })
    .eq('is_universal', true);

  const { count: locationCount } = await supabase
    .from('hobbies')
    .select('*', { count: 'exact', head: true })
    .eq('is_universal', false);

  console.log(`\n📈 Final database state:`);
  console.log(`   Total hobbies: ${finalCount}`);
  console.log(`   🌍 Universal (available everywhere): ${universalCount}`);
  console.log(`   📍 Location-specific: ${locationCount}`);

  if (inserted > 0) {
    console.log('\n✅ Hobbies master table restored successfully!');
    console.log('\n🔜 Next step: Run AI population script to link hobbies to towns');
  } else if (skipped > 0 && errors === 0) {
    console.log('\n✅ All hobbies already exist - table is complete!');
  }

  console.log('═'.repeat(60));
}

restoreHobbiesTable().catch(console.error);
