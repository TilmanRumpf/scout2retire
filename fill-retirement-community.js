import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function fillRetirementCommunity() {
  console.log('🏘️ Filling retirement community presence data...\n');
  console.log('Values: none, minimal, moderate, strong, very_strong\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Known retirement hotspots
  const RETIREMENT_HOTSPOTS = {
    // Very strong presence
    very_strong: [
      // US retirement meccas
      'The Villages', 'Naples', 'Scottsdale', 'Palm Beach', 'Sarasota',
      'Fort Myers', 'Clearwater', 'Venice (FL)', 'Hilton Head Island',
      
      // International hotspots
      'Algarve', 'Costa del Sol', 'Marbella', 'Cascais', 'Vilamoura',
      'Playa del Carmen', 'Puerto Vallarta', 'San Miguel de Allende',
      'Tamarindo', 'Coronado', 'Boquete', 'George Town', 'Penang'
    ],
    
    // Strong presence
    strong: [
      // US cities
      'Phoenix', 'Tucson', 'Las Vegas', 'San Diego', 'Charleston', 'Savannah',
      'Asheville', 'Myrtle Beach', 'St. George', 'Palm Springs',
      
      // Europe
      'Nice', 'Cannes', 'Antibes', 'Malaga', 'Alicante', 'Valencia',
      'Barcelona', 'Porto', 'Lisbon', 'Malta', 'Cyprus',
      
      // Asia/Pacific
      'Chiang Mai', 'Hua Hin', 'Phuket', 'Bali', 'Da Nang', 'Gold Coast',
      'Queenstown', 'Tauranga'
    ],
    
    // Moderate presence
    moderate: [
      // Mid-size US cities
      'Raleigh', 'Charlotte', 'Jacksonville', 'Orlando', 'Denver',
      'Portland', 'Boise', 'Chattanooga', 'Lancaster',
      
      // International
      'Medellin', 'Cuenca', 'Buenos Aires', 'Montevideo', 'Cape Town',
      'Kuala Lumpur', 'Bangkok', 'Singapore', 'Auckland', 'Wellington'
    ]
  };
  
  // Country patterns for retirement visas/programs
  const RETIREMENT_FRIENDLY = {
    // Countries with specific retirement visa programs
    strong_countries: ['Portugal', 'Spain', 'Mexico', 'Costa Rica', 'Panama', 
                      'Malaysia', 'Thailand', 'Philippines'],
    
    // Countries popular with retirees
    moderate_countries: ['France', 'Italy', 'Greece', 'Turkey', 'Ecuador',
                        'Colombia', 'Uruguay', 'South Africa', 'New Zealand']
  };
  
  const missingData = towns.filter(t => t.retirement_community_presence === null);
  console.log(`🎯 Found ${missingData.length} towns missing retirement community data\n`);
  
  const updates = [];
  
  missingData.forEach(town => {
    let presence = 'none'; // default
    let reason = 'default';
    
    // Check specific hotspots
    if (RETIREMENT_HOTSPOTS.very_strong.includes(town.name)) {
      presence = 'very_strong';
      reason = 'known hotspot';
    }
    else if (RETIREMENT_HOTSPOTS.strong.includes(town.name)) {
      presence = 'strong';
      reason = 'known destination';
    }
    else if (RETIREMENT_HOTSPOTS.moderate.includes(town.name)) {
      presence = 'moderate';
      reason = 'growing community';
    }
    // Check by country and characteristics
    else if (RETIREMENT_FRIENDLY.strong_countries.includes(town.country)) {
      // Large expat community + good healthcare = likely retirement presence
      if (town.expat_community_size === 'large') {
        presence = 'strong';
        reason = 'large expats + retirement visa';
      }
      else if (town.expat_community_size === 'medium') {
        presence = 'moderate';
        reason = 'medium expats + retirement visa';
      }
      else if (town.english_speaking_doctors && town.safety_score >= 7) {
        presence = 'minimal';
        reason = 'good healthcare + retirement visa';
      }
      else {
        presence = 'minimal';
        reason = 'retirement visa country';
      }
    }
    else if (RETIREMENT_FRIENDLY.moderate_countries.includes(town.country)) {
      if (town.expat_community_size === 'large') {
        presence = 'moderate';
        reason = 'large expat community';
      }
      else if (town.expat_community_size === 'medium') {
        presence = 'minimal';
        reason = 'medium expat community';
      }
      else {
        presence = 'none';
        reason = 'no significant expats';
      }
    }
    // US specific patterns
    else if (town.country === 'United States') {
      // Florida is retirement central
      if (town.state_code === 'FL') {
        if (town.population > 50000) {
          presence = 'strong';
          reason = 'Florida + large city';
        } else {
          presence = 'moderate';
          reason = 'Florida retirement state';
        }
      }
      // Arizona, South Carolina also popular
      else if (['AZ', 'SC', 'NC', 'TX', 'NV'].includes(town.state_code)) {
        if (town.population > 100000) {
          presence = 'moderate';
          reason = 'retirement state + size';
        } else {
          presence = 'minimal';
          reason = 'retirement state';
        }
      }
      // Coastal towns often attract retirees
      else if (town.geographic_features?.includes('Coastal')) {
        presence = 'minimal';
        reason = 'coastal US town';
      }
    }
    // Check other indicators
    else {
      // Large cities with good healthcare
      if (town.population > 500000 && town.hospital_count > 10) {
        presence = 'moderate';
        reason = 'large city + healthcare';
      }
      // Tourist areas with expats
      else if (town.expat_community_size && town.expat_community_size !== 'none') {
        presence = 'minimal';
        reason = 'has expat community';
      }
      // Coastal with amenities
      else if (town.geographic_features?.includes('Coastal') && 
               town.english_speaking_doctors) {
        presence = 'minimal';
        reason = 'coastal + English doctors';
      }
    }
    
    console.log(`${town.name}, ${town.country}: ${presence} (${reason})`);
    
    updates.push({
      id: town.id,
      retirement_community_presence: presence
    });
  });
  
  console.log(`\n💾 Ready to update ${updates.length} towns`);
  
  // Update in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    for (const update of batch) {
      const { error } = await supabase
        .from('towns')
        .update({ retirement_community_presence: update.retirement_community_presence })
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updates.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Retirement community presence update complete!');
  
  // Summary
  const { data: allTowns } = await supabase
    .from('towns')
    .select('retirement_community_presence');
    
  const counts = {
    very_strong: 0,
    strong: 0,
    moderate: 0,
    minimal: 0,
    none: 0
  };
  
  allTowns.forEach(t => {
    if (t.retirement_community_presence) {
      counts[t.retirement_community_presence]++;
    }
  });
  
  console.log('\n📊 Retirement Community Distribution:');
  console.log(`Very Strong: ${counts.very_strong} towns (${(counts.very_strong/341*100).toFixed(1)}%)`);
  console.log(`Strong: ${counts.strong} towns (${(counts.strong/341*100).toFixed(1)}%)`);
  console.log(`Moderate: ${counts.moderate} towns (${(counts.moderate/341*100).toFixed(1)}%)`);
  console.log(`Minimal: ${counts.minimal} towns (${(counts.minimal/341*100).toFixed(1)}%)`);
  console.log(`None: ${counts.none} towns (${(counts.none/341*100).toFixed(1)}%)`);
}

fillRetirementCommunity();