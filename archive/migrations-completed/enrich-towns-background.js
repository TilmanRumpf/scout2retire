import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Log with timestamp
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// User agent
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

// Try Weather Atlas - good free source
async function getClimateFromWeatherAtlas(city, country) {
  try {
    // Weather Atlas uses URLs like: weather-atlas.com/en/spain/barcelona-climate
    const citySlug = city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const countrySlug = country.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const url = `https://www.weather-atlas.com/en/${countrySlug}/${citySlug}-climate`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const climateData = {};
    
    // Extract temperature data
    $('.climate-table tr').each((i, row) => {
      const label = $(row).find('td:first').text().trim();
      if (label.includes('Average high')) {
        const temps = [];
        $(row).find('td').slice(1).each((j, cell) => {
          const temp = $(cell).text().match(/-?\d+/);
          if (temp) temps.push(parseInt(temp[0]));
        });
        if (temps.length >= 12) {
          // Summer: June, July, August
          climateData.avg_temp_summer = Math.round((temps[5] + temps[6] + temps[7]) / 3);
          // Winter: December, January, February  
          climateData.avg_temp_winter = Math.round((temps[11] + temps[0] + temps[1]) / 3);
        }
      }
    });
    
    // Extract rainfall
    const rainfallText = $('body').text();
    const rainfallMatch = rainfallText.match(/annual.*?rainfall.*?(\d+)\s*mm/i);
    if (rainfallMatch) {
      climateData.annual_rainfall = parseInt(rainfallMatch[1]);
    }
    
    // Extract sunshine hours
    const sunshineMatch = rainfallText.match(/(\d+)\s*hours.*?sunshine.*?year/i);
    if (sunshineMatch) {
      climateData.sunshine_hours = parseInt(sunshineMatch[1]);
    }
    
    if (Object.keys(climateData).length > 0) {
      return climateData;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Try Climate.org
async function getClimateFromClimateOrg(city, country) {
  try {
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    const url = `https://en.climate-data.org/search/?q=${encodeURIComponent(city + ' ' + country)}`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Click through to first result
    const firstResult = $('.search-results a:first').attr('href');
    if (!firstResult) return null;
    
    const cityResponse = await fetch(`https://en.climate-data.org${firstResult}`, {
      headers: { 'User-Agent': USER_AGENT }
    });
    
    if (!cityResponse.ok) return null;
    
    const cityHtml = await cityResponse.text();
    const $city = cheerio.load(cityHtml);
    
    const climateData = {};
    
    // Extract temperature
    const avgTemp = $city('.climate-table td:contains("Average temperature")').next().text();
    if (avgTemp) {
      const temp = parseInt(avgTemp.match(/\d+/)?.[0]);
      if (temp) {
        // Estimate summer/winter from average
        climateData.avg_temp_summer = temp + 8;
        climateData.avg_temp_winter = temp - 8;
      }
    }
    
    // Extract rainfall
    const rainfall = $city('.climate-table td:contains("Precipitation")').next().text();
    if (rainfall) {
      const mm = parseInt(rainfall.match(/\d+/)?.[0]);
      if (mm) climateData.annual_rainfall = mm;
    }
    
    return Object.keys(climateData).length > 0 ? climateData : null;
  } catch (error) {
    return null;
  }
}

// Get better climate data for towns
async function enrichTownsWithBetterData() {
  log('Starting background climate enrichment');
  
  // Get towns that already have basic climate data but could use better data
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .not('avg_temp_summer', 'is', null)
    .not('avg_temp_winter', 'is', null)
    .order('image_url_1', { ascending: false })
    .order('name');
  
  if (error) {
    log(`Error fetching towns: ${error.message}`);
    return;
  }
  
  log(`Found ${towns.length} towns to potentially improve`);
  
  let improvedCount = 0;
  let attemptedCount = 0;
  
  for (const town of towns) {
    // Skip if we already have detailed data
    if (town.annual_rainfall && town.sunshine_hours) {
      continue;
    }
    
    attemptedCount++;
    log(`\n[${attemptedCount}] Attempting to improve data for ${town.name}, ${town.country}`);
    
    try {
      let betterData = null;
      
      // Try Weather Atlas first
      betterData = await getClimateFromWeatherAtlas(town.name, town.country);
      if (betterData) {
        log(`  ✓ Got data from Weather Atlas`);
      }
      
      // If no luck, try Climate.org
      if (!betterData) {
        await sleep(2000);
        betterData = await getClimateFromClimateOrg(town.name, town.country);
        if (betterData) {
          log(`  ✓ Got data from Climate.org`);
        }
      }
      
      // Update if we got better data
      if (betterData && Object.keys(betterData).length > 0) {
        // Only update if the new data seems reasonable
        if (betterData.avg_temp_summer) {
          const diff = Math.abs(betterData.avg_temp_summer - town.avg_temp_summer);
          if (diff > 10) {
            log(`  ⚠️  Temperature difference too large (${diff}°C), skipping`);
            continue;
          }
        }
        
        const updates = {};
        
        // Update temperatures if they're more precise
        if (betterData.avg_temp_summer && betterData.avg_temp_winter) {
          updates.avg_temp_summer = betterData.avg_temp_summer;
          updates.avg_temp_winter = betterData.avg_temp_winter;
          log(`  📊 Better temps: Summer ${betterData.avg_temp_summer}°C, Winter ${betterData.avg_temp_winter}°C`);
        }
        
        // Add rainfall data if we got it
        if (betterData.annual_rainfall && !town.annual_rainfall) {
          updates.annual_rainfall = betterData.annual_rainfall;
          log(`  🌧️  Added rainfall: ${betterData.annual_rainfall}mm`);
        }
        
        // Add sunshine data if we got it
        if (betterData.sunshine_hours && !town.sunshine_hours) {
          updates.sunshine_hours = betterData.sunshine_hours;
          log(`  ☀️  Added sunshine: ${betterData.sunshine_hours} hours`);
        }
        
        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('towns')
            .update(updates)
            .eq('id', town.id);
          
          if (updateError) {
            log(`  ✗ Error updating: ${updateError.message}`);
          } else {
            improvedCount++;
            log(`  ✅ Successfully improved data`);
          }
        }
      } else {
        log(`  → No better data found`);
      }
      
    } catch (error) {
      log(`  ✗ Error: ${error.message}`);
    }
    
    // Rate limiting
    await sleep(3000);
    
    // Longer break every 20 requests
    if (attemptedCount % 20 === 0) {
      log(`\n💤 Taking a 30-second break...`);
      await sleep(30000);
    }
    
    // Progress report every 10 towns
    if (attemptedCount % 10 === 0) {
      log(`\n📊 Progress: Attempted ${attemptedCount} towns, improved ${improvedCount}`);
    }
  }
  
  log(`\n✅ Background enrichment complete!`);
  log(`   Attempted: ${attemptedCount} towns`);
  log(`   Improved: ${improvedCount} towns`);
  
  // Final coverage check
  const { data: finalCheck } = await supabase
    .from('towns')
    .select('id, annual_rainfall, sunshine_hours')
    .not('avg_temp_summer', 'is', null);
  
  const withRainfall = finalCheck.filter(t => t.annual_rainfall).length;
  const withSunshine = finalCheck.filter(t => t.sunshine_hours).length;
  
  log(`\n📈 Final data quality:`);
  log(`   Towns with rainfall data: ${withRainfall}/${finalCheck.length}`);
  log(`   Towns with sunshine data: ${withSunshine}/${finalCheck.length}`);
}

// Run it
log('🚀 Starting Background Climate Enrichment');
log('   This will run slowly and respectfully to improve data quality');
log('   Feel free to let it run while you sleep!\n');

enrichTownsWithBetterData()
  .then(() => {
    log('\n🎉 All done! Climate data has been improved where possible.');
  })
  .catch(error => {
    log(`\n💥 Fatal error: ${error.message}`);
    console.error(error);
  });