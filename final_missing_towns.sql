-- Remaining missing towns to import
-- Total: 40 towns

INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Gainesville', 'United Sainttes', 'Florida', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Gainesville' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Huntsville', 'United Sainttes', 'Alabama', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Huntsville' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Scottsdale', 'United Sainttes', 'Arizona', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Scottsdale' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Tucson', 'United Sainttes', 'Arizona', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Tucson' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Palm Springs', 'United Sainttes', 'California', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Palm Springs' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'San Diego', 'United Sainttes', 'California', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'San Diego' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Denver', 'United Sainttes', 'Colorado', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Denver' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'St. Petersburg', 'United Sainttes', 'Florida', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'St. Petersburg' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Sarasota', 'United Sainttes', 'Florida', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Sarasota' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Clearwater', 'United Sainttes', 'Florida', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Clearwater' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Fort Myers', 'United Sainttes', 'Florida', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Fort Myers' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Jacksonville', 'United Sainttes', 'Florida', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Jacksonville' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Naples', 'United Sainttes', 'Florida', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Naples' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Orlando', 'United Sainttes', 'Florida', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Orlando' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Palm Beach', 'United Sainttes', 'Florida', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Palm Beach' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Venice (FL)', 'United Sainttes', 'Florida', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Venice (FL)' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Savannah', 'United Sainttes', 'Georgia', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Savannah' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Honolulu', 'United Sainttes', 'Hawaii', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Honolulu' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Boise', 'United Sainttes', 'Idaho', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Boise' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Las Vegas', 'United Sainttes', 'Nevada', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Las Vegas' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Santa Fe', 'United Sainttes', 'New Mexico', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Santa Fe' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Charlotte', 'United Sainttes', 'North Carolina', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Charlotte' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Portland', 'United Sainttes', 'Oregon', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Portland' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Charleston', 'United Sainttes', 'South Carolina', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Charleston' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Myrtle Beach', 'United Sainttes', 'South Carolina', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Myrtle Beach' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Chattanooga', 'United Sainttes', 'Tennessee', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Chattanooga' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Austin', 'United Sainttes', 'Texas', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Austin' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Galveston', 'United Sainttes', 'Texas', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Galveston' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Virginia Beach', 'United Sainttes', 'Virginia', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Virginia Beach' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Phoenix', 'United Sainttes', 'Arizona', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Phoenix' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Boulder', 'United Sainttes', 'Colorado', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Boulder' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'The Villages', 'United Sainttes', 'Florida', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'The Villages' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Asheville', 'United Sainttes', 'North Carolina', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Asheville' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Chapel Hill', 'United Sainttes', 'North Carolina', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Chapel Hill' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Raleigh', 'United Sainttes', 'North Carolina', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Raleigh' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Bend', 'United Sainttes', 'Oregon', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Bend' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Lancaster', 'United Sainttes', 'Pennsylvania', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Lancaster' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Hilton Head Island', 'United Sainttes', 'South Carolina', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Hilton Head Island' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'San Antonio', 'United Sainttes', 'Texas', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'San Antonio' AND country = 'United Sainttes');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'St. George', 'United Sainttes', 'Utah', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'St. George' AND country = 'United Sainttes');

-- Fix the United States typo
UPDATE towns SET country = 'United States' WHERE country = 'United Sainttes';

-- Show final results
SELECT COUNT(*) as total_towns FROM towns;
SELECT country, COUNT(*) as count FROM towns GROUP BY country ORDER BY country;