import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ACTIVITIES FROM ONBOARDING (OnboardingHobbies.jsx)
// These are what users can ACTUALLY select in the app!
const ONBOARDING_ACTIVITIES = {
  // Main activity buttons (lines 380-385)
  walking_cycling: ['walking', 'cycling', 'walking_groups', 'cycling_culture'],
  golf_tennis: ['golf', 'tennis', 'pickleball', 'badminton', 'ping_pong'],
  water_sports: ['swimming', 'swimming_pools', 'swimming_ocean', 'water_aerobics'],
  water_crafts: ['kayaking', 'sailing', 'boating', 'canoeing', 'paddleboarding', 'fishing'],
  winter_sports: ['skiing', 'snowboarding', 'ice_skating', 'snowshoeing', 'cross_country_skiing'],
  
  // Custom physical activities from modal (lines 399-482)
  walking_cycling_related: [
    'geocaching', 'hiking', 'jogging', 'mountain_biking', 'orienteering', 'walking_groups'
  ],
  
  golf_tennis_related: [
    'badminton', 'bocce_ball', 'petanque', 'pickleball', 'ping_pong', 'shuffleboard', 'tennis'
  ],
  
  water_sports_related: [
    'snorkeling', 'swimming_laps', 'water_aerobics', 'water_polo'
  ],
  
  water_crafts_related: [
    'boating', 'canoeing', 'deep_sea_fishing', 'fishing', 'kayaking', 'sailing', 'scuba_diving',
    'stand_up_paddleboarding', 'surfing', 'windsurfing', 'yacht_racing'
  ],
  
  winter_sports_related: [
    'cross_country_skiing', 'curling', 'downhill_skiing', 'ice_fishing',
    'ice_hockey', 'ice_skating', 'sledding', 'snowboarding', 'snowmobiling', 'snowshoeing'
  ],
  
  other_sports_fitness: [
    'archery', 'basketball', 'bowling', 'fencing', 'fitness_classes',
    'martial_arts', 'pilates', 'spa_wellness', 'tai_chi', 'yoga', 'zumba'
  ],
  
  adventure_outdoor: [
    'camping', 'flying', 'horseback_riding', 'hot_air_ballooning',
    'motorcycling', 'paragliding', 'racing', 'rock_climbing'
  ]
};

// INTERESTS FROM ONBOARDING (lines 388-394)
const ONBOARDING_INTERESTS = {
  gardening: ['gardening', 'vegetable_gardening', 'flower_arranging', 'pet_care'],
  arts: ['painting', 'pottery', 'crafts', 'drawing', 'sculpting'],
  music_theater: ['concerts', 'plays', 'opera', 'theater', 'music'],
  cooking_wine: ['cooking', 'wine_tasting', 'baking', 'food_tours', 'cooking_classes'],
  history: ['museums', 'historical_tours', 'heritage_walks', 'archaeological_sites'],
  
  // Custom hobbies from modal (lines 432-481)
  gardening_pets_related: [
    'aquarium_keeping', 'beekeeping', 'birdwatching', 'dog_training', 'dog_walking',
    'flower_arranging', 'greenhouse_gardening', 'herb_gardening', 'nature_walks',
    'orchid_growing', 'vegetable_gardening'
  ],
  
  arts_crafts_related: [
    'calligraphy', 'crochet', 'drawing', 'embroidery', 'glass_blowing',
    'jewelry_making', 'knitting', 'leather_crafting', 'needlepoint',
    'painting', 'pottery', 'quilting', 'scrapbooking', 'sculpting',
    'sewing', 'sketching', 'stained_glass', 'watercolor_painting',
    'wildlife_photography', 'woodworking'
  ],
  
  music_theater_related: [
    'ballet', 'ballroom_dancing', 'choir_singing', 'community_theater',
    'film_appreciation', 'instruments', 'jazz_appreciation',
    'line_dancing', 'opera', 'salsa_dancing', 'singing', 'square_dancing', 'tango'
  ],
  
  cooking_wine_related: [
    'baking', 'cheese_making', 'coffee_culture', 'cooking_classes', 'farmers_markets',
    'food_tours', 'home_brewing', 'organic_groceries', 'vineyards', 'wine_tasting'
  ],
  
  museums_history_related: [
    'antique_collecting', 'astronomy', 'genealogy', 'historical_sites', 'museums'
  ],
  
  social_community: [
    'art_fairs', 'bible_study', 'book_clubs', 'cultural_festivals', 'flea_markets',
    'grandchildren_activities', 'outdoor_concerts', 'street_festivals', 'volunteering'
  ],
  
  games_mental_activities: [
    'board_games', 'bridge', 'card_games', 'chess', 'crossword_puzzles',
    'darts', 'jigsaw_puzzles', 'mahjong', 'poker', 'sudoku',
    'trivia_nights', 'video_gaming'
  ],
  
  collecting_hobbies: [
    'collecting_coins', 'collecting_stamps', 'metal_detecting',
    'model_building', 'radio_amateur', 'stargazing'
  ],
  
  learning_culture: [
    'blogging', 'creative_writing', 'digital_photography', 'journaling',
    'language_learning', 'meditation', 'poetry', 'rv_traveling',
    'travel_planning', 'writing_memoirs'
  ]
};

