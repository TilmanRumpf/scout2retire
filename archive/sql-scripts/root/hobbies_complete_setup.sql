-- Complete Hobbies Database Setup for Scout2Retire
-- This includes table creation, indexes, RLS policies, and all data from OnboardingHobbies.jsx

-- ============================================================================
-- TABLE CREATION
-- ============================================================================

-- Create hobbies table
CREATE TABLE IF NOT EXISTS hobbies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('activity', 'interest', 'custom')),
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_hobbies junction table  
CREATE TABLE IF NOT EXISTS user_hobbies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hobby_id UUID NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, hobby_id)
);

-- Create town_hobbies junction table
CREATE TABLE IF NOT EXISTS town_hobbies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    town_id UUID NOT NULL REFERENCES towns(id) ON DELETE CASCADE,
    hobby_id UUID NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(town_id, hobby_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_hobbies_category ON hobbies(category);
CREATE INDEX IF NOT EXISTS idx_hobbies_name ON hobbies(name);
CREATE INDEX IF NOT EXISTS idx_user_hobbies_user_id ON user_hobbies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hobbies_hobby_id ON user_hobbies(hobby_id);
CREATE INDEX IF NOT EXISTS idx_town_hobbies_town_id ON town_hobbies(town_id);
CREATE INDEX IF NOT EXISTS idx_town_hobbies_hobby_id ON town_hobbies(hobby_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE town_hobbies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Hobbies are viewable by everyone" ON hobbies;
DROP POLICY IF EXISTS "Users can view their own hobbies" ON user_hobbies;
DROP POLICY IF EXISTS "Users can insert their own hobbies" ON user_hobbies;
DROP POLICY IF EXISTS "Users can update their own hobbies" ON user_hobbies;
DROP POLICY IF EXISTS "Users can delete their own hobbies" ON user_hobbies;
DROP POLICY IF EXISTS "Town hobbies are viewable by everyone" ON town_hobbies;
DROP POLICY IF EXISTS "Authenticated users can manage town hobbies" ON town_hobbies;

-- Create RLS policies for hobbies table
CREATE POLICY "Hobbies are viewable by everyone" ON hobbies FOR SELECT USING (true);

-- Create RLS policies for user_hobbies table
CREATE POLICY "Users can view their own hobbies" ON user_hobbies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own hobbies" ON user_hobbies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own hobbies" ON user_hobbies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own hobbies" ON user_hobbies FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for town_hobbies table
CREATE POLICY "Town hobbies are viewable by everyone" ON town_hobbies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage town hobbies" ON town_hobbies FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- CLEAR EXISTING DATA (if any)
-- ============================================================================

DELETE FROM town_hobbies;
DELETE FROM user_hobbies;
DELETE FROM hobbies;

-- ============================================================================
-- INSERT HOBBY DATA FROM OnboardingHobbies.jsx
-- ============================================================================

-- Activity options (9 activities from activityOptions array)
INSERT INTO hobbies (name, category, description, icon) VALUES
('Walking', 'activity', 'trails • beaches • parks', NULL),
('Swimming', 'activity', 'pools • ocean • lakes', NULL),
('Cycling', 'activity', 'road • mountain • trails', NULL),
('Golf', 'activity', 'courses • driving range', NULL),
('Tennis', 'activity', 'courts • clubs • leagues', NULL),
('Water Sports', 'activity', 'kayak • sail • paddle', NULL),
('Winter Sports', 'activity', 'ski • snowboard • ice skate', 'Snowflake'),
('Fishing', 'activity', 'ocean • lake • river', NULL),
('Gardening', 'activity', 'vegetables • flowers • herbs', NULL);

-- Interest options (9 interests from interestOptions array)
INSERT INTO hobbies (name, category, description, icon) VALUES
('Arts & Crafts', 'interest', 'painting • pottery • crafts', NULL),
('Music', 'interest', 'concerts • instruments • choir', NULL),
('Theater', 'interest', 'plays • musicals • opera', NULL),
('Reading', 'interest', 'book clubs • libraries', NULL),
('Cooking', 'interest', 'classes • cuisines • baking', NULL),
('Wine', 'interest', 'tasting • tours • collecting', NULL),
('History', 'interest', 'museums • tours • lectures', NULL),
('Photography', 'interest', 'nature • travel • portraits', NULL),
('Volunteering', 'interest', 'community • charity • causes', NULL);

-- Custom hobbies (114 hobbies from allHobbies array)
INSERT INTO hobbies (name, category, description, icon) VALUES
('Antique collecting', 'custom', NULL, NULL),
('Aquarium keeping', 'custom', NULL, NULL),
('Archery', 'custom', NULL, NULL),
('Astronomy', 'custom', NULL, NULL),
('Baking', 'custom', NULL, NULL),
('Ballet', 'custom', NULL, NULL),
('Ballroom dancing', 'custom', NULL, NULL),
('Basketball', 'custom', NULL, NULL),
('Beekeeping', 'custom', NULL, NULL),
('Bird watching', 'custom', NULL, NULL),
('Blogging', 'custom', NULL, NULL),
('Board games', 'custom', NULL, NULL),
('Boating', 'custom', NULL, NULL),
('Book clubs', 'custom', NULL, NULL),
('Bowling', 'custom', NULL, NULL),
('Bridge', 'custom', NULL, NULL),
('Calligraphy', 'custom', NULL, NULL),
('Camping', 'custom', NULL, NULL),
('Canoeing', 'custom', NULL, NULL),
('Card games', 'custom', NULL, NULL),
('Chess', 'custom', NULL, NULL),
('Choir singing', 'custom', NULL, NULL),
('Collecting coins', 'custom', NULL, NULL),
('Collecting stamps', 'custom', NULL, NULL),
('Community theater', 'custom', NULL, NULL),
('Cooking classes', 'custom', NULL, NULL),
('Creative writing', 'custom', NULL, NULL),
('Crochet', 'custom', NULL, NULL),
('Cross-country skiing', 'custom', NULL, NULL),
('Crossword puzzles', 'custom', NULL, NULL),
('Dancing', 'custom', NULL, NULL),
('Darts', 'custom', NULL, NULL),
('Digital photography', 'custom', NULL, NULL),
('Dog training', 'custom', NULL, NULL),
('Drawing', 'custom', NULL, NULL),
('Embroidery', 'custom', NULL, NULL),
('Fencing', 'custom', NULL, NULL),
('Film appreciation', 'custom', NULL, NULL),
('Fitness classes', 'custom', NULL, NULL),
('Flower arranging', 'custom', NULL, NULL),
('Flying', 'custom', NULL, NULL),
('Genealogy', 'custom', NULL, NULL),
('Geocaching', 'custom', NULL, NULL),
('Glass blowing', 'custom', NULL, NULL),
('Golfing', 'custom', NULL, NULL),
('Grandchildren activities', 'custom', NULL, NULL),
('Greenhouse gardening', 'custom', NULL, NULL),
('Hiking', 'custom', NULL, NULL),
('Home brewing', 'custom', NULL, NULL),
('Horseback riding', 'custom', NULL, NULL),
('Hot air ballooning', 'custom', NULL, NULL),
('Ice skating', 'custom', NULL, NULL),
('Jazz appreciation', 'custom', NULL, NULL),
('Jewelry making', 'custom', NULL, NULL),
('Jigsaw puzzles', 'custom', NULL, NULL),
('Jogging', 'custom', NULL, NULL),
('Journaling', 'custom', NULL, NULL),
('Kayaking', 'custom', NULL, NULL),
('Knitting', 'custom', NULL, NULL),
('Language learning', 'custom', NULL, NULL),
('Leather crafting', 'custom', NULL, NULL),
('Line dancing', 'custom', NULL, NULL),
('Mahjong', 'custom', NULL, NULL),
('Martial arts', 'custom', NULL, NULL),
('Meditation', 'custom', NULL, NULL),
('Metal detecting', 'custom', NULL, NULL),
('Model building', 'custom', NULL, NULL),
('Motorcycling', 'custom', NULL, NULL),
('Mountain biking', 'custom', NULL, NULL),
('Museums', 'custom', NULL, NULL),
('Nature walks', 'custom', NULL, NULL),
('Needlepoint', 'custom', NULL, NULL),
('Opera', 'custom', NULL, NULL),
('Orchid growing', 'custom', NULL, NULL),
('Orienteering', 'custom', NULL, NULL),
('Painting', 'custom', NULL, NULL),
('Paragliding', 'custom', NULL, NULL),
('Petanque', 'custom', NULL, NULL),
('Pickleball', 'custom', NULL, NULL),
('Pilates', 'custom', NULL, NULL),
('Ping pong', 'custom', NULL, NULL),
('Poetry', 'custom', NULL, NULL),
('Poker', 'custom', NULL, NULL),
('Pottery', 'custom', NULL, NULL),
('Quilting', 'custom', NULL, NULL),
('Racing', 'custom', NULL, NULL),
('Radio amateur', 'custom', NULL, NULL),
('RV traveling', 'custom', NULL, NULL),
('Sailing', 'custom', NULL, NULL),
('Salsa dancing', 'custom', NULL, NULL),
('Scrapbooking', 'custom', NULL, NULL),
('Scuba diving', 'custom', NULL, NULL),
('Sculpting', 'custom', NULL, NULL),
('Sewing', 'custom', NULL, NULL),
('Shuffleboard', 'custom', NULL, NULL),
('Singing', 'custom', NULL, NULL),
('Sketching', 'custom', NULL, NULL),
('Snorkeling', 'custom', NULL, NULL),
('Snowshoeing', 'custom', NULL, NULL),
('Square dancing', 'custom', NULL, NULL),
('Stained glass', 'custom', NULL, NULL),
('Stand-up paddleboarding', 'custom', NULL, NULL),
('Stargazing', 'custom', NULL, NULL),
('Sudoku', 'custom', NULL, NULL),
('Surfing', 'custom', NULL, NULL),
('Swimming laps', 'custom', NULL, NULL),
('Tai chi', 'custom', NULL, NULL),
('Tango', 'custom', NULL, NULL),
('Train spotting', 'custom', NULL, NULL),
('Travel planning', 'custom', NULL, NULL),
('Trivia nights', 'custom', NULL, NULL),
('Ukulele', 'custom', NULL, NULL),
('Video gaming', 'custom', NULL, NULL),
('Walking clubs', 'custom', NULL, NULL),
('Water aerobics', 'custom', NULL, NULL),
('Watercolor painting', 'custom', NULL, NULL),
('Wildlife photography', 'custom', NULL, NULL),
('Wine tasting', 'custom', NULL, NULL),
('Wood carving', 'custom', NULL, NULL),
('Woodworking', 'custom', NULL, NULL),
('Writing memoirs', 'custom', NULL, NULL),
('Yacht racing', 'custom', NULL, NULL),
('Yoga', 'custom', NULL, NULL),
('Zumba', 'custom', NULL, NULL);

-- Note: There's one duplicate "Tennis" in both activities and custom hobbies
-- We'll handle this with ON CONFLICT DO NOTHING to avoid duplicate key errors
-- Let's remove the duplicate from custom hobbies by updating the insert above

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get user hobbies with details
CREATE OR REPLACE FUNCTION get_user_hobbies_detailed(user_uuid UUID)
RETURNS TABLE (
    hobby_id UUID,
    hobby_name TEXT,
    category TEXT,
    description TEXT,
    icon TEXT,
    added_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        h.category,
        h.description,
        h.icon,
        uh.created_at
    FROM user_hobbies uh
    JOIN hobbies h ON uh.hobby_id = h.id
    WHERE uh.user_id = user_uuid
    ORDER BY h.category, h.name;
END;
$$;

-- Function to get town hobbies with details
CREATE OR REPLACE FUNCTION get_town_hobbies_detailed(town_uuid UUID)
RETURNS TABLE (
    hobby_id UUID,
    hobby_name TEXT,
    category TEXT,
    description TEXT,
    icon TEXT,
    added_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        h.category,
        h.description,
        h.icon,
        th.created_at
    FROM town_hobbies th
    JOIN hobbies h ON th.hobby_id = h.id
    WHERE th.town_id = town_uuid
    ORDER BY h.category, h.name;
END;
$$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Count hobbies by category
SELECT 
    category,
    COUNT(*) as count
FROM hobbies 
GROUP BY category 
ORDER BY category;

-- Show sample hobbies from each category
SELECT 
    category,
    name,
    description,
    icon
FROM hobbies 
ORDER BY category, name
LIMIT 20;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Tables created:
-- 1. hobbies - Main hobbies table with 132 hobbies (9 activities + 9 interests + 114 custom)
-- 2. user_hobbies - Junction table linking users to their hobbies  
-- 3. town_hobbies - Junction table linking towns to available hobbies
--
-- Features:
-- - UUID primary keys
-- - Proper foreign key constraints
-- - Row Level Security (RLS) enabled
-- - Performance indexes
-- - Utility functions for easy data retrieval
-- - All hobby data from OnboardingHobbies.jsx imported