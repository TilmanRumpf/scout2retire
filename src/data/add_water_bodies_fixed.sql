-- Add water bodies support to towns table - FIXED VERSION
-- Works with your actual table structure

-- 1. First, add the water_bodies column to towns table
ALTER TABLE towns 
ADD COLUMN IF NOT EXISTS water_bodies TEXT[] DEFAULT '{}';

-- 2. Create water bodies lookup table
CREATE TABLE IF NOT EXISTS water_bodies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) CHECK (type IN ('ocean', 'sea', 'gulf', 'bay', 'strait', 'lake', 'river')),
    description TEXT,
    climate_impact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insert major water bodies
INSERT INTO water_bodies (name, type, description, climate_impact) VALUES
    -- Oceans
    ('Atlantic Ocean', 'ocean', 'Second-largest ocean, borders Europe, Africa, and Americas', 'Moderates temperatures, brings moisture, can cause storms'),
    ('Pacific Ocean', 'ocean', 'Largest ocean, borders Asia, Oceania, and Americas', 'Varies by region - from tropical to temperate'),
    ('Indian Ocean', 'ocean', 'Third-largest ocean, borders Africa, Asia, and Australia', 'Warm waters, monsoon influence'),
    
    -- Major Seas - Europe/Mediterranean
    ('Mediterranean Sea', 'sea', 'Enclosed sea between Europe, Africa, and Asia', 'Hot dry summers, mild wet winters, very stable climate'),
    ('Adriatic Sea', 'sea', 'Part of Mediterranean between Italy and Balkans', 'Mediterranean climate with some continental influence'),
    ('Aegean Sea', 'sea', 'Part of Mediterranean between Greece and Turkey', 'Classic Mediterranean climate, many islands'),
    ('Tyrrhenian Sea', 'sea', 'Part of Mediterranean west of Italy', 'Mediterranean climate, protected by surrounding land'),
    ('Ionian Sea', 'sea', 'Part of Mediterranean between Italy and Greece', 'Mediterranean climate with occasional storms'),
    ('Black Sea', 'sea', 'Inland sea between Europe and Asia', 'More continental climate, cooler than Mediterranean'),
    ('Baltic Sea', 'sea', 'Northern European sea', 'Cold winters, mild summers, less saline'),
    ('North Sea', 'sea', 'Between Britain and continental Europe', 'Maritime climate, storms, moderate temperatures'),
    ('Bay of Biscay', 'bay', 'Part of Atlantic between France and Spain', 'Atlantic climate, can be rough, moderate temperatures'),
    
    -- Major Seas - Americas
    ('Caribbean Sea', 'sea', 'Tropical sea between North and South America', 'Tropical climate, hurricane risk, warm year-round'),
    ('Gulf of Mexico', 'gulf', 'Large gulf of Atlantic Ocean', 'Warm waters, hurricane risk, humid climate'),
    
    -- Major Seas - Asia
    ('South China Sea', 'sea', 'Pacific marginal sea south of China', 'Tropical to subtropical, monsoon influenced'),
    ('Andaman Sea', 'sea', 'Marginal sea of Indian Ocean', 'Tropical monsoon climate'),
    ('Arabian Sea', 'sea', 'Part of Indian Ocean', 'Monsoon influenced, very warm')
ON CONFLICT (name) DO NOTHING;

-- 4. Create simplified function to detect water bodies from description
CREATE OR REPLACE FUNCTION detect_water_bodies_from_text(
    town_description TEXT
)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
    detected_bodies TEXT[] := '{}';
    desc_lower TEXT;
BEGIN
    desc_lower := LOWER(COALESCE(town_description, ''));
    
    -- Mediterranean detection
    IF desc_lower LIKE '%mediterranean%' THEN
        detected_bodies := array_append(detected_bodies, 'Mediterranean Sea');
    END IF;
    
    -- Atlantic detection  
    IF desc_lower LIKE '%atlantic%' THEN
        detected_bodies := array_append(detected_bodies, 'Atlantic Ocean');
    END IF;
    
    -- Caribbean detection
    IF desc_lower LIKE '%caribbean%' THEN
        detected_bodies := array_append(detected_bodies, 'Caribbean Sea');
    END IF;
    
    -- Baltic detection
    IF desc_lower LIKE '%baltic%' THEN
        detected_bodies := array_append(detected_bodies, 'Baltic Sea');
    END IF;
    
    -- Adriatic detection
    IF desc_lower LIKE '%adriatic%' THEN
        detected_bodies := array_append(detected_bodies, 'Adriatic Sea');
    END IF;
    
    -- Aegean detection
    IF desc_lower LIKE '%aegean%' THEN
        detected_bodies := array_append(detected_bodies, 'Aegean Sea');
    END IF;
    
    -- North Sea detection
    IF desc_lower LIKE '%north sea%' THEN
        detected_bodies := array_append(detected_bodies, 'North Sea');
    END IF;
    
    -- Pacific detection
    IF desc_lower LIKE '%pacific%' THEN
        detected_bodies := array_append(detected_bodies, 'Pacific Ocean');
    END IF;
    
    RETURN detected_bodies;
END;
$$;

-- 5. Update towns with detected water bodies from descriptions
UPDATE towns 
SET water_bodies = detect_water_bodies_from_text(description)
WHERE (description LIKE '%coast%' OR 
       description LIKE '%beach%' OR
       description LIKE '%sea%' OR
       description LIKE '%ocean%' OR
       description LIKE '%waterfront%' OR
       description LIKE '%harbor%' OR
       description LIKE '%port%')
