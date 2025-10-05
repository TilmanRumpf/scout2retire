import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Regional sunshine hour averages based on climate zones
const REGIONAL_SUNSHINE = {
  // Mediterranean & Desert regions (highest)
  'Egypt': { base: 3500, variance: 200 },
  'Greece': { base: 2700, variance: 200 },
  'Spain': { base: 2800, variance: 300 },
  'Portugal': { base: 2600, variance: 200 },
  'Italy': { base: 2300, variance: 300 },
  'Croatia': { base: 2400, variance: 200 },
  'Montenegro': { base: 2400, variance: 150 },
  'Turkey': { base: 2600, variance: 200 },
  'Cyprus': { base: 3200, variance: 100 },
  'Malta': { base: 3000, variance: 100 },
  
  // Caribbean & Tropical (high)
  'Barbados': { base: 3000, variance: 100 },
  'Bahamas': { base: 2900, variance: 100 },
  'Dominican Republic': { base: 2700, variance: 150 },
  'Puerto Rico': { base: 2700, variance: 100 },
  'Mexico': { base: 2500, variance: 300 },
  'Costa Rica': { base: 2200, variance: 200 },
  'Belize': { base: 2400, variance: 150 },
  
  // US States
  'AZ': { base: 3800, variance: 100 }, // Arizona - highest
  'NV': { base: 3600, variance: 100 }, // Nevada
  'CA': { base: 3000, variance: 300 }, // California varies
  'FL': { base: 2700, variance: 200 }, // Florida
  'TX': { base: 2600, variance: 200 }, // Texas
  'CO': { base: 2800, variance: 200 }, // Colorado
  'UT': { base: 3000, variance: 200 }, // Utah
  'NM': { base: 3300, variance: 100 }, // New Mexico
  
  // Southeast Asia (moderate-high)
  'Thailand': { base: 2300, variance: 200 },
  'Malaysia': { base: 2100, variance: 150 },
  'Philippines': { base: 2000, variance: 200 },
  'Vietnam': { base: 2100, variance: 200 },
  'Indonesia': { base: 2200, variance: 150 },
  
  // Northern Europe (lower)
  'Netherlands': { base: 1600, variance: 100 },
  'Belgium': { base: 1550, variance: 100 },
  'Germany': { base: 1650, variance: 150 },
  'United Kingdom': { base: 1450, variance: 150 },
  'Ireland': { base: 1400, variance: 100 },
  'Iceland': { base: 1300, variance: 100 },
  
  // Temperate regions
  'France': { base: 2000, variance: 300 },
  'Austria': { base: 1800, variance: 200 },
  'Czech Republic': { base: 1700, variance: 100 },
  'Hungary': { base: 2000, variance: 100 },
  'Poland': { base: 1600, variance: 150 },
  
  // Southern Hemisphere
  'Australia': { base: 2500, variance: 400 },
  'New Zealand': { base: 2000, variance: 200 },
  'South Africa': { base: 2800, variance: 200 },
  'Chile': { base: 2300, variance: 300 },
  'Argentina': { base: 2400, variance: 300 },
  
  // Canada (varies by region)
  'Canada': { base: 1900, variance: 400 },
  
  // Default fallback
  'default': { base: 2200, variance: 300 }
};

// Convert 1-10 rating to annual hours
function convertRatingToHours(rating, town) {
  // Rating scale: 1 = 1000-1500 hours, 10 = 3500-4000 hours
  // But adjust based on actual regional data
  
  // Get regional baseline
  let regional = REGIONAL_SUNSHINE[town.country] || 
                 REGIONAL_SUNSHINE[town.state_code] ||
                 REGIONAL_SUNSHINE.default;
  
  // Special cases for known sunny/cloudy places
  if (town.country === 'Egypt' && (town.name === 'Sharm El Sheikh' || town.name === 'Hurghada')) {
    // These had value "11" which might mean 11 hours/day average
    return Math.round(11 * 365); // About 4015 hours
  }
  
  // For coastal vs inland adjustments
  let adjustment = 0;
  if (town.geographic_features && Array.isArray(town.geographic_features)) {
    const features = town.geographic_features.join(' ').toLowerCase();
    if (features.includes('coastal')) adjustment -= 100; // Coastal fog reduces sunshine
    if (features.includes('mountain')) adjustment -= 150; // Mountains = more clouds
    if (features.includes('desert')) adjustment += 200; // Desert = more sun
    if (features.includes('island')) adjustment -= 50; // Islands can be cloudy
  }
  
  // Convert rating to hours
  // 1-10 scale maps to percentage of regional maximum
  // rating 10 = 100% of regional max + variance
  // rating 5 = regional base
  // rating 1 = 60% of regional base
  
  let hours;
  if (rating >= 8) {
    // High sunshine (8-10)
    hours = regional.base + (regional.variance * (rating - 8) / 2);
  } else if (rating >= 5) {
    // Average sunshine (5-7)
    hours = regional.base - (regional.variance * (8 - rating) / 8);
  } else {
    // Low sunshine (1-4)
    hours = regional.base * (0.6 + (rating - 1) * 0.1);
  }
  
  hours = Math.round(hours + adjustment);
  
  // Ensure realistic bounds
  hours = Math.max(1000, Math.min(4000, hours));
  
  return hours;
}

