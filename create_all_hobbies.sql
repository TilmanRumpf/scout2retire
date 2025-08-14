-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_hobbies CASCADE;
DROP TABLE IF EXISTS town_hobbies CASCADE;
DROP TABLE IF EXISTS hobbies CASCADE;

-- Create hobbies table
CREATE TABLE hobbies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('activity', 'interest', 'custom')),
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create junction tables
CREATE TABLE user_hobbies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hobby_id UUID NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, hobby_id)
);

CREATE TABLE town_hobbies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    town_id UUID NOT NULL REFERENCES towns(id) ON DELETE CASCADE,
    hobby_id UUID NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(town_id, hobby_id)
);

-- Create indexes
CREATE INDEX idx_user_hobbies_user_id ON user_hobbies(user_id);
CREATE INDEX idx_user_hobbies_hobby_id ON user_hobbies(hobby_id);
CREATE INDEX idx_town_hobbies_town_id ON town_hobbies(town_id);
CREATE INDEX idx_town_hobbies_hobby_id ON town_hobbies(hobby_id);
CREATE INDEX idx_hobbies_category ON hobbies(category);
CREATE INDEX idx_hobbies_name ON hobbies(name);

-- Enable RLS
ALTER TABLE hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE town_hobbies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Hobbies are viewable by everyone" ON hobbies FOR SELECT USING (true);
CREATE POLICY "Users can view their own hobbies" ON user_hobbies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own hobbies" ON user_hobbies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Town hobbies are viewable by everyone" ON town_hobbies FOR SELECT USING (true);

-- Insert ALL activities (9 items)
INSERT INTO hobbies (name, category, description) VALUES
('Walking', 'activity', 'trails • beaches • parks'),
('Swimming', 'activity', 'pools • ocean • lakes'),
('Cycling', 'activity', 'road • mountain • trails'),
('Golf', 'activity', 'courses • driving range'),
('Tennis', 'activity', 'courts • clubs • leagues'),
('Water Sports', 'activity', 'kayak • sail • paddle'),
('Winter Sports', 'activity', 'ski • snowboard • ice skate'),
('Fishing', 'activity', 'ocean • lake • river'),
('Gardening', 'activity', 'vegetables • flowers • herbs');

-- Insert ALL interests (9 items)
INSERT INTO hobbies (name, category, description) VALUES
('Arts & Crafts', 'interest', 'painting • pottery • crafts'),
('Music', 'interest', 'concerts • instruments • choir'),
('Theater', 'interest', 'plays • musicals • opera'),
('Reading', 'interest', 'book clubs • libraries'),
('Cooking', 'interest', 'classes • cuisines • baking'),
('Wine', 'interest', 'tasting • tours • collecting'),
('History', 'interest', 'museums • tours • lectures'),
('Photography', 'interest', 'nature • travel • portraits'),
('Volunteering', 'interest', 'community • charity • causes');

