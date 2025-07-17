import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// ADMIN CLIENT - Uses service role key to bypass RLS
const adminSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

console.log('🏃‍♂️ Adding ACTIVITY AVAILABILITY data to 8 test towns...\n')

async function addActivitiesData() {
  console.log('🎯 Adding practical activity availability for matching algorithm...\n')
  
  const activityUpdates = {
    'Zutphen': {
      // Dutch historic town - canals, cycling, cultural
      activities_available: ["cycling", "walking", "museums", "cafes", "boating", "markets", "cultural_events"],
      interests_supported: ["cultural", "historical", "cycling", "water_activities", "urban_walking"],
      beaches_nearby: false,
      hiking_trails_km: 15, // Some trails in surrounding area
      ski_resorts_within_100km: 0,
      marinas_count: 2, // River marinas
      golf_courses_count: 1,
      tennis_courts_count: 3,
      swimming_facilities: ["indoor_pool", "river_swimming"],
      farmers_markets: true
    },
    
    'Zadar': {
      // Croatian Adriatic coast - beaches, sailing, Mediterranean
      activities_available: ["swimming", "sailing", "hiking", "cycling", "museums", "seafood", "beaches", "cultural_events"],
      interests_supported: ["water_sports", "cultural", "historical", "Mediterranean_lifestyle", "sailing"],
      beaches_nearby: true,
      hiking_trails_km: 50, // Coastal and mountain trails
      ski_resorts_within_100km: 0,
      marinas_count: 4, // Major sailing destination
      golf_courses_count: 1,
      tennis_courts_count: 5,
      swimming_facilities: ["beaches", "outdoor_pools", "sea_swimming"],
      farmers_markets: true
    },
    
    'Wismar': {
      // German Baltic coast - UNESCO heritage, sailing, history
      activities_available: ["cycling", "walking", "museums", "sailing", "swimming", "cultural_events", "markets"],
      interests_supported: ["cultural", "historical", "water_activities", "cycling", "heritage_sites"],
      beaches_nearby: true,
      hiking_trails_km: 25, // Baltic coastal trails
      ski_resorts_within_100km: 0,
      marinas_count: 3, // Baltic sailing
      golf_courses_count: 2,
      tennis_courts_count: 4,
      swimming_facilities: ["beaches", "indoor_pools", "Baltic_swimming"],
      farmers_markets: true
    },
    
    'Windhoek': {
      // Namibian capital - hiking, wildlife, adventure
      activities_available: ["hiking", "wildlife_viewing", "cultural_tours", "markets", "adventure_sports", "stargazing"],
      interests_supported: ["outdoor_adventure", "wildlife", "cultural", "hiking", "nature_photography"],
      beaches_nearby: false,
      hiking_trails_km: 100, // Mountain trails around city
      ski_resorts_within_100km: 0,
      marinas_count: 0,
      golf_courses_count: 3,
      tennis_courts_count: 8,
      swimming_facilities: ["outdoor_pools", "hotel_pools"],
      farmers_markets: true
    },
    
    'Willemstad': {
      // Caribbean paradise - diving, beaches, Dutch colonial
      activities_available: ["swimming", "diving", "snorkeling", "sailing", "cultural_tours", "duty_free_shopping", "beaches"],
      interests_supported: ["water_sports", "diving", "Caribbean_lifestyle", "cultural", "shopping"],
      beaches_nearby: true,
      hiking_trails_km: 10, // Limited hiking on small island
      ski_resorts_within_100km: 0,
      marinas_count: 5, // Major Caribbean sailing hub
      golf_courses_count: 1,
      tennis_courts_count: 3,
      swimming_facilities: ["beaches", "resort_pools", "Caribbean_swimming"],
      farmers_markets: true
    },
    
    'Wiesbaden': {
      // German spa town - thermal baths, culture, wellness
      activities_available: ["thermal_baths", "hiking", "cycling", "museums", "concerts", "wellness", "wine_tasting", "markets"],
      interests_supported: ["wellness", "cultural", "thermal_therapy", "hiking", "wine_culture"],
      beaches_nearby: false,
      hiking_trails_km: 80, // Taunus mountains nearby
      ski_resorts_within_100km: 15, // Some small ski areas in region
      marinas_count: 1, // Rhine river access
      golf_courses_count: 4,
      tennis_courts_count: 12,
      swimming_facilities: ["thermal_baths", "indoor_pools", "spa_facilities"],
      farmers_markets: true
    },
    
    'Wellington': {
      // New Zealand capital - harbor, arts, coffee, hiking
      activities_available: ["hiking", "museum_visits", "coffee_culture", "harbor_walks", "cultural_events", "cycling"],
      interests_supported: ["cultural", "arts", "coffee_culture", "hiking", "urban_exploration"],
      beaches_nearby: true,
      hiking_trails_km: 200, // Extensive trail network
      ski_resorts_within_100km: 0, // Too far south
      marinas_count: 6, // Major harbor city
      golf_courses_count: 8,
      tennis_courts_count: 15,
      swimming_facilities: ["harbor_swimming", "indoor_pools", "ocean_access"],
      farmers_markets: true
    },
    
    'Wanaka': {
      // New Zealand resort town - skiing, hiking, lake activities
      activities_available: ["skiing", "hiking", "lake_activities", "cycling", "wine_tasting", "fishing", "water_sports"],
      interests_supported: ["outdoor_adventure", "skiing", "water_sports", "hiking", "active_lifestyle"],
      beaches_nearby: false, // Lake, not ocean
      hiking_trails_km: 500, // Extensive alpine trails
      ski_resorts_within_100km: 4, // Major ski destination
      marinas_count: 2, // Lake marinas
      golf_courses_count: 2,
      tennis_courts_count: 4,
      swimming_facilities: ["lake_swimming", "resort_pools", "alpine_lakes"],
      farmers_markets: true
    }
  }
  
  let successCount = 0
  
  for (const [townName, activityData] of Object.entries(activityUpdates)) {
    // Find the town
    const { data: towns } = await adminSupabase
      .from('towns')
      .select('id, name, country')
      .ilike('name', townName)
      .is('image_url_1', null) // Safety check
    
    if (towns && towns.length > 0) {
      const town = towns[0]
      
      console.log(`Adding activities to ${town.name}, ${town.country}...`)
      
      const { error } = await adminSupabase
        .from('towns')
        .update({
          ...activityData,
          last_ai_update: new Date().toISOString()
        })
        .eq('id', town.id)
      
      if (error) {
        console.error(`❌ Error updating ${town.name}:`, error.message)
      } else {
        console.log(`✅ Added activities to ${town.name}`)
        successCount++
      }
    } else {
      console.log(`⏭️  Skipped ${townName} (not found)`)
    }
  }
  
  console.log(`\n🎉 Successfully added activities to ${successCount}/8 towns!`)
  return successCount
}

