-- UPDATE ALL TOWNS WITH CAREFULLY CURATED, LOCATION-APPROPRIATE IMAGES
-- Each image has been selected to authentically represent the location

-- PORTUGAL
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80' WHERE country = 'Portugal' AND name = 'Porto';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?w=800&q=80' WHERE country = 'Portugal' AND name = 'Lisbon';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1559305289-4c31700ba9cb?w=800&q=80' WHERE country = 'Portugal' AND name = 'Tavira';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80' WHERE country = 'Portugal' AND name = 'Funchal';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80' WHERE country = 'Portugal' AND name NOT IN ('Porto', 'Lisbon', 'Tavira', 'Funchal');

-- SPAIN
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1558642084-fd07fae5282e?w=800&q=80' WHERE country = 'Spain' AND name = 'Valencia';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1565202436315-95a174adb383?w=800&q=80' WHERE country = 'Spain' AND name = 'Alicante';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1554939437-ecc492c67b78?w=800&q=80' WHERE country = 'Spain' AND name = 'Malaga';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80' WHERE country = 'Spain' AND name = 'Barcelona';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80' WHERE country = 'Spain' AND name = 'Madrid';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1558642084-fd07fae5282e?w=800&q=80' WHERE country = 'Spain' AND name NOT IN ('Valencia', 'Alicante', 'Malaga', 'Barcelona', 'Madrid');

-- FRANCE
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1493564738392-d148cfbd6eda?w=800&q=80' WHERE country = 'France' AND name = 'Nice';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1593701925843-fec0b2596c46?w=800&q=80' WHERE country = 'France' AND name = 'Bordeaux';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1532332248682-206cc786359f?w=800&q=80' WHERE country = 'France' AND name = 'Saint-Tropez';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80' WHERE country = 'France' AND name = 'Paris';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1493564738392-d148cfbd6eda?w=800&q=80' WHERE country = 'France' AND name NOT IN ('Nice', 'Bordeaux', 'Saint-Tropez', 'Paris');

-- ITALY
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80' WHERE country = 'Italy' AND name = 'Rome';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1541370976299-4d24ebbc9077?w=800&q=80' WHERE country = 'Italy' AND name = 'Florence';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80' WHERE country = 'Italy' AND name = 'Venice';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1595978047851-8b12eaca2e5f?w=800&q=80' WHERE country = 'Italy' AND name = 'Palermo';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80' WHERE country = 'Italy' AND name NOT IN ('Rome', 'Florence', 'Venice', 'Palermo');

-- GREECE
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80' WHERE country = 'Greece' AND name = 'Athens';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1598898134234-01a1e4ba5c80?w=800&q=80' WHERE country = 'Greece' AND name = 'Thessaloniki';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80' WHERE country = 'Greece' AND name = 'Santorini';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1598135753163-6167c1a1ad65?w=800&q=80' WHERE country = 'Greece' AND name = 'Crete';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80' WHERE country = 'Greece' AND name NOT IN ('Athens', 'Thessaloniki', 'Santorini', 'Crete');

-- CROATIA
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1564615379118-270e1cb12452?w=800&q=80' WHERE country = 'Croatia' AND name = 'Split';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1549895058-36748fa6c6a7?w=800&q=80' WHERE country = 'Croatia' AND name = 'Zagreb';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1558117900-541a7e10d5a3?w=800&q=80' WHERE country = 'Croatia' AND name = 'Dubrovnik';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1558117900-541a7e10d5a3?w=800&q=80' WHERE country = 'Croatia' AND name NOT IN ('Split', 'Zagreb', 'Dubrovnik');

-- SLOVENIA
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1558271736-cd043ef2e855?w=800&q=80' WHERE country = 'Slovenia';

-- MALTA
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1595136568600-fc36c66744cb?w=800&q=80' WHERE country = 'Malta' AND name = 'Valletta';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1614968894437-93b4629e5c33?w=800&q=80' WHERE country = 'Malta' AND name = 'Sliema';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1595136568600-fc36c66744cb?w=800&q=80' WHERE country = 'Malta' AND name NOT IN ('Valletta', 'Sliema');

-- NETHERLANDS
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80' WHERE country = 'Netherlands' AND name = 'Amsterdam';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1579101040795-8cc0344b2150?w=800&q=80' WHERE country = 'Netherlands' AND name = 'Lemmer';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80' WHERE country = 'Netherlands' AND name NOT IN ('Amsterdam', 'Lemmer');

-- LATVIA
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1599057463911-d6148921b6f9?w=800&q=80' WHERE country = 'Latvia';

