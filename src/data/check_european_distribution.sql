-- Check distribution of European towns and what's missing

-- 1. Show which European countries have towns
SELECT country, COUNT(*) as town_count, array_agg(name ORDER BY name) as towns
FROM towns
WHERE country IN ('Portugal', 'Spain', 'France', 'Italy', 'Greece', 
                 'Netherlands', 'Germany', 'Belgium', 'Austria', 'Switzerland',
                 'Czech Republic', 'Poland', 'Croatia', 'Malta', 'Cyprus',
                 'Slovenia', 'Latvia', 'Estonia', 'Lithuania', 'Hungary',
                 'Slovakia', 'Romania', 'Bulgaria', 'Turkey')
GROUP BY country
ORDER BY town_count DESC, country;

-- 2. Show ALL towns with their countries (to see full database)
SELECT country, COUNT(*) as town_count
FROM towns
GROUP BY country
ORDER BY 
    CASE 
        WHEN country IN ('Portugal', 'Spain', 'France', 'Italy', 'Greece', 'Netherlands', 
                        'Germany', 'Belgium', 'Austria', 'Switzerland', 'Czech Republic', 
                        'Poland', 'Croatia', 'Malta', 'Cyprus', 'Slovenia', 'Latvia', 
                        'Estonia', 'Lithuania', 'Hungary', 'Slovakia', 'Romania', 'Bulgaria', 'Turkey') 
        THEN 0 
        ELSE 1 
    END,
    country;

-- 3. Check if regions are populated for European towns
SELECT name, country, regions, 
       CASE WHEN 'Europe' = ANY(regions) THEN 'Has Europe' ELSE 'Missing Europe' END as europe_tag
FROM towns
WHERE country IN ('Portugal', 'Spain', 'France', 'Italy', 'Greece', 
                 'Netherlands', 'Germany', 'Belgium', 'Austria', 'Switzerland',
                 'Czech Republic', 'Poland', 'Croatia', 'Malta', 'Cyprus',
                 'Slovenia', 'Latvia', 'Estonia', 'Lithuania', 'Hungary',
                 'Slovakia', 'Romania', 'Bulgaria', 'Turkey')
ORDER BY europe_tag DESC, country, name;