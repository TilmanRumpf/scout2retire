import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugTownDisplay() {
  console.log('Debugging town display issue...\n')

  // Check a few towns to see what's in the database
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, town_name, country, image_url_1')
    .limit(10)
    .order('town_name')

  if (error) {
    console.log('Error:', error)
    return
  }

  console.log('Sample towns from database:')
  towns.forEach(town => {
    console.log(`- ${town.town_name} (${town.country})`)
    console.log(`  ID: ${town.id}`)
    console.log(`  Has image: ${!!town.image_url_1}`)
    console.log('')
  })

  // Check if any towns have null town_name
  const { data: nullTowns, error: nullError } = await supabase
    .from('towns')
    .select('id, town_name, country')
    .is('town_name', null)
    .limit(5)

  if (!nullError && nullTowns && nullTowns.length > 0) {
    console.log('⚠️  FOUND TOWNS WITH NULL town_name:')
    nullTowns.forEach(t => {
      console.log(`  - ID: ${t.id}, Country: ${t.country}`)
    })
  } else {
    console.log('✅ All towns have town_name values')
  }

  // Check empty string town_names
  const { data: emptyTowns, error: emptyError } = await supabase
    .from('towns')
    .select('id, town_name, country')
    .eq('town_name', '')
    .limit(5)

  if (!emptyError && emptyTowns && emptyTowns.length > 0) {
    console.log('⚠️  FOUND TOWNS WITH EMPTY town_name:')
    emptyTowns.forEach(t => {
      console.log(`  - ID: ${t.id}, Country: ${t.country}`)
    })
  }

  process.exit()
}

debugTownDisplay()