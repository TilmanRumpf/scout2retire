-- Test JSONB fields
UPDATE towns
SET
    activity_infrastructure = jsonb_build_array('parks','trails','beaches'),
    environmental_factors = jsonb_build_array('clean_air','green_spaces'),
    pet_friendliness = to_jsonb(8),
    residency_path_info = '"Canadian permanent residence available"'::jsonb
WHERE name = 'Chester';

SELECT name, activity_infrastructure, pet_friendliness FROM towns WHERE name = 'Chester';
