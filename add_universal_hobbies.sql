-- Add is_universal column to hobbies table
ALTER TABLE hobbies 
ADD COLUMN is_universal BOOLEAN DEFAULT false;

-- Add conditions column for non-universal hobbies
ALTER TABLE hobbies
ADD COLUMN required_conditions JSONB DEFAULT NULL;

-- Update hobbies with universal flag
-- These are available EVERYWHERE (no need for town_hobbies entries)
UPDATE hobbies SET is_universal = true WHERE name IN (
  -- Indoor/Mental activities - always available
  'Reading',
  'Board games',
  'Card games',
  'Chess',
  'Bridge',
  'Crossword puzzles',
  'Sudoku',
  'Jigsaw puzzles',
  'Mahjong',
  'Trivia nights',
  'Book clubs',
  'Poetry',
  'Creative writing',
  'Writing memoirs',
  'Journaling',
  'Blogging',
  
  -- Arts & Crafts - can do anywhere
  'Arts & Crafts',
  'Painting',
  'Drawing',
  'Sketching',
  'Photography',
  'Digital photography',
  'Knitting',
  'Crochet',
  'Sewing',
  'Quilting',
  'Embroidery',
  'Needlepoint',
  'Calligraphy',
  'Scrapbooking',
  'Jewelry making',
  'Pottery',
  
  -- Music/Performance - generally available
  'Music',
  'Singing',
  'Choir singing',
  'Dancing',
  'Ballroom dancing',
  'Line dancing',
  'Square dancing',
  'Tango',
  'Salsa dancing',
  'Theater',
  'Community theater',
  'Film appreciation',
  'Opera',
  
  -- Learning/Hobbies
  'Cooking',
  'Baking',
  'Cooking classes',
  'Language learning',
  'Genealogy',
  'History',
  'Collecting coins',
  'Collecting stamps',
  'Antique collecting',
  'Radio amateur',
  
  -- Basic fitness (can do indoors)
  'Walking',
  'Yoga',
  'Tai chi',
  'Pilates',
  'Meditation',
  'Fitness classes',
  'Zumba',
  'Video gaming',
  
  -- Social activities
  'Volunteering',
  'Grandchildren activities',
  'Travel planning',
  'Poker'
);

-- Mark location-specific hobbies with required conditions
UPDATE hobbies SET 
  is_universal = false,
  required_conditions = '{"needs": ["ocean"]}'::jsonb
WHERE name IN (
  'Sailing',
  'Surfing',
  'Scuba diving',
  'Snorkeling',
  'Stand-up paddleboarding',
  'Yacht racing',
  'Boating'
);

UPDATE hobbies SET 
  is_universal = false,
  required_conditions = '{"needs": ["mountains"]}'::jsonb
WHERE name IN (
  'Hiking',
  'Mountain biking',
  'Rock climbing',
  'Orienteering',
  'Paragliding'
);

UPDATE hobbies SET 
  is_universal = false,
  required_conditions = '{"needs": ["cold_climate"]}'::jsonb
WHERE name IN (
  'Winter Sports',
  'Ice skating',
  'Cross-country skiing',
  'Snowshoeing',
  'Skiing'
);

UPDATE hobbies SET 
  is_universal = false,
  required_conditions = '{"needs": ["warm_climate"]}'::jsonb
WHERE name IN (
  'Swimming', -- outdoor swimming
  'Water Sports',
  'Water aerobics'
);

UPDATE hobbies SET 
  is_universal = false,
  required_conditions = '{"needs": ["golf_course"]}'::jsonb
WHERE name IN (
  'Golf',
  'Golfing'
);

UPDATE hobbies SET 
  is_universal = false,
  required_conditions = '{"needs": ["tennis_courts"]}'::jsonb
WHERE name IN (
  'Tennis',
  'Pickleball'
);

UPDATE hobbies SET 
  is_universal = false,
  required_conditions = '{"needs": ["space", "rural"]}'::jsonb
WHERE name IN (
  'Horseback riding',
  'Beekeeping',
  'Greenhouse gardening',
  'Gardening',
  'Orchid growing',
  'Home brewing',
  'RV traveling',
  'Camping',
  'Hot air ballooning',
  'Flying',
  'Motorcycling'
);

UPDATE hobbies SET 
  is_universal = false,
  required_conditions = '{"needs": ["water_body"]}'::jsonb
WHERE name IN (
  'Fishing',
  'Kayaking',
  'Canoeing',
  'Swimming laps'
);

UPDATE hobbies SET 
  is_universal = false,
  required_conditions = '{"needs": ["wine_region"]}'::jsonb
WHERE name IN (
  'Wine',
  'Wine tasting'
);

-- Activities that need some infrastructure but are common
UPDATE hobbies SET 
  is_universal = false,
  required_conditions = '{"needs": ["basic_facilities"]}'::jsonb
WHERE name IN (
  'Bowling',
  'Basketball',
  'Ping pong',
  'Shuffleboard',
  'Darts',
  'Petanque',
  'Museums',
  'Nature walks',
  'Walking clubs',
  'Dog training',
  'Aquarium keeping',
  'Model building',
  'Wood carving',
  'Woodworking',
  'Metal detecting',
  'Archery',
  'Fencing',
  'Martial arts',
  'Ballet',
  'Glass blowing',
  'Stained glass',
  'Leather crafting',
  'Flower arranging',
  'Astronomy',
  'Stargazing',
  'Bird watching',
  'Wildlife photography',
  'Watercolor painting',
  'Sculpting',
  'Jazz appreciation',
  'Ukulele',
  'Train spotting',
  'Geocaching',
  'Racing',
  'Jogging',
  'Cycling',
  'Road cycling'
);

-- Count results
SELECT 
  is_universal,
  COUNT(*) as count
FROM hobbies
GROUP BY is_universal;

-- Show universal vs specific
SELECT 
  name,
  category,
  is_universal,
  required_conditions
FROM hobbies
WHERE is_universal = false
ORDER BY required_conditions, name;