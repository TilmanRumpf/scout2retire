-- FIX THAILAND AND OTHER FUCKED UP IMAGES RIGHT NOW

UPDATE towns
SET image_url_1 = CASE
  -- THAILAND - ACTUAL TEMPLE, NOT A FUCKING CLASSROOM
  WHEN country = 'Thailand' AND name LIKE '%Chiang Mai%' THEN 'https://images.unsplash.com/photo-1512553353614-82a7370096dc?w=800&q=80'
  WHEN country = 'Thailand' THEN 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80'
  
  -- Let me fix other countries too while we're at it
  WHEN country = 'Panama' THEN 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80'
  WHEN country = 'Mexico' THEN 'https://images.unsplash.com/photo-1512813389649-acb9131ced20?w=800&q=80'
  WHEN country = 'Portugal' THEN 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80'
  WHEN country = 'Spain' THEN 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80'
  WHEN country = 'Italy' THEN 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80'
  WHEN country = 'Greece' THEN 'https://images.unsplash.com/photo-1503152394-c571994fd383?w=800&q=80'
  WHEN country = 'France' THEN 'https://images.unsplash.com/photo-1491166617655-0723a0999cfc?w=800&q=80'
  WHEN country = 'Netherlands' THEN 'https://images.unsplash.com/photo-1468436385273-8abca6dfd8d3?w=800&q=80'
  WHEN country = 'Malta' THEN 'https://images.unsplash.com/photo-1523531294919-6f3bfeda1c8f?w=800&q=80'
  
  ELSE image_url_1
END
WHERE country IN ('Thailand', 'Panama', 'Mexico', 'Portugal', 'Spain', 'Italy', 'Greece', 'France', 'Netherlands', 'Malta');

-- Check what we're updating
SELECT name, country, 
  SUBSTRING(image_url_1, 1, 60) || '...' as new_image
FROM towns
WHERE country = 'Thailand';