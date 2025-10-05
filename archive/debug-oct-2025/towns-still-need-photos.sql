-- Show which towns still need photos (sorted by country)
SELECT name, country
FROM towns
WHERE image_url_1 IS NULL
ORDER BY country, name;
