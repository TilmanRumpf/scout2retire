import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// ADMIN CLIENT - Uses service role key to bypass RLS
const adminSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

console.log('🚀 Starting comprehensive update for all 71 towns with photos...\n')

// Town data organized by region for better management
const townDataByRegion = {
  // EUROPE - WESTERN
  'Vienna, Austria': {
    description: "Vienna enchants retirees with imperial grandeur, world-class healthcare, and vibrant cultural life. This elegant capital offers the perfect blend of old-world charm and modern amenities.",
    cost_index: 2200,
    healthcare_score: 9,
    climate_description: "Continental climate with warm summers (25°C) and cold winters (0°C). Four distinct seasons with occasional snow.",
    lifestyle_description: "Sophisticated urban lifestyle with exceptional public transport, coffee house culture, and classical music venues.",
    healthcare_cost: 150,
    internet_speed: 150,
    public_transport_quality: 10,
    walkability: 9,
    safety_score: 9,
    quality_of_life: 9,
    activities_available: ["opera", "museums", "concerts", "parks", "cafes", "walking", "cycling", "wine_tasting"],
    interests_supported: ["cultural", "classical_music", "arts", "history", "coffee_culture"],
    beaches_nearby: false,
    hiking_trails_km: 50,
    ski_resorts_within_100km: 10,
    data_completeness_score: 85
  },
  
  'Bruges, Belgium': {
    description: "Bruges captivates with medieval architecture, romantic canals, and world-famous chocolate. This fairy-tale city offers peaceful retirement in a UNESCO World Heritage setting.",
    cost_index: 2000,
    healthcare_score: 9,
    climate_description: "Maritime climate with mild temperatures year-round. Cool summers (20°C) and mild winters (5°C) with frequent rain.",
    lifestyle_description: "Quiet, tourist-friendly city with excellent healthcare and easy access to major European cities.",
    healthcare_cost: 120,
    internet_speed: 120,
    public_transport_quality: 8,
    walkability: 10,
    safety_score: 9,
    quality_of_life: 9,
    activities_available: ["canal_tours", "museums", "cycling", "chocolate_tasting", "beer_tasting", "markets"],
    interests_supported: ["cultural", "historical", "culinary", "arts", "photography"],
    beaches_nearby: true,
    hiking_trails_km: 20,
    data_completeness_score: 85
  },

  'Ghent, Belgium': {
    description: "Ghent combines medieval charm with youthful energy from its university. Less touristy than Bruges, it offers authentic Belgian living with excellent amenities.",
    cost_index: 1900,
    healthcare_score: 9,
    climate_description: "Temperate maritime climate similar to Bruges. Mild throughout the year with regular rainfall.",
    lifestyle_description: "Vibrant cultural scene with festivals, markets, and student life creating dynamic atmosphere.",
    healthcare_cost: 120,
    internet_speed: 130,
    public_transport_quality: 8,
    walkability: 9,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["festivals", "museums", "cycling", "canal_walks", "markets", "cafes"],
    interests_supported: ["cultural", "arts", "music", "cycling", "social"],
    beaches_nearby: false,
    hiking_trails_km: 15,
    data_completeness_score: 85
  },

  // Continue with more towns...
  'Paris, France': {
    description: "Paris offers retirees unmatched cultural richness, world-class healthcare, and excellent public transport. The City of Light provides endless museums, cafes, and parks to explore.",
    cost_index: 3000,
    healthcare_score: 10,
    climate_description: "Temperate climate with mild summers (25°C) and cool winters (5°C). Pleasant spring and autumn seasons.",
    lifestyle_description: "Cosmopolitan lifestyle with incredible dining, arts, and cultural events. Walkable neighborhoods each with distinct character.",
    healthcare_cost: 200,
    internet_speed: 200,
    public_transport_quality: 10,
    walkability: 10,
    safety_score: 8,
    quality_of_life: 9,
    activities_available: ["museums", "theaters", "cafes", "parks", "markets", "concerts", "exhibitions"],
    interests_supported: ["cultural", "arts", "culinary", "fashion", "history"],
    beaches_nearby: false,
    hiking_trails_km: 30,
    data_completeness_score: 90
  },

  'Bordeaux, France': {
    description: "Bordeaux combines wine country charm with urban sophistication. This UNESCO World Heritage city offers retirees excellent healthcare, cultural richness, and proximity to Atlantic beaches.",
    cost_index: 2200,
    healthcare_score: 9,
    climate_description: "Oceanic climate with warm summers (26°C) and mild winters (10°C). More sunshine than Paris.",
    lifestyle_description: "Refined lifestyle centered on wine, gastronomy, and culture. Excellent tram system and walkable historic center.",
    healthcare_cost: 150,
    internet_speed: 150,
    public_transport_quality: 9,
    walkability: 9,
    safety_score: 8,
    quality_of_life: 9,
    activities_available: ["wine_tasting", "cycling", "beaches", "markets", "concerts", "river_cruises"],
    interests_supported: ["wine_culture", "culinary", "cultural", "cycling", "coastal"],
    beaches_nearby: true,
    hiking_trails_km: 40,
    data_completeness_score: 85
  },

  // SOUTHERN EUROPE
  'Rome, Italy': {
    description: "Rome offers retirees 3,000 years of history at every corner. Enjoy Mediterranean lifestyle, incredible food, and world-class art in the Eternal City.",
    cost_index: 2000,
    healthcare_score: 8,
    climate_description: "Mediterranean climate with hot summers (30°C) and mild winters (12°C). Abundant sunshine year-round.",
    lifestyle_description: "Relaxed pace with long lunches, evening strolls, and vibrant piazza life. Rich cultural offerings daily.",
    healthcare_cost: 100,
    internet_speed: 100,
    public_transport_quality: 7,
    walkability: 8,
    safety_score: 7,
    quality_of_life: 8,
    activities_available: ["museums", "archaeological_sites", "cafes", "markets", "opera", "walking_tours"],
    interests_supported: ["historical", "cultural", "culinary", "arts", "religious"],
    beaches_nearby: true,
    hiking_trails_km: 50,
    data_completeness_score: 85
  },

  'Porto, Portugal': {
    description: "Porto charms with hillside views, port wine cellars, and Atlantic proximity. This UNESCO city offers affordable European retirement with excellent healthcare.",
    cost_index: 1600,
    healthcare_score: 8,
    climate_description: "Atlantic climate with mild temperatures year-round. Cool, wet winters (14°C) and warm, dry summers (25°C).",
    lifestyle_description: "Laid-back lifestyle with focus on food, wine, and family. Growing expat community and tech scene.",
    healthcare_cost: 80,
    internet_speed: 120,
    public_transport_quality: 8,
    walkability: 7,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["wine_tasting", "river_cruises", "beaches", "hiking", "museums", "fado_music"],
    interests_supported: ["wine_culture", "cultural", "coastal", "music", "culinary"],
    beaches_nearby: true,
    hiking_trails_km: 60,
    data_completeness_score: 85
  },

  'Lisbon, Portugal': {
    description: "Lisbon captivates with hilltop views, historic trams, and year-round sunshine. Portugal's capital offers EU residency options and excellent value for retirees.",
    cost_index: 1800,
    healthcare_score: 8,
    climate_description: "Mediterranean climate with very mild winters (15°C) and warm summers (28°C). Over 300 days of sunshine.",
    lifestyle_description: "Cosmopolitan yet traditional, with thriving arts scene, great restaurants, and friendly locals.",
    healthcare_cost: 90,
    internet_speed: 150,
    public_transport_quality: 8,
    walkability: 7,
    safety_score: 9,
    quality_of_life: 9,
    activities_available: ["beaches", "museums", "fado_music", "markets", "sailing", "golf", "surfing"],
    interests_supported: ["cultural", "coastal", "music", "culinary", "outdoor"],
    beaches_nearby: true,
    hiking_trails_km: 80,
    data_completeness_score: 85
  },

  // EASTERN EUROPE
  'Prague, Czech Republic': {
    description: "Prague enchants retirees with fairy-tale architecture, affordable living, and rich cultural life. This golden city offers excellent healthcare and easy European travel.",
    cost_index: 1400,
    healthcare_score: 8,
    climate_description: "Continental climate with warm summers (23°C) and cold winters (-2°C). Beautiful spring and autumn.",
    lifestyle_description: "Blend of history and modernity with world-class beer, music venues, and walkable neighborhoods.",
    healthcare_cost: 70,
    internet_speed: 100,
    public_transport_quality: 9,
    walkability: 9,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["concerts", "museums", "beer_tasting", "walking", "theaters", "castles"],
    interests_supported: ["cultural", "historical", "music", "beer_culture", "arts"],
    beaches_nearby: false,
    hiking_trails_km: 40,
    data_completeness_score: 85
  },

  // ASIA
  'Chiang Mai, Thailand': {
    description: "Chiang Mai offers affordable luxury in Thailand's cultural capital. Excellent healthcare, year-round warmth, and welcoming expat community make it ideal for retirement.",
    cost_index: 1000,
    healthcare_score: 8,
    climate_description: "Tropical climate with warm temperatures year-round (25-35°C). Rainy season June-October.",
    lifestyle_description: "Relaxed pace with Buddhist temples, night markets, and mountain scenery. Large, helpful expat community.",
    healthcare_cost: 50,
    internet_speed: 100,
    public_transport_quality: 6,
    walkability: 6,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["temples", "markets", "hiking", "cooking_classes", "meditation", "elephant_sanctuaries"],
    interests_supported: ["spiritual", "cultural", "culinary", "nature", "wellness"],
    beaches_nearby: false,
    hiking_trails_km: 200,
    data_completeness_score: 85
  },

  'Da Nang, Vietnam': {
    description: "Da Nang combines beach living with urban amenities on Vietnam's central coast. Modern infrastructure, affordable healthcare, and year-round sunshine attract retirees.",
    cost_index: 900,
    healthcare_score: 7,
    climate_description: "Tropical climate with beaches and mountains. Hot summers (35°C) and mild winters (25°C).",
    lifestyle_description: "Beach lifestyle with modern amenities, growing expat scene, and easy access to historic Hoi An.",
    healthcare_cost: 40,
    internet_speed: 80,
    public_transport_quality: 5,
    walkability: 6,
    safety_score: 8,
    quality_of_life: 7,
    activities_available: ["beaches", "swimming", "golf", "hiking", "markets", "water_sports"],
    interests_supported: ["beach_lifestyle", "outdoor", "culinary", "cultural", "golf"],
    beaches_nearby: true,
    hiking_trails_km: 100,
    data_completeness_score: 85
  },

  // AMERICAS
  'San Miguel de Allende, Mexico': {
    description: "San Miguel de Allende enchants with colonial architecture, perfect climate, and vibrant expat community. This UNESCO World Heritage city is Mexico's premier retirement destination.",
    cost_index: 1400,
    healthcare_score: 7,
    climate_description: "Near-perfect climate with warm days (25°C) and cool nights year-round. Minimal rainfall.",
    lifestyle_description: "Artistic community with galleries, restaurants, and cultural events. Large, established expat population.",
    healthcare_cost: 60,
    internet_speed: 50,
    public_transport_quality: 5,
    walkability: 8,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["art_galleries", "markets", "hot_springs", "golf", "horseback_riding", "wine_tasting"],
    interests_supported: ["arts", "cultural", "culinary", "social", "crafts"],
    beaches_nearby: false,
    hiking_trails_km: 50,
    data_completeness_score: 85
  }
}

