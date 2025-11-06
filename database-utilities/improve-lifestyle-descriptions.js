import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Lifestyle pace based on various factors
function getLifestylePace(town) {
  const pop = town.population || 50000;
  const nightlife = town.nightlife_rating || 3;
  
  if (pop < 30000) {
    return ['relaxed', 'slow-paced', 'tranquil', 'peaceful', 'laid-back'][Math.floor(Math.random() * 5)];
  } else if (pop < 100000) {
    return ['easy-going', 'comfortable', 'unhurried', 'balanced', 'moderate'][Math.floor(Math.random() * 5)];
  } else if (pop < 500000) {
    return ['lively', 'engaging', 'dynamic', 'active', 'vibrant'][Math.floor(Math.random() * 5)];
  } else {
    return ['energetic', 'bustling', 'cosmopolitan', 'dynamic', 'vibrant'][Math.floor(Math.random() * 5)];
  }
}

// Dining scene description
function getDiningScene(rating) {
  if (rating >= 8) {
    return ['exceptional dining scene', 'outstanding restaurant variety', 'foodie paradise', 'remarkable culinary options', 'thriving food culture'][Math.floor(Math.random() * 5)];
  } else if (rating >= 6) {
    return ['good restaurant selection', 'solid dining options', 'decent variety of eateries', 'satisfying food scene', 'nice mix of restaurants'][Math.floor(Math.random() * 5)];
  } else if (rating >= 4) {
    return ['adequate dining choices', 'basic restaurant options', 'modest food scene', 'simple dining available', 'standard eateries'][Math.floor(Math.random() * 5)];
  } else {
    return ['limited dining variety', 'basic food options', 'simple restaurant scene', 'modest eateries', 'few dining choices'][Math.floor(Math.random() * 5)];
  }
}

// Cultural life description
function getCulturalLife(museums, cultural_rating, landmarks) {
  const hasLandmarks = landmarks && landmarks.cultural_landmark_1;
  const avgCultural = ((museums || 3) + (cultural_rating || 3)) / 2;
  
  if (avgCultural >= 7) {
    if (hasLandmarks) {
      return `rich cultural heritage including ${landmarks.cultural_landmark_1}`;
    }
    return 'rich cultural life with museums and galleries';
  } else if (avgCultural >= 5) {
    if (hasLandmarks) {
      return `cultural attractions like ${landmarks.cultural_landmark_1}`;
    }
    return 'reasonable cultural offerings';
  } else if (avgCultural >= 3) {
    return 'modest cultural scene';
  } else {
    return 'limited formal culture';
  }
}

// Outdoor activities description
function getOutdoorLife(rating, geographic) {
  const features = geographic?.join(' ').toLowerCase() || '';
  
  if (rating >= 8) {
    if (features.includes('beach')) {
      return 'superb beaches and water sports';
    } else if (features.includes('mountain')) {
      return 'excellent hiking and mountain activities';
    } else {
      return 'outstanding outdoor recreation';
    }
  } else if (rating >= 6) {
    if (features.includes('coastal')) {
      return 'nice coastal walks and water activities';
    } else if (features.includes('mountain')) {
      return 'good hiking and nature access';
    } else {
      return 'solid outdoor options';
    }
  } else if (rating >= 4) {
    return 'decent outdoor activities';
  } else {
    return 'basic outdoor options';
  }
}

// Social life description
function getSocialLife(nightlife, restaurants, shopping, population) {
  const social = (nightlife + restaurants + shopping) / 3;
  
  if (social >= 7) {
    return ['vibrant social scene', 'lively community life', 'active social opportunities', 'buzzing social atmosphere'][Math.floor(Math.random() * 4)];
  } else if (social >= 5) {
    return ['good social options', 'decent community feel', 'moderate social scene', 'reasonable social life'][Math.floor(Math.random() * 4)];
  } else if (social >= 3) {
    return ['quiet social scene', 'low-key community', 'modest social options', 'simple social life'][Math.floor(Math.random() * 4)];
  } else {
    return ['very quiet socially', 'limited social scene', 'peaceful community', 'minimal nightlife'][Math.floor(Math.random() * 4)];
  }
}

// Shopping description
function getShoppingScene(rating) {
  if (rating >= 7) {
    return ['excellent shopping', 'great retail variety', 'abundant shopping'][Math.floor(Math.random() * 3)];
  } else if (rating >= 5) {
    return ['decent shopping', 'adequate retail', 'reasonable shops'][Math.floor(Math.random() * 3)];
  } else if (rating >= 3) {
    return ['basic shopping', 'essential stores', 'modest retail'][Math.floor(Math.random() * 3)];
  } else {
    return ['limited shopping', 'basic stores only', 'minimal retail'][Math.floor(Math.random() * 3)];
  }
}

