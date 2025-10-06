-- ============================================================================
-- NOVA SCOTIA COMPLETE BACKFILL - EXACT HALIFAX PATTERNS
-- Built from 3 reference towns: Halifax, Porto, Cascais
-- INVESTOR-GRADE QUALITY - October 5, 2025
-- ============================================================================

-- PHASE 1: UPDATE ALL NS TOWNS WITH EXACT HALIFAX ARRAY PATTERNS
-- ============================================================================

-- Copy Halifax's exact regions array to all NS towns
UPDATE towns
SET regions = '{Canada,"Atlantic Canada",Maritime,"Atlantic Ocean",Coastal,NATO,Commonwealth,G7,G20,OECD,Anglo-America,"North America"}'
WHERE name IN ('Lunenburg', 'Mahone Bay', 'Peggy''s Cove', 'Chester',
               'Annapolis Royal', 'Digby', 'Yarmouth', 'Bridgewater',
               'Truro', 'Lockeport');

-- Copy Halifax's exact activities_available array (62 items)
UPDATE towns
SET activities_available = '{adventure_activities,architectural_photography,baking,beach_walking,bird_watching,blogging,board_games,boating,book_clubs,cafe_hopping,card_games,chess,coastal_photography,cooking,cooking_experiments,crafts,crossword_puzzles,drawing,fishing_charters,gardening,hiking,historical_tours,home_workouts,indoor_plants,journaling,knitting,landmark_visits,language_learning,meditation,music_listening,nature_excursions,nature_walks,online_courses,online_yoga,outdoor_lifestyle,outdoor_sports,painting,pedestrian_friendly,photography,picnics,podcasts,reading,recipe_collecting,sailing,sailing_lessons,seaside_dining,sewing,sketching,socializing,star_gazing,streaming,stretching,sudoku,trail_photography,video_calls,video_gaming,volunteering,walking,walking_lifestyle,writing,yacht_clubs,yacht_watching}'
WHERE name IN ('Lunenburg', 'Mahone Bay', 'Peggy''s Cove', 'Chester',
               'Annapolis Royal', 'Digby', 'Yarmouth', 'Bridgewater',
               'Truro', 'Lockeport');

-- Copy Halifax's exact interests_supported array (80 items)
UPDATE towns
SET interests_supported = '{arts,beach_lifestyle,coastal_living,coffee_culture,community,cooking,craft_beer,crafts,creative,culinary,cultural,dance,design,digital_nomad,dining,diving,entertainment,entrepreneurship,events,expat_community,family_friendly,fashion,festivals,film,fishing,fitness,four_seasons,gaming,gardening,golf,healthcare,healthy_living,heritage,history,island_hopping,languages,learning,lgbtq_friendly,literature,marine_life,maritime_culture,mindfulness,minimalism,moderate_climate,multicultural,music,networking,nightlife,ocean_sports,outdoor_sports,painting,personal_growth,philosophy,photography,reading,remote_work,safety,sailing,science,seaside_dining,seasonal_activities,shopping,singles_scene,slow_living,social,spirituality,sports_watching,surfing,sustainable_living,swimming,technology,tennis,theater,volunteering,water_sports,wellness,wine,wine_culture,winter_sports,writing}'
WHERE name IN ('Lunenburg', 'Mahone Bay', 'Peggy''s Cove', 'Chester',
               'Annapolis Royal', 'Digby', 'Yarmouth', 'Bridgewater',
               'Truro', 'Lockeport');

-- Set languages_spoken (exact Halifax pattern)
UPDATE towns
SET languages_spoken = '{English}'
WHERE name IN ('Lunenburg', 'Mahone Bay', 'Peggy''s Cove', 'Chester',
               'Annapolis Royal', 'Digby', 'Yarmouth', 'Bridgewater',
               'Truro', 'Lockeport');

-- Set geographic_features_actual and vegetation_type_actual
UPDATE towns
SET geographic_features_actual = '{coastal,harbor}',
    vegetation_type_actual = '{forest}'
