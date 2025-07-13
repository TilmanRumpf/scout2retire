import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

console.log('🚀 RUNNING TEST UPDATE on 8 hidden towns...\n')

async function updateTestTowns() {
  const updates = {
    'Zutphen': {
      description: "Zutphen charms retirees with its medieval architecture and relaxed Dutch lifestyle. This historic Hanseatic city offers modern amenities in a picturesque setting along the IJssel River.",
      cost_index: 2000,
      healthcare_score: 9,
      climate_description: "Temperate maritime climate with mild summers (20°C) and cool winters (5°C). Rainfall distributed throughout the year.",
      lifestyle_description: "Quiet, bicycle-friendly city with excellent cultural offerings. Strong community feel with local markets and cafes.",
      data_completeness_score: 35,
      
      // Healthcare by citizenship
      healthcare_cost: 120,
      english_speaking_doctors: "Some",
      
      // Infrastructure
      internet_speed: 100,
      public_transport_quality: "Excellent",
      walkability: 8,
      
      // Ratings
      safety_score: 9,
      quality_of_life: 8
    },
    
    'Zadar': {
      description: "Zadar combines ancient Roman ruins with modern attractions like the Sea Organ. This Adriatic coastal gem offers Mediterranean living at affordable prices.",
      cost_index: 1400,
      healthcare_score: 7,
      climate_description: "Mediterranean climate with hot, dry summers (28°C) and mild winters (10°C). Over 2,600 hours of sunshine annually.",
      lifestyle_description: "Relaxed coastal living with vibrant cafe culture. Growing expat community and excellent seafood.",
      data_completeness_score: 35,
      
      healthcare_cost: 80,
      english_speaking_doctors: "Few",
      internet_speed: 75,
      public_transport_quality: "Good",
      walkability: 9,
      safety_score: 8,
      quality_of_life: 8
    },
    
    'Wismar': {
      description: "Wismar's UNESCO World Heritage old town and Baltic Sea location make it perfect for history-loving retirees. Excellent healthcare and infrastructure in a manageable size city.",
      cost_index: 1800,
      healthcare_score: 9,
      climate_description: "Baltic maritime climate with mild summers (22°C) and cool winters (2°C). Moderate rainfall year-round.",
      lifestyle_description: "Peaceful Baltic lifestyle with German efficiency. Rich cultural heritage and easy access to nature.",
      data_completeness_score: 35,
      
      healthcare_cost: 150,
      english_speaking_doctors: "Some",
      internet_speed: 150,
      public_transport_quality: "Excellent",
      walkability: 8,
      safety_score: 9,
      quality_of_life: 8
    },
    
    'Windhoek': {
      description: "Windhoek offers a unique African retirement experience with modern infrastructure and stunning landscapes. English is widely spoken in this clean, safe capital city.",
      cost_index: 1200,
      healthcare_score: 6,
      climate_description: "Semi-arid climate with warm days year-round (25°C) and cool nights. Minimal rainfall, mostly in summer.",
      lifestyle_description: "Relaxed African pace with German colonial influences. Great for nature lovers and adventure seekers.",
      data_completeness_score: 35,
      
      healthcare_cost: 200,
      english_speaking_doctors: "Many",
      internet_speed: 50,
      public_transport_quality: "Fair",
      walkability: 6,
      safety_score: 7,
      quality_of_life: 7
    },
    
    'Willemstad': {
      description: "Willemstad's colorful Dutch colonial architecture and Caribbean beaches create a unique retirement paradise. EU connections with tropical weather year-round.",
      cost_index: 2200,
      healthcare_score: 7,
      climate_description: "Tropical climate with constant temperatures (27°C) and cooling trade winds. Outside hurricane belt.",
      lifestyle_description: "Laid-back Caribbean lifestyle with Dutch organization. Multilingual environment and duty-free shopping.",
      data_completeness_score: 35,
      
      healthcare_cost: 180,
      english_speaking_doctors: "Many",
      internet_speed: 80,
      public_transport_quality: "Good",
      walkability: 7,
      safety_score: 8,
      quality_of_life: 8
    },
    
    'Wiesbaden': {
      description: "Wiesbaden combines spa town elegance with Rhine Valley charm. This affluent city offers excellent healthcare and easy access to Frankfurt's international connections.",
      cost_index: 2800,
      healthcare_score: 9,
      climate_description: "Mild continental climate protected by Taunus mountains. Warm summers (25°C) and mild winters (5°C).",
      lifestyle_description: "Sophisticated spa town atmosphere with thermal baths and casinos. High quality of life with parks and culture.",
      data_completeness_score: 35,
      
      healthcare_cost: 180,
      english_speaking_doctors: "Some",
      internet_speed: 200,
      public_transport_quality: "Excellent",
      walkability: 8,
      safety_score: 9,
      quality_of_life: 9
    },
    
    'Wellington': {
      description: "Wellington captivates with its harbor setting, vibrant arts scene, and world-class coffee culture. New Zealand's compact capital offers urban amenities with natural beauty.",
      cost_index: 2400,
      healthcare_score: 8,
      climate_description: "Temperate oceanic climate with mild temperatures (8-20°C) but famous winds. No extreme temperatures.",
      lifestyle_description: "Creative, cosmopolitan atmosphere in a walkable city. Strong cafe culture and excellent public transport.",
      data_completeness_score: 35,
      
      healthcare_cost: 0, // Public healthcare for residents
      english_speaking_doctors: "Many",
      internet_speed: 100,
      public_transport_quality: "Excellent",
      walkability: 9,
      safety_score: 9,
      quality_of_life: 9
    },
    
    'Wanaka': {
      description: "Wanaka offers stunning alpine lakeside living for active retirees. This resort town provides year-round outdoor activities with small-town charm.",
      cost_index: 2600,
      healthcare_score: 7,
      climate_description: "Alpine climate with warm summers (25°C) and cold winters (0°C). Low rainfall and high sunshine hours.",
      lifestyle_description: "Outdoor paradise for active retirees. Skiing in winter, hiking and water sports in summer.",
      data_completeness_score: 35,
      
      healthcare_cost: 50, // Basic public healthcare
      english_speaking_doctors: "Many",
      internet_speed: 80,
      public_transport_quality: "Limited",
      walkability: 7,
      safety_score: 9,
      quality_of_life: 9
    }
  }
  
  console.log('📊 Updating 8 test towns with comprehensive data...\n')
  
  let successCount = 0
  
  for (const [townName, updateData] of Object.entries(updates)) {
    // Find the town (only without photos for safety)
    const { data: towns } = await supabase
      .from('towns')
      .select('id, name, country, image_url_1')
      .ilike('name', townName)
      .is('image_url_1', null) // SAFETY: Only update towns WITHOUT photos
    
    if (towns && towns.length > 0) {
      const town = towns[0]
      
      // CRITICAL: Create update object WITHOUT photo fields
      const safeUpdate = {
        ...updateData,
        last_ai_update: new Date().toISOString()
        // NEVER include: image_url_1, image_url_2, image_url_3
      }
      
      console.log(`Updating ${town.name}, ${town.country}...`)
      
      const { error } = await supabase
        .from('towns')
        .update(safeUpdate)
        .eq('id', town.id)
      
      if (error) {
        console.error(`❌ Error updating ${town.name}:`, error.message)
      } else {
        console.log(`✅ Updated ${town.name} - completeness now ${updateData.data_completeness_score}%`)
        successCount++
      }
    } else {
      console.log(`⏭️  Skipped ${townName} (not found or has photo - safety check)`)
    }
  }
  
  console.log(`\n🎉 Successfully updated ${successCount}/8 towns!`)
}

