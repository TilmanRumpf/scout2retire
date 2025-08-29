import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Sleep function for rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Log progress
const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

// User agent for requests
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

// Try Wikipedia API first - most reliable
async function getClimateFromWikipedia(city, state, country) {
  try {
    // Build search query
    const searchQuery = `${city} ${state ? state + ' ' : ''}${country} climate weather`;
    
    // Search Wikipedia
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: { 'User-Agent': USER_AGENT }
    });
    
    if (!searchResponse.ok) throw new Error(`Wikipedia search failed: ${searchResponse.status}`);
    
    const searchData = await searchResponse.json();
    
    if (!searchData.query?.search?.[0]) {
      return null;
    }
    
    // Get the page content
    const pageTitle = searchData.query.search[0].title;
    const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts&format=json&origin=*`;
    
    const contentResponse = await fetch(contentUrl, {
      headers: { 'User-Agent': USER_AGENT }
    });
    
    if (!contentResponse.ok) throw new Error(`Wikipedia content failed: ${contentResponse.status}`);
    
    const contentData = await contentResponse.json();
    const pages = contentData.query.pages;
    const pageId = Object.keys(pages)[0];
    const extract = pages[pageId].extract;
    
    if (!extract) return null;
    
    // Extract climate data using regex patterns
    const climateData = {};
    
    // Temperature patterns
    const tempPatterns = [
      /average.*?temperature.*?(\d+)\s*°?[CF]/gi,
      /summer.*?temperature.*?(\d+)\s*°?[CF]/gi,
      /winter.*?temperature.*?(\d+)\s*°?[CF]/gi,
      /July.*?average.*?(\d+)\s*°?[CF]/gi,
      /January.*?average.*?(\d+)\s*°?[CF]/gi
    ];
    
    const temps = [];
    tempPatterns.forEach(pattern => {
      const matches = extract.matchAll(pattern);
      for (const match of matches) {
        const temp = parseInt(match[1]);
        if (temp && temp > -50 && temp < 150) {
          // Convert F to C if needed (assume F if temp > 50)
          temps.push(temp > 50 ? Math.round((temp - 32) * 5/9) : temp);
        }
      }
    });
    
    if (temps.length >= 2) {
      climateData.avg_temp_summer = Math.max(...temps);
      climateData.avg_temp_winter = Math.min(...temps);
    }
    
    // Rainfall patterns
    const rainfallPatterns = [
      /rainfall.*?(\d+)\s*(?:mm|inches)/gi,
      /precipitation.*?(\d+)\s*(?:mm|inches)/gi,
      /annual.*?rain.*?(\d+)\s*(?:mm|inches)/gi
    ];
    
    rainfallPatterns.forEach(pattern => {
      const match = extract.match(pattern);
      if (match) {
        let rainfall = parseInt(match[1]);
        // Convert inches to mm if needed
        if (match[0].includes('inches')) {
          rainfall = Math.round(rainfall * 25.4);
        }
        if (rainfall > 0 && rainfall < 10000) {
          climateData.annual_rainfall_mm = rainfall;
        }
      }
    });
    
    // Sunshine patterns
    const sunshinePatterns = [
      /sunshine.*?(\d+)\s*hours/gi,
      /sunny.*?(\d+)\s*hours/gi,
      /(\d+)\s*hours.*?sunshine/gi
    ];
    
    sunshinePatterns.forEach(pattern => {
      const match = extract.match(pattern);
      if (match) {
        const sunshine = parseInt(match[1]);
        if (sunshine > 1000 && sunshine < 4500) {
          climateData.annual_sunshine_hours = sunshine;
        }
      }
    });
    
    if (Object.keys(climateData).length > 0) {
      climateData.climate_data_source = 'wikipedia';
      return climateData;
    }
    
    return null;
  } catch (error) {
    log(`Wikipedia error for ${city}: ${error.message}`);
    return null;
  }
}

// Try Weather.gov for US cities
async function getClimateFromWeatherGov(city, state) {
  try {
    if (!state) return null;
    
    // Weather.gov uses specific station IDs, try to find via search
    const searchUrl = `https://api.weather.gov/points/search?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;
    
    const response = await fetch(searchUrl, {
      headers: { 
        'User-Agent': USER_AGENT,
        'Accept': 'application/geo+json'
      }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // This is a simplified example - Weather.gov API is complex
    // In reality, we'd need to get the grid point and then fetch climate data
    // For now, return null as this requires multiple API calls
    
    return null;
  } catch (error) {
    log(`Weather.gov error for ${city}: ${error.message}`);
    return null;
  }
}

