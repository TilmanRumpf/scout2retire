import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ULTIMATE REALISTIC ACTIVITY MAPPING BASED ON ALL AVAILABLE DATA
function getUltimateRealisticActivities(town) {
  const activities = new Set();
  
  // ========== UNIVERSAL ACTIVITIES (available everywhere) ==========
  const universal = [
    'walking', 'reading', 'cooking', 'photography', 'writing', 
    'meditation', 'stretching', 'home_workouts', 'online_yoga',
    'board_games', 'card_games', 'chess', 'crossword_puzzles', 'sudoku',
    'knitting', 'sewing', 'crafts', 'painting', 'drawing', 'sketching',
    'blogging', 'journaling', 'language_learning', 'online_courses',
    'video_gaming', 'streaming', 'podcasts', 'music_listening',
    'gardening', 'indoor_plants', 'bird_watching', 'star_gazing',
    'socializing', 'book_clubs', 'volunteering', 'video_calls',
    'cooking_experiments', 'baking', 'recipe_collecting'
  ];
  universal.forEach(a => activities.add(a));
  
  // ========== GOLF & TENNIS (VERIFIED INFRASTRUCTURE) ==========
  if (town.golf_courses_count > 0) {
    activities.add('golf');
    activities.add('driving_range');
    if (town.golf_courses_count >= 2) {
      activities.add('golf_variety');
      activities.add('golf_tournaments');
    }
    if (town.golf_courses_count >= 5) {
      activities.add('golf_destination');
    }
  }
  
  if (town.tennis_courts_count > 0) {
    activities.add('tennis');
    if (town.tennis_courts_count >= 5) {
      activities.add('tennis_clubs');
      activities.add('pickleball'); // Often shares courts
    }
    if (town.tennis_courts_count >= 10) {
      activities.add('tennis_tournaments');
      activities.add('tennis_lessons');
    }
  }
  
  // ========== WATER ACTIVITIES (BASED ON ACTUAL WATER BODIES) ==========
  if (town.water_bodies && town.water_bodies.length > 0) {
    const waterString = town.water_bodies.join(' ').toLowerCase();
    
    // Ocean/Sea activities
    if (waterString.includes('ocean') || waterString.includes('sea') || 
        waterString.includes('atlantic') || waterString.includes('pacific') ||
        waterString.includes('mediterranean') || waterString.includes('caribbean')) {
      
      activities.add('beach_walking');
      activities.add('seaside_dining');
      activities.add('coastal_photography');
      
      if (town.beaches_nearby) {
        activities.add('beach_lounging');
        activities.add('swimming_ocean');
        activities.add('beachcombing');
        activities.add('beach_volleyball');
        
        // Climate-dependent beach activities
        if (town.avg_temp_summer >= 25 || town.climate === 'Tropical') {
          activities.add('sunbathing');
          activities.add('beach_sports');
        }
        
        // Surfing - specific conditions needed
        if (['USA', 'Australia', 'Portugal', 'Spain', 'France', 'Brazil', 
             'Indonesia', 'Mexico', 'Costa Rica', 'Peru', 'South Africa', 
             'Morocco', 'Philippines', 'Sri Lanka'].includes(town.country)) {
          if (waterString.includes('pacific') || waterString.includes('atlantic')) {
            activities.add('surfing');
            activities.add('bodyboarding');
          }
        }
        
        // Tropical water activities
        if (town.climate === 'Tropical' || town.climate === 'Subtropical') {
          activities.add('snorkeling');
          if (waterString.includes('caribbean') || waterString.includes('coral') ||
              waterString.includes('red sea') || town.country === 'Maldives' ||
              town.country === 'Indonesia' || town.country === 'Philippines') {
            activities.add('scuba_diving');
            activities.add('coral_viewing');
          }
          activities.add('paddleboarding');
          activities.add('kayaking');
        }
      }
    }
    
    // River activities
    if (waterString.includes('river')) {
      activities.add('riverside_walks');
      activities.add('river_photography');
      if (town.marinas_count > 0 || waterString.includes('major river')) {
        activities.add('river_cruises');
      }
      activities.add('freshwater_fishing');
      
      // Mountain rivers might have rafting
      if (town.geographic_features?.includes('mountain') && town.hiking_trails_km > 50) {
        activities.add('white_water_rafting');
      }
    }
    
    // Lake activities  
    if (waterString.includes('lake')) {
      activities.add('lakeside_walks');
      activities.add('lake_photography');
      if (town.avg_temp_summer >= 20) {
        activities.add('lake_swimming');
        activities.add('paddleboarding');
      }
      activities.add('freshwater_fishing');
      if (town.marinas_count > 0) {
        activities.add('lake_boating');
        activities.add('water_skiing');
      }
    }
  }
  
  // ========== MARINA/BOATING ACTIVITIES ==========
  if (town.marinas_count > 0) {
    activities.add('boating');
    activities.add('sailing');
    activities.add('yacht_watching');
    if (town.marinas_count >= 2) {
      activities.add('yacht_clubs');
      activities.add('sailing_lessons');
      activities.add('fishing_charters');
    }
    if (town.marinas_count >= 3) {
      activities.add('yacht_racing');
      activities.add('marina_dining');
    }
  }
  
  // ========== HIKING & NATURE (VERIFIED TRAILS) ==========
  if (town.hiking_trails_km > 0) {
    activities.add('hiking');
    activities.add('nature_walks');
    activities.add('trail_photography');
    
    if (town.hiking_trails_km >= 25) {
      activities.add('day_hikes');
      activities.add('trail_variety');
    }
    if (town.hiking_trails_km >= 100) {
      activities.add('serious_hiking');
      activities.add('backpacking');
      activities.add('trail_running');
      activities.add('mountain_biking');
    }
    if (town.hiking_trails_km >= 200) {
      activities.add('multi_day_trekking');
      activities.add('wilderness_exploration');
    }
  }
  
  // ========== WINTER SPORTS (VERIFIED SKI RESORTS) ==========
  if (town.ski_resorts_within_100km > 0) {
    activities.add('skiing');
    activities.add('snowboarding');
    activities.add('apres_ski');
    
    if (town.ski_resorts_within_100km >= 3) {
      activities.add('ski_variety');
      activities.add('ski_touring');
    }
    if (town.ski_resorts_within_100km >= 5) {
      activities.add('ski_destination');
      activities.add('winter_sports_hub');
    }
    
    // Add related winter activities if cold enough
    if (town.avg_temp_winter <= 5) {
      activities.add('ice_skating');
      activities.add('snowshoeing');
      activities.add('cross_country_skiing');
      if (town.avg_temp_winter <= 0) {
        activities.add('ice_fishing');
        activities.add('winter_festivals');
      }
    }
  }
  
  // ========== SWIMMING FACILITIES ==========
  if (town.swimming_facilities) {
    activities.add('swimming_pools');
    activities.add('lap_swimming');
    activities.add('water_aerobics');
    
    // Parse swimming facilities if string
    if (typeof town.swimming_facilities === 'string') {
      const facilities = town.swimming_facilities.toLowerCase();
      if (facilities.includes('olympic')) {
        activities.add('competitive_swimming');
      }
      if (facilities.includes('thermal') || facilities.includes('hot')) {
        activities.add('thermal_baths');
        activities.add('spa_treatments');
      }
      if (facilities.includes('indoor')) {
        activities.add('year_round_swimming');
      }
    }
  }
  
  // ========== CULTURAL ACTIVITIES (BASED ON RATINGS) ==========
  if (town.cultural_rating >= 7) {
    activities.add('cultural_events');
    activities.add('art_galleries');
    activities.add('live_music');
    
    if (town.cultural_rating >= 8) {
      activities.add('museums');
      activities.add('theater');
      activities.add('concerts');
    }
    if (town.cultural_rating === 9) {
      activities.add('world_class_culture');
      activities.add('international_events');
      activities.add('art_festivals');
    }
  }
  
  // Cultural landmarks indicate specific activities
  if (town.cultural_landmark_1 || town.cultural_landmark_2 || town.cultural_landmark_3) {
    activities.add('landmark_visits');
    activities.add('historical_tours');
    activities.add('architectural_photography');
  }
  
  // ========== NIGHTLIFE & DINING ==========
  if (town.nightlife_rating >= 7) {
    activities.add('nightlife');
    activities.add('bars');
    activities.add('live_entertainment');
    
    if (town.nightlife_rating >= 8) {
      activities.add('clubs');
      activities.add('late_night_dining');
    }
    if (town.nightlife_rating === 9) {
      activities.add('world_class_nightlife');
      activities.add('rooftop_bars');
      activities.add('cocktail_scene');
    }
  }
  
  if (town.dining_nightlife_level >= 7) {
    activities.add('fine_dining');
    activities.add('food_scene');
    activities.add('wine_bars');
  }
  
  if (town.restaurants_rating >= 8) {
    activities.add('culinary_destination');
    activities.add('food_tours');
    activities.add('cooking_classes');
  }
  
  // ========== OUTDOOR ACTIVITIES (BASED ON RATING) ==========
  if (town.outdoor_rating >= 7 || town.outdoor_activities_rating >= 7) {
    activities.add('outdoor_lifestyle');
    activities.add('picnics');
    activities.add('outdoor_sports');
    
    if (town.outdoor_rating >= 8) {
      activities.add('adventure_activities');
      activities.add('nature_excursions');
    }
  }
  
  // ========== URBAN AMENITIES ==========
  if (town.public_transport_quality >= 8) {
    activities.add('easy_exploration');
    activities.add('car_free_living');
    activities.add('day_trips');
  }
  
  if (town.walkability >= 8) {
    activities.add('walking_lifestyle');
    activities.add('pedestrian_friendly');
    activities.add('cafe_hopping');
  }
  
  if (town.coworking_spaces_count > 0) {
    activities.add('coworking');
    activities.add('digital_nomad_friendly');
    activities.add('networking');
    if (town.coworking_spaces_count >= 3) {
      activities.add('startup_scene');
      activities.add('tech_meetups');
    }
  }
  
  if (town.dog_parks_count > 0) {
    activities.add('dog_walking');
    activities.add('pet_friendly');
    if (town.dog_parks_count >= 3) {
      activities.add('dog_community');
      activities.add('pet_events');
    }
  }
  
  // ========== CLIMATE-BASED ACTIVITIES ==========
  if (town.avg_temp_summer >= 25 && town.avg_temp_winter >= 15) {
    activities.add('year_round_outdoor');
    activities.add('outdoor_dining');
    activities.add('street_life');
  }
  
  if (town.sunshine_hours >= 2500 || town.sunshine_level_actual === 'mostly_sunny') {
    activities.add('sun_activities');
    activities.add('vitamin_d_lifestyle');
    activities.add('solar_photography');
  }
  
  // ========== EXPAT & RETIREMENT SPECIFIC ==========
  if (town.expat_population === 'Large' || town.expat_community_size === 'large') {
    activities.add('expat_meetups');
    activities.add('international_community');
    activities.add('language_exchange');
    activities.add('cultural_clubs');
  }
  
  if (town.retirement_community_presence === 'strong') {
    activities.add('retirement_clubs');
    activities.add('senior_activities');
    activities.add('health_programs');
    activities.add('social_groups');
  }
  
  // ========== WELLNESS & HEALTHCARE ==========
  if (town.wellness_rating >= 7) {
    activities.add('spa');
    activities.add('wellness_retreats');
    activities.add('yoga_studios');
    activities.add('meditation_centers');
  }
  
  if (town.healthcare_specialties_available?.includes('rehabilitation')) {
    activities.add('physical_therapy');
    activities.add('health_recovery');
  }
  
  // ========== SHOPPING ==========
  if (town.shopping_rating >= 7) {
    activities.add('shopping');
    activities.add('boutiques');
    if (town.shopping_rating >= 8) {
      activities.add('shopping_destination');
      activities.add('markets');
      activities.add('antique_shops');
    }
  }
  
  if (town.farmers_markets) {
    activities.add('farmers_markets');
    activities.add('local_produce');
    activities.add('artisan_goods');
  }
  
  // ========== COUNTRY-SPECIFIC CULTURAL ACTIVITIES ==========
  const countryActivities = {
    'Spain': ['tapas_culture', 'flamenco', 'siesta_lifestyle', 'plaza_life'],
    'Portugal': ['fado_music', 'port_wine', 'azulejos', 'cafe_culture'],
    'France': ['wine_culture', 'cheese_tasting', 'patisseries', 'markets'],
    'Italy': ['aperitivo', 'pasta_making', 'gelato', 'piazza_life'],
    'Greece': ['tavernas', 'ancient_sites', 'island_hopping', 'philosophy'],
    'Thailand': ['temple_visits', 'street_food', 'muay_thai', 'massage'],
    'Mexico': ['cantinas', 'mariachi', 'mercados', 'day_of_dead'],
    'Japan': ['onsen', 'tea_ceremony', 'cherry_blossoms', 'temples'],
    'Germany': ['beer_gardens', 'christmas_markets', 'hiking_culture'],
    'Netherlands': ['cycling_culture', 'canal_life', 'coffee_shops'],
    'Turkey': ['hammam', 'bazaars', 'tea_culture', 'mezze'],
    'Morocco': ['souks', 'riads', 'mint_tea', 'hammam'],
    'India': ['yoga_ashrams', 'ayurveda', 'festivals', 'temples'],
    'Australia': ['bbq_culture', 'beach_culture', 'sports_culture'],
    'Argentina': ['tango', 'asado', 'wine_culture', 'football'],
    'Brazil': ['samba', 'capoeira', 'beach_culture', 'carnival'],
    'Indonesia': ['temples', 'traditional_dance', 'batik', 'rice_terraces'],
    'Vietnam': ['pho_culture', 'motorbike_life', 'markets', 'tai_chi'],
    'Croatia': ['island_hopping', 'seafood', 'wine_regions', 'sailing'],
    'Egypt': ['pyramids', 'nile_cruises', 'bazaars', 'diving'],
    'Peru': ['inca_sites', 'pisco', 'markets', 'andean_culture'],
    'Colombia': ['coffee_culture', 'salsa', 'street_art', 'festivals'],
    'USA': ['sports_culture', 'bbq', 'national_parks', 'diners']
  };
  
  if (countryActivities[town.country]) {
    countryActivities[town.country].forEach(a => activities.add(a));
  }
  
  // ========== PACE OF LIFE ACTIVITIES ==========
  if (town.pace_of_life_actual === 'slow' || town.pace_of_life_actual === 'relaxed') {
    activities.add('slow_living');
    activities.add('relaxation');
    activities.add('stress_free_lifestyle');
  } else if (town.pace_of_life_actual === 'fast' || town.pace_of_life_actual === 'energetic') {
    activities.add('dynamic_lifestyle');
    activities.add('busy_city_life');
    activities.add('always_something_happening');
  }
  
  return Array.from(activities).sort();
}

