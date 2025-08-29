import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🚨 CRITICAL HOBBY DATA QUALITY ISSUES FOUND');
console.log('============================================\n');

async function detailedAnalysis() {
  try {
    // Get exact counts
    const { count: totalTowns } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true });
    
    const { count: townsWithImages } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true })
      .not('image_url_1', 'is', null);
    
    const { count: totalAssignments } = await supabase
      .from('towns_hobbies')
      .select('*', { count: 'exact', head: true });
    
    const { count: totalHobbies } = await supabase
      .from('hobbies')
      .select('*', { count: 'exact', head: true });

    console.log('📊 BASIC STATISTICS:');
    console.log(`Total towns: ${totalTowns}`);
    console.log(`Towns with images: ${townsWithImages}`);
    console.log(`Total hobbies: ${totalHobbies}`);
    console.log(`Total hobby assignments: ${totalAssignments}\n`);

    // Check the most problematic hobbies
    console.log('🚨 MAJOR ISSUES IDENTIFIED:');
    console.log('============================\n');

    // Get top hobby assignments
    const { data: hobbyAssignments, error } = await supabase
      .from('towns_hobbies')
      .select(`
        hobby_id,
        hobbies!inner(name)
      `);

    if (error) {
      console.error('Error:', error);
      return;
    }

    // Count assignments per hobby
    const counts = {};
    hobbyAssignments.forEach(assignment => {
      const hobbyName = assignment.hobbies.name;
      counts[hobbyName] = (counts[hobbyName] || 0) + 1;
    });

    const sortedCounts = Object.entries(counts)
      .sort((a, b) => b[1] - a[1]);

    console.log('1. UNIVERSALLY ASSIGNED HOBBIES (Major Red Flag):');
    console.log('--------------------------------------------------');
    const universalHobbies = sortedCounts.filter(([name, count]) => count > 300);
    universalHobbies.forEach(([name, count]) => {
      const percentage = ((count / totalTowns) * 100).toFixed(1);
      console.log(`🚨 ${name}: ${count}/${totalTowns} towns (${percentage}%)`);
    });

    console.log('\n2. TOP 10 MOST ASSIGNED HOBBIES:');
    console.log('--------------------------------');
    sortedCounts.slice(0, 10).forEach(([name, count], index) => {
      const percentage = ((count / totalTowns) * 100).toFixed(1);
      console.log(`${index + 1}. ${name}: ${count} towns (${percentage}%)`);
    });

    console.log('\n3. HOBBIES ASSIGNED TO FEW TOWNS (Possibly More Realistic):');
    console.log('-----------------------------------------------------------');
    const rareHobbies = sortedCounts.filter(([name, count]) => count < 10);
    console.log(`Found ${rareHobbies.length} hobbies assigned to fewer than 10 towns:`);
    rareHobbies.slice(0, 15).forEach(([name, count]) => {
      console.log(`  ${name}: ${count} towns`);
    });

    // Check specific examples
    console.log('\n4. SAMPLE TOWN HOBBY ASSIGNMENTS:');
    console.log('----------------------------------');
    
    const { data: sampleTowns, error: sampleError } = await supabase
      .from('towns')
      .select(`
        name,
        country,
        town_hobbies!inner(
          hobbies(name)
        )
      `)
      .limit(3);

    if (!sampleError && sampleTowns) {
      sampleTowns.forEach(town => {
        console.log(`${town.name}, ${town.country}:`);
        const hobbies = town.town_hobbies.map(th => th.hobbies.name);
        console.log(`  Has ${hobbies.length} hobbies: ${hobbies.slice(0, 10).join(', ')}${hobbies.length > 10 ? '...' : ''}`);
      });
    }

    // Check for algorithmic assignments
    console.log('\n5. ALGORITHMIC ASSIGNMENT PATTERNS:');
    console.log('------------------------------------');
    
    // Check if certain hobby combinations appear together frequently
    const townHobbyMap = {};
    hobbyAssignments.forEach(assignment => {
      const townId = assignment.town_id;
      if (!townHobbyMap[townId]) townHobbyMap[townId] = [];
      townHobbyMap[townId].push(assignment.hobbies.name);
    });

    // Find towns with identical hobby sets
    const hobbySetCounts = {};
    Object.values(townHobbyMap).forEach(hobbies => {
      const sortedSet = hobbies.sort().join('|');
      hobbySetCounts[sortedSet] = (hobbySetCounts[sortedSet] || 0) + 1;
    });

    const duplicateSets = Object.entries(hobbySetCounts)
      .filter(([set, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);

    console.log(`Found ${duplicateSets.length} identical hobby sets across multiple towns:`);
    duplicateSets.slice(0, 5).forEach(([set, count]) => {
      const hobbies = set.split('|').slice(0, 5);
      console.log(`  ${count} towns with identical sets: ${hobbies.join(', ')}${set.split('|').length > 5 ? '...' : ''}`);
    });

    console.log('\n6. INFRASTRUCTURE MISMATCH ANALYSIS:');
    console.log('------------------------------------');
    
    // Check for skiing assignments in warm climates
    const skiingHobbies = ['Cross-country skiing', 'Alpine skiing', 'Ski jumping', 'Snowboarding'];
    for (const skiHobby of skiingHobbies) {
      const { data: townsWithSkiing, error: skiError } = await supabase
        .from('towns')
        .select(`
          name,
          country,
          climate_zone,
          average_temp_winter
        `)
        .in('id', 
          supabase
            .from('towns_hobbies')
            .select('town_id')
            .in('hobby_id', 
              supabase
                .from('hobbies')
                .select('id')
                .eq('name', skiHobby)
            )
        )
        .limit(5);

      if (!skiError && townsWithSkiing && townsWithSkiing.length > 0) {
        console.log(`\n${skiHobby} assigned to:`);
        townsWithSkiing.forEach(town => {
          console.log(`  ${town.name}, ${town.country} (${town.climate_zone}, Winter: ${town.average_temp_winter}°C)`);
        });
      }
    }

  } catch (error) {
    console.error('Detailed analysis failed:', error);
  }
}

detailedAnalysis();