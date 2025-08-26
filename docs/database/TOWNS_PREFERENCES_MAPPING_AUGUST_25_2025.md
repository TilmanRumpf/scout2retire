# Towns Table & User Preferences Mapping Guide
**Updated: August 25, 2025**

## Overview
This document provides a comprehensive mapping between the `towns` table columns (173 total) and the `user_preferences` table columns (66 total) to understand how the matching algorithm works. This version reflects the current database state as of August 25, 2025.

## Database Statistics (August 25, 2025)
- **Towns in database**: 341 towns
- **User preferences records**: 12 users
- **Towns table columns**: 173 columns
- **User preferences table columns**: 66 columns

## Key Matching Categories

### 1. CLIMATE MATCHING

#### User Preference Columns:
- `summer_climate_preference`: Array (e.g., ["hot", "warm", "mild"])
- `winter_climate_preference`: Array (e.g., ["mild", "cold", "warm"])
- `humidity_level`: Array (e.g., ["humid", "dry", "moderate"])
- `sunshine`: Array (e.g., ["sunny", "less_sunny", "cloudy"])
- `precipitation`: Array (e.g., ["often_rainy", "dry", "moderate"])
- `seasonal_preference`: String (e.g., "warm_all_year", "distinct_seasons")

#### Towns Table Columns:
- `climate`: String - Main climate type (Continental, Desert, Mediterranean, Subtropical, Temperate, Tropical)
- `climate_description`: String - Detailed climate description
- `avg_temp_summer`: Number - Average summer temperature (12°C to 42°C)
- `avg_temp_winter`: Number - Average winter temperature (-10°C to 31°C)
- `summer_temp_low`: Number - Summer low temperature (7°C to 29°C)
- `summer_temp_high`: Number - Summer high temperature (17°C to 49°C)
- `winter_temp_low`: Number - Winter low temperature (-15°C to 25°C)
- `winter_temp_high`: Number - Winter high temperature (-5°C to 35°C)
- `humidity_average`: Number - Average humidity percentage (30% to 85%)
- `humidity_level_actual`: String - Categorical humidity ("low", "medium", "high")
- `annual_rainfall`: Number - Annual rainfall (0mm to 3900mm)
- `precipitation_level_actual`: String - Categorical ("dry", "moderate", "wet")
- `sunshine_hours`: Number - Annual sunshine hours (1320 to 4020 hours)
- `sunshine_level_actual`: String - Categorical ("sunny", "moderate", "cloudy")
- `summer_climate_actual`: String - Actual summer climate ("hot", "warm", "mild")
- `winter_climate_actual`: String - Actual winter climate ("cold", "mild", "warm")
- `seasonal_variation_actual`: String - Seasonal variation ("low", "moderate", "high")

### 2. COST/BUDGET MATCHING

#### User Preference Columns:
- `total_monthly_budget`: Number - Total monthly budget in USD
- `max_monthly_rent`: Number - Maximum rent budget in USD
- `max_home_price`: Number - Maximum home purchase price in USD
- `monthly_healthcare_budget`: Number - Healthcare budget in USD
- `income_tax_sensitive`: Boolean - Sensitivity to income tax
- `property_tax_sensitive`: Boolean - Sensitivity to property tax
- `sales_tax_sensitive`: Boolean - Sensitivity to sales tax

#### Towns Table Columns:
- `cost_of_living_usd`: Number - Monthly cost of living ($536 to $4,500)
- `cost_index`: Number - Cost index (20 to 90, lower is cheaper)
- `rent_1bed`: Number - 1-bedroom apartment rent ($240 to $2,800)
- `rent_2bed_usd`: Number - 2-bedroom apartment rent ($300 to $3,500)
- `rent_house_usd`: Number - House rental cost ($400 to $5,000)
- `purchase_apartment_sqm_usd`: Number - Price per sqm ($800 to $12,000)
- `purchase_house_avg_usd`: Number - Average house purchase ($75,000 to $1,500,000)
- `typical_home_price`: Number - Typical home price ($50,000 to $1,200,000)
- `typical_rent_1bed`: Number - Typical 1-bed rent ($200 to $2,500)
- `typical_monthly_living_cost`: Number - Typical monthly expenses ($400 to $4,000)
- `groceries_cost`: Number - Monthly groceries cost ($100 to $600)
- `meal_cost`: Number - Average restaurant meal cost ($5 to $50)
- `utilities_cost`: Number - Monthly utilities cost ($50 to $350)
- `healthcare_cost`: Number - Basic healthcare cost ($20 to $500)
- `healthcare_cost_monthly`: Number - Monthly healthcare expenses ($25 to $600)
- `income_tax_rate_pct`: Number - Income tax rate (0% to 55%)
- `property_tax_rate_pct`: Number - Property tax rate (0% to 10%)
- `sales_tax_rate_pct`: Number - Sales tax rate (0% to 25%)
- `property_appreciation_rate_pct`: Number - Annual property appreciation (-5% to 15%)

