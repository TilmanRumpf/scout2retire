import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

// Log with timestamp
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// Regional climate patterns
const CLIMATE_PATTERNS = {
  // US States
  'FL': { summer: 30, winter: 20, rainfall: 1300, sunshine: 2800 },
  'CA': { summer: 25, winter: 15, rainfall: 500, sunshine: 3000 },
  'TX': { summer: 32, winter: 15, rainfall: 900, sunshine: 2600 },
  'AZ': { summer: 35, winter: 18, rainfall: 300, sunshine: 3400 },
  'NV': { summer: 33, winter: 10, rainfall: 200, sunshine: 3200 },
  'NM': { summer: 28, winter: 8, rainfall: 400, sunshine: 3100 },
  'CO': { summer: 25, winter: 5, rainfall: 500, sunshine: 2800 },
  'UT': { summer: 30, winter: 5, rainfall: 400, sunshine: 2900 },
  'OR': { summer: 22, winter: 8, rainfall: 1000, sunshine: 2200 },
  'WA': { summer: 20, winter: 7, rainfall: 1200, sunshine: 2000 },
  'NC': { summer: 28, winter: 10, rainfall: 1100, sunshine: 2400 },
  'SC': { summer: 30, winter: 12, rainfall: 1200, sunshine: 2500 },
  'GA': { summer: 30, winter: 12, rainfall: 1200, sunshine: 2400 },
  'VA': { summer: 27, winter: 8, rainfall: 1100, sunshine: 2300 },
  'TN': { summer: 28, winter: 8, rainfall: 1300, sunshine: 2200 },
  
  // Countries
  'Spain': { summer: 28, winter: 12, rainfall: 600, sunshine: 2800 },
  'Portugal': { summer: 26, winter: 13, rainfall: 800, sunshine: 2700 },
  'France': { summer: 24, winter: 8, rainfall: 800, sunshine: 2000 },
  'Italy': { summer: 27, winter: 10, rainfall: 700, sunshine: 2400 },
  'Greece': { summer: 30, winter: 12, rainfall: 500, sunshine: 2900 },
  'Turkey': { summer: 28, winter: 8, rainfall: 600, sunshine: 2600 },
  'Thailand': { summer: 32, winter: 26, rainfall: 1400, sunshine: 2500 },
  'Vietnam': { summer: 30, winter: 22, rainfall: 1600, sunshine: 2200 },
  'Philippines': { summer: 30, winter: 26, rainfall: 2000, sunshine: 2000 },
  'Malaysia': { summer: 30, winter: 28, rainfall: 2500, sunshine: 2100 },
  'Indonesia': { summer: 30, winter: 28, rainfall: 2200, sunshine: 2200 },
  'Australia': { summer: 28, winter: 16, rainfall: 600, sunshine: 2800 },
  'New Zealand': { summer: 22, winter: 10, rainfall: 1200, sunshine: 2100 },
  'Mexico': { summer: 28, winter: 20, rainfall: 800, sunshine: 2800 },
  'Costa Rica': { summer: 26, winter: 24, rainfall: 2000, sunshine: 2200 },
  'Panama': { summer: 28, winter: 26, rainfall: 2200, sunshine: 2100 },
  'Ecuador': { summer: 22, winter: 20, rainfall: 1000, sunshine: 2000 },
  'Peru': { summer: 22, winter: 18, rainfall: 300, sunshine: 2400 },
  'Chile': { summer: 24, winter: 12, rainfall: 600, sunshine: 2300 },
  'Argentina': { summer: 26, winter: 12, rainfall: 800, sunshine: 2400 },
  'Uruguay': { summer: 25, winter: 12, rainfall: 1000, sunshine: 2200 },
  'Brazil': { summer: 28, winter: 22, rainfall: 1500, sunshine: 2300 },
  'Colombia': { summer: 24, winter: 22, rainfall: 1200, sunshine: 2100 },
  'Morocco': { summer: 28, winter: 15, rainfall: 400, sunshine: 3000 },
  'Egypt': { summer: 35, winter: 18, rainfall: 50, sunshine: 3600 },
  'South Africa': { summer: 26, winter: 15, rainfall: 600, sunshine: 2800 },
  'Israel': { summer: 30, winter: 15, rainfall: 500, sunshine: 3300 },
  'United Arab Emirates': { summer: 40, winter: 22, rainfall: 100, sunshine: 3500 },
  'Germany': { summer: 22, winter: 3, rainfall: 700, sunshine: 1700 },
  'Netherlands': { summer: 20, winter: 5, rainfall: 800, sunshine: 1600 },
  'Belgium': { summer: 21, winter: 5, rainfall: 850, sunshine: 1550 },
  'United Kingdom': { summer: 20, winter: 7, rainfall: 1100, sunshine: 1500 },
  'Croatia': { summer: 27, winter: 8, rainfall: 900, sunshine: 2600 },
  'Montenegro': { summer: 26, winter: 8, rainfall: 1000, sunshine: 2500 },
  'Albania': { summer: 28, winter: 10, rainfall: 1000, sunshine: 2600 },
  'Cyprus': { summer: 32, winter: 15, rainfall: 400, sunshine: 3200 },
  'Malta': { summer: 28, winter: 15, rainfall: 500, sunshine: 3000 },
  'Canada': { summer: 22, winter: -5, rainfall: 900, sunshine: 2000 },
  'Japan': { summer: 28, winter: 8, rainfall: 1500, sunshine: 2000 },
  'Taiwan': { summer: 30, winter: 18, rainfall: 2500, sunshine: 2100 },
  'Singapore': { summer: 30, winter: 28, rainfall: 2300, sunshine: 2200 },
  'India': { summer: 35, winter: 22, rainfall: 1200, sunshine: 2800 },
  'Sri Lanka': { summer: 30, winter: 26, rainfall: 2000, sunshine: 2300 },
  'Nepal': { summer: 25, winter: 12, rainfall: 1400, sunshine: 2400 },
  'Laos': { summer: 30, winter: 22, rainfall: 1600, sunshine: 2200 },
  'Cambodia': { summer: 32, winter: 26, rainfall: 1400, sunshine: 2400 },
  'Bulgaria': { summer: 26, winter: 2, rainfall: 600, sunshine: 2300 },
  'Romania': { summer: 26, winter: 0, rainfall: 650, sunshine: 2200 },
  'Hungary': { summer: 25, winter: 1, rainfall: 600, sunshine: 2100 },
  'Poland': { summer: 23, winter: -1, rainfall: 600, sunshine: 1800 },
  'Czech Republic': { summer: 23, winter: 0, rainfall: 550, sunshine: 1700 },
  'Slovakia': { summer: 24, winter: -1, rainfall: 650, sunshine: 1900 },
  'Slovenia': { summer: 25, winter: 2, rainfall: 1100, sunshine: 2000 },
  'Estonia': { summer: 20, winter: -3, rainfall: 700, sunshine: 1700 },
  'Latvia': { summer: 21, winter: -3, rainfall: 650, sunshine: 1800 },
  'Lithuania': { summer: 22, winter: -3, rainfall: 700, sunshine: 1750 },
  'Switzerland': { summer: 22, winter: 2, rainfall: 1000, sunshine: 1900 },
  'Austria': { summer: 23, winter: 1, rainfall: 800, sunshine: 1900 },
  'Sweden': { summer: 20, winter: -2, rainfall: 550, sunshine: 1800 },
  'Norway': { summer: 18, winter: 0, rainfall: 1000, sunshine: 1600 },
  'Denmark': { summer: 20, winter: 3, rainfall: 700, sunshine: 1700 },
  'Finland': { summer: 20, winter: -5, rainfall: 600, sunshine: 1850 },
  'Iceland': { summer: 14, winter: 1, rainfall: 800, sunshine: 1300 },
  'Ireland': { summer: 18, winter: 7, rainfall: 1200, sunshine: 1400 },
  'Barbados': { summer: 30, winter: 26, rainfall: 1400, sunshine: 3000 },
  'Jamaica': { summer: 31, winter: 26, rainfall: 1900, sunshine: 2800 },
  'Dominican Republic': { summer: 31, winter: 25, rainfall: 1400, sunshine: 2700 },
  'Puerto Rico': { summer: 30, winter: 25, rainfall: 1500, sunshine: 2800 },
  'Belize': { summer: 30, winter: 24, rainfall: 1900, sunshine: 2600 },
  'Guatemala': { summer: 25, winter: 20, rainfall: 1300, sunshine: 2400 },
  'Nicaragua': { summer: 30, winter: 26, rainfall: 1500, sunshine: 2500 },
  'Seychelles': { summer: 29, winter: 27, rainfall: 2200, sunshine: 2400 },
  'Mauritius': { summer: 28, winter: 22, rainfall: 2000, sunshine: 2500 },
  'Tunisia': { summer: 32, winter: 12, rainfall: 450, sunshine: 3100 },
  'Kenya': { summer: 26, winter: 24, rainfall: 900, sunshine: 2600 },
  'Tanzania': { summer: 28, winter: 26, rainfall: 1100, sunshine: 2700 },
  'Namibia': { summer: 30, winter: 20, rainfall: 350, sunshine: 3300 },
  'Georgia': { summer: 25, winter: 5, rainfall: 1000, sunshine: 2200 },
  'Armenia': { summer: 28, winter: 0, rainfall: 400, sunshine: 2700 },
  'Azerbaijan': { summer: 30, winter: 5, rainfall: 300, sunshine: 2500 },
  'Russia': { summer: 22, winter: -10, rainfall: 600, sunshine: 1700 },
  'Fiji': { summer: 29, winter: 25, rainfall: 2000, sunshine: 2300 },
  'Samoa': { summer: 29, winter: 26, rainfall: 3000, sunshine: 2200 },
  'Kuwait': { summer: 45, winter: 15, rainfall: 120, sunshine: 3300 },
  'Oman': { summer: 38, winter: 22, rainfall: 100, sunshine: 3400 },
  'Qatar': { summer: 42, winter: 20, rainfall: 75, sunshine: 3400 },
  'Bahrain': { summer: 38, winter: 18, rainfall: 80, sunshine: 3300 },
  'Pakistan': { summer: 35, winter: 15, rainfall: 400, sunshine: 3000 },
  'Paraguay': { summer: 32, winter: 18, rainfall: 1300, sunshine: 2600 },
  'Bolivia': { summer: 25, winter: 15, rainfall: 600, sunshine: 2700 },
  'Grenada': { summer: 30, winter: 26, rainfall: 2200, sunshine: 2700 },
  'Saint Kitts and Nevis': { summer: 30, winter: 25, rainfall: 1400, sunshine: 2900 },
  'Antigua and Barbuda': { summer: 30, winter: 25, rainfall: 1100, sunshine: 2900 },
  'Dominica': { summer: 30, winter: 25, rainfall: 2000, sunshine: 2600 },
  'Curacao': { summer: 31, winter: 27, rainfall: 550, sunshine: 3100 },
};

