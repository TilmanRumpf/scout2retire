import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

console.log('🔍 Scout2Retire Hobby Data Quality Analysis');
console.log('================================================\n');

async function analyzeHobbyDataQuality() {
  try {
    // 1. Check which hobbies are most commonly assigned to towns
    console.log('1. Most commonly assigned hobbies:');
    console.log('--------------------------------');
    
    const { data: topHobbies, error: topHobbiesError } = await supabase.rpc('analyze_top_hobbies');
    
    if (topHobbiesError) {
      // Fallback to manual query if RPC doesn't exist
      const { data: hobbyStats, error } = await supabase
        .from('town_hobbies')
        .select(`
          hobby_id,
          hobbies (name)
        `);
      
      if (error) {
        console.error('Error fetching hobby stats:', error);
        return;
      }
      
      // Count hobbies manually
      const hobbyCounts = {};
      hobbyStats.forEach(th => {
        const hobbyName = th.hobbies?.name;
        if (hobbyName) {
          hobbyCounts[hobbyName] = (hobbyCounts[hobbyName] || 0) + 1;
        }
      });
      
      const sortedHobbies = Object.entries(hobbyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);
      
      sortedHobbies.forEach(([name, count]) => {
        console.log(`${name}: ${count} towns`);
      });
    } else {
      topHobbies.forEach(hobby => {
        console.log(`${hobby.name}: ${hobby.town_count} towns`);
      });
    }

    console.log('\n2. Suspicious patterns (hobbies assigned to 50+ towns):');
    console.log('-----------------------------------------------------');
    
    // Get total town count first
    const { count: totalTowns } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true })
      .not('image_url_1', 'is', null);
    
    console.log(`Total towns with images: ${totalTowns}\n`);
    
    // Get hobby statistics
    const { data: hobbyStats, error: hobbyStatsError } = await supabase
      .from('town_hobbies')
      .select(`
        hobby_id,
        hobbies (name)
      `);
    
    if (hobbyStatsError) {
      console.error('Error fetching hobby statistics:', hobbyStatsError);
    } else {
      const hobbyCounts = {};
      hobbyStats.forEach(th => {
        const hobbyName = th.hobbies?.name;
        if (hobbyName) {
          hobbyCounts[hobbyName] = (hobbyCounts[hobbyName] || 0) + 1;
        }
      });
      
      const suspiciousHobbies = Object.entries(hobbyCounts)
        .filter(([name, count]) => count > 50)
        .sort((a, b) => b[1] - a[1]);
      
      if (suspiciousHobbies.length > 0) {
        suspiciousHobbies.forEach(([name, count]) => {
          const percentage = ((count / totalTowns) * 100).toFixed(1);
          console.log(`⚠️  ${name}: ${count} towns (${percentage}% of all towns)`);
        });
      } else {
        console.log('✅ No hobbies assigned to more than 50 towns');
      }
    }

    console.log('\n3. Hobbies with specific infrastructure requirements:');
    console.log('---------------------------------------------------');
    
    const { data: hobbiesWithRequirements, error: requirementsError } = await supabase
      .from('hobbies')
      .select('name, required_conditions')
      .not('required_conditions', 'is', null)
      .limit(20);
    
    if (requirementsError) {
      console.error('Error fetching hobbies with requirements:', requirementsError);
    } else {
      if (hobbiesWithRequirements.length > 0) {
        hobbiesWithRequirements.forEach(hobby => {
          console.log(`${hobby.name}: ${hobby.required_conditions}`);
        });
      } else {
        console.log('ℹ️  No hobbies have specific infrastructure requirements documented');
      }
    }

    console.log('\n4. Water sports assignments for coastal towns:');
    console.log('--------------------------------------------');
    
    const { data: coastalTowns, error: coastalError } = await supabase
      .from('towns')
      .select(`
        id,
        name,
        country,
        geographic_features_actual
      `)
      .contains('geographic_features_actual', ['Coastal'])
      .limit(10);
    
    if (coastalError) {
      console.error('Error fetching coastal towns:', coastalError);
    } else {
      console.log(`Found ${coastalTowns.length} coastal towns:\n`);
      
      for (const town of coastalTowns) {
        const { data: townHobbies, error: townHobbiesError } = await supabase
          .from('town_hobbies')
          .select(`
            hobbies (name)
          `)
          .eq('town_id', town.id);
        
        if (townHobbiesError) {
          console.error(`Error fetching hobbies for ${town.name}:`, townHobbiesError);
          continue;
        }
        
        const waterSportsHobbies = ['Swimming', 'Sailing', 'Surfing', 'Fishing', 'Diving', 'Kayaking', 'Snorkeling', 'Water Sports'];
        const townWaterSports = townHobbies
          .map(th => th.hobbies?.name)
          .filter(name => waterSportsHobbies.includes(name));
        
        console.log(`${town.name}, ${town.country}:`);
        if (townWaterSports.length > 0) {
          console.log(`  ✅ Water sports: ${townWaterSports.join(', ')}`);
        } else {
          console.log(`  ⚠️  No water sports assigned (despite being coastal)`);
        }
      }
    }

    console.log('\n5. Additional Data Quality Checks:');
    console.log('----------------------------------');
    
    // Check for towns without any hobbies
    const { data: townsWithoutHobbies, error: noHobbiesError } = await supabase
      .from('towns')
      .select(`
        id,
        name,
        country,
        town_hobbies (hobby_id)
      `)
      .is('town_hobbies.hobby_id', null)
      .limit(5);
    
    if (noHobbiesError) {
      console.error('Error checking towns without hobbies:', noHobbiesError);
    } else {
      console.log(`Towns without hobbies assigned: ${townsWithoutHobbies.length}`);
      if (townsWithoutHobbies.length > 0) {
        townsWithoutHobbies.forEach(town => {
          console.log(`  ⚠️  ${town.name}, ${town.country}`);
        });
      }
    }
    
    // Check hobby distribution statistics
    const { data: allHobbies, error: allHobbiesError } = await supabase
      .from('hobbies')
      .select('id, name');
    
    if (!allHobbiesError && allHobbies) {
      console.log(`\nTotal hobbies in database: ${allHobbies.length}`);
      
      const { data: totalAssignments, error: assignmentsError } = await supabase
        .from('town_hobbies')
        .select('*', { count: 'exact', head: true });
      
      if (!assignmentsError) {
        console.log(`Total hobby assignments: ${totalAssignments}`);
        console.log(`Average hobbies per town: ${(totalAssignments / totalTowns).toFixed(1)}`);
      }
    }

  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

// Run the analysis
analyzeHobbyDataQuality();