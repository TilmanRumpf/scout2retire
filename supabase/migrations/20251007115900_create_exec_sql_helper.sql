-- Create helper function for executing arbitrary SQL
-- This allows programmatic migration execution

CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'Success';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;

-- Grant to service role only (not to public/authenticated)
GRANT EXECUTE ON FUNCTION exec_sql TO service_role;

COMMENT ON FUNCTION exec_sql IS 'Helper function for programmatic SQL execution. Service role only.';
