import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map infrastructure to ACTUAL activities
function getRealisticActivities(town) {
  const activities = new Set();
  
  // ========== UNIVERSAL ACTIVITIES (available everywhere) ==========
  const universal = [
    'walking', 'reading', 'cooking', 'photography', 'writing', 
    'meditation', 'yoga', 'stretching', 'home_workouts',
    'board_games', 'card_games', 'chess', 'crossword_puzzles',
    'knitting', 'sewing', 'crafts', 'painting', 'drawing',
    'blogging', 'journaling', 'language_learning', 'online_courses',
    'video_gaming', 'streaming', 'podcasts', 'music',
    'gardening', 'bird_watching', 'star_gazing',
    'socializing', 'book_clubs', 'volunteering', 'meetups'
  ];
  universal.forEach(a => activities.add(a));
  
  // ========== GOLF & TENNIS ==========
  if (town.golf_courses_count > 0) {
    activities.add('golf');
    activities.add('golf_lessons');
    activities.add('golf_tournaments');
    if (town.golf_courses_count > 2) {
      activities.add('golf_variety'); // Multiple courses to choose from
    }
  }
  
  if (town.tennis_courts_count > 0) {
    activities.add('tennis');
    activities.add('tennis_lessons');
    if (town.tennis_courts_count > 5) {
      activities.add('tennis_clubs');
      activities.add('pickleball'); // Often shares courts with tennis
    }
  }
  
  // ========== WATER ACTIVITIES ==========
  if (town.beaches_nearby) {
    activities.add('beach_walking');
    activities.add('beachcombing');
    activities.add('sunbathing');
    activities.add('beach_volleyball');
    activities.add('swimming_ocean');
    activities.add('snorkeling');
    
    // Surfing only in specific ocean locations
    if (town.water_bodies?.some(w => w.includes('Pacific') || w.includes('Atlantic'))) {
      if (['Australia', 'USA', 'Portugal', 'Spain', 'France', 'Brazil', 
           'Mexico', 'Costa Rica', 'Indonesia', 'South Africa'].includes(town.country)) {
        activities.add('surfing');
        activities.add('bodyboarding');
      }
    }
    
    // Tropical water activities
    if (town.climate === 'Tropical' || town.climate === 'Subtropical') {
      activities.add('scuba_diving');
      activities.add('paddleboarding');
      activities.add('jet_skiing');
      activities.add('parasailing');
    }
  }
  
  if (town.marinas_count > 0) {
    activities.add('sailing');
    activities.add('boating');
    activities.add('yacht_clubs');
    activities.add('fishing_charters');
    if (town.marinas_count > 2) {
      activities.add('yacht_racing');
      activities.add('sailing_lessons');
    }
  }
  
  if (town.swimming_facilities) {
    activities.add('swimming_pools');
    activities.add('water_aerobics');
    activities.add('lap_swimming');
    
    // Parse swimming facilities if it's a string
    if (typeof town.swimming_facilities === 'string') {
      if (town.swimming_facilities.includes('lake')) {
        activities.add('lake_swimming');
        activities.add('freshwater_fishing');
      }
      if (town.swimming_facilities.includes('river')) {
        activities.add('river_swimming');
        activities.add('river_fishing');
      }
      if (town.swimming_facilities.includes('thermal') || town.swimming_facilities.includes('hot_spring')) {
        activities.add('thermal_baths');
        activities.add('hot_springs');
      }
    }
  }
  
  // ========== WINTER SPORTS ==========
  if (town.ski_resorts_within_100km > 0) {
    activities.add('skiing');
    activities.add('snowboarding');
    activities.add('apres_ski');
    
    if (town.ski_resorts_within_100km > 3) {
      activities.add('ski_variety'); // Multiple resorts to choose
      activities.add('ski_touring');
    }
    
    // Add other winter activities if there's snow
    if (town.seasonal_variation_actual === 'high' || town.seasonal_variation_actual === 'extreme') {
      activities.add('snowshoeing');
      activities.add('cross_country_skiing');
      activities.add('ice_skating');
      activities.add('sledding');
    }
  }
  
  // ========== HIKING & NATURE ==========
  if (town.hiking_trails_km > 0) {
    activities.add('hiking');
    activities.add('nature_walks');
    activities.add('trail_running');
    activities.add('wildlife_viewing');
    
    if (town.hiking_trails_km > 50) {
      activities.add('serious_hiking');
      activities.add('backpacking');
      activities.add('mountain_biking');
    }
    
    if (town.hiking_trails_km > 200) {
      activities.add('multi_day_hiking');
      activities.add('trail_variety');
    }
  }
  
  // ========== LOCATION-SPECIFIC BASED ON GEOGRAPHY ==========
  if (town.geographic_features) {
    if (town.geographic_features.includes('mountain')) {
      activities.add('mountain_views');
      activities.add('rock_climbing');
      activities.add('mountain_photography');
      
      if (!town.ski_resorts_within_100km && town.hiking_trails_km > 0) {
        activities.add('mountain_hiking');
      }
    }
    
    if (town.geographic_features.includes('desert')) {
      activities.add('desert_tours');
      activities.add('stargazing_excellent'); // Clear skies
      activities.add('rock_hounding');
      activities.add('desert_photography');
    }
    
    if (town.geographic_features.includes('island')) {
      activities.add('island_hopping');
      activities.add('boat_trips');
      activities.add('coastal_exploration');
    }
    
    if (town.geographic_features.includes('historic')) {
      activities.add('historical_tours');
      activities.add('architecture_tours');
      activities.add('museums');
      activities.add('cultural_sites');
    }
  }
  
  // ========== URBAN ACTIVITIES (if infrastructure exists) ==========
  if (town.coworking_spaces_count > 0) {
    activities.add('coworking');
    activities.add('digital_nomad_community');
    activities.add('networking_events');
  }
  
  if (town.international_schools_count > 0) {
    activities.add('family_activities');
    activities.add('school_sports');
    activities.add('international_community');
  }
  
  if (town.dog_parks_count > 0) {
    activities.add('dog_walking');
    activities.add('dog_training');
    activities.add('pet_meetups');
  }
  
  // ========== CULTURAL ACTIVITIES BY COUNTRY ==========
  const countrySpecific = {
    'Spain': ['flamenco', 'tapas_tours', 'siesta_culture'],
    'Portugal': ['fado_music', 'port_wine_tours', 'azulejo_tours'],
    'France': ['wine_tasting', 'cheese_tasting', 'cafe_culture'],
    'Italy': ['cooking_classes', 'wine_tours', 'opera'],
    'Thailand': ['muay_thai', 'temple_visits', 'thai_massage'],
    'Japan': ['onsen', 'tea_ceremony', 'martial_arts'],
    'Mexico': ['tequila_tours', 'mariachi', 'cenotes'],
    'Greece': ['ancient_sites', 'island_ferries', 'tavernas'],
    'USA': ['baseball', 'american_football', 'bbq_culture'],
    'Australia': ['cricket', 'aussie_rules', 'bbq_culture'],
    'Argentina': ['tango', 'asado', 'polo'],
    'India': ['yoga_ashrams', 'ayurveda', 'cricket'],
    'Morocco': ['souks', 'hammam', 'desert_camps'],
    'Turkey': ['bazaars', 'turkish_baths', 'hot_air_ballooning'],
    'Egypt': ['pyramids', 'nile_cruises', 'diving_red_sea'],
    'Croatia': ['island_hopping', 'game_of_thrones_tours', 'sailing'],
    'Indonesia': ['temple_visits', 'rice_terraces', 'batik_making']
  };
  
  if (countrySpecific[town.country]) {
    countrySpecific[town.country].forEach(a => activities.add(a));
  }
  
  return Array.from(activities).sort();
}

