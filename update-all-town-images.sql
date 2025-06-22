-- Complete SQL script to update all town images with Wikimedia Commons photos
-- Run this entire script in your Supabase SQL editor

-- First, add attribution columns to the towns table (if they don't exist)
ALTER TABLE towns ADD COLUMN IF NOT EXISTS image_source VARCHAR(50);
ALTER TABLE towns ADD COLUMN IF NOT EXISTS image_license VARCHAR(50);
ALTER TABLE towns ADD COLUMN IF NOT EXISTS image_photographer VARCHAR(200);

-- Update all towns with high-quality Wikimedia Commons images

-- Towns from first batch:
UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Chiang_Mai_-_Chiang_Mai_City_Art_and_Cultural_Center_-_Panorama_0001.jpg/1600px-Chiang_Mai_-_Chiang_Mai_City_Art_and_Cultural_Center_-_Panorama_0001.jpg',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 3.0',
  image_photographer = 'Stefan Fussan'
WHERE id = '334739b3-016c-4cda-af2b-1b90116aee3f'; -- Chiang Mai, Thailand

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Bright_Da_Nang_skyline_%28Unsplash%29.jpg/1600px-Bright_Da_Nang_skyline_%28Unsplash%29.jpg',
  image_source = 'wikimedia',
  image_license = 'CC0',
  image_photographer = 'NGO TUNG thanhtungo'
WHERE id = '87c5eae0-a082-4be2-8c68-fe9c12ebf4a9'; -- Da Nang, Vietnam

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Gainesville%2C_FL_Downtown.jpg/1600px-Gainesville%2C_FL_Downtown.jpg',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 4.0',
  image_photographer = 'Rbrko'
WHERE id = '8e68b280-3df1-40da-bfae-82165733670d'; -- Gainesville, FL, United States

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Panorama_of_northern-George_Town_01.jpg/1600px-Panorama_of_northern-George_Town_01.jpg',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 4.0',
  image_photographer = 'C.W. Tan'
WHERE id = 'ded71538-e2ec-4dcb-923b-7bbeb1cde1a6'; -- George Town, Malaysia

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Slovenia_032_Ljubljana_Ljubljanskigrad_-_castle_%28170884671%29.jpg/1600px-Slovenia_032_Ljubljana_Ljubljanskigrad_-_castle_%28170884671%29.jpg',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 2.0',
  image_photographer = 'discosour'
WHERE id = '547d28f9-8636-471d-9b8e-0bc6df0973eb'; -- Ljubljana, Slovenia

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Medellin_panorama.jpg/1600px-Medellin_panorama.jpg',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 3.0'
WHERE id = 'f230aa00-6117-48c1-a1ae-4b3c9209f419'; -- Medellin, Colombia

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Panorama_of_Site_-_Uxmal_Archaeological_Site_-_Merida_-_Mexico.jpg/1600px-Panorama_of_Site_-_Uxmal_Archaeological_Site_-_Merida_-_Mexico.jpg',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 3.0',
  image_photographer = 'Adam Jones, Ph.D.'
WHERE id = 'a718f196-6f83-4a49-9554-94ae4e33fb22'; -- Merida, Mexico

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Cloudy_Paris_cityscape_%28Unsplash%29.jpg/1600px-Cloudy_Paris_cityscape_%28Unsplash%29.jpg',
  image_source = 'wikimedia',
  image_license = 'CC0',
  image_photographer = 'Grzegorz Mleczek'
WHERE id = 'e24030b5-7d4a-428f-ba7c-b43c81c36cba'; -- Paris, France

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Porto_Cityscape.jpg/1600px-Porto_Cityscape.jpg',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 4.0',
  image_photographer = 'Justraveling.com'
WHERE id = 'd2085a2d-03db-4248-8aa8-5f73fab0ecc6'; -- Porto, Portugal

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Riga_Skyline_Panorama%2C_Latvia_-_Diliff.jpg/1600px-Riga_Skyline_Panorama%2C_Latvia_-_Diliff.jpg',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 3.0',
  image_photographer = 'Diliff'
WHERE id = '93742f05-d232-4c68-a4f5-ff31f7460559'; -- Riga, Latvia

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/View_of_Rome_from_Viale_della_Trinita_dei_Monti.jpg/1600px-View_of_Rome_from_Viale_della_Trinita_dei_Monti.jpg',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 4.0',
  image_photographer = 'Krzysztof Golik'
WHERE id = 'e06a5b56-e6f6-4fb8-8f4c-db747b935198'; -- Rome, Italy

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Panorama_San_Miguel_de_Allende.jpg/1600px-Panorama_San_Miguel_de_Allende.jpg',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 3.0',
  image_photographer = 'César Guadarrama'
WHERE id = 'f34aa383-9d64-4957-8c34-e4dc9e3e2f73'; -- San Miguel de Allende, Mexico

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Valencia._Vista_general_LCCN94512227.tif/lossy-page1-1600px-Valencia._Vista_general_LCCN94512227.tif.jpg',
  image_source = 'wikimedia',
  image_license = 'Public domain'
WHERE id = '3fadbd1c-04d3-4a0a-9b10-64baf7d1dd5c'; -- Valencia, Spain

-- Towns from second batch (your problem towns):
UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Vista_de_Alicante%2C_Espa%C3%B1a%2C_2014-07-04%2C_DD_67-70_PAN.JPG/1600px-Vista_de_Alicante%2C_Espa%C3%B1a%2C_2014-07-04%2C_DD_67-70_PAN.JPG',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 3.0'
WHERE id = '104f60bd-12a3-44ca-8a8d-ddbdae8fea6a'; -- Alicante, Spain

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Boquete%2C_Alto_Jaramillo%2C_highlands_of_Chiriqui_Province%2C_Panam%C3%A1.png/1600px-Boquete%2C_Alto_Jaramillo%2C_highlands_of_Chiriqui_Province%2C_Panam%C3%A1.png',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 4.0'
WHERE id = '8f0739b5-20ad-4813-a9bb-f36c26d4195f'; -- Boquete, Panama

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/La_Bourse_Maritime_at_Bordeaux%2C_Nouvelle_Aquitaine%2C_France.jpg/1600px-La_Bourse_Maritime_at_Bordeaux%2C_Nouvelle_Aquitaine%2C_France.jpg',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 4.0'
WHERE id = '5f322c3b-2386-4c43-901f-04f90a883326'; -- Bordeaux, France

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Panorama_Cuenca_-_panoramio.jpg/1600px-Panorama_Cuenca_-_panoramio.jpg',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 3.0'
WHERE id = '6bb2d00d-5572-4701-9dfe-a95d0f02a51d'; -- Cuenca, Ecuador

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Lago_de_Chapala._Panor%C3%A1mica.jpeg/1600px-Lago_de_Chapala._Panor%C3%A1mica.jpeg',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 4.0'
WHERE id = '25c6f8d8-326b-414f-b50f-5944b239e430'; -- Lake Chapala, Mexico

-- Better image for Lemmer (the previous one was not a town view)
UPDATE towns SET 
  image_url_1 = 'https://images.pexels.com/photos/1796715/pexels-photo-1796715.jpeg?auto=compress&cs=tinysrgb&w=1600',
  image_source = 'pexels',
  image_license = 'Free to use'
WHERE id = 'cafb119e-76da-4768-bfb4-9f558c79ffcc'; -- Lemmer, Netherlands

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Lisbon_cityscape_%2822341918126%29.jpg/1600px-Lisbon_cityscape_%2822341918126%29.jpg',
  image_source = 'wikimedia',
  image_license = 'CC BY 2.0',
  image_photographer = 'Bex Walton'
WHERE id = '286843dc-1919-4bf3-bbf6-79b751b20e8a'; -- Lisbon, Portugal

-- Better image for Saint-Tropez (the previous one was a painting)
UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Saint-Tropez_-_Vue_g%C3%A9n%C3%A9rale_2.jpg/1600px-Saint-Tropez_-_Vue_g%C3%A9n%C3%A9rale_2.jpg',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 4.0'
WHERE id = '5178b573-833f-4ad8-a500-0808d96b7a18'; -- Saint-Tropez, France

-- Better image for Split (without snow)
UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Split_skyline.jpg/1600px-Split_skyline.jpg',
  image_source = 'wikimedia',
  image_license = 'CC BY-SA 3.0'
WHERE id = 'b4e183c3-e5c5-4b7a-8295-2c2e44114467'; -- Split, Croatia

UPDATE towns SET 
  image_url_1 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Tavira_%28Portugal%29_%2822976967050%29.jpg/1600px-Tavira_%28Portugal%29_%2822976967050%29.jpg',
  image_source = 'wikimedia',
  image_license = 'CC BY 2.0'
WHERE id = '2e00a26c-874f-4a40-8f29-241d1c970674'; -- Tavira, Portugal

-- Verify all towns now have images
SELECT name, country, image_url_1, image_source, image_license 
FROM towns 
ORDER BY name;