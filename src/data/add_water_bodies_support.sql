-- Add water bodies support to towns table
-- Allows accurate geographic classification of coastal and waterfront towns

-- 1. Create water bodies lookup table
CREATE TABLE IF NOT EXISTS water_bodies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) CHECK (type IN ('ocean', 'sea', 'gulf', 'bay', 'strait', 'lake', 'river')),
    description TEXT,
    climate_impact TEXT, -- How this water body affects local climate
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert major water bodies
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
    ('Arabian Sea', 'sea', 'Part of Indian Ocean', 'Monsoon influenced, very warm'),
    
    -- Straits
    ('Strait of Gibraltar', 'strait', 'Between Atlantic and Mediterranean', 'Meeting point of two climate systems'),
    ('Bosphorus', 'strait', 'Between Black Sea and Mediterranean', 'Unique microclimate between two seas'),
    
    -- Major Lakes
    ('Lake Geneva', 'lake', 'Large Alpine lake between Switzerland and France', 'Moderates local climate, reduces temperature extremes'),
    ('Lake Como', 'lake', 'Italian Alpine lake', 'Creates mild microclimate in northern Italy'),
    ('Lake Garda', 'lake', 'Largest Italian lake', 'Mediterranean-like microclimate despite northern location'),
    ('Lake Balaton', 'lake', 'Largest lake in Central Europe (Hungary)', 'Moderates continental climate'),
    
    -- Rivers (major ones affecting climate)
    ('Danube River', 'river', 'Major European river', 'Creates river valley microclimates'),
    ('Rhine River', 'river', 'Major European river', 'Moderates temperatures in valley'),
    ('Douro River', 'river', 'Iberian river through wine country', 'Creates unique valley microclimate')
ON CONFLICT (name) DO NOTHING;

-- 3. Add water_bodies array to towns table
ALTER TABLE towns 
ADD COLUMN IF NOT EXISTS water_bodies TEXT[] DEFAULT '{}';

-- 4. Create country-water body mapping for common patterns
CREATE TABLE IF NOT EXISTS country_water_mappings (
    id SERIAL PRIMARY KEY,
    country VARCHAR(100),
    coastal_region VARCHAR(100),
    water_body VARCHAR(100),
    UNIQUE(country, coastal_region, water_body)
);

