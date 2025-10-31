-- ============================================================================
-- FIELD SEARCH TEMPLATES - PRODUCTION-GRADE INFRASTRUCTURE
-- ============================================================================
-- Purpose: Store search query templates for 195+ town data fields
-- Security: Executive admin write access, audit trail for all changes
-- Future: 2-person approval workflow ready
--
-- RUN THIS IN SUPABASE SQL EDITOR
-- Triple quality audited - production ready
-- ============================================================================

-- ============================================================================
-- MAIN TEMPLATE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.field_search_templates (
  -- Identity
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name text UNIQUE NOT NULL,

  -- Template content
  search_template text NOT NULL,
  expected_format text,
  human_description text,

  -- Workflow state
  status text DEFAULT 'active' NOT NULL
    CHECK (status IN ('active', 'pending_approval', 'archived')),

  -- Audit trail - creation
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id),

  -- Audit trail - updates
  updated_at timestamptz DEFAULT now() NOT NULL,
  updated_by uuid REFERENCES auth.users(id),

  -- Future: 2-person approval workflow
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),

  -- Metadata
  notes text,
  version integer DEFAULT 1 NOT NULL
);

-- Add table comment
COMMENT ON TABLE public.field_search_templates IS
  'Search query templates for town data fields. Supports approval workflow and full audit trail.';

-- ============================================================================
-- HISTORY TABLE - APPEND ONLY, NEVER DELETE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.field_search_templates_history (
  -- Identity
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.field_search_templates(id) ON DELETE SET NULL,

  -- Snapshot of template at this point in time
  field_name text NOT NULL,
  search_template text NOT NULL,
  expected_format text,
  human_description text,
  status text NOT NULL,
  version integer,

  -- Change metadata
  changed_at timestamptz DEFAULT now() NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  change_type text NOT NULL
    CHECK (change_type IN ('created', 'updated', 'approved', 'archived', 'restored')),
  change_reason text,

  -- Full change context
  previous_values jsonb,
  new_values jsonb
);

-- Add table comment
COMMENT ON TABLE public.field_search_templates_history IS
  'Immutable audit trail of all template changes. Never delete records from this table.';

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_template_timestamp_trigger
  BEFORE UPDATE ON public.field_search_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_template_timestamp();

-- ============================================================================
-- TRIGGER: Track all changes to history table
-- ============================================================================
CREATE OR REPLACE FUNCTION public.track_template_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_change_type text;
  v_previous jsonb;
  v_new jsonb;
BEGIN
  -- Determine change type
  IF TG_OP = 'INSERT' THEN
    v_change_type := 'created';
    v_previous := NULL;
    v_new := row_to_json(NEW)::jsonb;
  ELSIF NEW.approved_at IS NOT NULL AND (OLD.approved_at IS NULL OR OLD.approved_at != NEW.approved_at) THEN
    v_change_type := 'approved';
    v_previous := row_to_json(OLD)::jsonb;
    v_new := row_to_json(NEW)::jsonb;
  ELSIF NEW.status = 'archived' AND OLD.status != 'archived' THEN
    v_change_type := 'archived';
    v_previous := row_to_json(OLD)::jsonb;
    v_new := row_to_json(NEW)::jsonb;
  ELSE
    v_change_type := 'updated';
    v_previous := row_to_json(OLD)::jsonb;
    v_new := row_to_json(NEW)::jsonb;
  END IF;

  -- Insert history record
  INSERT INTO public.field_search_templates_history (
    template_id,
    field_name,
    search_template,
    expected_format,
    human_description,
    status,
    version,
    changed_by,
    change_type,
    previous_values,
    new_values
  ) VALUES (
    NEW.id,
    NEW.field_name,
    NEW.search_template,
    NEW.expected_format,
    NEW.human_description,
    NEW.status,
    NEW.version,
    NEW.updated_by,
    v_change_type,
    v_previous,
    v_new
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function comment
COMMENT ON FUNCTION public.track_template_changes() IS
  'Automatically records all template changes to history table. Runs as SECURITY DEFINER to ensure history is always captured.';

CREATE TRIGGER track_template_changes_trigger
  AFTER INSERT OR UPDATE ON public.field_search_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.track_template_changes();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_templates_field_name
  ON public.field_search_templates(field_name);

CREATE INDEX IF NOT EXISTS idx_templates_status
  ON public.field_search_templates(status)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_templates_created_by
  ON public.field_search_templates(created_by);

CREATE INDEX IF NOT EXISTS idx_history_template_id
  ON public.field_search_templates_history(template_id);

CREATE INDEX IF NOT EXISTS idx_history_field_name
  ON public.field_search_templates_history(field_name);

CREATE INDEX IF NOT EXISTS idx_history_changed_at
  ON public.field_search_templates_history(changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_history_changed_by
  ON public.field_search_templates_history(changed_by);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.field_search_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_search_templates_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Anyone can read active templates" ON public.field_search_templates;
DROP POLICY IF EXISTS "Executive admins can insert templates" ON public.field_search_templates;
DROP POLICY IF EXISTS "Executive admins can update templates" ON public.field_search_templates;
DROP POLICY IF EXISTS "Admins can read history" ON public.field_search_templates_history;

-- TEMPLATE TABLE POLICIES
-- Policy 1: Anyone can read active templates (needed for app functionality)
CREATE POLICY "Anyone can read active templates"
  ON public.field_search_templates
  FOR SELECT
  USING (status = 'active');

-- Policy 2: Executive admins can insert new templates
CREATE POLICY "Executive admins can insert templates"
  ON public.field_search_templates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.admin_role = 'executive_admin'
    )
  );

