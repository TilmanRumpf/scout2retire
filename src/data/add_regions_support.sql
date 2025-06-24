-- Add comprehensive regions support to towns table
-- Allows towns to be associated with multiple regions (e.g., France is both European and Mediterranean)

-- 1. Create regions lookup table
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    type VARCHAR(50) CHECK (type IN ('continent', 'cultural', 'geographic', 'economic')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert standard regions
INSERT INTO regions (name, type, description) VALUES
    -- Continents
    ('Europe', 'continent', 'European continent including EU and non-EU countries'),
    ('North America', 'continent', 'USA, Canada, and Mexico'),
    ('Central America', 'continent', 'Countries between Mexico and South America'),
    ('South America', 'continent', 'South American continent'),
    ('Asia', 'continent', 'Asian continent'),
    ('Africa', 'continent', 'African continent'),
    ('Oceania', 'continent', 'Australia, New Zealand, and Pacific islands'),
    
    -- Cultural/Geographic regions
    ('Mediterranean', 'cultural', 'Countries around the Mediterranean Sea'),
    ('Caribbean', 'geographic', 'Caribbean islands and coastal areas'),
    ('Iberian Peninsula', 'geographic', 'Spain and Portugal'),
    ('Scandinavia', 'cultural', 'Nordic countries'),
    ('Baltic', 'geographic', 'Countries around the Baltic Sea'),
    ('Balkans', 'geographic', 'Balkan peninsula countries'),
    ('Alpine', 'geographic', 'Countries with Alpine regions'),
    ('Southeast Asia', 'geographic', 'ASEAN and neighboring countries'),
    ('Middle East', 'cultural', 'Middle Eastern countries'),
    ('Maghreb', 'cultural', 'North African countries'),
    
    -- Economic regions
    ('EU', 'economic', 'European Union member states'),
    ('Schengen', 'economic', 'Schengen Area countries'),
    ('ASEAN', 'economic', 'Association of Southeast Asian Nations')
ON CONFLICT (name) DO NOTHING;

-- 3. Create country-regions mapping table (many-to-many)
CREATE TABLE IF NOT EXISTS country_regions (
    id SERIAL PRIMARY KEY,
    country VARCHAR(100) NOT NULL,
    region_id INTEGER REFERENCES regions(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false, -- Primary region association
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country, region_id)
);

-- 4. Insert country-region mappings
INSERT INTO country_regions (country, region_id, is_primary) 
SELECT country, region_id, is_primary FROM (
    VALUES
    -- Portugal
    ('Portugal', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Portugal', (SELECT id FROM regions WHERE name = 'Iberian Peninsula'), false),
    ('Portugal', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('Portugal', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- Spain
    ('Spain', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Spain', (SELECT id FROM regions WHERE name = 'Mediterranean'), false),
    ('Spain', (SELECT id FROM regions WHERE name = 'Iberian Peninsula'), false),
    ('Spain', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('Spain', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- France
    ('France', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('France', (SELECT id FROM regions WHERE name = 'Mediterranean'), false),
    ('France', (SELECT id FROM regions WHERE name = 'Alpine'), false),
    ('France', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('France', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- Italy
    ('Italy', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Italy', (SELECT id FROM regions WHERE name = 'Mediterranean'), false),
    ('Italy', (SELECT id FROM regions WHERE name = 'Alpine'), false),
    ('Italy', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('Italy', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- Greece
    ('Greece', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Greece', (SELECT id FROM regions WHERE name = 'Mediterranean'), false),
    ('Greece', (SELECT id FROM regions WHERE name = 'Balkans'), false),
    ('Greece', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('Greece', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- Netherlands
    ('Netherlands', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Netherlands', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('Netherlands', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- Germany
    ('Germany', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Germany', (SELECT id FROM regions WHERE name = 'Alpine'), false),
    ('Germany', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('Germany', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- Croatia
    ('Croatia', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Croatia', (SELECT id FROM regions WHERE name = 'Mediterranean'), false),
    ('Croatia', (SELECT id FROM regions WHERE name = 'Balkans'), false),
    ('Croatia', (SELECT id FROM regions WHERE name = 'EU'), false),
    
    -- Turkey
    ('Turkey', (SELECT id FROM regions WHERE name = 'Europe'), false),
    ('Turkey', (SELECT id FROM regions WHERE name = 'Asia'), true),
    ('Turkey', (SELECT id FROM regions WHERE name = 'Mediterranean'), false),
    ('Turkey', (SELECT id FROM regions WHERE name = 'Middle East'), false),
    
    -- Mexico
    ('Mexico', (SELECT id FROM regions WHERE name = 'North America'), true),
    
    -- Costa Rica
    ('Costa Rica', (SELECT id FROM regions WHERE name = 'Central America'), true),
    
    -- Panama
    ('Panama', (SELECT id FROM regions WHERE name = 'Central America'), true),
    
    -- Ecuador
    ('Ecuador', (SELECT id FROM regions WHERE name = 'South America'), true),
    
    -- Colombia
    ('Colombia', (SELECT id FROM regions WHERE name = 'South America'), true),
    ('Colombia', (SELECT id FROM regions WHERE name = 'Caribbean'), false),
    
    -- Thailand
    ('Thailand', (SELECT id FROM regions WHERE name = 'Asia'), true),
    ('Thailand', (SELECT id FROM regions WHERE name = 'Southeast Asia'), false),
    ('Thailand', (SELECT id FROM regions WHERE name = 'ASEAN'), false),
    
    -- Malaysia
    ('Malaysia', (SELECT id FROM regions WHERE name = 'Asia'), true),
    ('Malaysia', (SELECT id FROM regions WHERE name = 'Southeast Asia'), false),
    ('Malaysia', (SELECT id FROM regions WHERE name = 'ASEAN'), false),
    
    -- Vietnam
    ('Vietnam', (SELECT id FROM regions WHERE name = 'Asia'), true),
    ('Vietnam', (SELECT id FROM regions WHERE name = 'Southeast Asia'), false),
    ('Vietnam', (SELECT id FROM regions WHERE name = 'ASEAN'), false),
    
    -- Malta
    ('Malta', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Malta', (SELECT id FROM regions WHERE name = 'Mediterranean'), false),
    ('Malta', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('Malta', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- Cyprus
    ('Cyprus', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Cyprus', (SELECT id FROM regions WHERE name = 'Mediterranean'), false),
    ('Cyprus', (SELECT id FROM regions WHERE name = 'EU'), false),
    
    -- Slovenia
    ('Slovenia', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Slovenia', (SELECT id FROM regions WHERE name = 'Alpine'), false),
    ('Slovenia', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('Slovenia', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- Latvia
    ('Latvia', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Latvia', (SELECT id FROM regions WHERE name = 'Baltic'), false),
    ('Latvia', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('Latvia', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- Estonia
    ('Estonia', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Estonia', (SELECT id FROM regions WHERE name = 'Baltic'), false),
    ('Estonia', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('Estonia', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- Lithuania
    ('Lithuania', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Lithuania', (SELECT id FROM regions WHERE name = 'Baltic'), false),
    ('Lithuania', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('Lithuania', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- Poland
    ('Poland', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Poland', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('Poland', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- Czech Republic
    ('Czech Republic', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Czech Republic', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('Czech Republic', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- Hungary
    ('Hungary', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Hungary', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('Hungary', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- Austria
    ('Austria', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Austria', (SELECT id FROM regions WHERE name = 'Alpine'), false),
    ('Austria', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('Austria', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- Switzerland
    ('Switzerland', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Switzerland', (SELECT id FROM regions WHERE name = 'Alpine'), false),
    ('Switzerland', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
    -- Belgium
    ('Belgium', (SELECT id FROM regions WHERE name = 'Europe'), true),
    ('Belgium', (SELECT id FROM regions WHERE name = 'EU'), false),
    ('Belgium', (SELECT id FROM regions WHERE name = 'Schengen'), false)
) AS mappings(country, region_id, is_primary)
WHERE region_id IS NOT NULL
ON CONFLICT (country, region_id) DO NOTHING;

-- 5. Add regions array to towns table
ALTER TABLE towns 
ADD COLUMN IF NOT EXISTS regions TEXT[] DEFAULT '{}';

-- 6. Create function to get regions for a country
CREATE OR REPLACE FUNCTION get_country_regions(country_name VARCHAR)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
    region_names TEXT[];
BEGIN
    SELECT ARRAY_AGG(r.name ORDER BY cr.is_primary DESC, r.name)
    INTO region_names
    FROM country_regions cr
    JOIN regions r ON cr.region_id = r.id
    WHERE cr.country = country_name;
    
    RETURN COALESCE(region_names, '{}');
END;
$$;

-- 7. Update existing towns with their regions
UPDATE towns 
SET regions = get_country_regions(country)
WHERE regions = '{}' OR regions IS NULL;

-- 8. Create trigger to automatically set regions for new towns
CREATE OR REPLACE FUNCTION update_town_regions()
RETURNS TRIGGER AS $$
BEGIN
    NEW.regions := get_country_regions(NEW.country);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_town_regions
BEFORE INSERT OR UPDATE OF country ON towns
FOR EACH ROW
EXECUTE FUNCTION update_town_regions();

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_towns_regions ON towns USING GIN(regions);
CREATE INDEX IF NOT EXISTS idx_country_regions_country ON country_regions(country);
CREATE INDEX IF NOT EXISTS idx_country_regions_region_id ON country_regions(region_id);

-- 10. Create helper function to find towns by region
CREATE OR REPLACE FUNCTION get_towns_by_region(region_name VARCHAR, max_towns INTEGER DEFAULT 100)
RETURNS TABLE (
    id VARCHAR,
    name VARCHAR,
    country VARCHAR,
    regions TEXT[],
    cost_index INTEGER,
    healthcare_score INTEGER,
    safety_score INTEGER,
    image_url_1 TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.country,
        t.regions,
        t.cost_index,
        t.healthcare_score,
        t.safety_score,
        t.image_url_1
    FROM towns t
    WHERE region_name = ANY(t.regions)
    ORDER BY t.healthcare_score DESC NULLS LAST, t.safety_score DESC NULLS LAST
    LIMIT max_towns;
END;
$$;

-- Example queries:
-- Find all Mediterranean towns: SELECT * FROM get_towns_by_region('Mediterranean');
-- Find all EU towns: SELECT * FROM get_towns_by_region('EU');
-- Check town regions: SELECT name, country, regions FROM towns WHERE 'Mediterranean' = ANY(regions);