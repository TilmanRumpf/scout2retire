-- Complete Town Import for Scout2Retire
-- This script imports all 320 missing towns to the database
-- Run this in Supabase SQL Editor with appropriate permissions

-- First, check current town count
SELECT COUNT(*) as current_count FROM towns;

-- Import all missing towns with duplicate prevention
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

-- Curacao
('Willemstad', 'Curacao', 'Curacao', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),

-- Cyprus
('Paphos', 'Cyprus', 'Paphos', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Limassol', 'Cyprus', 'Limassol', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),

-- Czech Republic
('Cesky Krumlov', 'Czech Republic', 'South Bohemian', ARRAY['Europe', 'Europe'], NULL),
('Prague', 'Czech Republic', 'Capital City', ARRAY['Europe', 'Europe'], NULL),

-- Dominica
('Roseau', 'Dominica', 'Saint George', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),

-- Dominican Republic
('Santo Domingo', 'Dominican Republic', 'Distrito Nacional', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),
('Las Terrenas', 'Dominican Republic', 'Samaná', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),
('Punta Cana', 'Dominican Republic', 'La Altagracia', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),
('Sosúa', 'Dominican Republic', 'Puerto Plata', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),

-- Ecuador
('Cotacachi', 'Ecuador', 'Imbabura', ARRAY['South America', 'South America'], NULL),
('Cuenca', 'Ecuador', 'Azuay', ARRAY['South America', 'South America'], NULL),
('Loja', 'Ecuador', 'Loja', ARRAY['South America', 'South America'], NULL),
('Manta', 'Ecuador', 'Manabí', ARRAY['South America', 'South America'], NULL),
('Quito', 'Ecuador', 'Pichincha', ARRAY['South America', 'South America'], NULL),
('Salinas', 'Ecuador', 'Santa Elena', ARRAY['South America', 'South America'], NULL),
('Vilcabamba', 'Ecuador', 'Loja', ARRAY['South America', 'South America'], NULL),

-- Egypt
('Hurghada', 'Egypt', 'Red Sea', ARRAY['Africa', 'Africa'], NULL),

-- Estonia
('Tallinn', 'Estonia', 'Harju', ARRAY['Europe', 'Europe'], NULL),

-- Fed. States of Micronesia
('Pohnpei', 'Federal States of Micronesia', 'Pohnpei', ARRAY['Oceania', 'Oceania'], NULL),

-- France
('Annecy', 'France', 'Haute-Savoie', ARRAY['Europe', 'Europe'], NULL),
('Antibes', 'France', 'Alpes-Maritimes', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Bordeaux', 'France', 'Nouvelle-Aquitaine', ARRAY['Europe', 'Europe'], NULL),
('Cannes', 'France', 'Alpes-Maritimes', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Lyon', 'France', 'Rhône', ARRAY['Europe', 'Europe'], NULL),
('Montpellier', 'France', 'Hérault', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Nice', 'France', 'Alpes-Maritimes', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Paris', 'France', 'Île-de-France', ARRAY['Europe', 'Europe'], NULL),
('Toulouse', 'France', 'Haute-Garonne', ARRAY['Europe', 'Europe'], NULL),

-- French Polynesia
('Bora Bora', 'French Polynesia', 'Leeward Islands', ARRAY['Oceania', 'Oceania'], NULL),
('Moorea', 'French Polynesia', 'Windward Islands', ARRAY['Oceania', 'Oceania'], NULL),
('Tahiti (Papeete)', 'French Polynesia', 'Windward Islands', ARRAY['Oceania', 'Oceania'], NULL),

-- Georgia
('Batumi', 'Georgia', 'Adjara', ARRAY['Asia', 'Asia'], NULL),
('Tbilisi', 'Georgia', 'Tbilisi', ARRAY['Asia', 'Asia'], NULL),

-- Germany
('Berlin', 'Germany', 'Berlin', ARRAY['Europe', 'Europe'], NULL),
('Freiburg', 'Germany', 'Baden-Württemberg', ARRAY['Europe', 'Europe'], NULL),
('Heidelberg', 'Germany', 'Baden-Württemberg', ARRAY['Europe', 'Europe'], NULL),
('Munich', 'Germany', 'Bavaria', ARRAY['Europe', 'Europe'], NULL),

-- Greece
('Athens', 'Greece', 'Attica', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Crete (Heraklion)', 'Greece', 'Crete', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Rhodes', 'Greece', 'South Aegean', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Santorini', 'Greece', 'South Aegean', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Thessaloniki', 'Greece', 'Central Macedonia', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),

-- Grenada
('Saint George''s', 'Grenada', 'Saint George', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),

-- Guam
('Tumon', 'Guam', 'Tumon', ARRAY['Oceania', 'Oceania'], NULL),

-- Guatemala
('Antigua Guatemala', 'Guatemala', 'Sacatepéquez', ARRAY['North America', 'Central America'], NULL),
('Lake Atitlán (Panajachel)', 'Guatemala', 'Sololá', ARRAY['North America', 'Central America'], NULL),

-- Guyana
('Georgetown', 'Guyana', 'Demerara-Mahaica', ARRAY['South America', 'South America'], NULL),

-- Honduras
('Roatán', 'Honduras', 'Bay Islands', ARRAY['North America', 'Central America'], NULL),

-- Hungary
('Budapest', 'Hungary', 'Budapest', ARRAY['Europe', 'Europe'], NULL),

-- Iceland
('Reykjavik', 'Iceland', 'Capital Region', ARRAY['Europe', 'Europe'], NULL),

-- India
('Goa (Panaji)', 'India', 'Goa', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Pondicherry', 'India', 'Puducherry', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),

-- Indonesia
('Bali (Ubud)', 'Indonesia', 'Bali', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Bali (Canggu)', 'Indonesia', 'Bali', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Lombok', 'Indonesia', 'West Nusa Tenggara', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),

-- Ireland
('Cork', 'Ireland', 'County Cork', ARRAY['Europe', 'Europe'], NULL),
('Dublin', 'Ireland', 'County Dublin', ARRAY['Europe', 'Europe'], NULL),
('Galway', 'Ireland', 'County Galway', ARRAY['Europe', 'Europe'], NULL),

-- Israel
('Tel Aviv', 'Israel', 'Tel Aviv', ARRAY['Asia', 'Mediterranean'], 'Mediterranean climate'),

-- Italy
('Amalfi Coast', 'Italy', 'Campania', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Bologna', 'Italy', 'Emilia-Romagna', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Florence', 'Italy', 'Tuscany', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Lake Como', 'Italy', 'Lombardy', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Milan', 'Italy', 'Lombardy', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Naples', 'Italy', 'Campania', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Palermo', 'Italy', 'Sicily', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Puglia (Lecce)', 'Italy', 'Puglia', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Rome', 'Italy', 'Lazio', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Sicily (Taormina)', 'Italy', 'Sicily', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Turin', 'Italy', 'Piedmont', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Venice', 'Italy', 'Veneto', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Verona', 'Italy', 'Veneto', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),

-- Jamaica
('Kingston', 'Jamaica', 'Kingston', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),
('Montego Bay', 'Jamaica', 'Saint James', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),
('Negril', 'Jamaica', 'Westmoreland', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),
('Ocho Rios', 'Jamaica', 'Saint Ann', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),

-- Japan
('Kyoto', 'Japan', 'Kyoto', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Naha (Okinawa)', 'Japan', 'Okinawa', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Osaka', 'Japan', 'Osaka', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Tokyo', 'Japan', 'Tokyo', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),

-- Jordan
('Amman', 'Jordan', 'Amman', ARRAY['Asia', 'Asia'], NULL),

-- Kenya
('Nairobi', 'Kenya', 'Nairobi', ARRAY['Africa', 'Africa'], NULL),

-- Laos
('Luang Prabang', 'Laos', 'Luang Prabang', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Vientiane', 'Laos', 'Vientiane', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),

-- Latvia
('Riga', 'Latvia', 'Riga', ARRAY['Europe', 'Europe'], NULL),

-- Lebanon
('Beirut', 'Lebanon', 'Beirut', ARRAY['Asia', 'Mediterranean'], 'Mediterranean climate'),

-- Lithuania
('Vilnius', 'Lithuania', 'Vilnius', ARRAY['Europe', 'Europe'], NULL),

-- Luxembourg
('Luxembourg City', 'Luxembourg', 'Luxembourg', ARRAY['Europe', 'Europe'], NULL),

-- Malaysia
('George Town (Penang)', 'Malaysia', 'Penang', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Ipoh', 'Malaysia', 'Perak', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Kota Kinabalu', 'Malaysia', 'Sabah', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Kuala Lumpur', 'Malaysia', 'Federal Territory', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Kuching', 'Malaysia', 'Sarawak', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Langkawi', 'Malaysia', 'Kedah', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),

-- Malta
('Valletta', 'Malta', 'South Eastern', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Sliema', 'Malta', 'Northern Harbour', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),

-- Mauritius
('Grand Baie', 'Mauritius', 'Rivière du Rempart', ARRAY['Africa', 'Africa'], NULL),
('Port Louis', 'Mauritius', 'Port Louis', ARRAY['Africa', 'Africa'], NULL),

-- Mexico
('Ajijic', 'Mexico', 'Jalisco', ARRAY['North America', 'North America'], NULL),
('Cancun', 'Mexico', 'Quintana Roo', ARRAY['North America', 'North America'], NULL),
('Cozumel', 'Mexico', 'Quintana Roo', ARRAY['North America', 'North America'], NULL),
('Guadalajara', 'Mexico', 'Jalisco', ARRAY['North America', 'North America'], NULL),
('Guanajuato', 'Mexico', 'Guanajuato', ARRAY['North America', 'North America'], NULL),
('La Paz', 'Mexico', 'Baja California Sur', ARRAY['North America', 'North America'], NULL),
('Mazatlán', 'Mexico', 'Sinaloa', ARRAY['North America', 'North America'], NULL),
('Mérida', 'Mexico', 'Yucatán', ARRAY['North America', 'North America'], NULL),
('Mexico City', 'Mexico', 'Federal District', ARRAY['North America', 'North America'], NULL),
('Oaxaca', 'Mexico', 'Oaxaca', ARRAY['North America', 'North America'], NULL),
('Playa del Carmen', 'Mexico', 'Quintana Roo', ARRAY['North America', 'North America'], NULL),
('Puerto Escondido', 'Mexico', 'Oaxaca', ARRAY['North America', 'North America'], NULL),
('Puerto Vallarta', 'Mexico', 'Jalisco', ARRAY['North America', 'North America'], NULL),
('San Cristóbal de las Casas', 'Mexico', 'Chiapas', ARRAY['North America', 'North America'], NULL),
('San Miguel de Allende', 'Mexico', 'Guanajuato', ARRAY['North America', 'North America'], NULL),
('Tulum', 'Mexico', 'Quintana Roo', ARRAY['North America', 'North America'], NULL),

-- Monaco
('Monte Carlo', 'Monaco', 'Monte Carlo', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),

-- Montenegro
('Budva', 'Montenegro', 'Budva', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Kotor', 'Montenegro', 'Kotor', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),

-- Morocco
('Casablanca', 'Morocco', 'Casablanca-Settat', ARRAY['Africa', 'Africa'], NULL),
('Essaouira', 'Morocco', 'Marrakesh-Safi', ARRAY['Africa', 'Africa'], NULL),
('Marrakech', 'Morocco', 'Marrakesh-Safi', ARRAY['Africa', 'Africa'], NULL),
('Tangier', 'Morocco', 'Tanger-Tetouan-Al Hoceima', ARRAY['Africa', 'Africa'], NULL),

-- Myanmar
('Yangon', 'Myanmar', 'Yangon', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),

-- Netherlands
('Amsterdam', 'Netherlands', 'North Holland', ARRAY['Europe', 'Europe'], NULL),
('Rotterdam', 'Netherlands', 'South Holland', ARRAY['Europe', 'Europe'], NULL),
('Utrecht', 'Netherlands', 'Utrecht', ARRAY['Europe', 'Europe'], NULL),

-- New Zealand
('Auckland', 'New Zealand', 'Auckland', ARRAY['Oceania', 'Australia & New Zealand'], NULL),
('Christchurch', 'New Zealand', 'Canterbury', ARRAY['Oceania', 'Australia & New Zealand'], NULL),
('Nelson', 'New Zealand', 'Nelson', ARRAY['Oceania', 'Australia & New Zealand'], NULL),
('Queenstown', 'New Zealand', 'Otago', ARRAY['Oceania', 'Australia & New Zealand'], NULL),
('Wellington', 'New Zealand', 'Wellington', ARRAY['Oceania', 'Australia & New Zealand'], NULL),

-- Nicaragua
('Granada', 'Nicaragua', 'Granada', ARRAY['North America', 'Central America'], NULL),
('San Juan del Sur', 'Nicaragua', 'Rivas', ARRAY['North America', 'Central America'], NULL),

-- Norway
('Bergen', 'Norway', 'Vestland', ARRAY['Europe', 'Europe'], NULL),
('Oslo', 'Norway', 'Oslo', ARRAY['Europe', 'Europe'], NULL),

-- Pakistan
('Islamabad', 'Pakistan', 'Capital Territory', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),

-- Panama
('Boquete', 'Panama', 'Chiriquí', ARRAY['North America', 'Central America'], NULL),
('Bocas del Toro', 'Panama', 'Bocas del Toro', ARRAY['North America', 'Central America'], NULL),
('Coronado', 'Panama', 'Panamá Oeste', ARRAY['North America', 'Central America'], NULL),
('David', 'Panama', 'Chiriquí', ARRAY['North America', 'Central America'], NULL),
('El Valle de Antón', 'Panama', 'Coclé', ARRAY['North America', 'Central America'], NULL),
('Las Tablas', 'Panama', 'Los Santos', ARRAY['North America', 'Central America'], NULL),
('Panama City', 'Panama', 'Panamá', ARRAY['North America', 'Central America'], NULL),
('Pedasí', 'Panama', 'Los Santos', ARRAY['North America', 'Central America'], NULL),

-- Paraguay
('Asunción', 'Paraguay', 'Capital District', ARRAY['South America', 'South America'], NULL),

-- Peru
('Arequipa', 'Peru', 'Arequipa', ARRAY['South America', 'South America'], NULL),
('Cusco', 'Peru', 'Cusco', ARRAY['South America', 'South America'], NULL),
('Lima', 'Peru', 'Lima', ARRAY['South America', 'South America'], NULL),
('Trujillo', 'Peru', 'La Libertad', ARRAY['South America', 'South America'], NULL),

-- Philippines
('Baguio', 'Philippines', 'Benguet', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Cebu City', 'Philippines', 'Cebu', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Davao', 'Philippines', 'Davao del Sur', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Dumaguete', 'Philippines', 'Negros Oriental', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Iloilo City', 'Philippines', 'Iloilo', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Manila', 'Philippines', 'Metro Manila', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Siargao', 'Philippines', 'Surigao del Norte', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Tagaytay', 'Philippines', 'Cavite', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),

-- Poland
('Krakow', 'Poland', 'Lesser Poland', ARRAY['Europe', 'Europe'], NULL),
('Warsaw', 'Poland', 'Masovian', ARRAY['Europe', 'Europe'], NULL),
('Wroclaw', 'Poland', 'Lower Silesian', ARRAY['Europe', 'Europe'], NULL),

-- Portugal
('Albufeira', 'Portugal', 'Algarve', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Aveiro', 'Portugal', 'Aveiro', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Braga', 'Portugal', 'Braga', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Cascais', 'Portugal', 'Lisbon', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Coimbra', 'Portugal', 'Coimbra', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Funchal (Madeira)', 'Portugal', 'Madeira', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Lagos', 'Portugal', 'Algarve', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Lisbon', 'Portugal', 'Lisbon', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Porto', 'Portugal', 'Porto', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Sintra', 'Portugal', 'Lisbon', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Tavira', 'Portugal', 'Algarve', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),

-- Puerto Rico
('Aguadilla', 'Puerto Rico', 'Aguadilla', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),
('Dorado', 'Puerto Rico', 'Dorado', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),
('Ponce', 'Puerto Rico', 'Ponce', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),
('Rincón', 'Puerto Rico', 'Rincón', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),
('San Juan', 'Puerto Rico', 'San Juan', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),

-- Romania
('Brasov', 'Romania', 'Brașov', ARRAY['Europe', 'Europe'], NULL),
('Bucharest', 'Romania', 'Bucharest', ARRAY['Europe', 'Europe'], NULL),
('Cluj-Napoca', 'Romania', 'Cluj', ARRAY['Europe', 'Europe'], NULL),
('Sibiu', 'Romania', 'Sibiu', ARRAY['Europe', 'Europe'], NULL),

-- Saint Kitts & Nevis
('Basseterre', 'Saint Kitts and Nevis', 'Saint George Basseterre', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),

-- Saint Lucia
('Castries', 'Saint Lucia', 'Castries', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),
('Rodney Bay', 'Saint Lucia', 'Gros Islet', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),

-- Seychelles
('Victoria (Mahé)', 'Seychelles', 'Mahé', ARRAY['Africa', 'Africa'], NULL),

-- Singapore
('Singapore', 'Singapore', 'Central', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),

-- Slovakia
('Bratislava', 'Slovakia', 'Bratislava', ARRAY['Europe', 'Europe'], NULL),

-- Slovenia
('Ljubljana', 'Slovenia', 'Ljubljana', ARRAY['Europe', 'Europe'], NULL),
('Piran', 'Slovenia', 'Piran', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),

-- South Africa
('Cape Town', 'South Africa', 'Western Cape', ARRAY['Africa', 'Africa'], NULL),
('Durban', 'South Africa', 'KwaZulu-Natal', ARRAY['Africa', 'Africa'], NULL),
('Johannesburg', 'South Africa', 'Gauteng', ARRAY['Africa', 'Africa'], NULL),

-- South Korea
('Busan', 'South Korea', 'Busan', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Seoul', 'South Korea', 'Seoul', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),

-- Spain
('Alicante', 'Spain', 'Valencia', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Barcelona', 'Spain', 'Catalonia', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Bilbao', 'Spain', 'Basque Country', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Granada', 'Spain', 'Andalusia', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Gran Canaria', 'Spain', 'Canary Islands', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Madrid', 'Spain', 'Madrid', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Málaga', 'Spain', 'Andalusia', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Mallorca (Palma)', 'Spain', 'Balearic Islands', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('San Sebastián', 'Spain', 'Basque Country', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Seville', 'Spain', 'Andalusia', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Tenerife', 'Spain', 'Canary Islands', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),
('Valencia', 'Spain', 'Valencia', ARRAY['Europe', 'Mediterranean'], 'Mediterranean climate'),

-- Sri Lanka
('Colombo', 'Sri Lanka', 'Western', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Galle', 'Sri Lanka', 'Southern', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),

-- Sweden
('Gothenburg', 'Sweden', 'Västra Götaland', ARRAY['Europe', 'Europe'], NULL),
('Stockholm', 'Sweden', 'Stockholm', ARRAY['Europe', 'Europe'], NULL),

-- Switzerland
('Basel', 'Switzerland', 'Basel-Stadt', ARRAY['Europe', 'Europe'], NULL),
('Geneva', 'Switzerland', 'Geneva', ARRAY['Europe', 'Europe'], NULL),
('Lucerne', 'Switzerland', 'Lucerne', ARRAY['Europe', 'Europe'], NULL),
('Lugano', 'Switzerland', 'Ticino', ARRAY['Europe', 'Europe'], NULL),
('Zurich', 'Switzerland', 'Zurich', ARRAY['Europe', 'Europe'], NULL),

-- Taiwan
('Kaohsiung', 'Taiwan', 'Kaohsiung', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Taichung', 'Taiwan', 'Taichung', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Taipei', 'Taiwan', 'Taipei', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),

-- Tanzania
('Zanzibar', 'Tanzania', 'Zanzibar', ARRAY['Africa', 'Africa'], NULL),

-- Thailand
('Bangkok', 'Thailand', 'Bangkok', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Chiang Mai', 'Thailand', 'Chiang Mai', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Chiang Rai', 'Thailand', 'Chiang Rai', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Hua Hin', 'Thailand', 'Prachuap Khiri Khan', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Koh Samui', 'Thailand', 'Surat Thani', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Krabi', 'Thailand', 'Krabi', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Pattaya', 'Thailand', 'Chonburi', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Phuket', 'Thailand', 'Phuket', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),

-- Trinidad & Tobago
('Port of Spain', 'Trinidad and Tobago', 'Port of Spain', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),

-- Tunisia
('Tunis', 'Tunisia', 'Tunis', ARRAY['Africa', 'Africa'], NULL),

-- Turkey
('Alanya', 'Turkey', 'Antalya', ARRAY['Asia', 'Mediterranean'], 'Mediterranean climate'),
('Antalya', 'Turkey', 'Antalya', ARRAY['Asia', 'Mediterranean'], 'Mediterranean climate'),
('Bodrum', 'Turkey', 'Muğla', ARRAY['Asia', 'Mediterranean'], 'Mediterranean climate'),
('Istanbul', 'Turkey', 'Istanbul', ARRAY['Asia', 'Mediterranean'], 'Mediterranean climate'),

-- Turks & Caicos Islands
('Grace Bay', 'Turks and Caicos Islands', 'Providenciales', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),

-- UK
('Bath', 'United Kingdom', 'Somerset', ARRAY['Europe', 'Europe'], NULL),
('Brighton', 'United Kingdom', 'East Sussex', ARRAY['Europe', 'Europe'], NULL),
('Bristol', 'United Kingdom', 'Bristol', ARRAY['Europe', 'Europe'], NULL),
('Cambridge', 'United Kingdom', 'Cambridgeshire', ARRAY['Europe', 'Europe'], NULL),
('Edinburgh', 'United Kingdom', 'Scotland', ARRAY['Europe', 'Europe'], NULL),
('London', 'United Kingdom', 'Greater London', ARRAY['Europe', 'Europe'], NULL),
('Manchester', 'United Kingdom', 'Greater Manchester', ARRAY['Europe', 'Europe'], NULL),
('Newcastle (UK)', 'United Kingdom', 'Tyne and Wear', ARRAY['Europe', 'Europe'], NULL),
('Oxford', 'United Kingdom', 'Oxfordshire', ARRAY['Europe', 'Europe'], NULL),

-- United Arab Emirates
('Dubai', 'United Arab Emirates', 'Dubai', ARRAY['Asia', 'Asia'], NULL),
('Abu Dhabi', 'United Arab Emirates', 'Abu Dhabi', ARRAY['Asia', 'Asia'], NULL),

-- Uruguay
('Colonia del Sacramento', 'Uruguay', 'Colonia', ARRAY['South America', 'South America'], NULL),
('Montevideo', 'Uruguay', 'Montevideo', ARRAY['South America', 'South America'], NULL),
('Piriápolis', 'Uruguay', 'Maldonado', ARRAY['South America', 'South America'], NULL),
('Punta del Este', 'Uruguay', 'Maldonado', ARRAY['South America', 'South America'], NULL),

-- US Virgin Islands
('Charlotte Amalie', 'US Virgin Islands', 'Saint Thomas', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),
('Cruz Bay', 'US Virgin Islands', 'Saint John', ARRAY['North America', 'Caribbean'], 'Tropical Caribbean climate'),

-- Vanuatu
('Port Vila', 'Vanuatu', 'Shefa', ARRAY['Oceania', 'Oceania'], NULL),

-- Vietnam
('Da Nang', 'Vietnam', 'Da Nang', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Hanoi', 'Vietnam', 'Hanoi', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Ho Chi Minh City', 'Vietnam', 'Ho Chi Minh City', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Hoi An', 'Vietnam', 'Quang Nam', ARRAY['Asia', 'Asia'], 'Varied Asian climate'),
('Nha Trang', 'Vietnam', 'Khanh Hoa', ARRAY['Asia', 'Asia'], 'Varied Asian climate')

ON CONFLICT (name, country) DO NOTHING;

-- Show final results
SELECT COUNT(*) as final_count FROM towns;
SELECT country, COUNT(*) as count 
FROM towns 
GROUP BY country 
ORDER BY count DESC, country;

-- Show any towns that might have been skipped due to conflicts
SELECT 'Import complete. Any missing towns were already in the database.' as status;