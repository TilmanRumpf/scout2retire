#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

// Map UI button IDs to database group names
const buttonToGroupMapping = {
  'golf_tennis': 'Golf & Tennis Related',
  'walking_cycling': 'Walking & Cycling Related',
  'water_sports': 'Water Sports Related',
  'water_crafts': 'Water Crafts Related',
  'winter_sports': 'Winter Sports Related',
  'gardening': 'Gardening & Pets Related',
  'arts': 'Arts & Crafts Related',
  'music_theater': 'Music & Theater Related',
  'cooking_wine': 'Cooking & Wine Related',
  'history': 'Museums & History Related'
};

console.log('🔍 DATABASE GROUPS vs CODE MAPPINGS');
console.log('='.repeat(60));

for (const [buttonId, groupName] of Object.entries(buttonToGroupMapping)) {
  const { data, error } = await supabase
    .from('hobbies')
    .select('town_name')
    .eq('group_name', groupName)
    .order('town_name');
  
  if (error) {
    console.log(`❌ Error for ${buttonId}: ${error.message}`);
  } else {
    console.log(`\n${buttonId} → ${groupName}:`);
    console.log(`  Database has ${data.length} hobbies`);
    if (data.length <= 10) {
      data.forEach(h => console.log(`    • ${h.name}`));
    } else {
      // Show first 5 only
      data.slice(0, 5).forEach(h => console.log(`    • ${h.name}`));
      console.log(`    ... and ${data.length - 5} more`);
    }
  }
}

// Now show what the code is saving
console.log(`\n${'='.repeat(60)}`);
console.log('⚠️ CURRENT CODE HARD-CODED MAPPINGS:');
console.log(`${'='.repeat(60)}`);
const codeMappings = {
  'golf_tennis': ['golf', 'tennis'],
  'walking_cycling': ['walking', 'cycling'],
  'water_sports': ['swimming'],
  'water_crafts': ['boating'],
  'winter_sports': ['skiing'],
  'gardening': ['gardening'],
  'arts': ['arts', 'crafts'],
  'music_theater': ['music', 'theater'],
  'cooking_wine': ['cooking', 'wine'],
  'history': ['museums', 'history']
};

for (const [button, items] of Object.entries(codeMappings)) {
  console.log(`${button}: [${items.join(', ')}]`);
}

console.log(`\n${'='.repeat(60)}`);
console.log('🔴 CRITICAL FINDING:');
console.log('Code uses hard-coded mappings, not database groups!');
console.log('This violates the architectural principle.');