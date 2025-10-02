-- Add Nova Scotia towns via SECURITY DEFINER function (bypasses RLS)

-- Create temporary function to insert towns
CREATE OR REPLACE FUNCTION insert_nova_scotia_towns()
RETURNS TABLE (name TEXT, latitude NUMERIC, longitude NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with function owner's privileges, bypassing RLS
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO towns (name, country, latitude, longitude, region, geo_region) VALUES
    ('Lunenburg', 'Canada', 44.3768, -64.3180, 'North America', 'Atlantic Canada'),
    ('Bridgewater', 'Canada', 44.3783, -64.5186, 'North America', 'Atlantic Canada'),
    ('Mahone Bay', 'Canada', 44.4484, -64.3815, 'North America', 'Atlantic Canada'),
    ('Truro', 'Canada', 45.3646, -63.2825, 'North America', 'Atlantic Canada'),
    ('Yarmouth', 'Canada', 43.8360, -66.1174, 'North America', 'Atlantic Canada'),
    ('Peggy''s Cove', 'Canada', 44.4939, -63.9156, 'North America', 'Atlantic Canada'),
    ('Chester', 'Canada', 44.5410, -64.2370, 'North America', 'Atlantic Canada'),
    ('Annapolis Royal', 'Canada', 44.7410, -65.5194, 'North America', 'Atlantic Canada'),
    ('Lockeport', 'Canada', 43.6980, -65.1098, 'North America', 'Atlantic Canada'),
    ('Digby', 'Canada', 44.6220, -65.7605, 'North America', 'Atlantic Canada')
  RETURNING towns.name, towns.latitude, towns.longitude;
END;
$$;

-- Execute the function to insert the towns
SELECT * FROM insert_nova_scotia_towns();

-- Drop the function (we don't need it anymore)
DROP FUNCTION insert_nova_scotia_towns();
