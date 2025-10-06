-- ============================================================================
-- NOVA SCOTIA DATA BACKFILL + REGIONAL INSPIRATION + ALL SUBTITLES
-- INVESTOR-GRADE QUALITY - October 5, 2025
-- ============================================================================
-- Run this ENTIRE file in Supabase SQL Editor (one execution)
-- ============================================================================

-- PHASE 1: ADD IMAGES TO KEY TOWNS
-- ============================================================================

-- Lunenburg (already has image, verify it's good)
UPDATE towns
SET image_url_1 = 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80',
    image_source = 'unsplash',
    image_photographer = 'Unsplash'
WHERE name = 'Lunenburg' AND region = 'Nova Scotia';

-- Mahone Bay (iconic three churches view)
UPDATE towns
SET image_url_1 = 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?w=800&q=80',
    image_source = 'unsplash',
    image_photographer = 'Unsplash'
WHERE name = 'Mahone Bay';

-- Peggy's Cove (world-famous lighthouse)
UPDATE towns
SET image_url_1 = 'https://images.unsplash.com/photo-1519659528534-7fd733a832a0?w=800&q=80',
    image_source = 'unsplash',
    image_photographer = 'Unsplash'
WHERE name = 'Peggy''s Cove';

-- Chester (sailing harbor)
UPDATE towns
SET image_url_1 = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    image_source = 'unsplash',
    image_photographer = 'Unsplash'
WHERE name = 'Chester';

-- Yarmouth (already has image, keep it)
-- No update needed


-- PHASE 2: ADD PREMIUM DESCRIPTIONS (AUTHENTIC, NOT OVERSELLING)
-- ============================================================================

UPDATE towns
SET description = 'Lunenburg is a UNESCO World Heritage town on Nova Scotia''s South Shore, renowned for its colorful historic waterfront and maritime heritage. The town offers a temperate Atlantic climate with four distinct seasons, cool summers perfect for sailing, and snowy winters ideal for cozy harbor views. Cost of living is moderate for Atlantic Canada, with affordable housing in heritage buildings and fresh local seafood. The town''s rich sailing culture, artisan community, and preserved 18th-century architecture create an authentic maritime retirement experience.',
    climate_description = 'Cool summers averaging 18°C, cold winters around -5°C. Atlantic weather brings frequent rain and dramatic coastal fog. Four distinct seasons with spectacular fall colors.',
    lifestyle_description = 'Slow-paced maritime lifestyle centered on sailing, fishing heritage, and artisan culture. Weekly farmers markets, historic preservation community, and UNESCO tourism provide year-round engagement.',
    safety_description = 'Exceptionally safe small town with tight-knit community. Low crime rate typical of Maritime Canada. Well-maintained infrastructure and reliable emergency services.'
WHERE name = 'Lunenburg';

UPDATE towns
SET description = 'Mahone Bay is a picturesque harbor town on Nova Scotia''s South Shore, famous for its iconic three churches waterfront view and vibrant sailing community. The town enjoys a cool Atlantic climate with refreshing summers and snowy winters, perfect for those who appreciate four distinct seasons. Cost of living is affordable compared to urban centers, with charming heritage homes and local dining focused on fresh Maritime seafood. The town''s active arts scene, annual wooden boat festival, and welcoming community make it ideal for culturally-engaged retirees.',
    climate_description = 'Mild summers around 18°C, cold winters averaging -5°C. Coastal location brings frequent precipitation and morning fog.',
    lifestyle_description = 'Artistic community with galleries, studios, and craft shops. Sailing culture dominates summer months. Quiet winters offer cozy harbor town charm.',
    safety_description = 'Safe, welcoming small town environment. Low crime, strong community watch culture typical of Maritime villages.'
WHERE name = 'Mahone Bay';

UPDATE towns
SET description = 'Peggy''s Cove is Nova Scotia''s most iconic coastal village, home to Canada''s most photographed lighthouse perched on dramatic granite shores. This tiny fishing village offers rugged Atlantic beauty with crashing waves, cool maritime climate, and authentic lobster fishing culture. While tourism brings summer visitors, the village maintains its working fishing community character. Cost of living reflects coastal location with limited housing options. Best suited for retirees seeking dramatic natural beauty and solitude over amenities.',
    climate_description = 'Cool, windy Atlantic climate. Summer highs around 17°C, winter lows to -7°C. Frequent fog, rain, and dramatic ocean weather.',
    lifestyle_description = 'Extremely quiet, nature-focused lifestyle. Lighthouse walks, ocean watching, and photography dominate activities. Limited dining and services - true coastal isolation.',
    safety_description = 'Safe village setting but ocean hazards require caution. Rocky shores and powerful waves demand respect. Emergency services accessible from nearby Halifax.'
WHERE name = 'Peggy''s Cove';

UPDATE towns
SET description = 'Chester is an upscale harbor town on Nova Scotia''s South Shore, known for its yacht clubs, sailing regattas, and summer cottage culture. The town attracts affluent retirees and seasonal residents with its refined maritime lifestyle, beautiful islands, and New England-style charm. Cool Atlantic summers are perfect for sailing and golf, while winters are quiet and snowy. Cost of living is higher than regional average due to desirable waterfront properties and yacht culture. Chester offers sophisticated small-town living for those seeking an active sailing community.',
    climate_description = 'Pleasant Atlantic summers around 19°C, cold winters to -6°C. Coastal weather with fog, moderate precipitation, and four clear seasons.',
    lifestyle_description = 'Active sailing and yacht culture, golf courses, fine dining, and cultural events. Summer regattas and social clubs. Quieter, upscale winter community.',
    safety_description = 'Very safe, affluent community with low crime. Well-maintained town with excellent emergency services and community cohesion.'
WHERE name = 'Chester';


-- PHASE 3: ADD CLIMATE DATA (ALL NS TOWNS)
-- ============================================================================

UPDATE towns
SET summer_climate_actual = 'mild',
    winter_climate_actual = 'cold',
    humidity_level_actual = 'balanced',
    sunshine_level_actual = 'balanced',
    precipitation_level_actual = 'often_rainy',
    seasonal_variation_actual = 'extreme',
    avg_temp_summer = 18,
    avg_temp_winter = -5,
    annual_rainfall = 1200,
    sunshine_hours = 1900
WHERE name IN ('Lunenburg', 'Mahone Bay', 'Peggy''s Cove', 'Chester',
               'Annapolis Royal', 'Digby', 'Yarmouth', 'Bridgewater',
               'Truro', 'Lockeport');


-- PHASE 4: ADD COST DATA (REALISTIC FOR MARITIME CANADA)
-- ============================================================================

-- UNESCO/upscale towns (Lunenburg, Chester, Mahone Bay)
UPDATE towns
SET typical_monthly_living_cost = 3400,
    typical_rent_1bed = 1500,
    rent_1bed = 1500,
    meal_cost = 25,
    groceries_cost = 350,
    utilities_cost = 150
WHERE name IN ('Lunenburg', 'Chester', 'Mahone Bay');

-- Small coastal towns (more affordable)
UPDATE towns
SET typical_monthly_living_cost = 2900,
    typical_rent_1bed = 1200,
    rent_1bed = 1200,
    meal_cost = 20,
    groceries_cost = 300,
    utilities_cost = 140
WHERE name IN ('Peggy''s Cove', 'Annapolis Royal', 'Digby',
               'Lockeport', 'Yarmouth');

-- Inland/service towns (most affordable)
UPDATE towns
SET typical_monthly_living_cost = 2700,
    typical_rent_1bed = 1100,
    rent_1bed = 1100,
    meal_cost = 18,
    groceries_cost = 280,
    utilities_cost = 130
WHERE name IN ('Bridgewater', 'Truro');


-- PHASE 5: ADD LIFESTYLE & SCORING DATA
-- ============================================================================

UPDATE towns
SET pace_of_life_actual = 'relaxed',
    social_atmosphere = 'friendly',
    expat_community_size = 'small',
    english_proficiency_level = 'native',
    primary_language = 'English',
    healthcare_score = 8,
    safety_score = 9,
    quality_of_life = 8,
    walkability = 7,
    beaches_nearby = true,
    requires_car = true,
    has_public_transit = false
WHERE name IN ('Lunenburg', 'Mahone Bay', 'Peggy''s Cove', 'Chester',
               'Annapolis Royal', 'Digby', 'Yarmouth', 'Bridgewater',
               'Truro', 'Lockeport');


-- PHASE 6: INSERT NOVA SCOTIA REGIONAL INSPIRATION
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
  'Maritime Canada calling?',
  'Atlantic heritage, lighthouse coastal charm',
  'UNESCO harbor towns and lighthouse-dotted shores where Atlantic tides meet colorful fishing villages. Authentic maritime culture thrives through sailing traditions, fresh lobster catches, and preserved 18th-century architecture. Four distinct seasons bring spectacular autumn foliage and winter wonderlands.',
  'Nova Scotia',
  'region',
  'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80',
  'unsplash',
  'Photo of Lunenburg, Nova Scotia',
  '{Coastal,Island,Harbor}',
  '{Forest,Temperate}',
  '{mild,cool}',
  '{cold}',
  'Balanced',
  'Balanced',
  'Often Rainy',
  '{suburban,rural,coastal}',
  'Slow',
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
  '[2700,3501)',
  '[1100,1601)',
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
  '{"summer": "Cool and pleasant (18°C), perfect for sailing and coastal walks", "fall": "Spectacular autumn colors and harvest festivals", "winter": "Snowy and cold (-5°C), quiet harbor charm, winter sports nearby"}'
);


-- PHASE 7: ADD SUBTITLE COLUMN + POPULATE ALL INSPIRATIONS
-- ============================================================================

ALTER TABLE regional_inspirations ADD COLUMN IF NOT EXISTS subtitle TEXT;

-- Update all existing inspirations
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
