/**
 * Drop 20 empty columns from towns table
 * Date: 2025-10-20
 * Purpose: Reduce database bloat by removing completely unused columns
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const DROP_COLUMNS_SQL = `
ALTER TABLE towns
DROP COLUMN IF EXISTS smart_city_rank,
DROP COLUMN IF EXISTS global_peace_index,
DROP COLUMN IF EXISTS disaster_risk,
DROP COLUMN IF EXISTS cultural_attractions,
DROP COLUMN IF EXISTS natural_attractions,
DROP COLUMN IF EXISTS annual_events,
DROP COLUMN IF EXISTS co_working_spaces,
DROP COLUMN IF EXISTS public_spaces,
DROP COLUMN IF EXISTS healthcare_facilities,
DROP COLUMN IF EXISTS education_institutions,
DROP COLUMN IF EXISTS transport_options,
DROP COLUMN IF EXISTS outdoor_recreation,
DROP COLUMN IF EXISTS wellness_amenities,
DROP COLUMN IF EXISTS shopping_dining,
DROP COLUMN IF EXISTS travel_connectivity,
DROP COLUMN IF EXISTS sustainable_living,
DROP COLUMN IF EXISTS innovation_index,
DROP COLUMN IF EXISTS retirement_friendliness,
DROP COLUMN IF EXISTS volunteer_opportunities,
DROP COLUMN IF EXISTS learning_programs;
`

async function dropEmptyColumns() {
  console.log('🗑️  Dropping 20 empty columns from towns table...\n')
  console.log('Columns to drop:')
  console.log('1. smart_city_rank')
  console.log('2. global_peace_index')
  console.log('3. disaster_risk')
  console.log('4. cultural_attractions')
  console.log('5. natural_attractions')
  console.log('6. annual_events')
  console.log('7. co_working_spaces')
  console.log('8. public_spaces')
  console.log('9. healthcare_facilities')
  console.log('10. education_institutions')
  console.log('11. transport_options')
  console.log('12. outdoor_recreation')
  console.log('13. wellness_amenities')
  console.log('14. shopping_dining')
  console.log('15. travel_connectivity')
  console.log('16. sustainable_living')
  console.log('17. innovation_index')
  console.log('18. retirement_friendliness')
  console.log('19. volunteer_opportunities')
  console.log('20. learning_programs\n')

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: DROP_COLUMNS_SQL
    })

    if (error) {
      console.error('❌ Error dropping columns:', error)
      console.log('\n⚠️  Attempting direct execution via raw query...')

      // Try alternative approach using raw query
      const { error: rawError } = await supabase
        .from('towns')
        .select('id')
        .limit(1)
        .then(() => supabase.rpc('exec', { query: DROP_COLUMNS_SQL }))

      if (rawError) {
        console.error('❌ Raw query also failed:', rawError)
        throw rawError
      }
    }

    console.log('✅ Successfully dropped 20 empty columns from towns table')
    console.log('\n📊 Verifying column removal...')

    // Verify by checking column count
    const { data: tableInfo, error: infoError } = await supabase
      .from('towns')
      .select('*')
      .limit(1)

    if (infoError) {
      console.error('❌ Error verifying:', infoError)
    } else {
      const columnCount = tableInfo?.[0] ? Object.keys(tableInfo[0]).length : 0
      console.log(`✅ Towns table now has ${columnCount} columns (was 170, should be ~150)`)
    }

    console.log('\n✅ Database cleanup complete!')
    console.log('💾 Database snapshot available at: database-snapshots/2025-10-20T02-37-50')

  } catch (err) {
    console.error('❌ Fatal error:', err)
    console.log('\n⚠️  To rollback, run: node restore-database-snapshot.js 2025-10-20T02-37-50')
    process.exit(1)
  }
}

dropEmptyColumns()
