-- Check which towns exist and would match our WHERE clauses
SELECT 
    name,
    CASE 
        WHEN name = 'Chester' THEN 'MATCH'
        WHEN name = 'Digby' THEN 'MATCH'
        WHEN name = 'Lockeport' THEN 'MATCH'
        WHEN name = 'Lunenburg' THEN 'MATCH'
        WHEN name = 'Mahone Bay' THEN 'MATCH'
        WHEN name = 'Peggy''s Cove' THEN 'MATCH'
        WHEN name = 'Truro' THEN 'MATCH'
        WHEN name = 'Yarmouth' THEN 'MATCH'
        WHEN name = 'Calgary' THEN 'MATCH'
        WHEN name = 'Charlottetown' THEN 'MATCH'
        WHEN name = 'Halifax' THEN 'MATCH'
        WHEN name = 'Kelowna' THEN 'MATCH'
        WHEN name = 'Kingston' THEN 'MATCH'
        WHEN name = 'London (ON)' THEN 'MATCH'
        WHEN name = 'Moncton' THEN 'MATCH'
        WHEN name = 'Niagara-on-the-Lake' THEN 'MATCH'
        WHEN name = 'Ottawa' THEN 'MATCH'
        WHEN name = 'Victoria' THEN 'MATCH'
        ELSE 'NO MATCH'
    END as match_status
FROM towns
WHERE country = 'Canada'
ORDER BY name;
