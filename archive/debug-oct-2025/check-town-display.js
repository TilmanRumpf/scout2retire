import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function checkTownDisplay() {
  // Check how many towns have required data to display
  const { data: townsWithData, count } = await supabase
    .from('towns')
    .select('name, country, cost_index, healthcare_score, description, image_url_1', { count: 'exact' })
    .not('cost_index', 'is', null)
    .not('description', 'is', null)

  console.log('Towns with cost_index AND description:', count)

  // Check Paris specifically
  const { data: paris } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Paris')
    .single()

  console.log('\nParis has:')
  console.log('- cost_index:', paris?.cost_index, '(null?', paris?.cost_index === null, ')')
  console.log('- description:', paris?.description ? `YES (${paris.description.length} chars)` : 'NO')
  console.log('- image_url_1:', paris?.image_url_1 ? 'YES' : 'NO')

  // List all towns that have both cost and description
  const { data: displayableTowns } = await supabase
    .from('towns')
    .select('name, country')
    .not('cost_index', 'is', null)
    .not('description', 'is', null)
    .order('name')

  console.log('\nTowns that should display (have cost + description):')
  displayableTowns.forEach(t => console.log(`- ${t.name}, ${t.country}`))
  
  // Check if the matching algorithm is filtering out Paris
  console.log('\n🔍 Checking if matching algorithm filters out Paris...')
  
  // Get towns without personalization
  const { data: unpersonalizedTowns } = await supabase
    .from('towns')
    .select('name, cost_index')
    .order('name')
    .limit(50)
  
  const parisInUnpersonalized = unpersonalizedTowns?.find(t => t.name === 'Paris')
  console.log('Paris in unpersonalized query:', parisInUnpersonalized ? 'YES' : 'NO')
}

checkTownDisplay()