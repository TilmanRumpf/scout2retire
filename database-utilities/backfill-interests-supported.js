import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// UNIVERSAL INTERESTS - Everyone can pursue these anywhere
const UNIVERSAL_INTERESTS = [
  // Lifestyle interests
  'healthy_living',
  'fitness',
  'wellness',
  'mindfulness',
  'slow_living',
  'minimalism',
  'sustainable_living',
  'digital_nomad',
  'remote_work',
  'entrepreneurship',
  
  // Social interests
  'social',
  'community',
  'expat_community',
  'family_friendly',
  'singles_scene',
  'lgbtq_friendly',
  'networking',
  'volunteering',
  
  // Cultural interests
  'cultural',
  'arts',
  'music',
  'theater',
  'dance',
  'literature',
  'film',
  'photography',
  'culinary',
  'wine_culture',
  'coffee_culture',
  'craft_beer',
  
  // Educational interests
  'learning',
  'languages',
  'history',
  'science',
  'technology',
  'philosophy',
  'spirituality',
  'personal_growth',
  
  // Creative interests
  'creative',
  'writing',
  'painting',
  'crafts',
  'design',
  'fashion',
  'cooking',
  'gardening',
  
  // Entertainment interests
  'entertainment',
  'nightlife',
  'dining',
  'shopping',
  'gaming',
  'sports_watching',
  'festivals',
  'events'
];

// Location-specific interests based on features
function getLocationSpecificInterests(town) {
  const interests = [];
  
  // WATER-BASED INTERESTS
  if (town.water_bodies && town.water_bodies.length > 0) {
    const waterStr = town.water_bodies.join(' ').toLowerCase();
    
    if (waterStr.includes('ocean') || waterStr.includes('sea')) {
      interests.push(
        'beach_lifestyle',
        'coastal_living',
        'ocean_sports',
        'marine_life',
        'sailing',
        'surfing',
        'diving',
        'fishing',
        'island_hopping',
        'seaside_dining',
        'maritime_culture'
      );
    }
    
    if (waterStr.includes('lake')) {
      interests.push(
        'lakeside_living',
        'lake_sports',
        'freshwater_fishing',
        'quiet_waters'
      );
    }
    
    if (waterStr.includes('river')) {
      interests.push(
        'riverside_living',
        'river_sports',
        'waterfront_dining'
      );
    }
  }
  
  // GEOGRAPHIC INTERESTS
  if (town.geographic_features) {
    const features = town.geographic_features.join(' ').toLowerCase();
    
    if (features.includes('mountain')) {
      interests.push(
        'mountain_living',
        'hiking',
        'climbing',
        'skiing',
        'alpine_sports',
        'nature',
        'outdoor_adventure',
        'scenic_beauty'
      );
    }
    
    if (features.includes('desert')) {
      interests.push(
        'desert_living',
        'stargazing',
        'geology',
        'extreme_sports',
        'solitude'
      );
    }
    
    if (features.includes('island')) {
      interests.push(
        'island_lifestyle',
        'tropical_living',
        'boat_life',
        'beach_culture'
      );
    }
    
    if (features.includes('historic') || features.includes('medieval')) {
      interests.push(
        'history',
        'architecture',
        'heritage',
        'archaeology',
        'traditional_culture'
      );
    }
    
    if (features.includes('rural') || features.includes('countryside')) {
      interests.push(
        'rural_living',
        'farming',
        'quiet_lifestyle',
        'nature',
        'self_sufficiency'
      );
    }
  }
  
  // CLIMATE-BASED INTERESTS
  if (town.climate) {
    const climate = town.climate.toLowerCase();
    
    if (climate.includes('tropical')) {
      interests.push(
        'tropical_lifestyle',
        'year_round_outdoor',
        'beach_culture',
        'water_sports'
      );
    }
    
    if (climate.includes('mediterranean')) {
      interests.push(
        'mediterranean_lifestyle',
        'outdoor_dining',
        'wine_culture',
        'perfect_weather'
      );
    }
    
    if (climate.includes('temperate')) {
      interests.push(
        'four_seasons',
        'seasonal_activities',
        'moderate_climate'
      );
    }
    
    if (climate.includes('desert')) {
      interests.push(
        'dry_climate',
        'sun_seeking',
        'pool_culture'
      );
    }
  }
  
  // COUNTRY/CULTURE SPECIFIC
  const countryInterests = {
    'Thailand': ['buddhism', 'temple_culture', 'street_food', 'tropical_lifestyle', 'expat_friendly'],
    'Spain': ['siesta_culture', 'tapas_culture', 'flamenco', 'beach_culture', 'relaxed_lifestyle'],
    'Italy': ['dolce_vita', 'food_culture', 'art_history', 'wine_culture', 'family_culture'],
    'France': ['gastronomy', 'wine_culture', 'art', 'fashion', 'cafe_culture'],
    'Portugal': ['surf_culture', 'fado_culture', 'seafood', 'affordable_europe', 'golden_visa'],
    'Mexico': ['mexican_culture', 'beach_lifestyle', 'affordable_living', 'expat_community', 'colonial_heritage'],
    'Greece': ['island_life', 'ancient_history', 'mediterranean_diet', 'relaxed_pace', 'philosophy'],
    'Japan': ['zen_culture', 'technology', 'tradition', 'safety', 'efficiency'],
    'Germany': ['efficiency', 'beer_culture', 'engineering', 'green_living', 'order'],
    'Netherlands': ['cycling_culture', 'liberal_values', 'canal_life', 'international', 'design'],
    'Australia': ['outdoor_lifestyle', 'surf_culture', 'sports', 'bbq_culture', 'laid_back'],
    'Canada': ['multicultural', 'outdoor_sports', 'safety', 'healthcare', 'winter_sports'],
    'United States': ['diversity', 'opportunity', 'car_culture', 'sports', 'entertainment'],
    'United Kingdom': ['pub_culture', 'history', 'countryside', 'tea_culture', 'royalty'],
    'Switzerland': ['alpine_living', 'precision', 'luxury', 'skiing', 'hiking'],
    'Singapore': ['multicultural', 'food_culture', 'efficiency', 'tropical_urban', 'business'],
    'Dubai': ['luxury_lifestyle', 'tax_free', 'cosmopolitan', 'desert_modern', 'shopping'],
    'New Zealand': ['adventure_sports', 'nature', 'laid_back', 'outdoor_lifestyle', 'wine'],
    'Croatia': ['adriatic_lifestyle', 'sailing', 'history', 'affordable_mediterranean', 'game_of_thrones'],
    'Turkey': ['east_meets_west', 'history', 'cuisine', 'affordable', 'bazaar_culture'],
    'Morocco': ['exotic_culture', 'souks', 'desert', 'surf', 'french_influence'],
    'Vietnam': ['street_food', 'motorbike_culture', 'affordable', 'beaches', 'history'],
    'Indonesia': ['island_paradise', 'surf', 'yoga', 'spiritual', 'tropical'],
    'India': ['spirituality', 'yoga', 'diverse_culture', 'affordable', 'ayurveda'],
    'South Africa': ['wildlife', 'wine', 'outdoor', 'diverse', 'affordable'],
    'Argentina': ['tango', 'wine', 'beef_culture', 'european_influence', 'passionate'],
    'Brazil': ['beach_culture', 'carnival', 'music', 'tropical', 'portuguese'],
    'Colombia': ['coffee_culture', 'salsa', 'affordable', 'tropical', 'expat_growing'],
    'Peru': ['inca_heritage', 'andes', 'cuisine', 'adventure', 'spiritual'],
    'Ecuador': ['affordable', 'equator', 'mountains', 'beaches', 'retirement_friendly'],
    'Costa Rica': ['pura_vida', 'eco_friendly', 'beaches', 'rainforest', 'stable'],
    'Panama': ['canal', 'beaches', 'tax_friendly', 'dollar_economy', 'retirement'],
    'Uruguay': ['stable', 'beaches', 'wine', 'relaxed', 'european_feel'],
    'Chile': ['wine', 'andes', 'stable', 'diverse_climate', 'outdoor'],
    'Malaysia': ['multicultural', 'food_paradise', 'affordable', 'tropical', 'mm2h_visa'],
    'Philippines': ['islands', 'beaches', 'affordable', 'english_speaking', 'tropical']
  };
  
  if (countryInterests[town.country]) {
    interests.push(...countryInterests[town.country]);
  }
  
  // ECONOMIC INTERESTS
  if (['Portugal', 'Spain', 'Greece', 'Mexico', 'Thailand', 'Vietnam', 'Malaysia', 
       'Colombia', 'Ecuador', 'Peru', 'Turkey', 'Morocco'].includes(town.country)) {
    interests.push('affordable_living', 'value_for_money');
  }
  
  if (['Switzerland', 'Monaco', 'Singapore', 'Dubai', 'Luxembourg', 'Norway'].includes(town.country)) {
    interests.push('luxury_living', 'high_end');
  }
  
  // RETIREMENT INTERESTS
  if (['Portugal', 'Spain', 'Mexico', 'Panama', 'Costa Rica', 'Ecuador', 
       'Malaysia', 'Thailand', 'Greece', 'Malta'].includes(town.country)) {
    interests.push('retirement_friendly', 'senior_community', 'healthcare_quality');
  }
  
  // DIGITAL NOMAD INTERESTS
  if (['Portugal', 'Spain', 'Mexico', 'Thailand', 'Indonesia', 'Vietnam', 
       'Colombia', 'Dubai', 'Estonia', 'Croatia'].includes(town.country)) {
    interests.push('digital_nomad_friendly', 'coworking', 'fast_internet');
  }
  
  return [...new Set(interests)]; // Remove duplicates
}

