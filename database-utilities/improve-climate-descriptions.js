import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY,
});

// Natural climate description templates based on climate type
const CLIMATE_TEMPLATES = {
  tropical: [
    "Warm and humid throughout the year with temperatures between {temp_range}. {rain_pattern}. {special_feature}",
    "Year-round warmth averaging {avg_temp} with {humidity_level} humidity. {rain_pattern}. {special_feature}",
    "Consistently warm at {temp_range}, {humidity_description}. {rain_pattern}. {special_feature}",
    "Balmy temperatures hover around {avg_temp} year-round. {rain_pattern}. {special_feature}"
  ],
  mediterranean: [
    "Hot, dry summers reaching {summer_temp} and mild winters around {winter_temp}. {rain_pattern}. {special_feature}",
    "Classic dry summers at {summer_temp}, pleasant winters near {winter_temp}. {rain_pattern}. {special_feature}",
    "Sunny summers hit {summer_temp}, winters stay mild at {winter_temp}. {rain_pattern}. {special_feature}",
    "Long, warm summers up to {summer_temp} contrast with gentle winters at {winter_temp}. {rain_pattern}"
  ],
  desert: [
    "Hot and arid with summer peaks of {summer_temp}, cooler winters at {winter_temp}. {rain_pattern}. {special_feature}",
    "Dry climate sees {summer_temp} summers, {winter_temp} winters. {rain_pattern}. {special_feature}",
    "Minimal rainfall, temperatures from {winter_temp} winters to {summer_temp} summers. {special_feature}",
    "Arid conditions bring {summer_temp} heat in summer, {winter_temp} relief in winter. {rain_pattern}"
  ],
  temperate: [
    "Four distinct seasons from {winter_temp} winters to {summer_temp} summers. {rain_pattern}. {special_feature}",
    "Seasonal variety spans {winter_temp} in winter to {summer_temp} in summer. {rain_pattern}. {special_feature}",
    "True four-season climate: {winter_temp} winters, {summer_temp} summers. {rain_pattern}. {special_feature}",
    "Moderate seasons range from {winter_temp} winter lows to {summer_temp} summer highs. {rain_pattern}"
  ],
  continental: [
    "Warm summers at {summer_temp}, cold winters dropping to {winter_temp}. {rain_pattern}. {special_feature}",
    "Strong seasonal contrast: {summer_temp} summers, {winter_temp} winters. {rain_pattern}. {special_feature}",
    "Hot summers reach {summer_temp}, winters plunge to {winter_temp}. {rain_pattern}. {special_feature}",
    "Wide temperature range from {winter_temp} winters to {summer_temp} summers. {rain_pattern}"
  ],
  subtropical: [
    "Humid summers at {summer_temp}, mild winters around {winter_temp}. {rain_pattern}. {special_feature}",
    "Warm and humid with {summer_temp} summers, {winter_temp} winters. {rain_pattern}. {special_feature}",
    "Hot, sticky summers hit {summer_temp}, winters mild at {winter_temp}. {rain_pattern}. {special_feature}",
    "Year-round warmth peaks at {summer_temp} in summer, {winter_temp} in winter. {rain_pattern}"
  ]
};

// Special features to add variety
const SPECIAL_FEATURES = {
  coastal: ["Sea breezes moderate temperatures", "Ocean influence keeps temperatures stable", "Coastal fog common mornings", "Maritime climate buffers extremes"],
  mountain: ["Altitude brings cooler nights", "Mountain breezes provide relief", "Elevation moderates heat", "Clear mountain air year-round"],
  island: ["Trade winds provide cooling", "Island breezes year-round", "Surrounded by moderating waters", "Consistent ocean breezes"],
  inland: ["Continental climate patterns", "Less humidity than coast", "Clear, dry air typical", "Dramatic day-night temperature swings"],
  valley: ["Valley location traps warmth", "Protected from harsh winds", "Morning fog, afternoon sun", "Sheltered microclimate"],
  desert: ["Very low humidity", "Dramatic temperature drops at night", "Clear skies predominate", "Minimal cloud cover"],
  rainforest: ["High humidity year-round", "Daily afternoon showers common", "Lush, green environment", "Consistent conditions"],
  arctic: ["Midnight sun in summer", "Polar nights in winter", "Aurora borealis visible", "Extreme seasonal daylight variation"]
};