WHERE name IN ('Lunenburg', 'Mahone Bay', 'Chester'); -- Harbor towns

UPDATE towns
SET geographic_features_actual = '{coastal,plains}',
    vegetation_type_actual = '{forest}'
WHERE name IN ('Peggy''s Cove', 'Annapolis Royal', 'Digby', 'Yarmouth',
               'Bridgewater', 'Truro', 'Lockeport');


-- PHASE 2: SET CLIMATE DATA (EXACT HALIFAX VALUES)
-- ============================================================================

UPDATE towns
SET summer_climate_actual = 'mild',
    winter_climate_actual = 'cold',
    humidity_level_actual = 'balanced',
    sunshine_level_actual = 'balanced',
    precipitation_level_actual = 'less_dry',  -- Halifax uses 'less_dry', not 'often_rainy'
    seasonal_variation_actual = 'extreme',
    avg_temp_summer = 20,
    avg_temp_winter = -4,
    annual_rainfall = 900,
    sunshine_hours = 2060
WHERE name IN ('Lunenburg', 'Mahone Bay', 'Peggy''s Cove', 'Chester',
               'Annapolis Royal', 'Digby', 'Yarmouth', 'Bridgewater',
               'Truro', 'Lockeport');


-- PHASE 3: SET LIFESTYLE & COMMUNITY DATA
-- ============================================================================

UPDATE towns
SET pace_of_life_actual = 'moderate',  -- Halifax uses 'moderate', not 'relaxed' or 'slow'
    urban_rural_character = 'suburban',
    social_atmosphere = NULL,  -- Halifax has NULL
    expat_community_size = 'small',
    english_proficiency_level = 'native',
    primary_language = 'English',
    retirement_community_presence = 'minimal'
WHERE name IN ('Lunenburg', 'Mahone Bay', 'Peggy''s Cove', 'Chester',
               'Annapolis Royal', 'Digby', 'Yarmouth', 'Bridgewater',
               'Truro', 'Lockeport');


-- PHASE 4: SET SCORES & COSTS
-- ============================================================================

-- UNESCO/Heritage towns (higher costs, similar to Halifax)
UPDATE towns
SET typical_monthly_living_cost = 3200,
    typical_rent_1bed = NULL,  -- Halifax has NULL
    rent_1bed = 1500,
    meal_cost = 25,
    groceries_cost = 350,
    utilities_cost = 130,
    healthcare_score = 8,
    safety_score = 9,
    quality_of_life = 8,
    outdoor_activities_rating = 6,
    cultural_events_rating = 5,
    shopping_rating = 6,
    wellness_rating = 4
WHERE name IN ('Lunenburg', 'Chester', 'Mahone Bay');

-- Small coastal towns (more affordable)
UPDATE towns
SET typical_monthly_living_cost = 2800,
    typical_rent_1bed = NULL,
    rent_1bed = 1200,
    meal_cost = 20,
    groceries_cost = 300,
    utilities_cost = 120,
    healthcare_score = 8,
    safety_score = 9,
    quality_of_life = 8,
    outdoor_activities_rating = 7,
    cultural_events_rating = 3,
    shopping_rating = 4,
    wellness_rating = 3
WHERE name IN ('Peggy''s Cove', 'Annapolis Royal', 'Digby',
               'Lockeport', 'Yarmouth');

-- Inland service towns (most affordable)
UPDATE towns
SET typical_monthly_living_cost = 2600,
    typical_rent_1bed = NULL,
    rent_1bed = 1100,
    meal_cost = 18,
    groceries_cost = 280,
    utilities_cost = 110,
    healthcare_score = 7,
    safety_score = 8,
    quality_of_life = 7,
    outdoor_activities_rating = 5,
    cultural_events_rating = 4,
    shopping_rating = 5,
    wellness_rating = 3
