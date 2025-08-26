# Towns Table & User Preferences Mapping Guide

## Overview
This document provides a comprehensive mapping between the `towns` table columns (173 total) and the `user_preferences` table columns (58 total) to understand how the matching algorithm works.

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
- `climate`: String - Main climate type (e.g., "Desert", "Mediterranean", "Tropical")
- `climate_description`: String - Detailed climate description
- `avg_temp_summer`: Number - Average summer temperature (°C)
- `avg_temp_winter`: Number - Average winter temperature (°C)
- `summer_temp_low`: Number - Summer low temperature
- `summer_temp_high`: Number - Summer high temperature  
- `winter_temp_low`: Number - Winter low temperature
- `winter_temp_high`: Number - Winter high temperature
- `humidity_average`: Number - Average humidity percentage (0-100)
- `humidity_level_actual`: String - Categorical humidity ("low", "medium", "high")
- `annual_rainfall`: Number - Annual rainfall in mm
- `precipitation_level_actual`: String - Categorical ("dry", "moderate", "wet")
- `sunshine_hours`: Number - Average daily sunshine hours
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
- `cost_of_living_usd`: Number - Monthly cost of living in USD
- `cost_index`: Number - Cost index (0-100, lower is cheaper)
- `rent_1bed`: Number - 1-bedroom apartment rent in USD
- `rent_2bed_usd`: Number - 2-bedroom apartment rent in USD
- `rent_house_usd`: Number - House rental cost in USD
- `purchase_apartment_sqm_usd`: Number - Price per sqm for apartment
- `purchase_house_avg_usd`: Number - Average house purchase price
- `typical_home_price`: Number - Typical home price
- `typical_rent_1bed`: Number - Typical 1-bed rent
- `typical_monthly_living_cost`: Number - Typical monthly expenses
- `groceries_cost`: Number - Monthly groceries cost
- `meal_cost`: Number - Average restaurant meal cost
- `utilities_cost`: Number - Monthly utilities cost
- `healthcare_cost`: Number - Basic healthcare cost
- `healthcare_cost_monthly`: Number - Monthly healthcare expenses
- `income_tax_rate_pct`: Number - Income tax rate percentage
- `property_tax_rate_pct`: Number - Property tax rate percentage
- `sales_tax_rate_pct`: Number - Sales tax rate percentage
- `property_appreciation_rate_pct`: Number - Annual property appreciation

### 3. REGION/LOCATION MATCHING

#### User Preference Columns:
- `countries`: Array - Preferred countries (e.g., ["Portugal", "Spain"])
- `regions`: Array - Preferred regions (e.g., ["Europe", "Mediterranean"])
- `provinces`: Array - Preferred provinces/states
- `geographic_features`: Array - Preferred features (e.g., ["Island", "Valley", "Coastal"])
- `vegetation_types`: Array - Preferred vegetation (e.g., ["Mediterranean", "Forest"])

#### Towns Table Columns:
- `country`: String - Country name
- `region`: String - Region/state/province name
- `geo_region`: String - Geographic region (e.g., "North Africa", "Western Europe")
- `regions`: Array - Multiple region classifications
- `geographic_features`: Array - Geographic features present
- `geographic_features_actual`: Array - Verified geographic features
- `vegetation_type_actual`: String - Actual vegetation type
- `water_bodies`: Array - Nearby water bodies
- `distance_to_ocean_km`: Number - Distance to ocean in kilometers
- `elevation_meters`: Number - Elevation above sea level
- `beaches_nearby`: Boolean - Whether beaches are nearby
- `latitude`: Number - Geographic latitude
- `longitude`: Number - Geographic longitude

### 4. LIFESTYLE & CULTURE MATCHING

