import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// UNIVERSAL ACTIVITIES - Can be done ANYWHERE on Earth!
const UNIVERSAL_ACTIVITIES = [
  // Physical activities
  'walking',
  'jogging',
  'running',
  'yoga',
  'gym',
  'fitness',
  'stretching',
  'pilates',
  'home_workouts',
  'cycling',
  'swimming_pools', // Most towns have pools
  
  // Creative activities
  'photography',
  'painting',
  'drawing',
  'writing',
  'blogging',
  'music_practice',
  'singing',
  'crafts',
  'pottery',
  'knitting',
  'sewing',
  'woodworking',
  
  // Social & Entertainment
  'dining',
  'cafes',
  'bars',
  'nightlife',
  'shopping',
  'markets',
  'socializing',
  'meetups',
  'dating',
  'book_clubs',
  'language_exchange',
  'cooking_classes',
  'wine_tasting',
  'beer_tasting',
  
  // Games & Hobbies
  'card_games',
  'chess',
  'board_games',
  'video_games',
  'puzzles',
  'reading',
  'podcasts',
  'movies',
  'streaming',
  'collecting',
  
  // Wellness & Spiritual
  'meditation',
  'mindfulness',
  'spa',
  'massage',
  'prayer',
  'spiritual_practice',
  
  // Learning & Work
  'remote_work',
  'online_courses',
  'studying',
  'research',
  'volunteering',
  'teaching_online',
  
  // Everyday activities
  'cooking',
  'baking',
  'gardening',
  'pet_care',
  'bird_watching',
  'star_gazing',
  'people_watching',
  
  // Cultural (available everywhere in some form)
  'museums',
  'galleries',
  'theaters',
  'concerts',
  'festivals',
  'cultural_events',
  'local_cuisine',
  'food_tours'
];

