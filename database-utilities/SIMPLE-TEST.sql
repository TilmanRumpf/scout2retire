-- Simple test - update ONE field on ONE town
UPDATE towns
SET cost_index = 80
WHERE name = 'Annapolis Royal';

-- Verify it worked
SELECT name, cost_index FROM towns WHERE name = 'Annapolis Royal';
