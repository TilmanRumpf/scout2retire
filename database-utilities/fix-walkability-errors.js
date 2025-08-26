import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function fixWalkabilityErrors() {
  console.log('🔧 Fixing obvious walkability errors...\n');
  
  // These are clearly not rural towns!
  const corrections = {
    // Major cities
    'Melbourne': 7,      // Major Australian city
    'Sydney': 7,         // Major Australian city
    'Perth': 6,          // Major Australian city
    'Gold Coast': 5,     // Tourist city
    'Bangkok': 5,        // Major Thai city
    'Dubai': 4,          // Car-dependent but has walkable areas
    'Abu Dhabi': 4,      // Similar to Dubai
    'Panama City': 5,    // Casco Viejo is very walkable
    'San Juan': 6,       // Old San Juan is very walkable
    'Cape Town': 5,      // City Bowl and waterfront walkable
    'Ho Chi Minh City': 5, // District 1 is walkable
    
    // Beach/tourist towns
    'Malaga': 7,         // Very walkable Spanish city
    'Marbella': 6,       // Walkable old town
    'Palma de Mallorca': 7, // Very walkable
    'Phuket': 4,         // Patong is walkable
    'Koh Samui': 4,      // Beach areas walkable
    'Honolulu': 6,       // Waikiki very walkable
    
    // Mid-size cities
    'Charleston': 7,     // Historic downtown very walkable
    'Savannah': 7,       // Historic squares very walkable
    'Asheville': 6,      // Downtown walkable
    'Santa Fe': 6,       // Plaza area walkable
    'San Diego': 5,      // Downtown/beach areas walkable
    'Denver': 5,         // Downtown walkable
    'Las Vegas': 5,      // Strip is walkable
    'Orlando': 3,        // Still car-dependent
    'Phoenix': 3,        // Very car-dependent
    'Charlotte': 4,      // Downtown improving
    'Raleigh': 4,        // Downtown walkable
    
    // European cities
    'Haarlem': 8,        // Classic Dutch walkable city
    'Amersfoort': 7,     // Historic center very walkable
    
    // Historic towns
    'Antigua': 8,        // UNESCO site, very walkable
    'Tunis': 5,          // Medina is walkable
    'Hammamet': 5,       // Beach resort, walkable center
    'Sousse': 5,         // Medina and beach walkable
    'Antalya': 6,        // Old town very walkable
    'Bodrum': 6,         // Compact resort town
    
    // New Zealand cities
    'Christchurch': 5,   // Central city walkable
    'Queenstown': 6,     // Compact town center
    'Napier': 5,         // Art deco downtown walkable
    'Tauranga': 4        // Some walkable areas
  };
  
  for (const [townName, score] of Object.entries(corrections)) {
    const { error } = await supabase
      .from('towns')
      .update({ walkability: score })
      .eq('name', townName);
      
    if (!error) {
      console.log(`✅ ${townName}: ${score}/10 (corrected)`);
    } else {
      console.log(`❌ Failed to update ${townName}`);
    }
  }
  
  console.log('\n🎉 Walkability corrections complete!');
}

fixWalkabilityErrors();