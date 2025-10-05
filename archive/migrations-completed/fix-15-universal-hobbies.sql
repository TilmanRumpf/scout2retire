-- FIX: 15 hobbies incorrectly classified as location-dependent
-- These should ALL be UNIVERSAL (is_universal = true)

-- 1. Camping - Can camp anywhere with appropriate gear
UPDATE hobbies
SET 
  is_universal = true,
  verification_method = 'universal',
  verification_query = NULL,
  verification_notes = 'Can camp anywhere - backyard, campgrounds, wilderness. Gear available online.'
WHERE name = 'Camping';

-- 2. Motorcycling - Can ride anywhere with license and bike
UPDATE hobbies
SET 
  is_universal = true,
  verification_method = 'universal',
  verification_query = NULL,
  verification_notes = 'Motorcycles available everywhere. License required but obtainable anywhere. Roads exist everywhere.'
WHERE name = 'Motorcycling';

-- 3. Leather Crafting - Craft that can be done at home
UPDATE hobbies
SET 
  is_universal = true,
  verification_method = 'universal',
  verification_query = NULL,
  verification_notes = 'Leather working is a craft. Tools and materials available online. Can practice anywhere.'
WHERE name = 'Leather Crafting';

-- 4. Stained Glass - Art/craft that can be done at home
UPDATE hobbies
SET 
  is_universal = true,
  verification_method = 'universal',
  verification_query = NULL,
  verification_notes = 'Glass art craft. Tools and materials available online. Can set up workspace anywhere.'
WHERE name = 'Stained Glass';

-- 5. Woodworking - Already should be universal (was in our last batch!)
UPDATE hobbies
SET 
  is_universal = true,
  verification_method = 'universal',
  verification_query = NULL,
  verification_notes = 'Requires tools and workspace. Home garage, community workshops, maker spaces available most places.'
WHERE name = 'Woodworking';

-- 6. Cooking Classes - Can learn cooking anywhere
UPDATE hobbies
SET 
  is_universal = true,
  verification_method = 'universal',
  verification_query = NULL,
  verification_notes = 'Cooking can be learned online, from books, or local classes. Kitchens exist everywhere.'
WHERE name = 'Cooking Classes';

-- 7. Vegetable Gardening - Can grow vegetables anywhere
UPDATE hobbies
SET 
  is_universal = true,
  verification_method = 'universal',
  verification_query = NULL,
  verification_notes = 'Can grow vegetables in pots, containers, raised beds, community gardens. Indoor/outdoor options.'
WHERE name = 'Vegetable Gardening';

-- 8. Orchid Growing - Indoor hobby possible anywhere
UPDATE hobbies
SET 
  is_universal = true,
  verification_method = 'universal',
  verification_query = NULL,
  verification_notes = 'Indoor plant cultivation. Orchids available at nurseries/online. Can grow anywhere indoors.'
WHERE name = 'Orchid Growing';

-- 9. Petanque - Simple ball game playable anywhere
UPDATE hobbies
SET 
  is_universal = true,
  verification_method = 'universal',
  verification_query = NULL,
  verification_notes = 'French ball game. Requires only metal balls and flat ground. Can play in parks, yards, beaches.'
WHERE name = 'Petanque';

-- 10. Bocce Ball - Another ball game playable anywhere
UPDATE hobbies
SET 
  is_universal = true,
  verification_method = 'universal',
  verification_query = NULL,
  verification_notes = 'Italian ball game similar to petanque. Equipment portable. Any flat surface works.'
WHERE name = 'Bocce Ball';

-- 11. Swimming - Basic activity available most places
UPDATE hobbies
SET 
  is_universal = true,
  verification_method = 'universal',
  verification_query = NULL,
  verification_notes = 'Pools, beaches, lakes available in most areas. YMCAs, gyms, community centers common.'
WHERE name = 'Swimming';

-- 12. Gardening - Universal activity
UPDATE hobbies
SET 
  is_universal = true,
  verification_method = 'universal',
  verification_query = NULL,
  verification_notes = 'Can garden anywhere - yards, containers, window boxes, community plots. Indoor/outdoor options.'
WHERE name = 'Gardening';

-- 13. Antique Collecting - Can collect anywhere
UPDATE hobbies
SET 
  is_universal = true,
  verification_method = 'universal',
  verification_query = NULL,
  verification_notes = 'Antiques available at shops, estate sales, online marketplaces. Can collect anywhere.'
WHERE name = 'Antique Collecting';

-- 14. Volunteering - Opportunities exist everywhere
UPDATE hobbies
SET 
  is_universal = true,
  verification_method = 'universal',
  verification_query = NULL,
  verification_notes = 'Volunteer opportunities exist everywhere - schools, hospitals, charities, churches, food banks.'
WHERE name = 'Volunteering';

-- 15. Walking Groups - Can organize or join anywhere
UPDATE hobbies
SET 
  is_universal = true,
  verification_method = 'universal',
  verification_query = NULL,
  verification_notes = 'Walking groups can form anywhere. Parks, malls, neighborhoods. Can start your own group.'
WHERE name = 'Walking Groups';

-- Verify the updates
SELECT name, is_universal, verification_method, verification_notes
FROM hobbies
WHERE name IN (
  'Camping', 'Motorcycling', 'Leather Crafting', 'Stained Glass', 
  'Woodworking', 'Cooking Classes', 'Vegetable Gardening', 'Orchid Growing',
  'Petanque', 'Bocce Ball', 'Swimming', 'Gardening', 
  'Antique Collecting', 'Volunteering', 'Walking Groups'
)
ORDER BY name;