import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const adminSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

async function checkPhotoTownsStatus() {
  console.log('📸 Checking data status of all towns with photos...\n')
  
  // Get all towns with photos
  const { data: townsWithPhotos, error } = await adminSupabase
    .from('towns')
    .select('name, country, data_completeness_score, description, cost_index, healthcare_score, activities_available')
    .not('image_url_1', 'is', null)
    .order('data_completeness_score', { ascending: true })
  
  if (error) {
    console.error('Error fetching towns:', error)
    return
  }
  
  // Group by completeness
  const needsUpdate = townsWithPhotos.filter(t => !t.data_completeness_score || t.data_completeness_score < 40)
  const partiallyComplete = townsWithPhotos.filter(t => t.data_completeness_score >= 40 && t.data_completeness_score < 80)
  const complete = townsWithPhotos.filter(t => t.data_completeness_score >= 80)
  
  console.log(`❌ Need Updates (0-39%): ${needsUpdate.length} towns`)
  needsUpdate.forEach(t => {
    const hasBasics = t.description && t.cost_index && t.healthcare_score ? '(has basic data)' : '(missing basics)'
    console.log(`   - ${t.name}, ${t.country} (${t.data_completeness_score || 0}%) ${hasBasics}`)
  })
  
  console.log(`\n⚠️  Partially Complete (40-79%): ${partiallyComplete.length} towns`)
  partiallyComplete.forEach(t => {
    const hasActivities = t.activities_available ? '✓ activities' : '✗ activities'
    console.log(`   - ${t.name}, ${t.country} (${t.data_completeness_score}%) ${hasActivities}`)
  })
  
  console.log(`\n✅ Complete (80%+): ${complete.length} towns`)
  complete.forEach(t => {
    console.log(`   - ${t.name}, ${t.country} (${t.data_completeness_score}%)`)
  })
  
  console.log(`\n📊 Summary:`)
  console.log(`   Total with photos: ${townsWithPhotos.length}`)
  console.log(`   Need AI updates: ${needsUpdate.length}`)
  console.log(`   Need activity data: ${townsWithPhotos.filter(t => !t.activities_available).length}`)
  console.log(`   Fully updated: ${partiallyComplete.length + complete.length}`)
  
  // Get list of towns needing updates for script
  console.log(`\n📝 Towns needing updates (for script):`)
  const townList = needsUpdate.map(t => `'${t.name}'`).join(', ')
  console.log(`[${townList}]`)
  
  return needsUpdate
}

checkPhotoTownsStatus()