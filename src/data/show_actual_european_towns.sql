-- Show what European towns we actually have in the database

-- 1. Show all towns from European countries
SELECT name, country, regions
FROM towns 
WHERE country IN ('Portugal', 'Spain', 'France', 'Italy', 'Greece', 
                 'Netherlands', 'Germany', 'Belgium', 'Austria', 'Switzerland',
                 'Czech Republic', 'Poland', 'Croatia', 'Malta', 'Cyprus',
                 'Slovenia', 'Latvia', 'Estonia', 'Lithuania', 'Hungary',
                 'Slovakia', 'Romania', 'Bulgaria', 'Turkey')
ORDER BY country, name;

-- 2. Count towns by country
SELECT country, COUNT(*) as town_count
FROM towns
WHERE country IN ('Portugal', 'Spain', 'France', 'Italy', 'Greece', 
                 'Netherlands', 'Germany', 'Belgium', 'Austria', 'Switzerland',
                 'Czech Republic', 'Poland', 'Croatia', 'Malta', 'Cyprus',
                 'Slovenia', 'Latvia', 'Estonia', 'Lithuania', 'Hungary',
                 'Slovakia', 'Romania', 'Bulgaria', 'Turkey')
GROUP BY country
ORDER BY country;

-- 3. Show total count
SELECT COUNT(*) as total_european_towns
FROM towns
WHERE country IN ('Portugal', 'Spain', 'France', 'Italy', 'Greece', 
                 'Netherlands', 'Germany', 'Belgium', 'Austria', 'Switzerland',
                 'Czech Republic', 'Poland', 'Croatia', 'Malta', 'Cyprus',
                 'Slovenia', 'Latvia', 'Estonia', 'Lithuania', 'Hungary',
                 'Slovakia', 'Romania', 'Bulgaria', 'Turkey');