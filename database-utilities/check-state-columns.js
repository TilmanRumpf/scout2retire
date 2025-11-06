import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNzk1MywiZXhwIjoyMDcyNjgzOTUzfQ.Oy-MblIo6xNvNI6KJwsjrU9uO17rWko_p08fZHY1uyE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStateColumns() {
  console.log('🔍 Investigating state information in database...\n');

  // First, let's see what a single town record looks like
  console.log('📋 Checking available columns (first town):');
  const { data: sampleTown, error: sampleError } = await supabase
    .from('towns')
    .select('*')
    .limit(1);

  if (sampleError) {
    console.error('❌ Error querying sample town:', sampleError);
  } else if (sampleTown && sampleTown[0]) {
    const columns = Object.keys(sampleTown[0]);
    const stateRelatedColumns = columns.filter(col =>
      col.toLowerCase().includes('state') ||
      col.toLowerCase().includes('region') ||
      col.toLowerCase().includes('province')
    );
    console.log('State-related columns found:', stateRelatedColumns);
    console.log('Total columns:', columns.length);
  }

  // Check for all Gainesvilles with whatever columns exist
  console.log('\n📍 Searching for all Gainesville towns:');
  const { data: gainesvilles, error: gainesvilleError } = await supabase
    .from('towns')
    .select('id, town_name, country, region')
    .ilike('town_name', '%gainesville%');

  if (gainesvilleError) {
    console.error('❌ Error querying Gainesvilles:', gainesvilleError);
  } else {
    console.log(`Found ${gainesvilles.length} Gainesville(s):`);
    gainesvilles.forEach(town => {
      console.log(`  - ${town.town_name}, ${town.country} (region: ${town.region || 'none'})`);
    });
  }

  // Check if there's a separate states or regions table
  console.log('\n🗂️  Checking for other tables with state information:');
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .ilike('table_name', '%state%');

  if (!tablesError && tables) {
    console.log('Tables with "state" in name:', tables.map(t => t.table_name));
  }

  // Also check for region tables
  const { data: regionTables, error: regionError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .ilike('table_name', '%region%');

  if (!regionError && regionTables) {
    console.log('Tables with "region" in name:', regionTables.map(t => t.table_name));
  }

  // Check sample US towns to see region format
  console.log('\n🇺🇸 Sample US towns and their region values:');
  const { data: usSample, error: usError } = await supabase
    .from('towns')
    .select('town_name, country, region, geo_region')
    .eq('country', 'United States')
    .limit(20);

  if (usError) {
    console.error('❌ Error querying US towns:', usError);
  } else {
    usSample.forEach(town => {
      console.log(`  - ${town.town_name}: region="${town.region}", geo_region="${town.geo_region}"`);
    });
  }

  // Count total US towns
  const { count: usCount } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
    .eq('country', 'United States');

  console.log(`\n📊 Total US towns in database: ${usCount || 0}`);

  // Check international towns
  console.log('\n🌍 Sample international towns and their region values:');
  const { data: intlSample, error: intlError } = await supabase
    .from('towns')
    .select('town_name, country, region, geo_region')
    .neq('country', 'United States')
    .limit(30);

  if (intlError) {
    console.error('❌ Error querying international towns:', intlError);
  } else {
    intlSample.forEach(town => {
      console.log(`  - ${town.town_name}, ${town.country}: region="${town.region || 'NULL'}", geo_region="${town.geo_region || 'NULL'}"`);
    });
  }

  // Count by country
  console.log('\n🌎 Towns by country:');
  const { data: allTowns } = await supabase
    .from('towns')
    .select('country');

  if (allTowns) {
    const countryCounts = {};
    allTowns.forEach(town => {
      countryCounts[town.country] = (countryCounts[town.country] || 0) + 1;
    });

    Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([country, count]) => {
        console.log(`  - ${country}: ${count} towns`);
      });
  }

  // Check for duplicate town names in US
  console.log('\n🔍 Checking for duplicate town names in US:');
  const { data: allUSTowns } = await supabase
    .from('towns')
    .select('town_name, region')
    .eq('country', 'United States');

  if (allUSTowns) {
    const nameCounts = {};
    allUSTowns.forEach(town => {
      nameCounts[town.town_name] = (nameCounts[town.town_name] || 0) + 1;
    });

    const duplicates = Object.entries(nameCounts).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log('US towns with duplicate names:');
      duplicates.forEach(([name, count]) => {
        console.log(`  - ${name}: ${count} occurrences`);
        const instances = allUSTowns.filter(t => t.town_name === name);
        instances.forEach(inst => console.log(`    → ${inst.region}`));
      });
    } else {
      console.log('✅ No duplicate town names in US');
    }
  }

  // Check for duplicate town names GLOBALLY
  console.log('\n🌍 Checking for duplicate town names globally (any country):');
  if (allTowns) {
    const { data: allTownsWithDetails } = await supabase
      .from('towns')
      .select('town_name, country, region');

    if (allTownsWithDetails) {
      const globalNameCounts = {};
      allTownsWithDetails.forEach(town => {
        globalNameCounts[town.town_name] = (globalNameCounts[town.town_name] || 0) + 1;
      });

      const globalDuplicates = Object.entries(globalNameCounts).filter(([_, count]) => count > 1);
      if (globalDuplicates.length > 0) {
        console.log('Towns with duplicate names across countries:');
        globalDuplicates.forEach(([name, count]) => {
          console.log(`  - ${name}: ${count} occurrences`);
          const instances = allTownsWithDetails.filter(t => t.town_name === name);
          instances.forEach(inst => console.log(`    → ${inst.country}, ${inst.region || 'no region'}`));
        });
      } else {
        console.log('✅ No duplicate town names globally');
      }
    }
  }
}

checkStateColumns();
