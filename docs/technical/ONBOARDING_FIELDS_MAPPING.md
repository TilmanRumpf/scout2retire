# Complete Onboarding Fields to Database Mapping

## Current Database Structure
- **users table**: Contains basic user info (id, email, full_name, nationality, retirement_year_estimate, etc.)
- **onboarding_responses table**: Contains detailed onboarding data in JSONB columns for each step

## Step 1 - Current Status (OnboardingCurrentStatus.jsx)

### Fields Collected:
1. **retirement_timeline** (object)
   - status: 'planning' | 'retiring_soon' | 'already_retired'
   - target_year: number (e.g., 2029)
   - target_month: number (1-12)
   - target_day: number (1-31)
   - flexibility: string (currently not used in UI)

2. **family_situation**: string
   - 'solo' | 'couple' | 'family'

3. **pet_owner**: array
   - Can contain: ['cat'], ['dog'], ['other'], or combinations

4. **citizenship** (object)
   - primary_citizenship: string (country code like 'us', 'uk', etc.)
   - dual_citizenship: boolean
   - secondary_citizenship: string (country code, only if dual_citizenship is true)

5. **partner_citizenship** (object) - Only collected if family_situation is 'couple'
   - primary_citizenship: string
   - dual_citizenship: boolean
   - secondary_citizenship: string (only if partner has dual citizenship)

### Missing from users table:
- ❌ retirement_status (planning/retiring_soon/already_retired)
- ❌ retirement_target_month
- ❌ retirement_target_day
- ❌ primary_citizenship
- ❌ dual_citizenship
- ❌ secondary_citizenship
- ❌ family_situation
- ❌ partner_primary_citizenship
- ❌ partner_dual_citizenship
- ❌ partner_secondary_citizenship
- ❌ has_pets / pet_owner

## Step 2 - Region (OnboardingRegion.jsx)

### Fields Collected:
1. **regions**: array (up to 2 selections)
   - Values: 'Recommended', 'North America', 'Central America', 'Caribbean', 'South America', 'Europe', 'Mediterranean', 'Asia', 'Africa', 'Australia & New Zealand', 'Oceania'

2. **countries**: array (up to 2 selections)
   - Country names or US state names

3. **provinces**: array (up to 2 selections)
   - Province/region names within countries

4. **geographic_features**: array
   - Can include: 'Coastal', 'Mountains', 'Island', 'Lakes', 'River', 'Valley', 'Desert', 'Forest', 'Plains'

5. **vegetation_types**: array
   - Can include: 'Tropical', 'Subtropical', 'Mediterranean', 'Forest', 'Grassland', 'Desert'

### Missing from users table:
- ❌ regions
- ❌ countries
- ❌ provinces
- ❌ geographic_features
- ❌ vegetation_types

## Step 3 - Climate (OnboardingClimate.jsx)

### Fields Collected:
1. **summer_climate_preference**: array
   - Values: 'hot', 'warm', 'moderate', 'cool'

2. **winter_climate_preference**: array
   - Values: 'warm', 'moderate', 'cool', 'cold'

3. **humidity_level**: array
   - Values: 'dry', 'moderate', 'humid'

4. **sunshine**: array
   - Values: 'very_sunny', 'moderate', 'often_cloudy'

5. **precipitation**: array
   - Values: 'very_dry', 'moderate', 'rainy', 'snowy'

6. **seasonal_preference**: string
   - Values: 'distinct_seasons', 'mild_seasons', 'no_preference'

### Missing from users table:
- ❌ summer_climate_preference
- ❌ winter_climate_preference
- ❌ humidity_level
- ❌ sunshine
- ❌ precipitation
- ❌ seasonal_preference

## Step 4 - Culture (OnboardingCulture.jsx)

### Fields Collected:
1. **cultural_importance** (object with numeric values 1-3)
   - arts_culture
   - local_traditions
   - culinary_scene
   - historical_sites
   - festivals_events
   - music_scene

2. **lifestyle_preferences** (object)
   - urban_rural: array ('urban', 'suburban', 'small_town', 'rural')
   - pace_of_life: array ('fast_paced', 'moderate', 'slow_paced')
   - social_preference: string ('very_social', 'moderate', 'quiet')

3. **expat_community_preference**: array
   - Values: 'large_expat', 'some_expats', 'mostly_locals', 'no_preference'

4. **language_comfort** (object)
   - preferences: array ('english_only', 'some_foreign', 'full_immersion')
   - already_speak: array (list of languages)