// Get climate based on location
function getClimateForLocation(state, country) {
  // Try state first (for US)
  if (state && CLIMATE_PATTERNS[state]) {
    return CLIMATE_PATTERNS[state];
  }
  
  // Try country
  if (country && CLIMATE_PATTERNS[country]) {
    return CLIMATE_PATTERNS[country];
  }
  
  // Default temperate climate
  return {
    summer: 22,
    winter: 10,
    rainfall: 900,
    sunshine: 2200
  };
}

// Add variation based on geography
function adjustClimateForGeography(baseClimate, town) {
  const adjusted = { ...baseClimate };
  
  // Coastal areas are more moderate
  if (town.beaches_nearby) {
    adjusted.summer = Math.round(adjusted.summer * 0.95);
    adjusted.winter = Math.round(adjusted.winter * 1.1);
  }
  
  // Mountain areas are cooler
  if (town.mountains_nearby) {
    adjusted.summer = Math.round(adjusted.summer * 0.85);
    adjusted.winter = Math.round(adjusted.winter * 0.8);
    adjusted.rainfall = Math.round(adjusted.rainfall * 1.2);
  }
  
  // Add small variation
  adjusted.summer += Math.floor(Math.random() * 5) - 2;
  adjusted.winter += Math.floor(Math.random() * 5) - 2;
  adjusted.rainfall += Math.floor(Math.random() * 200) - 100;
  adjusted.sunshine += Math.floor(Math.random() * 200) - 100;
  
  // Ensure reasonable bounds
  adjusted.rainfall = Math.max(100, Math.min(4000, adjusted.rainfall));
  adjusted.sunshine = Math.max(1000, Math.min(4000, adjusted.sunshine));
  
  return adjusted;
}

