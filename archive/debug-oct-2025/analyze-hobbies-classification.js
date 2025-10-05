#!/usr/bin/env node

// HOBBIES CLASSIFICATION ANALYSIS
// Analyzing how hobbies should be classified as "universal" vs location-dependent

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function analyzeHobbiesClassification() {
  console.log('🎯 HOBBIES CLASSIFICATION ANALYSIS');
  console.log('=' .repeat(80));
  console.log('Analyzing how hobbies should be classified as "universal" vs location-dependent');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Query 1: Look at what we currently call "universal"
    console.log('1. CURRENT "UNIVERSAL" HOBBIES:');
    console.log('-'.repeat(50));
    const { data: universalHobbies, error: universalError } = await supabase
      .from('hobbies')
      .select('name, category, is_universal, description')
      .eq('is_universal', true)
      .order('category')
      .order('name')
      .limit(30);

    if (universalError) {
      console.error('❌ Error fetching universal hobbies:', universalError);
    } else {
      universalHobbies.forEach(hobby => {
        console.log(`✅ ${hobby.name} (${hobby.category})`);
        if (hobby.description) {
          console.log(`   ${hobby.description}`);
        }
        console.log('');
      });
      console.log(`Total universal hobbies shown: ${universalHobbies.length}`);
    }

    console.log('\n' + '='.repeat(80));

    // Query 2: Look at non-universal hobbies
    console.log('2. CURRENT "NON-UNIVERSAL" HOBBIES:');
    console.log('-'.repeat(50));
    const { data: nonUniversalHobbies, error: nonUniversalError } = await supabase
      .from('hobbies')
      .select('name, category, is_universal, description')
      .eq('is_universal', false)
      .order('category')
      .order('name')
      .limit(30);

    if (nonUniversalError) {
      console.error('❌ Error fetching non-universal hobbies:', nonUniversalError);
    } else {
      nonUniversalHobbies.forEach(hobby => {
        console.log(`❌ ${hobby.name} (${hobby.category})`);
        if (hobby.description) {
          console.log(`   ${hobby.description}`);
        }
        console.log('');
      });
      console.log(`Total non-universal hobbies shown: ${nonUniversalHobbies.length}`);
    }

    console.log('\n' + '='.repeat(80));

    // Query 3: Look for specific edge cases
    console.log('3. EDGE CASE ANALYSIS:');
    console.log('-'.repeat(50));
    const edgeCaseHobbies = [
      'Yoga', 'Swimming', 'Meditation', 'Walking', 'Running',
      'Cycling', 'Golf', 'Tennis', 'Sailing', 'Surfing',
      'Skiing', 'Ice Skating', 'Rock Climbing', 'Hiking',
      'Birdwatching', 'Photography', 'Painting', 'Reading'
    ];

    const { data: edgeCases, error: edgeError } = await supabase
      .from('hobbies')
      .select('name, is_universal, category, description')
      .in('name', edgeCaseHobbies)
      .order('name');

    if (edgeError) {
      console.error('❌ Error fetching edge cases:', edgeError);
    } else {
      edgeCases.forEach(hobby => {
        const status = hobby.is_universal ? '✅ UNIVERSAL' : '❌ NON-UNIVERSAL';
        console.log(`${status}: ${hobby.name} (${hobby.category})`);
        if (hobby.description) {
          console.log(`   ${hobby.description}`);
        }
        console.log('');
      });
    }

    // Check which edge cases were not found
    const foundNames = edgeCases.map(h => h.name);
    const notFound = edgeCaseHobbies.filter(name => !foundNames.includes(name));
    if (notFound.length > 0) {
      console.log('⚠️  HOBBIES NOT FOUND IN DATABASE:');
      notFound.forEach(name => console.log(`   - ${name}`));
      console.log('');
    }

    console.log('\n' + '='.repeat(80));

    // Additional analysis: Get category breakdowns
    console.log('4. CATEGORY BREAKDOWN:');
    console.log('-'.repeat(50));
    const { data: categoryStats, error: categoryError } = await supabase
      .from('hobbies')
      .select('category, is_universal')
      .order('category');

    if (categoryError) {
      console.error('❌ Error fetching category stats:', categoryError);
    } else {
      const categoryBreakdown = {};
      categoryStats.forEach(hobby => {
        if (!categoryBreakdown[hobby.category]) {
          categoryBreakdown[hobby.category] = { universal: 0, nonUniversal: 0 };
        }
        if (hobby.is_universal) {
          categoryBreakdown[hobby.category].universal++;
        } else {
          categoryBreakdown[hobby.category].nonUniversal++;
        }
      });

      Object.entries(categoryBreakdown).forEach(([category, counts]) => {
        const total = counts.universal + counts.nonUniversal;
        const universalPercent = Math.round((counts.universal / total) * 100);
        console.log(`${category}:`);
        console.log(`   Universal: ${counts.universal} (${universalPercent}%)`);
        console.log(`   Non-Universal: ${counts.nonUniversal} (${100 - universalPercent}%)`);
        console.log(`   Total: ${total}`);
        console.log('');
      });
    }

    console.log('\n' + '='.repeat(80));

    // Get total counts
    console.log('5. TOTAL COUNTS:');
    console.log('-'.repeat(50));
    const { count: totalCount } = await supabase
      .from('hobbies')
      .select('*', { count: 'exact', head: true });

    const { count: universalCount } = await supabase
      .from('hobbies')
      .select('*', { count: 'exact', head: true })
      .eq('is_universal', true);

    console.log(`Total hobbies: ${totalCount}`);
    console.log(`Universal hobbies: ${universalCount}`);
    console.log(`Non-universal hobbies: ${totalCount - universalCount}`);
    console.log(`Universal percentage: ${Math.round((universalCount / totalCount) * 100)}%`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n✅ Hobbies classification analysis completed!');
}

// Run the analysis
analyzeHobbiesClassification().catch(console.error);