async function backfillInterestsSupported() {
  console.log('🎯 BACKFILLING INTERESTS_SUPPORTED FOR ALL TOWNS\n');
  console.log('================================================\n');
  
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
    // Start with universal interests
    let allInterests = [...UNIVERSAL_INTERESTS];
    
    // Add location-specific interests
    const locationSpecific = getLocationSpecificInterests(town);
    allInterests = [...allInterests, ...locationSpecific];
    
    // Remove duplicates and sort
    allInterests = [...new Set(allInterests)].sort();
    
    // Update the town
    const { error: updateError } = await supabase
      .from('towns')
      .update({ interests_supported: allInterests })
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
  console.log('INTERESTS UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Show samples
  console.log('\n📋 SAMPLE RESULTS:\n');
  
  const samples = ['Lisbon', 'Bangkok', 'Dubai', 'Sydney', 'Miami', 'Cusco', 'Santorini'];
  
  for (const name of samples) {
    const { data: town } = await supabase
      .from('towns')
      .select('name, country, interests_supported')
      .eq('name', name)
      .single();
    
    if (town) {
      const universal = town.interests_supported.filter(i => UNIVERSAL_INTERESTS.includes(i));
      const specific = town.interests_supported.filter(i => !UNIVERSAL_INTERESTS.includes(i));
      
      console.log(`${town.name}, ${town.country}:`);
      console.log(`  Total interests: ${town.interests_supported.length}`);
      console.log(`  Universal: ${universal.length}`);
      console.log(`  Location-specific: ${specific.length}`);
      console.log(`  Unique interests: [${specific.slice(0, 8).join(', ')}...]\n`);
    }
  }
}

// Run backfill
backfillInterestsSupported().catch(console.error);