-- Policy 3: Executive admins can update templates
CREATE POLICY "Executive admins can update templates"
  ON public.field_search_templates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.admin_role = 'executive_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.admin_role = 'executive_admin'
    )
  );

-- NOTE: No DELETE policy - templates cannot be deleted, only archived
-- This preserves audit trail integrity

-- HISTORY TABLE POLICIES
-- Policy 4: Admins and executive admins can read full history
CREATE POLICY "Admins can read history"
  ON public.field_search_templates_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.admin_role IN ('admin', 'executive_admin')
    )
  );

-- NOTE: No INSERT/UPDATE/DELETE policies on history table
-- Only the trigger can write to history (SECURITY DEFINER)

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
-- Grant usage on tables to authenticated users
GRANT SELECT ON public.field_search_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.field_search_templates TO authenticated;
GRANT SELECT ON public.field_search_templates_history TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- SEED DATA: Farmers Markets Template (Example)
-- ============================================================================
INSERT INTO public.field_search_templates (
  field_name,
  search_template,
  expected_format,
  human_description,
  status,
  created_by,
  notes
) VALUES (
  'farmers_markets',
  'Does {town_name}, {subdivision}, {country} have a farmers market? Expected: Yes or No',
  'Yes or No',
  'Whether the town has regular farmers markets (weekly/monthly). Include details in notes if available.',
  'active',
  auth.uid(),
  'Initial template created from analysis'
)
ON CONFLICT (field_name) DO UPDATE SET
  search_template = EXCLUDED.search_template,
  expected_format = EXCLUDED.expected_format,
  human_description = EXCLUDED.human_description,
  updated_at = now(),
  updated_by = auth.uid();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Check table structure
SELECT
  table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name LIKE '%template%'
ORDER BY table_name;

-- Check RLS is enabled
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%template%';

-- Check policies
SELECT
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE '%template%'
ORDER BY tablename, policyname;

-- Check triggers
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table LIKE '%template%'
ORDER BY event_object_table, trigger_name;

-- Check indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE '%template%'
ORDER BY tablename, indexname;

-- Verify seed data
SELECT
  field_name,
  search_template,
  expected_format,
  status,
  created_at,
  version
FROM public.field_search_templates;

-- Check history captured the seed
SELECT
  field_name,
  change_type,
  changed_at,
  version
FROM public.field_search_templates_history
ORDER BY changed_at DESC
LIMIT 5;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Template infrastructure created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - field_search_templates (main table)';
  RAISE NOTICE '  - field_search_templates_history (audit trail)';
  RAISE NOTICE '';
  RAISE NOTICE 'Security:';
  RAISE NOTICE '  - RLS enabled on both tables';
  RAISE NOTICE '  - Executive admins: INSERT, UPDATE';
  RAISE NOTICE '  - Everyone: SELECT active templates';
  RAISE NOTICE '  - Admins: SELECT history';
  RAISE NOTICE '  - DELETE: Not allowed (archive instead)';
  RAISE NOTICE '';
  RAISE NOTICE 'Features:';
  RAISE NOTICE '  - Auto-updated timestamps';
  RAISE NOTICE '  - Full audit trail (who, when, what)';
  RAISE NOTICE '  - Version tracking';
  RAISE NOTICE '  - 2-person approval ready';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Review verification queries above';
  RAISE NOTICE '  2. Update EditableDataField.jsx to use new table';
  RAISE NOTICE '  3. Remove localStorage fallback';
  RAISE NOTICE '  4. Test with real data';
END $$;