### 3. REGION/LOCATION MATCHING

#### User Preference Columns:
- `countries`: Array - Preferred countries (e.g., ["Portugal", "Spain", "Netherlands"])
- `regions`: Array - Preferred regions (e.g., ["Europe", "Mediterranean", "EU"])
- `provinces`: Array - Preferred provinces/states
- `geographic_features`: Array - Preferred features (e.g., ["Coastal", "Mountains", "Island"])
- `vegetation_types`: Array - Preferred vegetation (e.g., ["Mediterranean", "Tropical", "Forest"])

#### Towns Table Columns:
- `country`: String - Country name (56 unique countries)
- `region`: String - Region/state/province name
- `geo_region`: String - Geographic region (e.g., "Western Europe", "Southeast Asia")
- `regions`: Array - Multiple region classifications (43 distinct regions including EU, ASEAN, Mediterranean)
- `geographic_features`: Array - Geographic features present
- `geographic_features_actual`: Array - Verified geographic features (8 types: Coastal, Desert, Island, Mountains, Plains, River Valley, Urban, Valley)
- `vegetation_type_actual`: String - Actual vegetation type (20 types including Alpine, Mediterranean, Tropical)
- `water_bodies`: Array - Nearby water bodies
- `distance_to_ocean_km`: Number - Distance to ocean (0 to 1600 km)
- `elevation_meters`: Number - Elevation above sea level (0 to 3640 meters)
- `beaches_nearby`: Boolean - Whether beaches are nearby
- `latitude`: Number - Geographic latitude (-45 to 70)
- `longitude`: Number - Geographic longitude (-165 to 175)

### 4. LIFESTYLE & CULTURE MATCHING

#### User Preference Columns:
- `lifestyle_preferences`: Object with:
  - `urban_rural`: Array (e.g., ["urban", "suburban", "rural"])
  - `pace_of_life`: Array (e.g., ["fast", "moderate", "relaxed"])
  - `traditional_progressive`: String
- `cultural_importance`: Object with ratings for:
  - `museums`: Number (1-5)
  - `cultural_events`: Number (1-5)
  - `dining_nightlife`: Number (1-5)
- `lifestyle_importance`: Object with ratings for:
  - `shopping`: Number (1-5)
  - `wellness`: Number (1-5)
  - `cultural_events`: Number (1-5)
  - `outdoor_activities`: Number (1-5)

#### Towns Table Columns:
- `urban_rural_character`: String - Urban/suburban/rural classification
- `pace_of_life`: String - Actual pace ("fast", "moderate", "relaxed")
- `pace_of_life_actual`: String - Verified pace of life
- `traditional_progressive_lean`: String - Cultural lean
- `social_atmosphere`: String - Social atmosphere (e.g., "friendly", "reserved")
- `museums_level`: Number - Museum availability (0 to 10)
- `museums_rating`: Number - Museum quality rating (1 to 10)
- `cultural_events_level`: Number - Cultural event frequency (0 to 10)
- `cultural_events_rating`: Number - Cultural event quality (1 to 10)
- `cultural_events_frequency`: String - How often events occur
- `cultural_rating`: Number - Overall cultural rating (1 to 10)
- `dining_nightlife_level`: Number - Dining/nightlife availability (0 to 10)
- `nightlife_rating`: Number - Nightlife quality rating (1 to 10)
- `restaurants_rating`: Number - Restaurant quality rating (1 to 10)
- `shopping_rating`: Number - Shopping quality rating (1 to 10)
- `wellness_rating`: Number - Wellness facilities rating (1 to 10)
- `outdoor_activities_rating`: Number - Outdoor activities rating (1 to 10)
- `outdoor_rating`: Number - Overall outdoor rating (1 to 10)