-- 5. Insert known mappings
INSERT INTO country_water_mappings (country, coastal_region, water_body) VALUES
    -- Portugal
    ('Portugal', 'All', 'Atlantic Ocean'),
    ('Portugal', 'Algarve', 'Atlantic Ocean'),
    
    -- Spain  
    ('Spain', 'Costa del Sol', 'Mediterranean Sea'),
    ('Spain', 'Costa Blanca', 'Mediterranean Sea'),
    ('Spain', 'Costa Brava', 'Mediterranean Sea'),
    ('Spain', 'Balearic Islands', 'Mediterranean Sea'),
    ('Spain', 'Galicia', 'Atlantic Ocean'),
    ('Spain', 'Costa Verde', 'Atlantic Ocean'),
    ('Spain', 'Basque Country', 'Bay of Biscay'),
    
    -- France
    ('France', 'French Riviera', 'Mediterranean Sea'),
    ('France', 'Provence', 'Mediterranean Sea'),
    ('France', 'Brittany', 'Atlantic Ocean'),
    ('France', 'Normandy', 'English Channel'),
    ('France', 'Aquitaine', 'Atlantic Ocean'),
    
    -- Italy
    ('Italy', 'Liguria', 'Mediterranean Sea'),
    ('Italy', 'Tuscany', 'Tyrrhenian Sea'),
    ('Italy', 'Campania', 'Tyrrhenian Sea'),
    ('Italy', 'Sicily', 'Mediterranean Sea'),
    ('Italy', 'Sardinia', 'Mediterranean Sea'),
    ('Italy', 'Veneto', 'Adriatic Sea'),
    ('Italy', 'Puglia', 'Adriatic Sea'),
    
    -- Greece
    ('Greece', 'All', 'Mediterranean Sea'),
    ('Greece', 'Cyclades', 'Aegean Sea'),
    ('Greece', 'Crete', 'Mediterranean Sea'),
    ('Greece', 'Ionian Islands', 'Ionian Sea'),
    
    -- Croatia
    ('Croatia', 'Dalmatia', 'Adriatic Sea'),
    ('Croatia', 'Istria', 'Adriatic Sea'),
    
    -- Turkey
    ('Turkey', 'Mediterranean Coast', 'Mediterranean Sea'),
    ('Turkey', 'Aegean Coast', 'Aegean Sea'),
    ('Turkey', 'Black Sea Coast', 'Black Sea'),
    ('Turkey', 'Istanbul', 'Bosphorus'),
    
    -- Netherlands
    ('Netherlands', 'All', 'North Sea'),
    
    -- Germany
    ('Germany', 'North', 'North Sea'),
    ('Germany', 'Northeast', 'Baltic Sea'),
    
    -- Baltic Countries
    ('Estonia', 'All', 'Baltic Sea'),
    ('Latvia', 'All', 'Baltic Sea'),
    ('Lithuania', 'All', 'Baltic Sea'),
    ('Poland', 'North', 'Baltic Sea'),
    
    -- Americas
    ('Mexico', 'Caribbean Coast', 'Caribbean Sea'),
    ('Mexico', 'Pacific Coast', 'Pacific Ocean'),
    ('Mexico', 'Gulf Coast', 'Gulf of Mexico'),
    ('Costa Rica', 'Caribbean Coast', 'Caribbean Sea'),
    ('Costa Rica', 'Pacific Coast', 'Pacific Ocean'),
    ('Panama', 'Caribbean Coast', 'Caribbean Sea'),
    ('Panama', 'Pacific Coast', 'Pacific Ocean'),
    ('Colombia', 'Caribbean Coast', 'Caribbean Sea'),
    ('Colombia', 'Pacific Coast', 'Pacific Ocean'),
    ('Ecuador', 'All', 'Pacific Ocean'),
    
    -- Southeast Asia
    ('Thailand', 'Andaman Coast', 'Andaman Sea'),
    ('Thailand', 'Gulf Coast', 'Gulf of Thailand'),
    ('Malaysia', 'West Coast', 'Strait of Malacca'),
    ('Malaysia', 'East Coast', 'South China Sea'),
    ('Vietnam', 'All', 'South China Sea')
ON CONFLICT (country, coastal_region, water_body) DO NOTHING;

-- 6. Create function to suggest water bodies based on town info
CREATE OR REPLACE FUNCTION suggest_water_bodies(
    town_name VARCHAR,
    town_country VARCHAR,
    town_description TEXT,
    town_geographic_features TEXT
)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
    suggested_bodies TEXT[] := '{}';
    desc_lower TEXT;
    features_lower TEXT;
BEGIN
    desc_lower := LOWER(COALESCE(town_description, ''));
    features_lower := LOWER(COALESCE(town_geographic_features, ''));
    
    -- Check for coastal indication
    IF features_lower LIKE '%coast%' OR desc_lower LIKE '%coast%' OR 
       features_lower LIKE '%beach%' OR desc_lower LIKE '%beach%' OR
       features_lower LIKE '%sea%' OR desc_lower LIKE '%sea%' OR
       features_lower LIKE '%ocean%' OR desc_lower LIKE '%ocean%' THEN
        
        -- Get water bodies for this country
        SELECT ARRAY_AGG(DISTINCT water_body)
        INTO suggested_bodies
        FROM country_water_mappings
        WHERE country = town_country;
        
        -- If no country mapping, try to detect from description
        IF array_length(suggested_bodies, 1) IS NULL THEN
            -- Mediterranean detection
            IF desc_lower LIKE '%mediterranean%' THEN
                suggested_bodies := array_append(suggested_bodies, 'Mediterranean Sea');
            END IF;
            
            -- Atlantic detection  
            IF desc_lower LIKE '%atlantic%' THEN
                suggested_bodies := array_append(suggested_bodies, 'Atlantic Ocean');
            END IF;
            
            -- Caribbean detection
            IF desc_lower LIKE '%caribbean%' THEN
                suggested_bodies := array_append(suggested_bodies, 'Caribbean Sea');
            END IF;
            
            -- Baltic detection
            IF desc_lower LIKE '%baltic%' THEN
                suggested_bodies := array_append(suggested_bodies, 'Baltic Sea');
            END IF;
            
            -- Adriatic detection
            IF desc_lower LIKE '%adriatic%' THEN
                suggested_bodies := array_append(suggested_bodies, 'Adriatic Sea');
            END IF;
        END IF;
    END IF;
    
    -- Check for specific lake mentions
    IF desc_lower LIKE '%lake%' OR features_lower LIKE '%lake%' THEN
        IF desc_lower LIKE '%geneva%' THEN
            suggested_bodies := array_append(suggested_bodies, 'Lake Geneva');
        END IF;
        IF desc_lower LIKE '%como%' THEN
            suggested_bodies := array_append(suggested_bodies, 'Lake Como');
        END IF;
        IF desc_lower LIKE '%garda%' THEN
            suggested_bodies := array_append(suggested_bodies, 'Lake Garda');
        END IF;
    END IF;
    
    RETURN suggested_bodies;