AND (water_bodies IS NULL OR array_length(water_bodies, 1) = 0);

-- 6. Specific manual updates for known coastal towns
-- Portugal (Atlantic)
UPDATE towns SET water_bodies = ARRAY['Atlantic Ocean'] 
WHERE country = 'Portugal' AND name IN ('Lisbon', 'Porto', 'Cascais', 'Lagos', 'Albufeira', 'Faro', 'Tavira', 'Vilamoura', 'Sintra', 'Coimbra');

-- Spain Mediterranean
UPDATE towns SET water_bodies = ARRAY['Mediterranean Sea'] 
WHERE country = 'Spain' AND name IN ('Barcelona', 'Valencia', 'Alicante', 'Málaga', 'Marbella', 'Torremolinos', 'Benidorm', 'Palma de Mallorca', 'Ibiza', 'Tarragona', 'Sitges');

-- Spain Atlantic/Bay of Biscay
UPDATE towns SET water_bodies = ARRAY['Atlantic Ocean'] 
WHERE country = 'Spain' AND name IN ('A Coruña', 'Vigo', 'Cádiz');

UPDATE towns SET water_bodies = ARRAY['Bay of Biscay'] 
WHERE country = 'Spain' AND name IN ('Santander', 'Bilbao', 'San Sebastián');

-- France Mediterranean
UPDATE towns SET water_bodies = ARRAY['Mediterranean Sea'] 
WHERE country = 'France' AND name IN ('Nice', 'Cannes', 'Marseille', 'Montpellier', 'Antibes', 'Saint-Tropez', 'Toulon');

-- France Atlantic
UPDATE towns SET water_bodies = ARRAY['Atlantic Ocean'] 
WHERE country = 'France' AND name IN ('Biarritz', 'La Rochelle', 'Bordeaux', 'Nantes');

-- Italy seas
UPDATE towns SET water_bodies = ARRAY['Mediterranean Sea', 'Tyrrhenian Sea'] 
WHERE country = 'Italy' AND name IN ('Rome', 'Naples', 'Sorrento', 'Positano', 'Amalfi', 'Salerno');

UPDATE towns SET water_bodies = ARRAY['Mediterranean Sea', 'Adriatic Sea'] 
WHERE country = 'Italy' AND name IN ('Venice', 'Bari', 'Rimini', 'Ancona', 'Trieste');

UPDATE towns SET water_bodies = ARRAY['Mediterranean Sea'] 
WHERE country = 'Italy' AND name IN ('Palermo', 'Catania', 'Cagliari');

-- Greece
UPDATE towns SET water_bodies = ARRAY['Mediterranean Sea', 'Aegean Sea'] 
WHERE country = 'Greece' AND name IN ('Athens', 'Mykonos', 'Santorini', 'Rhodes', 'Thessaloniki');

UPDATE towns SET water_bodies = ARRAY['Mediterranean Sea', 'Ionian Sea'] 
WHERE country = 'Greece' AND name IN ('Corfu', 'Kefalonia', 'Zakynthos');

-- Croatia
UPDATE towns SET water_bodies = ARRAY['Mediterranean Sea', 'Adriatic Sea'] 
WHERE country = 'Croatia' AND name IN ('Split', 'Dubrovnik', 'Zagreb', 'Rijeka', 'Pula', 'Zadar', 'Rovinj');

-- Turkey
UPDATE towns SET water_bodies = ARRAY['Mediterranean Sea'] 
WHERE country = 'Turkey' AND name IN ('Antalya', 'Alanya', 'Bodrum', 'Marmaris', 'Fethiye');

UPDATE towns SET water_bodies = ARRAY['Black Sea', 'Mediterranean Sea'] 
WHERE country = 'Turkey' AND name = 'Istanbul';

-- Malta & Cyprus
UPDATE towns SET water_bodies = ARRAY['Mediterranean Sea'] 
WHERE country IN ('Malta', 'Cyprus');

-- Netherlands
UPDATE towns SET water_bodies = ARRAY['North Sea'] 
WHERE country = 'Netherlands' AND name IN ('Amsterdam', 'The Hague', 'Rotterdam');

-- Baltic countries
UPDATE towns SET water_bodies = ARRAY['Baltic Sea'] 
WHERE country IN ('Estonia', 'Latvia', 'Lithuania') AND name IN ('Tallinn', 'Riga', 'Vilnius', 'Klaipeda', 'Pärnu', 'Jurmala');

-- Mexico
UPDATE towns SET water_bodies = ARRAY['Pacific Ocean'] 
WHERE country = 'Mexico' AND name IN ('Puerto Vallarta', 'Mazatlán', 'Cabo San Lucas', 'La Paz', 'Ensenada');

UPDATE towns SET water_bodies = ARRAY['Caribbean Sea'] 
WHERE country = 'Mexico' AND name IN ('Cancún', 'Playa del Carmen', 'Tulum', 'Cozumel');

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_towns_water_bodies ON towns USING GIN(water_bodies);

-- 7. Show results
SELECT 
    COUNT(*) as total_towns,
    COUNT(CASE WHEN array_length(water_bodies, 1) > 0 THEN 1 END) as coastal_towns
FROM towns;

-- 8. Show sample of coastal towns
SELECT name, country, water_bodies 
FROM towns 
WHERE array_length(water_bodies, 1) > 0
ORDER BY country, name
LIMIT 30;