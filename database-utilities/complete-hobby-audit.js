import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function completeAudit() {
  console.log('🔍 COMPLETE HOBBY DATA AUDIT');
  console.log('============================\n');

  try {
    // Get all data at once
    const [
      { data: allAssignments, error: assignmentsError },
      { data: allHobbies, error: hobbiesError },
      { count: totalTowns },
      { count: totalAssignments }
    ] = await Promise.all([
      supabase.from('town_hobbies').select('town_id, hobby_id'),
      supabase.from('hobbies').select('id, name, required_conditions'),
      supabase.from('towns').select('*', { count: 'exact', head: true }),
      supabase.from('town_hobbies').select('*', { count: 'exact', head: true })
    ]);

    if (assignmentsError || hobbiesError) {
      console.error('Errors:', assignmentsError, hobbiesError);
      return;
    }

    console.log('📊 BASIC STATISTICS:');
    console.log('====================');
    console.log(`Total towns: ${totalTowns}`);
    console.log(`Total hobbies in catalog: ${allHobbies.length}`);
    console.log(`Total hobby assignments: ${totalAssignments}`);
    console.log(`Average hobbies per town: ${(totalAssignments / totalTowns).toFixed(1)}\n`);

    // Create hobby name map
    const hobbyMap = {};
    allHobbies.forEach(hobby => {
      hobbyMap[hobby.id] = hobby.name;
    });

    // Count assignments per hobby
    const hobbyCounts = {};
    allAssignments.forEach(assignment => {
      const hobbyName = hobbyMap[assignment.hobby_id];
      if (hobbyName) {
        hobbyCounts[hobbyName] = (hobbyCounts[hobbyName] || 0) + 1;
      }
    });

    const sortedCounts = Object.entries(hobbyCounts)
      .sort((a, b) => b[1] - a[1]);

    console.log('🚨 CRITICAL DATA QUALITY ISSUES:');
    console.log('=================================');
    
    // Universal assignments (>90% of towns)
    const universalThreshold = Math.floor(totalTowns * 0.9);
    const universalHobbies = sortedCounts.filter(([name, count]) => count >= universalThreshold);
    
    console.log(`1. UNIVERSALLY ASSIGNED HOBBIES (≥${universalThreshold} towns / ≥90%):`);
    console.log('--------------------------------------------------------');
    if (universalHobbies.length > 0) {
      universalHobbies.forEach(([name, count]) => {
        const percentage = (count / totalTowns * 100).toFixed(1);
        console.log(`🚨 ${name}: ${count}/${totalTowns} towns (${percentage}%)`);
      });
    } else {
      console.log('✅ No universally assigned hobbies found');
    }

    // Check assignment distribution
    console.log('\n2. HOBBY ASSIGNMENT DISTRIBUTION:');
    console.log('----------------------------------');
    const ranges = [
      { label: 'Universal (≥90%)', min: Math.floor(totalTowns * 0.9), max: totalTowns },
      { label: 'Very High (50-89%)', min: Math.floor(totalTowns * 0.5), max: Math.floor(totalTowns * 0.89) },
      { label: 'High (25-49%)', min: Math.floor(totalTowns * 0.25), max: Math.floor(totalTowns * 0.49) },
      { label: 'Medium (10-24%)', min: Math.floor(totalTowns * 0.1), max: Math.floor(totalTowns * 0.24) },
      { label: 'Realistic (1-9%)', min: 1, max: Math.floor(totalTowns * 0.09) },
      { label: 'Unused', min: 0, max: 0 }
    ];

    ranges.forEach(range => {
      const count = sortedCounts.filter(([name, c]) => c >= range.min && c <= range.max).length;
      console.log(`${range.label}: ${count} hobbies`);
    });

    // Show most problematic hobbies
    console.log('\n3. TOP 10 MOST ASSIGNED HOBBIES:');
    console.log('--------------------------------');
    sortedCounts.slice(0, 10).forEach(([name, count], index) => {
      const percentage = (count / totalTowns * 100).toFixed(1);
      const flag = count >= universalThreshold ? '🚨' : count >= Math.floor(totalTowns * 0.5) ? '⚠️' : '✅';
      console.log(`${index + 1}. ${flag} ${name}: ${count} towns (${percentage}%)`);
    });

    // Show most realistic assignments
    const realisticHobbies = sortedCounts.filter(([name, count]) => count <= Math.floor(totalTowns * 0.09) && count > 0);
    console.log(`\n4. MOST REALISTIC ASSIGNMENTS (≤${Math.floor(totalTowns * 0.09)} towns):`);
    console.log('-------------------------------------------------------');
    console.log(`Found ${realisticHobbies.length} hobbies with realistic assignment counts:`);
    realisticHobbies.slice(0, 15).forEach(([name, count]) => {
      console.log(`✅ ${name}: ${count} towns`);
    });

    // Check unused hobbies
    const usedHobbyIds = new Set(allAssignments.map(a => a.hobby_id));
    const unusedHobbies = allHobbies.filter(h => !usedHobbyIds.has(h.id));
    console.log(`\n5. UNUSED HOBBIES (${unusedHobbies.length}/${allHobbies.length}):`);
    console.log('------------------------------------------');
    unusedHobbies.slice(0, 10).forEach(hobby => {
      console.log(`- ${hobby.name}`);
    });

    // Count towns per assignment count
    const townAssignmentCounts = {};
    allAssignments.forEach(assignment => {
      const townId = assignment.town_id;
      townAssignmentCounts[townId] = (townAssignmentCounts[townId] || 0) + 1;
    });

    const assignmentDistribution = {};
    Object.values(townAssignmentCounts).forEach(count => {
      assignmentDistribution[count] = (assignmentDistribution[count] || 0) + 1;
    });

    console.log('\n6. TOWNS BY NUMBER OF HOBBIES ASSIGNED:');
    console.log('--------------------------------------');
    const sortedDistribution = Object.entries(assignmentDistribution)
      .map(([count, towns]) => [parseInt(count), towns])
      .sort((a, b) => a[0] - b[0]);
    
    sortedDistribution.forEach(([hobbyCount, townCount]) => {
      console.log(`${hobbyCount} hobbies: ${townCount} towns`);
    });

    const townsWithNoHobbies = totalTowns - Object.keys(townAssignmentCounts).length;
    if (townsWithNoHobbies > 0) {
      console.log(`0 hobbies: ${townsWithNoHobbies} towns`);
    }

    // Final recommendations
    console.log('\n7. RECOMMENDATIONS:');
    console.log('==================');
    console.log('🔧 IMMEDIATE FIXES NEEDED:');
    
    if (universalHobbies.length > 0) {
      console.log(`1. Remove ${universalHobbies.length} universally assigned hobbies`);
      console.log('2. Implement geographic/climate-based hobby validation');
    }
    
    console.log('3. Focus on realistic assignment patterns (1-9% of towns)');
    console.log('4. Add infrastructure requirement validation');
    console.log('5. Review AI assignment algorithm for over-generalization');
    
    if (unusedHobbies.length > 100) {
      console.log(`6. Consider removing ${unusedHobbies.length} unused hobbies from catalog`);
    }

  } catch (error) {
    console.error('Complete audit failed:', error);
  }
}

completeAudit();