// Function to update a batch of towns
async function updateTownBatch(townBatch) {
  const results = { success: 0, failed: 0, errors: [] }
  
  for (const [townKey, updateData] of Object.entries(townBatch)) {
    const [name, country] = townKey.split(', ')
    
    try {
      // Find the town
      const { data: towns, error: findError } = await adminSupabase
        .from('towns')
        .select('id, name, country')
        .eq('name', name)
        .eq('country', country)
        .single()
      
      if (findError || !towns) {
        results.errors.push(`Not found: ${townKey}`)
        results.failed++
        continue
      }
      
      // Update with comprehensive data
      const { error: updateError } = await adminSupabase
        .from('towns')
        .update({
          ...updateData,
          last_ai_update: new Date().toISOString()
        })
        .eq('id', towns.id)
      
      if (updateError) {
        results.errors.push(`Update failed for ${townKey}: ${updateError.message}`)
        results.failed++
      } else {
        console.log(`✅ Updated ${townKey}`)
        results.success++
      }
      
    } catch (error) {
      results.errors.push(`Error with ${townKey}: ${error.message}`)
      results.failed++
    }
  }
  
  return results
}

// Main update function
async function updateAllPhotoTowns() {
  console.log('📋 Starting updates for towns with photos...\n')
  
  // Update in batches
  const results = await updateTownBatch(townDataByRegion)
  
  console.log('\n📊 Update Summary:')
  console.log(`✅ Successfully updated: ${results.success} towns`)
  console.log(`❌ Failed: ${results.failed} towns`)
  
  if (results.errors.length > 0) {
    console.log('\n⚠️  Errors:')
    results.errors.forEach(err => console.log(`   - ${err}`))
  }
  
  // Verify final counts
  const { count: totalWithData } = await adminSupabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
    .not('image_url_1', 'is', null)
    .gte('data_completeness_score', 40)
  
  console.log(`\n📸 Towns with photos and data: ${totalWithData}/71`)
}

// Additional towns data (continue adding all 71 towns)
const additionalTowns = {
  // Add remaining towns here...
  'Valencia, Spain': {
    description: "Valencia offers Mediterranean beaches, futuristic architecture, and year-round sunshine. Spain's third city provides excellent healthcare and lower costs than Madrid or Barcelona.",
    cost_index: 1700,
    healthcare_score: 9,
    climate_description: "Mediterranean climate with hot summers (30°C) and mild winters (15°C). Over 300 days of sunshine.",
    lifestyle_description: "Perfect blend of beach and city life with amazing paella, festivals, and modern infrastructure.",
    healthcare_cost: 90,
    internet_speed: 150,
    public_transport_quality: 8,
    walkability: 8,
    safety_score: 8,
    quality_of_life: 9,
    activities_available: ["beaches", "cycling", "museums", "markets", "festivals", "sailing"],
    interests_supported: ["beach_lifestyle", "cultural", "culinary", "cycling", "festivals"],
    beaches_nearby: true,
    hiking_trails_km: 40,
    data_completeness_score: 85
  },
  
  // TODO: Add all remaining towns from the list
}

// Run the update
updateAllPhotoTowns()