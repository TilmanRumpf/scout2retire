#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c); // Return distance in km, rounded
}

async function populateDistanceToUrban() {
  console.log('🌍 Populating distance_to_urban_center for all towns...\n');
  
  try {
    // Step 1: Get all urban centers (population >= 50,000)
    console.log('1. Finding urban centers (population >= 50,000)...');
    const { data: urbanCenters, error: urbanError } = await supabase
      .from('towns')
      .select('id, name, country, latitude, longitude, population')
      .gte('population', 50000)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);
    
    if (urbanError) {
      console.error('Error fetching urban centers:', urbanError);
      return;
    }
    
    console.log(`Found ${urbanCenters.length} urban centers\n`);
    
    // Group urban centers by country for efficiency
    const urbanByCountry = {};
    urbanCenters.forEach(city => {
      if (!urbanByCountry[city.country]) {
        urbanByCountry[city.country] = [];
      }
      urbanByCountry[city.country].push(city);
    });
    
    // Step 2: Get all towns that need distance calculation
    console.log('2. Fetching all towns...');
    const { data: allTowns, error: townsError } = await supabase
      .from('towns')
      .select('id, name, country, latitude, longitude, population')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);
    
    if (townsError) {
      console.error('Error fetching towns:', townsError);
      return;
    }
    
    console.log(`Processing ${allTowns.length} towns...\n`);
    
    // Step 3: Calculate distances and prepare updates
    const updates = [];
    let processedCount = 0;
    
    for (const town of allTowns) {
      // If town itself is urban center, distance = 0
      if (town.population >= 50000) {
        updates.push({
          id: town.id,
          distance_to_urban_center: 0
        });
        processedCount++;
        continue;
      }
      
      // Find nearest urban center, prioritizing same country
      let minDistance = 999999;
      let nearestCity = null;
      
      // First check urban centers in same country
      const samCountryUrban = urbanByCountry[town.country] || [];
      for (const city of samCountryUrban) {
        if (city.id === town.id) continue; // Skip self
        
        const distance = calculateDistance(
          town.latitude, town.longitude,
          city.latitude, city.longitude
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestCity = city;
        }
      }
      
      // If no urban center in same country or very far, check neighboring countries
      if (minDistance > 200) {
        for (const city of urbanCenters) {
          if (city.id === town.id) continue;
          
          const distance = calculateDistance(
            town.latitude, town.longitude,
            city.latitude, city.longitude
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            nearestCity = city;
          }
        }
      }
      
      updates.push({
        id: town.id,
        distance_to_urban_center: minDistance < 999999 ? minDistance : null
      });
      
      processedCount++;
      
      // Log progress
      if (processedCount % 50 === 0) {
        console.log(`Processed ${processedCount}/${allTowns.length} towns...`);
      }
    }
    
    // Step 4: Update database in batches
    console.log('\n3. Updating database...');
    const batchSize = 50;
    let updatedCount = 0;
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      // Update each town in the batch
      for (const update of batch) {
        const { error } = await supabase
          .from('towns')
          .update({ distance_to_urban_center: update.distance_to_urban_center })
          .eq('id', update.id);
        
        if (error) {
          console.error(`Error updating town ${update.id}:`, error);
        } else {
          updatedCount++;
        }
      }
      
      console.log(`Updated ${Math.min(i + batchSize, updates.length)}/${updates.length} towns...`);
    }
    
    // Step 5: Show summary statistics
    console.log('\n✅ COMPLETE! Summary statistics:\n');
    
    const { data: stats } = await supabase
      .from('towns')
      .select('distance_to_urban_center')
      .not('distance_to_urban_center', 'is', null);
    
    if (stats) {
      const distances = stats.map(t => t.distance_to_urban_center);
      const urbanSpillover = distances.filter(d => d <= 40).length;
      const suburban = distances.filter(d => d > 40 && d <= 100).length;
      const rural = distances.filter(d => d > 100).length;
      
      console.log('Distance distribution:');
      console.log(`- Urban centers (0 km): ${distances.filter(d => d === 0).length}`);
      console.log(`- Urban spillover (1-40 km): ${urbanSpillover}`);
      console.log(`- Suburban (41-100 km): ${suburban}`);
      console.log(`- Rural (>100 km): ${rural}`);
      console.log(`- Average distance: ${Math.round(distances.reduce((a,b) => a+b, 0) / distances.length)} km`);
    }
    
    // Show some examples
    console.log('\nExample towns with distances:');
    const { data: examples } = await supabase
      .from('towns')
      .select('name, country, population, distance_to_urban_center')
      .not('distance_to_urban_center', 'is', null)
      .order('distance_to_urban_center', { ascending: true })
      .limit(10);
    
    examples.forEach(t => {
      const type = t.distance_to_urban_center === 0 ? 'URBAN CENTER' :
                   t.distance_to_urban_center <= 40 ? 'Urban spillover' :
                   t.distance_to_urban_center <= 100 ? 'Suburban' : 'Rural';
      console.log(`- ${t.name}, ${t.country}: ${t.distance_to_urban_center}km (${type})`);
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the population script
populateDistanceToUrban().catch(console.error);