// Try WeatherSpark as fallback
async function getClimateFromWeatherSpark(city, state, country) {
  try {
    // Build URL - WeatherSpark uses predictable URLs
    const citySlug = city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const countryCode = country.toLowerCase().substring(0, 2);
    
    let url = `https://weatherspark.com/y/1/${countryCode}/${citySlug}`;
    if (state) {
      const stateSlug = state.toLowerCase().replace(/\s+/g, '-');
      url = `https://weatherspark.com/y/1/${countryCode}/${stateSlug}/${citySlug}`;
    }
    
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const climateData = {};
    
    // Extract temperature data
    const tempText = $('.temperature-section').text() || $('body').text();
    
    // Look for summer/winter temperatures
    const summerMatch = tempText.match(/summer.*?(\d+)\s*°?[CF]/i);
    const winterMatch = tempText.match(/winter.*?(\d+)\s*°?[CF]/i);
    
    if (summerMatch) {
      let temp = parseInt(summerMatch[1]);
      if (temp > 50) temp = Math.round((temp - 32) * 5/9); // Convert F to C
      climateData.avg_temp_summer = temp;
    }
    
    if (winterMatch) {
      let temp = parseInt(winterMatch[1]);
      if (temp > 50) temp = Math.round((temp - 32) * 5/9); // Convert F to C
      climateData.avg_temp_winter = temp;
    }
    
    if (Object.keys(climateData).length > 0) {
      climateData.climate_data_source = 'weatherspark';
      return climateData;
    }
    
    return null;
  } catch (error) {
    log(`WeatherSpark error for ${city}: ${error.message}`);
    return null;
  }
}

// Try multiple sources with fallback
async function getClimateData(city, state, country) {
  log(`  🌡️  Attempting to fetch climate data for ${city}...`);
  
  // Try Wikipedia first
  let climate = await getClimateFromWikipedia(city, state, country);
  if (climate) {
    log(`  ✓ Got climate from Wikipedia`);
    return climate;
  }
  
  await sleep(1000);
  
  // Try Weather.gov for US cities
  if (country === 'United States' && state) {
    climate = await getClimateFromWeatherGov(city, state);
    if (climate) {
      log(`  ✓ Got climate from Weather.gov`);
      return climate;
    }
  }
  
  await sleep(1000);
  
  // Try WeatherSpark
  climate = await getClimateFromWeatherSpark(city, state, country);
  if (climate) {
    log(`  ✓ Got climate from WeatherSpark`);
    return climate;
  }
  
  // If all else fails, try to estimate based on similar cities
  return await getEstimatedClimate(city, state, country);
}

// Estimate climate based on nearby cities
async function getEstimatedClimate(city, state, country) {
  try {
    // Find cities in same state/country with climate data
    const { data: similarTowns } = await supabase
      .from('towns')
      .select('*')
      .eq('country', country)
      .eq('state_code', state)
      .not('avg_temp_summer', 'is', null)
      .not('avg_temp_winter', 'is', null)
      .limit(5);
    
    if (!similarTowns || similarTowns.length === 0) {
      // Try just country
      const { data: countryTowns } = await supabase
        .from('towns')
        .select('*')
        .eq('country', country)
        .not('avg_temp_summer', 'is', null)
        .not('avg_temp_winter', 'is', null)
        .limit(10);
      
      if (!countryTowns || countryTowns.length === 0) {
        return null;
      }
      
      // Average the climate data
      const avgSummer = Math.round(countryTowns.reduce((sum, t) => sum + t.avg_temp_summer, 0) / countryTowns.length);
      const avgWinter = Math.round(countryTowns.reduce((sum, t) => sum + t.avg_temp_winter, 0) / countryTowns.length);
      
      log(`  ~ Estimated climate based on ${countryTowns.length} towns in ${country}`);
      
      return {
        avg_temp_summer: avgSummer,
        avg_temp_winter: avgWinter,
        climate_data_source: 'estimated_country_average',
        climate_estimated: true
      };
    }
    
    // Average the climate data from nearby cities
    const avgSummer = Math.round(similarTowns.reduce((sum, t) => sum + t.avg_temp_summer, 0) / similarTowns.length);
    const avgWinter = Math.round(similarTowns.reduce((sum, t) => sum + t.avg_temp_winter, 0) / similarTowns.length);
    const avgRainfall = similarTowns[0].annual_rainfall_mm || null;
    const avgSunshine = similarTowns[0].annual_sunshine_hours || null;
    
    log(`  ~ Estimated climate based on ${similarTowns.length} nearby towns in ${state || country}`);
    
    return {
      avg_temp_summer: avgSummer,
      avg_temp_winter: avgWinter,
      annual_rainfall_mm: avgRainfall,
      annual_sunshine_hours: avgSunshine,
      climate_data_source: 'estimated_regional_average',
      climate_estimated: true
    };
    
  } catch (error) {
    log(`  Error estimating climate: ${error.message}`);
    return null;
  }
}

