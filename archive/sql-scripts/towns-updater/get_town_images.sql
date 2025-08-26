-- Get image URLs for specific towns
SELECT id, name, country, image_url 
FROM towns 
WHERE name IN ('St Tropez', 'Medellin', 'Porto', 'Lisbon', 'Paris', 'Barcelona', 'Rome')
   OR name LIKE '%Tropez%' 
   OR name LIKE '%Medellin%'
   OR name LIKE '%Medellín%'
ORDER BY name;
