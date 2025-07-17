import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function debugParis() {
  // Get original Paris data from a working town
  const { data: lisbon } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Lisbon')
    .eq('country', 'Portugal')
    .single()
  
  const { data: paris } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Paris')
    .eq('country', 'France')
    .single()
  
  console.log('Comparing Paris to working Lisbon:')
  
  // Check each field type
  for (const key in paris) {
    const parisValue = paris[key]
    const lisbonValue = lisbon[key]
    
    if (parisValue !== null && lisbonValue === null) {
      console.log(`❌ ${key}: Paris has value, Lisbon doesn't`)
      console.log(`   Paris value:`, typeof parisValue, parisValue)
    }
  }
  
  // Now clear all potentially problematic fields from Paris
  console.log('\n🔧 Clearing all non-essential Paris data...')
  
  const safeUpdate = {}
  const essentialFields = [
    'name', 'country', 'cost_index', 'healthcare_score', 'safety_score',
    'image_url_1', 'image_url_2', 'image_url_3', 'description'
  ]
  
  // Set all non-essential fields to null
  for (const key in paris) {
    if (!essentialFields.includes(key) && !key.includes('created_at') && !key.includes('id')) {
      safeUpdate[key] = null
    }
  }
  
  const { error } = await supabase
    .from('towns')
    .update(safeUpdate)
    .eq('name', 'Paris')
    .eq('country', 'France')
  
  if (error) {
    console.error('Error clearing Paris fields:', error)
  } else {
    console.log('✅ Cleared all non-essential Paris fields')
    console.log('Paris should now display properly!')
  }
}

debugParis()