// Rain patterns
const RAIN_PATTERNS = {
  wet_dry: ["Distinct wet and dry seasons", "Rain concentrated in {wet_months}", "Dry season {dry_months}", "Monsoon pattern {wet_months}"],
  year_round: ["Rainfall distributed throughout year", "Regular precipitation year-round", "No true dry season", "Consistent moisture"],
  winter_rain: ["Winter rains, dry summers", "Rain mainly November-March", "Mediterranean rain pattern", "Wet winters, parched summers"],
  summer_rain: ["Summer thunderstorms common", "Rain peaks in summer months", "Afternoon showers in summer", "Wet summers, dry winters"],
  minimal: ["Minimal annual rainfall", "Very rare precipitation", "Nearly no rainfall", "Extremely dry conditions"],
  moderate: ["Moderate rainfall year-round", "Adequate rainfall throughout", "Well-distributed precipitation", "Balanced moisture levels"]
};

function generateNaturalDescription(town) {
  // Determine climate type
  let climateType = 'temperate'; // default
  const climate = (town.climate || '').toLowerCase();
  
  if (climate.includes('tropical')) climateType = 'tropical';
  else if (climate.includes('mediterranean')) climateType = 'mediterranean';
  else if (climate.includes('desert') || climate.includes('arid')) climateType = 'desert';
  else if (climate.includes('continental')) climateType = 'continental';
  else if (climate.includes('subtropical')) climateType = 'subtropical';
  else if (climate.includes('temperate')) climateType = 'temperate';
  
  // Get temperature data
  const summerTemp = town.avg_temp_summer ? `${town.avg_temp_summer}°C` : '25°C';
  const winterTemp = town.avg_temp_winter ? `${town.avg_temp_winter}°C` : '15°C';
  const avgTemp = town.avg_temp_summer && town.avg_temp_winter ? 
    `${Math.round((town.avg_temp_summer + town.avg_temp_winter) / 2)}°C` : '20°C';
  const tempRange = `${winterTemp}-${summerTemp}`;
  
  // Determine special features based on geography
  let specialFeature = '';
  if (town.geographic_features && Array.isArray(town.geographic_features)) {
    const features = town.geographic_features.join(' ').toLowerCase();
    if (features.includes('coastal') || features.includes('beach')) {
      specialFeature = SPECIAL_FEATURES.coastal[Math.floor(Math.random() * SPECIAL_FEATURES.coastal.length)];
    } else if (features.includes('mountain')) {
      specialFeature = SPECIAL_FEATURES.mountain[Math.floor(Math.random() * SPECIAL_FEATURES.mountain.length)];
    } else if (features.includes('island')) {
      specialFeature = SPECIAL_FEATURES.island[Math.floor(Math.random() * SPECIAL_FEATURES.island.length)];
    } else if (features.includes('valley')) {
      specialFeature = SPECIAL_FEATURES.valley[Math.floor(Math.random() * SPECIAL_FEATURES.valley.length)];
    } else if (features.includes('desert')) {
      specialFeature = SPECIAL_FEATURES.desert[Math.floor(Math.random() * SPECIAL_FEATURES.desert.length)];
    } else {
      specialFeature = SPECIAL_FEATURES.inland[Math.floor(Math.random() * SPECIAL_FEATURES.inland.length)];
    }
  }
  
  // Determine rain pattern
  let rainPattern = '';
  const rainfall = town.annual_rainfall || 0;
  if (rainfall < 250) {
    rainPattern = RAIN_PATTERNS.minimal[Math.floor(Math.random() * RAIN_PATTERNS.minimal.length)];
  } else if (rainfall < 600) {
    if (climateType === 'mediterranean') {
      rainPattern = RAIN_PATTERNS.winter_rain[Math.floor(Math.random() * RAIN_PATTERNS.winter_rain.length)];
    } else {
      rainPattern = RAIN_PATTERNS.moderate[Math.floor(Math.random() * RAIN_PATTERNS.moderate.length)];
    }
  } else if (rainfall < 1200) {
    rainPattern = RAIN_PATTERNS.year_round[Math.floor(Math.random() * RAIN_PATTERNS.year_round.length)];
  } else {
    if (climateType === 'tropical') {
      rainPattern = RAIN_PATTERNS.wet_dry[Math.floor(Math.random() * RAIN_PATTERNS.wet_dry.length)];
    } else {
      rainPattern = RAIN_PATTERNS.summer_rain[Math.floor(Math.random() * RAIN_PATTERNS.summer_rain.length)];
    }
  }
  
  // Select and fill template
  const templates = CLIMATE_TEMPLATES[climateType];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  let description = template
    .replace('{summer_temp}', summerTemp)
    .replace('{winter_temp}', winterTemp)
    .replace('{avg_temp}', avgTemp)
    .replace('{temp_range}', tempRange)
    .replace('{rain_pattern}', rainPattern)
    .replace('{special_feature}', specialFeature)
    .replace('{humidity_level}', rainfall > 1000 ? 'high' : 'moderate')
    .replace('{humidity_description}', rainfall > 1000 ? 'with noticeable humidity' : 'comfortable humidity levels')
    .replace('{wet_months}', 'May-October')
    .replace('{dry_months}', 'November-April');
  
  // Clean up double spaces and periods
  description = description.replace(/\s+/g, ' ').replace(/\.\./g, '.').trim();
  
  // Remove any accidental town name mentions
  description = description.replace(new RegExp(town.name, 'gi'), '').trim();
  
  return description;
}

