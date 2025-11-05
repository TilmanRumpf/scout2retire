import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyTownNames() {
  console.log('Verifying town names in database...\n')

  // Test the exact query from matchingAlgorithm.js
  const selectColumns = `
    id, town_name, country, population, region,
    image_url_1, image_url_2, image_url_3
  `

  const { data, error } = await supabase
    .from('towns')
    .select(selectColumns.trim())
    .not('image_url_1', 'is', null)
    .not('image_url_1', 'eq', '')
    .limit(5)

  if (error) {
    console.log('❌ ERROR:', error.message)
    return
  }

  console.log('✅ Query successful!\n')
  console.log('Data returned from query (first 5 towns with images):')

  data.forEach((town, index) => {
    console.log(`\n${index + 1}. Town ID: ${town.id.substring(0, 8)}...`)
    console.log(`   town_name: "${town.town_name || 'MISSING'}"`)
    console.log(`   country: "${town.country}"`)
    console.log(`   region: "${town.region || 'N/A'}"`)
    console.log(`   Has image: ${!!town.image_url_1}`)
  })

  // Check if we have town_name field
  if (data.length > 0) {
    if (data[0].town_name) {
      console.log('\n✅ TOWN_NAME FIELD IS PRESENT AND POPULATED!')
    } else {
      console.log('\n❌ TOWN_NAME FIELD IS MISSING OR NULL!')
    }
  }

  process.exit()
}

verifyTownNames()