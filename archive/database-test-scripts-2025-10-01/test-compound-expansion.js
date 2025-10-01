#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

// Map button IDs to database group names
const BUTTON_TO_GROUP_MAPPING = {
  // Activities
  'golf_tennis': 'Golf & Tennis Related',
  'walking_cycling': 'Walking & Cycling Related',
  'water_sports': 'Water Sports Related',
  'water_crafts': 'Water Crafts Related',
  'winter_sports': 'Winter Sports Related',
  // Interests
  'gardening': 'Gardening & Pets Related',
  'arts': 'Arts & Crafts Related',
  'music_theater': 'Music & Theater Related',
  'cooking_wine': 'Cooking & Wine Related',
  'history': 'Museums & History Related'
};

async function testCompoundExpansion() {
  console.log('🧪 TESTING COMPOUND BUTTON EXPANSION');
  console.log('='.repeat(60));
  
  // Test case: User clicks "water_sports" and "golf_tennis"
  const selectedButtons = ['water_sports', 'golf_tennis'];
  console.log('\nUser selected compound buttons:', selectedButtons);
  
  // Fetch all hobbies for these buttons
  const allHobbies = new Set();
  
  for (const buttonId of selectedButtons) {
    const groupName = BUTTON_TO_GROUP_MAPPING[buttonId];
    
    const { data, error } = await supabase
      .from('hobbies')
      .select('name')
      .eq('group_name', groupName)
      .order('name');
    
    if (error) {
      console.error(`Error fetching ${buttonId}:`, error);
      continue;
    }
    
    console.log(`\n${buttonId} → ${groupName}:`);
    console.log(`  Found ${data.length} hobbies:`);
    data.forEach(h => {
      const normalized = h.name.toLowerCase().replace(/\s+/g, '_');
      allHobbies.add(normalized);
      console.log(`    • ${h.name} → ${normalized}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('RESULT:');
  console.log(`Selected buttons: ${selectedButtons.length}`);
  console.log(`Total hobbies to save: ${allHobbies.size}`);
  console.log('All hobbies:', Array.from(allHobbies).sort());
  
  console.log('\n✅ This is what SHOULD be saved when user clicks those buttons!');
}

testCompoundExpansion().catch(console.error);