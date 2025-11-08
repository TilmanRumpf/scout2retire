-- Add admin write policies for towns_hobbies table
-- This allows admins to INSERT, UPDATE, and DELETE hobby associations

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow admin insert to towns_hobbies" ON towns_hobbies;
DROP POLICY IF EXISTS "Allow admin update to towns_hobbies" ON towns_hobbies;
DROP POLICY IF EXISTS "Allow admin delete from towns_hobbies" ON towns_hobbies;

-- Create INSERT policy for admins
CREATE POLICY "Allow admin insert to towns_hobbies"
ON towns_hobbies FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'executive_admin')
  )
);

-- Create UPDATE policy for admins
CREATE POLICY "Allow admin update to towns_hobbies"
ON towns_hobbies FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'executive_admin')
  )
);

-- Create DELETE policy for admins
CREATE POLICY "Allow admin delete from towns_hobbies"
ON towns_hobbies FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'executive_admin')
  )
);