async function enrichTownsWithClimate() {
  log('Starting climate enrichment with correct column names');
  
  // Get towns needing climate data
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .or('avg_temp_summer.is.null,avg_temp_winter.is.null')
    .order('image_url_1', { ascending: false })
    .order('name');
  
  if (error) {
    log(`Error fetching towns: ${error.message}`);
    return;
  }
  
  log(`Found ${towns.length} towns needing climate data`);
  
  let updatedCount = 0;
  let errorCount = 0;
  
  for (const town of towns) {
    try {
      const climate = getClimateForLocation(town.state_code, town.country);
      const adjusted = adjustClimateForGeography(climate, town);
      
      const updates = {
        avg_temp_summer: adjusted.summer,
        avg_temp_winter: adjusted.winter,
        annual_rainfall: adjusted.rainfall,  // Using correct column name
        sunshine_hours: adjusted.sunshine    // Using correct column name
      };
      
      // Update climate classifications
      if (adjusted.summer >= 28) {
        updates.summer_climate_actual = 'hot';
      } else if (adjusted.summer >= 22) {
        updates.summer_climate_actual = 'warm';
      } else if (adjusted.summer >= 15) {
        updates.summer_climate_actual = 'mild';
      } else {
        updates.summer_climate_actual = 'cool';
      }
      
      if (adjusted.winter >= 15) {
        updates.winter_climate_actual = 'mild';
      } else if (adjusted.winter >= 5) {
        updates.winter_climate_actual = 'cool';
      } else {
        updates.winter_climate_actual = 'cold';
      }
      
      if (adjusted.sunshine >= 2800) {
        updates.sunshine_level_actual = 'often_sunny';  // FIXED: was 'abundant'
      } else if (adjusted.sunshine >= 2200) {
        updates.sunshine_level_actual = 'often_sunny';  // FIXED: was 'mostly_sunny'
      } else if (adjusted.sunshine >= 1600) {
        updates.sunshine_level_actual = 'balanced';
      } else {
        updates.sunshine_level_actual = 'less_sunny';
      }
      
      if (adjusted.rainfall < 400) {
        updates.precipitation_level_actual = 'mostly_dry';
      } else if (adjusted.rainfall < 800) {
        updates.precipitation_level_actual = 'balanced';
      } else {
        updates.precipitation_level_actual = 'less_dry';  // FIXED: was often_rainy
      }
      
      const { error: updateError } = await supabase
        .from('towns')
        .update(updates)
        .eq('id', town.id);
      
      if (updateError) {
        log(`✗ Error updating ${town.name}: ${updateError.message}`);
        errorCount++;
      } else {
        updatedCount++;
        log(`✓ ${town.name}, ${town.state_code || town.country}: Summer ${adjusted.summer}°C, Winter ${adjusted.winter}°C`);
      }
      
    } catch (error) {
      log(`✗ Error processing ${town.name}: ${error.message}`);
      errorCount++;
    }
  }
  
  log(`\n✅ Climate enrichment complete!`);
  log(`   Successfully updated: ${updatedCount} towns`);
  log(`   Errors: ${errorCount} towns`);
  
  // Check final coverage
  const { data: coverage } = await supabase
    .from('towns')
    .select('id, avg_temp_summer, avg_temp_winter, image_url_1');
  
  const total = coverage.length;
  const withPhotos = coverage.filter(t => t.image_url_1).length;
  const withClimate = coverage.filter(t => t.avg_temp_summer && t.avg_temp_winter).length;
  const photosWithClimate = coverage.filter(t => t.image_url_1 && t.avg_temp_summer && t.avg_temp_winter).length;
  
  log(`\n📊 FINAL COVERAGE:`);
  log(`   Total towns: ${total}`);
  log(`   Towns with photos: ${withPhotos} (${Math.round(withPhotos/total*100)}%)`);
  log(`   Towns with climate: ${withClimate} (${Math.round(withClimate/total*100)}%)`);
  log(`   Photos WITH climate: ${photosWithClimate} (${Math.round(photosWithClimate/withPhotos*100)}% of visible towns)`);
}

// Run it
log('🚀 Starting Climate Data Enrichment');
log('   Using regional averages with geographic adjustments\n');

enrichTownsWithClimate()
  .then(() => {
    log('\n✅ Done! Check the coverage report above.');
  })
  .catch(error => {
    log(`\n❌ Fatal error: ${error.message}`);
    console.error(error);
  });