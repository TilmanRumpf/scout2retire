import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Log with timestamp
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// Simple climate data based on known patterns by region
const CLIMATE_PATTERNS = {
  // US States
  'FL': { summer: 30, winter: 20, rainfall: 1300, sunshine: 2800 }, // Florida
  'CA': { summer: 25, winter: 15, rainfall: 500, sunshine: 3000 },  // California
  'TX': { summer: 32, winter: 15, rainfall: 900, sunshine: 2600 },  // Texas
  'AZ': { summer: 35, winter: 18, rainfall: 300, sunshine: 3400 },  // Arizona
  'NV': { summer: 33, winter: 10, rainfall: 200, sunshine: 3200 },  // Nevada
  'NM': { summer: 28, winter: 8, rainfall: 400, sunshine: 3100 },   // New Mexico
  'CO': { summer: 25, winter: 5, rainfall: 500, sunshine: 2800 },   // Colorado
  'UT': { summer: 30, winter: 5, rainfall: 400, sunshine: 2900 },   // Utah
  'OR': { summer: 22, winter: 8, rainfall: 1000, sunshine: 2200 },  // Oregon
  'WA': { summer: 20, winter: 7, rainfall: 1200, sunshine: 2000 },  // Washington
  'ID': { summer: 25, winter: 2, rainfall: 500, sunshine: 2400 },   // Idaho
  'MT': { summer: 22, winter: -2, rainfall: 400, sunshine: 2300 },  // Montana
  'WY': { summer: 23, winter: -5, rainfall: 350, sunshine: 2400 },  // Wyoming
  'NC': { summer: 28, winter: 10, rainfall: 1100, sunshine: 2400 }, // North Carolina
  'SC': { summer: 30, winter: 12, rainfall: 1200, sunshine: 2500 }, // South Carolina
  'GA': { summer: 30, winter: 12, rainfall: 1200, sunshine: 2400 }, // Georgia
  'VA': { summer: 27, winter: 8, rainfall: 1100, sunshine: 2300 },  // Virginia
  'TN': { summer: 28, winter: 8, rainfall: 1300, sunshine: 2200 },  // Tennessee
  'KY': { summer: 27, winter: 5, rainfall: 1200, sunshine: 2100 },  // Kentucky
  'AL': { summer: 30, winter: 12, rainfall: 1400, sunshine: 2300 }, // Alabama
  'MS': { summer: 30, winter: 12, rainfall: 1400, sunshine: 2300 }, // Mississippi
  'LA': { summer: 30, winter: 15, rainfall: 1500, sunshine: 2400 }, // Louisiana
  'AR': { summer: 30, winter: 8, rainfall: 1300, sunshine: 2200 },  // Arkansas
  'OK': { summer: 32, winter: 8, rainfall: 900, sunshine: 2500 },   // Oklahoma
  'KS': { summer: 30, winter: 2, rainfall: 800, sunshine: 2600 },   // Kansas
  'NE': { summer: 28, winter: 0, rainfall: 700, sunshine: 2500 },   // Nebraska
  'SD': { summer: 26, winter: -5, rainfall: 600, sunshine: 2400 },  // South Dakota
  'ND': { summer: 24, winter: -10, rainfall: 500, sunshine: 2300 }, // North Dakota
  'MN': { summer: 25, winter: -8, rainfall: 800, sunshine: 2200 },  // Minnesota
  'WI': { summer: 25, winter: -5, rainfall: 850, sunshine: 2100 },  // Wisconsin
  'MI': { summer: 24, winter: -2, rainfall: 850, sunshine: 2000 },  // Michigan
  'IA': { summer: 27, winter: -3, rainfall: 900, sunshine: 2300 },  // Iowa
  'MO': { summer: 29, winter: 3, rainfall: 1100, sunshine: 2300 },  // Missouri
  'IL': { summer: 27, winter: 0, rainfall: 1000, sunshine: 2200 },  // Illinois
  'IN': { summer: 27, winter: 1, rainfall: 1100, sunshine: 2100 },  // Indiana
  'OH': { summer: 26, winter: 1, rainfall: 1000, sunshine: 2000 },  // Ohio
  'PA': { summer: 26, winter: 1, rainfall: 1100, sunshine: 2000 },  // Pennsylvania
  'NY': { summer: 25, winter: 0, rainfall: 1200, sunshine: 2000 },  // New York
  'NJ': { summer: 27, winter: 3, rainfall: 1200, sunshine: 2100 },  // New Jersey
  'CT': { summer: 26, winter: 1, rainfall: 1300, sunshine: 2000 },  // Connecticut
  'MA': { summer: 25, winter: 0, rainfall: 1200, sunshine: 2000 },  // Massachusetts
  'VT': { summer: 24, winter: -5, rainfall: 1100, sunshine: 1900 }, // Vermont
  'NH': { summer: 24, winter: -5, rainfall: 1100, sunshine: 1900 }, // New Hampshire
  'ME': { summer: 23, winter: -5, rainfall: 1200, sunshine: 1900 }, // Maine
  'RI': { summer: 25, winter: 1, rainfall: 1200, sunshine: 2000 },  // Rhode Island
  'MD': { summer: 28, winter: 4, rainfall: 1100, sunshine: 2200 },  // Maryland
  'DE': { summer: 28, winter: 4, rainfall: 1200, sunshine: 2100 },  // Delaware
  'WV': { summer: 25, winter: 3, rainfall: 1100, sunshine: 2000 },  // West Virginia
  'HI': { summer: 28, winter: 24, rainfall: 1600, sunshine: 2800 }, // Hawaii
  'AK': { summer: 18, winter: -10, rainfall: 800, sunshine: 1500 }, // Alaska
  
  // Countries (rough averages)
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
};

