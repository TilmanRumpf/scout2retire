-- Insert all regional inspiration data
INSERT INTO regional_inspirations (
  title, description, region_name, region_type, image_url, image_source, image_attribution,
  climate_tags, lifestyle_tags, cost_range, best_months, primary_language, currency_code,
  visa_free_days, healthcare_ranking, safety_index, english_proficiency, timezone,
  flight_connections, expat_community_size, internet_speed_mbps, weather_api_code,
  keywords, unique_selling_points, typical_town_examples, display_order, is_active, seasonal_notes
) VALUES 
-- Portugal
(
  'Harbor towns and seafood?',
  'Historic port cellars age world-famous wines while riverside restaurants serve the Atlantic''s daily catch. Climb medieval streets to viewpoints where the city spreads below in terracotta and blue.',
  'Portugal', 'country', 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80', 'unsplash',
  'Porto''s iconic Dom Luis bridge and port wine cellars',
  ARRAY['mediterranean', 'atlantic', 'mild_winter'],
  ARRAY['coastal', 'wine_country', 'historic', 'walkable'],
  'moderate', ARRAY[4, 5, 6, 9, 10], 'Portuguese', 'EUR', 90, 12, 84, 'moderate', 'WET',
  'excellent', 'large', 100, 'PT',
  ARRAY['port wine', 'azulejos', 'fado', 'seafood', 'beaches'],
  ARRAY['Golden visa program', 'Non-habitual resident tax benefits', 'Year-round mild climate'],
  ARRAY['Porto', 'Lisbon', 'Cascais', 'Tavira'],
  1, true,
  '{"summer": "Warm but not too hot, perfect for beaches", "winter": "Mild and rainy, great for city exploration"}'::jsonb
),
-- Spain
(
  'Authentic Spanish living?',
  'Orange groves surround traditional pueblos where plaza life defines the daily rhythm. Extended family lunches, afternoon siestas, and evening strolls create a lifestyle focused on community and connection.',
  'Spain', 'country', 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80', 'unsplash',
  'Valencia''s City of Arts and Sciences',
  ARRAY['mediterranean', 'continental', 'diverse'],
  ARRAY['rural', 'urban', 'coastal', 'mountain', 'social'],
  'moderate', ARRAY[4, 5, 6, 9, 10], 'Spanish', 'EUR', 90, 7, 83, 'low', 'CET',
  'excellent', 'very_large', 120, 'ES',
  ARRAY['tapas', 'siesta', 'fiesta', 'paella', 'flamenco'],
  ARRAY['World-class healthcare', 'Diverse climate options', 'Rich cultural life'],
  ARRAY['Valencia', 'Alicante', 'Malaga', 'Bilbao'],
  2, true,
  '{"summer": "Hot inland, perfect on the coast", "winter": "Mild Mediterranean, cold inland"}'::jsonb
),
-- France
(
  'French Riviera dreaming?',
  'Medieval hilltop towns offer spectacular vistas where Alps meet azure Mediterranean. Morning markets showcase regional produce while coastal paths connect charming villages perfect for exploration.',
  'France', 'country', 'https://images.unsplash.com/photo-1584266766915-53036a2c4e3b?w=800&q=80', 'unsplash',
  'Nice''s famous Promenade des Anglais',
  ARRAY['mediterranean', 'alpine', 'temperate'],
  ARRAY['luxury', 'cultural', 'gastronomic', 'artistic'],
  'premium', ARRAY[5, 6, 9, 10], 'French', 'EUR', 90, 1, 77, 'moderate', 'CET',
  'excellent', 'large', 140, 'FR',
  ARRAY['wine', 'cheese', 'markets', 'cuisine', 'art'],
  ARRAY['World''s best healthcare', 'Cultural richness', 'Geographic diversity'],
  ARRAY['Nice', 'Bordeaux', 'Paris', 'Saint-Tropez'],
  3, true,
  '{"summer": "Crowded on coast, lovely inland", "winter": "Mild south, skiing in Alps"}'::jsonb
),
-- Italy
(
  'Italian dolce vita?',
  'Rolling hills dotted with cypress trees lead to medieval towns where life unfolds at a perfect pace. Local trattorias serve regional specialties while sunset turns vineyard-covered valleys golden.',
  'Italy', 'country', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80', 'unsplash',
  'Lucca''s famous city walls and towers',
  ARRAY['mediterranean', 'alpine', 'diverse'],
  ARRAY['cultural', 'gastronomic', 'historic', 'artistic'],
  'moderate', ARRAY[4, 5, 6, 9, 10], 'Italian', 'EUR', 90, 2, 74, 'moderate', 'CET',
  'excellent', 'moderate', 90, 'IT',
  ARRAY['pasta', 'wine', 'art', 'history', 'fashion'],
  ARRAY['Elective residency visa', 'Regional diversity', 'UNESCO sites'],
  ARRAY['Lucca', 'Rome', 'Florence', 'Bologna'],
  4, true,
  '{"summer": "Hot and crowded in tourist areas", "winter": "Mild south, cold north"}'::jsonb
),
-- Greece
(
  'Greek island paradise?',
  'Whitewashed villages cascade toward sapphire seas where traditional life continues unchanged. Fresh feta, local wine, and grilled fish define meals shared in tavernas overlooking endless Aegean views.',
  'Greece', 'country', 'https://images.unsplash.com/photo-1598037001124-55ddd0f00baf?w=800&q=80', 'unsplash',
  'Crete''s iconic pink sand beach of Balos',
  ARRAY['mediterranean', 'hot_dry_summer'],
  ARRAY['island', 'beach', 'traditional', 'relaxed'],
  'budget', ARRAY[4, 5, 6, 9, 10], 'Greek', 'EUR', 90, 14, 79, 'good', 'EET',
  'good', 'moderate', 50, 'GR',
  ARRAY['islands', 'mythology', 'olive oil', 'seafood', 'ancient ruins'],
  ARRAY['Golden visa program', 'Island variety', 'Low cost of living'],
  ARRAY['Crete', 'Rhodes', 'Corfu', 'Athens'],
  5, true,
  '{"summer": "Hot and dry, perfect for beaches", "winter": "Mild but can be rainy"}'::jsonb
),
-- Turkey
(
  'Turkish coastal charm?',
  'Ancient harbors meet modern marinas where East meets West in perfect harmony. Enjoy fresh seafood by turquoise waters while exploring a culture that bridges continents with warmth and hospitality.',
  'Turkey', 'country', 'https://images.unsplash.com/photo-1593238739364-18cfde30e522?w=800&q=80', 'unsplash',
  'Antalya''s harbor with mountains',
  ARRAY['mediterranean', 'continental'],
  ARRAY['coastal', 'cultural', 'historic', 'affordable'],
  'budget', ARRAY[4, 5, 6, 9, 10, 11], 'Turkish', 'TRY', 90, 42, 69, 'low', 'TRT',
  'excellent', 'moderate', 80, 'TR',
  ARRAY['bazaar', 'kebab', 'history', 'hospitality', 'value'],
  ARRAY['Very low cost', 'Rich history', 'Excellent healthcare value'],
  ARRAY['Antalya', 'Bodrum', 'Istanbul', 'Izmir'],
  6, true,
  '{"summer": "Hot on coast, perfect for swimming", "winter": "Mild coast, cold inland"}'::jsonb
),
-- Mexico
(
  'Mexican beach life?',
  'Caribbean waters lap white sand beaches while colonial architecture adds historic charm. Fresh ceviche, cold margaritas, and year-round sunshine create the perfect retirement paradise.',
  'Mexico', 'country', 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&q=80', 'unsplash',
  'Playa del Carmen beach and turquoise water',
  ARRAY['tropical', 'desert', 'temperate'],
  ARRAY['beach', 'colonial', 'cultural', 'social'],
  'budget', ARRAY[11, 12, 1, 2, 3, 4], 'Spanish', 'MXN', 180, 61, 46, 'low', 'CST',
  'excellent', 'very_large', 60, 'MX',
  ARRAY['tacos', 'tequila', 'mariachi', 'cenotes', 'mayan'],
  ARRAY['6-month tourist visa', 'Large expat communities', 'Diverse climates'],
  ARRAY['Playa del Carmen', 'San Miguel de Allende', 'Lake Chapala', 'Merida'],
  7, true,
  '{"summer": "Hot and humid on coast, rainy season", "winter": "Perfect weather, high season"}'::jsonb
),
-- Costa Rica
(
  'Costa Rica pura vida?',
  'Rainforest meets ocean where wildlife thrives and expats find their paradise. Sustainable living, fresh tropical fruits, and the famous ''pura vida'' lifestyle await in this Central American gem.',
  'Costa Rica', 'country', 'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?w=800&q=80', 'unsplash',
  'Tamarindo beach sunset',
  ARRAY['tropical', 'rainforest', 'beach'],
  ARRAY['eco-friendly', 'beach', 'mountain', 'wellness'],
  'moderate', ARRAY[12, 1, 2, 3, 4], 'Spanish', 'CRC', 90, 36, 69, 'moderate', 'CST',
  'good', 'large', 40, 'CR',
  ARRAY['biodiversity', 'volcano', 'surfing', 'coffee', 'sloths'],
  ARRAY['No army', 'Renewable energy', 'Pensionado program'],
  ARRAY['Tamarindo', 'San Jose', 'Manuel Antonio', 'Atenas'],
  8, true,
  '{"summer": "Rainy season but still nice", "winter": "Dry season, perfect weather"}'::jsonb
),
-- Panama
(
  'Panama mountain escape?',
  'Cool mountain towns offer spring-like weather year-round with stunning valley views. Coffee plantations, hiking trails, and a thriving expat community create an ideal retirement haven.',
  'Panama', 'country', 'https://images.unsplash.com/photo-1580257521667-116f90abca01?w=800&q=80', 'unsplash',
  'Boquete''s famous volcanic landscape',
  ARRAY['tropical', 'mountain', 'spring-like'],
  ARRAY['mountain', 'coffee', 'hiking', 'expat-friendly'],
  'budget', ARRAY[12, 1, 2, 3, 4], 'Spanish', 'USD', 180, 95, 71, 'moderate', 'EST',
  'excellent', 'large', 50, 'PA',
  ARRAY['canal', 'coffee', 'pensionado', 'biodiversity', 'banking'],
  ARRAY['Uses USD', 'Pensionado visa benefits', 'Tax advantages'],
  ARRAY['Boquete', 'Panama City', 'Coronado', 'El Valle'],
  9, true,
  '{"summer": "Rainy season but cooler in mountains", "winter": "Dry season, ideal weather"}'::jsonb
),
-- Ecuador
(
  'Ecuador colonial charm?',
  'UNESCO World Heritage cities blend indigenous culture with Spanish colonial architecture. Affordable living, perfect climate, and rich cultural experiences define life in the Andes.',
  'Ecuador', 'country', 'https://images.unsplash.com/photo-1533600298287-9a3629a89789?w=800&q=80', 'unsplash',
  'Cuenca''s iconic blue domed cathedral',
  ARRAY['spring-like', 'mountain', 'coastal'],
  ARRAY['colonial', 'cultural', 'affordable', 'walkable'],
  'budget', ARRAY[6, 7, 8, 9, 10, 11], 'Spanish', 'USD', 90, 111, 61, 'low', 'ECT',
  'moderate', 'large', 35, 'EC',
  ARRAY['galapagos', 'andes', 'equator', 'indigenous', 'crafts'],
  ARRAY['Uses USD', 'Year-round spring climate', 'Very low cost'],
  ARRAY['Cuenca', 'Quito', 'Cotacachi', 'Salinas'],
  10, true,
  '{"summer": "Dry season in highlands", "winter": "Rainy season but still pleasant"}'::jsonb
),
-- Colombia
(
  'Colombian renaissance?',
  'Modern cities nestled in eternal spring valleys offer world-class healthcare and vibrant culture. Coffee culture, friendly locals, and dramatic mountain views create an exciting retirement option.',
  'Colombia', 'country', 'https://images.unsplash.com/photo-1597531013114-d5e317a08c17?w=800&q=80', 'unsplash',
  'Medellín''s modern skyline with mountains',
  ARRAY['spring-like', 'tropical', 'diverse'],
  ARRAY['urban', 'cultural', 'modern', 'social'],
  'budget', ARRAY[12, 1, 2, 3, 7, 8], 'Spanish', 'COP', 90, 22, 62, 'low', 'COT',
  'good', 'moderate', 55, 'CO',
  ARRAY['coffee', 'salsa', 'emeralds', 'biodiversity', 'innovation'],
  ARRAY['City of eternal spring', 'Modern infrastructure', 'Cultural renaissance'],
  ARRAY['Medellín', 'Bogotá', 'Cartagena', 'Pereira'],
  11, true,
  '{"summer": "Rainy in some areas", "winter": "Dry season, ideal weather"}'::jsonb
),
-- Thailand
(
  'Thai temple towns?',
  'Ancient temples dot modern cities where street food culture thrives and costs stay low. Buddhist traditions, tropical climate, and world-renowned hospitality make retirement truly special.',
  'Thailand', 'country', 'https://images.unsplash.com/photo-1598981457915-aea220950616?w=800&q=80', 'unsplash',
  'Chiang Mai''s Doi Suthep temple',
  ARRAY['tropical', 'monsoon', 'hot'],
  ARRAY['cultural', 'affordable', 'foodie', 'spiritual'],
  'budget', ARRAY[11, 12, 1, 2], 'Thai', 'THB', 30, 47, 71, 'low', 'ICT',
  'excellent', 'very_large', 100, 'TH',
  ARRAY['temples', 'street food', 'massage', 'islands', 'Buddhism'],
  ARRAY['Elite visa program', 'Medical tourism hub', 'Digital nomad friendly'],
  ARRAY['Chiang Mai', 'Bangkok', 'Phuket', 'Hua Hin'],
  12, true,
  '{"summer": "Hot and rainy season", "winter": "Cool and dry, perfect weather"}'::jsonb
),
-- Malaysia
(
  'Malaysian melting pot?',
  'Colonial architecture meets modern amenities in cities where cultures blend seamlessly. Excellent healthcare, diverse cuisine, and English-speaking environment simplify the transition to expat life.',
  'Malaysia', 'country', 'https://images.unsplash.com/photo-1581622558663-b2e33377dfb2?w=800&q=80', 'unsplash',
  'Penang''s George Town street art',
  ARRAY['tropical', 'humid', 'rain_forest'],
  ARRAY['multicultural', 'urban', 'foodie', 'modern'],
  'budget', ARRAY[1, 2, 3, 6, 7, 8], 'Malay', 'MYR', 90, 49, 73, 'high', 'MYT',
  'excellent', 'large', 90, 'MY',
  ARRAY['food paradise', 'multicultural', 'modern', 'tropical', 'MM2H'],
  ARRAY['MM2H visa program', 'English widely spoken', 'First-world infrastructure'],
  ARRAY['Penang', 'Kuala Lumpur', 'Ipoh', 'Langkawi'],
  13, true,
  '{"summer": "Hot and humid year-round", "winter": "Monsoon season varies by coast"}'::jsonb
),
-- Netherlands
(
  'Dutch waterways and cycling?',
  'Charming canal towns where bicycles outnumber cars and water shapes daily life. Excellent healthcare, progressive culture, and flat landscapes perfect for active retirees seeking European sophistication.',
  'Netherlands', 'country', 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80', 'unsplash',
  'Amsterdam canals iconic view',
  ARRAY['temperate', 'maritime', 'four_seasons'],
  ARRAY['cycling', 'progressive', 'waterfront', 'cultural'],
  'premium', ARRAY[5, 6, 7, 8, 9], 'Dutch', 'EUR', 90, 3, 88, 'excellent', 'CET',
  'excellent', 'moderate', 150, 'NL',
  ARRAY['tulips', 'windmills', 'cheese', 'bikes', 'canals'],
  ARRAY['Everyone speaks English', 'Bike infrastructure', 'Liberal society'],
  ARRAY['Lemmer', 'Amsterdam', 'Utrecht', 'Haarlem'],
  14, true,
  '{"summer": "Mild and perfect for cycling", "winter": "Grey and rainy but cozy"}'::jsonb
),
-- Latvia
(
  'Baltic charm awaits?',
  'Art nouveau architecture meets vibrant cultural life in walkable historic centers. EU membership ensures quality healthcare while costs remain refreshingly low compared to Western Europe.',
  'Latvia', 'country', 'https://images.unsplash.com/photo-1599057463911-0649c7711f85?w=800&q=80', 'unsplash',
  'Riga''s Art Nouveau district',
  ARRAY['temperate', 'four_seasons', 'maritime'],
  ARRAY['cultural', 'historic', 'affordable', 'walkable'],
  'budget', ARRAY[5, 6, 7, 8, 9], 'Latvian', 'EUR', 90, 47, 76, 'good', 'EET',
  'good', 'small', 80, 'LV',
  ARRAY['baltic', 'art nouveau', 'forest', 'amber', 'cultural'],
  ARRAY['EU member', 'Low cost of living', 'Rich cultural scene'],
  ARRAY['Riga', 'Jurmala', 'Sigulda', 'Cesis'],
  15, true,
  '{"summer": "White nights, perfect weather", "winter": "Cold and dark but cozy"}'::jsonb
),
-- Slovenia
(
  'Hidden Alpine gem?',
  'Europe''s best-kept secret combines Mediterranean warmth with Alpine beauty. Pristine nature, excellent healthcare, and a relaxed pace of life in one of Europe''s safest capitals.',
  'Slovenia', 'country', 'https://images.unsplash.com/photo-1558271736-cd043ef2e855?w=800&q=80', 'unsplash',
  'Ljubljana castle and river',
  ARRAY['alpine', 'mediterranean', 'continental'],
  ARRAY['nature', 'safe', 'clean', 'relaxed'],
  'moderate', ARRAY[5, 6, 7, 8, 9], 'Slovenian', 'EUR', 90, 38, 91, 'good', 'CET',
  'moderate', 'small', 70, 'SI',
  ARRAY['caves', 'lakes', 'mountains', 'wine', 'green'],
  ARRAY['Safest country', 'Nature paradise', 'EU member'],
  ARRAY['Ljubljana', 'Bled', 'Piran', 'Maribor'],
  16, true,
  '{"summer": "Warm but not too hot", "winter": "Cold, great for skiing"}'::jsonb
),
-- Croatia
(
  'Adriatic paradise?',
  'Crystal-clear waters meet ancient Roman architecture along dramatic coastlines. EU membership, affordable living, and over 1,000 islands create endless exploration opportunities.',
  'Croatia', 'country', 'https://images.unsplash.com/photo-1555990538-1e6e5b3d0b3b?w=800&q=80', 'unsplash',
  'Split waterfront',
  ARRAY['mediterranean', 'continental'],
  ARRAY['coastal', 'island', 'historic', 'outdoor'],
  'moderate', ARRAY[5, 6, 7, 8, 9], 'Croatian', 'EUR', 90, 58, 78, 'good', 'CET',
  'good', 'moderate', 60, 'HR',
  ARRAY['islands', 'sailing', 'game of thrones', 'seafood', 'history'],
  ARRAY['1000+ islands', 'EU member', 'Stunning coastline'],
  ARRAY['Split', 'Dubrovnik', 'Zagreb', 'Zadar'],
  17, true,
  '{"summer": "Hot and busy on coast", "winter": "Mild coast, cold inland"}'::jsonb
),
-- Vietnam
(
  'Southeast Asian discovery?',
  'Modern cities blend French colonial charm with Vietnamese tradition. Incredible cuisine, warm hospitality, and coastal beauty offer retirement at a fraction of Western costs.',
  'Vietnam', 'country', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80', 'unsplash',
  'Da Nang Dragon Bridge',
  ARRAY['tropical', 'monsoon'],
  ARRAY['affordable', 'foodie', 'beach', 'cultural'],
  'budget', ARRAY[2, 3, 4, 10, 11], 'Vietnamese', 'VND', 15, 47, 68, 'low', 'ICT',
  'good', 'moderate', 60, 'VN',
  ARRAY['pho', 'beaches', 'motorbikes', 'coffee', 'history'],
  ARRAY['Incredible food', 'Very low cost', 'Beautiful beaches'],
  ARRAY['Da Nang', 'Ho Chi Minh City', 'Hanoi', 'Hoi An'],
  18, true,
  '{"summer": "Hot and humid, rainy season", "winter": "Perfect weather in south"}'::jsonb
),
-- Europe (region)
(
  'European variety?',
  'From Mediterranean beaches to Alpine villages, Europe offers endless retirement possibilities. Rich history, excellent healthcare, and diverse cultures create opportunities for every lifestyle.',
  'Europe', 'region', 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80', 'unsplash',
  'European variety',
  ARRAY['diverse', 'temperate', 'mediterranean', 'continental'],
  ARRAY['cultural', 'historic', 'diverse', 'connected'],
  'moderate', ARRAY[5, 6, 7, 8, 9], 'Various', 'EUR', 90, 10, 85, 'varies', 'CET',
  'excellent', 'varies', 100, 'EU',
  ARRAY['diversity', 'culture', 'history', 'trains', 'healthcare'],
  ARRAY['Schengen area', 'Train connections', 'Cultural diversity'],
  ARRAY['All European towns'],
  19, true,
  '{"summer": "Varies by region", "winter": "Varies by region"}'::jsonb
),
-- Central America (region)
(
  'Latin American adventure?',
  'Colonial cities, beach towns, and mountain retreats offer affordable luxury across two continents. Rich cultures, warm climates, and welcoming communities define retirement south of the border.',
  'Central America', 'region', 'https://images.unsplash.com/photo-1512813498716-3e640fed3f39?w=800&q=80', 'unsplash',
  'Central American colonial',
  ARRAY['tropical', 'diverse'],
  ARRAY['colonial', 'beach', 'mountain', 'affordable'],
  'budget', ARRAY[12, 1, 2, 3, 4], 'Spanish', 'Various', 90, 50, 65, 'low', 'CST',
  'good', 'large', 50, 'CA',
  ARRAY['tropical', 'affordable', 'expats', 'beaches', 'mountains'],
  ARRAY['Low cost', 'Expat communities', 'Diverse landscapes'],
  ARRAY['All Central American towns'],
  20, true,
  '{"summer": "Rainy season", "winter": "Dry season"}'::jsonb
);

-- Update town counts after inserting data
UPDATE regional_inspirations ri
SET 
  town_count = (
    SELECT COUNT(*) 
    FROM towns t 
    WHERE t.country = ri.region_name 
       OR t.region = ri.region_name
  ),
  avg_cost_index = (
    SELECT AVG(t.cost_index) 
    FROM towns t 
    WHERE (t.country = ri.region_name OR t.region = ri.region_name)
      AND t.cost_index IS NOT NULL
  ),
  last_town_added = (
    SELECT MAX(t.created_at) 
    FROM towns t 
    WHERE t.country = ri.region_name 
       OR t.region = ri.region_name
  );