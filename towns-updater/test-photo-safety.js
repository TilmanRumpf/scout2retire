import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

console.log('🧪 Testing Photo Safety Policy...\n')

async function testPhotoSafety() {
  // Step 1: Find a test town (preferably one WITH photos to ensure they're preserved)
  console.log('1️⃣ Finding test town with photos...')
  const { data: testTowns, error: findError } = await supabase
    .from('towns')
    .select('id, name, country, image_url_1, image_url_2, image_url_3, cost_index')
    .not('image_url_1', 'is', null)
    .limit(1)
  
  if (findError || !testTowns?.length) {
    console.error('❌ Could not find test town:', findError)
    return
  }
  
  const testTown = testTowns[0]
  console.log(`✅ Found test town: ${testTown.name}, ${testTown.country}`)
  console.log(`   Current photos: ${testTown.image_url_1 ? '✓' : '✗'} ${testTown.image_url_2 ? '✓' : '✗'} ${testTown.image_url_3 ? '✓' : '✗'}`)
  console.log(`   Current cost_index: ${testTown.cost_index}`)
  
  // Step 2: Save current state
  const originalPhotos = {
    image_url_1: testTown.image_url_1,
    image_url_2: testTown.image_url_2,
    image_url_3: testTown.image_url_3
  }
  
  // Step 3: Try to update WITH photo fields (should be excluded)
  console.log('\n2️⃣ Testing update that SHOULD exclude photos...')
  const testUpdate = {
    cost_index: testTown.cost_index + 100, // Change something we can verify
    description: 'TEST UPDATE - Photo safety check',
    // THESE SHOULD BE IGNORED BY PROPER SCRIPTS:
    image_url_1: 'SHOULD_NOT_UPDATE.jpg',
    image_url_2: 'SHOULD_NOT_UPDATE.jpg',
    image_url_3: 'SHOULD_NOT_UPDATE.jpg'
  }
  
  const { error: updateError } = await supabase
    .from('towns')
    .update(testUpdate)
    .eq('id', testTown.id)
  
  if (updateError) {
    console.error('❌ Update failed:', updateError)
    return
  }
  
  // Step 4: Check if photos were preserved
  console.log('\n3️⃣ Verifying photos were NOT changed...')
  const { data: updatedTown, error: checkError } = await supabase
    .from('towns')
    .select('name, image_url_1, image_url_2, image_url_3, cost_index, description')
    .eq('id', testTown.id)
    .single()
  
  if (checkError) {
    console.error('❌ Could not verify update:', checkError)
    return
  }
  
  // Verify results
  console.log('\n📊 Test Results:')
  console.log(`Town: ${updatedTown.name}`)
  console.log(`Cost index updated: ${testTown.cost_index} → ${updatedTown.cost_index} ${updatedTown.cost_index === testTown.cost_index + 100 ? '✅' : '❌'}`)
  console.log(`Description updated: ${updatedTown.description?.includes('TEST UPDATE') ? '✅' : '❌'}`)
  
  console.log('\n🖼️ Photo Preservation Check:')
  if (updatedTown.image_url_1 === 'SHOULD_NOT_UPDATE.jpg') {
    console.log('❌ DANGER: image_url_1 was updated! Scripts need fixing!')
  } else if (updatedTown.image_url_1 === originalPhotos.image_url_1) {
    console.log('✅ image_url_1 preserved correctly')
  } else {
    console.log('⚠️  image_url_1 changed unexpectedly')
  }
  
  if (updatedTown.image_url_2 === 'SHOULD_NOT_UPDATE.jpg') {
    console.log('❌ DANGER: image_url_2 was updated! Scripts need fixing!')
  } else if (updatedTown.image_url_2 === originalPhotos.image_url_2) {
    console.log('✅ image_url_2 preserved correctly')
  } else {
    console.log('⚠️  image_url_2 changed unexpectedly')
  }
  
  if (updatedTown.image_url_3 === 'SHOULD_NOT_UPDATE.jpg') {
    console.log('❌ DANGER: image_url_3 was updated! Scripts need fixing!')
  } else if (updatedTown.image_url_3 === originalPhotos.image_url_3) {
    console.log('✅ image_url_3 preserved correctly')
  } else {
    console.log('⚠️  image_url_3 changed unexpectedly')
  }
  
  // Step 5: Clean up test data
  console.log('\n4️⃣ Cleaning up test data...')
  const { error: cleanupError } = await supabase
    .from('towns')
    .update({
      cost_index: testTown.cost_index, // Restore original
      description: null // Remove test description
    })
    .eq('id', testTown.id)
  
  if (cleanupError) {
    console.error('⚠️  Could not clean up test data:', cleanupError)
  } else {
    console.log('✅ Test data cleaned up')
  }
  
  console.log('\n✨ Photo safety test complete!')
}

// Test safe update function (how scripts SHOULD work)
async function testSafeUpdate() {
  console.log('\n\n5️⃣ Testing SAFE update (photos excluded from object)...')
  
  const { data: testTown } = await supabase
    .from('towns')
    .select('id, name, country, cost_index')
    .not('image_url_1', 'is', null)
    .limit(1)
    .single()
  
  if (!testTown) {
    console.log('❌ No test town found')
    return
  }
  
  // This is how update objects SHOULD look - no photo fields at all
  const safeUpdate = {
    cost_index: testTown.cost_index + 50,
    healthcare_score: 8,
    safety_score: 8
    // NO image_url fields!
  }
  
  console.log('Safe update object:', safeUpdate)
  console.log('✅ Correctly excludes all photo fields')
  
  const { error } = await supabase
    .from('towns')
    .update(safeUpdate)
    .eq('id', testTown.id)
  
  if (!error) {
    console.log('✅ Safe update completed successfully')
    
    // Restore original
    await supabase
      .from('towns')
      .update({ cost_index: testTown.cost_index })
      .eq('id', testTown.id)
  }
}

// Run tests
testPhotoSafety().then(() => testSafeUpdate())