### 5. HEALTHCARE MATCHING

#### User Preference Columns:
- `healthcare_quality`: Array - Required quality levels
- `monthly_healthcare_budget`: Number - Healthcare budget
- `insurance_importance`: Array - Insurance priority levels
- `health_considerations`: Object with:
  - `healthcare_access`: String
  - `ongoing_treatment`: String
  - `environmental_health`: String

#### Towns Table Columns:
- `healthcare_score`: Number - Overall healthcare score (2 to 10)
- `healthcare_cost`: Number - Basic healthcare cost ($10 to $400)
- `healthcare_cost_monthly`: Number - Monthly healthcare expenses ($20 to $500)
- `private_healthcare_cost_index`: Number - Private healthcare cost index (20 to 90)
- `hospital_count`: Number - Number of hospitals (0 to 500)
- `nearest_major_hospital_km`: Number - Distance to major hospital (0 to 200 km)
- `english_speaking_doctors`: Boolean - English-speaking doctors available
- `medical_specialties_available`: Array - Available specialties
- `medical_specialties_rating`: Number - Specialty care rating (1 to 10)
- `healthcare_specialties_available`: Array - Healthcare specialties
- `health_insurance_required`: Boolean - Whether insurance is required
- `insurance_availability_rating`: Number - Insurance availability (1 to 10)
- `emergency_services_quality`: Number - Emergency services rating (1 to 10)
- `air_quality_index`: Number - Air quality (10 to 300, lower is better)
- `environmental_health_rating`: Number - Environmental health score (1 to 10)

### 6. ACTIVITIES & HOBBIES MATCHING

#### User Preference Columns:
- `activities`: Array - Preferred activities (e.g., ["cycling", "water_sports", "gardening"])
- `interests`: Array - Interests (e.g., ["theater", "wine", "volunteering"])

#### Towns Table Columns:
- `activities_available`: Array - Available activities (142 distinct activities including hiking, golf, cultural events, water sports)
- `golf_courses_count`: Number - Number of golf courses (0 to 50)
- `tennis_courts_count`: Number - Number of tennis courts (0 to 100)
- `hiking_trails_km`: Number - Kilometers of hiking trails (0 to 1000)
- `marinas_count`: Number - Number of marinas (0 to 20)
- `ski_resorts_within_100km`: Number - Nearby ski resorts (0 to 15)
- `dog_parks_count`: Number - Dog parks available (0 to 50)
- `swimming_facilities`: Array - Swimming facilities
- `coworking_spaces_count`: Number - Coworking spaces (0 to 100)
- `farmers_markets`: Boolean - Farmers markets available

### 7. ADMINISTRATION & VISA MATCHING

#### User Preference Columns:
- `residency_path`: Array - Desired paths (e.g., ["residence", "citizenship"])
- `visa_preference`: Array - Visa preferences
- `visa_concerns`: Boolean - Whether visa is a concern
- `stay_duration`: Array - Intended stay duration
- `tax_preference`: Array - Tax preferences

#### Towns Table Columns:
- `retirement_visa_available`: Boolean - Retirement visa available
- `digital_nomad_visa`: Boolean - Digital nomad visa available
- `visa_requirements`: Object - Visa requirement details
- `visa_on_arrival_countries`: Array - Countries with visa on arrival
- `easy_residency_countries`: Array - Countries with easy residency
- `residency_path_info`: Object - Residency path information
- `min_income_requirement_usd`: Number - Minimum income for visa ($0 to $5,000/month)
- `tax_haven_status`: Boolean - Tax haven status
- `tax_treaty_us`: Boolean - US tax treaty exists
- `foreign_income_taxed`: Boolean - Whether foreign income is taxed
- `government_efficiency_rating`: Number - Government efficiency score (1 to 10)

### 8. TRANSPORTATION & MOBILITY MATCHING

