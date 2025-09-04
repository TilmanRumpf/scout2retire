#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Smart research-based hobby assignment
 * Each hobby should differentiate the town, not be universal
 */
class SmartHobbyResearcher {
  constructor() {
    this.distinctiveHobbies = null;
    this.universalHobbies = null;
  }
  
  async initialize() {
    // Get non-universal hobbies from database
    const { data: distinctive } = await supabase
      .from('hobbies')
      .select('name, category')
      .eq('is_universal', false)
      .order('name');
    
    const { data: universal } = await supabase
      .from('hobbies')
      .select('name')
      .eq('is_universal', true);
    
    this.distinctiveHobbies = new Set(distinctive?.map(h => h.name) || []);
    this.universalHobbies = new Set(universal?.map(h => h.name) || []);
    
    console.log(`📚 Loaded ${this.distinctiveHobbies.size} distinctive hobbies`);
    console.log(`🌍 Identified ${this.universalHobbies.size} universal hobbies to exclude\n`);
    
    // Show what we're excluding
    console.log('Universal hobbies (will be excluded):');
    console.log(`  ${Array.from(this.universalHobbies).join(', ')}\n`);
  }
  
  /**
   * Research distinctive hobbies based on town characteristics
   */
  researchTownHobbies(town) {
    const hobbies = new Set();
    
    // COASTAL TOWNS - Ocean activities
    if (town.distance_to_ocean_km === 0 || town.geographic_features_actual?.includes('coastal')) {
      const coastalActivities = [
        'Sailing', 'Surfing', 'Scuba Diving', 'Snorkeling', 
        'Windsurfing', 'Kitesurfing', 'Deep Sea Fishing',
        'Stand-up Paddleboarding', 'Beach Volleyball', 'Kayaking'
      ];
      
      // Add based on infrastructure
      if (town.marinas_count > 0) {
        this.tryAdd(hobbies, 'Sailing');
        this.tryAdd(hobbies, 'Yachting');
      }
      
      // Surfing for Atlantic/Pacific coasts
      if (town.country === 'Portugal' || town.country === 'Spain' || 
          town.country === 'Australia' || town.country === 'United States') {
        this.tryAdd(hobbies, 'Surfing');
      }
      
      // Mediterranean activities
      if (town.country === 'Spain' || town.country === 'Italy' || 
          town.country === 'Greece' || town.country === 'France') {
        this.tryAdd(hobbies, 'Scuba Diving');
        this.tryAdd(hobbies, 'Snorkeling');
      }
      
      // General coastal
      coastalActivities.forEach(activity => {
        if (hobbies.size < 5) this.tryAdd(hobbies, activity);
      });
    }
    
    // MOUNTAIN TOWNS - Elevation activities
    if (town.elevation_meters > 500 || town.geographic_features_actual?.includes('mountains')) {
      const mountainActivities = [
        'Mountain Biking', 'Rock Climbing', 'Paragliding',
        'Skiing', 'Snowboarding', 'Trail Running', 'Mountain Photography'
      ];
      
      // Winter sports for high elevation
      if (town.elevation_meters > 1000) {
        this.tryAdd(hobbies, 'Skiing');
        this.tryAdd(hobbies, 'Snowboarding');
      }
      
      // General mountain
      mountainActivities.forEach(activity => {
        if (hobbies.size < 8) this.tryAdd(hobbies, activity);
      });
    }
    
    // URBAN CENTERS - City-specific activities
    if (town.population >= 100000 || town.distance_to_urban_center === 0) {
      const urbanActivities = [
        'Theater', 'Opera', 'Museums', 'Jazz Clubs',
        'Art Galleries', 'Food Tours', 'Rooftop Bars',
        'Live Music Venues', 'Comedy Clubs'
      ];
      
      urbanActivities.forEach(activity => {
        if (hobbies.size < 10) this.tryAdd(hobbies, activity);
      });
    }
    
    // SPORTS INFRASTRUCTURE
    if (town.golf_courses_count > 0) {
      this.tryAdd(hobbies, 'Golf');
    }
    if (town.tennis_courts_count > 0) {
      this.tryAdd(hobbies, 'Tennis');
      this.tryAdd(hobbies, 'Padel'); // Popular in Spain/Portugal
    }
    if (town.ski_resorts_count > 0) {
      this.tryAdd(hobbies, 'Skiing');
      this.tryAdd(hobbies, 'Snowboarding');
      this.tryAdd(hobbies, 'Après-ski');
    }
    
    // CULTURAL/REGIONAL SPECIFICS
    const culturalByCountry = {
      'Spain': ['Flamenco', 'Tapas Tours', 'Padel', 'Siesta Culture'],
      'Portugal': ['Fado Music', 'Port Wine Tasting', 'Azulejo Workshops'],
      'Italy': ['Opera', 'Vespa Tours', 'Truffle Hunting', 'Aperitivo'],
      'France': ['Wine Tasting', 'Pétanque', 'Market Shopping', 'Cheese Tasting'],
      'Greece': ['Archaeological Tours', 'Island Hopping', 'Taverna Dancing'],
      'Thailand': ['Muay Thai', 'Temple Tours', 'Street Food Tours', 'Thai Massage'],
      'Japan': ['Onsen Bathing', 'Tea Ceremony', 'Calligraphy', 'Karaoke'],
      'Australia': ['Cricket', 'Australian Rules Football', 'Barbecues', 'Bush Walking'],
      'United States': ['Baseball', 'American Football', 'BBQ', 'Craft Beer Tours']
    };
    
    const cultural = culturalByCountry[town.country];
    if (cultural) {
      cultural.forEach(activity => {
        if (hobbies.size < 10) this.tryAdd(hobbies, activity);
      });
    }
    
    // CLIMATE-BASED
    if (town.climate_actual?.includes('tropical')) {
      this.tryAdd(hobbies, 'Tropical Gardening');
      this.tryAdd(hobbies, 'Outdoor Yoga');
    }
    if (town.climate_actual?.includes('desert')) {
      this.tryAdd(hobbies, 'Desert Photography');
      this.tryAdd(hobbies, 'Stargazing');
    }
    
    // Return top 10 distinctive hobbies
    return Array.from(hobbies).slice(0, 10);
  }
  
