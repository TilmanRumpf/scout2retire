#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function analyzeHobbies() {
  console.log('🔍 ANALYZING HOBBY CATEGORIES FOR COMPOUND BUTTONS');
  console.log('=' .repeat(60));
  
  try {
    // Get all hobbies
    const { data: hobbies, error } = await supabase
      .from('hobbies')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log(`Total hobbies in database: ${hobbies.length}`);
    
    // Categorize for compound buttons
    const categories = {
      water_sports: [],
      water_crafts: [],
      winter_sports: [],
      walking_cycling: [],
      golf_tennis: [],
      cooking_wine: [],
      arts: [],
      music_theater: [],
      gardening: [],
      history: []
    };
    
    // Keywords for categorization
    const waterSportsKeywords = ['swim', 'surf', 'dive', 'snorkel', 'water polo', 'beach'];
    const waterCraftsKeywords = ['boat', 'sail', 'kayak', 'canoe', 'paddle', 'yacht', 'row'];
    const winterSportsKeywords = ['ski', 'snow', 'ice', 'sled', 'hockey'];
    const walkingCyclingKeywords = ['walk', 'hik', 'cycl', 'bike', 'trail'];
    const golfTennisKeywords = ['golf', 'tennis'];
    const cookingWineKeywords = ['cook', 'bak', 'wine', 'brew', 'cheese', 'culinary'];
    const artsKeywords = ['art', 'craft', 'paint', 'draw', 'sculpt', 'pottery'];
    const musicTheaterKeywords = ['music', 'theater', 'theatre', 'opera', 'concert', 'instrument'];
    const gardeningKeywords = ['garden', 'plant', 'flower', 'herb', 'vegetable'];
    const historyKeywords = ['history', 'museum', 'heritage', 'antique'];
    
    hobbies.forEach(hobby => {
      const name = hobby.name.toLowerCase();
      
      // Check each category
      if (waterSportsKeywords.some(kw => name.includes(kw))) {
        categories.water_sports.push(hobby.name);
      }
      if (waterCraftsKeywords.some(kw => name.includes(kw))) {
        categories.water_crafts.push(hobby.name);
      }
      if (winterSportsKeywords.some(kw => name.includes(kw))) {
        categories.winter_sports.push(hobby.name);
      }
      if (walkingCyclingKeywords.some(kw => name.includes(kw))) {
        categories.walking_cycling.push(hobby.name);
      }
      if (golfTennisKeywords.some(kw => name.includes(kw))) {
        categories.golf_tennis.push(hobby.name);
      }
      if (cookingWineKeywords.some(kw => name.includes(kw))) {
        categories.cooking_wine.push(hobby.name);
      }
      if (artsKeywords.some(kw => name.includes(kw))) {
        categories.arts.push(hobby.name);
      }
      if (musicTheaterKeywords.some(kw => name.includes(kw))) {
        categories.music_theater.push(hobby.name);
      }
      if (gardeningKeywords.some(kw => name.includes(kw))) {
        categories.gardening.push(hobby.name);
      }
      if (historyKeywords.some(kw => name.includes(kw))) {
        categories.history.push(hobby.name);
      }
    });
    
    // Report findings
    console.log('\n📊 COMPOUND BUTTON ANALYSIS:\n');
    
    Object.entries(categories).forEach(([category, items]) => {
      console.log(`${category.toUpperCase()} (${items.length} hobbies):`);
      if (items.length > 0) {
        items.forEach(item => console.log(`  • ${item}`));
      } else {
        console.log('  (no matching hobbies found)');
      }
      console.log('');
    });
    
    // Check universal vs location-specific
    const universalHobbies = hobbies.filter(h => h.is_universal);
    const locationSpecific = hobbies.filter(h => !h.is_universal);
    
    console.log('📈 DISTRIBUTION:');
    console.log(`Universal hobbies: ${universalHobbies.length}`);
    console.log(`Location-specific: ${locationSpecific.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeHobbies().catch(console.error);
