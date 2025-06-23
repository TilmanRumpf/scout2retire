-- Insert curated location images only
-- This assumes the table already exists from the combined migration

-- Clear existing data first (optional - remove this line if you want to keep existing data)
TRUNCATE TABLE curated_location_images;

-- Insert high-quality fallback images
INSERT INTO curated_location_images (
  country, image_url, image_source, description, tags, is_primary, quality_score
) VALUES 
-- Portugal
('Portugal', 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80', 'unsplash', 'Porto riverside with Dom Luis bridge', ARRAY['porto', 'river', 'bridge', 'cityscape', 'historic'], true, 10),
('Portugal', 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80', 'unsplash', 'Porto wine cellars and colorful buildings', ARRAY['porto', 'wine', 'culture', 'architecture'], false, 9),
('Portugal', 'https://images.unsplash.com/photo-1588442007375-baf24b3d32c2?w=1200&q=80', 'unsplash', 'Lisbon yellow tram on historic street', ARRAY['lisbon', 'tram', 'urban', 'transport'], false, 9),

-- Spain  
('Spain', 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1200&q=80', 'unsplash', 'Valencia City of Arts and Sciences', ARRAY['valencia', 'modern', 'architecture', 'culture'], true, 10),
('Spain', 'https://images.unsplash.com/photo-1558642084-fd07fae5282e?w=1200&q=80', 'unsplash', 'Spanish plaza with traditional architecture', ARRAY['plaza', 'traditional', 'urban', 'lifestyle'], false, 9),

-- France
('France', 'https://images.unsplash.com/photo-1584266766915-53036a2c4e3b?w=1200&q=80', 'unsplash', 'Nice Promenade des Anglais', ARRAY['nice', 'riviera', 'coastal', 'beach'], true, 10),
('France', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80', 'unsplash', 'Provence lavender fields', ARRAY['provence', 'rural', 'nature', 'lavender'], false, 9),

-- Italy
('Italy', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80', 'unsplash', 'Lucca historic walls and towers', ARRAY['lucca', 'tuscany', 'historic', 'walls'], true, 10),
('Italy', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&q=80', 'unsplash', 'Venice Grand Canal', ARRAY['venice', 'canal', 'water', 'romantic'], false, 10),

-- Greece
('Greece', 'https://images.unsplash.com/photo-1598037001124-55ddd0f00baf?w=1200&q=80', 'unsplash', 'Crete Balos Lagoon pink sand beach', ARRAY['crete', 'beach', 'island', 'paradise'], true, 10),
('Greece', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80', 'unsplash', 'Santorini white buildings blue domes', ARRAY['santorini', 'island', 'iconic', 'architecture'], false, 10),

-- Turkey
('Turkey', 'https://images.unsplash.com/photo-1593238739364-18cfde30e522?w=1200&q=80', 'unsplash', 'Antalya harbor with mountains', ARRAY['antalya', 'coastal', 'harbor', 'mountains'], true, 10),

-- Mexico
('Mexico', 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=1200&q=80', 'unsplash', 'Playa del Carmen turquoise beach', ARRAY['playa del carmen', 'beach', 'caribbean', 'tropical'], true, 10),
('Mexico', 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1200&q=80', 'unsplash', 'Mexican colonial architecture', ARRAY['colonial', 'architecture', 'culture', 'historic'], false, 9),

-- Costa Rica
('Costa Rica', 'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?w=1200&q=80', 'unsplash', 'Tamarindo beach sunset', ARRAY['tamarindo', 'beach', 'sunset', 'pacific'], true, 10),

-- Panama
('Panama', 'https://images.unsplash.com/photo-1580257521667-116f90abca01?w=1200&q=80', 'unsplash', 'Boquete mountain valley landscape', ARRAY['boquete', 'mountains', 'valley', 'nature'], true, 10),
('Panama', 'https://images.unsplash.com/photo-1558029062-a37889b87526?w=1200&q=80', 'unsplash', 'Panama City modern skyline', ARRAY['panama city', 'skyline', 'urban', 'modern'], false, 9),

-- Ecuador
('Ecuador', 'https://images.unsplash.com/photo-1533600298287-9a3629a89789?w=1200&q=80', 'unsplash', 'Cuenca blue domed cathedral', ARRAY['cuenca', 'cathedral', 'architecture', 'historic'], true, 10),

-- Colombia
('Colombia', 'https://images.unsplash.com/photo-1597531013114-d5e317a08c17?w=1200&q=80', 'unsplash', 'Medellin modern skyline with mountains', ARRAY['medellin', 'skyline', 'mountains', 'modern'], true, 10),
('Colombia', 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1200&q=80', 'unsplash', 'Cartagena colorful colonial streets', ARRAY['cartagena', 'colonial', 'colorful', 'historic'], false, 10),

-- Thailand
('Thailand', 'https://images.unsplash.com/photo-1598981457915-aea220950616?w=1200&q=80', 'unsplash', 'Chiang Mai Doi Suthep temple', ARRAY['chiang mai', 'temple', 'buddhist', 'culture'], true, 10),

-- Malaysia
('Malaysia', 'https://images.unsplash.com/photo-1581622558663-b2e33377dfb2?w=1200&q=80', 'unsplash', 'Penang George Town street art', ARRAY['penang', 'street art', 'culture', 'urban'], true, 10),

-- Vietnam
('Vietnam', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&q=80', 'unsplash', 'Da Nang Dragon Bridge', ARRAY['da nang', 'bridge', 'modern', 'landmark'], true, 10),

-- Netherlands
('Netherlands', 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&q=80', 'unsplash', 'Amsterdam canal houses', ARRAY['amsterdam', 'canals', 'architecture', 'water'], true, 10),

-- Latvia
('Latvia', 'https://images.unsplash.com/photo-1599057463911-0649c7711f85?w=1200&q=80', 'unsplash', 'Riga Art Nouveau architecture', ARRAY['riga', 'art nouveau', 'architecture', 'historic'], true, 10),

-- Slovenia
('Slovenia', 'https://images.unsplash.com/photo-1558271736-cd043ef2e855?w=1200&q=80', 'unsplash', 'Ljubljana castle and river', ARRAY['ljubljana', 'castle', 'river', 'capital'], true, 10),

-- Croatia
('Croatia', 'https://images.unsplash.com/photo-1555990538-1e6e5b3d0b3b?w=1200&q=80', 'unsplash', 'Split waterfront promenade', ARRAY['split', 'waterfront', 'adriatic', 'coastal'], true, 10),

-- Malta
('Malta', 'https://images.unsplash.com/photo-1565071559227-20ab25b7685e?w=1200&q=80', 'unsplash', 'Valletta harbor fortifications', ARRAY['valletta', 'harbor', 'fortifications', 'historic'], true, 10);

-- Verify the inserts
SELECT country, COUNT(*) as image_count 
FROM curated_location_images 
GROUP BY country
ORDER BY country;