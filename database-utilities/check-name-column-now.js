import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY  // Use service role to bypass RLS

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkNameColumn() {
  console.log('Checking name column in database...\n')

  const { data, error } = await supabase
    .from('towns')
    .select('id, town_name, town_name, country')
    .limit(5)

  if (error) {
    console.log('❌ ERROR:', error.message)
    if (error.message.includes('column towns.name does not exist')) {
      console.log('\n⚠️  THE NAME COLUMN DOES NOT EXIST!')
      console.log('Run this SQL in Supabase:')
      console.log(`
ALTER TABLE towns
ADD COLUMN IF NOT EXISTS name TEXT
GENERATED ALWAYS AS (town_name) STORED;

CREATE INDEX IF NOT EXISTS idx_towns_name ON towns(name);
      `)
    }
  } else {
    console.log('✅ Query successful!\n')
    console.log('Data from database:')
    data.forEach(town => {
      console.log(`  ID: ${town.id.substring(0, 8)}...`)
      console.log(`    town_name: "${town.town_name}"`)
      console.log(`    name: "${town.town_name}"`)
      console.log(`    country: "${town.country}"`)
      console.log('')
    })

    // Check if name column is actually there
    if (data[0] && data[0].name) {
      console.log('✅ NAME COLUMN EXISTS AND HAS VALUES!')
    } else if (data[0] && !data[0].name) {
      console.log('❌ NAME COLUMN MISSING OR NULL!')
    }
  }

  process.exit()
}

checkNameColumn()