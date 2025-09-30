-- Add RLS policies for admin-only operations
-- Only users with is_admin = true can update/delete towns

-- Towns table: Only admins can UPDATE
CREATE POLICY "Only admins can update towns"
ON towns FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Towns table: Only admins can INSERT
CREATE POLICY "Only admins can insert towns"
ON towns FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Towns table: Only admins can DELETE
CREATE POLICY "Only admins can delete towns"
ON towns FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Note: SELECT on towns remains public (everyone can read)
-- This is correct - we want users to browse towns, just not modify them