### Missing from users table:
- ❌ cultural_importance (all sub-fields)
- ❌ lifestyle_preferences (all sub-fields)
- ❌ expat_community_preference
- ❌ language_comfort (all sub-fields)

## Step 5 - Hobbies (OnboardingHobbies.jsx)

### Fields Collected:
1. **activities**: array
   - Values: 'hiking', 'swimming', 'cycling', 'golf', 'tennis', 'fishing', 'sailing', 'skiing', 'yoga'

2. **interests**: array
   - Values: 'photography', 'gardening', 'cooking', 'wine', 'art', 'music', 'reading', 'volunteering', 'travel'

3. **travel_frequency**: string
   - Values: 'frequent', 'occasional', 'rare'

4. **lifestyle_importance** (object with numeric values 1-3)
   - walkability
   - public_transport
   - entertainment
   - nature_access
   - sports_facilities
   - cultural_activities

### Missing from users table:
- ❌ activities
- ❌ interests
- ❌ travel_frequency
- ❌ lifestyle_importance (all sub-fields)

## Step 6 - Administration (OnboardingAdministration.jsx)

### Fields Collected:
1. **healthcare_quality**: array
   - Values: 'world_class', 'good_quality', 'basic_adequate', 'not_priority'

2. **health_considerations** (object)
   - healthcare_access: string
   - ongoing_treatment: string
   - environmental_health: string

3. **insurance_importance**: array
   - Values: 'international_coverage', 'local_system', 'private_healthcare', 'not_concerned'

4. **safety_importance**: array
   - Values: 'very_safe', 'generally_safe', 'not_concerned'

5. **emergency_services**: array
   - Values: 'excellent_response', 'adequate', 'not_priority'

6. **political_stability**: array
   - Values: 'very_stable', 'stable_enough', 'not_concerned'

7. **tax_preference**: array
   - Values: 'tax_friendly', 'reasonable_taxes', 'not_priority'

8. **government_efficiency**: array
   - Values: 'very_efficient', 'reasonable', 'not_important'

9. **visa_preference**: array
   - Values: 'easy_visa', 'retirement_visa', 'willing_complex', 'not_concerned'

10. **stay_duration**: array
    - Values: '3_months', '6_months', 'full_year', 'permanent'

11. **residency_path**: array
    - Values: 'want_residency', 'maybe_later', 'just_visiting', 'not_interested'

### Missing from users table:
- ❌ healthcare_quality
- ❌ health_considerations (all sub-fields)
- ❌ insurance_importance
- ❌ safety_importance
- ❌ emergency_services
- ❌ political_stability
- ❌ tax_preference
- ❌ government_efficiency
- ❌ visa_preference
- ❌ stay_duration
- ❌ residency_path

## Step 7 - Costs (OnboardingCosts.jsx)

### Fields Collected:
1. **total_monthly_budget**: number (1500-5000+)
2. **max_monthly_rent**: number (500-2000+)
3. **max_home_price**: number (100000-500000+)
4. **monthly_healthcare_budget**: number (200-1500+)
5. **financial_priorities**: array
   - Values: 'low_cost', 'value_quality', 'premium_comfort'

### Missing from users table:
- ❌ total_monthly_budget
- ❌ max_monthly_rent
- ❌ max_home_price
- ❌ monthly_healthcare_budget
- ❌ financial_priorities

## Summary

### Current users table has:
- id (uuid)
- email (text)
- full_name (text)
- nationality (text) - Note: This is set during signup, not from onboarding
- retirement_year_estimate (integer) - Only captures year, not full date
- onboarding_completed (boolean)
- created_at (timestamp)
- username (text)
- hometown (text)
- avatar_url (text)
- avatar_favorites (jsonb)

### All detailed onboarding data is stored in:
- **onboarding_responses** table with JSONB columns for each step:
  - current_status (JSONB)
  - region_preferences (JSONB)
  - climate_preferences (JSONB)
  - culture_preferences (JSONB)
  - hobbies (JSONB)
  - administration (JSONB)
  - costs (JSONB)

### Key Findings:
1. The users table only stores basic profile information
2. ALL detailed onboarding preferences are stored in the onboarding_responses table
3. There's a mismatch: retirement_year_estimate in users table only stores year, but onboarding collects month/day too
4. Partner information (for couples) is completely missing from the users table
5. The current architecture keeps preferences separate from user profile data