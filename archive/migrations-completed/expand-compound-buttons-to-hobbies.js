#!/usr/bin/env node

/**
 * CRITICAL FIX: Expand compound button IDs to actual hobby names
 * 
 * Problem: Users have compound IDs like 'water_sports' in activities
 * Solution: Expand these to actual hobbies like 'swimming', 'snorkeling', etc.
 * 
 * This fixes the 38% match issue - hobbies weren't matching because
 * we were comparing 'water_sports' (compound ID) to 'swimming' (actual hobby)
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

// Database group mappings (from hobbies table group_name field)
const COMPOUND_TO_HOBBIES = {
  // Activities
  'walking_cycling': [
    'walking', 'cycling', 'hiking', 'jogging', 'mountain_biking', 
    'nordic_walking', 'geocaching', 'orienteering', 'walking_groups'
  ],
  'golf_tennis': [
    'golf', 'tennis', 'pickleball', 'bocce_ball', 'petanque', 
    'shuffleboard', 'ping_pong', 'badminton'
  ],
  'water_sports': [
    'swimming', 'snorkeling', 'water_skiing', 'swimming_laps', 
    'water_aerobics', 'water_polo'
  ],
  'water_crafts': [
    'boating', 'canoeing', 'kayaking', 'paddleboarding', 'sailing', 
    'rowing', 'jet_skiing', 'fishing', 'deep_sea_fishing', 'surfing',
    'windsurfing', 'scuba_diving', 'stand_up_paddleboarding', 'yacht_racing'
  ],
  'winter_sports': [
    'skiing', 'cross_country_skiing', 'downhill_skiing', 'snowboarding', 
    'ice_skating', 'sledding', 'snowshoeing', 'snowmobiling', 'curling', 
    'ice_fishing', 'ice_hockey'
  ],
  
  // Interests
  'gardening': [
    'gardening', 'herb_gardening', 'vegetable_gardening', 'flower_arranging', 
    'birdwatching', 'beekeeping', 'dog_walking', 'dog_training', 'nature_walks', 
    'aquarium_keeping', 'greenhouse_gardening', 'orchid_growing'
  ],
  'arts': [
    'arts', 'crafts', 'painting', 'drawing', 'pottery', 'sculpture', 
    'woodworking', 'jewelry_making', 'photography', 'calligraphy', 
    'embroidery', 'knitting', 'crochet', 'quilting', 'sewing', 
    'scrapbooking', 'sketching', 'watercolor', 'wildlife_photography',
    'glass_blowing', 'leather_crafting', 'needlepoint', 'stained_glass',
    'watercolor_painting', 'sculpting'
  ],
  'music_theater': [
    'music', 'theater', 'dancing', 'ballroom_dancing', 'choir_singing', 
    'community_theater', 'film_appreciation', 'folk_dancing', 'instrument_playing', 
    'jazz_appreciation', 'karaoke', 'latin_dancing', 'line_dancing', 
    'musical_instrument', 'opera', 'salsa_dancing', 'tango_dancing',
    'ballet', 'instruments', 'singing', 'square_dancing', 'tango'
  ],
  'cooking_wine': [
    'cooking', 'wine', 'baking', 'cheese_making', 'coffee_culture', 
    'cooking_classes', 'culinary_arts', 'fine_dining', 'food_tours', 
    'local_cuisine', 'wine_tasting', 'wine_tours', 'farmers_markets',
    'home_brewing', 'organic_groceries', 'vineyards'
  ],
  'history': [
    'museums', 'history', 'historical_sites', 'genealogy', 'antique_collecting',
    'astronomy'
  ]
};

async function expandCompoundButtons() {
  console.log('🔧 EXPANDING COMPOUND BUTTON IDS TO ACTUAL HOBBIES');
  console.log('=' .repeat(60));
  
  // Get all users with activities or interests
  const { data: users, error } = await supabase
    .from('user_preferences')
    .select('user_id, activities, interests, custom_activities')
    .or('activities.not.is.null,interests.not.is.null');
  
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  
  console.log(`Found ${users.length} users to check\n`);
  
  let expandedCount = 0;
  let alreadyExpandedCount = 0;
  
  for (const user of users) {
    const activities = user.activities || [];
    const interests = user.interests || [];
    
    // Check if activities contain compound IDs
    const hasCompoundActivities = activities.some(a => COMPOUND_TO_HOBBIES[a]);
    const hasCompoundInterests = interests.some(i => COMPOUND_TO_HOBBIES[i]);
    
    if (hasCompoundActivities || hasCompoundInterests) {
      console.log(`\n📝 User ${user.user_id.substring(0, 8)}...`);
      console.log(`   Before: activities=${JSON.stringify(activities)}`);
      console.log(`           interests=${JSON.stringify(interests)}`);
      
      // Expand activities
      const expandedActivities = new Set();
      activities.forEach(activity => {
        if (COMPOUND_TO_HOBBIES[activity]) {
          // It's a compound button - expand it
          COMPOUND_TO_HOBBIES[activity].forEach(h => expandedActivities.add(h));
        } else {
          // It's already a specific hobby - keep it
          expandedActivities.add(activity);
        }
      });
      
      // Expand interests
      const expandedInterests = new Set();
      interests.forEach(interest => {
        if (COMPOUND_TO_HOBBIES[interest]) {
          // It's a compound button - expand it
          COMPOUND_TO_HOBBIES[interest].forEach(h => expandedInterests.add(h));
        } else {
          // It's already a specific hobby - keep it
          expandedInterests.add(interest);
        }
      });
      
      const newActivities = Array.from(expandedActivities);
      const newInterests = Array.from(expandedInterests);
      
      console.log(`   After:  activities=${newActivities.length} items (was ${activities.length})`);
      console.log(`           interests=${newInterests.length} items (was ${interests.length})`);
      
      // Update the user's data
      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({
          activities: newActivities,
          interests: newInterests
        })
        .eq('user_id', user.user_id);
      
      if (updateError) {
        console.error(`   ❌ Failed to update:`, updateError);
      } else {
        console.log(`   ✅ Expanded successfully!`);
        expandedCount++;
      }
    } else {
      // Check if already properly expanded
      const hasSpecificHobbies = activities.some(a => 
        ['swimming', 'golf', 'tennis', 'hiking', 'painting', 'cooking'].includes(a)
      );
      
      if (hasSpecificHobbies) {
        alreadyExpandedCount++;
      }
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 EXPANSION COMPLETE');
  console.log(`✅ Expanded: ${expandedCount} users`);
  console.log(`✅ Already expanded: ${alreadyExpandedCount} users`);
  console.log(`⏭️  Skipped: ${users.length - expandedCount - alreadyExpandedCount} users (no compound buttons)`);
  
  if (expandedCount > 0) {
    console.log('\n🎯 IMPACT:');
    console.log('Users will now see accurate hobby matching scores!');
    console.log('Towns with golf/water sports will match properly.');
  }
}

// Run the expansion
expandCompoundButtons().catch(console.error);