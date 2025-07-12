-- Import missing towns to Scout2Retire database
-- Run this script in Supabase SQL Editor

-- Temporarily allow inserts (uncomment if needed)
-- CREATE POLICY "Allow admin inserts" ON "public"."towns" 
-- FOR INSERT WITH CHECK (auth.uid() = 'YOUR_ADMIN_USER_ID');

-- Insert all missing towns
INSERT INTO towns (name, country, region, regions, climate_description) VALUES
-- Albania
('Sarandë', 'Albania', 'Vlorë', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),

-- American Samoa
('Pago Pago', 'American Samoa', 'Tutuila', ARRAY['Oceania', 'Oceania'], 'Tropical climate'),

-- Antigua & Barbuda
('Saint John''s', 'Antigua and Barbuda', 'Saint John', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),

-- Argentina
('Bariloche', 'Argentina', 'Río Negro', ARRAY['South America', 'South America'], NULL),
('Buenos Aires', 'Argentina', 'Buenos Aires', ARRAY['South America', 'South America'], NULL),
('Mendoza', 'Argentina', 'Mendoza', ARRAY['South America', 'South America'], NULL),

-- Aruba
('Oranjestad', 'Aruba', 'Aruba', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),

-- Australia
('Sydney', 'Australia', 'New South Wales', ARRAY['Oceania', 'Australia & New Zealand'], NULL),
('Adelaide', 'Australia', 'South Australia', ARRAY['Oceania', 'Australia & New Zealand'], NULL),
('Canberra', 'Australia', 'Australian Capital Territory', ARRAY['Oceania', 'Australia & New Zealand'], NULL),
('Sunshine Coast', 'Australia', 'Queensland', ARRAY['Oceania', 'Australia & New Zealand'], NULL),
('Coffs Harbour', 'Australia', 'New South Wales', ARRAY['Oceania', 'Australia & New Zealand'], NULL),
('Gold Coast', 'Australia', 'Queensland', ARRAY['Oceania', 'Australia & New Zealand'], NULL),
('Hervey Bay', 'Australia', 'Queensland', ARRAY['Oceania', 'Australia & New Zealand'], NULL),
('Hobart', 'Australia', 'Tasmania', ARRAY['Oceania', 'Australia & New Zealand'], NULL),
('Melbourne', 'Australia', 'Victoria', ARRAY['Oceania', 'Australia & New Zealand'], NULL),
('Newcastle (Aus)', 'Australia', 'New South Wales', ARRAY['Oceania', 'Australia & New Zealand'], NULL),
('Perth', 'Australia', 'Western Australia', ARRAY['Oceania', 'Australia & New Zealand'], NULL),
('Port Macquarie', 'Australia', 'New South Wales', ARRAY['Oceania', 'Australia & New Zealand'], NULL),
('Victor Harbor', 'Australia', 'South Australia', ARRAY['Oceania', 'Australia & New Zealand'], NULL),

-- Austria
('Vienna', 'Austria', 'Capital Region', ARRAY['Europe', 'Europe'], NULL),

-- Bahamas
('Nassau', 'Bahamas', 'New Providence', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),
('George Town (Exuma)', 'Bahamas', 'Great Exuma', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),

-- Barbados
('Bridgetown', 'Barbados', 'Saint Michael', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),

-- Belgium
('Tervuren', 'Belgium', 'Flemish Brabant', ARRAY['Europe', 'Europe'], NULL),
('Bruges', 'Belgium', '(Central)', ARRAY['Europe', 'Europe'], NULL),
('Dinant', 'Belgium', 'Namur (Wallonia)', ARRAY['Europe', 'Europe'], NULL),
('Ghent', 'Belgium', 'East Flanders', ARRAY['Europe', 'Europe'], NULL),
('Leuven', 'Belgium', 'Flemish Brabant', ARRAY['Europe', 'Europe'], NULL),

