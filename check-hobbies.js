#!/usr/bin/env node

// Query hobbies data using Supabase client

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkHobbies() {
  console.log('🔍 Checking universal/common hobbies in database...\n');

  try {
    // 1. Get universal hobbies
    console.log('1. Universal hobbies (is_universal = true):');
    const { data: universalHobbies, error: universalError } = await supabase
      .from('hobbies')
      .select('id, name')
      .eq('is_universal', true)
      .limit(30);

    if (universalError) {
      console.error('❌ Error querying universal hobbies:', universalError.message);
    } else {
      console.log(`   Found ${universalHobbies?.length || 0} universal hobbies:`);
      universalHobbies?.forEach((hobby, index) => {
        console.log(`   ${index + 1}. ${hobby.name} (ID: ${hobby.id})`);
      });
    }

    console.log('\n2. Most common hobbies (by name):');
    // 2. Get common hobbies by specific names
    const commonHobbyNames = [
      'Walking', 'Reading', 'Cooking', 'Gardening', 'Photography', 
      'Writing', 'Board games', 'Card games', 'Chess', 'Watching TV',
      'Listening to music', 'Socializing', 'Shopping', 'Traveling',
      'Meditation', 'Yoga', 'Stretching', 'Swimming', 'Dancing',
      'Painting', 'Drawing', 'Knitting', 'Sewing', 'Crafts'
    ];

    const { data: commonHobbies, error: commonError } = await supabase
      .from('hobbies')
      .select('id, name, category')
      .in('name', commonHobbyNames)
      .order('name');

    if (commonError) {
      console.error('❌ Error querying common hobbies:', commonError.message);
    } else {
      console.log(`   Found ${commonHobbies?.length || 0} common hobbies by name:`);
      commonHobbies?.forEach((hobby, index) => {
        console.log(`   ${index + 1}. ${hobby.name} (Category: ${hobby.category}, ID: ${hobby.id})`);
      });
    }

    // 3. Show missing common hobbies
    console.log('\n3. Missing common hobbies:');
    const foundHobbyNames = commonHobbies?.map(h => h.name) || [];
    const missingHobbies = commonHobbyNames.filter(name => !foundHobbyNames.includes(name));
    if (missingHobbies.length > 0) {
      missingHobbies.forEach((name, index) => {
        console.log(`   ${index + 1}. ${name}`);
      });
    } else {
      console.log('   ✅ All common hobbies are present in the database!');
    }

    // 4. Get total hobbies count and categories
    console.log('\n4. Database overview:');
    const { data: totalCount, error: countError } = await supabase
      .from('hobbies')
      .select('id', { count: 'exact' });

    if (countError) {
      console.error('❌ Error getting total count:', countError.message);
    } else {
      console.log(`   Total hobbies in database: ${totalCount?.length || 0}`);
    }

    // Get categories
    const { data: categories, error: catError } = await supabase
      .from('hobbies')
      .select('category')
      .not('category', 'is', null);

    if (catError) {
      console.error('❌ Error getting categories:', catError.message);
    } else {
      const uniqueCategories = [...new Set(categories?.map(c => c.category))].filter(Boolean);
      console.log(`   Categories available: ${uniqueCategories.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n✅ Hobbies check completed!');
}

// Run the query
checkHobbies().catch(console.error);