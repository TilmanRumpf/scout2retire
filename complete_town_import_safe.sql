-- Complete Town Import for Scout2Retire
-- This script safely imports all missing towns using WHERE NOT EXISTS
-- Run this in Supabase SQL Editor

-- Check current count
SELECT COUNT(*) as current_count, 'BEFORE IMPORT' as status FROM towns;

-- Import all missing towns

INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Sarandë', 'Albania', 'Vlorë', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Sarandë' AND country = 'Albania');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Pago Pago', 'American Samoa', 'Tutuila', ARRAY['Oceania', 'Oceania'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Pago Pago' AND country = 'American Samoa');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Saint John''s', 'Antigua and Barbuda', 'Saint John', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Saint John''s' AND country = 'Antigua and Barbuda');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Bariloche', 'Argentina', 'Río Negro', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Bariloche' AND country = 'Argentina');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Buenos Aires', 'Argentina', 'Buenos Aires', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Buenos Aires' AND country = 'Argentina');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Mendoza', 'Argentina', 'Mendoza', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Mendoza' AND country = 'Argentina');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Oranjestad', 'Aruba', 'Aruba', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Oranjestad' AND country = 'Aruba');
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
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Vienna', 'Austria', 'Capital Region', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Vienna' AND country = 'Austria');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Nassau', 'Bahamas', 'New Providence', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Nassau' AND country = 'Bahamas');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'George Town (Exuma)', 'Bahamas', 'Great Exuma', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'George Town (Exuma)' AND country = 'Bahamas');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Bridgetown', 'Barbados', 'Saint Michael', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Bridgetown' AND country = 'Barbados');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Tervuren', 'Belgium', 'Flemish Brabant', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Tervuren' AND country = 'Belgium');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Bruges', 'Belgium', '(Central)', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Bruges' AND country = 'Belgium');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Dinant', 'Belgium', 'Namur (Wallonia)', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Dinant' AND country = 'Belgium');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Ghent', 'Belgium', 'East Flanders', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Ghent' AND country = 'Belgium');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Leuven', 'Belgium', 'Flemish Brabant', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Leuven' AND country = 'Belgium');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Placencia', 'Belize', 'Stann Creek', ARRAY['North America', 'Central America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Placencia' AND country = 'Belize');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'San Pedro (Ambergris Caye)', 'Belize', 'San Pedro (Ambergris Caye)', ARRAY['North America', 'Central America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'San Pedro (Ambergris Caye)' AND country = 'Belize');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Corozal', 'Belize', 'Corozal', ARRAY['North America', 'Central America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Corozal' AND country = 'Belize');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'San Ignacio', 'Belize', 'Cayo', ARRAY['North America', 'Central America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'San Ignacio' AND country = 'Belize');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Gaborone', 'Botswana', 'South-East', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Gaborone' AND country = 'Botswana');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Florianópolis', 'Brazil', 'Santa Catarina', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Florianópolis' AND country = 'Brazil');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Road Town', 'British Virgin Islands', 'Tortola', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Road Town' AND country = 'British Virgin Islands');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Siem Reap', 'Cambodia', 'Siem Reap', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Siem Reap' AND country = 'Cambodia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Phnom Penh', 'Cambodia', 'Phnom Penh', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Phnom Penh' AND country = 'Cambodia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Kampot', 'Cambodia', 'Kampot', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Kampot' AND country = 'Cambodia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Calgary', 'Canada', 'Alberta', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Calgary' AND country = 'Canada');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Halifax', 'Canada', 'Nova Scotia', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Halifax' AND country = 'Canada');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Charlottetown', 'Canada', 'Prince Edward Island', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Charlottetown' AND country = 'Canada');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Kelowna', 'Canada', 'British Columbia', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Kelowna' AND country = 'Canada');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Kingston', 'Canada', 'Ontario', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Kingston' AND country = 'Canada');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'London (ON)', 'Canada', 'Ontario', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'London (ON)' AND country = 'Canada');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Moncton', 'Canada', 'New Brunswick', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Moncton' AND country = 'Canada');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Niagara-on-the-Lake', 'Canada', 'Ontario', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Niagara-on-the-Lake' AND country = 'Canada');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Ottawa', 'Canada', 'Ontario', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Ottawa' AND country = 'Canada');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Victoria', 'Canada', 'British Columbia', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Victoria' AND country = 'Canada');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Santiago', 'Chile', 'Santiago', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Santiago' AND country = 'Chile');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Valparaíso', 'Chile', 'Valparaíso', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Valparaíso' AND country = 'Chile');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'La Serena', 'Chile', 'Coquimbo', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'La Serena' AND country = 'Chile');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Viña del Mar', 'Chile', 'Valparaíso', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Viña del Mar' AND country = 'Chile');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Cartagena', 'Colombia', 'Bolívar', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Cartagena' AND country = 'Colombia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Medellín', 'Colombia', 'Antioquia', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Medellín' AND country = 'Colombia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Santa Marta', 'Colombia', 'Magdalena', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Santa Marta' AND country = 'Colombia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Villa de Leyva', 'Colombia', 'Boyacá', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Villa de Leyva' AND country = 'Colombia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Rarotonga (Avarua)', 'Cook Islands', 'Rarotonga', ARRAY['Oceania', 'Oceania'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Rarotonga (Avarua)' AND country = 'Cook Islands');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Tamarindo', 'Costa Rica', 'Guanacaste', ARRAY['North America', 'Central America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Tamarindo' AND country = 'Costa Rica');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Atenas', 'Costa Rica', 'Alajuela', ARRAY['North America', 'Central America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Atenas' AND country = 'Costa Rica');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Escazú', 'Costa Rica', 'San José', ARRAY['North America', 'Central America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Escazú' AND country = 'Costa Rica');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Grecia', 'Costa Rica', 'Alajuela', ARRAY['North America', 'Central America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Grecia' AND country = 'Costa Rica');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Dubrovnik', 'Croatia', 'Dubrovnik-Neretva', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Dubrovnik' AND country = 'Croatia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Rovinj', 'Croatia', 'Istria', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Rovinj' AND country = 'Croatia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Sibenik', 'Croatia', 'Dalmatia', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Sibenik' AND country = 'Croatia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Pula', 'Croatia', 'Istria', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Pula' AND country = 'Croatia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Trogir', 'Croatia', 'Dalmatia', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Trogir' AND country = 'Croatia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Zadar', 'Croatia', 'Zadar', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Zadar' AND country = 'Croatia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Willemstad', 'Curacao', 'Curacao', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Willemstad' AND country = 'Curacao');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Limassol', 'Cyprus', 'Limassol', ARRAY['Asia', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Limassol' AND country = 'Cyprus');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Prague', 'Czech Republic', 'Prague (Capital)', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Prague' AND country = 'Czech Republic');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Sosúa', 'Dominican Republic', 'Puerto Plata', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Sosúa' AND country = 'Dominican Republic');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Las Terrenas', 'Dominican Republic', 'Samaná', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Las Terrenas' AND country = 'Dominican Republic');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Puerto Plata', 'Dominican Republic', 'Puerto Plata', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Puerto Plata' AND country = 'Dominican Republic');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Punta Cana', 'Dominican Republic', 'La Altagracia', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Punta Cana' AND country = 'Dominican Republic');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Quito', 'Ecuador', 'Pichincha', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Quito' AND country = 'Ecuador');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Manta', 'Ecuador', 'Manabí', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Manta' AND country = 'Ecuador');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Salinas', 'Ecuador', 'Santa Elena', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Salinas' AND country = 'Ecuador');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Vilcabamba', 'Ecuador', 'Loja', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Vilcabamba' AND country = 'Ecuador');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Sharm El Sheikh', 'Egypt', 'South Sinai', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Sharm El Sheikh' AND country = 'Egypt');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Cairo', 'Egypt', 'Cairo', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Cairo' AND country = 'Egypt');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'El Gouna', 'Egypt', 'Red Sea', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'El Gouna' AND country = 'Egypt');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Hurghada', 'Egypt', 'Red Sea', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Hurghada' AND country = 'Egypt');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Tallinn', 'Estonia', 'West Flanders', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Tallinn' AND country = 'Estonia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Savusavu', 'Fiji', 'Northern Division', ARRAY['Oceania', 'Oceania'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Savusavu' AND country = 'Fiji');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Suva', 'Fiji', 'Central Division', ARRAY['Oceania', 'Oceania'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Suva' AND country = 'Fiji');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Nadi', 'Fiji', 'Western Division', ARRAY['Oceania', 'Oceania'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Nadi' AND country = 'Fiji');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Sarlat-la-Canéda', 'France', 'Nouvelle-Aquitaine (Dordogne)', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Sarlat-la-Canéda' AND country = 'France');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Pau', 'France', 'Nouvelle-Aquitaine (Béarn)', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Pau' AND country = 'France');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Sainte-Maxime', 'France', 'Provence-Alpes-Côte d''Azur', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Sainte-Maxime' AND country = 'France');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Aix-en-Provence', 'France', 'Provence-Alpes-Cote-d-Azur', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Aix-en-Provence' AND country = 'France');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Annecy', 'France', 'Auvergne-Rhone-Alpes', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Annecy' AND country = 'France');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Antibes', 'France', 'Provence-Alpes-Côte d''Azur', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Antibes' AND country = 'France');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Avignon', 'France', 'Provence-Alpes-Côte d''Azur', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Avignon' AND country = 'France');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Cannes', 'France', 'Provence-Alpes-Cote-d-Azur', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Cannes' AND country = 'France');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Cassis', 'France', 'Provence-Alpes-Côte d''Azur', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Cassis' AND country = 'France');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Cavalaire-sur-Mer', 'France', 'Provence-Alpes-Côte d''Azur', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Cavalaire-sur-Mer' AND country = 'France');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Le Lavandou', 'France', 'Provence-Alpes-Côte d''Azur', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Le Lavandou' AND country = 'France');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Menton', 'France', 'Provence-Alpes-Côte d''Azur', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Menton' AND country = 'France');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Montpellier', 'France', 'Occitanie', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Montpellier' AND country = 'France');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Nice', 'France', 'Provence-Alpes-Cote-d-Azur', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Nice' AND country = 'France');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Perpignan', 'France', 'Occitanie (Pyrénées-Orientales)', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Perpignan' AND country = 'France');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Papeete', 'French Polynesia', 'Windward Islands (Tahiti)', ARRAY['Oceania', 'Oceania'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Papeete' AND country = 'French Polynesia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Trier', 'Germany', 'Rhineland-Palatinate', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Trier' AND country = 'Germany');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Eckernförde', 'Germany', 'Schleswig-Holstein', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Eckernförde' AND country = 'Germany');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Freiburg im Breisgau', 'Germany', 'Baden-Württemberg', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Freiburg im Breisgau' AND country = 'Germany');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Heidelberg', 'Germany', 'Baden-Württemberg', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Heidelberg' AND country = 'Germany');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Lindau', 'Germany', 'Bavaria (Lake Constance)', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Lindau' AND country = 'Germany');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Wiesbaden', 'Germany', 'Hesse', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Wiesbaden' AND country = 'Germany');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Wismar', 'Germany', 'Mecklenburg-Vorpommern', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Wismar' AND country = 'Germany');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Thessaloniki', 'Greece', 'Central Macedonia', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Thessaloniki' AND country = 'Greece');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Athens', 'Greece', 'Attica', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Athens' AND country = 'Greece');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Chania', 'Greece', 'Crete', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Chania' AND country = 'Greece');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Corfu (Kerkyra)', 'Greece', 'Ionian Islands', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Corfu (Kerkyra)' AND country = 'Greece');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Ioannina', 'Greece', 'Epirus', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Ioannina' AND country = 'Greece');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Kalamata', 'Greece', 'Peloponnese', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Kalamata' AND country = 'Greece');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Nafplio', 'Greece', 'Peloponnese', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Nafplio' AND country = 'Greece');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Patras', 'Greece', 'Western Greece', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Patras' AND country = 'Greece');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Rethymno', 'Greece', 'Crete', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Rethymno' AND country = 'Greece');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Saint George', 'Grenada', 'Saint George', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Saint George' AND country = 'Grenada');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Antigua', 'Guatemala', 'Sacatepéquez', ARRAY['North America', 'Central America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Antigua' AND country = 'Guatemala');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Lake Atitlán (Panajachel)', 'Guatemala', 'Sololá', ARRAY['North America', 'Central America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Lake Atitlán (Panajachel)' AND country = 'Guatemala');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Roatán', 'Honduras', 'Bay Islands', ARRAY['North America', 'Central America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Roatán' AND country = 'Honduras');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Budapest', 'Hungary', 'Central Hungary', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Budapest' AND country = 'Hungary');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Reykjavik', 'Iceland', 'Ticino', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Reykjavik' AND country = 'Iceland');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Kathmandu', 'India', 'Puducherry', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Kathmandu' AND country = 'India');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Pondicherry', 'India', 'Goa', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Pondicherry' AND country = 'India');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Cork', 'Ireland', 'Munster', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Cork' AND country = 'Ireland');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Dublin', 'Ireland', 'Leinster', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Dublin' AND country = 'Ireland');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Tel Aviv', 'Israel', 'Tel Aviv District', ARRAY['Asia', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Tel Aviv' AND country = 'Israel');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Haifa', 'Israel', 'Haifa District', ARRAY['Asia', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Haifa' AND country = 'Israel');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Spoleto', 'Italy', 'Umbria', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Spoleto' AND country = 'Italy');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Trieste', 'Italy', 'Friuli Venezia Giulia', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Trieste' AND country = 'Italy');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Taormina', 'Italy', 'Sicily', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Taormina' AND country = 'Italy');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Bologna', 'Italy', 'Emilia-Romagna', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Bologna' AND country = 'Italy');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Lecce', 'Italy', 'Apulia (Puglia)', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Lecce' AND country = 'Italy');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Lucca', 'Italy', 'Tuscany', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Lucca' AND country = 'Italy');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Orvieto', 'Italy', 'Umbria', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Orvieto' AND country = 'Italy');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Ostuni', 'Italy', 'Apulia (Puglia)', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Ostuni' AND country = 'Italy');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Salerno', 'Italy', 'Campania', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Salerno' AND country = 'Italy');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Goa', 'India', 'Goa', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Goa' AND country = 'India');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Luang Prabang', 'Laos', 'Luang Prabang', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Luang Prabang' AND country = 'Laos');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Vientiane', 'Laos', 'Vientiane Prefecture', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Vientiane' AND country = 'Laos');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Jurmala', 'Latvia', 'Riga Region', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Jurmala' AND country = 'Latvia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'George Town (Penang)', 'Malaysia', 'Penang', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'George Town (Penang)' AND country = 'Malaysia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Johor Bahru', 'Malaysia', 'Johor', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Johor Bahru' AND country = 'Malaysia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Kuala Lumpur', 'Malaysia', 'Kuala Lumpur', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Kuala Lumpur' AND country = 'Malaysia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Langkawi', 'Malaysia', 'Kedah', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Langkawi' AND country = 'Malaysia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Malacca', 'Malaysia', 'Malacca', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Malacca' AND country = 'Malaysia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Sliema', 'Malta', '—', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Sliema' AND country = 'Malta');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Valletta', 'Malta', '—', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Valletta' AND country = 'Malta');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Majuro', 'Marshall Islands', 'Majuro Atoll', ARRAY['Oceania', 'Oceania'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Majuro' AND country = 'Marshall Islands');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Fort-de-France', 'Martinique', 'Martinique', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Fort-de-France' AND country = 'Martinique');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Grand Baie', 'Mauritius', 'Rivière du Rempart', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Grand Baie' AND country = 'Mauritius');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Port Louis', 'Mauritius', 'Port Louis (Capital)', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Port Louis' AND country = 'Mauritius');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Ensenada', 'Mexico', 'Baja California', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Ensenada' AND country = 'Mexico');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Huatulco', 'Mexico', 'Oaxaca', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Huatulco' AND country = 'Mexico');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Lake Chapala (Ajijic)', 'Mexico', 'Jalisco', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Lake Chapala (Ajijic)' AND country = 'Mexico');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Los Cabos (Cabo San Lucas)', 'Mexico', 'Baja California Sur', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Los Cabos (Cabo San Lucas)' AND country = 'Mexico');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Mazatlán', 'Mexico', 'Sinaloa', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Mazatlán' AND country = 'Mexico');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Mérida', 'Mexico', 'Yucatán', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Mérida' AND country = 'Mexico');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Oaxaca City', 'Mexico', 'Oaxaca', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Oaxaca City' AND country = 'Mexico');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Puebla', 'Mexico', 'Puebla', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Puebla' AND country = 'Mexico');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Puerto Vallarta', 'Mexico', 'Jalisco', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Puerto Vallarta' AND country = 'Mexico');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'La Paz', 'Mexico', 'Baja California Sur', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'La Paz' AND country = 'Mexico');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Loreto', 'Mexico', 'Baja California Sur', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Loreto' AND country = 'Mexico');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Playa del Carmen', 'Mexico', 'Quintana Roo', ARRAY['North America', 'North America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Playa del Carmen' AND country = 'Mexico');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Pohnpei (Kolonia)', 'Micronesia', 'Pohnpei', ARRAY['Oceania', 'Oceania'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Pohnpei (Kolonia)' AND country = 'Micronesia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Budva', 'Montenegro', 'Budva', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Budva' AND country = 'Montenegro');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Herceg Novi', 'Montenegro', 'Herceg Novi', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Herceg Novi' AND country = 'Montenegro');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Kotor', 'Montenegro', 'Kotor', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Kotor' AND country = 'Montenegro');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Tangier', 'Morocco', 'Tanger-Tetouan-Al Hoceima', ARRAY['Africa', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Tangier' AND country = 'Morocco');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Agadir', 'Morocco', 'Souss-Massa', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Agadir' AND country = 'Morocco');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Casablanca', 'Morocco', 'Casablanca-Settat', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Casablanca' AND country = 'Morocco');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Essaouira', 'Morocco', 'Marrakesh-Safi', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Essaouira' AND country = 'Morocco');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Marrakesh', 'Morocco', 'Marrakesh-Safi', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Marrakesh' AND country = 'Morocco');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Windhoek', 'Namibia', 'Khomas', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Windhoek' AND country = 'Namibia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Swakopmund', 'Namibia', 'Erongo', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Swakopmund' AND country = 'Namibia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Pokhara', 'Nepal', 'Bagmati', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Pokhara' AND country = 'Nepal');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Amersfoort', 'Netherlands', 'Utrecht Province', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Amersfoort' AND country = 'Netherlands');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Bergen (NH)', 'Netherlands', 'North Holland', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Bergen (NH)' AND country = 'Netherlands');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Haarlem', 'Netherlands', 'North Holland', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Haarlem' AND country = 'Netherlands');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Hoorn', 'Netherlands', 'North Holland', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Hoorn' AND country = 'Netherlands');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Leiden', 'Netherlands', 'South Holland', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Leiden' AND country = 'Netherlands');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Maastricht', 'Netherlands', 'Limburg', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Maastricht' AND country = 'Netherlands');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Zutphen', 'Netherlands', 'Gelderland', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Zutphen' AND country = 'Netherlands');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Noumea', 'New Caledonia', 'South Province', ARRAY['Oceania', 'Oceania'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Noumea' AND country = 'New Caledonia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Tauranga', 'New Zealand', 'Bay of Plenty', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Tauranga' AND country = 'New Zealand');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Auckland', 'New Zealand', 'Auckland', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Auckland' AND country = 'New Zealand');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Christchurch', 'New Zealand', 'Canterbury', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Christchurch' AND country = 'New Zealand');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Napier', 'New Zealand', 'Hawke''s Bay', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Napier' AND country = 'New Zealand');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Nelson', 'New Zealand', 'Tasman / Nelson Region', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Nelson' AND country = 'New Zealand');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Queenstown', 'New Zealand', 'Otago', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Queenstown' AND country = 'New Zealand');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Wanaka', 'New Zealand', 'Otago', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Wanaka' AND country = 'New Zealand');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Wellington', 'New Zealand', 'Wellington', ARRAY['Oceania', 'Australia & New Zealand'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Wellington' AND country = 'New Zealand');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Kyrenia', 'Northern Cyprus', 'Kyrenia', ARRAY['Asia', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Kyrenia' AND country = 'Northern Cyprus');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Paphos', 'Northern Cyprus', 'Paphos', ARRAY['Asia', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Paphos' AND country = 'Northern Cyprus');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Koror', 'Palau', 'Koror', ARRAY['Oceania', 'Oceania'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Koror' AND country = 'Palau');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Bocas Town (Bocas del Toro)', 'Panama', 'Bocas del Toro', ARRAY['North America', 'Central America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Bocas Town (Bocas del Toro)' AND country = 'Panama');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Coronado', 'Panama', 'Panamá Oeste', ARRAY['North America', 'Central America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Coronado' AND country = 'Panama');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Panama City', 'Panama', 'Panamá', ARRAY['North America', 'Central America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Panama City' AND country = 'Panama');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Pedasí', 'Panama', 'Los Santos', ARRAY['North America', 'Central America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Pedasí' AND country = 'Panama');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Asunción', 'Paraguay', 'Asunción', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Asunción' AND country = 'Paraguay');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Cusco', 'Peru', 'Cusco', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Cusco' AND country = 'Peru');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Subic Bay (Olongapo)', 'Philippines', 'Zambales', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Subic Bay (Olongapo)' AND country = 'Philippines');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Baguio', 'Philippines', 'Benguet', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Baguio' AND country = 'Philippines');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Cebu City', 'Philippines', 'Cebu', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Cebu City' AND country = 'Philippines');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Tagaytay', 'Philippines', 'Cavite', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Tagaytay' AND country = 'Philippines');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Dumaguete', 'Philippines', 'Negros Oriental', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Dumaguete' AND country = 'Philippines');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Viseu', 'Portugal', 'Centro', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Viseu' AND country = 'Portugal');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Albufeira', 'Portugal', 'Algarve', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Albufeira' AND country = 'Portugal');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Algarve (Lagos)', 'Portugal', 'Algarve (Faro)', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Algarve (Lagos)' AND country = 'Portugal');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Braga', 'Portugal', 'Norte', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Braga' AND country = 'Portugal');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Carvoeiro', 'Portugal', 'Algarve', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Carvoeiro' AND country = 'Portugal');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Cascais', 'Portugal', 'Lisbon District', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Cascais' AND country = 'Portugal');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Evora', 'Portugal', 'Alentejo', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Evora' AND country = 'Portugal');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Funchal (Madeira)', 'Portugal', 'Madeira', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Funchal (Madeira)' AND country = 'Portugal');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Nazaré', 'Portugal', 'Centro', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Nazaré' AND country = 'Portugal');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Portimão', 'Portugal', 'Algarve', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Portimão' AND country = 'Portugal');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Vila Real de Santo António', 'Portugal', 'Algarve', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Vila Real de Santo António' AND country = 'Portugal');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Olhão', 'Portugal', 'Algarve', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Olhão' AND country = 'Portugal');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Rincón', 'Puerto Rico', 'Puerto Rico', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Rincón' AND country = 'Puerto Rico');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'San Juan', 'Puerto Rico', 'Puerto Rico', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'San Juan' AND country = 'Puerto Rico');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Kigali', 'Rwanda', 'Kigali', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Kigali' AND country = 'Rwanda');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Castries', 'Saint Lucia', 'Castries', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Castries' AND country = 'Saint Lucia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Marigot', 'Saint Martin', 'Saint Martin', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Marigot' AND country = 'Saint Martin');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Apia', 'Samoa', 'Tuamasaga (Upolu)', ARRAY['Oceania', 'Oceania'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Apia' AND country = 'Samoa');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Dakar', 'Senegal', 'Dakar', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Dakar' AND country = 'Senegal');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Victoria (Mahé)', 'Seychelles', 'Mahé', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Victoria (Mahé)' AND country = 'Seychelles');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Singapore', 'Singapore', '—', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Singapore' AND country = 'Singapore');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Philipsburg', 'Sint Maarten', 'Sint Maarten', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Philipsburg' AND country = 'Sint Maarten');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Honiara', 'Solomon Islands', 'Guadalcanal', ARRAY['Oceania', 'Oceania'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Honiara' AND country = 'Solomon Islands');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Cape Town', 'South Africa', 'Western Cape', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Cape Town' AND country = 'South Africa');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Hermanus', 'South Africa', 'Western Cape', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Hermanus' AND country = 'South Africa');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Knysna', 'South Africa', 'Western Cape', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Knysna' AND country = 'South Africa');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Plettenberg Bay', 'South Africa', 'Western Cape', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Plettenberg Bay' AND country = 'South Africa');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Puerto de la Cruz', 'Spain', 'Canary Islands', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Puerto de la Cruz' AND country = 'Spain');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Baiona', 'Spain', 'Galicia (Pontevedra)', ARRAY['Europe', 'Atlantic Coast'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Baiona' AND country = 'Spain');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Castro Urdiales', 'Spain', 'Cantabria', ARRAY['Europe', 'Atlantic Coast'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Castro Urdiales' AND country = 'Spain');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Comillas', 'Spain', 'Cantabria', ARRAY['Europe', 'Atlantic Coast'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Comillas' AND country = 'Spain');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Granada', 'Spain', 'Andalusia', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Granada' AND country = 'Spain');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Sanlúcar de Barrameda', 'Spain', 'Andalusia (Cádiz)', ARRAY['Europe', 'Atlantic Coast'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Sanlúcar de Barrameda' AND country = 'Spain');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Barcelona', 'Spain', 'Catalonia', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Barcelona' AND country = 'Spain');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Malaga', 'Spain', 'Andalusia', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Malaga' AND country = 'Spain');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Marbella', 'Spain', 'Andalusia', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Marbella' AND country = 'Spain');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Palma de Mallorca', 'Spain', 'Balearic Islands', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Palma de Mallorca' AND country = 'Spain');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Basseterre', 'Saint Kitts and Nevis', 'Saint George Basseterre', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Basseterre' AND country = 'Saint Kitts and Nevis');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Kingstown', 'Saint Vincent and Grenadines', 'Saint George', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Kingstown' AND country = 'Saint Vincent and Grenadines');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Lugano', 'Switzerland', 'Harju (Tallinn)', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Lugano' AND country = 'Switzerland');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Taipei', 'Taiwan', '—', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Taipei' AND country = 'Taiwan');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Kaohsiung', 'Taiwan', '—', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Kaohsiung' AND country = 'Taiwan');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Bangkok', 'Thailand', 'Bangkok', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Bangkok' AND country = 'Thailand');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Chiang Rai', 'Thailand', 'Chiang Rai', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Chiang Rai' AND country = 'Thailand');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Hua Hin', 'Thailand', 'Prachuap Khiri Khan', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Hua Hin' AND country = 'Thailand');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Koh Samui', 'Thailand', 'Surat Thani', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Koh Samui' AND country = 'Thailand');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Phuket', 'Thailand', 'Phuket', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Phuket' AND country = 'Thailand');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Udon Thani', 'Thailand', 'Udon Thani', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Udon Thani' AND country = 'Thailand');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Neiafu', 'Tonga', 'Vavaʻu', ARRAY['Oceania', 'Oceania'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Neiafu' AND country = 'Tonga');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Sousse', 'Tunisia', 'Sousse', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Sousse' AND country = 'Tunisia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Tunis', 'Tunisia', 'Tunis', ARRAY['Africa', 'Africa'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Tunis' AND country = 'Tunisia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Hammamet', 'Tunisia', 'Nabeul', ARRAY['Africa', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Hammamet' AND country = 'Tunisia');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Antalya', 'Turkey', 'Antalya', ARRAY['Asia', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Antalya' AND country = 'Turkey');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Bodrum', 'Turkey', 'Muğla', ARRAY['Asia', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Bodrum' AND country = 'Turkey');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Fethiye', 'Turkey', 'Muğla', ARRAY['Asia', 'Mediterranean'], 'Mediterranean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Fethiye' AND country = 'Turkey');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Providenciales', 'Turks and Caicos', 'Providenciales', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Providenciales' AND country = 'Turks and Caicos');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Charlotte Amalie', 'U.S. Virgin Islands', 'St. Thomas', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Charlotte Amalie' AND country = 'U.S. Virgin Islands');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Christiansted', 'U.S. Virgin Islands', 'St. Croix', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Christiansted' AND country = 'U.S. Virgin Islands');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Truro (Cornwall)', 'United Kingdom', 'Cornwall', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Truro (Cornwall)' AND country = 'United Kingdom');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Bath', 'United Kingdom', 'South West England', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Bath' AND country = 'United Kingdom');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Edinburgh', 'United Kingdom', 'Scotland', ARRAY['Europe', 'Europe'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Edinburgh' AND country = 'United Kingdom');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Abu Dhabi', 'United Arab Emirates', 'Abu Dhabi', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Abu Dhabi' AND country = 'United Arab Emirates');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Dubai', 'United Arab Emirates', 'Dubai', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Dubai' AND country = 'United Arab Emirates');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Montevideo', 'Uruguay', 'Montevideo', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Montevideo' AND country = 'Uruguay');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Punta del Este', 'Uruguay', 'Maldonado', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Punta del Este' AND country = 'Uruguay');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Colonia del Sacramento', 'Uruguay', 'Colonia', ARRAY['South America', 'South America'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Colonia del Sacramento' AND country = 'Uruguay');
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
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Port Vila', 'Vanuatu', 'Shefa', ARRAY['Oceania', 'Oceania'], NULL
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Port Vila' AND country = 'Vanuatu');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Ho Chi Minh City', 'Vietnam', 'Ho Chi Minh City', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Ho Chi Minh City' AND country = 'Vietnam');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Hoi An', 'Vietnam', 'Quảng Nam', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Hoi An' AND country = 'Vietnam');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Nha Trang', 'Vietnam', 'Khánh Hòa', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Nha Trang' AND country = 'Vietnam');
INSERT INTO towns (name, country, region, regions, climate_description)
SELECT 'Vung Tau', 'Vietnam', 'Bà Rịa-Vũng Tàu', ARRAY['Asia', 'Asia'], 'Varied Asian climate'
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE name = 'Vung Tau' AND country = 'Vietnam');

-- Show results
SELECT COUNT(*) as final_count, 'AFTER IMPORT' as status FROM towns;

-- Show count by country
SELECT country, COUNT(*) as count 
FROM towns 
GROUP BY country 
ORDER BY country;

-- Show any specific countries of interest
SELECT * FROM towns WHERE country IN ('Australia', 'Mexico', 'Portugal', 'Spain', 'Italy') ORDER BY country, name LIMIT 20;
