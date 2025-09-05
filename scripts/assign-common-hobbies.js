#!/usr/bin/env node

/**
 * Lean script to ensure every town has at least 20 common hobbies
 * Uses universal hobbies that make sense everywhere
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://axlruvvsjepsulcbqlho.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function assignCommonHobbies() {
  console.log('🎯 Assigning Common Hobbies to All Towns\n');
  
  try {
    // 1. Get all universal hobbies
    console.log('📚 Fetching universal hobbies...');
    const { data: universalHobbies, error: hobbyError } = await supabase
      .from('hobbies')
      .select('id, name')
      .eq('is_universal', true)
      .order('name');
    
    if (hobbyError) throw hobbyError;
    console.log(`Found ${universalHobbies.length} universal hobbies\n`);
    
    // If we don't have enough universal hobbies, get some common ones
    let commonHobbies = [...universalHobbies];
    
    if (commonHobbies.length < 20) {
      console.log('📝 Need more hobbies, fetching additional common ones...');
      
      // These are activities that realistically can be done anywhere
      const additionalCommonNames = [
        'Walking', 'Reading', 'Cooking', 'Gardening', 'Photography',
        'Board games', 'Card games', 'Chess', 'Meditation', 'Yoga',
        'Swimming', 'Dancing', 'Painting', 'Drawing', 'Knitting',
        'Sewing', 'Birdwatching', 'Fishing', 'Cycling', 'Jogging'
      ];
      
      const { data: moreHobbies } = await supabase
        .from('hobbies')
        .select('id, name')
        .in('name', additionalCommonNames)
        .order('name');
      
      if (moreHobbies) {
        // Add non-duplicate hobbies
        moreHobbies.forEach(h => {
          if (!commonHobbies.find(ch => ch.id === h.id)) {
            commonHobbies.push(h);
          }
        });
      }
      
      console.log(`Total common hobbies available: ${commonHobbies.length}\n`);
    }
    
    // Ensure we have at least 20 hobbies to assign
    const hobbiesToAssign = commonHobbies.slice(0, Math.min(20, commonHobbies.length));
    console.log(`Will assign ${hobbiesToAssign.length} hobbies to each town\n`);
    
    if (hobbiesToAssign.length < 20) {
      console.log('⚠️  Warning: Only ' + hobbiesToAssign.length + ' hobbies available (target was 20)');
      console.log('Consider adding more universal hobbies to the database.\n');
    }
    
    // 2. Get all towns
    console.log('🏙️  Fetching all towns...');
    const { data: towns, error: townError } = await supabase
      .from('towns')
      .select('id, name, country')
      .order('name');
    
    if (townError) throw townError;
    console.log(`Found ${towns.length} towns\n`);
    
    // 3. Get existing assignments to avoid duplicates
    console.log('🔍 Checking existing assignments...');
    const { data: existingAssignments } = await supabase
      .from('towns_hobbies')
      .select('town_id, hobby_id');
    
    // Create lookup map
    const existingMap = new Map();
    existingAssignments?.forEach(a => {
      const key = `${a.town_id}-${a.hobby_id}`;
      existingMap.set(key, true);
    });
    
    // 4. Prepare assignments
    console.log('📋 Preparing assignments...\n');
    const newAssignments = [];
    let townsNeedingHobbies = 0;
    let totalNewAssignments = 0;
    
    for (const town of towns) {
      let addedForThisTown = 0;
      
      for (const hobby of hobbiesToAssign) {
        const key = `${town.id}-${hobby.id}`;
        
        // Skip if already assigned
        if (!existingMap.has(key)) {
          newAssignments.push({
            town_id: town.id,
            hobby_id: hobby.id
          });
          addedForThisTown++;
          totalNewAssignments++;
        }
      }
      
      if (addedForThisTown > 0) {
        townsNeedingHobbies++;
        if (townsNeedingHobbies <= 10) {
          console.log(`${town.name}: Adding ${addedForThisTown} common hobbies`);
        }
      }
    }
    
    if (townsNeedingHobbies > 10) {
      console.log(`... and ${townsNeedingHobbies - 10} more towns\n`);
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`- Towns needing hobbies: ${townsNeedingHobbies}`);
    console.log(`- Total new assignments: ${totalNewAssignments}\n`);
    
    // 5. Insert in batches
    if (newAssignments.length > 0) {
      console.log('💾 Inserting assignments...');
      const batchSize = 500;
      let inserted = 0;
      
      for (let i = 0; i < newAssignments.length; i += batchSize) {
        const batch = newAssignments.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('towns_hobbies')
          .insert(batch);
        
        if (error) {
          console.error(`Error in batch ${Math.floor(i/batchSize) + 1}:`, error.message);
        } else {
          inserted += batch.length;
          process.stdout.write(`\rProgress: ${inserted}/${newAssignments.length} assignments`);
        }
      }
      
      console.log('\n\n✅ Assignment complete!');
    } else {
      console.log('✅ All towns already have common hobbies assigned!');
    }
    
    // 6. Verify results
    console.log('\n📈 Verification:');
    
    // Check how many hobbies each town has now
    const { data: townCounts } = await supabase
      .from('towns_hobbies')
      .select('town_id')
      .in('hobby_id', hobbiesToAssign.map(h => h.id));
    
    const townHobbyCount = {};
    townCounts?.forEach(th => {
      townHobbyCount[th.town_id] = (townHobbyCount[th.town_id] || 0) + 1;
    });
    
    const townsWithEnough = Object.values(townHobbyCount).filter(count => count >= 20).length;
    const townsWithSome = Object.values(townHobbyCount).filter(count => count >= 10).length;
    
    console.log(`- Towns with 20+ common hobbies: ${townsWithEnough}/${towns.length}`);
    console.log(`- Towns with 10+ common hobbies: ${townsWithSome}/${towns.length}`);
    
    // Show the common hobbies assigned
    console.log('\n🎨 Common hobbies assigned to all towns:');
    hobbiesToAssign.forEach((h, i) => {
      if (i % 4 === 0) process.stdout.write('\n  ');
      process.stdout.write(h.name.padEnd(20));
    });
    console.log('\n\n✨ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run it
assignCommonHobbies();