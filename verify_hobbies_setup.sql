-- Verify hobbies setup is complete
-- Run this in Supabase SQL Editor

-- 1. Check user_preferences columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
AND column_name IN ('activities', 'interests', 'custom_activities', 'travel_frequency')
ORDER BY column_name;

-- 2. Check hobbies tables exist
SELECT COUNT(*) as total_hobbies FROM hobbies;
SELECT COUNT(*) as universal_hobbies FROM hobbies WHERE is_universal = true;
SELECT COUNT(*) as location_specific FROM hobbies WHERE is_universal = false;

-- 3. Check town_hobbies associations
SELECT COUNT(*) as total_associations FROM town_hobbies;
SELECT COUNT(DISTINCT town_id) as towns_with_hobbies FROM town_hobbies;

-- 4. Sample some hobbies data
SELECT name, category, is_universal 
FROM hobbies 
LIMIT 10;

-- 5. Check a specific user's hobbies (if they exist)
SELECT user_id, activities, interests, custom_activities, travel_frequency
FROM user_preferences
WHERE activities IS NOT NULL 
OR interests IS NOT NULL 
OR custom_activities IS NOT NULL
LIMIT 1;