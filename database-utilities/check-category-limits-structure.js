import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCategoryLimitsStructure() {
  try {
    // Query to check column names of category_limits table
    const { data: columns, error: columnError } = await supabase
      .rpc('sql_query', {
        query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'category_limits'
          ORDER BY ordinal_position
        `
      })

    if (columnError) {
      console.error('Error fetching column info:', columnError)

      // Try alternative approach - just select one row to see structure
      const { data, error } = await supabase
        .from('category_limits')
        .select('*')
        .limit(1)

      if (!error && data && data.length > 0) {
        console.log('\nActual columns in category_limits table:')
        console.log(Object.keys(data[0]))
      } else {
        console.error('Alternative approach failed:', error)
      }
    } else {
      console.log('Column structure of category_limits table:')
      columns.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`)
      })
    }

    // Check the current get_user_limits function
    const { data: funcDef, error: funcError } = await supabase
      .rpc('sql_query', {
        query: `
          SELECT routine_definition
          FROM information_schema.routines
          WHERE routine_schema = 'public'
            AND routine_name = 'get_user_limits'
        `
      })

    if (!funcError && funcDef && funcDef.length > 0) {
      console.log('\n\nCurrent get_user_limits function definition snippet:')
      const def = funcDef[0].routine_definition
      // Find the part with the SELECT statement
      const selectIndex = def.indexOf('SELECT')
      if (selectIndex >= 0) {
        console.log(def.substring(selectIndex, selectIndex + 500))
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    process.exit()
  }
}

checkCategoryLimitsStructure()