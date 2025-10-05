#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSpanishCities() {
  console.log('🔍 ANALYZING AVAILABLE HOBBIES\n');
  
  // Get all available hobbies
  const { data: allHobbies } = await supabase
    .from('hobbies')
    .select('name')
    .order('name');
  
  const validHobbies = new Set(allHobbies.map(h => h.name));
  
  // Check what activities are available
  const categories = {
    water: [],
    sports: [],
    cultural: [],
    outdoor: [],
    urban: [],
    learning: [],
    food: []
  };
  
  for (const hobby of validHobbies) {
    const name = hobby.toLowerCase();
    
    if (name.includes('beach') || name.includes('swim') || name.includes('sail') || 
        name.includes('surf') || name.includes('diving') || name.includes('water')) {
      categories.water.push(hobby);
    }
    if (name.includes('golf') || name.includes('tennis') || name.includes('padel') || 
        name.includes('cycling') || name.includes('yoga')) {
      categories.sports.push(hobby);
    }
    if (name.includes('museum') || name.includes('art') || name.includes('photo') || 
        name.includes('music') || name.includes('theater') || name.includes('concert')) {
      categories.cultural.push(hobby);
    }
    if (name.includes('hiking') || name.includes('walking') || name.includes('bird') || 
        name.includes('garden')) {
      categories.outdoor.push(hobby);
    }
    if (name.includes('shop') || name.includes('market') || name.includes('dining') || 
        name.includes('restaurant')) {
      categories.urban.push(hobby);
    }
    if (name.includes('class') || name.includes('language') || name.includes('spanish') || 
        name.includes('learning')) {
      categories.learning.push(hobby);
    }
    if (name.includes('wine') || name.includes('cooking') || name.includes('food') || 
        name.includes('tapas')) {
      categories.food.push(hobby);
    }
  }
  
  console.log('📚 AVAILABLE HOBBIES BY CATEGORY:\n');
  for (const [cat, hobbies] of Object.entries(categories)) {
    if (hobbies.length > 0) {
      console.log(`${cat.toUpperCase()} (${hobbies.length}):`);
      console.log(`  ${hobbies.join(', ')}\n`);
    }
  }
  
  // Now create proper hobby sets for Spanish cities using only valid hobbies
  const spanishCityHobbies = {
    'Alicante': {
      coastal: true,
      urban: true,
      hobbies: [
        // Water activities
        'Swimming', 'Sailing', 'Scuba Diving', 'Kayaking', 'Fishing',
        // Sports
        'Golf', 'Tennis', 'Padel', 'Cycling', 'Yoga',
        // Cultural/Urban
        'Museums', 'Photography', 'Wine Tasting', 'Cooking',
        // Outdoor
        'Hiking', 'Walking', 'Gardening'
      ]
    },
    
    'Valencia': {
      coastal: true,
      urban: true,
      hobbies: [
        // Water
        'Swimming', 'Sailing', 'Kayaking',
        // Sports
        'Cycling', 'Tennis', 'Golf', 'Padel', 'Running',
        // Cultural
        'Museums', 'Photography', 'Opera', 'Theater',
        // Food & Drink
        'Wine Tasting', 'Cooking', 
        // Outdoor
        'Walking', 'Gardening'
      ]
    },
    
    'Barcelona': {
      coastal: true,
      urban: true,
      hobbies: [
        // Urban culture
        'Museums', 'Photography', 'Theater', 'Opera',
        // Sports & Outdoor
        'Cycling', 'Hiking', 'Walking', 'Swimming', 'Sailing',
        'Golf', 'Tennis', 'Yoga',
        // Food & Social
        'Wine Tasting', 'Cooking', 'Reading'
      ]
    },
    
    'Malaga': {
      coastal: true,
      urban: true,
      hobbies: [
        // Beach & Water
        'Swimming', 'Sailing', 'Scuba Diving', 'Fishing',
        // Sports
        'Golf', 'Tennis', 'Padel', 'Hiking',
        // Cultural
        'Museums', 'Photography', 'Theater',
        // Food & Wine
        'Wine Tasting', 'Cooking',
        // Outdoor
        'Walking', 'Cycling', 'Gardening'
      ]
    },
    
    'Marbella': {
      coastal: true,
      urban: false,
      hobbies: [
        // Premium sports
        'Golf', 'Tennis', 'Padel', 'Sailing',
        // Beach activities
        'Swimming', 'Scuba Diving', 'Fishing',
        // Lifestyle
        'Wine Tasting', 'Photography', 'Yoga',
        // Outdoor
        'Hiking', 'Walking', 'Cycling',
        // Cultural
        'Cooking', 'Museums'
      ]
    },
    
    'Granada': {
      coastal: false,
      urban: false,
      hobbies: [
        // Mountain activities
        'Hiking', 'Walking', 'Photography',
        // Cultural
        'Museums', 'Flamenco', 'Guitar',
        // Sports
        'Tennis', 'Cycling', 'Yoga',
        // Food & Wine
        'Wine Tasting', 'Cooking',
        // Garden & Outdoor
        'Gardening', 'Birdwatching', 'Reading'
      ]
    }
  };
  
  console.log('\n🔧 UPDATING SPANISH CITIES WITH VALID HOBBIES:\n');
  
  for (const [cityName, cityData] of Object.entries(spanishCityHobbies)) {
    // Get the town
    const { data: town } = await supabase
      .from('towns')
      .select('id, name, top_hobbies')
      .eq('name', cityName)
      .eq('country', 'Spain')
      .single();
    
    if (!town) {
      console.log(`⚠️  ${cityName} not found`);
      continue;
    }
    
    // Filter to only include valid hobbies
    const validCityHobbies = cityData.hobbies.filter(h => validHobbies.has(h));
    
    // Update the town
    const { error } = await supabase
      .from('towns')
      .update({ top_hobbies: validCityHobbies })
      .eq('id', town.id);
    
    if (!error) {
      console.log(`✅ ${cityName}: Updated with ${validCityHobbies.length} hobbies`);
      console.log(`   Old: ${town.top_hobbies?.length || 0} hobbies`);
      console.log(`   New: ${validCityHobbies.join(', ')}\n`);
    } else {
      console.log(`❌ ${cityName}: ${error.message}\n`);
    }
  }
  
  console.log('✅ DONE! Spanish cities now have comprehensive, valid hobbies.');
}

// Run the fix
fixSpanishCities().catch(console.error);