WHERE name IN ('Bridgewater', 'Truro');


-- PHASE 5: SET INFRASTRUCTURE & AMENITIES
-- ============================================================================

UPDATE towns
SET walkability = 7,
    beaches_nearby = true,
    requires_car = true,
    has_public_transit = false,
    internet_speed = 100,
    healthcare_specialties_available = '{cardiology,oncology,orthopedics,"general surgery"}',
    hospital_count = 0,  -- Regional hospitals in Halifax
    healthcare_cost = 340,
    english_speaking_doctors = true,
    retirement_visa_available = true,
    visa_requirements = '"90-day visa-free for US citizens, retirement visa available with $2,000/month income"'
WHERE name IN ('Lunenburg', 'Mahone Bay', 'Peggy''s Cove', 'Chester',
               'Annapolis Royal', 'Digby', 'Yarmouth', 'Bridgewater',
               'Truro', 'Lockeport');


-- PHASE 6: SET WATER BODIES (Town-specific)
-- ============================================================================

UPDATE towns SET water_bodies = '{"Atlantic Ocean","Lunenburg Bay"}' WHERE name = 'Lunenburg';
UPDATE towns SET water_bodies = '{"Atlantic Ocean","Mahone Bay"}' WHERE name = 'Mahone Bay';
UPDATE towns SET water_bodies = '{"Atlantic Ocean","St. Margarets Bay"}' WHERE name = 'Peggy''s Cove';
UPDATE towns SET water_bodies = '{"Atlantic Ocean","Mahone Bay"}' WHERE name = 'Chester';
UPDATE towns SET water_bodies = '{"Atlantic Ocean","Annapolis Basin"}' WHERE name = 'Annapolis Royal';
UPDATE towns SET water_bodies = '{"Atlantic Ocean","Annapolis Basin"}' WHERE name = 'Digby';
UPDATE towns SET water_bodies = '{"Atlantic Ocean","Yarmouth Harbour"}' WHERE name = 'Yarmouth';
UPDATE towns SET water_bodies = '{"LaHave River"}' WHERE name = 'Bridgewater';
UPDATE towns SET water_bodies = '{"Bay of Fundy","Cobequid Bay"}' WHERE name = 'Truro';
UPDATE towns SET water_bodies = '{"Atlantic Ocean"}' WHERE name = 'Lockeport';


-- PHASE 7: ADD IMAGES & DESCRIPTIONS (From earlier work)
-- ============================================================================

UPDATE towns
SET image_url_1 = 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80',
    image_source = 'unsplash',
    description = 'Lunenburg is a UNESCO World Heritage town on Nova Scotia''s South Shore, renowned for its colorful historic waterfront and maritime heritage. The town offers a temperate Atlantic climate with four distinct seasons, cool summers perfect for sailing, and snowy winters ideal for cozy harbor views. Cost of living is moderate for Atlantic Canada, with affordable housing in heritage buildings and fresh local seafood. The town''s rich sailing culture, artisan community, and preserved 18th-century architecture create an authentic maritime retirement experience.'
WHERE name = 'Lunenburg';

UPDATE towns
SET image_url_1 = 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?w=800&q=80',
    image_source = 'unsplash',
    description = 'Mahone Bay is a picturesque harbor town on Nova Scotia''s South Shore, famous for its iconic three churches waterfront view and vibrant sailing community. The town enjoys a cool Atlantic climate with refreshing summers and snowy winters, perfect for those who appreciate four distinct seasons. Cost of living is affordable compared to urban centers, with charming heritage homes and local dining focused on fresh Maritime seafood. The town''s active arts scene, annual wooden boat festival, and welcoming community make it ideal for culturally-engaged retirees.'
WHERE name = 'Mahone Bay';

