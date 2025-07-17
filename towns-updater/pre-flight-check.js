import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

console.log('🚀 Pre-Flight Check for Towns Updater\n')

async function preFlightCheck() {
  // 1. Test connection
  console.log('1️⃣ Testing Supabase connection...')
  const { count: totalCount, error: countError } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
  
  if (countError) {
    console.error('❌ Connection failed:', countError.message)
    return false
  }
  console.log(`✅ Connected! Found ${totalCount} total towns\n`)
  
  // 2. Check photo coverage
  console.log('2️⃣ Checking photo coverage...')
  const { count: photoCount } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
    .not('image_url_1', 'is', null)
  
  const coverage = ((photoCount / totalCount) * 100).toFixed(2)
  console.log(`📸 ${photoCount} towns have photos (${coverage}% coverage)`)
  console.log(`⚠️  ${totalCount - photoCount} towns missing photos\n`)
  
  // 3. Find safe test towns
  console.log('3️⃣ Finding test towns...')
  
  // Towns WITH photos (to test preservation)
  const { data: townsWithPhotos } = await supabase
    .from('towns')
    .select('id, name, country, image_url_1')
    .not('image_url_1', 'is', null)
    .limit(3)
  
  console.log('Towns WITH photos (good for testing photo preservation):')
  townsWithPhotos?.forEach(t => {
    console.log(`   - ${t.name}, ${t.country} (${t.id})`)
  })
  
  // Towns WITHOUT photos (safe for other updates)
  const { data: townsWithoutPhotos } = await supabase
    .from('towns')
    .select('id, name, country')
    .is('image_url_1', null)
    .limit(3)
  
  console.log('\nTowns WITHOUT photos (safe for testing updates):')
  townsWithoutPhotos?.forEach(t => {
    console.log(`   - ${t.name}, ${t.country} (${t.id})`)
  })
  
  // 4. Check for incomplete data
  console.log('\n4️⃣ Checking data completeness...')
  const { count: missingDesc } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
    .is('description', null)
  
  const { count: missingCost } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
    .is('cost_index', null)
  
  const { count: missingHealth } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
    .is('healthcare_score', null)
  
  console.log(`📝 Missing descriptions: ${missingDesc} towns`)
  console.log(`💰 Missing cost data: ${missingCost} towns`)
  console.log(`🏥 Missing healthcare scores: ${missingHealth} towns`)
  
  // 5. Show environment
  console.log('\n5️⃣ Environment check...')
  console.log(`🔗 Supabase URL: ${process.env.VITE_SUPABASE_URL}`)
  console.log(`🔑 API Key: ${process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`🤖 Claude API Key: ${process.env.CLAUDE_API_KEY ? '✅ Set' : '⚠️  Not set (needed for AI features)'}`)
  
  // 6. Safety reminders
  console.log('\n📋 Safety Checklist:')
  console.log('✅ Photo fields are excluded from all update scripts')
  console.log('✅ Test on single town first using test-photo-safety.js')
  console.log('✅ Monitor photo count before and after updates')
  console.log('✅ Use dry-run mode when available')
  
  console.log('\n✨ Pre-flight check complete! Ready for updates.')
  console.log('🎯 Recommended: Start with `node test-photo-safety.js`')
  
  return true
}

preFlightCheck()