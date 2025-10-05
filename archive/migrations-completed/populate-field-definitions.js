import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

// Default search patterns for different field types
const DEFAULT_PATTERNS = {
  // Temperature fields
  'avg_temp_summer': '{town_name} {country} average summer temperature celsius',
  'avg_temp_winter': '{town_name} {country} average winter temperature celsius',
  'avg_temp_spring': '{town_name} {country} average spring temperature celsius',
  'avg_temp_fall': '{town_name} {country} average fall autumn temperature celsius',
  
  // Climate fields
  'humidity_level_actual': '{town_name} {country} humidity level dry balanced humid climate',
  'summer_climate_actual': '{town_name} {country} summer climate hot warm mild cool',
  'winter_climate_actual': '{town_name} {country} winter climate warm mild cool cold very cold',
  'precipitation_level_actual': '{town_name} {country} rainfall precipitation level annual',
  'sunshine_level_actual': '{town_name} {country} sunshine hours annual sunny days',
  'sunshine_hours': '{town_name} {country} annual sunshine hours per year',
  'annual_rainfall': '{town_name} {country} annual rainfall precipitation mm inches',
  'climate': '{town_name} {country} climate type mediterranean tropical temperate',
  'climate_description': '{town_name} {country} climate weather description year round',
  'seasonal_variation_actual': '{town_name} {country} seasonal variation weather changes',
  
  // Geographic fields
  'elevation_meters': '{town_name} {country} elevation meters above sea level altitude',
  'latitude': '{town_name} latitude coordinates GPS',
  'longitude': '{town_name} longitude coordinates GPS',
  'geographic_features_actual': '{town_name} {country} geographic features coastal mountain valley plains',
  'vegetation_type_actual': '{town_name} {country} vegetation type forest grassland desert',
  'water_bodies': '{town_name} {country} nearest ocean sea lake river water body',
  'distance_to_ocean_km': '{town_name} {country} distance to ocean sea coast km',
  'geo_region': '{town_name} {country} geographic region location',
  'regions': '{town_name} {country} region state province area',
  'region': '{town_name} {country} region state province',
  
  // Cost fields
  'cost_of_living_usd': '{town_name} {country} cost of living USD monthly budget',
  'typical_monthly_living_cost': '{town_name} {country} monthly living cost expenses USD',
  'rent_1bed': '{town_name} {country} one bedroom apartment rent cost monthly',
  
  // Infrastructure fields
  'airport_distance': '{town_name} {country} nearest airport distance km',
  'nearest_major_hospital_km': '{town_name} {country} nearest hospital medical center distance',
  'internet_speed': '{town_name} {country} internet speed mbps fiber broadband',
  'has_public_transit': '{town_name} {country} public transportation bus metro subway',
  'has_uber': '{town_name} {country} uber lyft rideshare taxi available',
  'requires_car': '{town_name} {country} need car required transportation',
  
  // Quality of life scores
  'safety_score': '{town_name} {country} safety crime rate score statistics',
  'healthcare_score': '{town_name} {country} healthcare quality hospitals medical score',
  'walkability': '{town_name} {country} walkability score pedestrian friendly walkable',
  'english_proficiency': '{town_name} {country} english speaking proficiency level percentage',
  'air_quality_index': '{town_name} {country} air quality index AQI pollution',
  
  // Demographics
  'population': '{town_name} {country} population size inhabitants',
  'expat_community_size': '{town_name} {country} expat community size foreign residents',
  'pace_of_life': '{town_name} {country} pace of life slow moderate fast lifestyle',
  'urban_rural_character': '{town_name} {country} urban rural suburban character city town',
  
  // Cultural/Social
  'cultural_rating': '{town_name} {country} cultural attractions museums galleries score',
  'outdoor_rating': '{town_name} {country} outdoor activities hiking nature sports',
  'nightlife_rating': '{town_name} {country} nightlife bars clubs entertainment',
  'shopping_rating': '{town_name} {country} shopping malls stores markets',
  'wellness_rating': '{town_name} {country} wellness spa fitness gym health',
  'senior_friendly_rating': '{town_name} {country} senior friendly retirement suitable',
  'family_friendliness_rating': '{town_name} {country} family friendly children schools',
  'pet_friendly_rating': '{town_name} {country} pet friendly dogs cats allowed',
  'lgbtq_friendly_rating': '{town_name} {country} LGBTQ friendly acceptance tolerance',
  'cultural_events_frequency': '{town_name} {country} cultural events festivals frequency',
  'restaurants_rating': '{town_name} {country} restaurants dining food quality variety',
  
  // Visa/Legal
  'visa_requirements': '{town_name} {country} visa requirements tourist stay duration',
  'retirement_visa_available': '{town_name} {country} retirement visa available requirements',
  'digital_nomad_visa': '{town_name} {country} digital nomad visa remote work permit',
  'tax_treaty_us': '{town_name} {country} US tax treaty double taxation',
  'health_insurance_required': '{town_name} {country} health insurance required mandatory',
  
  // Medical
  'english_speaking_doctors': '{town_name} {country} english speaking doctors medical professionals',
  
  // Activities
  'outdoor_activities': '{town_name} {country} outdoor activities sports recreation',
  'hiking_trails': '{town_name} {country} hiking trails paths mountains nature',
  'beaches_nearby': '{town_name} {country} beaches nearby coast distance',
  'golf_courses': '{town_name} {country} golf courses clubs nearby',
  'cultural_attractions': '{town_name} {country} cultural attractions museums landmarks',
  
  // Descriptions
  'description': '{town_name} {country} overview description living expat guide',
  'appealStatement': '{town_name} {country} why live retire expat appeal benefits',
  'safety_description': '{town_name} {country} safety crime description areas avoid',
  'healthcare_description': '{town_name} {country} healthcare system hospitals description',
  
  // Languages
  'primary_language': '{town_name} {country} primary language spoken official',
  'languages_spoken': '{town_name} {country} languages spoken commonly used',
  
  // Other
  'country': '{town_name} which country location',
  'state_code': '{town_name} {country} state code abbreviation',
  'image_url_1': '{town_name} {country} photos images pictures skyline',
  'image_url_2': '{town_name} {country} scenic views photos attractions',
  'image_url_3': '{town_name} {country} lifestyle photos streets cafes',
  'matchScore': '{town_name} {country} retirement expat suitability score',
  'political_stability_rating': '{town_name} {country} political stability government safety',
  'natural_disaster_risk': '{town_name} {country} natural disaster risk earthquakes floods',
  'uv_index': '{town_name} {country} UV index sun exposure average',
  'storm_frequency': '{town_name} {country} storm frequency hurricanes typhoons weather'
};