UPDATE towns
SET image_url_1 = 'https://images.unsplash.com/photo-1519659528534-7fd733a832a0?w=800&q=80',
    image_source = 'unsplash',
    description = 'Peggy''s Cove is Nova Scotia''s most iconic coastal village, home to Canada''s most photographed lighthouse perched on dramatic granite shores. This tiny fishing village offers rugged Atlantic beauty with crashing waves, cool maritime climate, and authentic lobster fishing culture. While tourism brings summer visitors, the village maintains its working fishing community character. Cost of living reflects coastal location with limited housing options. Best suited for retirees seeking dramatic natural beauty and solitude over amenities.'
WHERE name = 'Peggy''s Cove';

UPDATE towns
SET image_url_1 = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    image_source = 'unsplash',
    description = 'Chester is an upscale harbor town on Nova Scotia''s South Shore, known for its yacht clubs, sailing regattas, and summer cottage culture. The town attracts affluent retirees and seasonal residents with its refined maritime lifestyle, beautiful islands, and New England-style charm. Cool Atlantic summers are perfect for sailing and golf, while winters are quiet and snowy. Cost of living is higher than regional average due to desirable waterfront properties and yacht culture. Chester offers sophisticated small-town living for those seeking an active sailing community.'
WHERE name = 'Chester';


-- PHASE 8: ADD SUBTITLE COLUMN FIRST
-- ============================================================================

ALTER TABLE regional_inspirations ADD COLUMN IF NOT EXISTS subtitle TEXT;


-- PHASE 9: INSERT NOVA SCOTIA REGIONAL INSPIRATION
-- ============================================================================

INSERT INTO regional_inspirations (
  title,
  subtitle,
  description,
  region_name,
  region_type,
  image_url,
  image_source,
  image_attribution,
  geographic_features,
  vegetation_types,
  summer_climate,
  winter_climate,
  humidity,
  sunshine,
  precipitation,
  living_environments,
  pace_of_life,
  social_preference,
  expat_community_size,
  language_preference,
  primary_language,
  english_proficiency,
  healthcare_quality,
  healthcare_ranking,
  safety_quality,
  safety_index,
  visa_process,
  visa_free_days,
  cost_category,
  monthly_budget_range,
  typical_rent_range,
  local_mobility,
  regional_mobility,
  flight_connections,
  currency_code,
  timezone,
  best_months,
  internet_speed_mbps,
  keywords,
  unique_selling_points,
  typical_town_examples,
  display_order,
  is_active,
  seasonal_notes
) VALUES (
  'Nova Scotia heritage?',
  'UNESCO towns, lighthouse-dotted Atlantic shores',
  'UNESCO harbor towns and lighthouse-dotted shores where Atlantic tides meet colorful fishing villages. Authentic maritime culture thrives through sailing traditions, fresh lobster catches, and preserved 18th-century architecture. Four distinct seasons bring spectacular autumn foliage and winter wonderlands.',
  'Nova Scotia',
  'region',
  'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80',
  'unsplash',
  'Photo of Lunenburg, Nova Scotia',
  '{Coastal,Harbor,Island}',
  '{Forest,Temperate}',
  '{mild,cool}',
  '{cold}',
  'Balanced',
  'Balanced',
  'Less Dry',
  '{suburban,rural,coastal}',
  'Moderate',
  'Balanced',
  'small',
  'english_only',
  'English',
  'excellent',
  'good',
  14,
  'good',
  87,
  'good',
  180,
  'moderate',
  '[2600,3201)',
  '[1100,1501)',
  '{need_car,walk_bike}',
  '{bus_network}',
  'regional_airport',
  'CAD',
  'AST',
  '{6,7,8,9,10}',
  100,
  '{nova_scotia,maritime,atlantic,heritage,sailing,unesco,coastal,lighthouse,authentic,affordable}',
  '{"UNESCO World Heritage sites","100% English-speaking","Close to US Northeast","Authentic maritime culture","Four distinct seasons","Safe small-town living"}',
  '{Halifax,Lunenburg,"Mahone Bay","Peggy''s Cove",Chester}',
  18,
  true,
  '{"summer": "Cool and pleasant (20°C), perfect for sailing and coastal walks", "fall": "Spectacular autumn colors and harvest festivals", "winter": "Snowy and cold (-4°C), quiet harbor charm, winter sports nearby"}'
);


