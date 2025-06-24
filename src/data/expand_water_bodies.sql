-- Expand water bodies to include lakes, rivers, and other important water features

-- 1. Add more water bodies to the lookup table
INSERT INTO water_bodies (name, type, description, climate_impact) VALUES
    -- Major European Lakes
    ('IJsselmeer', 'lake', 'Large lake in Netherlands, former sea', 'Moderates temperature, major recreation area'),
    ('Lake Geneva', 'lake', 'Large Alpine lake between Switzerland and France', 'Moderates local climate, reduces temperature extremes'),
    ('Lake Como', 'lake', 'Italian Alpine lake', 'Creates mild microclimate in northern Italy'),
    ('Lake Garda', 'lake', 'Largest Italian lake', 'Mediterranean-like microclimate despite northern location'),
    ('Lake Maggiore', 'lake', 'Alpine lake between Italy and Switzerland', 'Moderates climate, tourist destination'),
    ('Lake Constance', 'lake', 'Large lake bordering Germany, Switzerland, Austria', 'Moderates regional climate'),
    ('Lake Balaton', 'lake', 'Largest lake in Central Europe (Hungary)', 'Moderates continental climate'),
    ('Lake Bled', 'lake', 'Alpine lake in Slovenia', 'Tourist destination with mild microclimate'),
    
    -- Major Rivers (navigable/significant)
    ('Rhine River', 'river', 'Major European river through Switzerland, Germany, Netherlands', 'River valley microclimate'),
    ('Danube River', 'river', 'Europe''s second longest river', 'Creates river valley microclimates'),
    ('Seine River', 'river', 'Major French river through Paris', 'Urban river environment'),
    ('Thames River', 'river', 'Major English river through London', 'Tidal river affecting local climate'),
    ('Douro River', 'river', 'Iberian river through wine country', 'Creates unique valley microclimate'),
    ('Tagus River', 'river', 'Longest river in Iberian Peninsula', 'Major river through Lisbon'),
    ('Guadalquivir River', 'river', 'Major river in southern Spain', 'Navigable to Seville'),
    ('Po River', 'river', 'Longest river in Italy', 'Creates Po Valley climate'),
    ('Rhône River', 'river', 'Major French river to Mediterranean', 'Valley climate effects'),
    
    -- Special Water Features
    ('Venetian Lagoon', 'bay', 'Lagoon surrounding Venice', 'Unique water-based urban environment'),
    ('Amsterdam Canals', 'river', 'Historic canal system', 'Urban water network'),
    ('English Channel', 'strait', 'Between England and France', 'Maritime climate influence'),
    ('Strait of Gibraltar', 'strait', 'Between Atlantic and Mediterranean', 'Meeting point of two climate systems'),
    ('Bosphorus', 'strait', 'Between Black Sea and Mediterranean', 'Unique microclimate between two seas'),
    
    -- More Seas/Gulfs
    ('Gulf of Thailand', 'gulf', 'Part of South China Sea', 'Tropical monsoon climate'),
    ('Strait of Malacca', 'strait', 'Between Malaysia and Indonesia', 'Major shipping route, tropical climate'),
    ('Gulf of Naples', 'gulf', 'Bay in Tyrrhenian Sea', 'Protected Mediterranean climate'),
    ('Gulf of Lion', 'gulf', 'Mediterranean gulf off French coast', 'Mistral wind influence')
ON CONFLICT (name) DO NOTHING;

-- 2. Expanded detection function
CREATE OR REPLACE FUNCTION detect_water_bodies_comprehensive(
    town_name TEXT,
    town_country TEXT,
    town_description TEXT
)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
    detected_bodies TEXT[] := '{}';
    desc_lower TEXT;
    name_lower TEXT;