async function populateFieldDefinitions() {
  console.log('🔍 Fetching current field definitions...');
  
  // Fetch current definitions
  const { data, error } = await supabase
    .from('towns')
    .select('audit_data')
    .eq('id', 'ffffffff-ffff-ffff-ffff-ffffffffffff')
    .single();
  
  if (error) {
    console.error('Error fetching field definitions:', error);
    return;
  }
  
  let fieldDefinitions = data?.audit_data?.field_definitions || {};
  let updatedCount = 0;
  let skippedCount = 0;
  
  console.log(`📊 Found ${Object.keys(fieldDefinitions).length} existing field definitions`);
  
  // Check each field in DEFAULT_PATTERNS
  for (const [fieldName, defaultPattern] of Object.entries(DEFAULT_PATTERNS)) {
    if (!fieldDefinitions[fieldName]) {
      fieldDefinitions[fieldName] = {};
    }
    
    // Only update if search_query is empty or doesn't exist
    if (!fieldDefinitions[fieldName].search_query || fieldDefinitions[fieldName].search_query.trim() === '') {
      fieldDefinitions[fieldName].search_query = defaultPattern;
      console.log(`✅ Added pattern for: ${fieldName}`);
      updatedCount++;
    } else {
      console.log(`⏭️  Skipped (has pattern): ${fieldName}`);
      skippedCount++;
    }
    
    // Also ensure audit_question exists with a default if empty
    if (!fieldDefinitions[fieldName].audit_question) {
      fieldDefinitions[fieldName].audit_question = `Is the ${fieldName.replace(/_/g, ' ')} for {town_name}, {country} accurate?`;
    }
  }
  
  // Also check for any fields that exist in definitions but aren't in our defaults
  for (const fieldName of Object.keys(fieldDefinitions)) {
    if (!DEFAULT_PATTERNS[fieldName] && (!fieldDefinitions[fieldName].search_query || fieldDefinitions[fieldName].search_query.trim() === '')) {
      // Create a generic pattern for unknown fields
      const readableName = fieldName.replace(/_/g, ' ');
      fieldDefinitions[fieldName].search_query = `{town_name} {country} ${readableName}`;
      console.log(`✅ Added generic pattern for unknown field: ${fieldName}`);
      updatedCount++;
    }
  }
  
  // Save back to database
  console.log(`\n💾 Saving updated definitions...`);
  console.log(`   Updated: ${updatedCount} fields`);
  console.log(`   Skipped: ${skippedCount} fields (already had patterns)`);
  
  const { error: updateError } = await supabase
    .from('towns')
    .update({
      audit_data: {
        ...data.audit_data,
        field_definitions: fieldDefinitions
      }
    })
    .eq('id', 'ffffffff-ffff-ffff-ffff-ffffffffffff');
  
  if (updateError) {
    console.error('❌ Error updating field definitions:', updateError);
  } else {
    console.log('✅ Successfully updated field definitions!');
    console.log(`📊 Total fields with patterns: ${Object.keys(fieldDefinitions).length}`);
  }
}

// Run the script
populateFieldDefinitions().catch(console.error);