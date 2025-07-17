-- Check image URLs for St Tropez and Medellin
SELECT name, image_url 
FROM towns 
WHERE name IN ('St Tropez', 'Medellin', 'Porto', 'Lisbon', 'Paris', 'Barcelona', 'Rome')
ORDER BY name;

-- Also check for any variations in naming
SELECT name, image_url 
FROM towns 
WHERE name LIKE '%Tropez%' OR name LIKE '%Medellin%' OR name LIKE '%Medellín%';
EOF < /dev/null