-- Safe update script that checks what exists before creating

-- 1. Drop the existing trigger (since it already exists)
DROP TRIGGER IF EXISTS set_town_regions ON towns;

-- 2. Ensure regions table exists with all regions
-- This will add any missing regions without duplicating existing ones
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

-- 3. Ensure all country-region mappings exist
-- Using INSERT ... ON CONFLICT to avoid duplicates
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
    ('Croatia', (SELECT id FROM regions WHERE name = 'Schengen'), false),
    
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

-- 4. Recreate the function (CREATE OR REPLACE is safe)
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

-- 5. Update ALL towns with their regions (even if some already have them)
UPDATE towns 
SET regions = get_country_regions(country);

-- 6. Recreate the trigger
CREATE TRIGGER set_town_regions
BEFORE INSERT OR UPDATE OF country ON towns
FOR EACH ROW
EXECUTE FUNCTION update_town_regions();

-- 7. Show results
SELECT 
    COUNT(*) as total_towns,
    COUNT(CASE WHEN array_length(regions, 1) > 0 THEN 1 END) as towns_with_regions,
    COUNT(CASE WHEN array_length(regions, 1) IS NULL OR array_length(regions, 1) = 0 THEN 1 END) as towns_without_regions
FROM towns;

-- 8. Show sample of towns with their regions
SELECT name, country, regions 
FROM towns 
WHERE array_length(regions, 1) > 0
ORDER BY country, name
LIMIT 20;