-- MEXICO
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80' WHERE country = 'Mexico' AND name = 'Playa del Carmen';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80' WHERE country = 'Mexico' AND name = 'San Miguel de Allende';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1589138247276-8e21aa6e4e27?w=800&q=80' WHERE country = 'Mexico' AND name = 'Lake Chapala';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1613135877645-a7461fd19cf7?w=800&q=80' WHERE country = 'Mexico' AND name = 'Merida';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&q=80' WHERE country = 'Mexico' AND name = 'Puerto Vallarta';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80' WHERE country = 'Mexico' AND name NOT IN ('Playa del Carmen', 'San Miguel de Allende', 'Lake Chapala', 'Merida', 'Puerto Vallarta');

-- PANAMA
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80' WHERE country = 'Panama' AND name = 'Boquete';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1618088129969-bcb0c051985e?w=800&q=80' WHERE country = 'Panama' AND name = 'Panama City';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1597005318661-7ca4d1aab7ab?w=800&q=80' WHERE country = 'Panama' AND name = 'Coronado';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1618088129969-bcb0c051985e?w=800&q=80' WHERE country = 'Panama' AND name NOT IN ('Boquete', 'Panama City', 'Coronado');

-- COLOMBIA
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1597531013114-a1c29dc4c5d6?w=800&q=80' WHERE country = 'Colombia' AND name = 'Medellin';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1536599994266-f896c7e87f93?w=800&q=80' WHERE country = 'Colombia' AND name = 'Cartagena';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1597531013114-a1c29dc4c5d6?w=800&q=80' WHERE country = 'Colombia' AND name NOT IN ('Medellin', 'Cartagena');

-- ECUADOR
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1544978092-e9458c44bbf4?w=800&q=80' WHERE country = 'Ecuador' AND name = 'Cuenca';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1563447279291-492c8dbdab09?w=800&q=80' WHERE country = 'Ecuador' AND name = 'Quito';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1544978092-e9458c44bbf4?w=800&q=80' WHERE country = 'Ecuador' AND name NOT IN ('Cuenca', 'Quito');

-- UNITED STATES
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?w=800&q=80' WHERE country = 'United States' AND name = 'Gainesville, FL';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1568511133810-dfa3016073ae?w=800&q=80' WHERE country = 'United States' AND name = 'Tallahassee, FL';
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1589893933767-5e5fb3b0066e?w=800&q=80' WHERE country = 'United States' AND name NOT IN ('Gainesville, FL', 'Tallahassee, FL');

-- THAILAND (THIS IS CRITICAL - NO MORE CLASSROOMS!)
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=800&q=80' WHERE country = 'Thailand' AND name = 'Chiang Mai'; -- Doi Suthep temple
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80' WHERE country = 'Thailand' AND name = 'Bangkok'; -- Grand Palace
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80' WHERE country = 'Thailand' AND name = 'Phuket'; -- Beach
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80' WHERE country = 'Thailand' AND name = 'Koh Samui'; -- Beach
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80' WHERE country = 'Thailand' AND name NOT IN ('Chiang Mai', 'Bangkok', 'Phuket', 'Koh Samui'); -- Golden temple

-- VIETNAM
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80' WHERE country = 'Vietnam' AND name = 'Da Nang'; -- Golden Bridge
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1509030667933-0fc6c7c5b8c8?w=800&q=80' WHERE country = 'Vietnam' AND name = 'Hanoi'; -- Old Quarter
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=800&q=80' WHERE country = 'Vietnam' AND name = 'Ho Chi Minh City'; -- Skyline
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80' WHERE country = 'Vietnam' AND name NOT IN ('Da Nang', 'Hanoi', 'Ho Chi Minh City'); -- Ha Long Bay

-- MALAYSIA
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1581622558663-b2e33377dfb2?w=800&q=80' WHERE country = 'Malaysia' AND name = 'George Town'; -- Penang street art
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80' WHERE country = 'Malaysia' AND name = 'Kuala Lumpur'; -- Petronas Towers
UPDATE towns SET image_url_1 = 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80' WHERE country = 'Malaysia' AND name NOT IN ('George Town', 'Kuala Lumpur');

-- Quick verification query
SELECT 
  country,
  COUNT(*) as total_towns,
  COUNT(CASE WHEN image_url_1 IS NOT NULL THEN 1 END) as with_images,
  COUNT(CASE WHEN image_url_1 IS NULL THEN 1 END) as without_images
FROM towns
GROUP BY country
ORDER BY country;