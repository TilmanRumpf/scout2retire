// Column categories for Scout2Retire towns table

export const COLUMN_CATEGORIES = {
  // REAL DATA - From APIs/websites
  realData: {
    climate: [
      'avg_temp_summer',
      'avg_temp_winter', 
      'annual_rainfall',
      'sunshine_hours',
      'humidity_average'
    ],
    costs: [
      'cost_index',
      'rent_1bed',
      'rent_2bed_usd',
      'meal_cost',
      'groceries_cost',
      'utilities_cost'
    ],
    infrastructure: [
      'internet_speed',
      'population',
      'elevation_meters',
      'distance_to_ocean_km'
    ],
    legal: [
      'visa_requirements',
      'income_tax_rate_pct',
      'sales_tax_rate_pct',
      'property_tax_rate_pct'
    ]
  },
  
  // AI GENERATED - Claude as retirement consultant
  aiGenerated: {
    descriptions: [
      'description',
      'climate_description',
      'cost_description',
      'healthcare_description',
      'lifestyle_description',
      'safety_description',
      'infrastructure_description'
    ],
    ratings: [
      'healthcare_score',
      'safety_score',
      'quality_of_life',
      'nightlife_rating',
      'museums_rating',
      'cultural_rating'
    ],
    assessments: [
      'pace_of_life',
      'english_proficiency_level',
      'expat_community_size',
      'family_friendliness_rating',
      'senior_friendly_rating'
    ]
  },
  
  // HYBRID - Real data enhanced with AI insights
  hybrid: [
    'activities_available',
    'healthcare_specialties_available',
    'cultural_events_frequency'
  ]
}