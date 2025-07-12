import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { calculateMatchScore, batchUpdateStrategy } from './smart-matching-system.js'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function testMatching() {
  console.log('🎯 Testing Smart Matching System\n')
  
  // Sample user preferences
  const userPrefs = {
    budget: 1500,
    climate_preference: 'Mediterranean',
    citizenship: 'US',
    has_pets: true
  }
  
  // Get Porto data
  const { data: porto } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Porto')
    .eq('country', 'Portugal')
    .single()
  
  if (porto) {
    // Calculate match
    const match = await calculateMatchScore(userPrefs, porto)
    console.log('Porto match score:', match.match_score, '/10')
    console.log('Match factors:', match.match_factors)
  }
  
  // Test batch update strategy
  console.log('\n📊 Testing Batch Update Strategy:')
  const updatePlan = await batchUpdateStrategy(supabase)
}

testMatching()