// Normalized data options for towns database
// This ensures data consistency and prevents typos/variations

export const TOWN_DATA_OPTIONS = {
  // Countries - alphabetical (expanded to match database)
  countries: [
    'Albania', 'American Samoa', 'Antigua and Barbuda', 'Argentina', 'Aruba',
    'Australia', 'Austria', 'Bahamas', 'Barbados', 'Belgium', 'Belize', 'Bermuda',
    'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria', 'Cambodia', 'Canada',
    'Cape Verde', 'Cayman Islands', 'Chile', 'China', 'Colombia', 'Cook Islands',
    'Costa Rica', 'Croatia', 'Curaçao', 'Cyprus', 'Czech Republic', 'Denmark',
    'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Estonia',
    'Fiji', 'Finland', 'France', 'French Polynesia', 'Georgia', 'Germany', 'Ghana',
    'Greece', 'Grenada', 'Guam', 'Guatemala', 'Honduras', 'Hungary', 'Iceland',
    'India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan',
    'Kenya', 'Laos', 'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg', 'Madagascar',
    'Malaysia', 'Maldives', 'Malta', 'Mauritius', 'Mexico', 'Montenegro', 'Morocco',
    'Namibia', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Norway', 'Oman',
    'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
    'Portugal', 'Romania', 'Rwanda', 'Saint Lucia', 'Saint Vincent and the Grenadines',
    'Samoa', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Singapore', 'Slovakia',
    'Slovenia', 'Solomon Islands', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka',
    'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Tonga', 'Trinidad and Tobago',
    'Tunisia', 'Turkey', 'Turks and Caicos', 'United Arab Emirates', 'United Kingdom',
    'United States', 'Uruguay', 'US Virgin Islands', 'Vanuatu', 'Vietnam', 'Zambia'
  ],

  // Geographic regions (for geo_region column - from database)
  geo_regions: [
    'Caribbean', 'Central America', 'East Africa', 'East Asia', 'Eastern Europe',
    'Indian Ocean', 'Mediterranean', 'Middle East', 'North Africa', 'North America',
    'Northern Europe', 'Oceania', 'Pacific Islands', 'Scandinavia', 'South America',
    'South Asia', 'Southeast Asia', 'Southern Africa', 'Southern Europe', 'West Africa',
    'Western Europe'
  ],
  
  // Regions array values (for regions column - broader geographical areas)
  regions: [
    'Africa', 'Americas', 'Asia', 'Europe', 'Oceania',
    'Alpine', 'Amazon Basin', 'Andes', 'Atlantic Coast', 'Balkans',
    'Baltic', 'British Isles', 'Caribbean Islands', 'Central Africa',
    'Central America', 'Central Europe', 'East Africa', 'East Asia',
    'Eastern Europe', 'Gulf Coast', 'Gulf States', 'Himalayas', 'Iberian Peninsula',
    'Indian Subcontinent', 'Mediterranean', 'Middle East', 'Nordic',
    'North Africa', 'North America', 'Northern Europe', 'Pacific Coast',
    'Pacific Islands', 'Scandinavia', 'South America', 'South Asia',
    'Southeast Asia', 'Southern Africa', 'Southern Europe', 'Sub-Saharan Africa',
    'West Africa', 'Western Europe'
  ],

  // Climate types (from database)
  climate_types: [
    'Alpine', 'Arctic', 'Atlantic Maritime', 'Continental', 'Desert', 'Highland',
    'Highland Tropical', 'Humid Subtropical', 'Maritime', 'Mediterranean', 'Monsoon',
    'Oceanic', 'Savanna', 'Semi-arid', 'Subtropical', 'Temperate', 'Tropical'
  ],

  // Summer climate - MUST MATCH OnboardingClimate.jsx exactly (lines 195-199)
  summer_climate: ['mild', 'warm', 'hot'],

  // Winter climate - MUST MATCH OnboardingClimate.jsx exactly (lines 201-205)
  winter_climate: ['cold', 'cool', 'mild'],

  // Humidity levels - MUST MATCH OnboardingClimate.jsx exactly (lines 207-211)
  humidity_levels: ['dry', 'balanced', 'humid'],

  // Sunshine levels - MUST MATCH OnboardingClimate.jsx exactly (lines 213-217)
  sunshine_levels: ['often_sunny', 'balanced', 'less_sunny'],

  // Precipitation levels - MUST MATCH OnboardingClimate.jsx exactly (lines 219-223)
  precipitation_levels: ['mostly_dry', 'balanced', 'less_dry'],
  
  // Geographic features - standardized to lowercase for consistency
  geographic_features: [
    'coastal', 'island', 'mountain', 'valley', 'plains', 'desert', 'forest',
    'lake', 'river', 'peninsula', 'archipelago', 'highland', 'lowland', 'urban'
  ],
  
  // Vegetation types
  vegetation_types: [
    'Tropical Rainforest', 'Deciduous Forest', 'Coniferous Forest', 'Mediterranean',
    'Grassland', 'Desert', 'Tundra', 'Savanna', 'Scrubland', 'Wetlands', 'Alpine'
  ],
  
  // Water bodies (nearest body of water)
  water_bodies: [
    'Atlantic Ocean', 'Pacific Ocean', 'Indian Ocean', 'Arctic Ocean', 'Southern Ocean',
    'Mediterranean Sea', 'Caribbean Sea', 'Baltic Sea', 'North Sea', 'Black Sea',
    'Red Sea', 'Arabian Sea', 'South China Sea', 'East China Sea', 'Coral Sea',
    'Tasman Sea', 'Adriatic Sea', 'Aegean Sea', 'Ionian Sea', 'Tyrrhenian Sea',
    'Andaman Sea', 'Arabian Gulf', 'Bay of Bengal', 'Bay of Biscay', 'Gulf of Mexico', 
    'Gulf of Thailand', 'English Channel', 'Irish Sea', 'Java Sea', 'Sea of Japan', 
    'Yellow Sea', 'Amazon River', 'Danube River', 'Rhine River', 'Thames River', 
    'Seine River', 'Lake Geneva', 'Lake Como', 'Lake Garda', 'Lake Constance', 'Lake Balaton'
  ],
  
  // Languages (common ones)
  languages: [
    'Arabic', 'Chinese', 'Croatian', 'Czech', 'Danish', 'Dutch', 'English',
    'Estonian', 'Finnish', 'French', 'German', 'Greek', 'Hebrew', 'Hindi',
    'Hungarian', 'Indonesian', 'Italian', 'Japanese', 'Korean', 'Latvian',
    'Lithuanian', 'Malay', 'Norwegian', 'Polish', 'Portuguese', 'Romanian',
    'Russian', 'Serbian', 'Slovak', 'Slovenian', 'Spanish', 'Swedish',
    'Thai', 'Turkish', 'Vietnamese'
  ],
  
  // Pace of life - MUST MATCH OnboardingCulture.jsx exactly (lines 440-444)
  pace_of_life: ['relaxed', 'moderate', 'fast'],

  // Urban/Rural character - MUST MATCH OnboardingCulture.jsx exactly (lines 454-458)
  urban_rural: ['rural', 'suburban', 'urban'],

  // Expat community size - MUST MATCH OnboardingCulture.jsx exactly (lines 433-437)
  expat_community: ['small', 'moderate', 'large'],
  
  // Safety score (0-10)
  scores: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  
  // Healthcare quality
  healthcare_quality: ['Poor', 'Basic', 'Adequate', 'Good', 'Excellent', 'World-Class'],
  
  // Boolean fields
  boolean_options: [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ],
  
  // Visa requirements
  visa_difficulty: ['Very Easy', 'Easy', 'Moderate', 'Difficult', 'Very Difficult'],
  
  // Internet speed ranges
  internet_speed: [
    '< 10 Mbps', '10-25 Mbps', '25-50 Mbps', '50-100 Mbps', '100-500 Mbps', '> 500 Mbps'
  ],
  
  // Population ranges
  population_ranges: [
    '< 5,000', '5,000-10,000', '10,000-25,000', '25,000-50,000', 
    '50,000-100,000', '100,000-250,000', '250,000-500,000', 
    '500,000-1M', '1M-5M', '> 5M'
  ],
  
  // Cost ranges (USD per month)
  cost_ranges: [
    '< $500', '$500-750', '$750-1000', '$1000-1500', '$1500-2000',
    '$2000-2500', '$2500-3000', '$3000-4000', '$4000-5000', '> $5000'
  ],
  
  // Distance ranges (km)
  distance_ranges: [
    '< 5 km', '5-10 km', '10-25 km', '25-50 km', '50-100 km',
    '100-200 km', '200-500 km', '> 500 km'
  ],
  
  // Elevation ranges (meters)
  elevation_ranges: [
    '0-50m',
    '0-300m',
    '200-600m',
    '500-1000m',
    '> 1000m'
  ],
  
  // Tax treaty status
  tax_treaty: ['Yes', 'No', 'Partial', 'Under Negotiation'],
  
  // Political stability
  political_stability: ['Very Stable', 'Stable', 'Moderate', 'Unstable', 'Very Unstable'],
  
  // Natural disaster risk
  disaster_risk: ['Very Low', 'Low', 'Moderate', 'High', 'Very High'],
  
  // LGBTQ friendliness
  lgbtq_rating: ['Very Hostile', 'Hostile', 'Neutral', 'Friendly', 'Very Friendly'],
  
  // Cultural events frequency
  cultural_events: ['None', 'Rare', 'Occasional', 'Regular', 'Frequent', 'Very Frequent'],
  
  // Restaurant/dining quality
  dining_rating: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent', 'World-Class'],
  
  // Walkability
  walkability_rating: ['Not Walkable', 'Car-Dependent', 'Somewhat Walkable', 'Very Walkable', 'Walker\'s Paradise'],
  
  // Air quality index ranges
  air_quality: [
    'Excellent (0-50)', 'Good (51-100)', 'Moderate (101-150)',
    'Poor (151-200)', 'Very Poor (201-300)', 'Hazardous (>300)'
  ],
  
  // Seasonal variation
  seasonal_variation: ['None', 'Minimal', 'Moderate', 'Significant', 'Extreme']
};

