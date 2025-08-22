import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function fillHumidity() {
  console.log('💧 Filling humidity average data...\n');
  console.log('Scale: 0-100% (30-50% comfortable, 60-70% moderate, 70%+ humid)\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Known humidity patterns by region/climate type
  const HUMIDITY_PATTERNS = {
    // Very humid regions (tropical, monsoon)
    veryHumid: {
      countries: ['Singapore', 'Malaysia', 'Thailand', 'Philippines', 'Indonesia', 
                  'Vietnam', 'Cambodia', 'Laos', 'Myanmar', 'Bangladesh', 'India',
                  'Fiji', 'Samoa', 'Tonga', 'Solomon Islands', 'Vanuatu',
                  'Jamaica', 'Trinidad and Tobago', 'Barbados', 'Saint Lucia'],
      coastal: 80,
      inland: 75,
      mountain: 70
    },
    
    // Humid subtropical
    humid: {
      countries: ['Japan', 'South Korea', 'Taiwan', 'Hong Kong', 
                  'United States', 'Brazil', 'Argentina', 'Uruguay',
                  'Australia', 'South Africa'],
      coastal: 75,
      inland: 65,
      mountain: 60
    },
    
    // Mediterranean climate (dry summers, mild winters)
    mediterranean: {
      countries: ['Spain', 'Portugal', 'Italy', 'Greece', 'Croatia', 'Malta',
                  'Cyprus', 'Turkey', 'Morocco', 'Tunisia', 'Israel', 'Lebanon',
                  'Chile', 'South Africa', 'Australia'],
      coastal: 65,
      inland: 55,
      mountain: 50
    },
    
    // Desert/arid regions
    arid: {
      countries: ['United Arab Emirates', 'Saudi Arabia', 'Egypt', 'Jordan',
                  'Namibia', 'Botswana', 'Mexico', 'Peru', 'Chile'],
      coastal: 60,
      inland: 30,
      mountain: 35
    },
    
    // Temperate oceanic (mild, consistent)
    oceanic: {
      countries: ['United Kingdom', 'Ireland', 'Netherlands', 'Belgium',
                  'Denmark', 'New Zealand', 'Canada', 'Iceland'],
      coastal: 75,
      inland: 70,
      mountain: 65
    },
    
    // Continental (variable)
    continental: {
      countries: ['Germany', 'Poland', 'Czech Republic', 'Austria', 'Switzerland',
                  'Hungary', 'Romania', 'Ukraine', 'Russia', 'Canada'],
      coastal: 70,
      inland: 60,
      mountain: 55
    }
  };
  
  // Specific cities with known humidity
  const CITY_HUMIDITY = {
    // Very humid cities
    'Singapore': 84, 'Bangkok': 74, 'Manila': 78, 'Ho Chi Minh City': 79,
    'Kuala Lumpur': 80, 'Jakarta': 78, 'Miami': 76, 'New Orleans': 76,
    'Houston': 75, 'Hong Kong': 78, 'Mumbai': 77, 'Chennai': 75,
    
    // Dry cities
    'Phoenix': 36, 'Las Vegas': 30, 'Dubai': 60, 'Abu Dhabi': 60,
    'Cairo': 56, 'Marrakesh': 45, 'Madrid': 57, 'Denver': 52,
    'Los Angeles': 64, 'San Diego': 68, 'Perth': 48, 'Adelaide': 48,
    
    // Moderate humidity
    'London': 71, 'Paris': 70, 'Berlin': 73, 'Amsterdam': 80,
    'New York': 68, 'Toronto': 71, 'Sydney': 65, 'Melbourne': 66,
    'Rome': 67, 'Barcelona': 69, 'Lisbon': 72, 'Athens': 60
  };
  
  const missingData = towns.filter(t => t.humidity_average === null);
  console.log(`🎯 Found ${missingData.length} towns missing humidity data\n`);
  
  const updates = [];
  
  missingData.forEach(town => {
    let humidity;
    let source = 'estimated';
    
    // Check if we have specific city data
    if (CITY_HUMIDITY[town.name]) {
      humidity = CITY_HUMIDITY[town.name];
      source = 'known city';
    }
    else {
      // Determine climate pattern
      let pattern = null;
      let locationType = 'inland'; // default
      
      // Check geographic features
      if (town.geographic_features?.includes('coastal') || 
          town.geographic_features?.includes('island')) {
        locationType = 'coastal';
      } else if (town.geographic_features?.includes('mountain') &&
                 town.elevation_meters > 1000) {
        locationType = 'mountain';
      }
      
      // Find matching pattern
      for (const [type, data] of Object.entries(HUMIDITY_PATTERNS)) {
        if (data.countries.includes(town.country)) {
          pattern = data;
          source = `${type} ${locationType}`;
          break;
        }
      }
      
      // Special cases for US regions
      if (town.country === 'United States') {
        if (['Florida', 'Louisiana', 'South Carolina', 'Georgia'].some(state => 
            ['Miami', 'Fort Myers', 'Naples', 'Orlando', 'Jacksonville', 'New Orleans', 
             'Charleston', 'Savannah', 'Myrtle Beach'].some(city => town.name.includes(city)))) {
          humidity = 75; // Southeast US is humid
          source = 'US Southeast';
        }
        else if (['Arizona', 'Nevada', 'New Mexico', 'Utah'].some(state =>
                  ['Phoenix', 'Tucson', 'Las Vegas', 'Santa Fe', 'St. George'].some(city => 
                    town.name.includes(city)))) {
          humidity = 35; // Southwest US is dry
          source = 'US Southwest';
        }
        else if (['California'].some(state =>
                  ['Los Angeles', 'San Diego', 'San Francisco', 'Santa Barbara'].some(city => 
                    town.name.includes(city)))) {
          humidity = locationType === 'coastal' ? 68 : 55;
          source = 'California ' + locationType;
        }
      }
      
      // Use pattern if found
      if (!humidity && pattern) {
        humidity = pattern[locationType];
      }
      
      // Default based on climate zone
      if (!humidity) {
        if (town.climate?.includes('Tropical')) humidity = 78;
        else if (town.climate?.includes('desert')) humidity = 35;
        else if (town.climate?.includes('Mediterranean')) humidity = 60;
        else if (town.climate?.includes('Oceanic')) humidity = 72;
        else if (town.climate?.includes('Continental')) humidity = 65;
        else humidity = 65; // Global average
        
        source = town.climate || 'default';
      }
    }
    
    console.log(`${town.name}, ${town.country}: ${humidity}% (${source})`);
    
    updates.push({
      id: town.id,
      humidity_average: humidity
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
        .update({ humidity_average: update.humidity_average })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Humidity data update complete!');
  
  // Summary statistics
  const { data: allTowns } = await supabase
    .from('towns')
    .select('humidity_average');
    
  const humidities = allTowns.map(t => t.humidity_average).filter(h => h !== null);
  const avgHumidity = Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length);
  
  const veryDry = humidities.filter(h => h < 40).length;
  const comfortable = humidities.filter(h => h >= 40 && h <= 60).length;
  const moderate = humidities.filter(h => h > 60 && h <= 70).length;
  const humid = humidities.filter(h => h > 70).length;
  
  console.log('\n📊 Humidity Distribution:');
  console.log(`Average humidity: ${avgHumidity}%`);
  console.log(`Very dry (<40%): ${veryDry} towns (${(veryDry/341*100).toFixed(1)}%)`);
  console.log(`Comfortable (40-60%): ${comfortable} towns (${(comfortable/341*100).toFixed(1)}%)`);
  console.log(`Moderate (61-70%): ${moderate} towns (${(moderate/341*100).toFixed(1)}%)`);
  console.log(`Humid (>70%): ${humid} towns (${(humid/341*100).toFixed(1)}%)`);
}

fillHumidity();