async function verifyUpdates() {
  console.log('\n🔍 Verifying all updates were successful...\n')
  
  const testTowns = ['Zutphen', 'Zadar', 'Wismar', 'Windhoek', 'Willemstad', 'Wiesbaden', 'Wellington', 'Wanaka']
  
  for (const townName of testTowns) {
    const { data: towns } = await supabase
      .from('towns')
      .select('name, country, description, data_completeness_score, image_url_1, cost_index, healthcare_score')
      .ilike('name', townName)
    
    if (towns && towns.length > 0) {
      const town = towns[0]
      console.log(`${town.name}, ${town.country}:`)
      console.log(`  ✅ Description: ${town.description ? 'Added' : '❌ Missing'}`)
      console.log(`  ✅ Cost: ${town.cost_index || '❌ Missing'}`)
      console.log(`  ✅ Healthcare: ${town.healthcare_score || '❌ Missing'}`)
      console.log(`  ✅ Completeness: ${town.data_completeness_score}%`)
      console.log(`  ✅ Photo: ${town.image_url_1 ? '⚠️ HAS PHOTO (unexpected!)' : 'Still no photo (good)'}`)
      console.log('')
    }
  }
  
  // Check photo count hasn't changed
  const { count: photoCount } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
    .not('image_url_1', 'is', null)
  
  console.log(`📸 Photo count check: ${photoCount} towns with photos (should still be 23)`)
  
  if (photoCount === 23) {
    console.log('✅ SAFETY CHECK PASSED: No photos were accidentally added!')
  } else {
    console.log('⚠️  WARNING: Photo count changed - investigate!')
  }
}

// Run the actual update
async function runTestUpdate() {
  console.log('🧪 TEST UPDATE SEQUENCE STARTING...\n')
  console.log('Target: 8 towns without photos (safe test subjects)')
  console.log('Expected result: Enhanced data, no photo changes\n')
  
  await updateTestTowns()
  await verifyUpdates()
  
  console.log('\n✨ Test update sequence complete!')
  console.log('📋 Next: Review results, then test on visible towns')
}

runTestUpdate()