// Generate complete lifestyle description
function generateLifestyleDescription(town) {
  const pace = getLifestylePace(town);
  const dining = getDiningScene(town.restaurants_rating || 3);
  const cultural = getCulturalLife(town.museums_rating, town.cultural_rating, town);
  const outdoor = getOutdoorLife(town.outdoor_activities_rating || 3, town.geographic_features);
  const social = getSocialLife(
    town.nightlife_rating || 3,
    town.restaurants_rating || 3,
    town.shopping_rating || 3,
    town.population
  );
  const shopping = getShoppingScene(town.shopping_rating || 3);
  
  // Special features
  const isCoastal = town.geographic_features?.some(f => f.toLowerCase().includes('coastal') || f.toLowerCase().includes('beach'));
  const isMountain = town.geographic_features?.some(f => f.toLowerCase().includes('mountain'));
  const isIsland = town.geographic_features?.some(f => f.toLowerCase().includes('island'));
  
  // Build description with variety
  const templates = [];
  
  // Template 1: Pace-focused
  templates.push(`${pace.charAt(0).toUpperCase() + pace.slice(1)} lifestyle with ${dining} and ${social}. ${cultural.charAt(0).toUpperCase() + cultural.slice(1)}, plus ${outdoor}. ${shopping.charAt(0).toUpperCase() + shopping.slice(1)} for daily needs.`);
  
  // Template 2: Activity-focused
  templates.push(`Offers ${outdoor} alongside ${cultural}. ${pace.charAt(0).toUpperCase() + pace.slice(1)} atmosphere with ${dining} and ${shopping}. ${social.charAt(0).toUpperCase() + social.slice(1)} year-round.`);
  
  // Template 3: Social-focused
  templates.push(`${social.charAt(0).toUpperCase() + social.slice(1)} characterizes this ${pace} destination. ${dining.charAt(0).toUpperCase() + dining.slice(1)}, ${outdoor}, and ${cultural}. ${shopping.charAt(0).toUpperCase() + shopping.slice(1)}.`);
  
  // Template 4: Balanced overview
  templates.push(`Combines ${pace} living with ${dining}. ${outdoor.charAt(0).toUpperCase() + outdoor.slice(1)}, ${cultural}, and ${social}. ${shopping.charAt(0).toUpperCase() + shopping.slice(1)} available.`);
  
  // Template 5: Location-specific
  if (isCoastal) {
    templates.push(`Coastal ${pace} lifestyle featuring ${outdoor}. ${dining.charAt(0).toUpperCase() + dining.slice(1)} with ${social}. ${cultural.charAt(0).toUpperCase() + cultural.slice(1)}, ${shopping}.`);
  } else if (isMountain) {
    templates.push(`Mountain town offering ${pace} living and ${outdoor}. ${dining.charAt(0).toUpperCase() + dining.slice(1)}, ${cultural}, ${social}. ${shopping.charAt(0).toUpperCase() + shopping.slice(1)}.`);
  } else if (isIsland) {
    templates.push(`Island life delivers ${pace} rhythm with ${outdoor}. ${dining.charAt(0).toUpperCase() + dining.slice(1)}, ${social}, and ${cultural}. ${shopping.charAt(0).toUpperCase() + shopping.slice(1)}.`);
  }
  
  // Pick random template
  let description = templates[Math.floor(Math.random() * templates.length)];
  
  // Add special notes for very small or very large places
  if (town.population < 15000) {
    description = description.replace(/\.$/, ' — small-town charm dominates.');
  } else if (town.population > 2000000) {
    description = description.replace(/\.$/, ' — big-city amenities throughout.');
  }
  
  // Clean up any double spaces or awkward phrasing
  description = description.replace(/\s+/g, ' ').trim();
  
  return description;
}

async function improveLifestyleDescriptions() {
  console.log('🌟 IMPROVING LIFESTYLE DESCRIPTIONS\n');
  console.log('Creating appealing but honest lifestyle assessments\n');
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country', { ascending: true });
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Processing ${towns.length} towns...\n`);
  
  let updateCount = 0;
  let errorCount = 0;
  const samples = [];
  
  for (const town of towns) {
    const newDescription = generateLifestyleDescription(town);
    
    // Collect varied samples
    if (samples.length < 20) {
      samples.push({
        name: town.town_name,
        country: town.country,
        description: newDescription,
        population: town.population,
        restaurants: town.restaurants_rating,
        nightlife: town.nightlife_rating,
        outdoor: town.outdoor_activities_rating
      });
    }
    
    // Update database
    const { error: updateError } = await supabase
      .from('towns')
      .update({ lifestyle_description: newDescription })
      .eq('id', town.id);
      
    if (updateError) {
      console.log(`❌ Failed to update ${town.town_name}: ${updateError.message}`);
      errorCount++;
    } else {
      updateCount++;
      if (updateCount % 50 === 0) {
        console.log(`  Updated ${updateCount} towns...`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('LIFESTYLE DESCRIPTION UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Show samples grouped by size
  console.log('\n🌟 SAMPLE LIFESTYLE DESCRIPTIONS:\n');
  
  // Large cities
  const largeCities = samples.filter(s => s.population > 500000).slice(0, 3);
  console.log('Large Cities:');
  largeCities.forEach(s => {
    console.log(`\n${s.name}, ${s.country} (Pop: ${s.population?.toLocaleString()}):`);
    console.log(`"${s.description}"`);
  });
  
  // Medium towns
  const mediumTowns = samples.filter(s => s.population >= 50000 && s.population <= 500000).slice(0, 3);
  console.log('\nMedium Towns:');
  mediumTowns.forEach(s => {
    console.log(`\n${s.name}, ${s.country} (Pop: ${s.population?.toLocaleString()}):`);
    console.log(`"${s.description}"`);
  });
  
  // Small towns
  const smallTowns = samples.filter(s => s.population < 50000).slice(0, 3);
  console.log('\nSmall Towns:');
  smallTowns.forEach(s => {
    console.log(`\n${s.name}, ${s.country} (Pop: ${s.population?.toLocaleString()}):`);
    console.log(`"${s.description}"`);
  });
}

// Run improvement
improveLifestyleDescriptions().catch(console.error);