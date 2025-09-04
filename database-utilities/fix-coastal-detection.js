#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCoastalTowns() {
  console.log('🌊 FIXING COASTAL TOWNS WITH WATER SPORTS\n');
  
  // Get distinctive hobbies
  const { data: hobbies } = await supabase
    .from('hobbies')
    .select('name')
    .eq('is_universal', false);
  
  const validHobbies = new Set(hobbies.map(h => h.name));
  
  // Get coastal towns (using lowercase 'coastal')
  const { data: coastalTowns } = await supabase
    .from('towns')
    .select('*')
    .contains('geographic_features_actual', ['coastal']);
  
  console.log(`Found ${coastalTowns?.length || 0} coastal towns\n`);
  
  let updated = 0;
  
  for (const town of coastalTowns || []) {
    const hobbies = [];
    
    // WATER SPORTS - Primary for coastal
    if (validHobbies.has('Swimming')) hobbies.push('Swimming');
    if (validHobbies.has('Sailing')) hobbies.push('Sailing');
    if (validHobbies.has('Surfing')) hobbies.push('Surfing');
    if (validHobbies.has('Scuba Diving')) hobbies.push('Scuba Diving');
    if (validHobbies.has('Snorkeling')) hobbies.push('Snorkeling');
    if (validHobbies.has('Kayaking')) hobbies.push('Kayaking');
    if (validHobbies.has('Stand-up Paddleboarding')) hobbies.push('Stand-up Paddleboarding');
    if (validHobbies.has('Windsurfing')) hobbies.push('Windsurfing');
    
    // Marina activities
    if (town.marinas_count > 0) {
      if (validHobbies.has('Boating')) hobbies.push('Boating');
      if (validHobbies.has('Deep Sea Fishing')) hobbies.push('Deep Sea Fishing');
      if (validHobbies.has('Jet Skiing')) hobbies.push('Jet Skiing');
    } else {
      if (validHobbies.has('Fishing')) hobbies.push('Fishing');
    }
    
    // Beach wellness
    if (validHobbies.has('Water Aerobics')) hobbies.push('Water Aerobics');
    
    // Golf & Tennis if available
    if (town.golf_courses_count > 0 && validHobbies.has('Golf')) {
      hobbies.push('Golf');
    }
    if (town.tennis_courts_count > 0 && validHobbies.has('Tennis')) {
      hobbies.push('Tennis');
    }
    
    // Urban activities if large enough
    if (town.population >= 50000) {
      if (validHobbies.has('Museums')) hobbies.push('Museums');
      if (validHobbies.has('Food Tours')) hobbies.push('Food Tours');
      if (validHobbies.has('Theater')) hobbies.push('Theater');
    }
    
    // Limit to 10 distinctive hobbies
    const distinctiveHobbies = hobbies.slice(0, 10);
    
    if (distinctiveHobbies.length > 0) {
      const { error } = await supabase
        .from('towns')
        .update({ top_hobbies: distinctiveHobbies })
        .eq('id', town.id);
      
      if (!error) {
        console.log(`✅ ${town.name}, ${town.country}`);
        console.log(`   Pop: ${town.population?.toLocaleString()}, Marinas: ${town.marinas_count}`);
        console.log(`   → ${distinctiveHobbies.join(', ')}\n`);
        updated++;
      }
    }
  }
  
  console.log(`\n📊 SUMMARY: Updated ${updated} coastal towns with water sports`);
  
  // Verify some examples
  console.log('\n🔍 VERIFICATION:\n');
  
  const examples = ['Alicante', 'Valencia', 'Barcelona', 'Nice', 'Lagos'];
  for (const name of examples) {
    const { data: town } = await supabase
      .from('towns')
      .select('name, country, top_hobbies')
      .eq('name', name)
      .single();
    
    if (town) {
      const waterSports = ['Swimming', 'Sailing', 'Surfing', 'Scuba Diving', 'Kayaking'];
      const hasWaterSports = town.top_hobbies?.some(h => waterSports.includes(h));
      console.log(`${town.name}, ${town.country}: ${hasWaterSports ? '✅ Has water sports' : '❌ Missing water sports'}`);
    }
  }
}

// Run the fix
fixCoastalTowns().catch(console.error);