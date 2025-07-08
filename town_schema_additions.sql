-- Scout2Retire: Town Schema Additions
-- Adding columns that describe what towns HAVE to match against user preferences
-- User preferences → Town characteristics mapping

-- ============================================
-- CLIMATE CHARACTERISTICS
-- ============================================
-- Maps to: climate_preferences from onboarding
ALTER TABLE towns ADD COLUMN summer_climate_actual text; -- 'mild', 'warm', 'hot'
ALTER TABLE towns ADD COLUMN winter_climate_actual text; -- 'cold', 'cool', 'mild'
ALTER TABLE towns ADD COLUMN humidity_level_actual text; -- 'dry', 'balanced', 'humid'
ALTER TABLE towns ADD COLUMN sunshine_level_actual text; -- 'mostly_sunny', 'balanced', 'often_cloudy'
ALTER TABLE towns ADD COLUMN precipitation_level_actual text; -- 'mostly_dry', 'balanced', 'often_rainy'
ALTER TABLE towns ADD COLUMN seasonal_variation_actual text; -- 'minimal', 'moderate', 'distinct_seasons'

-- ============================================
-- ACTIVITIES & HOBBIES AVAILABLE
-- ============================================
-- Maps to: hobbies.activities and hobbies.interests from onboarding
ALTER TABLE towns ADD COLUMN activities_available text[]; -- ['walking', 'swimming', 'cycling', 'golf', 'tennis', 'water_sports', 'winter_sports', 'fishing', 'gardening']
ALTER TABLE towns ADD COLUMN interests_supported text[]; -- ['arts', 'music', 'theater', 'reading', 'cooking', 'wine', 'history', 'photography', 'volunteering']

-- Activity infrastructure details
ALTER TABLE towns ADD COLUMN activity_infrastructure jsonb; -- {golf_courses: 3, cycling_paths_km: 45, marinas: 2, ski_resorts_nearby: 1}

-- Hobby lifestyle ratings (what town actually offers vs user importance)
ALTER TABLE towns ADD COLUMN outdoor_activities_rating integer; -- 1-5 scale (what town actually provides)
ALTER TABLE towns ADD COLUMN cultural_events_rating integer; -- 1-5 scale (actual cultural scene)
ALTER TABLE towns ADD COLUMN shopping_rating integer; -- 1-5 scale (actual shopping options)  
ALTER TABLE towns ADD COLUMN wellness_rating integer; -- 1-5 scale (actual wellness facilities)

-- Travel connectivity (maps to travel_frequency preference)
ALTER TABLE towns ADD COLUMN travel_connectivity_rating integer; -- 1-5 scale (how easy to travel from this town)

-- ============================================
-- CULTURE & LIFESTYLE ACTUAL
-- ============================================
-- Maps to: culture_preferences from onboarding
ALTER TABLE towns ADD COLUMN expat_community_size text; -- 'small', 'moderate', 'large'
ALTER TABLE towns ADD COLUMN english_proficiency_level text; -- 'limited', 'moderate', 'widespread', 'universal'
ALTER TABLE towns ADD COLUMN languages_spoken text[]; -- ['english', 'spanish', 'french', 'german', etc.]

-- Cultural amenities actual ratings
ALTER TABLE towns ADD COLUMN dining_nightlife_level integer; -- 1-5 scale (what town actually offers)
ALTER TABLE towns ADD COLUMN museums_level integer; -- 1-5 scale
ALTER TABLE towns ADD COLUMN cultural_events_level integer; -- 1-5 scale

-- Lifestyle characteristics
ALTER TABLE towns ADD COLUMN pace_of_life_actual text; -- 'slow', 'moderate', 'fast'
ALTER TABLE towns ADD COLUMN urban_rural_character text; -- 'rural', 'suburban', 'urban'
ALTER TABLE towns ADD COLUMN social_atmosphere text; -- 'quiet', 'friendly', 'vibrant'
ALTER TABLE towns ADD COLUMN traditional_progressive_lean text; -- 'traditional', 'balanced', 'progressive'

-- ============================================
-- ADMINISTRATION & GOVERNANCE
-- ============================================
-- Maps to: administration from onboarding
ALTER TABLE towns ADD COLUMN visa_requirements jsonb; -- {tourist_visa: 'none', retirement_visa: 'available', difficulty: 'easy'}
ALTER TABLE towns ADD COLUMN residency_path_info jsonb; -- {available: true, years_to_permanent: 5, investment_required: false}
ALTER TABLE towns ADD COLUMN tax_rates jsonb; -- {income_tax: 15, property_tax: 1.2, sales_tax: 8.5}

-- Government & services quality
ALTER TABLE towns ADD COLUMN government_efficiency_rating integer; -- 1-100 scale
ALTER TABLE towns ADD COLUMN political_stability_rating integer; -- 1-100 scale
ALTER TABLE towns ADD COLUMN emergency_services_quality integer; -- 1-5 scale

