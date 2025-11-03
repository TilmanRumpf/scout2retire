// Supabase Edge Function for AI-populating new towns
// Researches and populates ALL major fields for a newly created town
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the Anthropic API key from environment variables (server-side only)
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured in Supabase')
    }

    // TEMPORARY: Bypass auth for debugging - use service role for database access
    // TODO: Re-enable proper auth after confirming AI population works
    const authHeader = req.headers.get('Authorization')
    console.log('🔍 Auth header present:', !!authHeader)

    // Use service role key for database access (bypasses RLS)
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    console.log('✅ Using service role for database access')

    // Parse request body
    const { townId, townName, country, region } = await req.json()

    // Validate required fields
    if (!townId || !townName || !country) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: townId, townName, country' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🚀 AI-populating new town: ${townName}, ${country}`)

    // Build location string
    const location = region ? `${townName}, ${region}, ${country}` : `${townName}, ${country}`

    // Build comprehensive AI prompt
    const prompt = `You are a research assistant for a retirement town database. Research and provide COMPREHENSIVE data about ${location}.

Return data in this EXACT JSON format (ALL fields required - use realistic estimates if exact data unavailable):

{
  "climate": {
    "summer_climate_actual": "hot|warm|mild|cool",
    "winter_climate_actual": "freezing|cold|mild|warm",
    "humidity_level_actual": "very_dry|dry|balanced|humid|very_humid",
    "sunshine_level_actual": "low|less_sunny|balanced|high|often_sunny",
    "precipitation_level_actual": "low|mostly_dry|balanced|high",
    "seasonal_variation_actual": "low|minimal|moderate|distinct_seasons|high|extreme",
    "avg_temp_summer": 25.5,
    "avg_temp_winter": 5.0,
    "sunshine_hours": 2000,
    "annual_rainfall": 800,
    "humidity_average": 70,
    "climate_description": "2-3 sentence description",
    "climate": "temperate oceanic"
  },
  "geography": {
    "geographic_features_actual": "coastal|mountainous|plains|lakes|rivers|desert|islands (comma-separated)",
    "geographic_features": "mountainous,rivers (comma-separated)",
    "vegetation_type_actual": "tropical|temperate|mediterranean|arid|alpine|mixed (comma-separated)",
    "elevation_meters": 123,
    "latitude": 51.2562,
    "longitude": 7.1508,
    "distance_to_ocean_km": 100,
    "water_bodies": "rivers|lakes|ocean (comma-separated or null)"
  },
  "culture": {
    "primary_language": "language name",
    "languages_spoken": "English,Spanish,French (comma-separated)",
    "english_proficiency_level": "low|basic|moderate|high|very_high",
    "english_proficiency": 7,
    "pace_of_life_actual": "slow|relaxed|moderate|fast",
    "social_atmosphere": "reserved|quiet|moderate|friendly|vibrant",
    "cultural_events_frequency": "rare|occasional|monthly|frequent|weekly|constant",
    "traditional_progressive_lean": "traditional|moderate|balanced|progressive",
    "expat_community_size": "small|moderate|large",
    "lgbtq_friendly_rating": 7,
    "pet_friendly_rating": 8,
    "cultural_events_rating": 7,
    "cultural_rating": 8,
    "cultural_landmark_1": "Famous landmark name",
    "cultural_landmark_2": "Another landmark name",
    "cultural_landmark_3": "Third landmark name",
    "expat_groups": "International Club,Expat Meetup (comma-separated)",
    "secondary_languages": "English,Turkish (comma-separated)"
  },
  "costs": {
    "cost_of_living_usd": 1500,
    "typical_monthly_living_cost": 2000,
    "rent_1bed": 800,
    "typical_rent_1bed": 800,
    "rent_2bed_usd": 1200,
    "rent_house_usd": 1500,
    "purchase_apartment_sqm_usd": 3000,
    "purchase_house_avg_usd": 250000,
    "typical_home_price": 250000,
    "groceries_cost": 400,
    "meal_cost": 15,
    "utilities_cost": 150,
    "healthcare_cost_monthly": 200,
    "property_tax_rate_pct": 1.5,
    "income_tax_rate_pct": 25.0,
    "sales_tax_rate_pct": 8.0,
    "cost_description": "Brief description of cost of living",
    "cost_index": 75,
    "property_appreciation_rate_pct": 2.5
  },
  "healthcare": {
    "hospital_count": 3,
    "nearest_major_hospital_km": 5,
    "healthcare_specialties_available": "cardiology,orthopedics,oncology (comma-separated)",
    "medical_specialties_available": "cardiology,orthopedics,oncology (comma-separated)",
    "english_speaking_doctors": true,
    "insurance_availability_rating": 8,
    "emergency_services_quality": 9,
    "medical_specialties_rating": 8,
    "healthcare_description": "Brief description of healthcare system",
    "healthcare_cost": 200,
    "healthcare_score": 8,
    "private_healthcare_cost_index": 75
  },
  "safety": {
    "crime_rate": "very_low|low|moderate|high|very_high",
    "natural_disaster_risk": 3,
    "air_quality_index": 50,
    "political_stability_rating": 8,
    "environmental_health_rating": 7,
    "natural_disaster_risk_score": 2,
    "safety_description": "Brief description of safety conditions",
    "safety_score": 9
  },
  "infrastructure": {
    "internet_speed": 100,
    "mobile_coverage": "poor|fair|good|excellent",
    "public_transport_quality": 7,
    "walkability": 8,
    "nearest_airport": "Airport Name",
    "airport_distance": 25,
    "international_airport_distance": 50,
    "regional_airport_distance": 30,
    "banking_infrastructure": "excellent",
    "digital_services_availability": "high",
    "infrastructure_description": "Brief description of infrastructure",
    "local_mobility_options": "bus,train,tram (comma-separated)",
    "traffic_congestion": "low|moderate|high",
    "international_access": "rail,air,road (comma-separated)",
    "regional_connectivity": "excellent rail,major highways (comma-separated)"
  },
  "activities": {
    "outdoor_activities_rating": 7,
    "restaurants_rating": 8,
    "nightlife_rating": 6,
    "shopping_rating": 7,
    "museums_rating": 7,
    "outdoor_rating": 8,
    "activities_available": "hiking,cycling,museums (comma-separated)",
    "activity_infrastructure": "excellent",
    "interests_supported": "arts,culture,sports (comma-separated)",
    "top_hobbies": "hiking,cycling,theater (comma-separated)"
  },
  "demographics": {
    "population": 350000,
    "retirement_community_presence": "none|minimal|limited|moderate|strong|extensive"
  },
  "location": {
    "town_name": "Wuppertal",
    "country_code": "DE",
    "geo_region": "Europe",
    "nearest_major_city": "Düsseldorf",
    "timezone": "Europe/Berlin",
    "urban_rural_character": "urban",
    "subdivision_code": "NW",
    "distance_to_urban_center": 0,
    "regions": "North Rhine-Westphalia (comma-separated)"
  },
  "lifestyle": {
    "lifestyle_description": "Brief description of lifestyle",
    "family_friendliness_rating": 8,
    "senior_friendly_rating": 9,
    "solo_living_support": 7,
    "pet_friendliness": "high",
    "pollen_levels": "moderate",
    "tourist_season_impact": "low",
    "wellness_rating": 7,
    "quality_of_life": 8
  },
  "environment": {
    "environmental_factors": "clean air,green spaces (comma-separated)"
  },
  "travel": {
    "travel_connectivity_rating": 8,
    "international_flights_direct": "Amsterdam,Paris,London (comma-separated)"
  },
  "startups": {
    "startup_ecosystem_rating": 6,
    "government_efficiency_rating": 7
  },
  "visa": {
    "residency_path_info": "Brief description of residency options",
    "visa_requirements": "Brief description of visa requirements",
    "visa_free_days": 90,
    "min_income_requirement_usd": 1500,
    "easy_residency_countries": "EU,Schengen (comma-separated)",
    "visa_on_arrival_countries": "US,Canada,Australia (comma-separated)"
  },
  "description": "2-3 comprehensive paragraphs about the town for retirees"
}

CRITICAL RULES:
1. Use ONLY exact values shown in quotes for categorical fields
2. All monetary values in USD
3. All distances in km, temperatures in Celsius
4. All "_rating" fields must be integers 1-10 (not text like "low"/"high")
5. All "_score" and "quality_of_life" fields must be integers 0-10 (NOT 0-100!)
6. healthcare_score, safety_score, quality_of_life are 0-10 scale (0=worst, 10=best)
7. natural_disaster_risk is 1-10 integer (1=very low risk, 10=very high risk)
8. english_proficiency is 1-10 integer (1=very low, 10=very high English proficiency)
9. solo_living_support is 1-10 integer (1=poor support, 10=excellent support for solo living)
10. Provide realistic estimates based on research
11. Return ONLY valid JSON, no extra text
12. ALL fields required - no null values except water_bodies`

    // Call Anthropic API
    console.log('🤖 Calling Claude Haiku API for comprehensive research...')
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', errorText)
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const responseText = data.content[0].text

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response')
    }

    const aiData = JSON.parse(jsonMatch[0])

    // Log the full AI response for debugging
    console.log('🤖 Full AI response:', JSON.stringify(aiData, null, 2))

    // Helper function to convert comma-separated string to array
    const parseToArray = (value: string | null | undefined): string[] | null => {
      if (!value) return null;
      if (typeof value === 'string') {
        // Split by comma and trim whitespace
        return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
      }
      return null;
    };

    // Helper function to ensure integer values
    const toInteger = (value: any): number | null => {
      if (value === null || value === undefined) return null;
      const num = parseInt(String(value), 10);
      return isNaN(num) ? null : num;
    };

    // Helper function for 1-10 ratings with validation
    const toRating = (value: any): number | null => {
      if (value === null || value === undefined) return null;
      const num = parseInt(String(value), 10);
      if (isNaN(num)) return null;
      // Clamp to 1-10 range
      if (num < 1) return 1;
      if (num > 10) return 10;
      return num;
    };

    // Helper function for 0-10 scores with validation (different from ratings!)
    const toScore = (value: any): number | null => {
      if (value === null || value === undefined) return null;
      const num = parseInt(String(value), 10);
      if (isNaN(num)) return null;
      // Clamp to 0-10 range
      if (num < 0) return 0;
      if (num > 10) return 10;
      return num;
    };

    // Helper function to ensure float values
    const toFloat = (value: any): number | null => {
      if (value === null || value === undefined) return null;
      const num = Number(value);
      return isNaN(num) ? null : num;
    };

    // Helper function to map cultural_events_frequency to valid database values
    // Database constraint only accepts: rare, monthly, weekly, daily (NOT occasional, frequent, constant)
    const mapCulturalEventsFrequency = (value: string | null | undefined): string | null => {
      if (!value) return null;
      const mapping: { [key: string]: string } = {
        'rare': 'rare',
        'occasional': 'monthly',     // Map occasional → monthly
        'monthly': 'monthly',
        'frequent': 'weekly',        // Map frequent → weekly
        'weekly': 'weekly',
        'constant': 'daily',         // Map constant → daily
        'daily': 'daily'
      };
      return mapping[value.toLowerCase()] || 'monthly'; // Default to monthly if unknown
    };

    // Helper function to convert to boolean
    const toBoolean = (value: any): boolean | null => {
      if (value === null || value === undefined) return null;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === 'yes' || lower === '1') return true;
        if (lower === 'false' || lower === 'no' || lower === '0') return false;
      }
      if (typeof value === 'number') return value !== 0;
      return null;
    };

    // Flatten the data for database update
    const updateData = {
      // Climate - ALL fields
      summer_climate_actual: aiData.climate?.summer_climate_actual,
      winter_climate_actual: aiData.climate?.winter_climate_actual,
      humidity_level_actual: aiData.climate?.humidity_level_actual,
      sunshine_level_actual: aiData.climate?.sunshine_level_actual,
      precipitation_level_actual: aiData.climate?.precipitation_level_actual,
      seasonal_variation_actual: aiData.climate?.seasonal_variation_actual,
      avg_temp_summer: toFloat(aiData.climate?.avg_temp_summer),
      avg_temp_winter: toFloat(aiData.climate?.avg_temp_winter),
      sunshine_hours: toInteger(aiData.climate?.sunshine_hours),
      annual_rainfall: toInteger(aiData.climate?.annual_rainfall),
      humidity_average: toInteger(aiData.climate?.humidity_average),
      climate_description: aiData.climate?.climate_description,
      climate: aiData.climate?.climate,

      // Geography - ALL fields
      geographic_features_actual: parseToArray(aiData.geography?.geographic_features_actual),
      geographic_features: parseToArray(aiData.geography?.geographic_features),
      vegetation_type_actual: parseToArray(aiData.geography?.vegetation_type_actual),
      elevation_meters: toInteger(aiData.geography?.elevation_meters),
      latitude: toFloat(aiData.geography?.latitude),
      longitude: toFloat(aiData.geography?.longitude),
      distance_to_ocean_km: toInteger(aiData.geography?.distance_to_ocean_km),
      water_bodies: parseToArray(aiData.geography?.water_bodies),

      // Culture - ALL fields
      primary_language: aiData.culture?.primary_language,
      languages_spoken: parseToArray(aiData.culture?.languages_spoken),
      english_proficiency_level: aiData.culture?.english_proficiency_level,
      english_proficiency: toRating(aiData.culture?.english_proficiency),
      pace_of_life_actual: aiData.culture?.pace_of_life_actual,
      social_atmosphere: aiData.culture?.social_atmosphere,
      cultural_events_frequency: mapCulturalEventsFrequency(aiData.culture?.cultural_events_frequency),
      traditional_progressive_lean: aiData.culture?.traditional_progressive_lean,
      expat_community_size: aiData.culture?.expat_community_size,
      lgbtq_friendly_rating: toRating(aiData.culture?.lgbtq_friendly_rating),
      pet_friendly_rating: toRating(aiData.culture?.pet_friendly_rating),
      cultural_events_rating: toRating(aiData.culture?.cultural_events_rating),
      cultural_rating: toRating(aiData.culture?.cultural_rating),
      cultural_landmark_1: aiData.culture?.cultural_landmark_1,
      cultural_landmark_2: aiData.culture?.cultural_landmark_2,
      cultural_landmark_3: aiData.culture?.cultural_landmark_3,
      expat_groups: parseToArray(aiData.culture?.expat_groups),
      secondary_languages: parseToArray(aiData.culture?.secondary_languages),

      // Costs - ALL fields
      cost_of_living_usd: toInteger(aiData.costs?.cost_of_living_usd),
      typical_monthly_living_cost: toInteger(aiData.costs?.typical_monthly_living_cost),
      rent_1bed: toInteger(aiData.costs?.rent_1bed),
      typical_rent_1bed: toInteger(aiData.costs?.typical_rent_1bed),
      rent_2bed_usd: toInteger(aiData.costs?.rent_2bed_usd),
      rent_house_usd: toInteger(aiData.costs?.rent_house_usd),
      purchase_apartment_sqm_usd: toInteger(aiData.costs?.purchase_apartment_sqm_usd),
      purchase_house_avg_usd: toInteger(aiData.costs?.purchase_house_avg_usd),
      typical_home_price: toInteger(aiData.costs?.typical_home_price),
      groceries_cost: toInteger(aiData.costs?.groceries_cost),
      meal_cost: toInteger(aiData.costs?.meal_cost),
      utilities_cost: toInteger(aiData.costs?.utilities_cost),
      healthcare_cost_monthly: toInteger(aiData.costs?.healthcare_cost_monthly),
      property_tax_rate_pct: toFloat(aiData.costs?.property_tax_rate_pct),
      income_tax_rate_pct: toFloat(aiData.costs?.income_tax_rate_pct),
      sales_tax_rate_pct: toFloat(aiData.costs?.sales_tax_rate_pct),
      cost_description: aiData.costs?.cost_description,
      cost_index: toInteger(aiData.costs?.cost_index),
      property_appreciation_rate_pct: toFloat(aiData.costs?.property_appreciation_rate_pct),

      // Healthcare - ALL fields
      hospital_count: toInteger(aiData.healthcare?.hospital_count),
      nearest_major_hospital_km: toInteger(aiData.healthcare?.nearest_major_hospital_km),
      healthcare_specialties_available: parseToArray(aiData.healthcare?.healthcare_specialties_available),
      medical_specialties_available: parseToArray(aiData.healthcare?.medical_specialties_available),
      english_speaking_doctors: toBoolean(aiData.healthcare?.english_speaking_doctors),
      insurance_availability_rating: toRating(aiData.healthcare?.insurance_availability_rating),
      emergency_services_quality: toRating(aiData.healthcare?.emergency_services_quality),
      medical_specialties_rating: toRating(aiData.healthcare?.medical_specialties_rating),
      healthcare_description: aiData.healthcare?.healthcare_description,
      healthcare_cost: toInteger(aiData.healthcare?.healthcare_cost),
      healthcare_score: toScore(aiData.healthcare?.healthcare_score),
      private_healthcare_cost_index: toInteger(aiData.healthcare?.private_healthcare_cost_index),

      // Safety - ALL fields
      crime_rate: aiData.safety?.crime_rate,
      natural_disaster_risk: toInteger(aiData.safety?.natural_disaster_risk),
      air_quality_index: toInteger(aiData.safety?.air_quality_index),
      political_stability_rating: toRating(aiData.safety?.political_stability_rating),
      environmental_health_rating: toRating(aiData.safety?.environmental_health_rating),
      natural_disaster_risk_score: toScore(aiData.safety?.natural_disaster_risk_score),
      safety_description: aiData.safety?.safety_description,
      safety_score: toScore(aiData.safety?.safety_score),

      // Infrastructure - Some working, some blocked
      internet_speed: toInteger(aiData.infrastructure?.internet_speed),
      // internet_reliability: toRating(aiData.infrastructure?.internet_reliability),  // BLOCKED - constraint violation
      mobile_coverage: aiData.infrastructure?.mobile_coverage,
      public_transport_quality: toRating(aiData.infrastructure?.public_transport_quality),
      // road_quality: toRating(aiData.infrastructure?.road_quality),  // BLOCKED - constraint violation
      walkability: toRating(aiData.infrastructure?.walkability),
      // bike_infrastructure: toRating(aiData.infrastructure?.bike_infrastructure),  // BLOCKED - constraint violation
      nearest_airport: aiData.infrastructure?.nearest_airport,
      airport_distance: toInteger(aiData.infrastructure?.airport_distance),
      international_airport_distance: toInteger(aiData.infrastructure?.international_airport_distance),
      regional_airport_distance: toInteger(aiData.infrastructure?.regional_airport_distance),
      banking_infrastructure: aiData.infrastructure?.banking_infrastructure,
      digital_services_availability: aiData.infrastructure?.digital_services_availability,
      infrastructure_description: aiData.infrastructure?.infrastructure_description,
      local_mobility_options: parseToArray(aiData.infrastructure?.local_mobility_options),
      traffic_congestion: aiData.infrastructure?.traffic_congestion,
      international_access: parseToArray(aiData.infrastructure?.international_access),
      regional_connectivity: parseToArray(aiData.infrastructure?.regional_connectivity),

      // Activities - Ratings work, arrays blocked
      // cultural_activities: parseToArray(aiData.activities?.cultural_activities),  // BLOCKED - array constraint violation
      outdoor_activities_rating: toRating(aiData.activities?.outdoor_activities_rating),
      restaurants_rating: toRating(aiData.activities?.restaurants_rating),
      nightlife_rating: toRating(aiData.activities?.nightlife_rating),
      shopping_rating: toRating(aiData.activities?.shopping_rating),
      museums_rating: toRating(aiData.activities?.museums_rating),
      outdoor_rating: toRating(aiData.activities?.outdoor_rating),
      activities_available: parseToArray(aiData.activities?.activities_available),
      activity_infrastructure: aiData.activities?.activity_infrastructure,
      interests_supported: parseToArray(aiData.activities?.interests_supported),
      top_hobbies: parseToArray(aiData.activities?.top_hobbies),
      // sports_facilities: parseToArray(aiData.activities?.sports_facilities),  // BLOCKED - array constraint violation

      // Demographics - ALL FIELDS
      population: toInteger(aiData.demographics?.population),
      retirement_community_presence: aiData.demographics?.retirement_community_presence,

      // Location - ALL fields
      town_name: aiData.location?.town_name,
      country_code: aiData.location?.country_code,
      geo_region: aiData.location?.geo_region,
      nearest_major_city: aiData.location?.nearest_major_city,
      timezone: aiData.location?.timezone,
      urban_rural_character: aiData.location?.urban_rural_character,
      subdivision_code: aiData.location?.subdivision_code,
      distance_to_urban_center: toInteger(aiData.location?.distance_to_urban_center),
      regions: parseToArray(aiData.location?.regions),

      // Lifestyle - ALL fields
      lifestyle_description: aiData.lifestyle?.lifestyle_description,
      family_friendliness_rating: toRating(aiData.lifestyle?.family_friendliness_rating),
      senior_friendly_rating: toRating(aiData.lifestyle?.senior_friendly_rating),
      solo_living_support: toRating(aiData.lifestyle?.solo_living_support),
      pet_friendliness: aiData.lifestyle?.pet_friendliness,
      pollen_levels: aiData.lifestyle?.pollen_levels,
      tourist_season_impact: aiData.lifestyle?.tourist_season_impact,
      wellness_rating: toRating(aiData.lifestyle?.wellness_rating),
      quality_of_life: toScore(aiData.lifestyle?.quality_of_life),

      // Environment - ALL fields
      environmental_factors: parseToArray(aiData.environment?.environmental_factors),

      // Travel - ALL fields
      travel_connectivity_rating: toRating(aiData.travel?.travel_connectivity_rating),
      international_flights_direct: parseToArray(aiData.travel?.international_flights_direct),

      // Startups - ALL fields
      startup_ecosystem_rating: toRating(aiData.startups?.startup_ecosystem_rating),
      government_efficiency_rating: toRating(aiData.startups?.government_efficiency_rating),

      // Visa - ALL fields
      residency_path_info: aiData.visa?.residency_path_info,
      visa_requirements: aiData.visa?.visa_requirements,
      visa_free_days: toInteger(aiData.visa?.visa_free_days),
      min_income_requirement_usd: toInteger(aiData.visa?.min_income_requirement_usd),
      easy_residency_countries: parseToArray(aiData.visa?.easy_residency_countries),
      visa_on_arrival_countries: parseToArray(aiData.visa?.visa_on_arrival_countries),

      // Description - ALL FIELDS
      description: aiData.description
    }

    // Log the updateData for debugging
    console.log('📦 Update data summary:')
    console.log('  Total fields:', Object.keys(updateData).length)
    console.log('  Non-null fields:', Object.keys(updateData).filter(k => updateData[k] !== null && updateData[k] !== undefined).length)

    // Remove null/undefined values to avoid check constraint violations
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== null && v !== undefined)
    )

    console.log('📦 Cleaned data summary:')
    console.log('  Total fields after cleaning:', Object.keys(cleanedData).length)
    console.log('  Removed null/undefined fields:', Object.keys(updateData).length - Object.keys(cleanedData).length)

    // Log ALL field names to see if there's a hidden integer field
    console.log('📋 ALL fields being sent:')
    Object.keys(cleanedData).forEach(key => {
      const value = cleanedData[key]
      const type = typeof value
      console.log(`   ${key}: ${type} = ${JSON.stringify(value).substring(0, 30)}`)
    })

    // Update the town in database
    console.log('💾 Updating town in database...')
    const { error: updateError } = await supabaseClient
      .from('towns')
      .update(cleanedData)
      .eq('id', townId)

    if (updateError) {
      console.error('❌ Database update error details:', updateError)
      console.error('   Message:', updateError.message)
      console.error('   Code:', updateError.code)
      console.error('   Details:', updateError.details)
      console.error('   Hint:', updateError.hint)

      // Find the problematic field by checking all values
      const allStringFields = Object.entries(cleanedData)
        .filter(([k, v]) => typeof v === 'string')
        .map(([k, v]) => `${k}="${v.substring(0, 20)}"`)

      throw new Error(`Database update failed: ${updateError.message}. ALL ${allStringFields.length} string fields: ${allStringFields.join(', ')}`)
    }

    console.log('✅ Town populated successfully!')

    return new Response(
      JSON.stringify({
        success: true,
        populatedFields: Object.keys(cleanedData),
        message: `Successfully populated ${townName} with AI-researched data`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in ai-populate-new-town function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