#### User Preference Columns:
- `lifestyle_preferences`: Object with:
  - `urban_rural`: Array (e.g., ["urban", "suburban"])
  - `pace_of_life`: Array (e.g., ["fast", "moderate", "slow"])
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
- `pace_of_life`: String - Actual pace ("fast", "moderate", "slow")
- `pace_of_life_actual`: String - Verified pace of life
- `traditional_progressive_lean`: String - Cultural lean
- `social_atmosphere`: String - Social atmosphere (e.g., "friendly")
- `museums_level`: Number - Museum availability (1-10)
- `museums_rating`: Number - Museum quality rating
- `cultural_events_level`: Number - Cultural event frequency (1-10)
- `cultural_events_rating`: Number - Cultural event quality
- `cultural_events_frequency`: String - How often events occur
- `cultural_rating`: Number - Overall cultural rating
- `dining_nightlife_level`: Number - Dining/nightlife availability
- `nightlife_rating`: Number - Nightlife quality rating
- `restaurants_rating`: Number - Restaurant quality rating
- `shopping_rating`: Number - Shopping quality rating
- `wellness_rating`: Number - Wellness facilities rating
- `outdoor_activities_rating`: Number - Outdoor activities rating
- `outdoor_rating`: Number - Overall outdoor rating

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
- `healthcare_score`: Number - Overall healthcare score (1-10)
- `healthcare_cost`: Number - Basic healthcare cost
- `healthcare_cost_monthly`: Number - Monthly healthcare expenses
- `private_healthcare_cost_index`: Number - Private healthcare cost index
- `hospital_count`: Number - Number of hospitals
- `nearest_major_hospital_km`: Number - Distance to major hospital
- `english_speaking_doctors`: Boolean - English-speaking doctors available
- `medical_specialties_available`: Array - Available specialties
- `medical_specialties_rating`: Number - Specialty care rating
- `healthcare_specialties_available`: Array - Healthcare specialties
- `health_insurance_required`: Boolean - Whether insurance is required
- `insurance_availability_rating`: Number - Insurance availability
- `emergency_services_quality`: Number - Emergency services rating
- `air_quality_index`: Number - Air quality (lower is better)
- `environmental_health_rating`: Number - Environmental health score

### 6. ACTIVITIES & HOBBIES MATCHING

#### User Preference Columns:
- `activities`: Array - Preferred activities (e.g., ["cycling", "water_sports", "gardening"])
- `interests`: Array - Interests (e.g., ["theater", "wine", "volunteering"])

#### Towns Table Columns:
- `activities_available`: Array - Available activities
- `golf_courses_count`: Number - Number of golf courses
- `tennis_courts_count`: Number - Number of tennis courts
- `hiking_trails_km`: Number - Kilometers of hiking trails
- `marinas_count`: Number - Number of marinas
- `ski_resorts_within_100km`: Number - Nearby ski resorts
- `dog_parks_count`: Number - Dog parks available
- `swimming_facilities`: Array - Swimming facilities
- `coworking_spaces_count`: Number - Coworking spaces
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
- `min_income_requirement_usd`: Number - Minimum income for visa
- `tax_haven_status`: Boolean - Tax haven status
- `tax_treaty_us`: Boolean - US tax treaty exists
- `foreign_income_taxed`: Boolean - Whether foreign income is taxed
- `government_efficiency_rating`: Number - Government efficiency score

### 8. TRANSPORTATION & MOBILITY MATCHING

#### User Preference Columns:
- `mobility`: Object with:
  - `local`: String - Local mobility needs
  - `regional`: String - Regional travel needs
  - `international`: String - International travel needs (e.g., "major_airport")

#### Towns Table Columns:
- `nearest_airport`: String - Name of nearest airport
- `nearest_airport_code`: String - Airport code
- `airport_distance`: Number - Distance to airport in km
- `nearest_airport_distance`: Number - Airport distance
- `international_flights_direct`: Array - Direct international destinations
- `has_public_transit`: Boolean - Public transit available
- `public_transport_quality`: Number - Transit quality rating
- `has_uber`: Boolean - Uber/ride-sharing available
- `train_station`: Boolean - Train station present
- `requires_car`: Boolean - Whether car is necessary
- `walkability`: Number - Walkability score (1-10)
- `travel_connectivity_rating`: Number - Overall connectivity

### 9. FAMILY & PET CONSIDERATIONS