// LOCATION-SPECIFIC activities to ADD based on features
function getLocationSpecificActivities(town) {
  const activities = [];
  
  // Check water bodies
  if (town.water_bodies && town.water_bodies.length > 0) {
    const waterStr = town.water_bodies.join(' ').toLowerCase();
    
    // Ocean/Sea activities
    if (waterStr.includes('ocean') || waterStr.includes('sea') || 
        waterStr.includes('pacific') || waterStr.includes('atlantic') ||
        waterStr.includes('indian') || waterStr.includes('mediterranean') ||
        waterStr.includes('caribbean')) {
      activities.push(
        'beach',
        'swimming_ocean',
        'sunbathing',
        'beach_volleyball',
        'beach_walks',
        'seaside_dining',
        'sailing',
        'boating',
        'fishing',
        'snorkeling',
        'kayaking',
        'paddleboarding'
      );
      
      // Add surfing for suitable locations
      if (['Australia', 'United States', 'Portugal', 'Spain', 'France', 
           'Indonesia', 'Brazil', 'Mexico', 'Costa Rica', 'Peru', 
           'South Africa', 'Morocco'].includes(town.country)) {
        activities.push('surfing');
      }
      
      // Add diving for tropical/clear waters
      if (town.climate === 'Tropical' || waterStr.includes('caribbean') || 
          waterStr.includes('red sea') || waterStr.includes('coral')) {
        activities.push('scuba_diving', 'coral_reef_diving');
      }
    }
    
    // Lake activities
    if (waterStr.includes('lake')) {
      activities.push(
        'lake_swimming',
        'lake_fishing',
        'boating',
        'water_skiing',
        'wakeboarding',
        'canoeing',
        'kayaking',
        'paddleboarding'
      );
    }
    
    // River activities
    if (waterStr.includes('river')) {
      activities.push(
        'river_walks',
        'river_cruises',
        'fishing',
        'kayaking',
        'canoeing'
      );
      
      // Add rafting for mountain rivers
      if (town.geographic_features?.some(f => f.toLowerCase().includes('mountain'))) {
        activities.push('white_water_rafting');
      }
    }
  }
  
  // Check geographic features
  if (town.geographic_features) {
    const features = town.geographic_features.join(' ').toLowerCase();
    
    // Mountain activities
    if (features.includes('mountain') || features.includes('alpine') || 
        features.includes('highland')) {
      activities.push(
        'hiking',
        'mountain_biking',
        'rock_climbing',
        'nature_trails',
        'scenic_drives',
        'cable_car_rides'
      );
      
      // Winter sports for appropriate climates
      if (town.seasonal_variation_actual === 'high' || 
          town.seasonal_variation_actual === 'extreme' ||
          ['Switzerland', 'Austria', 'France', 'Italy', 'Germany', 'Canada', 
           'United States', 'Japan', 'South Korea', 'Chile', 'Argentina', 
           'New Zealand', 'Norway', 'Sweden', 'Finland'].includes(town.country)) {
        activities.push('skiing', 'snowboarding', 'snowshoeing', 'ice_skating');
      }
    }
    
    // Desert activities
    if (features.includes('desert')) {
      activities.push(
        'desert_tours',
        'dune_bashing',
        'camel_rides',
        'desert_camping',
        'sandboarding',
        'desert_hiking'
      );
    }
    
    // Island activities
    if (features.includes('island')) {
      activities.push(
        'island_hopping',
        'boat_tours',
        'coastal_exploration',
        'snorkeling',
        'beach_hopping'
      );
    }
    
    // Historic activities
    if (features.includes('historic') || features.includes('medieval') || 
        features.includes('colonial')) {
      activities.push(
        'historical_tours',
        'architecture_tours',
        'castle_visits',
        'heritage_walks',
        'archaeological_sites'
      );
    }
  }
  
  // Country/Region specific cultural activities
  const culturalActivities = {
    'Argentina': ['tango', 'polo', 'wine_tours', 'asado'],
    'Spain': ['flamenco', 'tapas_tours', 'bullfighting_museum', 'siesta_culture'],
    'Thailand': ['muay_thai', 'temple_visits', 'floating_markets', 'thai_massage'],
    'Japan': ['onsen', 'tea_ceremony', 'temple_visits', 'cherry_blossom_viewing'],
    'India': ['yoga_retreats', 'ayurveda', 'temple_visits', 'bollywood'],
    'Italy': ['wine_tours', 'cooking_classes', 'vespa_tours', 'opera'],
    'France': ['wine_tours', 'cheese_tasting', 'perfume_tours', 'cabaret'],
    'Greece': ['ancient_sites', 'greek_dancing', 'tavernas', 'archaeology'],
    'Turkey': ['hammam', 'whirling_dervishes', 'bazaars', 'hot_air_ballooning'],
    'Mexico': ['cenotes', 'mayan_ruins', 'tequila_tours', 'mariachi'],
    'Egypt': ['pyramids', 'nile_cruises', 'desert_safaris', 'diving_red_sea'],
    'Morocco': ['souks', 'hammam', 'mint_tea_culture', 'desert_camps'],
    'Brazil': ['samba', 'carnival', 'capoeira', 'football_culture'],
    'Peru': ['inca_trails', 'pisco_tours', 'amazon_tours', 'andean_culture'],
    'Indonesia': ['temple_visits', 'batik_making', 'rice_terrace_tours', 'volcano_tours'],
    'Vietnam': ['street_food_tours', 'motorbike_tours', 'floating_markets', 'war_history'],
    'Portugal': ['fado_music', 'port_wine_tours', 'azulejo_tours', 'surfing'],
    'Netherlands': ['canal_tours', 'cycling_culture', 'tulip_tours', 'cheese_markets'],
    'Germany': ['beer_gardens', 'christmas_markets', 'castle_tours', 'autobahn'],
    'United Kingdom': ['pub_culture', 'afternoon_tea', 'royal_sites', 'football'],
    'Ireland': ['pub_culture', 'traditional_music', 'whiskey_tours', 'celtic_culture'],
    'Australia': ['surfing', 'outback_tours', 'wine_regions', 'aboriginal_culture'],
    'New Zealand': ['adventure_sports', 'maori_culture', 'wine_tours', 'lotr_tours'],
    'Canada': ['ice_hockey', 'maple_syrup_tours', 'northern_lights', 'whale_watching'],
    'United States': ['baseball', 'bbq_culture', 'national_parks', 'road_trips'],
    'Dubai': ['desert_safaris', 'gold_souks', 'dhow_cruises', 'luxury_shopping'],
    'Singapore': ['hawker_centers', 'gardens', 'marina_bay', 'multicultural_tours'],
    'South Korea': ['k_pop', 'korean_bbq', 'temple_stays', 'jimjilbang'],
    'China': ['great_wall', 'tea_culture', 'martial_arts', 'calligraphy'],
    'Cuba': ['salsa_dancing', 'cigar_tours', 'classic_cars', 'rum_tours'],
    'Jamaica': ['reggae_culture', 'jerk_cuisine', 'rum_tours', 'blue_mountain_coffee'],
    'Iceland': ['northern_lights', 'hot_springs', 'glacier_tours', 'volcano_tours'],
    'Norway': ['fjord_cruises', 'northern_lights', 'midnight_sun', 'viking_culture'],
    'Sweden': ['saunas', 'midsummer_festivals', 'design_tours', 'fika_culture'],
    'Finland': ['saunas', 'northern_lights', 'husky_sledding', 'ice_hotels'],
    'Croatia': ['island_hopping', 'game_of_thrones_tours', 'truffle_hunting', 'sailing'],
    'Czech Republic': ['beer_culture', 'castle_tours', 'spa_towns', 'crystal_tours']
  };
  
  if (culturalActivities[town.country]) {
    activities.push(...culturalActivities[town.country]);
  }
  
  return [...new Set(activities)]; // Remove duplicates
}