-- Insert ALL 114 custom hobbies from allHobbies array
INSERT INTO hobbies (name, category) VALUES
('Antique collecting', 'custom'),
('Aquarium keeping', 'custom'),
('Archery', 'custom'),
('Astronomy', 'custom'),
('Baking', 'custom'),
('Ballet', 'custom'),
('Ballroom dancing', 'custom'),
('Basketball', 'custom'),
('Beekeeping', 'custom'),
('Bird watching', 'custom'),
('Blogging', 'custom'),
('Board games', 'custom'),
('Boating', 'custom'),
('Book clubs', 'custom'),
('Bowling', 'custom'),
('Bridge', 'custom'),
('Calligraphy', 'custom'),
('Camping', 'custom'),
('Canoeing', 'custom'),
('Card games', 'custom'),
('Chess', 'custom'),
('Choir singing', 'custom'),
('Collecting coins', 'custom'),
('Collecting stamps', 'custom'),
('Community theater', 'custom'),
('Cooking classes', 'custom'),
('Creative writing', 'custom'),
('Crochet', 'custom'),
('Cross-country skiing', 'custom'),
('Crossword puzzles', 'custom'),
('Dancing', 'custom'),
('Darts', 'custom'),
('Digital photography', 'custom'),
('Dog training', 'custom'),
('Drawing', 'custom'),
('Embroidery', 'custom'),
('Fencing', 'custom'),
('Film appreciation', 'custom'),
('Fitness classes', 'custom'),
('Flower arranging', 'custom'),
('Flying', 'custom'),
('Genealogy', 'custom'),
('Geocaching', 'custom'),
('Glass blowing', 'custom'),
('Golfing', 'custom'),
('Grandchildren activities', 'custom'),
('Greenhouse gardening', 'custom'),
('Hiking', 'custom'),
('Home brewing', 'custom'),
('Horseback riding', 'custom'),
('Hot air ballooning', 'custom'),
('Ice skating', 'custom'),
('Jazz appreciation', 'custom'),
('Jewelry making', 'custom'),
('Jigsaw puzzles', 'custom'),
('Jogging', 'custom'),
('Journaling', 'custom'),
('Kayaking', 'custom'),
('Knitting', 'custom'),
('Language learning', 'custom'),
('Leather crafting', 'custom'),
('Line dancing', 'custom'),
('Mahjong', 'custom'),
('Martial arts', 'custom'),
('Meditation', 'custom'),
('Metal detecting', 'custom'),
('Model building', 'custom'),
('Motorcycling', 'custom'),
('Mountain biking', 'custom'),
('Museums', 'custom'),
('Nature walks', 'custom'),
('Needlepoint', 'custom'),
('Opera', 'custom'),
('Orchid growing', 'custom'),
('Orienteering', 'custom'),
('Painting', 'custom'),
('Paragliding', 'custom'),
('Petanque', 'custom'),
('Pickleball', 'custom'),
('Pilates', 'custom'),
('Ping pong', 'custom'),
('Poetry', 'custom'),
('Poker', 'custom'),
('Pottery', 'custom'),
('Quilting', 'custom'),
('Racing', 'custom'),
('Radio amateur', 'custom'),
('RV traveling', 'custom'),
('Sailing', 'custom'),
('Salsa dancing', 'custom'),
('Scrapbooking', 'custom'),
('Scuba diving', 'custom'),
('Sculpting', 'custom'),
('Sewing', 'custom'),
('Shuffleboard', 'custom'),
('Singing', 'custom'),
('Sketching', 'custom'),
('Snorkeling', 'custom'),
('Snowshoeing', 'custom'),
('Square dancing', 'custom'),
('Stained glass', 'custom'),
('Stand-up paddleboarding', 'custom'),
('Stargazing', 'custom'),
('Sudoku', 'custom'),
('Surfing', 'custom'),
('Swimming laps', 'custom'),
('Tai chi', 'custom'),
('Tango', 'custom'),
('Train spotting', 'custom'),
('Travel planning', 'custom'),
('Trivia nights', 'custom'),
('Ukulele', 'custom'),
('Video gaming', 'custom'),
('Walking clubs', 'custom'),
('Water aerobics', 'custom'),
('Watercolor painting', 'custom'),
('Wildlife photography', 'custom'),
('Wine tasting', 'custom'),
('Wood carving', 'custom'),
('Woodworking', 'custom'),
('Writing memoirs', 'custom'),
('Yacht racing', 'custom'),
('Yoga', 'custom'),
('Zumba', 'custom');

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hobbies_updated_at BEFORE UPDATE ON hobbies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON hobbies TO anon, authenticated;
GRANT ALL ON user_hobbies TO authenticated;
GRANT SELECT ON town_hobbies TO anon, authenticated;

-- Verify the count
SELECT 
    category, 
    COUNT(*) as count 
FROM hobbies 
GROUP BY category
ORDER BY category;

-- Should return:
-- activity: 9
-- custom: 114  
-- interest: 9
-- TOTAL: 132 rows