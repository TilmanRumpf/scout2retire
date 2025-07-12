-- Batch Town Import for Scout2Retire
-- Run this script in Supabase SQL Editor
-- It uses INSERT ... WHERE NOT EXISTS to prevent duplicates

-- First, check current town count
SELECT COUNT(*) as current_count, 'BEFORE IMPORT' as status FROM towns;

-- Insert towns in batches, checking for existence
-- Albania
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Sarandë', 'Albania', 'Vlorë', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Sarandë' AND country = 'Albania');

-- American Samoa
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Pago Pago', 'American Samoa', 'Tutuila', ARRAY['Oceania', 'Oceania'], 'Tropical climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Pago Pago' AND country = 'American Samoa');

-- Antigua & Barbuda
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Saint John''s', 'Antigua and Barbuda', 'Saint John', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Saint John''s' AND country = 'Antigua and Barbuda');

-- Argentina
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Bariloche', 'Argentina', 'Río Negro', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Bariloche' AND country = 'Argentina');

INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Buenos Aires', 'Argentina', 'Buenos Aires', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Buenos Aires' AND country = 'Argentina');

INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Mendoza', 'Argentina', 'Mendoza', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Mendoza' AND country = 'Argentina');

-- Aruba
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Oranjestad', 'Aruba', 'Aruba', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Oranjestad' AND country = 'Aruba');

-- Australia (all towns)
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Sydney', 'Australia', 'New South Wales', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Sydney' AND country = 'Australia');

INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Adelaide', 'Australia', 'South Australia', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Adelaide' AND country = 'Australia');

INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Canberra', 'Australia', 'Australian Capital Territory', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Canberra' AND country = 'Australia');

INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Sunshine Coast', 'Australia', 'Queensland', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Sunshine Coast' AND country = 'Australia');

INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Coffs Harbour', 'Australia', 'New South Wales', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Coffs Harbour' AND country = 'Australia');

INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Gold Coast', 'Australia', 'Queensland', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Gold Coast' AND country = 'Australia');

INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Hervey Bay', 'Australia', 'Queensland', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Hervey Bay' AND country = 'Australia');

INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Hobart', 'Australia', 'Tasmania', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Hobart' AND country = 'Australia');

INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Melbourne', 'Australia', 'Victoria', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Melbourne' AND country = 'Australia');

INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Newcastle (Aus)', 'Australia', 'New South Wales', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Newcastle (Aus)' AND country = 'Australia');

INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Perth', 'Australia', 'Western Australia', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Perth' AND country = 'Australia');

INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Port Macquarie', 'Australia', 'New South Wales', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Port Macquarie' AND country = 'Australia');

INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Victor Harbor', 'Australia', 'South Australia', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Victor Harbor' AND country = 'Australia');

-- Continue with more countries...
-- This is a partial list. The full script would include all 320 missing towns.

-- After import, show results
SELECT COUNT(*) as final_count, 'AFTER IMPORT' as status FROM towns;
SELECT country, COUNT(*) as count 
FROM towns 
GROUP BY country 
ORDER BY country;