-- Batch 14: Snorkeling through Street Festivals
-- Universal hobbies
UPDATE hobbies
SET 
  category = 'interest',
  verification_method = 'universal',
  is_universal = true,
  verification_query = NULL,
  verification_notes = 'Stars visible everywhere. Telescopes and apps enhance. Dark skies better but not required.'
WHERE name = 'Stargazing';

UPDATE hobbies
SET 
  category = 'activity',
  verification_method = 'universal',
  is_universal = true,
  verification_query = NULL,
  verification_notes = 'Traditional dance learnable online. Can practice at home. Clubs and callers enhance.'
WHERE name = 'Square Dancing';

-- Location-dependent hobbies with queries
UPDATE hobbies
SET 
  verification_query = 'Find beaches, lakes, dive shops, or swimming areas suitable for snorkeling near {town}',
  verification_notes = 'Requires clear water access. Oceans, lakes, some pools. Equipment available online.'
WHERE name = 'Snorkeling';

UPDATE hobbies
SET 
  verification_query = 'Are there winter snow conditions and trails suitable for snowshoeing near {town}?',
  verification_notes = 'Requires snow coverage. Equipment available online. Winter activity in cold climates.'
WHERE name = 'Snowshoeing';

UPDATE hobbies
SET 
  verification_query = 'Find ski resorts, snowboarding parks, or mountains with snowboarding near {town}',
  verification_notes = 'Requires ski resorts with lifts and snow. Mountain regions in winter.'
WHERE name = 'Snowboarding';

UPDATE hobbies
SET 
  verification_query = 'Are there snowmobile trails, rentals, or winter conditions for snowmobiling near {town}?',
  verification_notes = 'Requires snow, trails, and snowmobile access. Popular in northern regions.'
WHERE name = 'Snowmobiling';

UPDATE hobbies
SET 
  category = 'interest',
  verification_query = 'Find spas, wellness centers, or massage therapy facilities in {town}',
  verification_notes = 'Relaxation and wellness services. Day spas, resorts, wellness centers.'
WHERE name = 'Spa & Wellness';

UPDATE hobbies
SET 
  category = 'interest',
  verification_query = 'Find stained glass studios, workshops, or classes in {town}',
  verification_notes = 'Requires specialized tools, glass cutting, soldering. Studios offer classes.'
WHERE name = 'Stained Glass';

UPDATE hobbies
SET 
  verification_query = 'Find lakes, rivers, ocean access, or SUP rentals in {town}',
  verification_notes = 'Requires calm water bodies. Lakes, bays, slow rivers. Board rentals common.'
WHERE name = 'Stand-up Paddleboarding';

UPDATE hobbies
SET 
  category = 'interest',
  verification_query = 'Are there regular street festivals, art fairs, or community events in {town}?',
  verification_notes = 'Community events vary by location. More common in larger, diverse cities.'
WHERE name = 'Street Festivals';

-- Clean up required_conditions
UPDATE hobbies
SET required_conditions = NULL
WHERE name IN ('Snorkeling', 'Snowboarding', 'Snowmobiling', 'Snowshoeing', 'Spa & Wellness',
               'Square Dancing', 'Stained Glass', 'Stand-up Paddleboarding', 'Stargazing', 'Street Festivals')
  AND required_conditions IS NOT NULL;

-- Verify Batch 14
SELECT name, category, verification_method, is_universal,
       CASE WHEN verification_query IS NOT NULL THEN 'Has Query' ELSE 'No Query' END as query_status
FROM hobbies
WHERE name IN ('Snorkeling', 'Snowboarding', 'Snowmobiling', 'Snowshoeing', 'Spa & Wellness',
               'Square Dancing', 'Stained Glass', 'Stand-up Paddleboarding', 'Stargazing', 'Street Festivals')
ORDER BY name;