-- PHASE 10: POPULATE SUBTITLES FOR ALL INSPIRATIONS
-- ============================================================================

-- Update all existing inspirations (including NS which was just inserted)
UPDATE regional_inspirations SET subtitle = 'Mediterranean glamour meets Alpine charm' WHERE title = 'French Riviera dreaming?';
UPDATE regional_inspirations SET subtitle = 'Rainforest paradise, Pacific Ocean bliss' WHERE title = 'Costa Rica pura vida?';
UPDATE regional_inspirations SET subtitle = 'Adriatic azure, ancient Roman elegance' WHERE title = 'Croatian coastline calling?';
UPDATE regional_inspirations SET subtitle = 'Tropical fusion, English-speaking modernity' WHERE title = 'Malaysian melting pot?';
UPDATE regional_inspirations SET subtitle = 'Caribbean sun, colonial culture blend' WHERE title = 'Mexican beach life?';
UPDATE regional_inspirations SET subtitle = 'Atlantic islands, eternal spring weather' WHERE title = 'Portuguese lifestyle ';
UPDATE regional_inspirations SET subtitle = 'Buddhist serenity, tropical street food' WHERE title = 'Thai temple towns?';
UPDATE regional_inspirations SET subtitle = 'Andean peaks, Spanish colonial heritage' WHERE title = 'Ecuador colonial charm?';
UPDATE regional_inspirations SET subtitle = 'Eternal spring, vibrant mountain cities' WHERE title = 'Colombian renaissance?';
UPDATE regional_inspirations SET subtitle = 'Aegean blue, whitewashed village dreams' WHERE title = 'Greek island paradise?';
UPDATE regional_inspirations SET subtitle = 'Canal towns, bicycle-friendly flat landscapes' WHERE title = 'Dutch waterways and cycling?';
UPDATE regional_inspirations SET subtitle = 'East meets West, Mediterranean sunshine' WHERE title = 'Turkish coastal charm?';
UPDATE regional_inspirations SET subtitle = 'Atlantic port wine, riverside terracotta' WHERE title = 'Harbor towns and seafood?';
UPDATE regional_inspirations SET subtitle = 'Plaza life, siesta culture rhythm' WHERE title = 'Authentic Spanish living?';
UPDATE regional_inspirations SET subtitle = 'Pristine mountain peaks, clockwork precision' WHERE title = 'Swiss alpine villages?';
UPDATE regional_inspirations SET subtitle = 'Tuscan hills, vineyard-covered golden valleys' WHERE title = 'Italian dolce vita?';
UPDATE regional_inspirations SET subtitle = 'Coffee highlands, spring-like year-round climate' WHERE title = 'Panama mountain escape?';
-- Nova Scotia subtitle already set in INSERT above


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check Nova Scotia towns are ready
SELECT
  name,
  CASE WHEN image_url_1 IS NOT NULL AND image_url_1 != '' THEN '✅' ELSE '❌' END as image,
  CASE WHEN description IS NOT NULL THEN '✅' ELSE '❌' END as desc,
  CASE WHEN summer_climate_actual IS NOT NULL THEN '✅' ELSE '❌' END as climate,
  CASE WHEN regions IS NOT NULL THEN '✅' ELSE '❌' END as regions_arr,
  typical_monthly_living_cost as cost
FROM towns
WHERE region = 'Nova Scotia'
ORDER BY name;

-- Check Nova Scotia inspiration exists
SELECT title, subtitle, region_name, display_order
FROM regional_inspirations
WHERE region_name = 'Nova Scotia';

-- Check all subtitles populated
SELECT title, subtitle
FROM regional_inspirations
WHERE is_active = true
ORDER BY display_order;