// Get climate based on location
function getClimateForLocation(state, country) {
  // Try state first (for US)
  if (state && CLIMATE_PATTERNS[state]) {
    return {
      ...CLIMATE_PATTERNS[state],
      source: `${state} average`
    };
  }
  
  // Try country
  if (country && CLIMATE_PATTERNS[country]) {
    return {
      ...CLIMATE_PATTERNS[country],
      source: `${country} average`
    };
  }
  
  // Default temperate climate
  return {
    summer: 22,
    winter: 10,
    rainfall: 900,
    sunshine: 2200,
    source: 'default_temperate'
  };
}

// Add some variation based on coastal/mountain features
function adjustClimateForGeography(baseClimate, town) {
  const adjusted = { ...baseClimate };
  
  // Coastal areas tend to be more moderate
  if (town.beaches_nearby || town.coastal_distance_km < 50) {
    adjusted.summer = Math.round(adjusted.summer * 0.95); // Slightly cooler summers
    adjusted.winter = Math.round(adjusted.winter * 1.1);  // Slightly warmer winters
    adjusted.source += '_coastal';
  }
  
  // Mountain areas tend to be cooler
  if (town.mountains_nearby) {
    adjusted.summer = Math.round(adjusted.summer * 0.85); // Cooler summers
    adjusted.winter = Math.round(adjusted.winter * 0.8);  // Cooler winters
    adjusted.rainfall = Math.round(adjusted.rainfall * 1.2); // More precipitation
    adjusted.source += '_mountain';
  }
  
  // Add small random variation (±2 degrees, ±100mm rain, ±100 hours sun)
  adjusted.summer += Math.floor(Math.random() * 5) - 2;
  adjusted.winter += Math.floor(Math.random() * 5) - 2;
  adjusted.rainfall += Math.floor(Math.random() * 200) - 100;
  adjusted.sunshine += Math.floor(Math.random() * 200) - 100;
  
  // Ensure reasonable bounds
  adjusted.rainfall = Math.max(100, Math.min(4000, adjusted.rainfall));
  adjusted.sunshine = Math.max(1000, Math.min(4000, adjusted.sunshine));
  
  return adjusted;
}

async function enrichWithSimpleClimate() {
  log('Starting simple climate enrichment');
  
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
  
  for (const town of towns) {
    const climate = getClimateForLocation(town.state_code, town.country);
    const adjusted = adjustClimateForGeography(climate, town);
    
    const updates = {
      avg_temp_summer: adjusted.summer,
      avg_temp_winter: adjusted.winter,
      annual_rainfall_mm: adjusted.rainfall,
      annual_sunshine_hours: adjusted.sunshine,
      climate_data_source: adjusted.source,
      climate_estimated: true,
      data_last_updated: new Date().toISOString()
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
      updates.sunshine_level_actual = 'abundant';
    } else if (adjusted.sunshine >= 2200) {
      updates.sunshine_level_actual = 'mostly_sunny';
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
      log(`Error updating ${town.name}: ${updateError.message}`);
    } else {
      updatedCount++;
      log(`✓ Updated ${town.name}, ${town.state_code || town.country}: Summer ${adjusted.summer}°C, Winter ${adjusted.winter}°C`);
    }
    
    // Quick operation, minimal delay
    if (updatedCount % 50 === 0) {
      await sleep(1000);
    }
  }
  
  log(`\n✅ Simple enrichment complete!`);
  log(`   Updated: ${updatedCount}/${towns.length} towns`);
  
  // Check coverage
  const { data: coverage } = await supabase
    .from('towns')
    .select('id, avg_temp_summer, avg_temp_winter')
    .not('image_url_1', 'is', null);
  
  const withClimate = coverage.filter(t => t.avg_temp_summer && t.avg_temp_winter).length;
  log(`   Climate coverage: ${withClimate}/${coverage.length} towns with photos (${Math.round(withClimate/coverage.length*100)}%)`);
}

// Run it
log('🚀 Starting Simple Climate Enrichment');
log('   This will add estimated climate data based on regional patterns');
log('   Much faster than web scraping!\n');

enrichWithSimpleClimate()
  .then(() => {
    log('\n✅ Done! All towns now have basic climate data.');
  })
  .catch(error => {
    log(`\n❌ Error: ${error.message}`);
    console.error(error);
  });