BEGIN
    desc_lower := LOWER(COALESCE(town_description, ''));
    name_lower := LOWER(COALESCE(town_name, ''));
    
    -- Existing sea/ocean detection
    IF desc_lower LIKE '%mediterranean%' THEN
        detected_bodies := array_append(detected_bodies, 'Mediterranean Sea');
    END IF;
    
    IF desc_lower LIKE '%atlantic%' THEN
        detected_bodies := array_append(detected_bodies, 'Atlantic Ocean');
    END IF;
    
    IF desc_lower LIKE '%caribbean%' THEN
        detected_bodies := array_append(detected_bodies, 'Caribbean Sea');
    END IF;
    
    IF desc_lower LIKE '%baltic%' THEN
        detected_bodies := array_append(detected_bodies, 'Baltic Sea');
    END IF;
    
    IF desc_lower LIKE '%adriatic%' THEN
        detected_bodies := array_append(detected_bodies, 'Adriatic Sea');
    END IF;
    
    IF desc_lower LIKE '%aegean%' THEN
        detected_bodies := array_append(detected_bodies, 'Aegean Sea');
    END IF;
    
    IF desc_lower LIKE '%north sea%' THEN
        detected_bodies := array_append(detected_bodies, 'North Sea');
    END IF;
    
    IF desc_lower LIKE '%pacific%' THEN
        detected_bodies := array_append(detected_bodies, 'Pacific Ocean');
    END IF;
    
    IF desc_lower LIKE '%black sea%' THEN
        detected_bodies := array_append(detected_bodies, 'Black Sea');
    END IF;
    
    -- Lake detection
    IF desc_lower LIKE '%lake geneva%' OR desc_lower LIKE '%lac léman%' THEN
        detected_bodies := array_append(detected_bodies, 'Lake Geneva');
    END IF;
    
    IF desc_lower LIKE '%lake como%' OR desc_lower LIKE '%lago di como%' THEN
        detected_bodies := array_append(detected_bodies, 'Lake Como');
    END IF;
    
    IF desc_lower LIKE '%lake garda%' OR desc_lower LIKE '%lago di garda%' THEN
        detected_bodies := array_append(detected_bodies, 'Lake Garda');
    END IF;
    
    IF desc_lower LIKE '%ijsselmeer%' OR desc_lower LIKE '%ijssel%' THEN
        detected_bodies := array_append(detected_bodies, 'IJsselmeer');
    END IF;
    
    IF desc_lower LIKE '%balaton%' THEN
        detected_bodies := array_append(detected_bodies, 'Lake Balaton');
    END IF;
    
    -- River detection
    IF desc_lower LIKE '%rhine%' OR desc_lower LIKE '%rijn%' OR desc_lower LIKE '%rhein%' THEN
        detected_bodies := array_append(detected_bodies, 'Rhine River');
    END IF;
    
    IF desc_lower LIKE '%danube%' OR desc_lower LIKE '%donau%' THEN
        detected_bodies := array_append(detected_bodies, 'Danube River');
    END IF;
    
    IF desc_lower LIKE '%seine%' THEN
        detected_bodies := array_append(detected_bodies, 'Seine River');
    END IF;
    
    IF desc_lower LIKE '%thames%' THEN
        detected_bodies := array_append(detected_bodies, 'Thames River');
    END IF;
    
    IF desc_lower LIKE '%douro%' OR desc_lower LIKE '%duero%' THEN
        detected_bodies := array_append(detected_bodies, 'Douro River');
    END IF;
    
    IF desc_lower LIKE '%tagus%' OR desc_lower LIKE '%tajo%' OR desc_lower LIKE '%tejo%' THEN
        detected_bodies := array_append(detected_bodies, 'Tagus River');
    END IF;
    
    -- Special features
    IF name_lower = 'venice' OR desc_lower LIKE '%venetian lagoon%' THEN
        detected_bodies := array_append(detected_bodies, 'Venetian Lagoon');
    END IF;
    
    IF name_lower = 'amsterdam' AND desc_lower LIKE '%canal%' THEN
        detected_bodies := array_append(detected_bodies, 'Amsterdam Canals');
    END IF;
    
    RETURN detected_bodies;
END;
$$;

-- 3. Re-run detection with comprehensive function
UPDATE towns 
SET water_bodies = detect_water_bodies_comprehensive(name, country, description)
WHERE water_bodies IS NULL OR array_length(water_bodies, 1) = 0;

-- 4. Specific updates for towns we know
-- Netherlands water towns
UPDATE towns SET water_bodies = ARRAY['IJsselmeer'] 
WHERE country = 'Netherlands' AND name IN ('Lemmer', 'Enkhuizen', 'Hoorn', 'Volendam', 'Marken', 'Urk');

UPDATE towns SET water_bodies = ARRAY['Rhine River', 'Amsterdam Canals'] 
WHERE country = 'Netherlands' AND name = 'Amsterdam';

UPDATE towns SET water_bodies = ARRAY['Rhine River'] 
WHERE country = 'Netherlands' AND name IN ('Rotterdam', 'Utrecht', 'Arnhem', 'Nijmegen');

-- Swiss lake towns
UPDATE towns SET water_bodies = ARRAY['Lake Geneva'] 
WHERE country = 'Switzerland' AND name IN ('Geneva', 'Lausanne', 'Montreux', 'Vevey');

UPDATE towns SET water_bodies = ARRAY['Lake Constance'] 
WHERE country = 'Switzerland' AND name IN ('St. Gallen', 'Kreuzlingen');