-- Belize
('Placencia', 'Belize', 'Stann Creek', ARRAY['North America', 'Central America'], NULL),
('San Pedro (Ambergris Caye)', 'Belize', 'San Pedro (Ambergris Caye)', ARRAY['North America', 'Central America'], NULL),
('Corozal', 'Belize', 'Corozal', ARRAY['North America', 'Central America'], NULL),
('San Ignacio', 'Belize', 'Cayo', ARRAY['North America', 'Central America'], NULL),

-- Botswana
('Gaborone', 'Botswana', 'South-East', ARRAY['Africa', 'Africa'], NULL),

-- Brazil
('Florianópolis', 'Brazil', 'Santa Catarina', ARRAY['South America', 'South America'], NULL),

-- British Virgin Islands
('Road Town', 'British Virgin Islands', 'Tortola', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),

-- Cambodia
('Siem Reap', 'Cambodia', 'Siem Reap', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Phnom Penh', 'Cambodia', 'Phnom Penh', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Kampot', 'Cambodia', 'Kampot', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),

-- Canada
('Calgary', 'Canada', 'Alberta', ARRAY['North America', 'North America'], NULL),
('Halifax', 'Canada', 'Nova Scotia', ARRAY['North America', 'North America'], NULL),
('Charlottetown', 'Canada', 'Prince Edward Island', ARRAY['North America', 'North America'], NULL),
('Kelowna', 'Canada', 'British Columbia', ARRAY['North America', 'North America'], NULL),
('Kingston', 'Canada', 'Ontario', ARRAY['North America', 'North America'], NULL),
('London (ON)', 'Canada', 'Ontario', ARRAY['North America', 'North America'], NULL),
('Moncton', 'Canada', 'New Brunswick', ARRAY['North America', 'North America'], NULL),
('Niagara-on-the-Lake', 'Canada', 'Ontario', ARRAY['North America', 'North America'], NULL),
('Ottawa', 'Canada', 'Ontario', ARRAY['North America', 'North America'], NULL),
('Victoria', 'Canada', 'British Columbia', ARRAY['North America', 'North America'], NULL),

-- Chile
('Santiago', 'Chile', 'Santiago', ARRAY['South America', 'South America'], NULL),
('Valparaíso', 'Chile', 'Valparaíso', ARRAY['South America', 'South America'], NULL),
('La Serena', 'Chile', 'Coquimbo', ARRAY['South America', 'South America'], NULL),
('Viña del Mar', 'Chile', 'Valparaíso', ARRAY['South America', 'South America'], NULL),

-- Colombia
('Cartagena', 'Colombia', 'Bolívar', ARRAY['South America', 'South America'], NULL),
('Santa Marta', 'Colombia', 'Magdalena', ARRAY['South America', 'South America'], NULL),
('Villa de Leyva', 'Colombia', 'Boyacá', ARRAY['South America', 'South America'], NULL),

-- Cook Islands
('Rarotonga (Avarua)', 'Cook Islands', 'Rarotonga', ARRAY['Oceania', 'Oceania'], NULL),

-- Costa Rica
('Atenas', 'Costa Rica', 'Alajuela', ARRAY['North America', 'Central America'], NULL),
('Escazú', 'Costa Rica', 'San José', ARRAY['North America', 'Central America'], NULL),
('Grecia', 'Costa Rica', 'Alajuela', ARRAY['North America', 'Central America'], NULL),

-- Croatia
('Dubrovnik', 'Croatia', 'Dubrovnik-Neretva', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Rovinj', 'Croatia', 'Istria', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Sibenik', 'Croatia', 'Dalmatia', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Pula', 'Croatia', 'Istria', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Trogir', 'Croatia', 'Dalmatia', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Zadar', 'Croatia', 'Zadar', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),

-- Continue with more countries...
-- This is a partial list. The full script would include all 320 missing towns.
-- Due to size constraints, please run in batches or use the CSV import method.

ON CONFLICT (name, country) DO NOTHING;

-- Check the results
SELECT COUNT(*) as total_towns FROM towns;
SELECT country, COUNT(*) as count FROM towns GROUP BY country ORDER BY country;