END;
$$;

-- 7. Update existing towns with suggested water bodies
-- This provides a starting point, but should be reviewed and corrected
UPDATE towns 
SET water_bodies = suggest_water_bodies(name, country, description, geographic_features)
WHERE (geographic_features LIKE '%coast%' OR 
       description LIKE '%coast%' OR 
       description LIKE '%beach%' OR
       description LIKE '%sea%' OR
       description LIKE '%ocean%' OR
       description LIKE '%lake%')
AND (water_bodies IS NULL OR array_length(water_bodies, 1) = 0);

-- 8. Specific updates for known coastal towns
-- Portugal
UPDATE towns SET water_bodies = ARRAY['Atlantic Ocean'] 
WHERE country = 'Portugal' AND name IN ('Lisbon', 'Porto', 'Cascais', 'Lagos', 'Albufeira', 'Faro', 'Tavira', 'Vilamoura');

-- Spain Mediterranean
UPDATE towns SET water_bodies = ARRAY['Mediterranean Sea'] 
WHERE country = 'Spain' AND name IN ('Barcelona', 'Valencia', 'Alicante', 'Málaga', 'Marbella', 'Torremolinos', 'Benidorm', 'Palma de Mallorca', 'Ibiza');

-- Spain Atlantic
UPDATE towns SET water_bodies = ARRAY['Atlantic Ocean'] 
WHERE country = 'Spain' AND name IN ('Santander', 'A Coruña', 'Vigo', 'Cádiz');

-- France Mediterranean
UPDATE towns SET water_bodies = ARRAY['Mediterranean Sea'] 
WHERE country = 'France' AND name IN ('Nice', 'Cannes', 'Marseille', 'Montpellier', 'Antibes', 'Saint-Tropez');

-- Italy
UPDATE towns SET water_bodies = ARRAY['Mediterranean Sea', 'Tyrrhenian Sea'] 
WHERE country = 'Italy' AND name IN ('Rome', 'Naples', 'Sorrento', 'Positano');

UPDATE towns SET water_bodies = ARRAY['Mediterranean Sea', 'Adriatic Sea'] 
WHERE country = 'Italy' AND name IN ('Venice', 'Bari', 'Rimini');

-- Greece
UPDATE towns SET water_bodies = ARRAY['Mediterranean Sea', 'Aegean Sea'] 
WHERE country = 'Greece' AND name IN ('Athens', 'Mykonos', 'Santorini', 'Rhodes');

-- Netherlands
UPDATE towns SET water_bodies = ARRAY['North Sea'] 
WHERE country = 'Netherlands' AND name IN ('Amsterdam', 'The Hague', 'Rotterdam') AND geographic_features LIKE '%coast%';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_towns_water_bodies ON towns USING GIN(water_bodies);

-- 9. Show sample results
SELECT name, country, geographic_features, water_bodies 
FROM towns 
WHERE array_length(water_bodies, 1) > 0
ORDER BY country, name
LIMIT 20;