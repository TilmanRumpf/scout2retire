import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function analyze() {
  console.log('ANALYZING CLIMATE CONFLICTS IN EUROPEAN TOWNS\n');

  // Get all towns with temperature data
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .not('avg_temp_summer', 'is', null);

  if (error) {
    console.error('Database error:', error);
    return;
  }

  console.log(`Total towns with summer temperature data: ${towns.length}\n`);

  // European countries
  const europeanCountries = ['Spain', 'France', 'Italy', 'Greece', 'Portugal', 'Netherlands'];
  
  // Filter and analyze European towns
  const europeanTowns = towns.filter(t => europeanCountries.includes(t.country));
  console.log(`European towns with temperature data: ${europeanTowns.length}\n`);

  // Helper to determine expected climate
  function getExpectedSummer(temp) {
    if (temp < 15) return 'cool';
    if (temp <= 24) return 'mild';
    if (temp <= 32) return 'warm';
    return 'hot';
  }

  function getExpectedWinter(temp) {
    if (temp < 5) return 'cold';
    if (temp <= 15) return 'cool';
    return 'mild';
  }

  // Find conflicts
  let conflicts = [];
  europeanTowns.forEach(town => {
    const expectedSummer = town.avg_temp_summer ? getExpectedSummer(town.avg_temp_summer) : null;
    const expectedWinter = town.avg_temp_winter ? getExpectedWinter(town.avg_temp_winter) : null;
    
    const summerMatch = !expectedSummer || expectedSummer === town.summer_climate_actual;
    const winterMatch = !expectedWinter || expectedWinter === town.winter_climate_actual;
    
    if (!summerMatch || !winterMatch) {
      conflicts.push({
        name: town.name,
        country: town.country,
        summerTemp: town.avg_temp_summer,
        summerActual: town.summer_climate_actual,
        summerExpected: expectedSummer,
        winterTemp: town.avg_temp_winter,
        winterActual: town.winter_climate_actual,
        winterExpected: expectedWinter,
        summerMatch,
        winterMatch
      });
    }
  });

  console.log(`Found ${conflicts.length} European towns with conflicts\n`);
  console.log('FIRST 10 EUROPEAN CONFLICTS:');
  console.log('='.repeat(80));

  conflicts.slice(0, 10).forEach((town, i) => {
    console.log(`\n${i+1}. ${town.name}, ${town.country}`);
    
    if (!town.summerMatch && town.summerTemp) {
      console.log(`   SUMMER: ${town.summerTemp}°C`);
      console.log(`   - Database says: "${town.summerActual}"`);
      console.log(`   - Temperature indicates: "${town.summerExpected}"`);
      
      // Explain the issue
      if (town.summerActual === 'hot' && town.summerTemp < 28) {
        console.log(`   - Issue: Labeled "hot" but temperature is not hot enough`);
      } else if (town.summerActual === 'warm' && town.summerTemp < 22) {
        console.log(`   - Issue: Labeled "warm" but temperature is too cool`);
      } else if (town.summerActual === 'warm' && town.summerTemp > 32) {
        console.log(`   - Issue: Labeled "warm" but temperature is actually hot`);
      } else if (town.summerActual === 'mild' && town.summerTemp > 24) {
        console.log(`   - Issue: Labeled "mild" but temperature is too warm`);
      }
    }
    
    if (!town.winterMatch && town.winterTemp) {
      console.log(`   WINTER: ${town.winterTemp}°C`);
      console.log(`   - Database says: "${town.winterActual}"`);
      console.log(`   - Temperature indicates: "${town.winterExpected}"`);
      
      // Explain the issue
      if (town.winterActual === 'mild' && town.winterTemp < 12) {
        console.log(`   - Issue: Labeled "mild" but temperature is too cold`);
      } else if (town.winterActual === 'cool' && town.winterTemp < 3) {
        console.log(`   - Issue: Labeled "cool" but temperature is actually cold`);
      } else if (town.winterActual === 'cool' && town.winterTemp > 15) {
        console.log(`   - Issue: Labeled "cool" but temperature is actually mild`);
      }
    }
  });

  // Summary by type
  console.log('\n\nCONFLICT SUMMARY:');
  console.log('='.repeat(80));
  
  const patterns = {};
  conflicts.forEach(c => {
    if (!c.summerMatch) {
      const key = `Summer: "${c.summerActual}" should be "${c.summerExpected}"`;
      patterns[key] = (patterns[key] || 0) + 1;
    }
    if (!c.winterMatch) {
      const key = `Winter: "${c.winterActual}" should be "${c.winterExpected}"`;
      patterns[key] = (patterns[key] || 0) + 1;
    }
  });
  
  Object.entries(patterns)
    .sort((a,b) => b[1] - a[1])
    .forEach(([pattern, count]) => {
      console.log(`${pattern}: ${count} towns`);
    });
}

analyze().then(() => process.exit(0));