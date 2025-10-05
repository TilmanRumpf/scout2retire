-- Update hobby verification methods based on analysis
-- Created: 2025-08-31

-- First, update Bocce Ball with ai_community
UPDATE hobbies
SET 
  verification_method = 'ai_community',
  verification_query = 'Is bocce ball (also known as boule or petanque) played in {town}? Are there clubs or regular players?',
  verification_notes = 'Culturally regional - popular in Mediterranean countries, rare elsewhere'
WHERE name = 'Bocce Ball';

-- Update universal hobbies (clear cases)
UPDATE hobbies
SET 
  verification_method = 'universal',
  verification_notes = 'User-to-user matching only, not town-relevant'
WHERE name IN ('Ballroom Dancing', 'Bible Study', 'Birdwatching', 
               'Blogging', 'Board Games', 'Book Clubs');

-- Update Basketball (needs courts)
UPDATE hobbies
SET 
  verification_method = 'database_infrastructure',
  verification_query = 'basketball_courts_count > 0 OR sports_facilities_count > 0',
  verification_notes = 'Requires basketball courts or sports facilities'
WHERE name = 'Basketball';

-- Update Boating (needs water)
UPDATE hobbies
SET 
  verification_method = 'database_geographic',
  verification_query = 'water_bodies IS NOT NULL OR distance_to_ocean_km < 50',
  verification_notes = 'Requires access to water bodies'
WHERE name = 'Boating';

-- Update Beekeeping (complex requirements)
UPDATE hobbies
SET 
  verification_method = 'ai_community',
  verification_query = 'Is beekeeping allowed and practiced in {town}? Consider local regulations and climate.',
  verification_notes = 'Depends on local regulations, climate, and rural/suburban setting'
WHERE name = 'Beekeeping';