#### User Preference Columns:
- `family_status`: String - Family situation (e.g., "couple", "single", "family")
- `bringing_children`: Boolean - Whether bringing children
- `bringing_pets`: Boolean - Whether bringing pets
- `pet_types`: Array - Types of pets (e.g., ["dog", "cat"])

#### Towns Table Columns:
- `family_friendliness_rating`: Number - Family-friendly score
- `childcare_available`: Boolean - Childcare services available
- `international_schools_available`: Boolean - International schools present
- `international_schools_count`: Number - Number of international schools
- `pet_friendliness`: String - Pet friendliness level
- `pet_friendly_rating`: Number - Pet-friendly score
- `veterinary_clinics_count`: Number - Number of vet clinics
- `dog_parks_count`: Number - Dog parks available

### 10. SAFETY & POLITICAL MATCHING

#### User Preference Columns:
- `safety_importance`: Array - Safety priority levels
- `political_stability`: Array - Political stability requirements
- `government_efficiency`: Array - Government efficiency preferences

#### Towns Table Columns:
- `safety_score`: Number - Overall safety score (1-10)
- `crime_rate`: String - Crime rate level ("Low", "Medium", "High")
- `crime_index`: Number - Crime index score
- `political_stability_rating`: Number - Political stability score
- `government_efficiency_rating`: Number - Government efficiency
- `natural_disaster_risk`: Number - Natural disaster risk level
- `natural_disaster_risk_score`: Number - Disaster risk score

### 11. COMMUNITY & SOCIAL MATCHING

#### User Preference Columns:
- `expat_community_preference`: Array - Expat community size preference (e.g., ["large", "medium"])
- `language_comfort`: Object with:
  - `preferences`: Array - Language comfort levels
  - `already_speak`: Array - Languages already spoken
- `primary_citizenship`: String - Primary citizenship
- `secondary_citizenship`: String - Secondary citizenship

#### Towns Table Columns:
- `expat_community_size`: String - Size of expat community
- `expat_population`: String - Expat population level
- `english_proficiency`: String - English proficiency level
- `english_proficiency_level`: String - Categorical English level
- `primary_language`: String - Primary local language
- `languages_spoken`: Array - Languages commonly spoken
- `secondary_languages`: Array - Secondary languages
- `lgbtq_friendly_rating`: Number - LGBTQ+ friendliness score
- `senior_friendly_rating`: Number - Senior-friendly score
- `retirement_community_presence`: String - Retirement community presence

## Value Ranges Reference

### Numeric Ranges (from database analysis):
- **Temperatures**: -10°C to 45°C
- **Cost of Living**: $300 to $5000/month
- **Population**: 1,000 to 20,000,000
- **Distance to Ocean**: 0 to 1000+ km
- **Elevation**: 0 to 3000+ meters
- **Ratings**: Generally 1-10 scale
- **Tax Rates**: 0-50%
- **Air Quality Index**: 0-500 (lower is better)

### Categorical Values:
- **Climate Types**: Desert, Mediterranean, Tropical, Continental, Oceanic, etc.
- **Urban/Rural**: urban, suburban, rural
- **Pace of Life**: fast, moderate, slow
- **Community Size**: large, medium, small
- **Safety Levels**: Low, Medium, High (for crime)

## Algorithm Matching Process

1. **Pre-filtering**: Database-level filtering based on deal-breakers (budget, visa requirements)
2. **Category Scoring**: Each category (climate, cost, culture, etc.) scored 0-100
3. **Weighted Average**: Categories weighted based on user importance ratings
4. **Enhanced Insights**: Generated based on matches and mismatches
5. **Final Ranking**: Towns ranked by overall match percentage

## Notes for Algorithm Improvement

1. **Missing Data Handling**: Many towns have null values that need default handling
2. **Range Normalization**: Different scales need normalization (e.g., 1-10 vs 0-100)
3. **Multi-value Matching**: Arrays need sophisticated matching logic
4. **Importance Weighting**: User importance ratings (1-5) should influence category weights
5. **Deal-breakers**: Certain mismatches should disqualify towns regardless of other scores