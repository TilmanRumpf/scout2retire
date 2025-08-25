import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkActivitiesData() {
  console.log('🎯 CHECKING ACTIVITIES_AVAILABLE DATA\n');
  console.log('=====================================\n');
  
  // Get all towns with their activities data
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, activities_available, geographic_features, water_bodies, climate')
    .order('country, name');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Total towns: ${towns.length}\n`);
  
  // Analyze activities data
  const stats = {
    total: towns.length,
    hasActivities: 0,
    nullActivities: 0,
    emptyArrays: 0,
    totalActivities: 0,
    uniqueActivities: new Set(),
    byActivityCount: {}
  };
  
  const samples = [];
  
  for (const town of towns) {
    if (!town.activities_available || town.activities_available === null) {
      stats.nullActivities++;
    } else if (Array.isArray(town.activities_available)) {
      if (town.activities_available.length === 0) {
        stats.emptyArrays++;
      } else {
        stats.hasActivities++;
        stats.totalActivities += town.activities_available.length;
        
        // Track unique activities
        town.activities_available.forEach(activity => {
          stats.uniqueActivities.add(activity);
        });
        
        // Track by count
        const count = town.activities_available.length;
        stats.byActivityCount[count] = (stats.byActivityCount[count] || 0) + 1;
        
        // Collect samples
        if (samples.length < 10) {
          samples.push({
            name: town.name,
            country: town.country,
            activities: town.activities_available
          });
        }
      }
    }
  }
  
  console.log('📊 STATISTICS:\n');
  console.log(`Towns with activities: ${stats.hasActivities}`);
  console.log(`Towns with NULL activities: ${stats.nullActivities}`);
  console.log(`Towns with empty arrays: ${stats.emptyArrays}`);
  console.log(`Total unique activities: ${stats.uniqueActivities.size}`);
  
  if (stats.hasActivities > 0) {
    console.log(`Average activities per town: ${(stats.totalActivities / stats.hasActivities).toFixed(1)}`);
  }
  
  console.log('\n🔍 DISTRIBUTION BY ACTIVITY COUNT:\n');
  Object.entries(stats.byActivityCount)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([count, towns]) => {
      console.log(`${count} activities: ${towns} towns`);
    });
  
  if (stats.uniqueActivities.size > 0) {
    console.log('\n📋 ALL UNIQUE ACTIVITIES:\n');
    Array.from(stats.uniqueActivities).sort().forEach(activity => {
      console.log(`  - ${activity}`);
    });
  }
  
  console.log('\n🎪 SAMPLE DATA:\n');
  samples.forEach(town => {
    console.log(`${town.name}, ${town.country}:`);
    console.log(`  Activities: [${town.activities.join(', ')}]\n`);
  });
  
  // Check coastal towns without water activities
  console.log('⚠️ POTENTIAL ISSUES:\n');
  
  const coastalNoWaterActivities = towns.filter(t => {
    const hasWaterBodies = t.water_bodies && t.water_bodies.length > 0;
    const hasActivities = t.activities_available && t.activities_available.length > 0;
    
    if (hasWaterBodies && hasActivities) {
      const hasWaterActivity = t.activities_available.some(a => 
        a.toLowerCase().includes('beach') ||
        a.toLowerCase().includes('swim') ||
        a.toLowerCase().includes('surf') ||
        a.toLowerCase().includes('dive') ||
        a.toLowerCase().includes('sail') ||
        a.toLowerCase().includes('boat') ||
        a.toLowerCase().includes('water')
      );
      return !hasWaterActivity;
    }
    return false;
  });
  
  if (coastalNoWaterActivities.length > 0) {
    console.log(`Coastal towns without water activities: ${coastalNoWaterActivities.length}`);
    coastalNoWaterActivities.slice(0, 5).forEach(t => {
      console.log(`  - ${t.name}, ${t.country}`);
    });
  }
  
  // Check mountain towns without hiking
  const mountainNoHiking = towns.filter(t => {
    const features = t.geographic_features?.join(' ').toLowerCase() || '';
    const hasActivities = t.activities_available && t.activities_available.length > 0;
    
    if (features.includes('mountain') && hasActivities) {
      const hasHiking = t.activities_available.some(a => 
        a.toLowerCase().includes('hik') ||
        a.toLowerCase().includes('trek') ||
        a.toLowerCase().includes('mountain')
      );
      return !hasHiking;
    }
    return false;
  });
  
  if (mountainNoHiking.length > 0) {
    console.log(`\nMountain towns without hiking: ${mountainNoHiking.length}`);
    mountainNoHiking.slice(0, 5).forEach(t => {
      console.log(`  - ${t.name}, ${t.country}`);
    });
  }
}

// Run check
checkActivitiesData().catch(console.error);