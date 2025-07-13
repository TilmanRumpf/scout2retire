-- Create comprehensive onboarding data for user
-- User ID: 83d285b2-b21b-4d13-a1a1-6d51b6733d52

-- First delete any existing data
DELETE FROM onboarding_responses WHERE user_id = '83d285b2-b21b-4d13-a1a1-6d51b6733d52';

-- Insert comprehensive onboarding data
INSERT INTO onboarding_responses (
    user_id,
    current_status,
    region_preferences,
    climate_preferences,
    culture_preferences,
    hobbies,
    administration,
    costs,
    submitted_at
) VALUES (
    '83d285b2-b21b-4d13-a1a1-6d51b6733d52',
    '{
        "citizenship": "USA",
        "timeline": "within_2_years",
        "family_situation": "couple"
    }'::jsonb,
    '{
        "countries": ["Portugal", "Spain", "Italy", "Greece"],
        "regions": ["Europe", "Mediterranean"],
        "geographic_features": ["Coastal", "Historic"]
    }'::jsonb,
    '{
        "seasonal_preference": "warm_all_year",
        "summer_climate_preference": "warm",
        "winter_climate_preference": "mild",
        "humidity_level": "moderate",
        "sunshine": "abundant",
        "precipitation": "moderate"
    }'::jsonb,
    '{
        "language_comfort": {
            "preferences": "willing_to_learn"
        },
        "expat_community_preference": "moderate",
        "lifestyle_preferences": {
            "pace_of_life": "relaxed",
            "urban_rural": "small_city"
        }
    }'::jsonb,
    '{
        "primary_hobbies": ["dining", "walking", "cultural_events"],
        "interests": ["cultural", "culinary", "coastal"],
        "activities": ["water_sports", "hiking", "photography"]
    }'::jsonb,
    '{
        "healthcare_quality": ["good"],
        "safety_importance": ["good"],
        "visa_preference": ["functional"],
        "political_stability": ["good"]
    }'::jsonb,
    '{
        "total_monthly_budget": 3000,
        "max_monthly_rent": 1200,
        "budget_flexibility": "moderate"
    }'::jsonb,
    NOW()
);

-- Update user to mark onboarding as completed
UPDATE users 
SET onboarding_completed = true 
WHERE id = '83d285b2-b21b-4d13-a1a1-6d51b6733d52';

-- Verify the data was created
SELECT 
    id,
    user_id,
    climate_preferences,
    submitted_at
FROM onboarding_responses 
WHERE user_id = '83d285b2-b21b-4d13-a1a1-6d51b6733d52';