async function applyRealisticActivities() {
  console.log('🎯 APPLYING REALISTIC ACTIVITIES BASED ON INFRASTRUCTURE\n');
  console.log('========================================================\n');
  
  // Get all towns with infrastructure data
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
  const stats = {
    withGolf: 0,
    withTennis: 0,
    withBeaches: 0,
    withSkiing: 0,
    withHiking: 0,
    withMarinas: 0
  };
  
  for (const town of towns) {
    // Get realistic activities based on actual infrastructure
    const realisticActivities = getRealisticActivities(town);
    
    // Track statistics
    if (realisticActivities.includes('golf')) stats.withGolf++;
    if (realisticActivities.includes('tennis')) stats.withTennis++;
    if (realisticActivities.includes('beach_walking')) stats.withBeaches++;
    if (realisticActivities.includes('skiing')) stats.withSkiing++;
    if (realisticActivities.includes('hiking')) stats.withHiking++;
    if (realisticActivities.includes('sailing')) stats.withMarinas++;
    
    // Update the town with realistic activities
    const { error: updateError } = await supabase
      .from('towns')
      .update({ activities_available: realisticActivities })
      .eq('id', town.id);
      
    if (updateError) {
      console.error(`Failed to update ${town.town_name}: ${updateError.message}`);
    } else {
      updateCount++;
      if (updateCount % 50 === 0) {
        console.log(`  Updated ${updateCount} towns...`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('REALISTIC ACTIVITIES UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns\n`);
  
  console.log('📊 ACTIVITY DISTRIBUTION (BASED ON REAL INFRASTRUCTURE):\n');
  console.log(`Towns with golf: ${stats.withGolf}/341 (actual golf courses)`);
  console.log(`Towns with tennis: ${stats.withTennis}/341 (actual courts)`);
  console.log(`Towns with beach activities: ${stats.withBeaches}/341 (actual beaches)`);
  console.log(`Towns with skiing: ${stats.withSkiing}/341 (actual ski resorts)`);
  console.log(`Towns with hiking: ${stats.withHiking}/341 (actual trails)`);
  console.log(`Towns with sailing: ${stats.withMarinas}/341 (actual marinas)`);
  
  // Show examples
  console.log('\n🏆 SAMPLE REALISTIC ACTIVITIES:\n');
  
  const samples = ['Dubai', 'Zurich', 'Miami', 'Bangkok', 'Wanaka'];
  
  for (const name of samples) {
    const { data: town } = await supabase
      .from('towns')
      .select('town_name, country, activities_available, golf_courses_count, beaches_nearby, ski_resorts_within_100km')
      .eq('name', name)
      .single();
    
    if (town) {
      console.log(`\n${town.town_name}, ${town.country}:`);
      console.log(`  Infrastructure: ${town.golf_courses_count || 0} golf, ${town.beaches_nearby ? 'beach' : 'no beach'}, ${town.ski_resorts_within_100km || 0} ski resorts`);
      
      const specificActivities = town.activities_available.filter(a => 
        ['golf', 'tennis', 'skiing', 'surfing', 'sailing', 'hiking'].includes(a)
      );
      console.log(`  Key activities: ${specificActivities.join(', ') || 'none of the key sports'}`);
      console.log(`  Total activities: ${town.activities_available.length}`);
    }
  }
}

// Run the realistic mapping
applyRealisticActivities().catch(console.error);