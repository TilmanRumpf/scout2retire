import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '.env') })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function checkVisibleTowns() {
  console.log('🔍 Checking towns with photos (visible in app)...\n')
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('name, country, cost_index, healthcare_score, data_completeness_score')
    .not('image_url_1', 'is', null)
    .order('country')
    .order('name')
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log(`Found ${towns.length} towns with photos:\n`)
  
  // Group by country
  const byCountry = {}
  towns.forEach(town => {
    if (!byCountry[town.country]) {
      byCountry[town.country] = []
    }
    byCountry[town.country].push(town)
  })
  
  // Display by country
  Object.keys(byCountry).sort().forEach(country => {
    console.log(`\n${country}:`)
    byCountry[country].forEach(town => {
      const completeness = town.data_completeness_score || 0
      const cost = town.cost_index || 'N/A'
      const health = town.healthcare_score || 'N/A'
      console.log(`  - ${town.name}: Cost ${cost}, Health ${health}, Complete ${completeness}%`)
    })
  })
  
  // Show summary
  console.log('\n📊 Summary:')
  console.log(`Total visible towns: ${towns.length}`)
  
  const withCost = towns.filter(t => t.cost_index).length
  const withHealth = towns.filter(t => t.healthcare_score).length
  const withCompleteness = towns.filter(t => t.data_completeness_score > 50).length
  
  console.log(`With cost data: ${withCost} (${Math.round(withCost/towns.length*100)}%)`)
  console.log(`With health scores: ${withHealth} (${Math.round(withHealth/towns.length*100)}%)`)
  console.log(`>50% complete: ${withCompleteness} (${Math.round(withCompleteness/towns.length*100)}%)`)
}

checkVisibleTowns()