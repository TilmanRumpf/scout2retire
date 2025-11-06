#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * UPDATED THRESHOLDS (Simple and Clear):
 * - Urban: 100,000+ residents
 * - Suburban: 20,000-100,000 residents
 * - Rural: <20,000 residents
 */
const URBAN_THRESHOLD = 100000;
const SUBURBAN_THRESHOLD = 20000;

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

async function recalculateUrbanDistance() {
  console.log('🌍 RECALCULATING distance_to_urban_center with new thresholds\n');
  console.log('New definitions:');
  console.log('- Urban: ≥100,000 residents');
  console.log('- Suburban: 20,000-99,999 residents');
  console.log('- Rural: <20,000 residents\n');
  
  try {
    // Step 1: Get all TRUE urban centers (population >= 100,000)
    console.log('1. Finding TRUE urban centers (population ≥ 100,000)...');
    const { data: urbanCenters, error: urbanError } = await supabase
      .from('towns')
      .select('id, town_name, country, latitude, longitude, population')
      .gte('population', URBAN_THRESHOLD)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('population', { ascending: false });
    
    if (urbanError) {
      console.error('Error fetching urban centers:', urbanError);
      return;
    }
    
    console.log(`✅ Found ${urbanCenters.length} TRUE urban centers\n`);
    
    // Show top 10 urban centers
    console.log('Top 10 Urban Centers:');
    urbanCenters.slice(0, 10).forEach(city => {
      console.log(`  - ${city.name}, ${city.country}: ${city.population.toLocaleString()} residents`);
    });
    
    // Group urban centers by country for efficiency
    const urbanByCountry = {};
    urbanCenters.forEach(city => {
      if (!urbanByCountry[city.country]) {
        urbanByCountry[city.country] = [];
      }
      urbanByCountry[city.country].push(city);
    });
    
    console.log('\nUrban centers by country:');
    Object.entries(urbanByCountry).forEach(([country, cities]) => {
      console.log(`  ${country}: ${cities.length} urban centers`);
    });
    
    // Step 2: Get all towns for distance calculation
    console.log('\n2. Fetching all towns for distance calculation...');
    const { data: allTowns, error: townsError } = await supabase
      .from('towns')
      .select('id, town_name, country, latitude, longitude, population')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);
    
    if (townsError) {
      console.error('Error fetching towns:', townsError);
      return;
    }
    
    console.log(`Processing ${allTowns.length} towns...\n`);
    
    // Step 3: Calculate distances
    const updates = [];
    let urbanCount = 0;
    let suburbanCount = 0;
    let ruralCount = 0;
    
    for (const town of allTowns) {
      // If town itself is urban (>= 100,000), distance = 0
      if (town.population >= URBAN_THRESHOLD) {
        updates.push({
          id: town.id,
          distance_to_urban_center: 0
        });
        urbanCount++;
        continue;
      }
      
      // Find nearest urban center
      let minDistance = 999999;
      let nearestCity = null;
      
      // Prioritize urban centers in same country
      const sameCountryUrban = urbanByCountry[town.country] || [];
      for (const city of sameCountryUrban) {
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
      
      // If no urban center in same country or very far (>300km), check all centers
      if (minDistance > 300) {
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
        distance_to_urban_center: minDistance < 999999 ? minDistance : null,
        nearest_urban: nearestCity ? `${nearestCity.name}, ${nearestCity.country}` : null
      });
      
      // Count by category
      if (town.population >= SUBURBAN_THRESHOLD) {
        suburbanCount++;
      } else {
        ruralCount++;
      }
    }
    
    // Step 4: Update database
    console.log('3. Updating database with new distances...');
    let updatedCount = 0;
    const batchSize = 50;
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      for (const update of batch) {
        const { error } = await supabase
          .from('towns')
          .update({ distance_to_urban_center: update.distance_to_urban_center })
          .eq('id', update.id);
        
        if (!error) {
          updatedCount++;
        }
      }
      
      if ((i + batchSize) % 100 === 0) {
        console.log(`  Updated ${Math.min(i + batchSize, updates.length)}/${updates.length} towns...`);
      }
    }
    
    console.log(`✅ Updated ${updatedCount} towns\n`);
    
    // Step 5: Analysis and statistics
    console.log('📊 ANALYSIS WITH NEW THRESHOLDS:\n');
    
    console.log('Town Categories:');
    console.log(`- Urban (≥100k): ${urbanCount} towns`);
    console.log(`- Suburban (20k-99k): ${suburbanCount} towns`);
    console.log(`- Rural (<20k): ${ruralCount} towns\n`);
    
    // Get distance statistics
    const { data: stats } = await supabase
      .from('towns')
      .select('distance_to_urban_center, population')
      .not('distance_to_urban_center', 'is', null);
    
    if (stats) {
      const distances = stats.map(t => t.distance_to_urban_center);
      
      // Distance bands
      const urban = distances.filter(d => d === 0).length;
      const nearUrban = distances.filter(d => d > 0 && d <= 40).length;
      const midDistance = distances.filter(d => d > 40 && d <= 100).length;
      const farDistance = distances.filter(d => d > 100 && d <= 200).length;
      const veryFar = distances.filter(d => d > 200).length;
      
      console.log('Distance to Nearest Urban Center (≥100k):');
      console.log(`- 0 km (is urban): ${urban} towns`);
      console.log(`- 1-40 km (urban spillover): ${nearUrban} towns`);
      console.log(`- 41-100 km (moderate access): ${midDistance} towns`);
      console.log(`- 101-200 km (limited access): ${farDistance} towns`);
      console.log(`- >200 km (isolated): ${veryFar} towns\n`);
      
      const avgDistance = Math.round(distances.reduce((a,b) => a+b, 0) / distances.length);
      console.log(`Average distance to urban center: ${avgDistance} km\n`);
    }
    
    // Show examples from each category
    console.log('📍 EXAMPLE TOWNS:\n');
    
    // Urban examples
    console.log('URBAN CENTERS (population ≥100k):');
    const { data: urbanExamples } = await supabase
      .from('towns')
      .select('town_name, country, population')
      .gte('population', URBAN_THRESHOLD)
      .order('population', { ascending: false })
      .limit(5);
    
    urbanExamples?.forEach(t => {
      console.log(`  - ${t.town_name}, ${t.country}: ${t.population.toLocaleString()}`);
    });
    
    // Suburban examples
    console.log('\nSUBURBAN TOWNS (20k-99k):');
    const { data: suburbanExamples } = await supabase
      .from('towns')
      .select('town_name, country, population, distance_to_urban_center')
      .gte('population', SUBURBAN_THRESHOLD)
      .lt('population', URBAN_THRESHOLD)
      .order('population', { ascending: false })
      .limit(5);
    
    suburbanExamples?.forEach(t => {
      console.log(`  - ${t.town_name}, ${t.country}: ${t.population.toLocaleString()} (${t.distance_to_urban_center}km to urban)`);
    });
    
    // Rural near urban
    console.log('\nRURAL NEAR URBAN (<20k, within 40km):');
    const { data: ruralNearUrban } = await supabase
      .from('towns')
      .select('town_name, country, population, distance_to_urban_center')
      .lt('population', SUBURBAN_THRESHOLD)
      .gt('distance_to_urban_center', 0)
      .lte('distance_to_urban_center', 40)
      .order('distance_to_urban_center')
      .limit(5);
    
    ruralNearUrban?.forEach(t => {
      console.log(`  - ${t.town_name}, ${t.country}: ${t.population?.toLocaleString() || 'N/A'} (${t.distance_to_urban_center}km to urban)`);
    });
    
    console.log('\n✅ RECALCULATION COMPLETE!');
    console.log('\nThe inference system now uses more accurate urban definitions:');
    console.log('- True urban centers have full amenities (museums, theater, shopping)');
    console.log('- Suburban towns have moderate amenities (basic shopping, dining)');
    console.log('- Rural areas rely on distance to urban for amenity access');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the recalculation
recalculateUrbanDistance().catch(console.error);