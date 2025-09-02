-- BATCH 16: FINAL 22 HOBBIES (U-Z)
-- Fixing the ones we missed with proper classifications

-- UNIVERSAL HOBBIES (can do anywhere)
UPDATE hobbies
SET 
  category = 'interest',
  verification_method = 'universal',
  is_universal = true,
  verification_query = NULL,
  verification_notes = 'Small instrument easily learned online. Portable, affordable. Online tutorials abundant.'
WHERE name = 'Ukulele';

UPDATE hobbies
SET 
  category = 'interest',
  verification_method = 'universal',
  is_universal = true,
  verification_query = NULL,
  verification_notes = 'Gaming possible anywhere with console, PC, or mobile. Online multiplayer available.'
WHERE name = 'Video Gaming';

UPDATE hobbies
SET 
  category = 'activity',
  verification_method = 'universal',
  is_universal = true,
  verification_query = NULL,
  verification_notes = 'Walking possible anywhere. No equipment needed. Sidewalks, parks, or indoor malls.'
WHERE name = 'Walking';

UPDATE hobbies
SET 
  category = 'interest',
  verification_method = 'universal',
  is_universal = true,
  verification_query = NULL,
  verification_notes = 'Painting technique using water-based paints. Can practice anywhere with basic supplies.'
WHERE name = 'Watercolor Painting';

UPDATE hobbies
SET 
  category = 'interest',
  verification_method = 'universal',
  is_universal = true,
  verification_query = NULL,
  verification_notes = 'Craft requiring wood and tools. Can practice in garage, workshop, or maker space.'
WHERE name = 'Wood Carving';

UPDATE hobbies
SET 
  category = 'interest',
  verification_method = 'universal',
  is_universal = true,
  verification_query = NULL,
  verification_notes = 'Personal storytelling and life documentation. Requires only writing tools or computer.'
WHERE name = 'Writing Memoirs';

UPDATE hobbies
SET 
  category = 'activity',
  verification_method = 'universal',
  is_universal = true,
  verification_query = NULL,
  verification_notes = 'Can practice at home with videos/apps. Studios enhance but not required. Mats available online.'
WHERE name = 'Yoga';

-- LOCATION-DEPENDENT WITH PROPER QUERIES
UPDATE hobbies
SET 
  category = 'activity',
  verification_method = 'ai_community',
  verification_query = 'Find community gardens, gardening clubs, or suitable climate for vegetable gardening in {town}',
  verification_notes = 'Requires outdoor space or community garden. Climate and soil matter. Year-round in warm areas.'
WHERE name = 'Vegetable Gardening';

UPDATE hobbies
SET 
  category = 'activity',
  verification_method = 'ai_facilities',
  verification_query = 'Find vineyards, wineries, or wine tours near {town}',
  verification_notes = 'Requires proximity to wine regions. Tours, tastings, harvest events.'
WHERE name = 'Vineyards';

UPDATE hobbies
SET 
  category = 'activity',
  verification_method = 'ai_community',
  verification_query = 'Find volunteer opportunities, charities, or community service organizations in {town}',
  verification_notes = 'Available everywhere but varies by community needs. Food banks, hospitals, schools.'
WHERE name = 'Volunteering';

UPDATE hobbies
SET 
  category = 'activity',
  verification_method = 'ai_community',
  verification_query = 'Find walking clubs or organized walking groups in {town}',
  verification_notes = 'Social walking groups. Mall walkers, hiking clubs, fitness groups. Check meetup and rec centers.'
WHERE name = 'Walking Clubs';

UPDATE hobbies
SET 
  category = 'activity',
  verification_method = 'ai_community',
  verification_query = 'Find walking groups or organized walking activities in {town}',
  verification_notes = 'Organized group walks. Similar to walking clubs. Check parks, senior centers, fitness groups.'
WHERE name = 'Walking Groups';

UPDATE hobbies
SET 
  category = 'activity',
  verification_method = 'ai_facilities',
  verification_query = 'Find pools offering water aerobics classes in {town}',
  verification_notes = 'Requires pool with classes. YMCAs, rec centers, gyms. Popular with seniors.'
WHERE name = 'Water Aerobics';

UPDATE hobbies
SET 
  category = 'activity',
  verification_method = 'ai_facilities',
  verification_query = 'Find pools with water polo teams or leagues in {town}',
  verification_notes = 'Requires deep pool and organized league. Competitive team sport. Check aquatic centers.'
WHERE name = 'Water Polo';

UPDATE hobbies
SET 
  category = 'activity',
  verification_method = 'database_geographic',
  verification_query = 'Find lakes, rivers, beaches, or water sports facilities near {town}',
  verification_notes = 'Broad category needing water access. Includes kayaking, paddleboarding, jet skiing.'
WHERE name = 'Water Sports';

UPDATE hobbies
SET 
  category = 'interest',
  verification_method = 'ai_community',
  verification_query = 'Find natural areas, parks, or wildlife refuges for wildlife photography near {town}',
  verification_notes = 'Requires wildlife access. National parks, refuges, nature preserves enhance opportunities.'
WHERE name = 'Wildlife Photography';

UPDATE hobbies
SET 
  category = 'activity',
  verification_method = 'database_geographic',
  verification_query = 'Find beaches or lakes with wind conditions suitable for windsurfing near {town}',
  verification_notes = 'Requires consistent wind and water access. Coastal areas, large lakes. Equipment rental helpful.'
WHERE name = 'Windsurfing';

UPDATE hobbies
SET 
  category = 'interest',
  verification_method = 'ai_community',
  verification_query = 'Find wineries, wine shops, or wine clubs in {town}',
  verification_notes = 'Wine appreciation and tasting. Wine shops, tasting rooms, wine clubs available most places.'
WHERE name = 'Wine';

UPDATE hobbies
SET 
  category = 'activity',
  verification_method = 'database_geographic',
  verification_query = 'Find ski resorts, ice rinks, or winter sports facilities near {town}',
  verification_notes = 'Requires cold climate with snow/ice. Skiing, skating, hockey. Seasonal in most areas.'
WHERE name = 'Winter Sports';

UPDATE hobbies
SET 
  category = 'interest',
  verification_method = 'ai_community',
  verification_query = 'Find woodworking shops, maker spaces, or woodworking clubs in {town}',
  verification_notes = 'Requires tools and workspace. Home garage, community workshops, maker spaces.'
WHERE name = 'Woodworking';

UPDATE hobbies
SET 
  category = 'activity',
  verification_method = 'database_geographic',
  verification_query = 'Find yacht clubs, marinas, or sailing opportunities near {town}',
  verification_notes = 'Requires coastal or large lake access with racing fleets. Elite clubs or community programs.'
WHERE name = 'Yacht Racing';

UPDATE hobbies
SET 
  category = 'activity',
  verification_method = 'ai_facilities',
  verification_query = 'Find Zumba classes at gyms, studios, or community centers in {town}',
  verification_notes = 'Dance fitness classes. Gyms, studios, rec centers. Can also practice at home with videos.'
WHERE name = 'Zumba';