#### User Preference Columns:
- `mobility`: Object with:
  - `local`: String - Local mobility needs
  - `regional`: String - Regional travel needs
  - `international`: String - International travel needs (e.g., "major_airport")

#### Towns Table Columns:
- `nearest_airport`: String - Name of nearest airport
- `nearest_airport_code`: String - Airport code
- `airport_distance`: Number - Distance to airport (0 to 500 km)
- `nearest_airport_distance`: Number - Airport distance
- `international_flights_direct`: Array - Direct international destinations
- `has_public_transit`: Boolean - Public transit available
- `public_transport_quality`: Number - Transit quality rating (1 to 10)
- `has_uber`: Boolean - Uber/ride-sharing available
- `train_station`: Boolean - Train station present
- `requires_car`: Boolean - Whether car is necessary
- `walkability`: Number - Walkability score (1 to 10)
- `travel_connectivity_rating`: Number - Overall connectivity (1 to 10)

### 9. FAMILY & PET CONSIDERATIONS

#### User Preference Columns:
- `family_status`: String - Family situation (e.g., "couple", "single", "family")
- `bringing_children`: Boolean - Whether bringing children
- `bringing_pets`: Boolean - Whether bringing pets
- `pet_types`: Array - Types of pets (e.g., ["dog", "cat"])

#### Towns Table Columns:
- `family_friendliness_rating`: Number - Family-friendly score (1 to 10)
- `childcare_available`: Boolean - Childcare services available
- `international_schools_available`: Boolean - International schools present
- `international_schools_count`: Number - Number of international schools (0 to 50)
- `pet_friendliness`: String - Pet friendliness level
- `pet_friendly_rating`: Number - Pet-friendly score (1 to 10)
- `veterinary_clinics_count`: Number - Number of vet clinics (0 to 100)
- `dog_parks_count`: Number - Dog parks available (0 to 50)

### 10. SAFETY & POLITICAL MATCHING

#### User Preference Columns:
- `safety_importance`: Array - Safety priority levels
- `political_stability`: Array - Political stability requirements
- `government_efficiency`: Array - Government efficiency preferences

#### Towns Table Columns:
- `safety_score`: Number - Overall safety score (2 to 10)
- `crime_rate`: String - Crime rate level (7 levels from "Very Low" to "Very High")
- `crime_index`: Number - Crime index score (10 to 80)
- `political_stability_rating`: Number - Political stability score (1 to 10)
- `government_efficiency_rating`: Number - Government efficiency (1 to 10)
- `natural_disaster_risk`: Number - Natural disaster risk level (1 to 10)
- `natural_disaster_risk_score`: Number - Disaster risk score (1 to 10)

### 11. COMMUNITY & SOCIAL MATCHING

#### User Preference Columns:
- `expat_community_preference`: Array - Expat community size preference (e.g., ["large", "medium", "small"])
- `language_comfort`: Object with:
  - `preferences`: Array - Language comfort levels
  - `already_speak`: Array - Languages already spoken
- `primary_citizenship`: String - Primary citizenship
- `secondary_citizenship`: String - Secondary citizenship

#### Towns Table Columns:
- `expat_community_size`: String - Size of expat community ("small", "medium", "large")
- `expat_population`: String - Expat population level
- `english_proficiency`: String - English proficiency level
- `english_proficiency_level`: String - Categorical English level
- `primary_language`: String - Primary local language
- `languages_spoken`: Array - Languages commonly spoken
- `secondary_languages`: Array - Secondary languages
- `lgbtq_friendly_rating`: Number - LGBTQ+ friendliness score (1 to 10)
- `senior_friendly_rating`: Number - Senior-friendly score (1 to 10)
- `retirement_community_presence`: String - Retirement community presence

## Value Ranges Reference (Current as of August 25, 2025)

### Numeric Ranges:
- **Temperatures**: 
  - Summer: 12°C to 42°C
  - Winter: -10°C to 31°C