async function improveClimateDescriptions() {
  console.log('🌡️ IMPROVING CLIMATE DESCRIPTIONS\n');
  
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
  let skipCount = 0;
  let errorCount = 0;
  
  for (const town of towns) {
    // Check if description needs improvement
    const currentDesc = town.climate_description || '';
    const needsUpdate = !currentDesc || 
                       currentDesc.length < 50 || 
                       currentDesc.includes(town.name) ||
                       currentDesc.toLowerCase().includes('features a') ||
                       currentDesc.toLowerCase().includes('boasts a') ||
                       currentDesc.toLowerCase().includes('enjoys a') ||
                       currentDesc.toLowerCase().includes('characterized by') ||
                       currentDesc.toLowerCase().includes('the climate');
    
    if (!needsUpdate && currentDesc.length > 80) {
      skipCount++;
      continue;
    }
    
    // Generate new description
    const newDescription = generateNaturalDescription(town);
    
    // Update database
    const { error: updateError } = await supabase
      .from('towns')
      .update({ climate_description: newDescription })
      .eq('id', town.id);
      
    if (updateError) {
      console.log(`❌ Failed to update ${town.name}: ${updateError.message}`);
      errorCount++;
    } else {
      updateCount++;
      if (updateCount % 50 === 0) {
        console.log(`  Updated ${updateCount} towns...`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('CLIMATE DESCRIPTION IMPROVEMENT COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`⏭️  Skipped (already good): ${skipCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Show samples of improvements
  console.log('\n📝 SAMPLE IMPROVEMENTS:');
  const { data: samples } = await supabase
    .from('towns')
    .select('name, country, climate_description')
    .limit(10);
    
  samples.forEach(s => {
    console.log(`\n${s.name}, ${s.country}:`);
    console.log(`"${s.climate_description}"`);
  });
}

// Run improvement
improveClimateDescriptions().catch(console.error);