-- Health considerations (maps to administration.health_considerations)
ALTER TABLE towns ADD COLUMN healthcare_specialties_available text[]; -- ['cardiology', 'oncology', 'orthopedics', 'mental_health']
ALTER TABLE towns ADD COLUMN medical_specialties_rating integer; -- 1-5 scale for ongoing treatment support
ALTER TABLE towns ADD COLUMN environmental_health_rating integer; -- 1-5 scale (air quality, allergens, etc.)

-- Insurance availability
ALTER TABLE towns ADD COLUMN insurance_availability_rating integer; -- 1-5 scale (health insurance options)

-- ============================================
-- COSTS & BUDGET ACTUAL
-- ============================================
-- Maps to: costs from onboarding (budget vs actual costs)
ALTER TABLE towns ADD COLUMN typical_monthly_living_cost integer; -- Actual monthly cost for retirees
ALTER TABLE towns ADD COLUMN typical_rent_1bed integer; -- Actual 1-bedroom rent
ALTER TABLE towns ADD COLUMN typical_home_price integer; -- Actual home purchase price
ALTER TABLE towns ADD COLUMN healthcare_cost_monthly integer; -- Actual monthly healthcare costs

-- Transportation infrastructure
ALTER TABLE towns ADD COLUMN local_mobility_options text[]; -- ['walkable', 'cycling_friendly', 'public_transit', 'car_needed']
ALTER TABLE towns ADD COLUMN regional_connectivity text[]; -- ['train_access', 'bus_network', 'major_roads', 'isolated']
ALTER TABLE towns ADD COLUMN international_access text[]; -- ['major_airport', 'regional_airport', 'train_connections', 'ferry_access']

-- ============================================
-- GEOGRAPHIC & ENVIRONMENTAL
-- ============================================
-- Maps to: region_preferences from onboarding
ALTER TABLE towns ADD COLUMN geographic_features_actual text[]; -- ['coastal', 'mountains', 'island', 'lakes', 'river', 'valley', 'desert', 'forest', 'plains']
ALTER TABLE towns ADD COLUMN vegetation_type_actual text[]; -- ['tropical', 'subtropical', 'mediterranean', 'forest', 'grassland', 'desert']
ALTER TABLE towns ADD COLUMN air_quality_index integer; -- 0-500 AQI scale
ALTER TABLE towns ADD COLUMN environmental_factors jsonb; -- {pollution_level: 'low', allergen_info: {pollen: 'moderate'}}

-- ============================================
-- FAMILY & LIFESTYLE SUPPORT
-- ============================================
-- Maps to: current_status from onboarding
ALTER TABLE towns ADD COLUMN family_friendliness_rating integer; -- 1-5 scale for couples/families
ALTER TABLE towns ADD COLUMN pet_friendliness jsonb; -- {overall_score: 4, import_difficulty: 'moderate', veterinary_care: 'good'}
ALTER TABLE towns ADD COLUMN solo_living_support integer; -- 1-5 scale for solo retirees

-- Retirement-specific amenities (for 55+ users)
ALTER TABLE towns ADD COLUMN senior_friendly_rating integer; -- 1-5 scale (accessibility, senior discounts, etc.)
ALTER TABLE towns ADD COLUMN retirement_community_presence text; -- 'none', 'limited', 'moderate', 'extensive'

-- ============================================
-- COMMENTS FOR DEVELOPERS
-- ============================================
-- 
-- MATCHING LOGIC EXAMPLES:
-- 
-- User: summer_climate_preference: ['mild', 'warm']
-- Town: summer_climate_actual: 'hot'
-- Match: 0% (user doesn't want hot)
-- 
-- User: activities: ['golf', 'swimming']  
-- Town: activities_available: ['golf', 'swimming', 'tennis', 'cycling']
-- Match: 100% (town has both desired activities)
-- 
-- User: expat_community_preference: ['moderate']
-- Town: expat_community_size: 'large'
-- Match: 75% (close but not exact preference)
-- 
-- User: total_monthly_budget: 2000
-- Town: typical_monthly_living_cost: 1800
-- Match: 95% (within budget, good match)
-- 
-- ============================================

-- Add indexes for performance
CREATE INDEX idx_towns_summer_climate ON towns(summer_climate_actual);
CREATE INDEX idx_towns_winter_climate ON towns(winter_climate_actual);
CREATE INDEX idx_towns_expat_community ON towns(expat_community_size);
CREATE INDEX idx_towns_english_proficiency ON towns(english_proficiency_level);
CREATE INDEX idx_towns_living_cost ON towns(typical_monthly_living_cost);
CREATE INDEX idx_towns_activities ON towns USING GIN(activities_available);
CREATE INDEX idx_towns_interests ON towns USING GIN(interests_supported);
CREATE INDEX idx_towns_geographic ON towns USING GIN(geographic_features_actual);
CREATE INDEX idx_towns_outdoor_rating ON towns(outdoor_activities_rating);
CREATE INDEX idx_towns_wellness_rating ON towns(wellness_rating);
CREATE INDEX idx_towns_travel_connectivity ON towns(travel_connectivity_rating);
CREATE INDEX idx_towns_senior_friendly ON towns(senior_friendly_rating);