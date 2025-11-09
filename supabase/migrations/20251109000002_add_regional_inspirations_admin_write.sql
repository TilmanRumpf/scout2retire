-- Add INSERT/UPDATE/DELETE policies for admins on regional_inspirations
-- Only admins (admin, executive_admin, auditor) can modify regional inspirations

-- UPDATE policy for admins
CREATE POLICY "regional_inspirations_admin_update"
ON public.regional_inspirations FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth.uid() = users.id
    AND users.admin_role IN ('admin', 'executive_admin', 'auditor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth.uid() = users.id
    AND users.admin_role IN ('admin', 'executive_admin', 'auditor')
  )
);

-- INSERT policy for admins
CREATE POLICY "regional_inspirations_admin_insert"
ON public.regional_inspirations FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth.uid() = users.id
    AND users.admin_role IN ('admin', 'executive_admin', 'auditor')
  )
);

-- DELETE policy for admins
CREATE POLICY "regional_inspirations_admin_delete"
ON public.regional_inspirations FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth.uid() = users.id
    AND users.admin_role IN ('admin', 'executive_admin', 'auditor')
  )
);
