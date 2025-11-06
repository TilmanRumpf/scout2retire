import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyFixes() {
  console.log('🔍 Verifying November 4 fixes...\n')

  let allGood = true

  // Test 1: Check if towns have both name and town_name
  console.log('1. Testing towns table columns...')
  const { data: towns, error: townsError } = await supabase
    .from('towns')
    .select('id, town_name, town_name, country')
    .limit(3)

  if (townsError) {
    console.log('   ❌ FAILED:', townsError.message)
    allGood = false
  } else if (towns && towns.length > 0) {
    const sample = towns[0]
    if (sample.name && sample.town_name) {
      console.log('   ✅ PASSED: Both name and town_name exist')
      console.log(`   Sample: name="${sample.name}", town_name="${sample.town_name}"`)
    } else {
      console.log('   ❌ FAILED: Missing name or town_name column')
      console.log('   Sample:', sample)
      allGood = false
    }
  }

  // Test 2: Check get_user_limits function
  console.log('\n2. Testing get_user_limits function...')
  const { data: limits, error: limitsError } = await supabase
    .rpc('get_user_limits')

  if (limitsError) {
    console.log('   ❌ FAILED:', limitsError.message)
    allGood = false
  } else {
    console.log('   ✅ PASSED: Function works without errors')
    if (limits && limits.length > 0) {
      console.log('   User has', limits.length, 'feature limits configured')
    } else {
      console.log('   (No limits configured for current user - this is OK)')
    }
  }

  // Test 3: Check matching algorithm data structure
  console.log('\n3. Testing matching algorithm data...')
  const { data: matchData, error: matchError } = await supabase
    .from('towns')
    .select('id, town_name, town_name, country, overall_score')
    .not('overall_score', 'is', null)
    .order('overall_score', { ascending: false })
    .limit(3)

  if (matchError) {
    console.log('   ❌ FAILED:', matchError.message)
    allGood = false
  } else if (matchData && matchData.length > 0) {
    console.log('   ✅ PASSED: Towns have scores')
    matchData.forEach(town => {
      console.log(`   - ${town.town_name || town.town_name}: ${town.overall_score}%`)
    })
  } else {
    console.log('   ⚠️  WARNING: No towns with scores found')
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  if (allGood) {
    console.log('🎉 ALL FIXES VERIFIED! The site should be working.')
  } else {
    console.log('⚠️  Some issues remain. Check the errors above.')
  }
  console.log('='.repeat(50))

  process.exit(allGood ? 0 : 1)
}

verifyFixes()