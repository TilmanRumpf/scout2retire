-- =====================================================
-- AUTOMATIC ACTIVITY UPDATES BASED ON INFRASTRUCTURE
-- =====================================================
-- This trigger automatically updates activities_available
-- whenever infrastructure columns change
-- =====================================================

CREATE OR REPLACE FUNCTION update_activities_on_infrastructure_change()
RETURNS TRIGGER AS $$
DECLARE
  activities text[];
BEGIN
  -- Start with current activities or empty array
  activities := COALESCE(NEW.activities_available, ARRAY[]::text[]);
  
  -- ========== GOLF ACTIVITIES ==========
  IF NEW.golf_courses_count IS DISTINCT FROM OLD.golf_courses_count THEN
    -- Remove all golf-related activities first
    activities := array_remove(activities, 'golf');
    activities := array_remove(activities, 'driving_range');
    activities := array_remove(activities, 'golf_variety');
    activities := array_remove(activities, 'golf_tournaments');
    activities := array_remove(activities, 'golf_destination');
    
    -- Add based on count
    IF NEW.golf_courses_count > 0 THEN
      activities := array_append(activities, 'golf');
      activities := array_append(activities, 'driving_range');
      
      IF NEW.golf_courses_count >= 2 THEN
        activities := array_append(activities, 'golf_variety');
        activities := array_append(activities, 'golf_tournaments');
      END IF;
      
      IF NEW.golf_courses_count >= 5 THEN
        activities := array_append(activities, 'golf_destination');
      END IF;
    END IF;
  END IF;
  
  -- ========== TENNIS ACTIVITIES ==========
  IF NEW.tennis_courts_count IS DISTINCT FROM OLD.tennis_courts_count THEN
    -- Remove all tennis-related activities first
    activities := array_remove(activities, 'tennis');
    activities := array_remove(activities, 'tennis_clubs');
    activities := array_remove(activities, 'tennis_tournaments');
    activities := array_remove(activities, 'tennis_lessons');
    activities := array_remove(activities, 'pickleball');
    
    -- Add based on count
    IF NEW.tennis_courts_count > 0 THEN
      activities := array_append(activities, 'tennis');
      
      IF NEW.tennis_courts_count >= 5 THEN
        activities := array_append(activities, 'tennis_clubs');
        activities := array_append(activities, 'pickleball');
      END IF;
      
      IF NEW.tennis_courts_count >= 10 THEN
        activities := array_append(activities, 'tennis_tournaments');
        activities := array_append(activities, 'tennis_lessons');
      END IF;
    END IF;
  END IF;
  
  -- ========== BEACH ACTIVITIES ==========
  IF NEW.beaches_nearby IS DISTINCT FROM OLD.beaches_nearby THEN
    -- Remove all beach activities first
    activities := array_remove(activities, 'beach_walking');
    activities := array_remove(activities, 'beach_lounging');
    activities := array_remove(activities, 'swimming_ocean');
    activities := array_remove(activities, 'beachcombing');
    activities := array_remove(activities, 'beach_volleyball');
    activities := array_remove(activities, 'sunbathing');
    activities := array_remove(activities, 'beach_sports');
    
    -- Add if beaches nearby
    IF NEW.beaches_nearby = true THEN
      activities := array_append(activities, 'beach_walking');
      activities := array_append(activities, 'beach_lounging');
      activities := array_append(activities, 'swimming_ocean');
      activities := array_append(activities, 'beachcombing');
      activities := array_append(activities, 'beach_volleyball');
      
      -- Add climate-dependent activities
      IF NEW.avg_temp_summer >= 25 OR NEW.climate = 'Tropical' THEN
        activities := array_append(activities, 'sunbathing');
        activities := array_append(activities, 'beach_sports');
      END IF;
    END IF;
  END IF;
  
  -- ========== MARINA/BOATING ACTIVITIES ==========
  IF NEW.marinas_count IS DISTINCT FROM OLD.marinas_count THEN
    -- Remove all marina activities first
    activities := array_remove(activities, 'boating');
    activities := array_remove(activities, 'sailing');
    activities := array_remove(activities, 'yacht_watching');
    activities := array_remove(activities, 'yacht_clubs');
    activities := array_remove(activities, 'sailing_lessons');
    activities := array_remove(activities, 'fishing_charters');
    activities := array_remove(activities, 'yacht_racing');
    activities := array_remove(activities, 'marina_dining');
    
    -- Add based on count
    IF NEW.marinas_count > 0 THEN
      activities := array_append(activities, 'boating');
      activities := array_append(activities, 'sailing');
      activities := array_append(activities, 'yacht_watching');
      
      IF NEW.marinas_count >= 2 THEN
        activities := array_append(activities, 'yacht_clubs');
        activities := array_append(activities, 'sailing_lessons');
        activities := array_append(activities, 'fishing_charters');
      END IF;
      
      IF NEW.marinas_count >= 3 THEN
        activities := array_append(activities, 'yacht_racing');
        activities := array_append(activities, 'marina_dining');
      END IF;
    END IF;
  END IF;
  
  -- ========== HIKING ACTIVITIES ==========
  IF NEW.hiking_trails_km IS DISTINCT FROM OLD.hiking_trails_km THEN
    -- Remove all hiking activities first
    activities := array_remove(activities, 'hiking');
    activities := array_remove(activities, 'nature_walks');
    activities := array_remove(activities, 'trail_photography');
    activities := array_remove(activities, 'day_hikes');
    activities := array_remove(activities, 'trail_variety');
    activities := array_remove(activities, 'serious_hiking');
    activities := array_remove(activities, 'backpacking');
    activities := array_remove(activities, 'trail_running');
    activities := array_remove(activities, 'mountain_biking');
    activities := array_remove(activities, 'multi_day_trekking');
    activities := array_remove(activities, 'wilderness_exploration');
    
    -- Add based on trail length
    IF NEW.hiking_trails_km > 0 THEN
      activities := array_append(activities, 'hiking');
      activities := array_append(activities, 'nature_walks');
      activities := array_append(activities, 'trail_photography');
      
      IF NEW.hiking_trails_km >= 25 THEN
        activities := array_append(activities, 'day_hikes');
        activities := array_append(activities, 'trail_variety');
      END IF;
      
      IF NEW.hiking_trails_km >= 100 THEN
        activities := array_append(activities, 'serious_hiking');
        activities := array_append(activities, 'backpacking');
        activities := array_append(activities, 'trail_running');
        activities := array_append(activities, 'mountain_biking');
      END IF;
      
      IF NEW.hiking_trails_km >= 200 THEN
        activities := array_append(activities, 'multi_day_trekking');
        activities := array_append(activities, 'wilderness_exploration');
      END IF;
    END IF;
  END IF;
  
  -- ========== SKI ACTIVITIES ==========
  IF NEW.ski_resorts_within_100km IS DISTINCT FROM OLD.ski_resorts_within_100km THEN
    -- Remove all ski activities first
    activities := array_remove(activities, 'skiing');
    activities := array_remove(activities, 'snowboarding');
    activities := array_remove(activities, 'apres_ski');
    activities := array_remove(activities, 'ski_variety');
    activities := array_remove(activities, 'ski_touring');
    activities := array_remove(activities, 'ski_destination');
    activities := array_remove(activities, 'winter_sports_hub');
    
    -- Add based on count
    IF NEW.ski_resorts_within_100km > 0 THEN
      activities := array_append(activities, 'skiing');
      activities := array_append(activities, 'snowboarding');
      activities := array_append(activities, 'apres_ski');
      
      IF NEW.ski_resorts_within_100km >= 3 THEN
        activities := array_append(activities, 'ski_variety');
        activities := array_append(activities, 'ski_touring');
      END IF;
      
      IF NEW.ski_resorts_within_100km >= 5 THEN
        activities := array_append(activities, 'ski_destination');
        activities := array_append(activities, 'winter_sports_hub');
      END IF;
    END IF;
  END IF;
  
  -- ========== COWORKING/DIGITAL NOMAD ==========
  IF NEW.coworking_spaces_count IS DISTINCT FROM OLD.coworking_spaces_count THEN
    -- Remove all coworking activities first
    activities := array_remove(activities, 'coworking');
    activities := array_remove(activities, 'digital_nomad_friendly');
    activities := array_remove(activities, 'networking');
    activities := array_remove(activities, 'startup_scene');
    activities := array_remove(activities, 'tech_meetups');
    
    -- Add based on count
    IF NEW.coworking_spaces_count > 0 THEN
      activities := array_append(activities, 'coworking');
      activities := array_append(activities, 'digital_nomad_friendly');
      activities := array_append(activities, 'networking');
      
      IF NEW.coworking_spaces_count >= 3 THEN
        activities := array_append(activities, 'startup_scene');
        activities := array_append(activities, 'tech_meetups');
      END IF;
    END IF;
  END IF;
  
  -- ========== DOG PARKS ==========
  IF NEW.dog_parks_count IS DISTINCT FROM OLD.dog_parks_count THEN
    -- Remove all dog activities first
    activities := array_remove(activities, 'dog_walking');
    activities := array_remove(activities, 'pet_friendly');
    activities := array_remove(activities, 'dog_community');
    activities := array_remove(activities, 'pet_events');
    
    -- Add based on count
    IF NEW.dog_parks_count > 0 THEN
      activities := array_append(activities, 'dog_walking');
      activities := array_append(activities, 'pet_friendly');
      
      IF NEW.dog_parks_count >= 3 THEN
        activities := array_append(activities, 'dog_community');
        activities := array_append(activities, 'pet_events');
      END IF;
    END IF;
  END IF;
  
  -- Remove duplicates and sort
  activities := ARRAY(SELECT DISTINCT unnest(activities) ORDER BY 1);
  
  -- Update the activities
  NEW.activities_available := activities;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_activities_trigger ON towns;