  /**
   * Try to add hobby if it's distinctive and valid
   */
  tryAdd(hobbiesSet, hobbyName) {
    // Skip if universal
    if (this.universalHobbies.has(hobbyName)) {
      return false;
    }
    
    // Only add if it exists in our distinctive hobbies
    if (this.distinctiveHobbies.has(hobbyName)) {
      hobbiesSet.add(hobbyName);
      return true;
    }
    
    return false;
  }
}

/**
 * Process towns in batches
 */
async function processBatch(researcher, batchName, filter) {
  console.log(`\n🔍 RESEARCHING: ${batchName}\n`);
  
  // Get towns matching filter
  let query = supabase
    .from('towns')
    .select('*')
    .order('population', { ascending: false })
    .limit(20);
  
  // Apply filter
  if (filter.coastal) {
    query = query.eq('distance_to_ocean_km', 0);
  }
  if (filter.mountain) {
    query = query.gte('elevation_meters', 500);
  }
  if (filter.urban) {
    query = query.gte('population', 100000);
  }
  if (filter.country) {
    query = query.eq('country', filter.country);
  }
  
  const { data: towns } = await query;
  
  if (!towns || towns.length === 0) {
    console.log('No towns found for this batch');
    return 0;
  }
  
  let updated = 0;
  for (const town of towns) {
    const distinctiveHobbies = researcher.researchTownHobbies(town);
    
    if (distinctiveHobbies.length > 0) {
      const { error } = await supabase
        .from('towns')
        .update({ top_hobbies: distinctiveHobbies })
        .eq('id', town.id);
      
      if (!error) {
        console.log(`✅ ${town.name}, ${town.country}`);
        console.log(`   Population: ${town.population?.toLocaleString() || 'N/A'}, Ocean: ${town.distance_to_ocean_km}km`);
        console.log(`   Distinctive: ${distinctiveHobbies.join(', ')}\n`);
        updated++;
      }
    } else {
      console.log(`⚠️  ${town.name} - No distinctive hobbies found\n`);
    }
  }
  
  return updated;
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 SMART HOBBY POPULATION - DISTINCTIVE ACTIVITIES ONLY\n');
  console.log('Removing universal hobbies and focusing on what makes each town unique.\n');
  
  const researcher = new SmartHobbyResearcher();
  await researcher.initialize();
  
  // Process in smart batches
  const batches = [
    { name: 'Spanish Coastal Cities', filter: { coastal: true, country: 'Spain' } },
    { name: 'Portuguese Cities', filter: { country: 'Portugal' } },
    { name: 'Italian Cities', filter: { country: 'Italy' } },
    { name: 'Major Urban Centers', filter: { urban: true } },
    { name: 'Mountain Towns', filter: { mountain: true } },
    { name: 'French Cities', filter: { country: 'France' } }
  ];
  
  let totalUpdated = 0;
  
  // Process first batch only (for testing)
  const batch = batches[0];
  const updated = await processBatch(researcher, batch.name, batch.filter);
  totalUpdated += updated;
  
  console.log('\n📊 SUMMARY:');
  console.log(`Updated ${totalUpdated} towns with distinctive hobbies`);
  console.log('Universal hobbies removed, only location-specific activities remain');
  console.log('\nRun again with different batches to continue population.');
}

// Run the smart research
main().catch(console.error);