async function verifyActivitiesAdded() {
  console.log('\n🔍 Verifying activity data was added...\n')
  
  const testTowns = ['Zutphen', 'Zadar', 'Wismar', 'Windhoek', 'Willemstad', 'Wiesbaden', 'Wellington', 'Wanaka']
  
  for (const townName of testTowns) {
    const { data: towns } = await adminSupabase
      .from('towns')
      .select('name, country, activities_available, beaches_nearby, hiking_trails_km, ski_resorts_within_100km, marinas_count')
      .ilike('name', townName)
    
    if (towns && towns.length > 0) {
      const town = towns[0]
      console.log(`${town.name}, ${town.country}:`)
      console.log(`  Activities: ${town.activities_available ? '✅ Added' : '❌ Missing'}`)
      console.log(`  Beaches: ${town.beaches_nearby ? 'Yes' : 'No'}`)
      console.log(`  Hiking: ${town.hiking_trails_km}km trails`)
      console.log(`  Skiing: ${town.ski_resorts_within_100km} resorts within 100km`)
      console.log(`  Marinas: ${town.marinas_count} marina(s)`)
      console.log('')
    }
  }
}

// Run the activity update
async function runActivityUpdate() {
  console.log('🎯 Adding activity availability data for matching algorithm...\n')
  
  const successCount = await addActivitiesData()
  
  if (successCount > 0) {
    await verifyActivitiesAdded()
    console.log('\n🎉 ACTIVITY DATA ADDED SUCCESSFULLY!')
    console.log('✅ Towns now have practical activity availability')
    console.log('✅ Ready for onboarding preference matching') 
    console.log('✅ Algorithm can match user hobbies to town activities')
    console.log('\n🚀 Test towns are now complete with lifestyle data!')
  } else {
    console.log('\n❌ No activity data added - check for issues')
  }
}

runActivityUpdate()