import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { calculateMatchScore } from './smart-matching-system.js'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Safe data that matches existing schema
const portoDataSafe = {
  // Basic info
  cost_index: 1700,
  climate: 'Mediterranean',
  healthcare_score: 8,
  safety_score: 8,
  quality_of_life: 8,
  
  // Descriptions
  description: "Porto captivates retirees with its perfect blend of old-world charm and modern amenities, offering UNESCO World Heritage architecture alongside a thriving cultural scene. The city's walkable neighborhoods, excellent healthcare, and welcoming locals create an ideal environment for expats seeking authentic Portuguese living at a fraction of Lisbon's cost.",
  
  lifestyle_description: "Life in Porto unfolds at a relaxed pace, with mornings often starting at local cafés over strong coffee and fresh pastatas. Retirees here enjoy a rich social calendar including wine tastings in historic cellars, concerts at Casa da Música, and leisurely strolls along the Douro riverfront. The city's compact size makes it easy to develop a routine while the thriving expat community ensures you'll quickly make friends.",
  
  climate_description: "Porto enjoys a mild Atlantic climate with warm summers (25°C/77°F) and cool, rainy winters (12°C/54°F). The city experiences more rainfall than southern Portugal but avoids extreme temperatures year-round.",
  
  // Costs
  cost_of_living_usd: 1700,
  rent_1bed: 800,
  rent_2bed_usd: 1200,
  meal_cost: 12,
  groceries_cost: 200,
  utilities_cost: 100,
  
  // Demographics
  population: 237000,
  expat_population: "Large",
  expat_community_size: "Large",
  
  // Ratings
  nightlife_rating: 7,
  museums_rating: 8,
  cultural_rating: 9,
  restaurants_rating: 9,
  outdoor_rating: 7,
  pace_of_life: 4,
  
  // Healthcare
  healthcare_cost: 75,
  english_speaking_doctors: "Many",
  
  // Tax info
  income_tax_rate_pct: 28,
  property_tax_rate_pct: 0.8,
  sales_tax_rate_pct: 23,
  
  // Pet info
  pet_friendly_rating: 8,
  veterinary_clinics_count: 23,
  dog_parks_count: 5,
  
  // Infrastructure
  internet_speed: 100,
  public_transport_quality: "Excellent",
  nearest_airport: "Francisco Sá Carneiro Airport",
  airport_distance: 11,
  walkability: 9,
  
  // Language
  primary_language: "Portuguese",
  english_proficiency_score: 60,
  
  // Geography
  elevation_meters: 100,
  distance_to_ocean_km: 0,
  geographic_features: ["coast", "river", "hills", "historic"],
  
  // Completeness
  data_completeness_score: 85,
  last_ai_update: new Date().toISOString()
}

const parisDataSafe = {
  // Basic info
  cost_index: 3500,
  climate: 'Temperate',
  healthcare_score: 9,
  safety_score: 7,
  quality_of_life: 9,
  
  // Descriptions
  description: "Paris offers retirees unparalleled cultural richness, world-class healthcare, and excellent public transportation, though at a premium price. The City of Light attracts those seeking sophisticated urban retirement with museums, cafés, and centuries of history at their doorstep.",
  
  lifestyle_description: "Parisian retirement life revolves around neighborhood quartiers, each with distinct character and local markets. Days might include morning croissants at the corner café, afternoons in Luxembourg Gardens, and evenings at intimate bistros. The pace is surprisingly relaxed for a major capital, with August traditionally seeing many locals on vacation.",
  
  climate_description: "Paris features a temperate oceanic climate with mild summers (25°C/77°F) and cool winters (5°C/41°F). Rain is distributed throughout the year, with occasional snow in winter.",
  
  // Costs
  cost_of_living_usd: 3500,
  rent_1bed: 1800,
  rent_2bed_usd: 2800,
  meal_cost: 20,
  groceries_cost: 400,
  utilities_cost: 150,
  
  // Demographics
  population: 2161000,
  expat_population: "Very Large",
  expat_community_size: "Very Large",
  
  // Ratings
  nightlife_rating: 9,
  museums_rating: 10,
  cultural_rating: 10,
  restaurants_rating: 10,
  outdoor_rating: 7,
  pace_of_life: 6,
  
  // Healthcare
  healthcare_cost: 150,
  english_speaking_doctors: "Many",
  
  // Tax info
  income_tax_rate_pct: 30,
  property_tax_rate_pct: 1.5,
  sales_tax_rate_pct: 20,
  
  // Pet info
  pet_friendly_rating: 7,
  veterinary_clinics_count: 200,
  dog_parks_count: 15,
  
  // Infrastructure
  internet_speed: 200,
  public_transport_quality: "Excellent",
  nearest_airport: "Charles de Gaulle Airport",
  airport_distance: 25,
  walkability: 10,
  
  // Language
  primary_language: "French",
  english_proficiency_score: 55,
  
  // Geography
  elevation_meters: 35,
  distance_to_ocean_km: 200,
  geographic_features: ["river", "urban", "historic", "parks"],
  
  // Completeness
  data_completeness_score: 85,
  last_ai_update: new Date().toISOString()
}

async function updatePortoAndParisSafe() {
  console.log('🏙️ Updating Porto and Paris with safe data...\n')
  
  // PHOTOS: MANUAL PROCESS ONLY - NEVER UPDATE VIA SCRIPTS
  // Photo fields (image_url_1, image_url_2, image_url_3) are excluded from all updates
  // Even if photos don't exist, they must be added manually through Supabase dashboard
  
  // Update Porto
  console.log('📍 Updating Porto...')
  const { error: portoError } = await supabase
    .from('towns')
    .update(portoDataSafe)
    .eq('name', 'Porto')
    .eq('country', 'Portugal')
  
  if (portoError) {
    console.error('❌ Error updating Porto:', portoError.message)
  } else {
    console.log('✅ Porto updated successfully!')
  }
  
  // Update Paris
  console.log('\n📍 Updating Paris...')
  const { error: parisError } = await supabase
    .from('towns')
    .update(parisDataSafe)
    .eq('name', 'Paris')
    .eq('country', 'France')
  
  if (parisError) {
    console.error('❌ Error updating Paris:', parisError.message)
  } else {
    console.log('✅ Paris updated successfully!')
  }
  
  // Test matching for both cities
  console.log('\n🎯 Testing Enhanced Match Scores:\n')
  
  const userPrefs = {
    budget: 2000,
    climate_preference: 'Mediterranean',
    citizenship: 'US',
    has_pets: true
  }
  
  // Get updated data
  const { data: porto } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Porto')
    .eq('country', 'Portugal')
    .single()
  
  const { data: paris } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Paris')
    .eq('country', 'France')
    .single()
  
  if (porto) {
    const portoMatch = await calculateMatchScore(userPrefs, porto)
    console.log('Porto match score:', portoMatch.match_score, '/10')
    console.log('Match factors:', portoMatch.match_factors)
    console.log('Data completeness:', porto.data_completeness_score + '%')
  }
  
  if (paris) {
    const parisMatch = await calculateMatchScore(userPrefs, paris)
    console.log('\nParis match score:', parisMatch.match_score, '/10')
    console.log('Match factors:', parisMatch.match_factors)
    console.log('Data completeness:', paris.data_completeness_score + '%')
  }
  
  console.log('\n✨ Cities now have enhanced data for better matching!')
  console.log('📸 Note: Photos are NEVER updated by scripts - manual process only!')
}

updatePortoAndParisSafe()