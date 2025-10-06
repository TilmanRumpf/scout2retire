-- ============================================================================
-- NOVA SCOTIA TOWNS - ONE-BY-ONE BACKFILL
-- Generated: 2025-10-06T02:32:47.870Z
-- ============================================================================


-- Lunenburg
UPDATE towns
SET region = 'Nova Scotia',
    walkability = 7,
    beaches_nearby = true,
    requires_car = true,
    has_public_transit = false,
    internet_speed = 100,
    healthcare_specialties_available = '{cardiology,oncology,orthopedics,"general surgery"}',
    retirement_visa_available = true,
    visa_requirements = '"90-day visa-free for US citizens, retirement visa available with $2,000/month income"',
    water_bodies = '{"Atlantic Ocean","Lunenburg Bay"}'
WHERE name = 'Lunenburg';


-- Mahone Bay
UPDATE towns
SET region = 'Nova Scotia',
    walkability = 7,
    beaches_nearby = true,
    requires_car = true,
    has_public_transit = false,
    internet_speed = 100,
    healthcare_specialties_available = '{cardiology,oncology,orthopedics,"general surgery"}',
    retirement_visa_available = true,
    visa_requirements = '"90-day visa-free for US citizens, retirement visa available with $2,000/month income"',
    water_bodies = '{"Atlantic Ocean","Mahone Bay"}'
WHERE name = 'Mahone Bay';


-- Peggy's Cove
UPDATE towns
SET region = 'Nova Scotia',
    walkability = 7,
    beaches_nearby = true,
    requires_car = true,
    has_public_transit = false,
    internet_speed = 100,
    healthcare_specialties_available = '{cardiology,oncology,orthopedics,"general surgery"}',
    retirement_visa_available = true,
    visa_requirements = '"90-day visa-free for US citizens, retirement visa available with $2,000/month income"',
    water_bodies = '{"Atlantic Ocean","St. Margarets Bay"}'
WHERE name = 'Peggy''s Cove';


-- Chester
UPDATE towns
SET region = 'Nova Scotia',
    walkability = 7,
    beaches_nearby = true,
    requires_car = true,
    has_public_transit = false,
    internet_speed = 100,
    healthcare_specialties_available = '{cardiology,oncology,orthopedics,"general surgery"}',
    retirement_visa_available = true,
    visa_requirements = '"90-day visa-free for US citizens, retirement visa available with $2,000/month income"',
    water_bodies = '{"Atlantic Ocean","Mahone Bay"}'
WHERE name = 'Chester';


-- Annapolis Royal
UPDATE towns
SET region = 'Nova Scotia',
    walkability = 7,
    beaches_nearby = true,
    requires_car = true,
    has_public_transit = false,
    internet_speed = 100,
    healthcare_specialties_available = '{cardiology,oncology,orthopedics,"general surgery"}',
    retirement_visa_available = true,
    visa_requirements = '"90-day visa-free for US citizens, retirement visa available with $2,000/month income"',
    water_bodies = '{"Atlantic Ocean","Annapolis Basin"}'
WHERE name = 'Annapolis Royal';


-- Digby
UPDATE towns
SET region = 'Nova Scotia',
    walkability = 7,
    beaches_nearby = true,
    requires_car = true,
    has_public_transit = false,
    internet_speed = 100,
    healthcare_specialties_available = '{cardiology,oncology,orthopedics,"general surgery"}',
    retirement_visa_available = true,
    visa_requirements = '"90-day visa-free for US citizens, retirement visa available with $2,000/month income"',
    water_bodies = '{"Atlantic Ocean","Annapolis Basin"}'
WHERE name = 'Digby';


-- Yarmouth
UPDATE towns
SET region = 'Nova Scotia',
    walkability = 7,
    beaches_nearby = true,
    requires_car = true,
    has_public_transit = false,
    internet_speed = 100,
    healthcare_specialties_available = '{cardiology,oncology,orthopedics,"general surgery"}',
    retirement_visa_available = true,
    visa_requirements = '"90-day visa-free for US citizens, retirement visa available with $2,000/month income"',
    water_bodies = '{"Atlantic Ocean","Yarmouth Harbour"}'
WHERE name = 'Yarmouth';


-- Bridgewater
UPDATE towns
SET region = 'Nova Scotia',
    walkability = 7,
    beaches_nearby = true,
    requires_car = true,
    has_public_transit = false,
    internet_speed = 100,
    healthcare_specialties_available = '{cardiology,oncology,orthopedics,"general surgery"}',
    retirement_visa_available = true,
    visa_requirements = '"90-day visa-free for US citizens, retirement visa available with $2,000/month income"',
    water_bodies = '{"LaHave River"}'
WHERE name = 'Bridgewater';


-- Truro
UPDATE towns
SET region = 'Nova Scotia',
    walkability = 7,
    beaches_nearby = true,
    requires_car = true,
    has_public_transit = false,
    internet_speed = 100,
    healthcare_specialties_available = '{cardiology,oncology,orthopedics,"general surgery"}',
    retirement_visa_available = true,
    visa_requirements = '"90-day visa-free for US citizens, retirement visa available with $2,000/month income"',
    water_bodies = '{"Bay of Fundy","Cobequid Bay"}'
WHERE name = 'Truro';


-- Lockeport
UPDATE towns
SET region = 'Nova Scotia',
    walkability = 7,
    beaches_nearby = true,
    requires_car = true,
    has_public_transit = false,
    internet_speed = 100,
    healthcare_specialties_available = '{cardiology,oncology,orthopedics,"general surgery"}',
    retirement_visa_available = true,
    visa_requirements = '"90-day visa-free for US citizens, retirement visa available with $2,000/month income"',
    water_bodies = '{"Atlantic Ocean"}'
WHERE name = 'Lockeport';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT name, region,
       CASE WHEN image_url_1 IS NOT NULL THEN '✅' ELSE '❌' END as image,
       CASE WHEN regions IS NOT NULL THEN '✅' ELSE '❌' END as regions_arr,
       typical_monthly_living_cost as cost
FROM towns
WHERE name IN ('Lunenburg', 'Mahone Bay', 'Peggy''s Cove', 'Chester',
               'Annapolis Royal', 'Digby', 'Yarmouth', 'Bridgewater',
               'Truro', 'Lockeport')
ORDER BY name;