// Helper function to get field type and options
export function getFieldOptions(fieldName) {
  const fieldMappings = {
    // Direct mappings
    'country': TOWN_DATA_OPTIONS.countries,
    'geo_region': TOWN_DATA_OPTIONS.geo_regions,
    'regions': TOWN_DATA_OPTIONS.regions,
    // 'region' is handled dynamically in SmartFieldEditor based on selected country
    'climate': TOWN_DATA_OPTIONS.climate_types,
    'summer_climate_actual': TOWN_DATA_OPTIONS.summer_climate,
    'winter_climate_actual': TOWN_DATA_OPTIONS.winter_climate,
    'humidity_level_actual': TOWN_DATA_OPTIONS.humidity_levels,
    'sunshine_level_actual': TOWN_DATA_OPTIONS.sunshine_levels,
    'precipitation_level_actual': TOWN_DATA_OPTIONS.precipitation_levels,
    'geographic_features_actual': TOWN_DATA_OPTIONS.geographic_features,
    'vegetation_type_actual': TOWN_DATA_OPTIONS.vegetation_types,
    'primary_language': TOWN_DATA_OPTIONS.languages,
    'languages_spoken': TOWN_DATA_OPTIONS.languages,
    'pace_of_life': TOWN_DATA_OPTIONS.pace_of_life,
    'pace_of_life_actual': TOWN_DATA_OPTIONS.pace_of_life,
    'urban_rural_character': TOWN_DATA_OPTIONS.urban_rural,
    'expat_community_size': TOWN_DATA_OPTIONS.expat_community,
    'safety_score': TOWN_DATA_OPTIONS.scores,
    'healthcare_score': TOWN_DATA_OPTIONS.scores,
    'walkability': TOWN_DATA_OPTIONS.scores,
    'english_proficiency': TOWN_DATA_OPTIONS.scores,
    'cultural_rating': TOWN_DATA_OPTIONS.scores,
    'outdoor_rating': TOWN_DATA_OPTIONS.scores,
    'nightlife_rating': TOWN_DATA_OPTIONS.scores,
    'shopping_rating': TOWN_DATA_OPTIONS.scores,
    'wellness_rating': TOWN_DATA_OPTIONS.scores,
    'senior_friendly_rating': TOWN_DATA_OPTIONS.scores,
    'family_friendliness_rating': TOWN_DATA_OPTIONS.scores,
    'pet_friendly_rating': TOWN_DATA_OPTIONS.scores,
    'lgbtq_friendly_rating': TOWN_DATA_OPTIONS.lgbtq_rating,
    'political_stability_rating': TOWN_DATA_OPTIONS.political_stability,
    'natural_disaster_risk': TOWN_DATA_OPTIONS.disaster_risk,
    'cultural_events_frequency': TOWN_DATA_OPTIONS.cultural_events,
    'restaurants_rating': TOWN_DATA_OPTIONS.dining_rating,
    'seasonal_variation_actual': TOWN_DATA_OPTIONS.seasonal_variation,
    'english_speaking_doctors': TOWN_DATA_OPTIONS.boolean_options,
    'retirement_visa_available': TOWN_DATA_OPTIONS.boolean_options,
    'digital_nomad_visa': TOWN_DATA_OPTIONS.boolean_options,
    'health_insurance_required': TOWN_DATA_OPTIONS.boolean_options,
    'has_public_transit': TOWN_DATA_OPTIONS.boolean_options,
    'has_uber': TOWN_DATA_OPTIONS.boolean_options,
    'requires_car': TOWN_DATA_OPTIONS.boolean_options,
    'tax_treaty_us': TOWN_DATA_OPTIONS.tax_treaty,
    'internet_speed': TOWN_DATA_OPTIONS.internet_speed,
    'typical_monthly_living_cost': TOWN_DATA_OPTIONS.cost_ranges,
    'cost_of_living_usd': TOWN_DATA_OPTIONS.cost_ranges,
    'airport_distance': TOWN_DATA_OPTIONS.distance_ranges,
    'nearest_major_hospital_km': TOWN_DATA_OPTIONS.distance_ranges,
    'distance_to_ocean_km': TOWN_DATA_OPTIONS.distance_ranges,
    'elevation_meters': TOWN_DATA_OPTIONS.elevation_ranges,
    'water_bodies': TOWN_DATA_OPTIONS.water_bodies
  };
  
  return fieldMappings[fieldName] || null;
}

// Check if field should be a dropdown
export function isDropdownField(fieldName) {
  return getFieldOptions(fieldName) !== null;
}

// Check if field is multi-select (array)
export function isMultiSelectField(fieldName) {
  const multiSelectFields = [
    'regions', 'geo_region', 'geographic_features_actual', 'vegetation_type_actual', 'water_bodies',
    'languages_spoken', 'cultural_landmark_1', 'cultural_landmark_2', 'cultural_landmark_3'
  ];
  return multiSelectFields.includes(fieldName);
}