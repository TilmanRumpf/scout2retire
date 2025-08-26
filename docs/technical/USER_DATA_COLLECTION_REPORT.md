# Scout2Retire User Data Collection Report

## Overview
Scout2Retire collects user data at two main points:
1. **Signup** - Basic user account information
2. **Onboarding** - Comprehensive retirement preferences (7 steps)

All user data is stored in the PostgreSQL database (Supabase) in two primary tables:
- `users` table - Basic user info and recently migrated onboarding fields
- `onboarding_responses` table - JSON storage of onboarding data

There's an ongoing migration to move all onboarding data from JSON blobs in `onboarding_responses` to proper columns in the `users` table.

---

## 1. SIGNUP DATA (users table)

### Basic Account Information
- **id** (uuid) - Unique user identifier
- **email** (text) - User's email address
- **full_name** (text) - User's full name
- **password** - Stored securely in auth.users (not in public schema)
- **hometown** (text, optional) - User's current location
- **created_at** (timestamp) - Account creation time
- **onboarding_completed** (boolean) - Whether user finished onboarding

### Additional Profile Fields
- **username** (text, unique) - 3-20 chars, alphanumeric + underscores
- **avatar_url** (text) - Link to profile picture
- **nationality** (text) - Default set to 'usa' at signup (being deprecated)
- **retirement_year_estimate** (integer) - Default set to current year + 5

---

## 2. ONBOARDING DATA

### Step 1: Current Status (OnboardingCurrentStatus.jsx)

#### Retirement Timeline
- **retirement_status** (text) - Options: 'planning', 'retiring_soon', 'already_retired'
- **retirement_month** (integer, 1-12) - Target retirement month
- **retirement_day** (integer, 1-31) - Target retirement day
- **retirement_year_estimate** (integer) - Target retirement year
- **flexibility** (text) - Timeline flexibility

#### Personal Citizenship
- **primary_citizenship** (text) - Main citizenship country
- **dual_citizenship** (boolean) - Has dual citizenship
- **secondary_citizenship** (text) - Second citizenship if dual

#### Family Situation
- **family_situation** (text) - Options: 'solo', 'couple', 'family'

#### Partner Information (if couple)
- **partner_primary_citizenship** (text) - Partner's main citizenship
- **partner_dual_citizenship** (boolean) - Partner has dual citizenship
- **partner_secondary_citizenship** (text) - Partner's second citizenship

#### Pets
- **has_pets** (boolean) - Whether user has pets
- **pet_owner** (array) - Types of pets owned

### Step 2: Region Preferences (OnboardingRegion.jsx)

#### Geographic Preferences
- **preferred_regions** (text[]) - Array of preferred regions:
  - North America, Central America, Caribbean, South America
  - Europe, Mediterranean, Asia, Africa
  - Australia & New Zealand, Oceania
- **preferred_countries** (text[]) - Specific countries within regions
- **preferred_provinces** (text[]) - Specific provinces/states within countries

#### Natural Features
- **geographic_features** (text[]) - Preferred features:
  - Coastal, Mountains, Island, Lakes, River
  - Valley, Desert, Forest, Plains
- **vegetation_preferences** (text[]) - Preferred vegetation:
  - Tropical, Subtropical, Mediterranean
  - Forest, Grassland, Desert

### Step 3: Climate Preferences (OnboardingClimate.jsx)

#### Temperature Preferences
- **summer_temp_preference** (text) - Options: 'cool', 'mild', 'warm', 'hot'
- **winter_temp_preference** (text) - Options: 'cold', 'cool', 'mild', 'warm'

#### Weather Preferences
- **humidity_preference** (text) - Options: 'dry', 'moderate', 'humid'
- **sunshine_preference** (text) - Options: 'cloudy', 'mixed', 'sunny'
- **precipitation_preference** (text) - Options: 'dry', 'moderate', 'rainy'
- **seasonal_preference** (text) - Options: 'consistent', 'moderate_variation', 'four_seasons'

### Step 4: Culture Preferences (OnboardingCulture.jsx)

#### Cultural Activity Importance (1-5 scale)
- **culture_nightlife_importance** (integer) - Nightlife importance
- **culture_museums_importance** (integer) - Museums/galleries importance
- **culture_cultural_events_importance** (integer) - Cultural events importance
- **culture_dining_importance** (integer) - Dining scene importance
- **culture_outdoor_importance** (integer) - Outdoor activities importance
- **culture_shopping_importance** (integer) - Shopping importance

#### Lifestyle Preferences
- **lifestyle_urban_rural** (text) - Options: 'urban', 'suburban', 'small_town', 'rural'
- **lifestyle_pace** (text) - Options: 'slow', 'moderate', 'fast'
- **lifestyle_social_atmosphere** (text) - Options: 'quiet', 'moderate', 'vibrant'
- **lifestyle_political_lean** (text) - Options: 'conservative', 'moderate', 'progressive'

#### Community & Language
- **expat_community_importance** (text) - Options: 'not_important', 'nice_to_have', 'very_important'
- **language_comfort** (text) - Options: 'english_only', 'some_foreign', 'comfortable_foreign'
- **languages_spoken** (text[]) - Array of languages user speaks