// Calculate sunshine hours based on climate and geography
function calculateSunshineHours(town) {
  // For towns without any data, estimate based on location
  let regional = REGIONAL_SUNSHINE[town.country] || 
                 REGIONAL_SUNSHINE[town.state_code] ||
                 REGIONAL_SUNSHINE.default;
  
  let hours = regional.base;
  
  // Adjust based on climate type
  const climate = (town.climate || '').toLowerCase();
  if (climate.includes('desert') || climate.includes('arid')) hours += 400;
  else if (climate.includes('tropical')) hours -= 200;
  else if (climate.includes('mediterranean')) hours += 200;
  else if (climate.includes('continental')) hours -= 100;
  
  // Geographic adjustments
  if (town.geographic_features && Array.isArray(town.geographic_features)) {
    const features = town.geographic_features.join(' ').toLowerCase();
    if (features.includes('desert')) hours += 300;
    if (features.includes('rainforest')) hours -= 400;
    if (features.includes('coastal') && town.latitude > 40) hours -= 200; // Northern coasts are cloudier
  }
  
  return Math.max(1000, Math.min(4000, Math.round(hours)));
}

async function fixSunshineHours() {
  console.log('☀️ FIXING SUNSHINE HOURS DATA\n');
  
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
  
  let convertedCount = 0;
  let alreadyCorrect = 0;
  let addedMissing = 0;
  let errorCount = 0;
  
  const updates = [];
  
  for (const town of towns) {
    const currentValue = town.sunshine_hours;
    let newValue = currentValue;
    let action = '';
    
    if (currentValue === null || currentValue === '') {
      // Missing data - calculate based on location
      newValue = calculateSunshineHours(town);
      action = 'ADDED';
      addedMissing++;
    } else if (currentValue <= 10) {
      // 1-10 rating - convert to hours
      newValue = convertRatingToHours(currentValue, town);
      action = 'CONVERTED';
      convertedCount++;
    } else if (currentValue === 11) {
      // Special case for Egypt (11 hours/day)
      newValue = Math.round(11 * 365);
      action = 'CONVERTED';
      convertedCount++;
    } else if (currentValue < 100) {
      // Unclear value - recalculate
      newValue = calculateSunshineHours(town);
      action = 'RECALCULATED';
      convertedCount++;
    } else {
      // Already in correct format
      alreadyCorrect++;
      continue;
    }
    
    updates.push({
      town: town.name,
      country: town.country,
      oldValue: currentValue,
      newValue: newValue,
      action: action
    });
    
    // Update database
    const { error: updateError } = await supabase
      .from('towns')
      .update({ sunshine_hours: newValue })
      .eq('id', town.id);
      
    if (updateError) {
      console.log(`❌ Failed to update ${town.name}: ${updateError.message}`);
      errorCount++;
    }
  }
  
  // Show sample conversions
  console.log('📊 SAMPLE CONVERSIONS:');
  updates.slice(0, 15).forEach(u => {
    console.log(`  ${u.town}, ${u.country}: ${u.oldValue || 'null'} → ${u.newValue} hours (${u.action})`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('SUNSHINE HOURS FIX COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Converted from 1-10 scale: ${convertedCount} towns`);
  console.log(`✅ Added missing data: ${addedMissing} towns`);
  console.log(`✅ Already correct: ${alreadyCorrect} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Verify final data
  const { data: final } = await supabase
    .from('towns')
    .select('sunshine_hours');
    
  const validData = final.filter(t => t.sunshine_hours && t.sunshine_hours > 100);
  const avgHours = validData.reduce((sum, t) => sum + t.sunshine_hours, 0) / validData.length;
  
  console.log(`\n📊 FINAL STATISTICS:`);
  console.log(`  Valid data: ${validData.length}/${final.length} towns`);
  console.log(`  Average sunshine: ${Math.round(avgHours)} hours/year`);
  console.log(`  Range: ${Math.min(...validData.map(t => t.sunshine_hours))} - ${Math.max(...validData.map(t => t.sunshine_hours))} hours`);
}

// Run fix
fixSunshineHours().catch(console.error);