- **Cost of Living**: $536 to $4,500/month
- **Rent (1-bed)**: $240 to $2,800/month
- **Home Prices**: $75,000 to $1,500,000
- **Population**: 500 to 20,000,000
- **Distance to Ocean**: 0 to 1,600 km
- **Elevation**: 0 to 3,640 meters
- **Ratings**: Generally 1-10 scale (some 0-10)
- **Tax Rates**: 
  - Income: 0-55%
  - Sales: 0-25%
  - Property: 0-10%
- **Air Quality Index**: 10-300 (lower is better)
- **Crime Index**: 10-80 (lower is better)
- **Sunshine Hours**: 1,320-4,020 hours/year
- **Rainfall**: 0-3,900 mm/year
- **Humidity**: 30-85%

### Categorical Values:
- **Climate Types**: Continental, Desert, Mediterranean, Subtropical, Temperate, Tropical
- **Urban/Rural**: urban, suburban, rural
- **Pace of Life**: fast, moderate, relaxed
- **Community Size**: small, medium, large
- **Crime Levels**: Very Low, Low, Low to Moderate, Moderate, Moderate to High, High, Very High
- **Geographic Features**: Coastal, Desert, Island, Mountains, Plains, River Valley, Urban, Valley
- **Vegetation Types**: 20 types including Alpine, Arid, Boreal Forest, Chaparral, Deciduous Forest, Desert, Grassland, Mediterranean, Mixed Forest, Mountain, Pine Forest, Prairie, Rainforest, Savanna, Scrubland, Steppe, Subtropical, Temperate Forest, Tropical, Tundra

### Regional Classifications (43 total):
- **Continental**: Africa, Asia, Europe, North America, Oceania, South America
- **Sub-regional**: Caribbean, Central America, Central Europe, East Africa, East Asia, Eastern Europe, Mediterranean, Middle East, North Africa, Northern Europe, Pacific Islands, Scandinavia, South Asia, Southeast Asia, Southern Africa, Southern Europe, Sub-Saharan Africa, West Africa, Western Europe
- **Economic/Political**: ASEAN, EU, G20, G7, MENA, MERCOSUR, NAFTA, NATO, OECD, OPEC, Schengen Area
- **Other**: Balkans, Baltic States, Benelux, British Isles, Commonwealth, Francophonie, Gulf States, Iberian Peninsula, Latin America, Levant, Maghreb, Nordic Countries

## Algorithm Matching Process

1. **Pre-filtering**: Database-level filtering based on deal-breakers (budget, visa requirements)
2. **Category Scoring**: Each category (climate, cost, culture, etc.) scored 0-100
3. **Regional Matching**: Enhanced with geographic relevance tiers (country → neighbors → continent)
4. **Weighted Average**: Categories weighted based on user importance ratings
5. **Enhanced Insights**: Generated based on matches and mismatches
6. **Final Ranking**: Towns ranked by overall match percentage

## Recent Improvements (August 2025)

1. **Fixed Case Sensitivity**: All string comparisons now use .toLowerCase() for consistent matching
2. **Added Missing Fields**: geographic_features_actual and vegetation_type_actual now properly included in SELECT statements
3. **Smart Daily Town**: Implemented 4-tier geographic relevance system preventing irrelevant recommendations
4. **Regional Matching Algorithm**: Restored and enhanced with proper weighting (40% country, 30% geographic, 20% vegetation)

## Notes for Algorithm Improvement

1. **Missing Data Handling**: Many towns have null values that need default handling
2. **Range Normalization**: Different scales need normalization (e.g., 1-10 vs 0-100)
3. **Multi-value Matching**: Arrays need sophisticated matching logic with partial credit
4. **Importance Weighting**: User importance ratings (1-5) should influence category weights
5. **Deal-breakers**: Certain mismatches should disqualify towns regardless of other scores
6. **Geographic Relevance**: Daily recommendations now respect user's geographic preferences

## Database Coverage Status

- **Towns with photos**: 23 out of 341 (6.7% coverage)
- **Towns with complete climate data**: ~280 (82% coverage)
- **Towns with cost data**: ~320 (94% coverage)
- **Towns with healthcare ratings**: ~300 (88% coverage)
- **Towns with activity lists**: ~250 (73% coverage)

---

*Last Updated: August 25, 2025*
*Database Snapshot: 2025-08-25T10-50-11*
*Total Towns: 341 | Total Users: 12*