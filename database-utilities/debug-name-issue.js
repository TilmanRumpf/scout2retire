import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugNameIssue() {
  console.log('Debugging name column issue...\n')

  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, town_name, town_name, country')
    .limit(3)

  if (error) {
    console.log('Error:', error)
    return
  }

  console.log('Raw data from Supabase:')
  console.log(JSON.stringify(towns, null, 2))

  towns.forEach(town => {
    console.log('\nTown analysis:')
    console.log('- Has id?', !!town.id)
    console.log('- Has name?', !!town.town_name)
    console.log('- Has town_name?', !!town.town_name)
    console.log('- name value:', town.town_name)
    console.log('- town_name value:', town.town_name)
  })

  process.exit()
}

debugNameIssue()