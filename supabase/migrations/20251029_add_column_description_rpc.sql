-- Migration: Add RPC function to update column descriptions
-- Created: 2025-10-29
-- Purpose: Allow programmatic updates to column descriptions (COMMENT ON COLUMN)
--          for storing search query templates

-- Drop function if exists
DROP FUNCTION IF EXISTS public.update_column_description(text, text, text);

-- Create function to update column description
CREATE OR REPLACE FUNCTION public.update_column_description(
  table_name text,
  column_name text,
  new_description text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate table name (must be 'towns')
  IF table_name != 'towns' THEN
    RAISE EXCEPTION 'Invalid table name. Only towns table is supported.';
  END IF;

  -- Validate column name exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'towns'
      AND column_name = update_column_description.column_name
  ) THEN
    RAISE EXCEPTION 'Column % does not exist in towns table', column_name;
  END IF;

  -- Update the column comment
  EXECUTE format(
    'COMMENT ON COLUMN public.towns.%I IS %L',
    column_name,
    new_description
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_column_description(text, text, text) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.update_column_description IS 'Updates column description (COMMENT ON COLUMN) for towns table. Used to store search query templates.';
