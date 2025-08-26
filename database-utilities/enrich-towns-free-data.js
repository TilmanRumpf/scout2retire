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

// Extract climate data from TimeAndDate
async function getClimateFromTimeAndDate(city, country) {
  try {
    // Format city and country for URL
    const citySlug = city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const countrySlug = country.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const url = `https://www.timeanddate.com/weather/${countrySlug}/${citySlug}/climate`;
    
    log(`Fetching climate for ${city}, ${country} from ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RetirementDataBot/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract temperature data
    const temps = [];
    $('table.zebra tbody tr').each((i, row) => {
      const label = $(row).find('th').text().trim();
      if (label.includes('Average high') || label.includes('Average low')) {
        $(row).find('td').each((j, cell) => {
          const temp = $(cell).text().match(/-?\d+/);
          if (temp) temps.push(parseInt(temp[0]));
        });
      }
    });
    
    // Calculate summer/winter averages (rough estimate)
    if (temps.length >= 24) {
      // Summer: June, July, August (indexes 11,12,13, 23,24,25)
      const summerHighs = [temps[11], temps[12], temps[13]].filter(t => !isNaN(t));
      const summerLows = [temps[23], temps[24], temps[25]].filter(t => !isNaN(t));
      
      // Winter: December, January, February (indexes 5,6,7, 17,18,19)
      const winterHighs = [temps[5], temps[6], temps[7]].filter(t => !isNaN(t));
      const winterLows = [temps[17], temps[18], temps[19]].filter(t => !isNaN(t));
      
      const avgSummer = summerHighs.length > 0 ? 
        Math.round((summerHighs.reduce((a,b) => a+b, 0) / summerHighs.length + 
                   summerLows.reduce((a,b) => a+b, 0) / summerLows.length) / 2) : null;
                   
      const avgWinter = winterHighs.length > 0 ?
        Math.round((winterHighs.reduce((a,b) => a+b, 0) / winterHighs.length + 
                   winterLows.reduce((a,b) => a+b, 0) / winterLows.length) / 2) : null;
      
      // Extract sunshine hours
      let sunshineHours = null;
      const sunshineText = $('td:contains("hours of sunshine")').text();
      const sunshineMatch = sunshineText.match(/(\d+)\s*hours/);
      if (sunshineMatch) {
        sunshineHours = parseInt(sunshineMatch[1]);
      }
      
      // Extract rainfall
      let annualRainfall = null;
      $('table.zebra td').each((i, cell) => {
        const text = $(cell).text();
        if (text.includes('mm') && text.includes('year')) {
          const match = text.match(/(\d+)\s*mm/);
          if (match) annualRainfall = parseInt(match[1]);
        }
      });
      
      return {
        avg_temp_summer: avgSummer,
        avg_temp_winter: avgWinter,
        annual_sunshine_hours: sunshineHours,
        annual_rainfall_mm: annualRainfall,
        climate_data_source: 'timeanddate.com'
      };
    }
    
    return null;
  } catch (error) {
    log(`Error fetching climate for ${city}: ${error.message}`);
    return null;
  }
}

// Get geographic features from OpenStreetMap
async function getGeographicFeatures(lat, lon, city) {
  try {
    if (!lat || !lon) {
      log(`No coordinates for ${city}, skipping geographic features`);
      return null;
    }
    
    // Query for beaches and mountains within 20km
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const query = `
      [out:json][timeout:25];
      (
        way["natural"="beach"](around:20000,${lat},${lon});
        way["natural"="coastline"](around:10000,${lat},${lon});
        node["natural"="peak"](around:30000,${lat},${lon});
        way["natural"="mountain_range"](around:30000,${lat},${lon});
      );
      out count;
    `;
    
    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const beachCount = data.elements.filter(e => 
      e.tags?.natural === 'beach' || e.tags?.natural === 'coastline'
    ).length;
    
    const mountainCount = data.elements.filter(e => 
      e.tags?.natural === 'peak' || e.tags?.natural === 'mountain_range'
    ).length;
    
    return {
      beaches_nearby: beachCount > 0,
      mountains_nearby: mountainCount > 0,
      coastal_distance_km: beachCount > 0 ? 5 : null, // Rough estimate
      geographic_data_source: 'openstreetmap'
    };
    
  } catch (error) {
    log(`Error fetching geographic features for ${city}: ${error.message}`);
    return null;
  }
}

// Main enrichment function
async function enrichAllTowns() {
  log('Starting town data enrichment process');
  
  // Get all towns with photos that need climate data
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .not('image_url_1', 'is', null)
    .or('avg_temp_summer.is.null,avg_temp_winter.is.null')
    .order('name');
    
  if (error) {
    log(`Error fetching towns: ${error.message}`);
    return;
  }
  
  log(`Found ${towns.length} towns to enrich`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < towns.length; i++) {
    const town = towns[i];
    log(`\n[${i+1}/${towns.length}] Processing ${town.name}, ${town.country}`);
    
    try {
      // Collect all updates
      const updates = {};
      
      // Get climate data if missing
      if (!town.avg_temp_summer || !town.avg_temp_winter) {
        log(`  Fetching climate data...`);
        const climate = await getClimateFromTimeAndDate(town.name, town.country);
        
        if (climate) {
          Object.assign(updates, climate);
          log(`  ✓ Climate: Summer ${climate.avg_temp_summer}°C, Winter ${climate.avg_temp_winter}°C`);
        } else {
          log(`  ✗ No climate data found`);
        }
        
        // Rate limit for TimeAndDate
        await sleep(3000);
      }
      
      // Get geographic features if we have coordinates
      if (town.latitude && town.longitude && 
          (town.beaches_nearby === null || town.mountains_nearby === null)) {
        log(`  Fetching geographic features...`);
        const features = await getGeographicFeatures(town.latitude, town.longitude, town.name);
        
        if (features) {
          Object.assign(updates, features);
          log(`  ✓ Features: Beaches ${features.beaches_nearby}, Mountains ${features.mountains_nearby}`);
        }
        
        // Rate limit for OSM
        await sleep(1000);
      }
      
      // Update climate classification based on new data
      if (updates.avg_temp_summer) {
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
      
      if (updates.avg_temp_winter) {
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
          updates.sunshine_level_actual = 'abundant';
        } else if (updates.annual_sunshine_hours >= 2200) {
          updates.sunshine_level_actual = 'mostly_sunny';
        } else if (updates.annual_sunshine_hours >= 1600) {
          updates.sunshine_level_actual = 'balanced';
        } else {
          updates.sunshine_level_actual = 'less_sunny';
        }
      }
      
      // Update rainfall level
      if (updates.annual_rainfall_mm) {
        if (updates.annual_rainfall_mm < 400) {
          updates.precipitation_level_actual = 'mostly_dry';
        } else if (updates.annual_rainfall_mm < 800) {
          updates.precipitation_level_actual = 'balanced';
        } else {
          updates.precipitation_level_actual = 'often_rainy';
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
          log(`  ✓ Successfully updated ${Object.keys(updates).length} fields`);
          successCount++;
        }
      } else {
        log(`  → No new data to update`);
      }
      
    } catch (error) {
      log(`  ✗ Error processing town: ${error.message}`);
      errorCount++;
    }
    
    // Progress update every 10 towns
    if ((i + 1) % 10 === 0) {
      log(`\n📊 Progress: ${i+1}/${towns.length} processed (${successCount} success, ${errorCount} errors)`);
    }
    
    // Longer pause every 20 requests to be respectful
    if ((i + 1) % 20 === 0) {
      log(`\n😴 Taking a 30-second break to be respectful...`);
      await sleep(30000);
    }
  }
  
  log(`\n✅ ENRICHMENT COMPLETE!`);
  log(`   Processed: ${towns.length} towns`);
  log(`   Successful: ${successCount}`);
  log(`   Errors: ${errorCount}`);
  log(`   Success rate: ${((successCount/towns.length)*100).toFixed(1)}%`);
}

// Run the enrichment
log('🚀 Starting Scout2Retire Data Enrichment Bot');
log('   This will run respectfully with proper rate limiting');
log('   Estimated time: 10-15 minutes for 70+ towns\n');

enrichAllTowns()
  .then(() => {
    log('\n🎉 All done! Good night!');
  })
  .catch(error => {
    log(`\n💥 Fatal error: ${error.message}`);
  });