async function addOnboardingActivitiesToTowns() {
  console.log('🎯 ADDING ONBOARDING ACTIVITIES TO ALL TOWNS\n');
  console.log('============================================\n');
  
  // Flatten all onboarding activities
  const allOnboardingActivities = new Set();
  
  // Add main activities
  Object.values(ONBOARDING_ACTIVITIES).forEach(activities => {
    activities.forEach(activity => {
      // Normalize activity names (lowercase, underscores)
      allOnboardingActivities.add(activity.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_'));
    });
  });
  
  // Add interests
  Object.values(ONBOARDING_INTERESTS).forEach(interests => {
    interests.forEach(interest => {
      // Normalize interest names
      allOnboardingActivities.add(interest.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_'));
    });
  });
  
  console.log(`Total onboarding activities to add: ${allOnboardingActivities.size}\n`);
  console.log('Activities from onboarding:');
  Array.from(allOnboardingActivities).sort().forEach(a => console.log(`  - ${a}`));
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, activities_available')
    .order('id');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`\nProcessing ${towns.length} towns...\n`);
  
  let updateCount = 0;
  let addedCount = 0;
  
  for (const town of towns) {
    let activities = town.activities_available || [];
    let needsUpdate = false;
    let localAdded = 0;
    
    // Add all onboarding activities if not present
    allOnboardingActivities.forEach(activity => {
      if (!activities.includes(activity)) {
        activities.push(activity);
        needsUpdate = true;
        localAdded++;
      }
    });
    
    if (needsUpdate) {
      // Sort activities
      activities.sort();
      
      // Update the town
      const { error: updateError } = await supabase
        .from('towns')
        .update({ activities_available: activities })
        .eq('id', town.id);
        
      if (updateError) {
        console.error(`Failed to update ${town.name}: ${updateError.message}`);
      } else {
        updateCount++;
        addedCount += localAdded;
        if (updateCount % 50 === 0) {
          console.log(`  Updated ${updateCount} towns...`);
        }
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('ONBOARDING ACTIVITIES UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`✅ Total activities added: ${addedCount}`);
  
  // Verify with a sample town
  console.log('\n📊 VERIFICATION:\n');
  
  const { data: sampleTown } = await supabase
    .from('towns')
    .select('name, country, activities_available')
    .eq('name', 'Miami')
    .single();
  
  if (sampleTown) {
    console.log(`Sample: ${sampleTown.name}, ${sampleTown.country}`);
    console.log(`Total activities: ${sampleTown.activities_available.length}`);
    
    // Check for specific onboarding activities
    const checkActivities = [
      'walking_groups', 'pickleball', 'water_aerobics', 'paddleboarding',
      'geocaching', 'bocce_ball', 'tai_chi', 'birdwatching', 
      'choir_singing', 'genealogy', 'mahjong', 'rv_traveling'
    ];
    
    console.log('\nOnboarding activities present:');
    checkActivities.forEach(activity => {
      const present = sampleTown.activities_available.includes(activity);
      console.log(`  ${present ? '✅' : '❌'} ${activity}`);
    });
  }
}

// Run the update
addOnboardingActivitiesToTowns().catch(console.error);