-- Italian lake towns
UPDATE towns SET water_bodies = ARRAY['Lake Como'] 
WHERE country = 'Italy' AND name IN ('Como', 'Bellagio', 'Lecco');

UPDATE towns SET water_bodies = ARRAY['Lake Garda'] 
WHERE country = 'Italy' AND name IN ('Sirmione', 'Desenzano del Garda', 'Riva del Garda');

UPDATE towns SET water_bodies = ARRAY['Lake Maggiore'] 
WHERE country = 'Italy' AND name IN ('Stresa', 'Verbania');

-- River cities
UPDATE towns SET water_bodies = ARRAY['Danube River'] 
WHERE name IN ('Vienna', 'Budapest', 'Bratislava', 'Belgrade');

UPDATE towns SET water_bodies = ARRAY['Rhine River'] 
WHERE country = 'Germany' AND name IN ('Cologne', 'Düsseldorf', 'Mainz', 'Bonn', 'Basel');

UPDATE towns SET water_bodies = ARRAY['Seine River'] 
WHERE country = 'France' AND name IN ('Paris', 'Rouen', 'Le Havre');

UPDATE towns SET water_bodies = ARRAY['Thames River'] 
WHERE country = 'United Kingdom' AND name IN ('London', 'Oxford', 'Reading', 'Windsor');

UPDATE towns SET water_bodies = ARRAY['Tagus River', 'Atlantic Ocean'] 
WHERE country = 'Portugal' AND name = 'Lisbon';

UPDATE towns SET water_bodies = ARRAY['Douro River', 'Atlantic Ocean'] 
WHERE country = 'Portugal' AND name = 'Porto';

UPDATE towns SET water_bodies = ARRAY['Guadalquivir River'] 
WHERE country = 'Spain' AND name IN ('Seville', 'Córdoba');

-- Additional coastal updates
UPDATE towns SET water_bodies = array_append(water_bodies, 'Atlantic Ocean')
WHERE country = 'Portugal' AND 
      (description LIKE '%coast%' OR description LIKE '%beach%' OR description LIKE '%ocean%') AND
      NOT ('Atlantic Ocean' = ANY(COALESCE(water_bodies, '{}')));

-- 5. Update towns that mention water/harbor/port but aren't caught yet
UPDATE towns 
SET water_bodies = detect_water_bodies_comprehensive(name, country, description)
WHERE (description LIKE '%water%' OR 
       description LIKE '%harbor%' OR 
       description LIKE '%harbour%' OR
       description LIKE '%port%' OR
       description LIKE '%marina%' OR
       description LIKE '%boat%' OR
       description LIKE '%yacht%' OR
       description LIKE '%sail%' OR
       description LIKE '%waterfront%' OR
       description LIKE '%riverside%' OR
       description LIKE '%lakeside%' OR
       description LIKE '%canal%')
AND (water_bodies IS NULL OR array_length(water_bodies, 1) = 0);

-- 6. Show comprehensive results
SELECT 
    COUNT(*) as total_towns,
    COUNT(CASE WHEN array_length(water_bodies, 1) > 0 THEN 1 END) as water_towns,
    COUNT(CASE WHEN 'Mediterranean Sea' = ANY(water_bodies) THEN 1 END) as mediterranean_towns,
    COUNT(CASE WHEN 'Atlantic Ocean' = ANY(water_bodies) THEN 1 END) as atlantic_towns,
    COUNT(CASE WHEN 'Baltic Sea' = ANY(water_bodies) THEN 1 END) as baltic_towns,
    COUNT(CASE WHEN EXISTS (
        SELECT 1 FROM unnest(water_bodies) wb 
        WHERE wb LIKE '%Lake%' OR wb = 'IJsselmeer'
    ) THEN 1 END) as lake_towns,
    COUNT(CASE WHEN EXISTS (
        SELECT 1 FROM unnest(water_bodies) wb 
        WHERE wb LIKE '%River%'
    ) THEN 1 END) as river_towns
FROM towns;

-- 7. Show variety of water body types
SELECT DISTINCT unnest(water_bodies) as water_body, COUNT(*) as town_count
FROM towns
WHERE water_bodies IS NOT NULL AND array_length(water_bodies, 1) > 0
GROUP BY water_body
ORDER BY town_count DESC;

-- 8. Show sample including Lemmer and other water towns
SELECT name, country, water_bodies, 
       CASE WHEN description LIKE '%boat%' THEN 'Boating mentioned' ELSE '' END as notes
FROM towns 
WHERE array_length(water_bodies, 1) > 0
   OR name IN ('Lemmer', 'Venice', 'Amsterdam', 'Bruges', 'Geneva')
ORDER BY country, name
LIMIT 50;