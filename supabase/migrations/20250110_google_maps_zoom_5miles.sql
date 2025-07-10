-- Update Google Maps links to include zoom level for approximately 5-mile view
-- Google Maps zoom levels: 
-- 13z = ~5 miles (8 km) view
-- 14z = ~3 miles (5 km) view
-- 15z = ~1.5 miles (2.5 km) view

UPDATE towns
SET google_maps_link = 
    'https://www.google.com/maps/place/' || 
    REPLACE(REPLACE(REPLACE(name || ',' || country, ' ', '+'), '''', ''), '++', '+') ||
    '/@13z'
WHERE google_maps_link IS NOT NULL;

-- Alternative format that works better for search with zoom
UPDATE towns
SET google_maps_link = 
    'https://www.google.com/maps/search/' || 
    REPLACE(REPLACE(REPLACE(name || '+' || country, ' ', '+'), ',', ''), '''', '') ||
    '/@zoom=13'
WHERE google_maps_link IS NOT NULL;

-- Even better: Use the data parameter which gives more consistent results
UPDATE towns
SET google_maps_link = 
    'https://www.google.com/maps/search/?api=1&query=' || 
    REPLACE(REPLACE(REPLACE(name || ',' || country, ' ', '+'), '''', ''), '++', '+')
WHERE google_maps_link IS NOT NULL;

-- Note: The zoom level can be added to the URL after Google determines the location
-- For most consistent 5-mile zoom, use this format:
UPDATE towns
SET google_maps_link = 
    CONCAT(
        'https://www.google.com/maps/place/',
        REPLACE(REPLACE(REPLACE(name || ',+' || country, ' ', '+'), '''', ''), ',,', ','),
        '/@',
        CASE 
            -- Add approximate lat/long for known countries (you can expand this)
            WHEN country = 'Mexico' THEN '23.6345,-102.5528,13z'
            WHEN country = 'Thailand' THEN '15.8700,100.9925,13z'
            WHEN country = 'Italy' THEN '41.8719,12.5674,13z'
            WHEN country = 'France' THEN '46.2276,2.2137,13z'
            WHEN country = 'Spain' THEN '40.4637,-3.7492,13z'
            WHEN country = 'Portugal' THEN '39.3999,-8.2245,13z'
            WHEN country = 'United States' THEN '37.0902,-95.7129,13z'
            ELSE ',13z' -- Default zoom without coordinates
        END
    )
WHERE google_maps_link IS NOT NULL;