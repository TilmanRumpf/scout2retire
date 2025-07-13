import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { calculateMatchScore } from './smart-matching-system.js'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Comprehensive data for Porto
const portoData = {
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
  
  // Healthcare (citizenship-specific)
  healthcare_description: {
    US: "Porto offers excellent healthcare through both public and private systems. US retirees typically opt for private insurance (€50-100/month) for shorter wait times and English-speaking doctors.",
    UK: "UK retirees with S1 forms can access public healthcare immediately. Private insurance adds faster specialist access for €60-120/month.",
    EU: "EU citizens can use EHIC for emergencies and register for full public healthcare access after obtaining residency.",
    Canada: "Canadian retirees need private insurance initially (€60-120/month). Public system access available after residency.",
    Australia: "Australian retirees require private health insurance (€70-130/month) as no reciprocal agreement exists."
  },
  healthcare_cost: 75,
  english_speaking_doctors: "Many",
  
  // Immigration (citizenship-specific)
  visa_requirements: {
    US: "90 days visa-free, then D7 visa with €760/month passive income proof",
    UK: "90 days visa-free post-Brexit, similar D7 requirements as US citizens",
    EU: "Unlimited stay, register for residency certificate after 3 months",
    Canada: "90 days visa-free, D7 visa available with income proof",
    Australia: "90 days visa-free, D7 visa with €760/month income requirement"
  },
  min_income_requirement_usd: {
    US: 840,
    UK: 840,
    EU: 0,
    Canada: 840,
    Australia: 840
  },
  
  // Tax info (citizenship-specific)
  income_tax_rate_pct: 28,
  tax_treaty_exists: {
    US: true,
    UK: true,
    EU: true,
    Canada: true,
    Australia: false
  },
  
  // Pet info
  pet_friendly_rating: 8,
  pet_import_requirements: {
    US: "Microchip, rabies vaccine 21+ days before, USDA health certificate within 10 days",
    UK: "EU pet passport or AHC, tapeworm treatment for dogs 1-5 days before entry",
    EU: "EU pet passport with valid rabies vaccine",
    Canada: "Same as US but with CFIA endorsement",
    Australia: "Complex process with blood tests and treatments, no quarantine in Portugal"
  },
  veterinary_clinics_count: 23,
  dog_parks_count: 5,
  
  // Infrastructure
  internet_speed: 100,
  public_transport_quality: "Excellent",
  nearest_airport: "Francisco Sá Carneiro Airport",
  airport_distance: 11,
  walkability: 9,
  
  // PHOTOS: MANUAL PROCESS ONLY - DO NOT UPDATE VIA SCRIPTS
  // image_url_1: PRESERVED - Photos are managed manually
  // image_url_2: PRESERVED - Photos are managed manually  
  // image_url_3: PRESERVED - Photos are managed manually
  
  // Completeness
  data_completeness_score: 95,
  last_ai_update: new Date().toISOString()
}

// Comprehensive data for Paris
const parisData = {
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
  
  // Healthcare (citizenship-specific)
  healthcare_description: {
    US: "Paris boasts world-class healthcare. US retirees need private insurance (€150-300/month) but receive excellent care with many English-speaking doctors.",
    UK: "Post-Brexit, UK retirees with S1 forms access French healthcare. Private insurance (€100-200/month) reduces wait times.",
    EU: "EU citizens access France's excellent public healthcare system with EHIC/residence. Minimal out-of-pocket costs.",
    Canada: "Canadian retirees require private insurance (€150-250/month). French healthcare ranks among world's best.",
    Australia: "Australian retirees need comprehensive private insurance (€150-300/month) but receive exceptional care."
  },
  healthcare_cost: 150,
  english_speaking_doctors: "Many",
  
  // Immigration (citizenship-specific)
  visa_requirements: {
    US: "90 days visa-free, then long-stay visa with €1,500/month income proof",
    UK: "90 days visa-free post-Brexit, residence permit requires €1,500/month income",
    EU: "Freedom of movement, register after 3 months for carte de séjour",
    Canada: "90 days visa-free, long-stay visa needs €1,500/month income proof",
    Australia: "90 days visa-free, long-stay visa with financial requirements"
  },
  min_income_requirement_usd: {
    US: 1650,
    UK: 1650,
    EU: 0,
    Canada: 1650,
    Australia: 1650
  },
  
  // Tax info (citizenship-specific)
  income_tax_rate_pct: 30,
  tax_treaty_exists: {
    US: true,
    UK: true,
    EU: true,
    Canada: true,
    Australia: true
  },
  
  // Pet info
  pet_friendly_rating: 7,
  pet_import_requirements: {
    US: "Microchip, rabies vaccine, tapeworm treatment, USDA health certificate",
    UK: "EU pet passport or AHC required post-Brexit",
    EU: "EU pet passport with current vaccinations",
    Canada: "Similar to US with CFIA endorsement",
    Australia: "Complex requirements, no quarantine if compliant"
  },
  veterinary_clinics_count: 200,
  dog_parks_count: 15,
  
  // Infrastructure
  internet_speed: 200,
  public_transport_quality: "Excellent",
  nearest_airport: "Charles de Gaulle Airport",
  airport_distance: 25,
  walkability: 10,
  
  // PHOTOS: MANUAL PROCESS ONLY - DO NOT UPDATE VIA SCRIPTS
  // image_url_1: PRESERVED - Photos are managed manually
  // image_url_2: PRESERVED - Photos are managed manually
  // image_url_3: PRESERVED - Photos are managed manually
  
  // Completeness
  data_completeness_score: 95,
  last_ai_update: new Date().toISOString()
}

async function updatePortoAndParis() {
  console.log('🏙️ Updating Porto and Paris with comprehensive data...\n')
  
  // Update Porto
  console.log('📍 Updating Porto...')
  const { error: portoError } = await supabase
    .from('towns')
    .update(portoData)
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
    .update(parisData)
    .eq('name', 'Paris')
    .eq('country', 'France')
  
  if (parisError) {
    console.error('❌ Error updating Paris:', parisError.message)
  } else {
    console.log('✅ Paris updated successfully!')
  }
  
  // Test matching for both cities
  console.log('\n🎯 Testing Match Scores:\n')
  
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
  }
  
  if (paris) {
    const parisMatch = await calculateMatchScore(userPrefs, paris)
    console.log('\nParis match score:', parisMatch.match_score, '/10')
    console.log('Match factors:', parisMatch.match_factors)
  }
  
  console.log('\n📸 Note: Photos must be added manually through Supabase dashboard - they are NOT updated via scripts!')
}

updatePortoAndParis()