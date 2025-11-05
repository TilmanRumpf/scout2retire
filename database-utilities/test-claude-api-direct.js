import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

async function testClaudeAPI() {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  if (!anthropicApiKey) {
    console.error('❌ ANTHROPIC_API_KEY not found in .env');
    return;
  }

  console.log('✅ Found Anthropic API key');
  console.log('🤖 Testing Claude API with Wuppertal prompt...\n');

  const location = 'Wuppertal, Germany';

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
    "climate_description": "2-3 sentence description"
  },
  "geography": {
    "geographic_features_actual": "coastal|mountainous|plains|lakes|rivers|desert|islands (comma-separated)",
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
    "english_proficiency": "low|basic|moderate|high|very_high",
    "pace_of_life_actual": "slow|relaxed|moderate|fast",
    "social_atmosphere": "reserved|quiet|moderate|friendly|vibrant",
    "cultural_events_frequency": "rare|occasional|monthly|frequent|weekly|constant",
    "traditional_progressive_lean": "traditional|moderate|balanced|progressive",
    "expat_community_size": "small|moderate|large",
    "lgbtq_friendly_rating": 1-10,
    "pet_friendly_rating": 1-10
  },
  "costs": {
    "cost_of_living_usd": 1500,
    "typical_monthly_living_cost": 2000,
    "rent_1bed": 800,
    "rent_2bed_usd": 1200,
    "rent_house_usd": 1500,
    "purchase_apartment_sqm_usd": 3000,
    "purchase_house_avg_usd": 250000,
    "groceries_cost": 400,
    "meal_cost": 15,
    "utilities_cost": 150,
    "healthcare_cost_monthly": 200,
    "property_tax_rate_pct": 1.5,
    "income_tax_rate_pct": 25.0,
    "sales_tax_rate_pct": 8.0
  },
  "healthcare": {
    "hospital_count": 3,
    "nearest_major_hospital_km": 5,
    "healthcare_specialties_available": "cardiology,orthopedics,oncology (comma-separated)",
    "english_speaking_doctors": "few|some|many|most",
    "insurance_availability_rating": 1-10,
    "emergency_services_quality": 1-10
  },
  "safety": {
    "crime_rate": "very_low|low|moderate|high|very_high",
    "natural_disaster_risk": "very_low|low|moderate|high|very_high",
    "air_quality_index": 50,
    "political_stability_rating": 1-10,
    "environmental_health_rating": 1-10
  },
  "infrastructure": {
    "internet_speed": 100,
    "internet_reliability": 1-10,
    "mobile_coverage": "poor|fair|good|excellent",
    "public_transport_quality": 1-10,
    "road_quality": 1-10,
    "walkability": 1-10,
    "bike_infrastructure": 1-10,
    "nearest_airport": "Airport Name",
    "airport_distance": 25,
    "international_airport_distance": 50
  },
  "activities": {
    "cultural_activities": "museums|theaters|galleries|festivals (comma-separated)",
    "outdoor_activities_rating": 1-10,
    "restaurants_rating": 1-10,
    "nightlife_rating": 1-10,
    "shopping_rating": 1-10,
    "sports_facilities": "gym|pool|tennis|golf (comma-separated)"
  },
  "demographics": {
    "population": 350000,
    "retirement_community_presence": "none|minimal|limited|moderate|strong|extensive"
  },
  "description": "2-3 comprehensive paragraphs about the town for retirees"
}

CRITICAL RULES:
1. Use ONLY exact values shown in quotes for categorical fields
2. All monetary values in USD
3. All distances in km, temperatures in Celsius
4. Provide realistic estimates based on research
5. Return ONLY valid JSON, no extra text
6. ALL fields required - no null values except water_bodies`;

  const startTime = Date.now();

  try {
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
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  API call completed in ${elapsed}s`);
    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Anthropic API error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n📦 Raw API response:');
    console.log('Usage:', data.usage);
    console.log('Model:', data.model);
    console.log('\n📝 Response text length:', data.content[0].text.length, 'characters');
    console.log('\n📄 FULL RESPONSE TEXT:');
    console.log('='.repeat(80));
    console.log(data.content[0].text);
    console.log('='.repeat(80));

    // Try to parse JSON
    const responseText = data.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error('\n❌ Could not find JSON in response');
      return;
    }

    console.log('\n✅ Found JSON, attempting to parse...');
    const aiData = JSON.parse(jsonMatch[0]);

    console.log('\n✅ JSON parsed successfully!');
    console.log('\n📊 DATA STRUCTURE:');
    console.log('Climate fields:', Object.keys(aiData.climate || {}).length);
    console.log('Geography fields:', Object.keys(aiData.geography || {}).length);
    console.log('Culture fields:', Object.keys(aiData.culture || {}).length);
    console.log('Costs fields:', Object.keys(aiData.costs || {}).length);
    console.log('Healthcare fields:', Object.keys(aiData.healthcare || {}).length);
    console.log('Safety fields:', Object.keys(aiData.safety || {}).length);
    console.log('Infrastructure fields:', Object.keys(aiData.infrastructure || {}).length);
    console.log('Activities fields:', Object.keys(aiData.activities || {}).length);
    console.log('Demographics fields:', Object.keys(aiData.demographics || {}).length);

    console.log('\n📋 SAMPLE DATA:');
    console.log('Climate:', JSON.stringify(aiData.climate, null, 2));
    console.log('\nGeography:', JSON.stringify(aiData.geography, null, 2));
    console.log('\nDescription length:', aiData.description?.length || 0, 'characters');

    console.log('\n🎯 TOTAL FIELDS IN AI RESPONSE:',
      Object.keys(aiData.climate || {}).length +
      Object.keys(aiData.geography || {}).length +
      Object.keys(aiData.culture || {}).length +
      Object.keys(aiData.costs || {}).length +
      Object.keys(aiData.healthcare || {}).length +
      Object.keys(aiData.safety || {}).length +
      Object.keys(aiData.infrastructure || {}).length +
      Object.keys(aiData.activities || {}).length +
      Object.keys(aiData.demographics || {}).length +
      1 // description
    );

  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

testClaudeAPI();
