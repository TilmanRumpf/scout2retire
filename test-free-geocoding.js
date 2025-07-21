// Test free geocoding services for small towns

async function testFreeGeocoding() {
  const testTowns = [
    'Lesteven, France',
    'New Port Richey, Florida',
    'Podunk, Connecticut',
    'Timbuktu, Mali'
  ];

  console.log('=== TESTING FREE GEOCODING SERVICES ===\n');

  for (const town of testTowns) {
    console.log(`\n--- ${town} ---`);
    
    // 1. Nominatim (OpenStreetMap) - Free, no API key needed
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(town)}&format=json&limit=1`;
      console.log('Fetching from Nominatim...');
      
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'Scout2Retire/1.0' // Required by Nominatim
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          console.log(`✅ Nominatim: ${data[0].lat}, ${data[0].lon}`);
          console.log(`   Display name: ${data[0].display_name}`);
          console.log(`   Type: ${data[0].type}`);
        } else {
          console.log('❌ Nominatim: No results found');
        }
      }
    } catch (error) {
      console.log('❌ Nominatim error:', error.message);
    }

    // Add delay to respect rate limits (1 request per second for Nominatim)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n=== ALTERNATIVE FREE SOURCES ===');
  console.log('1. GeoNames.org - Free with registration (20,000 requests/day)');
  console.log('2. OpenCage - Free tier (2,500 requests/day)');
  console.log('3. Mapbox - Free tier (100,000 requests/month)');
  console.log('4. HERE - Free tier (250,000 requests/month)');
  
  console.log('\n=== BULK DATA OPTIONS ===');
  console.log('1. GeoNames dump: http://download.geonames.org/export/dump/');
  console.log('   - allCountries.zip has 12M+ places with coordinates');
  console.log('   - Free to download and use');
  console.log('2. OpenStreetMap planet dump');
  console.log('3. Natural Earth Data for basic city coordinates');
}

testFreeGeocoding();