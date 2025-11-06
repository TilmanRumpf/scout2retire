#!/usr/bin/env node

/**
 * Simple, reliable hobby fix script
 * Assigns basic hobbies to towns that have NONE
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://axlruvvsjepsulcbqlho.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function fixHobbies() {
  console.log('🔧 Simple Hobby Fix\n');
  
  try {
    // 1. Get towns with photos but NO hobbies
    console.log('Finding towns with photos but no hobbies...');
    
    const { data: townsWithPhotos } = await supabase
      .from('towns')
      .select('id, town_name, country, geographic_features_actual, description')
      .not('image_url_1', 'is', null);
    
    const { data: townsWithHobbies } = await supabase
      .from('towns_hobbies')
      .select('town_id');
    
    const townIdsWithHobbies = new Set(townsWithHobbies.map(t => t.town_id));
    const townsNeedingHobbies = townsWithPhotos.filter(t => !townIdsWithHobbies.has(t.id));
    
    console.log(`Found ${townsNeedingHobbies.length} towns with photos but no hobbies\n`);
    
    // 2. Get existing hobby IDs we can safely use
    const { data: existingHobbies } = await supabase
      .from('hobbies')
      .select('id, town_name')
      .in('name', [
        'Walking', 'Reading', 'Photography', 'Cooking', 
        'Swimming', 'Hiking', 'Cycling', 'Golf', 'Tennis',
        'Fishing', 'Sailing', 'Museums', 'Wine tasting',
        'Yoga', 'Markets', 'Birdwatching'
      ]);
    
    const hobbyMap = {};
    existingHobbies.forEach(h => {
      hobbyMap[h.name] = h.id;
    });
    
    console.log(`Found ${Object.keys(hobbyMap).length} valid hobbies to assign\n`);
    
    // 3. Assign appropriate hobbies to each town
    const assignments = [];
    
    for (const town of townsNeedingHobbies) {
      const features = (town.geographic_features_actual || []).join(' ').toLowerCase();
      const description = (town.description || '').toLowerCase();
      const allText = features + ' ' + description;
      
      // Always add these universal hobbies
      if (hobbyMap['Walking']) assignments.push({ town_id: town.id, hobby_id: hobbyMap['Walking'] });
      if (hobbyMap['Reading']) assignments.push({ town_id: town.id, hobby_id: hobbyMap['Reading'] });
      if (hobbyMap['Photography']) assignments.push({ town_id: town.id, hobby_id: hobbyMap['Photography'] });
      if (hobbyMap['Cooking']) assignments.push({ town_id: town.id, hobby_id: hobbyMap['Cooking'] });
      
      // Add location-specific hobbies
      if ((allText.includes('coast') || allText.includes('beach')) && hobbyMap['Swimming']) {
        assignments.push({ town_id: town.id, hobby_id: hobbyMap['Swimming'] });
      }
      if ((allText.includes('coast') || allText.includes('beach')) && hobbyMap['Fishing']) {
        assignments.push({ town_id: town.id, hobby_id: hobbyMap['Fishing'] });
      }
      if ((allText.includes('mountain') || allText.includes('trail')) && hobbyMap['Hiking']) {
        assignments.push({ town_id: town.id, hobby_id: hobbyMap['Hiking'] });
      }
      if (allText.includes('golf') && hobbyMap['Golf']) {
        assignments.push({ town_id: town.id, hobby_id: hobbyMap['Golf'] });
      }
      if (allText.includes('tennis') && hobbyMap['Tennis']) {
        assignments.push({ town_id: town.id, hobby_id: hobbyMap['Tennis'] });
      }
      if (allText.includes('wine') && hobbyMap['Wine tasting']) {
        assignments.push({ town_id: town.id, hobby_id: hobbyMap['Wine tasting'] });
      }
      if (allText.includes('museum') && hobbyMap['Museums']) {
        assignments.push({ town_id: town.id, hobby_id: hobbyMap['Museums'] });
      }
      if (allText.includes('market') && hobbyMap['Markets']) {
        assignments.push({ town_id: town.id, hobby_id: hobbyMap['Markets'] });
      }
      
      console.log(`${town.town_name}: Assigning ${assignments.filter(a => a.town_id === town.id).length} hobbies`);
    }
    
    console.log(`\nTotal assignments to make: ${assignments.length}\n`);
    
    // 4. Insert in batches
    if (assignments.length > 0) {
      console.log('Inserting hobby assignments...');
      const batchSize = 50;
      let inserted = 0;
      
      for (let i = 0; i < assignments.length; i += batchSize) {
        const batch = assignments.slice(i, i + batchSize);
        
        // Use upsert to avoid duplicates
        const { data, error } = await supabase
          .from('towns_hobbies')
          .upsert(batch, { onConflict: 'town_id,hobby_id' });
        
        if (error) {
          console.error(`Error in batch ${i/batchSize + 1}:`, error.message);
        } else {
          inserted += batch.length;
        }
      }
      
      console.log(`\n✅ Successfully assigned ${inserted} hobbies!`);
    }
    
    // 5. Verify the fix
    console.log('\n📊 Verification:');
    const { count: townsWithHobbiesAfter } = await supabase
      .from('towns_hobbies')
      .select('town_id', { count: 'exact', head: true });
    
    console.log(`Towns with hobbies: ${townsWithHobbiesAfter}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixHobbies();