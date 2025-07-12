-- Check what towns are in the database and why imports might have failed

-- 1. Show current count
SELECT COUNT(*) as total_towns FROM towns;

-- 2. Show all unique countries in the database
SELECT DISTINCT country, COUNT(*) as count 
FROM towns 
GROUP BY country 
ORDER BY country;

-- 3. Show sample towns for countries we tried to import
SELECT name, country, region 
FROM towns 
WHERE country IN ('Albania', 'Argentina', 'Australia', 'Mexico', 'Portugal', 'Spain')
ORDER BY country, name;

-- 4. Check for exact country name matches
SELECT name, country FROM towns WHERE country LIKE '%(%' OR country LIKE '%USA%' OR country LIKE '%UK%';

-- 5. Show all towns (to see exact country names)
SELECT name, country FROM towns ORDER BY country, name;