// Get geographic features from OpenStreetMap (keep existing function)
async function getGeographicFeatures(lat, lon, city) {
  try {
    if (!lat || !lon) {
      return null;
    }
    
    // Simple proximity check for beaches and mountains
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const query = `
      [out:json][timeout:10];
      (
        node["natural"="beach"](around:20000,${lat},${lon});
        way["natural"="beach"](around:20000,${lat},${lon});
        node["natural"="peak"](around:50000,${lat},${lon});
      );
      out count;
    `;
    
    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const elements = data.elements || [];
    const hasBeaches = elements.some(e => e.tags?.natural === 'beach');
    const hasMountains = elements.some(e => e.tags?.natural === 'peak');
    
    return {
      beaches_nearby: hasBeaches,
      mountains_nearby: hasMountains,
      geographic_data_source: 'openstreetmap'
    };
    
  } catch (error) {
    log(`  OSM error for ${city}: ${error.message}`);
    // Don't fail, just return null
    return null;
  }
}

// Main enrichment function with better error handling
async function enrichAllTowns() {
  log('Starting resilient town data enrichment process');
  
  // Get all towns that need enrichment (prioritize those with photos)
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .or('avg_temp_summer.is.null,avg_temp_winter.is.null,beaches_nearby.is.null,mountains_nearby.is.null')
    .order('image_url_1', { ascending: false })
    .order('name');
    
  if (error) {
    log(`Error fetching towns: ${error.message}`);
    return;
  }
  
  log(`Found ${towns.length} towns to enrich`);
  
  let successCount = 0;
  let partialCount = 0;
  let errorCount = 0;
  let estimatedCount = 0;
  
  // Process in batches to allow for interruption
  const BATCH_SIZE = 10;
  
  for (let i = 0; i < towns.length; i++) {
    const town = towns[i];
    log(`\n[${i+1}/${towns.length}] Processing ${town.name}, ${town.state_code || ''} ${town.country}`);
    
    try {
      const updates = {};
      let gotSomeData = false;
      
      // Get climate data if missing
      if (!town.avg_temp_summer || !town.avg_temp_winter) {
        const climate = await getClimateData(town.name, town.state_code, town.country);
        
        if (climate) {
          Object.assign(updates, climate);
          gotSomeData = true;
          
          if (climate.climate_estimated) {
            estimatedCount++;
            log(`  📊 Climate: Summer ${climate.avg_temp_summer}°C, Winter ${climate.avg_temp_winter}°C (estimated)`);
          } else {
            log(`  ✓ Climate: Summer ${climate.avg_temp_summer}°C, Winter ${climate.avg_temp_winter}°C`);
          }
        } else {
          log(`  ⚠️  No climate data available`);
        }
        
        // Rate limiting
        await sleep(2000);
      }
      
      // Get geographic features if we have coordinates
      if (town.latitude && town.longitude && 
          (town.beaches_nearby === null || town.mountains_nearby === null)) {
        log(`  🗺️  Checking geographic features...`);
        const features = await getGeographicFeatures(town.latitude, town.longitude, town.name);
        
        if (features) {
          Object.assign(updates, features);
          gotSomeData = true;
          log(`  ✓ Features: Beaches ${features.beaches_nearby ? '✓' : '✗'}, Mountains ${features.mountains_nearby ? '✓' : '✗'}`);
        }
        
        await sleep(1000);
      }
      
      // Update climate classifications
      if (updates.avg_temp_summer !== undefined) {
        if (updates.avg_temp_summer >= 28) {
          updates.summer_climate_actual = 'hot';
        } else if (updates.avg_temp_summer >= 22) {
          updates.summer_climate_actual = 'warm';
        } else if (updates.avg_temp_summer >= 15) {
          updates.summer_climate_actual = 'mild';
        } else {
          updates.summer_climate_actual = 'cool';
        }
      }
      
      if (updates.avg_temp_winter !== undefined) {
        if (updates.avg_temp_winter >= 15) {
          updates.winter_climate_actual = 'mild';
        } else if (updates.avg_temp_winter >= 5) {
          updates.winter_climate_actual = 'cool';
        } else {
          updates.winter_climate_actual = 'cold';
        }
      }
      
      // Update sunshine level
      if (updates.annual_sunshine_hours) {
        if (updates.annual_sunshine_hours >= 2800) {
          updates.sunshine_level_actual = 'often_sunny';  // FIXED: was 'abundant'
        } else if (updates.annual_sunshine_hours >= 2200) {
          updates.sunshine_level_actual = 'often_sunny';  // FIXED: was 'mostly_sunny'
        } else if (updates.annual_sunshine_hours >= 1600) {
          updates.sunshine_level_actual = 'balanced';
        } else {
          updates.sunshine_level_actual = 'less_sunny';
        }
      }
      
      // Save updates if we have any
      if (Object.keys(updates).length > 0) {
        updates.data_last_updated = new Date().toISOString();
        
        const { error: updateError } = await supabase
          .from('towns')
          .update(updates)
          .eq('id', town.id);
          
        if (updateError) {
          log(`  ✗ Error updating: ${updateError.message}`);
          errorCount++;
        } else {
          if (gotSomeData) {
            if (updates.climate_estimated) {
              partialCount++;
            } else {
              successCount++;
            }
            log(`  ✅ Updated ${Object.keys(updates).length} fields`);
          }
        }
      }
      
    } catch (error) {
      log(`  ❌ Error: ${error.message}`);
      errorCount++;
      // Continue with next town
    }
    
    // Progress update
    if ((i + 1) % BATCH_SIZE === 0) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60);
      const rate = (i + 1) / (elapsed || 1);
      const remaining = Math.ceil((towns.length - i - 1) / rate);
      
      log(`\n📊 PROGRESS REPORT:`);
      log(`   Processed: ${i+1}/${towns.length} (${Math.round((i+1)/towns.length*100)}%)`);
      log(`   Success: ${successCount}, Estimated: ${estimatedCount}, Partial: ${partialCount}, Errors: ${errorCount}`);
      log(`   Time elapsed: ${elapsed} minutes`);
      log(`   Estimated remaining: ${remaining} minutes`);
      log(`   Continue processing...\n`);
    }
    
    // Longer pause every 20 requests
    if ((i + 1) % 20 === 0 && i < towns.length - 1) {
      log(`\n💤 Taking a 30-second break (being respectful to APIs)...`);
      await sleep(30000);
    }
  }
  
  log(`\n✅ ENRICHMENT COMPLETE!`);
  log(`   Total processed: ${towns.length} towns`);
  log(`   Successful: ${successCount} (real data)`);
  log(`   Estimated: ${estimatedCount} (based on nearby cities)`);
  log(`   Partial: ${partialCount} (some data)`);
  log(`   Failed: ${errorCount}`);
  
  // Summary of data coverage
  const { data: summary } = await supabase
    .from('towns')
    .select('id, avg_temp_summer, avg_temp_winter, beaches_nearby, mountains_nearby')
    .not('image_url_1', 'is', null);
    
  const withClimate = summary.filter(t => t.avg_temp_summer && t.avg_temp_winter).length;
  const withGeo = summary.filter(t => t.beaches_nearby !== null || t.mountains_nearby !== null).length;
  
  log(`\n📈 DATA COVERAGE (towns with photos):`);
  log(`   Climate data: ${withClimate}/${summary.length} (${Math.round(withClimate/summary.length*100)}%)`);
  log(`   Geographic data: ${withGeo}/${summary.length} (${Math.round(withGeo/summary.length*100)}%)`);
}

// Track start time
const startTime = Date.now();

// Run the enrichment
log('🚀 Starting Resilient Scout2Retire Data Enrichment Bot');
log('   Will try multiple data sources with fallbacks');
log('   Will estimate data when direct sources fail');
log('   Respectful rate limiting enabled\n');

enrichAllTowns()
  .then(() => {
    const totalMinutes = Math.floor((Date.now() - startTime) / 1000 / 60);
    log(`\n🎉 All done! Total time: ${totalMinutes} minutes`);
    log('   The bot has filled as much data as possible.');
    log('   Towns without direct data have estimates based on nearby cities.');
  })
  .catch(error => {
    log(`\n💥 Fatal error: ${error.message}`);
    console.error(error);
  });