async function applyUltimateRealisticActivities() {
  console.log('🎯 APPLYING ULTIMATE REALISTIC ACTIVITY MAPPING\n');
  console.log('===============================================\n');
  
  // Get all towns with complete data
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Processing ${towns.length} towns with comprehensive data...\n`);
  
  let updateCount = 0;
  const activityStats = {};
  
  for (const town of towns) {
    // Get realistic activities based on ALL available data
    const activities = getUltimateRealisticActivities(town);
    
    // Track statistics
    activities.forEach(activity => {
      activityStats[activity] = (activityStats[activity] || 0) + 1;
    });
    
    // Update the town
    const { error: updateError } = await supabase
      .from('towns')
      .update({ activities_available: activities })
      .eq('id', town.id);
      
    if (updateError) {
      console.error(`Failed to update ${town.name}: ${updateError.message}`);
    } else {
      updateCount++;
      if (updateCount % 50 === 0) {
        console.log(`  Updated ${updateCount} towns...`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('ULTIMATE REALISTIC ACTIVITIES UPDATE COMPLETE');
  console.log('='.repeat(70));
  console.log(`✅ Updated: ${updateCount} towns\n`);
  
  // Show most common location-specific activities
  console.log('📊 TOP LOCATION-SPECIFIC ACTIVITIES (not universal):\n');
  
  const locationSpecific = Object.entries(activityStats)
    .filter(([activity]) => !['walking', 'reading', 'cooking', 'photography'].includes(activity))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);
  
  locationSpecific.forEach(([activity, count]) => {
    const percentage = ((count / 341) * 100).toFixed(1);
    console.log(`  ${activity}: ${count} towns (${percentage}%)`);
  });
  
  // Show examples with different characteristics
  console.log('\n🏆 SAMPLE TOWNS WITH REALISTIC ACTIVITIES:\n');
  
  const samples = [
    { name: 'Miami', desc: 'Beach city with golf' },
    { name: 'Zurich', desc: 'Mountain city with lakes' },
    { name: 'Bangkok', desc: 'Tropical megacity' },
    { name: 'Edinburgh', desc: 'Historic with culture' },
    { name: 'Cusco', desc: 'Mountain heritage site' }
  ];
  
  for (const { name, desc } of samples) {
    const { data: town } = await supabase
      .from('towns')
      .select('name, country, activities_available, golf_courses_count, beaches_nearby, ski_resorts_within_100km, cultural_rating, hiking_trails_km')
      .eq('name', name)
      .single();
    
    if (town) {
      console.log(`\n${town.name}, ${town.country} (${desc}):`);
      console.log(`  Infrastructure: Golf:${town.golf_courses_count}, Beach:${town.beaches_nearby}, Ski:${town.ski_resorts_within_100km}, Culture:${town.cultural_rating}, Trails:${town.hiking_trails_km}km`);
      
      // Show key non-universal activities
      const keyActivities = town.activities_available.filter(a => 
        ['golf', 'tennis', 'skiing', 'surfing', 'sailing', 'hiking', 'scuba_diving', 
         'museums', 'theater', 'beaches', 'thermal_baths'].some(key => a.includes(key))
      );
      
      console.log(`  Key activities: ${keyActivities.slice(0, 10).join(', ')}`);
      console.log(`  Total activities: ${town.activities_available.length}`);
    }
  }
}

// Run the ultimate mapping
applyUltimateRealisticActivities().catch(console.error);