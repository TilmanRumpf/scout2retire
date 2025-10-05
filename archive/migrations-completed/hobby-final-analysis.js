import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function finalHobbyAnalysis() {
  console.log('🚨 FINAL HOBBY DATA QUALITY REPORT');
  console.log('==================================\n');

  try {
    // Get the complete picture
    const { data: allAssignments, error } = await supabase
      .from('towns_hobbies')
      .select(`
        town_id,
        hobbies!inner(id, name, required_conditions)
      `);

    if (error) {
      console.error('Error fetching assignments:', error);
      return;
    }

    // Count assignments per hobby
    const hobbyCounts = {};
    allAssignments.forEach(assignment => {
      const hobbyName = assignment.hobbies.name;
      hobbyCounts[hobbyName] = (hobbyCounts[hobbyName] || 0) + 1;
    });

    const sortedCounts = Object.entries(hobbyCounts)
      .sort((a, b) => b[1] - a[1]);

    console.log('🔥 CRITICAL FINDINGS:');
    console.log('=====================\n');

    console.log('1. UNIVERSALLY ASSIGNED HOBBIES (ALGORITHMIC ERROR):');
    console.log('---------------------------------------------------');
    const problematicHobbies = sortedCounts.filter(([name, count]) => count > 300);
    problematicHobbies.forEach(([name, count]) => {
      console.log(`🚨 ${name}: ${count} towns (${(count/342*100).toFixed(1)}%)`);
    });

    console.log('\n2. HOBBY DISTRIBUTION ANALYSIS:');
    console.log('-------------------------------');
    const ranges = {
      'Universal (300+)': sortedCounts.filter(([n, c]) => c >= 300).length,
      'Very High (100-299)': sortedCounts.filter(([n, c]) => c >= 100 && c < 300).length,
      'High (50-99)': sortedCounts.filter(([n, c]) => c >= 50 && c < 100).length,
      'Medium (20-49)': sortedCounts.filter(([n, c]) => c >= 20 && c < 50).length,
      'Low (10-19)': sortedCounts.filter(([n, c]) => c >= 10 && c < 20).length,
      'Very Low (1-9)': sortedCounts.filter(([n, c]) => c >= 1 && c < 10).length,
    };

    Object.entries(ranges).forEach(([range, count]) => {
      console.log(`${range}: ${count} hobbies`);
    });

    console.log('\n3. MOST REALISTIC HOBBY ASSIGNMENTS (1-20 towns):');
    console.log('------------------------------------------------');
    const realisticHobbies = sortedCounts.filter(([name, count]) => count <= 20);
    console.log(`Found ${realisticHobbies.length} hobbies with realistic assignment counts:\n`);
    realisticHobbies.slice(0, 15).forEach(([name, count]) => {
      console.log(`✅ ${name}: ${count} towns`);
    });

    console.log('\n4. INFRASTRUCTURE-DEPENDENT HOBBIES ANALYSIS:');
    console.log('--------------------------------------------');
    
    // Check winter sports in tropical locations
    const winterSports = ['Cross-country skiing', 'Ice skating', 'Alpine skiing', 'Snowboarding'];
    for (const sport of winterSports) {
      const count = hobbyCounts[sport] || 0;
      if (count > 50) {
        console.log(`⚠️  ${sport}: ${count} towns (likely includes tropical locations)`);
      }
    }

    // Check water sports assignments
    const waterSports = ['Surfing', 'Scuba diving', 'Sailing', 'Water skiing'];
    console.log('\nWater sports assignments:');
    waterSports.forEach(sport => {
      const count = hobbyCounts[sport] || 0;
      console.log(`${sport}: ${count} towns`);
    });

    console.log('\n5. SAMPLE OF PROBLEMATIC ASSIGNMENTS:');
    console.log('-----------------------------------');

    // Get some specific examples
    const { data: sampleAssignments, error: sampleError } = await supabase
      .from('towns_hobbies')
      .select(`
        towns!inner(name, country, climate_zone, average_temp_winter),
        hobbies!inner(name)
      `)
      .eq('hobbies.name', 'Cross-country skiing')
      .limit(5);

    if (!sampleError && sampleAssignments) {
      console.log('Cross-country skiing assigned to:');
      sampleAssignments.forEach(assignment => {
        const town = assignment.towns;
        console.log(`  ${town.name}, ${town.country} (${town.climate_zone}, Winter avg: ${town.average_temp_winter}°C)`);
      });
    }

    console.log('\n6. RECOMMENDATIONS:');
    console.log('==================');
    console.log('🔧 IMMEDIATE ACTIONS NEEDED:');
    console.log('1. Remove universal hobby assignments (Leather crafting, Petanque, Dog training)');
    console.log('2. Implement geography-based hobby filtering');
    console.log('3. Add climate/infrastructure validation');
    console.log('4. Review AI assignment algorithm for over-assignment');
    console.log('5. Focus on hobbies with 1-50 assignments as more realistic');

    console.log('\n📊 SUMMARY STATISTICS:');
    console.log(`Total hobby types: ${sortedCounts.length}`);
    console.log(`Total assignments: ${allAssignments.length}`);
    console.log(`Average assignments per hobby: ${(allAssignments.length / sortedCounts.length).toFixed(1)}`);
    console.log(`Problematic universal assignments: ${problematicHobbies.length}`);
    console.log(`Realistic assignments (≤20 towns): ${realisticHobbies.length}`);

  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

finalHobbyAnalysis();