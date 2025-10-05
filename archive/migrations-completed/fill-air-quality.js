import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function fillAirQuality() {
  console.log('🌬️ Filling air quality index data...\n');
  console.log('Note: AQI scale: 0-50 (Good), 51-100 (Moderate), 101-150 (Unhealthy for sensitive), 151-200 (Unhealthy), 201+ (Very unhealthy)\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Cities with known air quality issues
  const POOR_AIR_QUALITY = {
    // Asia - often polluted
    'Delhi': 180, 'Mumbai': 150, 'Beijing': 160, 'Shanghai': 140,
    'Bangkok': 100, 'Ho Chi Minh City': 95, 'Hanoi': 110,
    'Manila': 90, 'Jakarta': 120, 'Dhaka': 190,
    'Kathmandu': 140, 'Ulaanbaatar': 200,
    
    // Middle East
    'Cairo': 130, 'Dubai': 85, 'Abu Dhabi': 80,
    'Kuwait City': 150, 'Riyadh': 140, 'Tehran': 160,
    
    // Americas
    'Mexico City': 100, 'Santiago': 90, 'Lima': 95,
    'São Paulo': 85, 'Los Angeles': 70, 'Phoenix': 65
  };
  
  // Cities with excellent air quality
  const EXCELLENT_AIR = {
    // Clean island/coastal cities
    'Honolulu': 25, 'Reykjavik': 20, 'Wellington': 25,
    'Hobart': 20, 'Victoria': 25, 'Funchal': 30,
    'Ponta Delgada': 25, 'Hamilton': 30,
    
    // Nordic cities
    'Copenhagen': 30, 'Stockholm': 25, 'Oslo': 25,
    'Helsinki': 25, 'Tallinn': 30,
    
    // Clean mountain towns
    'Zurich': 35, 'Innsbruck': 30, 'Queenstown': 20,
    'Bariloche': 25, 'Cusco': 40
  };
  
  // Country baselines
  const COUNTRY_BASELINES = {
    // Clean countries
    'Iceland': 25, 'New Zealand': 30, 'Estonia': 35,
    'Finland': 30, 'Canada': 35, 'Sweden': 30,
    'Norway': 30, 'Australia': 40, 'Ireland': 35,
    'Denmark': 35, 'Switzerland': 40, 'Uruguay': 45,
    
    // Moderate
    'United States': 50, 'United Kingdom': 45, 'France': 45,
    'Germany': 45, 'Spain': 50, 'Portugal': 45,
    'Japan': 55, 'South Korea': 60, 'Singapore': 55,
    'Netherlands': 45, 'Belgium': 50, 'Austria': 40,
    
    // Higher pollution
    'Thailand': 75, 'Vietnam': 80, 'Malaysia': 70,
    'Philippines': 75, 'Indonesia': 85, 'Mexico': 70,
    'Colombia': 60, 'Peru': 65, 'Chile': 65,
    'Brazil': 65, 'Argentina': 55, 'Turkey': 70,
    'Greece': 55, 'Italy': 55, 'Poland': 65,
    
    // Poor air quality
    'India': 120, 'China': 100, 'Egypt': 90,
    'Pakistan': 130, 'Bangladesh': 140,
    'Nepal': 100, 'Myanmar': 85,
    
    // Default
    'default': 60
  };
  
  const missingData = towns.filter(t => t.air_quality_index === null);
  console.log(`🎯 Found ${missingData.length} towns missing air quality index\n`);
  
  const updates = [];
  
  missingData.forEach(town => {
    let aqi;
    let reason;
    
    // Check known cities first
    if (POOR_AIR_QUALITY[town.name]) {
      aqi = POOR_AIR_QUALITY[town.name];
      reason = 'known polluted city';
    }
    else if (EXCELLENT_AIR[town.name]) {
      aqi = EXCELLENT_AIR[town.name];
      reason = 'known clean air city';
    }
    else {
      // Start with country baseline
      aqi = COUNTRY_BASELINES[town.country] || COUNTRY_BASELINES.default;
      
      // Adjust based on factors
      // Coastal areas typically cleaner
      if (town.geographic_features?.includes('coastal') || 
          town.geographic_features?.includes('island')) {
        aqi = Math.round(aqi * 0.8);
        reason = 'coastal/island';
      }
      // Mountain areas usually cleaner (except inversions)
      else if (town.geographic_features?.includes('mountain') && 
               town.elevation_meters > 1000) {
        aqi = Math.round(aqi * 0.85);
        reason = 'mountain town';
      }
      // Large cities typically worse
      else if (town.population > 1000000) {
        aqi = Math.round(aqi * 1.3);
        reason = 'large city';
      }
      // Small towns typically better
      else if (town.population < 50000) {
        aqi = Math.round(aqi * 0.9);
        reason = 'small town';
      }
      else {
        reason = 'country baseline';
      }
      
      // Industrial areas worse
      if (town.name.includes('Port') || town.name.includes('Industrial')) {
        aqi = Math.round(aqi * 1.2);
      }
      
      // Ensure reasonable range
      aqi = Math.max(15, Math.min(200, aqi));
    }
    
    console.log(`${town.name}, ${town.country}: ${aqi} AQI (${reason})`);
    
    updates.push({
      id: town.id,
      air_quality_index: aqi
    });
  });
  
  console.log(`\n💾 Ready to update ${updates.length} towns`);
  
  // Update in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    for (const update of batch) {
      const { error } = await supabase
        .from('towns')
        .update({ air_quality_index: update.air_quality_index })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Air quality index update complete!');
  
  // Verify
  const { data: verification } = await supabase
    .from('towns')
    .select('air_quality_index')
    .is('air_quality_index', null);
    
  console.log(`\n📊 Remaining towns without air quality index: ${verification?.length || 0}`);
  
  // Summary statistics
  const { data: allTowns } = await supabase
    .from('towns')
    .select('air_quality_index');
    
  const aqiValues = allTowns.map(t => t.air_quality_index).filter(v => v !== null);
  const avgAqi = Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length);
  const goodAir = aqiValues.filter(v => v <= 50).length;
  const moderateAir = aqiValues.filter(v => v > 50 && v <= 100).length;
  const unhealthyAir = aqiValues.filter(v => v > 100).length;
  
  console.log('\n📊 Air Quality Summary:');
  console.log(`Average AQI: ${avgAqi}`);
  console.log(`Good air (≤50): ${goodAir} towns (${(goodAir/341*100).toFixed(1)}%)`);
  console.log(`Moderate (51-100): ${moderateAir} towns (${(moderateAir/341*100).toFixed(1)}%)`);
  console.log(`Unhealthy (>100): ${unhealthyAir} towns (${(unhealthyAir/341*100).toFixed(1)}%)`);
}

fillAirQuality();