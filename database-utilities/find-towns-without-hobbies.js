#!/usr/bin/env node

// Find specific towns that are missing hobby assignments
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function findTownsWithoutHobbies() {
  console.log('🔍 FINDING TOWNS WITHOUT HOBBY ASSIGNMENTS');
  console.log('=' .repeat(80));
  
  try {
    // First, get total count of all towns
    console.log('\n📊 TOTAL TOWNS COUNT:');
    console.log('-'.repeat(40));
    
    const { count: totalTowns, error: countError } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting towns:', countError);
      return;
    }
    
    console.log(`Total towns in database: ${totalTowns}`);
    
    // Get towns that have hobby assignments
    console.log('\n📊 TOWNS WITH HOBBY ASSIGNMENTS:');
    console.log('-'.repeat(40));
    
    const { data: townsWithHobbies, error: hobbiesError } = await supabase
      .from('towns_hobbies')
      .select('town_id')
      .order('town_id');
    
    if (hobbiesError) {
      console.error('❌ Error getting towns with hobbies:', hobbiesError);
      return;
    }
    
    // Get unique town IDs that have hobbies
    const uniqueTownIdsWithHobbies = [...new Set(townsWithHobbies.map(th => th.town_id))];
    console.log(`Towns with hobby assignments: ${uniqueTownIdsWithHobbies.length}`);
    console.log(`Total hobby assignment entries: ${townsWithHobbies.length}`);
    
    // Calculate how many towns are missing hobbies
    const townsMissingHobbies = totalTowns - uniqueTownIdsWithHobbies.length;
    console.log(`Towns missing hobbies: ${townsMissingHobbies}`);
    
    // Get all town IDs and names
    console.log('\n📊 FINDING SPECIFIC TOWNS WITHOUT HOBBIES:');
    console.log('-'.repeat(40));
    
    const { data: allTowns, error: allTownsError } = await supabase
      .from('towns')
      .select('id, name, state, country')
      .order('id');
    
    if (allTownsError) {
      console.error('❌ Error getting all towns:', allTownsError);
      return;
    }
    
    // Find towns without hobbies
    const townsWithoutHobbies = allTowns.filter(town => 
      !uniqueTownIdsWithHobbies.includes(town.id)
    );
    
    console.log(`\n🎯 EXACT TOWNS MISSING HOBBY ASSIGNMENTS (${townsWithoutHobbies.length}):`);
    console.log('='.repeat(80));
    
    if (townsWithoutHobbies.length === 0) {
      console.log('✅ All towns have hobby assignments!');
    } else {
      // Show first 10 towns without hobbies
      console.log('\n📋 FIRST 10 TOWNS WITHOUT HOBBIES:');
      console.log('-'.repeat(60));
      
      townsWithoutHobbies.slice(0, 10).forEach((town, index) => {
        console.log(`${index + 1}. ID: ${town.id} | Name: ${town.name} | State: ${town.state_code} | Country: ${town.country}`);
      });
      
      if (townsWithoutHobbies.length > 10) {
        console.log(`\n... and ${townsWithoutHobbies.length - 10} more towns`);
      }
      
      // Analyze patterns
      console.log('\n📊 PATTERN ANALYSIS:');
      console.log('-'.repeat(40));
      
      // Count by country
      const countryStats = {};
      townsWithoutHobbies.forEach(town => {
        countryStats[town.country] = (countryStats[town.country] || 0) + 1;
      });
      
      console.log('\n🌍 By Country:');
      Object.entries(countryStats).forEach(([country, count]) => {
        console.log(`  ${country}: ${count} towns`);
      });
      
      // Count by state (for US towns)
      const stateStats = {};
      townsWithoutHobbies
        .filter(town => town.country === 'United States')
        .forEach(town => {
          stateStats[town.state_code] = (stateStats[town.state_code] || 0) + 1;
        });
      
      if (Object.keys(stateStats).length > 0) {
        console.log('\n🇺🇸 US States:');
        Object.entries(stateStats)
          .sort((a, b) => b[1] - a[1]) // Sort by count descending
          .forEach(([state, count]) => {
            console.log(`  ${state}: ${count} towns`);
          });
      }
      
      // Show ALL towns without hobbies
      console.log('\n📋 COMPLETE LIST OF ALL TOWNS WITHOUT HOBBIES:');
      console.log('='.repeat(80));
      
      townsWithoutHobbies.forEach((town, index) => {
        console.log(`${index + 1}. ID: ${town.id} | Name: ${town.name} | State: ${town.state_code} | Country: ${town.country}`);
      });
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📋 SUMMARY:');
    console.log('-'.repeat(40));
    console.log(`Total towns in database: ${totalTowns}`);
    console.log(`Towns with hobby assignments: ${uniqueTownIdsWithHobbies.length}`);
    console.log(`Towns WITHOUT hobby assignments: ${townsWithoutHobbies.length}`);
    console.log(`Percentage missing: ${((townsWithoutHobbies.length / totalTowns) * 100).toFixed(1)}%`);
    
    if (townsWithoutHobbies.length > 0) {
      console.log('\n🎯 NEXT STEPS:');
      console.log('1. Review the towns listed above');
      console.log('2. Check if there\'s a pattern (geography, size, etc.)');
      console.log('3. Determine why these towns were excluded from hobby assignments');
      console.log('4. Add appropriate hobbies for these towns');
    }
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
  }
}

// Run the analysis
findTownsWithoutHobbies();