-- Create the trigger
CREATE TRIGGER update_activities_trigger
BEFORE UPDATE ON towns
FOR EACH ROW
WHEN (
  OLD.golf_courses_count IS DISTINCT FROM NEW.golf_courses_count OR
  OLD.tennis_courts_count IS DISTINCT FROM NEW.tennis_courts_count OR
  OLD.beaches_nearby IS DISTINCT FROM NEW.beaches_nearby OR
  OLD.marinas_count IS DISTINCT FROM NEW.marinas_count OR
  OLD.hiking_trails_km IS DISTINCT FROM NEW.hiking_trails_km OR
  OLD.ski_resorts_within_100km IS DISTINCT FROM NEW.ski_resorts_within_100km OR
  OLD.coworking_spaces_count IS DISTINCT FROM NEW.coworking_spaces_count OR
  OLD.dog_parks_count IS DISTINCT FROM NEW.dog_parks_count
)
EXECUTE FUNCTION update_activities_on_infrastructure_change();

-- =====================================================
-- TEST THE TRIGGER
-- =====================================================
-- Uncomment these to test:

-- Test adding a golf course
-- UPDATE towns 
-- SET golf_courses_count = 1 
-- WHERE name = 'Bangkok' AND country = 'Thailand';

-- Check the result
-- SELECT name, golf_courses_count, 
--        CASE WHEN 'golf' = ANY(activities_available) THEN 'YES' ELSE 'NO' END as has_golf_activity
-- FROM towns 
-- WHERE name = 'Bangkok' AND country = 'Thailand';

-- Test removing golf course
-- UPDATE towns 
-- SET golf_courses_count = 0 
-- WHERE name = 'Bangkok' AND country = 'Thailand';

-- Check the result
-- SELECT name, golf_courses_count, 
--        CASE WHEN 'golf' = ANY(activities_available) THEN 'YES' ELSE 'NO' END as has_golf_activity
-- FROM towns 
-- WHERE name = 'Bangkok' AND country = 'Thailand';