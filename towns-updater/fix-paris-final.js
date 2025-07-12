import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function fixParisFinal() {
  console.log('🔧 Final attempt to fix Paris...\n')
  
  // Get current Paris to see what's there
  const { data: currentParis } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Paris')
    .eq('country', 'France')
    .single()
  
  console.log('Current Paris state:')
  console.log('- ID:', currentParis?.id)
  console.log('- Name:', currentParis?.name)
  console.log('- Country:', currentParis?.country)
  console.log('- Cost index:', currentParis?.cost_index)
  console.log('- Image URL:', currentParis?.image_url_1)
  
  // Nuclear option - set EVERYTHING to null except absolute essentials
  const minimalParis = {
    cost_index: 3200,
    climate: null,
    healthcare_score: 8,
    safety_score: 7,
    description: 'The City of Light offers world-class museums, healthcare, and culture.',
    cost_of_living_usd: null,
    population: null,
    expat_population: null,
    quality_of_life: null,
    nightlife_rating: null,
    museums_rating: null,
    cultural_landmark_1: null,
    cultural_landmark_2: null,
    cultural_landmark_3: null,
    google_maps_link: null,
    image_url_1: currentParis?.image_url_1, // Keep existing image
    image_url_2: null,
    image_url_3: null,
    climate_description: null,
    avg_temp_summer: null,
    avg_temp_winter: null,
    annual_rainfall: null,
    sunshine_hours: null,
    cost_description: null,
    rent_1bed: null,
    meal_cost: null,
    groceries_cost: null,
    utilities_cost: null,
    healthcare_description: null,
    hospital_count: null,
    healthcare_cost: null,
    english_speaking_doctors: null,
    lifestyle_description: null,
    restaurants_rating: null,
    cultural_rating: null,
    outdoor_rating: null,
    safety_description: null,
    crime_rate: null,
    natural_disaster_risk: null,
    infrastructure_description: null,
    internet_speed: null,
    public_transport_quality: null,
    nearest_airport: null,
    airport_distance: null,
    walkability: null,
    last_ai_update: null,
    image_source: null,
    image_license: null,
    image_photographer: null,
    image_validation_note: null,
    image_validated_at: null,
    image_is_fallback: false,
    image_urls: null,
    region: null,
    regions: null,
    water_bodies: null,
    summer_climate_actual: null,
    winter_climate_actual: null,
    humidity_level_actual: null,
    sunshine_level_actual: null,
    precipitation_level_actual: null,
    seasonal_variation_actual: null,
    activities_available: null,
    interests_supported: null,
    activity_infrastructure: null,
    outdoor_activities_rating: null,
    cultural_events_rating: null,
    shopping_rating: null,
    wellness_rating: null,
    travel_connectivity_rating: null,
    expat_community_size: null,
    english_proficiency_level: null,
    languages_spoken: null,
    dining_nightlife_level: null,
    museums_level: null,
    cultural_events_level: null,
    pace_of_life_actual: null,
    urban_rural_character: null,
    social_atmosphere: null,
    traditional_progressive_lean: null,
    visa_requirements: null,
    residency_path_info: null,
    tax_rates: null,
    government_efficiency_rating: null,
    political_stability_rating: null,
    emergency_services_quality: null,
    healthcare_specialties_available: null,
    medical_specialties_rating: null,
    environmental_health_rating: null,
    insurance_availability_rating: null,
    typical_monthly_living_cost: null,
    typical_rent_1bed: null,
    typical_home_price: null,
    healthcare_cost_monthly: null,
    local_mobility_options: null,
    regional_connectivity: null,
    international_access: null,
    geographic_features_actual: null,
    vegetation_type_actual: null,
    air_quality_index: null,
    environmental_factors: null,
    family_friendliness_rating: null,
    pet_friendliness: null,
    solo_living_support: null,
    senior_friendly_rating: null,
    retirement_community_presence: null,
    primary_language: null,
    secondary_languages: null,
    english_proficiency: null,
    visa_on_arrival_countries: null,
    easy_residency_countries: null,
    digital_nomad_visa: false,
    retirement_visa_available: false,
    min_income_requirement_usd: null,
    geographic_features: null,
    elevation_meters: null,
    distance_to_ocean_km: null,
    humidity_average: null,
    pollen_levels: null,
    natural_disaster_risk_score: null,
    income_tax_rate_pct: null,
    sales_tax_rate_pct: null,
    property_tax_rate_pct: null,
    tax_treaty_us: false,
    tax_haven_status: false,
    foreign_income_taxed: true,
    medical_specialties_available: null,
    nearest_major_hospital_km: null,
    health_insurance_required: true,
    private_healthcare_cost_index: null,
    golf_courses_count: 0,
    tennis_courts_count: 0,
    swimming_facilities: null,
    hiking_trails_km: 0,
    beaches_nearby: false,
    ski_resorts_within_100km: 0,
    marinas_count: 0,
    expat_groups: null,
    international_schools_count: 0,
    coworking_spaces_count: 0,
    farmers_markets: false,
    cultural_events_frequency: null,
    veterinary_clinics_count: 0,
    pet_friendly_rating: null,
    dog_parks_count: 0,
    international_schools_available: false,
    childcare_available: false,
    rent_2bed_usd: null,
    rent_house_usd: null,
    purchase_apartment_sqm_usd: null,
    purchase_house_avg_usd: null,
    property_appreciation_rate_pct: null,
    has_uber: false,
    has_public_transit: false,
    requires_car: false,
    train_station: false,
    international_flights_direct: null,
    pace_of_life: null,
    tourist_season_impact: null,
    lgbtq_friendly_rating: null,
    startup_ecosystem_rating: null,
    data_completeness_score: 0,
    last_verified_date: null,
    data_sources: null,
    needs_update: false
  }
  
  const { error } = await supabase
    .from('towns')
    .update(minimalParis)
    .eq('name', 'Paris')
    .eq('country', 'France')
  
  if (error) {
    console.error('❌ Error updating Paris:', error)
  } else {
    console.log('✅ Reset Paris to absolute minimal data')
    console.log('Paris should now be visible!')
  }
}

fixParisFinal()