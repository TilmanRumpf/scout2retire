import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function analyzeHospitalDistance() {
  console.log('🏥 Analyzing hospital distance data...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, latitude, longitude, nearest_major_hospital_km, hospital_count, population')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Analyze coverage
  const withHospitalDist = towns.filter(t => t.nearest_major_hospital_km !== null);
  const withHospitalCount = towns.filter(t => t.hospital_count !== null);
  const withCoordinates = towns.filter(t => t.latitude !== null && t.longitude !== null);
  
  console.log('📊 Healthcare Distance Data Coverage:\n');
  console.log(`nearest_major_hospital_km: ${withHospitalDist.length}/341 (${(withHospitalDist.length/341*100).toFixed(1)}%)`);
  console.log(`hospital_count: ${withHospitalCount.length}/341 (${(withHospitalCount.length/341*100).toFixed(1)}%)`);
  console.log(`coordinates (lat/lng): ${withCoordinates.length}/341 (${(withCoordinates.length/341*100).toFixed(1)}%)`);
  
  // Show sample of existing data
  console.log('\n🏥 Sample hospital distances:');
  withHospitalDist.slice(0, 10).forEach(t => {
    console.log(`${t.name}, ${t.country}: ${t.nearest_major_hospital_km} km to hospital`);
  });
  
  // Analyze by population
  console.log('\n📈 Hospital distance by town size:');
  const byPopulation = {
    small: { total: 0, withData: 0 },    // <50k
    medium: { total: 0, withData: 0 },   // 50k-200k
    large: { total: 0, withData: 0 }     // >200k
  };
  
  towns.forEach(t => {
    const size = t.population < 50000 ? 'small' : t.population < 200000 ? 'medium' : 'large';
    byPopulation[size].total++;
    if (t.nearest_major_hospital_km !== null) byPopulation[size].withData++;
  });
  
  Object.entries(byPopulation).forEach(([size, data]) => {
    console.log(`${size}: ${data.withData}/${data.total} have data`);
  });
  
  console.log('\n🌍 FREE DATA SOURCES:\n');
  
  console.log('1. **OpenStreetMap Overpass API (100% FREE)**');
  console.log('   - Query: amenity=hospital within radius');
  console.log('   - Returns: exact coordinates and names');
  console.log('   - Can calculate distances programmatically');
  console.log('   - Example: https://overpass-turbo.eu/\n');
  
  console.log('2. **Google Maps Places API (Free tier: 28,500 requests/month)**');
  console.log('   - Search for hospitals near coordinates');
  console.log('   - Returns distance and travel time');
  console.log('   - More accurate but has limits\n');
  
  console.log('3. **Simple Estimation Rules:**');
  console.log('   - Capital cities: 0-5 km (always have major hospitals)');
  console.log('   - Cities >100k population: 0-10 km');
  console.log('   - Towns 20-100k: 10-30 km');
  console.log('   - Small towns <20k: 20-50 km');
  console.log('   - Islands/remote: case by case\n');
  
  console.log(`🎯 Since we have coordinates for ${withCoordinates.length} towns,`);
  console.log('   we can use OpenStreetMap to find actual hospital distances!\n');
  
  // Show towns missing both hospital distance AND coordinates
  const missingBoth = towns.filter(t => 
    t.nearest_major_hospital_km === null && 
    (t.latitude === null || t.longitude === null)
  );
  
  console.log(`⚠️  ${missingBoth.length} towns missing both hospital distance AND coordinates`);
  if (missingBoth.length > 0 && missingBoth.length <= 10) {
    console.log('These will need manual research:');
    missingBoth.forEach(t => console.log(`- ${t.name}, ${t.country}`));
  }
}

analyzeHospitalDistance();