### Step 5: Hobbies & Interests (OnboardingHobbies.jsx)

#### Activities (boolean flags)
- **activities_sports** - Enjoys sports/fitness
- **activities_cultural** - Enjoys cultural activities
- **activities_nature** - Enjoys nature activities
- **activities_food** - Enjoys food/dining
- **activities_shopping** - Enjoys shopping
- **activities_creative** - Enjoys creative pursuits
- **activities_wellness** - Enjoys wellness activities
- **activities_social** - Enjoys social activities
- **activities_volunteer** - Interested in volunteering

#### Interests (boolean flags)
- **interests_local_cuisine** - Interested in local food
- **interests_history** - Interested in history
- **interests_beaches** - Likes beaches
- **interests_mountains** - Likes mountains
- **interests_city_life** - Prefers city life
- **interests_rural_life** - Prefers rural life
- **interests_arts** - Interested in arts
- **interests_music** - Interested in music
- **interests_gardening** - Enjoys gardening

#### Lifestyle Importance (1-5 scale)
- **travel_frequency** (text) - Options: 'rarely', 'occasionally', 'frequently'
- **lifestyle_importance_family** (integer) - Family proximity importance
- **lifestyle_importance_adventure** (integer) - Adventure importance
- **lifestyle_importance_comfort** (integer) - Comfort importance
- **lifestyle_importance_intellectual** (integer) - Intellectual stimulation importance
- **lifestyle_importance_social** (integer) - Social life importance
- **lifestyle_importance_health** (integer) - Health/wellness importance

### Step 6: Administration (OnboardingAdministration.jsx)

#### Healthcare & Safety
- **healthcare_importance** (text) - Options: 'basic', 'good', 'excellent'
- **insurance_importance** (text) - Options: 'not_concerned', 'somewhat_concerned', 'very_concerned'
- **healthcare_concerns** (text[]) - Specific healthcare needs
- **safety_importance** (text) - Options: 'not_concerned', 'somewhat_concerned', 'very_concerned'

#### Infrastructure & Stability
- **infrastructure_importance** (text) - Options: 'basic', 'good', 'excellent'
- **political_stability_importance** (text) - Options: 'not_concerned', 'somewhat_concerned', 'very_concerned'

#### Visa & Residency
- **visa_preference** (text) - Options: 'easy', 'moderate', 'any'
- **stay_duration** (text) - Options: '1_2_years', '3_5_years', '5_plus_years'
- **residency_path** (text) - Options: 'tourist', 'temporary', 'permanent'

#### Financial Concerns
- **tax_concern** (text) - Options: 'not_concerned', 'somewhat_concerned', 'very_concerned'
- **government_efficiency_concern** (text) - Options: 'not_concerned', 'somewhat_concerned', 'very_concerned'

### Step 7: Budget/Costs (OnboardingCosts.jsx)

#### Financial Information
- **total_budget_usd** (integer) - Total monthly budget in USD
- **max_rent_usd** (integer) - Maximum monthly rent budget
- **max_home_price_usd** (integer) - Maximum home purchase price
- **healthcare_budget_usd** (integer) - Monthly healthcare budget
- **financial_priorities** (text[]) - Array of financial priorities

---

## 3. DATA STORAGE STRUCTURE

### Current State (Transitional)
1. **users table** - Contains basic info + new onboarding columns being added via migrations
2. **onboarding_responses table** - JSON storage with these columns:
   - `id` (uuid)
   - `user_id` (uuid) - Links to users table
   - `current_status` (jsonb)
   - `region_preferences` (jsonb)
   - `climate_preferences` (jsonb)
   - `culture_preferences` (jsonb)
   - `hobbies` (jsonb)
   - `administration` (jsonb)
   - `costs` (jsonb)
   - `submitted_at` (timestamp)

### Future State (After Migration)
All data will be properly normalized in the `users` table with individual columns for each data point, providing:
- Better query performance
- Type safety with constraints
- Easier data analysis
- Simplified matching algorithms

---

## 4. DATA USAGE

### Primary Uses
1. **Town Matching Algorithm** - Uses all preference data to score and rank retirement destinations
2. **Personalized Recommendations** - Daily featured towns based on user preferences
3. **Search Filtering** - Filter towns by user's budget, climate, and lifestyle preferences
4. **User Profile Display** - Show user's preferences on their profile
5. **Community Matching** - Connect users with similar preferences

### Privacy Considerations
- All data is protected by Row Level Security (RLS) policies
- Users can only access their own data
- No data is shared without explicit user consent
- Authentication handled securely via Supabase Auth

---

## 5. VALIDATION & CONSTRAINTS

### Data Validation
- Email format validation
- Password strength requirements (8+ chars)
- Username format (3-20 chars, alphanumeric + underscores)
- Numeric ranges for dates, budgets, and ratings
- Enum constraints for select fields

### Required vs Optional
- **Required at signup**: email, password, full_name
- **Optional at signup**: hometown
- **All onboarding fields**: technically optional but encouraged for better matches

---

This comprehensive data collection enables Scout2Retire to provide highly personalized retirement destination recommendations based on each user's unique preferences, constraints, and lifestyle goals.