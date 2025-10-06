-- Test simple update
UPDATE towns
SET
    climate = 'Maritime temperate',
    population = 1400,
    nightlife_rating = 4
WHERE name = 'Chester';

SELECT name, climate, population, nightlife_rating FROM towns WHERE name = 'Chester';
