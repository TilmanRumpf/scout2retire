import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function analyzeCultureData() {
  console.log('Analyzing Culture-Related Fields in Towns Table\n');
  console.log('='.repeat(60));
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  const total = towns.length;
  console.log(`Total towns: ${total}\n`);
  
  // Culture-related fields from the algorithm
  const cultureFields = [
    // Living Environment (20 points)
    'urban_rural_character',
    
    // Pace of Life (20 points) 
    'pace_of_life',
    'pace_of_life_actual',
    
    // Language (20 points)
    'primary_language',
    'english_proficiency',
    
    // Expat Community (10 points)
    'expat_community_size',
    
    // Dining & Nightlife (10 points)
    'restaurants_quality',
    'nightlife_options',
    'dining_scene',
    
    // Cultural Events (10 points)
    'cultural_events',
    'festivals_events',
    
    // Museums & Arts (10 points)
    'museums_arts',
    'arts_culture'
  ];
  
  const stats = {};
  
  cultureFields.forEach(field => {
    const populated = towns.filter(t => t[field] !== null && t[field] !== '').length;
    const nullCount = towns.filter(t => t[field] === null).length;
    const emptyCount = towns.filter(t => t[field] === '').length;
    const percentage = ((populated / total) * 100).toFixed(1);
    
    stats[field] = {
      populated,
      nullCount,
      emptyCount,
      percentage,
      missing: total - populated
    };
  });
  
  // Sort by worst populated first
  const sorted = Object.entries(stats).sort((a, b) => a[1].populated - b[1].populated);
  
  console.log('CULTURE MATCHING FIELDS - DATA POPULATION STATUS\n');
  console.log('Field Name                    | Populated | Missing | % Full');
  console.log('-'.repeat(60));
  
  sorted.forEach(([field, data]) => {
    const bar = '█'.repeat(Math.floor(data.percentage / 5)) + '░'.repeat(20 - Math.floor(data.percentage / 5));
    const fieldPadded = field + ' '.repeat(Math.max(0, 30 - field.length));
    const populatedPadded = ' '.repeat(Math.max(0, 9 - String(data.populated).length)) + data.populated;
    const missingPadded = ' '.repeat(Math.max(0, 7 - String(data.missing).length)) + data.missing;
    const percentPadded = ' '.repeat(Math.max(0, 5 - data.percentage.length)) + data.percentage;
    
    console.log(
      `${fieldPadded} | ${populatedPadded} | ${missingPadded} | ${percentPadded}% ${bar}`
    );
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('CRITICAL GAPS FOR CULTURE ALGORITHM:\n');
  
  // Group by algorithm component
  console.log('1. LANGUAGE (20 pts) - SEVERELY LACKING:');
  console.log(`   - primary_language: ${stats.primary_language.populated}/${total} (${stats.primary_language.percentage}%)`);
  console.log(`   - english_proficiency: ${stats.english_proficiency.populated}/${total} (${stats.english_proficiency.percentage}%)`);
  
  console.log('\n2. CULTURAL AMENITIES (30 pts total) - MOSTLY MISSING:');
  console.log(`   - dining_scene: ${stats.dining_scene.populated}/${total} (${stats.dining_scene.percentage}%)`);
  console.log(`   - nightlife_options: ${stats.nightlife_options.populated}/${total} (${stats.nightlife_options.percentage}%)`);
  console.log(`   - cultural_events: ${stats.cultural_events.populated}/${total} (${stats.cultural_events.percentage}%)`);
  console.log(`   - museums_arts: ${stats.museums_arts.populated}/${total} (${stats.museums_arts.percentage}%)`);
  
  console.log('\n3. MODERATELY POPULATED:');
  console.log(`   - urban_rural_character: ${stats.urban_rural_character.populated}/${total} (${stats.urban_rural_character.percentage}%)`);
  console.log(`   - expat_community_size: ${stats.expat_community_size.populated}/${total} (${stats.expat_community_size.percentage}%)`);
  console.log(`   - pace_of_life: ${stats.pace_of_life.populated}/${total} (${stats.pace_of_life.percentage}%)`);
  console.log(`   - pace_of_life_actual: ${stats.pace_of_life_actual.populated}/${total} (${stats.pace_of_life_actual.percentage}%)`);
  
  // Check for towns with complete culture data
  const completeTowns = towns.filter(t => 
    t.urban_rural_character && 
    (t.pace_of_life || t.pace_of_life_actual) &&
    t.primary_language &&
    t.expat_community_size
  );
  
  console.log('\n' + '='.repeat(60));
  console.log(`TOWNS WITH COMPLETE CORE CULTURE DATA: ${completeTowns.length}/${total} (${((completeTowns.length/total)*100).toFixed(1)}%)`);
  
  if (completeTowns.length > 0 && completeTowns.length <= 10) {
    console.log('\nThese towns have the most complete culture data:');
    completeTowns.forEach(t => {
      console.log(`  - ${t.name}, ${t.country}`);
    });
  }
}

analyzeCultureData();