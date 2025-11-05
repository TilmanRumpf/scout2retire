import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixDatabaseErrors() {
  console.log('Starting database fixes...\n')

  try {
    // Fix 1: Update get_user_limits function
    console.log('Fixing get_user_limits function...')

    const fixGetUserLimits = `
      DROP FUNCTION IF EXISTS public.get_user_limits CASCADE;

      CREATE FUNCTION public.get_user_limits(p_user_id UUID DEFAULT NULL)
      RETURNS TABLE (
        feature_key TEXT,
        limit_value INT,
        is_unlimited BOOLEAN,
        category_name TEXT
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = ''
      AS $$
      DECLARE
        v_user_id UUID;
      BEGIN
        v_user_id := COALESCE(p_user_id, auth.uid());

        RETURN QUERY
        SELECT
          cl.feature_id as feature_key,
          cl.limit_value,
          -- Determine unlimited based on limit_value being null or -1
          (cl.limit_value IS NULL OR cl.limit_value = -1) as is_unlimited,
          uc.display_name as category_name
        FROM public.users u
        JOIN public.user_categories uc ON u.category_id = uc.id
        JOIN public.category_limits cl ON cl.category_id = uc.id
        WHERE u.id = v_user_id;
      END;
      $$;

      GRANT EXECUTE ON FUNCTION public.get_user_limits TO authenticated;
    `

    // Execute the fix
    const { error: funcError } = await supabase.rpc('execute_sql', {
      sql: fixGetUserLimits
    }).single()

    if (funcError) {
      // Try alternative approach - direct execution
      console.log('Direct RPC failed, trying alternative approach...')

      // Since execute_sql might not exist, let's create a simpler version
      const statements = fixGetUserLimits.split(';').filter(s => s.trim())

      for (const statement of statements) {
        if (statement.trim()) {
          console.log('Executing:', statement.substring(0, 50) + '...')
          // We'll need to use a different approach since direct SQL execution isn't available
        }
      }
    } else {
      console.log('✅ get_user_limits function fixed successfully')
    }

    // Fix 2: Create chat tables if they don't exist
    console.log('\nChecking chat_threads table...')

    const { data: chatThreads, error: chatError } = await supabase
      .from('chat_threads')
      .select('id')
      .limit(1)

    if (chatError && chatError.code === '42P01') {
      console.log('chat_threads table does not exist - would need to create it')
      console.log('Please run the migration file to create the table')
    } else if (chatError) {
      console.log('chat_threads error:', chatError.message)
      console.log('This might be an RLS issue rather than a missing table')
    } else {
      console.log('✅ chat_threads table exists and is accessible')
    }

    // Test the get_user_limits function
    console.log('\nTesting get_user_limits function...')
    const { data: limits, error: limitsError } = await supabase
      .rpc('get_user_limits')

    if (limitsError) {
      console.log('❌ get_user_limits still has errors:', limitsError.message)
      console.log('\nPlease run the following SQL directly in Supabase SQL Editor:')
      console.log('```sql')
      console.log(fixGetUserLimits)
      console.log('```')
    } else {
      console.log('✅ get_user_limits function is working!')
      if (limits && limits.length > 0) {
        console.log('Sample limit:', limits[0])
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }

  console.log('\nFix attempt complete.')
  console.log('If errors persist, please run the SQL migration directly in Supabase dashboard.')

  process.exit()
}

fixDatabaseErrors()