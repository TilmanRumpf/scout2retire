import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkCoverage() {
  // Get all towns
  const { data: towns } = await supabase
    .from('towns')
    .select('*')
    .order('name');
  
  // Analyze coverage
  const total = towns.length;
  const withPhotos = towns.filter(t => t.image_url_1).length;
  const withClimate = towns.filter(t => t.avg_temp_summer && t.avg_temp_winter).length;
  const withGeo = towns.filter(t => t.beaches_nearby !== null || t.mountains_nearby !== null).length;
  const withRainfall = towns.filter(t => t.annual_rainfall_mm).length;
  const withSunshine = towns.filter(t => t.annual_sunshine_hours).length;
  
  console.log('📊 SCOUT2RETIRE DATA COVERAGE REPORT\n');
  console.log(`Total towns: ${total}`);
  console.log(`\nPhoto coverage:`);
  console.log(`  - With photos: ${withPhotos} (${Math.round(withPhotos/total*100)}%)`);
  console.log(`  - Missing photos: ${total - withPhotos} (${Math.round((total-withPhotos)/total*100)}%)`);
  
  console.log(`\nClimate data coverage:`);
  console.log(`  - With temperature data: ${withClimate} (${Math.round(withClimate/total*100)}%)`);
  console.log(`  - With rainfall data: ${withRainfall} (${Math.round(withRainfall/total*100)}%)`);
  console.log(`  - With sunshine data: ${withSunshine} (${Math.round(withSunshine/total*100)}%)`);
  console.log(`  - With geographic features: ${withGeo} (${Math.round(withGeo/total*100)}%)`);
  
  // For towns with photos specifically
  const townsWithPhotos = towns.filter(t => t.image_url_1);
  const photosWithClimate = townsWithPhotos.filter(t => t.avg_temp_summer && t.avg_temp_winter).length;
  const photosWithGeo = townsWithPhotos.filter(t => t.beaches_nearby !== null || t.mountains_nearby !== null).length;
  
  console.log(`\nFor towns WITH photos (${withPhotos} towns):`);
  console.log(`  - Have climate data: ${photosWithClimate} (${Math.round(photosWithClimate/withPhotos*100)}%)`);
  console.log(`  - Have geographic data: ${photosWithGeo} (${Math.round(photosWithGeo/withPhotos*100)}%)`);
  
  // Show some examples of towns missing data
  const missingClimate = towns
    .filter(t => t.image_url_1 && (!t.avg_temp_summer || !t.avg_temp_winter))
    .slice(0, 10);
  
  if (missingClimate.length > 0) {
    console.log(`\nExamples of towns with photos but NO climate data:`);
    missingClimate.forEach(t => {
      console.log(`  - ${t.name}, ${t.state_code || ''} ${t.country}`);
    });
  }
  
  // Check data sources
  const sources = {};
  towns.forEach(t => {
    if (t.climate_data_source) {
      sources[t.climate_data_source] = (sources[t.climate_data_source] || 0) + 1;
    }
  });
  
  if (Object.keys(sources).length > 0) {
    console.log(`\nClimate data sources:`);
    Object.entries(sources)
      .sort((a, b) => b[1] - a[1])
      .forEach(([source, count]) => {
        console.log(`  - ${source}: ${count} towns`);
      });
  }
  
  // Recommendations
  console.log(`\n🎯 RECOMMENDATIONS:`);
  if (withPhotos < total * 0.5) {
    console.log(`  1. Priority: Add photos - only ${withPhotos}/${total} towns visible!`);
  }
  if (photosWithClimate < withPhotos * 0.8) {
    console.log(`  2. Add climate data for ${withPhotos - photosWithClimate} towns with photos`);
  }
  if (photosWithGeo < withPhotos * 0.5) {
    console.log(`  3. Add geographic features for ${withPhotos - photosWithGeo} towns with photos`);
  }
}

checkCoverage().catch(console.error);