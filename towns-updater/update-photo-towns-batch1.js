import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const adminSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

console.log('🚀 Updating BATCH 1: European Towns with Photos...\n')

// BATCH 1: EUROPEAN TOWNS (25 towns)
const europeanTowns = {
  // AUSTRIA
  'Vienna': {
    country: 'Austria',
    description: "Vienna enchants retirees with imperial grandeur, world-class healthcare, and vibrant cultural life. This elegant capital offers the perfect blend of old-world charm and modern amenities.",
    cost_index: 2200,
    healthcare_score: 9,
    climate_description: "Continental climate with warm summers (25°C) and cold winters (0°C). Four distinct seasons.",
    lifestyle_description: "Sophisticated urban lifestyle with exceptional public transport, coffee house culture, and classical music.",
    healthcare_cost: 150,
    internet_speed: 150,
    public_transport_quality: 10,
    walkability: 9,
    safety_score: 9,
    quality_of_life: 9,
    activities_available: ["opera", "museums", "concerts", "parks", "cafes", "walking", "cycling"],
    interests_supported: ["cultural", "classical_music", "arts", "history", "coffee_culture"],
    beaches_nearby: false,
    hiking_trails_km: 50,
    ski_resorts_within_100km: 10,
    data_completeness_score: 75
  },

  // BELGIUM
  'Bruges': {
    country: 'Belgium',
    description: "Bruges captivates with medieval architecture, romantic canals, and world-famous chocolate. This fairy-tale city offers peaceful retirement in a UNESCO World Heritage setting.",
    cost_index: 2000,
    healthcare_score: 9,
    climate_description: "Maritime climate with mild temperatures year-round. Cool summers (20°C) and mild winters (5°C).",
    lifestyle_description: "Quiet, tourist-friendly city with excellent healthcare and easy access to major European cities.",
    healthcare_cost: 120,
    internet_speed: 120,
    public_transport_quality: 8,
    walkability: 10,
    safety_score: 9,
    quality_of_life: 9,
    activities_available: ["canal_tours", "museums", "cycling", "chocolate_tasting", "markets"],
    interests_supported: ["cultural", "historical", "culinary", "photography"],
    beaches_nearby: true,
    hiking_trails_km: 20,
    data_completeness_score: 75
  },

  'Ghent': {
    country: 'Belgium', 
    description: "Ghent combines medieval charm with youthful energy. Less touristy than Bruges, it offers authentic Belgian living with excellent amenities and vibrant cultural scene.",
    cost_index: 1900,
    healthcare_score: 9,
    climate_description: "Temperate maritime climate similar to Bruges. Mild throughout the year with regular rainfall.",
    lifestyle_description: "University town with festivals, markets, and dynamic atmosphere. Perfect for culturally active retirees.",
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
    data_completeness_score: 75
  },

  'Dinant': {
    country: 'Belgium',
    description: "Dinant enchants with dramatic cliffs, the Meuse River, and the birthplace of the saxophone. This small Wallonian gem offers peaceful riverside retirement.",
    cost_index: 1600,
    healthcare_score: 8,
    climate_description: "Continental climate with mild summers (22°C) and cool winters (3°C). Beautiful autumn colors.",
    lifestyle_description: "Quiet riverside town perfect for nature lovers. Easy access to hiking and river activities.",
    healthcare_cost: 100,
    internet_speed: 80,
    public_transport_quality: 6,
    walkability: 7,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["river_cruises", "hiking", "caves", "cycling", "kayaking"],
    interests_supported: ["nature", "outdoor", "photography", "quiet_lifestyle"],
    beaches_nearby: false,
    hiking_trails_km: 100,
    data_completeness_score: 75
  },

  'Leuven': {
    country: 'Belgium',
    description: "Leuven blends ancient university tradition with modern innovation. Home to Belgium's oldest university, it offers intellectual stimulation and excellent healthcare.",
    cost_index: 1800,
    healthcare_score: 9,
    climate_description: "Temperate maritime climate with mild conditions year-round. Average 20°C in summer, 5°C in winter.",
    lifestyle_description: "Vibrant student city with rich cultural life, excellent restaurants, and famous beer culture.",
    healthcare_cost: 110,
    internet_speed: 150,
    public_transport_quality: 8,
    walkability: 9,
    safety_score: 9,
    quality_of_life: 9,
    activities_available: ["university_lectures", "museums", "beer_tasting", "cycling", "concerts"],
    interests_supported: ["intellectual", "cultural", "beer_culture", "social"],
    beaches_nearby: false,
    hiking_trails_km: 20,
    data_completeness_score: 75
  },

  'Tervuren': {
    country: 'Belgium',
    description: "Tervuren offers green, upscale living near Brussels. This parkland commune provides peaceful retirement with easy access to capital city amenities.",
    cost_index: 2100,
    healthcare_score: 9,
    climate_description: "Maritime temperate climate identical to Brussels. Mild and wet throughout the year.",
    lifestyle_description: "Quiet, affluent suburb with beautiful parks, museums, and high quality of life.",
    healthcare_cost: 130,
    internet_speed: 140,
    public_transport_quality: 7,
    walkability: 7,
    safety_score: 10,
    quality_of_life: 9,
    activities_available: ["parks", "museums", "cycling", "walking", "golf"],
    interests_supported: ["nature", "quiet_lifestyle", "cultural", "outdoor"],
    beaches_nearby: false,
    hiking_trails_km: 30,
    data_completeness_score: 75
  },

  // SWITZERLAND
  'Lugano': {
    country: 'Switzerland',
    description: "Lugano combines Swiss efficiency with Italian charm on Lake Lugano. This sophisticated city offers Mediterranean climate in an Alpine setting.",
    cost_index: 3500,
    healthcare_score: 10,
    climate_description: "Mediterranean climate unusual for Switzerland. Warm summers (28°C) and mild winters (7°C).",
    lifestyle_description: "Luxury lakeside living with palm trees, excellent healthcare, and multilingual environment.",
    healthcare_cost: 300,
    internet_speed: 200,
    public_transport_quality: 9,
    walkability: 8,
    safety_score: 10,
    quality_of_life: 10,
    activities_available: ["lake_activities", "hiking", "skiing", "museums", "shopping", "dining"],
    interests_supported: ["luxury", "outdoor", "cultural", "water_activities"],
    beaches_nearby: false,
    hiking_trails_km: 200,
    ski_resorts_within_100km: 20,
    data_completeness_score: 75
  },

  // CZECH REPUBLIC
  'Prague': {
    country: 'Czech Republic',
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
    data_completeness_score: 75
  },

  // ESTONIA
  'Tallinn': {
    country: 'Estonia',
    description: "Tallinn merges medieval charm with digital innovation. This Baltic gem offers EU benefits, low taxes, and one of Europe's best-preserved old towns.",
    cost_index: 1500,
    healthcare_score: 8,
    climate_description: "Baltic climate with cool summers (20°C) and cold winters (-5°C). White nights in summer.",
    lifestyle_description: "Tech-savvy city with excellent digital services, growing expat community, and Baltic Sea access.",
    healthcare_cost: 80,
    internet_speed: 150,
    public_transport_quality: 8,
    walkability: 8,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["medieval_tours", "museums", "Baltic_beaches", "forests", "digital_nomad_events"],
    interests_supported: ["historical", "tech", "nature", "cultural"],
    beaches_nearby: true,
    hiking_trails_km: 50,
    data_completeness_score: 75
  },

  // SPAIN
  'Baiona': {
    country: 'Spain',
    description: "Baiona charms with Galician coastal beauty and the historic arrival point of Columbus news. This Atlantic town offers seafood, beaches, and mild climate.",
    cost_index: 1600,
    healthcare_score: 8,
    climate_description: "Atlantic climate with mild temperatures year-round. Cool summers (22°C) and mild winters (12°C).",
    lifestyle_description: "Relaxed coastal living with excellent seafood, beaches, and strong maritime heritage.",
    healthcare_cost: 80,
    internet_speed: 100,
    public_transport_quality: 6,
    walkability: 8,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["beaches", "sailing", "hiking", "seafood_dining", "historical_sites"],
    interests_supported: ["coastal", "sailing", "culinary", "historical"],
    beaches_nearby: true,
    hiking_trails_km: 80,
    data_completeness_score: 75
  },

  'Castro Urdiales': {
    country: 'Spain',
    description: "Castro Urdiales combines Cantabrian coastal beauty with Roman heritage. This northern Spanish gem offers beaches, mountains, and authentic Spanish living.",
    cost_index: 1700,
    healthcare_score: 8,
    climate_description: "Oceanic climate with mild temperatures. Warm summers (23°C) and mild winters (11°C).",
    lifestyle_description: "Traditional Spanish coastal town with great tapas, beaches, and proximity to Bilbao.",
    healthcare_cost: 85,
    internet_speed: 120,
    public_transport_quality: 7,
    walkability: 8,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["beaches", "surfing", "hiking", "tapas_tours", "fishing"],
    interests_supported: ["coastal", "surfing", "culinary", "traditional_Spanish"],
    beaches_nearby: true,
    hiking_trails_km: 100,
    data_completeness_score: 75
  },

  'Comillas': {
    country: 'Spain',
    description: "Comillas delights with Gaudi architecture, beaches, and Cantabrian charm. This aristocratic town offers cultural richness in a spectacular coastal setting.",
    cost_index: 1800,
    healthcare_score: 8,
    climate_description: "Oceanic climate similar to other Cantabrian towns. Green landscape year-round.",
    lifestyle_description: "Small prestigious town with architectural gems, beaches, and quiet sophisticated atmosphere.",
    healthcare_cost: 90,
    internet_speed: 100,
    public_transport_quality: 6,
    walkability: 8,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["beaches", "architecture_tours", "hiking", "golf", "cultural_events"],
    interests_supported: ["architectural", "coastal", "cultural", "quiet_luxury"],
    beaches_nearby: true,
    hiking_trails_km: 60,
    data_completeness_score: 75
  },

  'Granada': {
    country: 'Spain',
    description: "Granada mesmerizes with the Alhambra, tapas culture, and Sierra Nevada proximity. This Andalusian jewel offers rich history and surprising value.",
    cost_index: 1500,
    healthcare_score: 8,
    climate_description: "Continental Mediterranean climate with hot summers (35°C) and cool winters (6°C). Skiing nearby.",
    lifestyle_description: "University city with vibrant culture, free tapas tradition, and blend of Spanish and Moorish heritage.",
    healthcare_cost: 75,
    internet_speed: 120,
    public_transport_quality: 7,
    walkability: 8,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["Alhambra", "skiing", "hiking", "tapas_tours", "flamenco", "museums"],
    interests_supported: ["historical", "cultural", "skiing", "culinary", "arts"],
    beaches_nearby: false,
    hiking_trails_km: 150,
    ski_resorts_within_100km: 1,
    data_completeness_score: 75
  },

  'Puerto de la Cruz': {
    country: 'Spain',
    description: "Puerto de la Cruz offers year-round spring weather in Tenerife. This Canary Islands gem provides Atlantic island living with European standards.",
    cost_index: 1600,
    healthcare_score: 8,
    climate_description: "Subtropical climate with constant temperatures (18-25°C) year-round. Known as eternal spring.",
    lifestyle_description: "Relaxed island pace with beaches, botanical gardens, and established expat community.",
    healthcare_cost: 80,
    internet_speed: 100,
    public_transport_quality: 7,
    walkability: 8,
    safety_score: 9,
    quality_of_life: 9,
    activities_available: ["beaches", "hiking", "whale_watching", "botanical_gardens", "swimming"],
    interests_supported: ["island_living", "nature", "outdoor", "relaxed_lifestyle"],
    beaches_nearby: true,
    hiking_trails_km: 200,
    data_completeness_score: 75
  },

  'Alicante': {
    country: 'Spain',
    description: "Alicante shines with 300+ days of sun, beaches, and affordable Mediterranean living. This Costa Blanca city offers perfect retirement weather and amenities.",
    cost_index: 1600,
    healthcare_score: 8,
    climate_description: "Mediterranean climate with hot, dry summers (30°C) and mild winters (16°C). Minimal rainfall.",
    lifestyle_description: "Beach city lifestyle with promenades, markets, and large international community.",
    healthcare_cost: 85,
    internet_speed: 150,
    public_transport_quality: 8,
    walkability: 8,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["beaches", "golf", "sailing", "markets", "hiking", "water_sports"],
    interests_supported: ["beach_lifestyle", "golf", "sailing", "expat_community"],
    beaches_nearby: true,
    hiking_trails_km: 50,
    data_completeness_score: 75
  },

  'Valencia': {
    country: 'Spain',
    description: "Valencia blends beaches, culture, and modern architecture. Spain's third city offers excellent healthcare, lower costs than Madrid, and year-round sunshine.",
    cost_index: 1700,
    healthcare_score: 9,
    climate_description: "Mediterranean climate with hot summers (30°C) and mild winters (15°C). Over 300 sunny days.",
    lifestyle_description: "Perfect city-beach balance with paella birthplace, festivals, and innovative architecture.",
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
    data_completeness_score: 75
  }
}

async function updateBatch1() {
  let successCount = 0
  let failCount = 0
  
  for (const [cityName, data] of Object.entries(europeanTowns)) {
    try {
      const { error } = await adminSupabase
        .from('towns')
        .update({
          ...data,
          last_ai_update: new Date().toISOString()
        })
        .eq('name', cityName)
        .eq('country', data.country)
      
      if (error) {
        console.log(`❌ Failed to update ${cityName}: ${error.message}`)
        failCount++
      } else {
        console.log(`✅ Updated ${cityName}, ${data.country}`)
        successCount++
      }
    } catch (err) {
      console.log(`❌ Error with ${cityName}: ${err.message}`)
      failCount++
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log(`\n📊 Batch 1 Complete:`)
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
}

updateBatch1()