/**
 * Get Priority Towns for Cultural Data Entry
 *
 * Quick script to view towns that need cultural data,
 * sorted by priority (healthcare + safety scores)
 *
 * Usage: node database-utilities/get-priority-towns-for-cultural-data.js [limit]
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getPriorityTowns(limit = 20) {
  console.log(`\n🎯 TOP ${limit} PRIORITY TOWNS NEEDING CULTURAL DATA\n`);
  console.log('='.repeat(80));

  // Fetch towns missing all three cultural fields
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, region, social_atmosphere, traditional_progressive_lean, cultural_events_frequency, healthcare_score, safety_score, primary_language, pace_of_life_actual, expat_community_size')
    .is('social_atmosphere', null)
    .is('traditional_progressive_lean', null)
    .is('cultural_events_frequency', null);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  // Calculate priority score
  const withScores = towns.map(t => ({
    ...t,
    priority_score: ((t.healthcare_score || 0) + (t.safety_score || 0)) / 2
  }));

  // Sort by priority score
  const sorted = withScores.sort((a, b) => b.priority_score - a.priority_score);

  // Display top N
  console.log(`\nFound ${towns.length} towns missing cultural data\n`);
  console.log('Missing fields for ALL towns below:');
  console.log('  • social_atmosphere (reserved, quiet, moderate, friendly, vibrant, very friendly)');
  console.log('  • traditional_progressive_lean (traditional, moderate, balanced, progressive)');
  console.log('  • cultural_events_frequency (rare, occasional, monthly, frequent, weekly, constant, daily)\n');
  console.log('-'.repeat(80));

  sorted.slice(0, limit).forEach((town, idx) => {
    const priority = town.priority_score >= 9.0 ? '🔴 HIGH' :
                    town.priority_score >= 8.0 ? '🟡 MED' : '🟢 LOW';

    console.log(`\n${idx + 1}. ${priority} | ${town.name}, ${town.country}`);
    console.log(`   Priority Score: ${town.priority_score.toFixed(1)} (healthcare: ${town.healthcare_score}, safety: ${town.safety_score})`);
    console.log(`   Region: ${town.region || 'N/A'}`);
    console.log(`   Language: ${town.primary_language || 'N/A'}`);
    console.log(`   Pace of Life: ${town.pace_of_life_actual || 'N/A'}`);
    console.log(`   Expat Community: ${town.expat_community_size || 'N/A'}`);
    console.log(`   Town ID: ${town.id}`);
    console.log(`   🔗 Edit at: http://localhost:5173/admin/towns (search "${town.name}")`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('\n📋 QUICK REFERENCE - VALID VALUES:\n');
  console.log('social_atmosphere:');
  console.log('  reserved | quiet | moderate | friendly | vibrant | very friendly\n');
  console.log('traditional_progressive_lean:');
  console.log('  traditional | moderate | balanced | progressive\n');
  console.log('cultural_events_frequency:');
  console.log('  rare | occasional | monthly | frequent | weekly | constant | daily\n');
  console.log('='.repeat(80));
  console.log(`\n✅ Use admin UI to fill data: http://localhost:5173/admin/towns\n`);
}

// Get limit from command line or default to 20
const limit = parseInt(process.argv[2]) || 20;
getPriorityTowns(limit).then(() => process.exit(0)).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
