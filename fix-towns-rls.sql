-- Fix: Allow everyone to read towns table (public data)
DROP POLICY IF EXISTS "towns_select_policy" ON towns;
DROP POLICY IF EXISTS "Enable read access for all users" ON towns;
DROP POLICY IF EXISTS "Towns are viewable by everyone" ON towns;

CREATE POLICY "towns_select_policy"
ON towns
FOR SELECT
USING (true);  -- Allow everyone to read towns (public data)
