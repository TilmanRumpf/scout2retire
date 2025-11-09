-- Fix regional_inspirations RLS policy to allow admins to see unpublished inspirations
-- Public users: only see is_active = true
-- Admins: see ALL inspirations (published and unpublished)

DROP POLICY IF EXISTS "regional_inspirations_unified_select" ON public.regional_inspirations;

CREATE POLICY "regional_inspirations_select_with_admin"
ON public.regional_inspirations FOR SELECT TO authenticated
USING (
  is_active = true  -- Public users see only active inspirations
  OR
  -- Admins see ALL inspirations (including unpublished)
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth.uid() = users.id
    AND users.admin_role IN ('admin', 'executive_admin', 'auditor')
  )
);