async function addUniversalActivities() {
  console.log('🌍 ADDING UNIVERSAL ACTIVITIES TO ALL TOWNS\n');
  console.log('===========================================\n');
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Processing ${towns.length} towns...\n`);
  
  let updateCount = 0;
  let errorCount = 0;
  
  for (const town of towns) {
    // Start with universal activities (same for everyone)
    let allActivities = [...UNIVERSAL_ACTIVITIES];
    
    // Add location-specific activities
    const locationSpecific = getLocationSpecificActivities(town);
    allActivities = [...allActivities, ...locationSpecific];
    
    // Remove duplicates and sort
    allActivities = [...new Set(allActivities)].sort();
    
    // Update the town
    const { error: updateError } = await supabase
      .from('towns')
      .update({ activities_available: allActivities })
      .eq('id', town.id);
      
    if (updateError) {
      console.error(`Failed to update ${town.name}: ${updateError.message}`);
      errorCount++;
    } else {
      updateCount++;
      if (updateCount % 50 === 0) {
        console.log(`  Updated ${updateCount} towns...`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('ACTIVITIES UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Show samples
  console.log('\n📋 SAMPLE RESULTS:\n');
  
  const samples = ['Dubai', 'Singapore', 'Zurich', 'Miami', 'Tokyo', 'Santorini', 'Cusco'];
  
  for (const name of samples) {
    const { data: town } = await supabase
      .from('towns')
      .select('name, country, activities_available')
      .eq('name', name)
      .single();
    
    if (town) {
      const universal = town.activities_available.filter(a => UNIVERSAL_ACTIVITIES.includes(a));
      const specific = town.activities_available.filter(a => !UNIVERSAL_ACTIVITIES.includes(a));
      
      console.log(`${town.name}, ${town.country}:`);
      console.log(`  Universal: ${universal.length} activities`);
      console.log(`  Location-specific: ${specific.length} activities`);
      console.log(`  Specific examples: [${specific.slice(0, 5).join(', ')}...]\n`);
    }
  }
}

// Run update
addUniversalActivities().catch(console.error);