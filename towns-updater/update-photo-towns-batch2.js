import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const adminSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

console.log('🚀 Updating BATCH 2: More European Towns with Photos...\n')

// BATCH 2: MORE EUROPEAN TOWNS (25 towns)
const batch2Towns = {
  // FRANCE
  'Paris': {
    country: 'France',
    description: "Paris offers retirees unmatched cultural richness, world-class healthcare, and excellent public transport. The City of Light provides endless museums, cafes, and parks.",
    cost_index: 3000,
    healthcare_score: 10,
    climate_description: "Temperate climate with mild summers (25°C) and cool winters (5°C). Pleasant spring and autumn.",
    lifestyle_description: "Cosmopolitan lifestyle with incredible dining, arts, and cultural events. Each arrondissement has unique character.",
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
    data_completeness_score: 75
  },

  'Bordeaux': {
    country: 'France',
    description: "Bordeaux combines wine country charm with urban sophistication. This UNESCO city offers excellent healthcare, cultural richness, and Atlantic proximity.",
    cost_index: 2200,
    healthcare_score: 9,
    climate_description: "Oceanic climate with warm summers (26°C) and mild winters (10°C). More sun than Paris.",
    lifestyle_description: "Refined lifestyle centered on wine, gastronomy, and culture. Excellent tram system and walkable center.",
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
    data_completeness_score: 75
  },

  'Saint-Tropez': {
    country: 'France',
    description: "Saint-Tropez epitomizes Riviera glamour with pristine beaches and yacht-filled harbor. This legendary resort offers luxury retirement in Mediterranean paradise.",
    cost_index: 3500,
    healthcare_score: 9,
    climate_description: "Mediterranean climate with hot summers (28°C) and mild winters (13°C). 300 days of sunshine.",
    lifestyle_description: "Glamorous beach resort lifestyle with world-class restaurants, beaches, and cultural events.",
    healthcare_cost: 200,
    internet_speed: 120,
    public_transport_quality: 6,
    walkability: 7,
    safety_score: 9,
    quality_of_life: 9,
    activities_available: ["beaches", "yachting", "golf", "wine_tasting", "art_galleries", "nightlife"],
    interests_supported: ["luxury", "beach_lifestyle", "sailing", "social", "arts"],
    beaches_nearby: true,
    hiking_trails_km: 30,
    data_completeness_score: 75
  },

  'Pau': {
    country: 'France',
    description: "Pau offers Pyrenees views and mild climate in France's southwest. This elegant city provides mountain access, thermal spas, and refined living.",
    cost_index: 1800,
    healthcare_score: 9,
    climate_description: "Oceanic climate with mild winters and warm summers. Less rain than Atlantic coast.",
    lifestyle_description: "Genteel city with British expat history, golf courses, and proximity to mountains and Spain.",
    healthcare_cost: 120,
    internet_speed: 100,
    public_transport_quality: 7,
    walkability: 8,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["golf", "hiking", "thermal_spas", "skiing", "markets", "cultural_events"],
    interests_supported: ["golf", "mountain_activities", "thermal_wellness", "cultural"],
    beaches_nearby: false,
    hiking_trails_km: 200,
    ski_resorts_within_100km: 10,
    data_completeness_score: 75
  },

  'Sainte-Maxime': {
    country: 'France',
    description: "Sainte-Maxime provides Riviera living without Saint-Tropez prices. This charming resort town offers beaches, golf, and year-round Mediterranean sunshine.",
    cost_index: 2500,
    healthcare_score: 8,
    climate_description: "Mediterranean climate identical to Saint-Tropez. Protected from Mistral winds.",
    lifestyle_description: "Relaxed beach resort with family atmosphere, markets, and all Riviera amenities.",
    healthcare_cost: 150,
    internet_speed: 100,
    public_transport_quality: 6,
    walkability: 8,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["beaches", "golf", "sailing", "markets", "cycling", "water_sports"],
    interests_supported: ["beach_lifestyle", "golf", "sailing", "relaxed_luxury"],
    beaches_nearby: true,
    hiking_trails_km: 50,
    data_completeness_score: 75
  },

  // PORTUGAL
  'Porto': {
    country: 'Portugal',
    description: "Porto charms with hillside views, port wine cellars, and Atlantic proximity. This UNESCO city offers affordable European retirement with excellent healthcare.",
    cost_index: 1600,
    healthcare_score: 8,
    climate_description: "Atlantic climate with mild temperatures. Cool, wet winters (14°C) and warm, dry summers (25°C).",
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
    data_completeness_score: 75
  },

  'Lisbon': {
    country: 'Portugal',
    description: "Lisbon captivates with hilltop views, historic trams, and year-round sunshine. Portugal's capital offers EU residency options and excellent value.",
    cost_index: 1800,
    healthcare_score: 8,
    climate_description: "Mediterranean climate with mild winters (15°C) and warm summers (28°C). 300+ sunny days.",
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
    data_completeness_score: 75
  },

  'Tavira': {
    country: 'Portugal',
    description: "Tavira enchants with authentic Algarve charm minus the overdevelopment. This riverside town offers beaches, golf, and traditional Portuguese lifestyle.",
    cost_index: 1500,
    healthcare_score: 8,
    climate_description: "Mediterranean climate with hot summers (28°C) and mild winters (16°C). 300 days of sun.",
    lifestyle_description: "Authentic Portuguese town with beaches, excellent restaurants, and growing expat community.",
    healthcare_cost: 70,
    internet_speed: 100,
    public_transport_quality: 6,
    walkability: 8,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["beaches", "golf", "birdwatching", "cycling", "markets", "river_activities"],
    interests_supported: ["beach_lifestyle", "golf", "nature", "authentic_Portuguese"],
    beaches_nearby: true,
    hiking_trails_km: 40,
    data_completeness_score: 75
  },

  'Viseu': {
    country: 'Portugal',
    description: "Viseu offers inland Portugal charm with wine country setting and lower costs. This historic city provides authentic Portuguese living away from tourist crowds.",
    cost_index: 1300,
    healthcare_score: 8,
    climate_description: "Continental climate with hot summers (30°C) and cool winters (8°C). Less rain than coast.",
    lifestyle_description: "Traditional Portuguese city life with excellent wine, historic center, and friendly atmosphere.",
    healthcare_cost: 60,
    internet_speed: 100,
    public_transport_quality: 6,
    walkability: 8,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["wine_tasting", "hiking", "cultural_sites", "markets", "festivals"],
    interests_supported: ["wine_culture", "cultural", "traditional_lifestyle", "quiet_living"],
    beaches_nearby: false,
    hiking_trails_km: 80,
    data_completeness_score: 75
  },

  // ITALY
  'Rome': {
    country: 'Italy',
    description: "Rome offers retirees 3,000 years of history at every corner. Enjoy Mediterranean lifestyle, incredible food, and world-class art in the Eternal City.",
    cost_index: 2000,
    healthcare_score: 8,
    climate_description: "Mediterranean climate with hot summers (30°C) and mild winters (12°C). Abundant sunshine.",
    lifestyle_description: "Relaxed pace with long lunches, evening strolls, and vibrant piazza life. Rich cultural offerings.",
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
    data_completeness_score: 75
  },

  'Bologna': {
    country: 'Italy',
    description: "Bologna delights with Renaissance architecture, world-famous cuisine, and university vibrancy. This cultured city offers authentic Italian life without tourist hordes.",
    cost_index: 1800,
    healthcare_score: 9,
    climate_description: "Continental climate with hot summers (30°C) and cold winters (3°C). Foggy in winter.",
    lifestyle_description: "Intellectual atmosphere with amazing food scene, portico-lined streets, and cultural events.",
    healthcare_cost: 90,
    internet_speed: 120,
    public_transport_quality: 8,
    walkability: 9,
    safety_score: 8,
    quality_of_life: 9,
    activities_available: ["food_tours", "museums", "opera", "markets", "cooking_classes", "wine_tasting"],
    interests_supported: ["culinary", "cultural", "intellectual", "music", "arts"],
    beaches_nearby: false,
    hiking_trails_km: 60,
    data_completeness_score: 75
  },

  'Lucca': {
    country: 'Italy',
    description: "Lucca charms with intact Renaissance walls, bike-friendly streets, and Tuscan location. This peaceful city offers dolce vita without Florence crowds.",
    cost_index: 1900,
    healthcare_score: 8,
    climate_description: "Mediterranean climate with warm summers (28°C) and mild winters (10°C). Perfect spring/autumn.",
    lifestyle_description: "Relaxed Tuscan lifestyle within walkable walled city. Great restaurants and easy access to coast.",
    healthcare_cost: 95,
    internet_speed: 80,
    public_transport_quality: 6,
    walkability: 10,
    safety_score: 9,
    quality_of_life: 9,
    activities_available: ["cycling", "walking", "concerts", "markets", "day_trips", "cooking_classes"],
    interests_supported: ["cycling", "cultural", "culinary", "music", "relaxed_lifestyle"],
    beaches_nearby: true,
    hiking_trails_km: 100,
    data_completeness_score: 75
  },

  'Lecce': {
    country: 'Italy',
    description: "Lecce dazzles with Baroque architecture in Italy's heel. This 'Florence of the South' offers warm weather, beaches, and authentic Southern Italian culture.",
    cost_index: 1400,
    healthcare_score: 7,
    climate_description: "Mediterranean climate with hot summers (32°C) and mild winters (13°C). Very sunny.",
    lifestyle_description: "Slow-paced Southern Italian life with siestas, passeggiata, and incredible local cuisine.",
    healthcare_cost: 70,
    internet_speed: 70,
    public_transport_quality: 6,
    walkability: 8,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["beaches", "baroque_tours", "cooking", "markets", "traditional_festivals"],
    interests_supported: ["beach_lifestyle", "cultural", "culinary", "traditional_Italian"],
    beaches_nearby: true,
    hiking_trails_km: 30,
    data_completeness_score: 75
  },

  'Orvieto': {
    country: 'Italy',
    description: "Orvieto rises dramatically on volcanic rock with stunning cathedral and Umbrian views. This hilltop gem offers peaceful retirement in Italy's green heart.",
    cost_index: 1700,
    healthcare_score: 8,
    climate_description: "Continental climate with warm summers (28°C) and cool winters (7°C). Less tourists than Tuscany.",
    lifestyle_description: "Quiet hilltop living with incredible views, local wine, and easy train access to Rome.",
    healthcare_cost: 85,
    internet_speed: 70,
    public_transport_quality: 7,
    walkability: 8,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["wine_tasting", "cathedral_visits", "ceramics", "hiking", "local_festivals"],
    interests_supported: ["wine_culture", "arts_crafts", "quiet_lifestyle", "cultural"],
    beaches_nearby: false,
    hiking_trails_km: 70,
    data_completeness_score: 75
  },

  'Ostuni': {
    country: 'Italy',
    description: "Ostuni gleams white on its hilltop above Puglia's olive groves. This 'White City' offers beaches, authentic cuisine, and increasing expat appeal.",
    cost_index: 1500,
    healthcare_score: 7,
    climate_description: "Mediterranean climate similar to Lecce. Hot, dry summers and mild winters.",
    lifestyle_description: "Traditional Puglian life with whitewashed streets, local markets, and nearby beaches.",
    healthcare_cost: 70,
    internet_speed: 60,
    public_transport_quality: 5,
    walkability: 7,
    safety_score: 8,
    quality_of_life: 8,
    activities_available: ["beaches", "olive_oil_tasting", "cycling", "photography", "local_cuisine"],
    interests_supported: ["beach_lifestyle", "photography", "culinary", "traditional_lifestyle"],
    beaches_nearby: true,
    hiking_trails_km: 40,
    data_completeness_score: 75
  },

  'Spoleto': {
    country: 'Italy',
    description: "Spoleto enchants with Roman ruins, medieval architecture, and famous festival. This Umbrian hill town offers culture and tranquility in equal measure.",
    cost_index: 1600,
    healthcare_score: 8,
    climate_description: "Continental climate with warm summers (27°C) and cool winters (6°C). Beautiful seasons.",
    lifestyle_description: "Cultural hill town life with international festival, local restaurants, and artistic community.",
    healthcare_cost: 80,
    internet_speed: 70,
    public_transport_quality: 6,
    walkability: 7,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["festivals", "concerts", "hiking", "art_galleries", "local_markets"],
    interests_supported: ["cultural", "arts", "music", "hiking", "quiet_lifestyle"],
    beaches_nearby: false,
    hiking_trails_km: 100,
    data_completeness_score: 75
  },

  'Taormina': {
    country: 'Italy',
    description: "Taormina perches spectacularly above the sea with Mount Etna views. This Sicilian jewel offers luxury, history, and some of Italy's best weather.",
    cost_index: 2200,
    healthcare_score: 7,
    climate_description: "Mediterranean climate with mild winters (15°C) and warm summers (28°C). Year-round sunshine.",
    lifestyle_description: "Resort town lifestyle with Greek theater, beaches below, and sophisticated dining scene.",
    healthcare_cost: 100,
    internet_speed: 80,
    public_transport_quality: 6,
    walkability: 7,
    safety_score: 8,
    quality_of_life: 9,
    activities_available: ["beaches", "ancient_sites", "cable_car", "shopping", "volcano_tours"],
    interests_supported: ["luxury", "beach_lifestyle", "cultural", "historical"],
    beaches_nearby: true,
    hiking_trails_km: 80,
    data_completeness_score: 75
  },

  'Trieste': {
    country: 'Italy',
    description: "Trieste blends Italian, Austrian, and Slavic influences on the Adriatic. This cultured port city offers unique character and excellent healthcare.",
    cost_index: 1700,
    healthcare_score: 9,
    climate_description: "Mediterranean climate moderated by Bora winds. Warm summers (27°C) and mild winters (8°C).",
    lifestyle_description: "Cosmopolitan atmosphere with grand cafes, literary heritage, and less tourism than Venice.",
    healthcare_cost: 90,
    internet_speed: 100,
    public_transport_quality: 8,
    walkability: 8,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["cafes", "museums", "coastal_walks", "castle_visits", "sailing"],
    interests_supported: ["cultural", "literary", "coffee_culture", "sailing"],
    beaches_nearby: true,
    hiking_trails_km: 60,
    data_completeness_score: 75
  },

  // GREECE
  'Athens': {
    country: 'Greece',
    description: "Athens combines ancient wonders with modern Mediterranean living. Greece's capital offers history, culture, and easy island access at affordable prices.",
    cost_index: 1500,
    healthcare_score: 7,
    climate_description: "Mediterranean climate with hot summers (33°C) and mild winters (13°C). Very sunny.",
    lifestyle_description: "Vibrant city life with archaeological sites, tavernas, and proximity to beaches and islands.",
    healthcare_cost: 70,
    internet_speed: 80,
    public_transport_quality: 7,
    walkability: 7,
    safety_score: 7,
    quality_of_life: 7,
    activities_available: ["ancient_sites", "museums", "tavernas", "day_trips", "island_hopping"],
    interests_supported: ["historical", "cultural", "archaeological", "island_lifestyle"],
    beaches_nearby: true,
    hiking_trails_km: 50,
    data_completeness_score: 75
  },

  'Chania': {
    country: 'Greece',
    description: "Chania captivates with Venetian harbor, beaches, and Cretan charm. This coastal gem offers island living with modern amenities and year-round appeal.",
    cost_index: 1400,
    healthcare_score: 7,
    climate_description: "Mediterranean climate with hot summers (28°C) and mild winters (15°C). Very sunny.",
    lifestyle_description: "Relaxed island pace with beautiful old town, beaches, and authentic Greek culture.",
    healthcare_cost: 60,
    internet_speed: 70,
    public_transport_quality: 6,
    walkability: 8,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["beaches", "hiking", "sailing", "tavernas", "markets", "historical_sites"],
    interests_supported: ["beach_lifestyle", "sailing", "hiking", "cultural", "relaxed_lifestyle"],
    beaches_nearby: true,
    hiking_trails_km: 150,
    data_completeness_score: 75
  },

  'Corfu (Kerkyra)': {
    country: 'Greece',
    description: "Corfu blends Greek island beauty with Venetian elegance. This Ionian island offers lush landscapes, beautiful beaches, and cosmopolitan atmosphere.",
    cost_index: 1600,
    healthcare_score: 7,
    climate_description: "Mediterranean climate with mild, wet winters and hot, dry summers. Greener than Aegean islands.",
    lifestyle_description: "Island lifestyle with international flair, excellent restaurants, and varied landscapes.",
    healthcare_cost: 70,
    internet_speed: 60,
    public_transport_quality: 5,
    walkability: 7,
    safety_score: 9,
    quality_of_life: 8,
    activities_available: ["beaches", "sailing", "golf", "hiking", "cultural_tours", "water_sports"],
    interests_supported: ["island_living", "sailing", "golf", "cultural", "beach_lifestyle"],
    beaches_nearby: true,
    hiking_trails_km: 100,
    data_completeness_score: 75
  }
}

async function updateBatch2() {
  let successCount = 0
  let failCount = 0
  
  for (const [cityName, data] of Object.entries(batch2Towns)) {
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
  
  console.log(`\n📊 Batch 2 Complete:`)
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
}

updateBatch2()