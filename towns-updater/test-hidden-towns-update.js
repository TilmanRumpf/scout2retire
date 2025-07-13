import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Test towns (without photos - safe to test on)
const TEST_TOWNS = [
  'Zutphen',
  'Zadar',
  'Wismar',
  'Windhoek',
  'Willemstad',
  'Wiesbaden',
  'Wellington',
  'Wanaka'
]

console.log('🧪 Testing data updates on hidden towns (no photos)...\n')

async function checkTestTowns() {
  console.log('1️⃣ Checking if test towns exist and their current state...\n')
  
  for (const townName of TEST_TOWNS) {
    const { data: towns, error } = await supabase
      .from('towns')
      .select('id, name, country, cost_index, healthcare_score, description, image_url_1, data_completeness_score')
      .ilike('name', townName)
    
    if (error) {
      console.error(`Error checking ${townName}:`, error)
      continue
    }
    
    if (towns && towns.length > 0) {
      towns.forEach(town => {
        console.log(`✅ Found: ${town.name}, ${town.country}`)
        console.log(`   Photo: ${town.image_url_1 ? '⚠️ HAS PHOTO!' : '✅ No photo (safe to test)'}`)
        console.log(`   Cost: ${town.cost_index || 'None'}`)
        console.log(`   Healthcare: ${town.healthcare_score || 'None'}`)
        console.log(`   Description: ${town.description ? 'Yes' : 'None'}`)
        console.log(`   Completeness: ${town.data_completeness_score || 0}%`)
        console.log('')
      })
    } else {
      console.log(`❌ Not found: ${townName}\n`)
    }
  }
}

async function updateTestTowns() {
  console.log('\n2️⃣ Updating test towns with sample data...\n')
  
  const updates = {
    // Zutphen, Netherlands
    'Zutphen': {
      description: "Zutphen charms retirees with its medieval architecture and relaxed Dutch lifestyle. This historic Hanseatic city offers modern amenities in a picturesque setting along the IJssel River.",
      cost_index: 2000,
      healthcare_score: 9,
      climate_description: "Temperate maritime climate with mild summers (20°C) and cool winters (5°C). Rainfall distributed throughout the year.",
      lifestyle_description: "Quiet, bicycle-friendly city with excellent cultural offerings. Strong community feel with local markets and cafes.",
      data_completeness_score: 30
    },
    
    // Zadar, Croatia
    'Zadar': {
      description: "Zadar combines ancient Roman ruins with modern attractions like the Sea Organ. This Adriatic coastal gem offers Mediterranean living at affordable prices.",
      cost_index: 1400,
      healthcare_score: 7,
      climate_description: "Mediterranean climate with hot, dry summers (28°C) and mild winters (10°C). Over 2,600 hours of sunshine annually.",
      lifestyle_description: "Relaxed coastal living with vibrant cafe culture. Growing expat community and excellent seafood.",
      data_completeness_score: 30
    },
    
    // Wismar, Germany
    'Wismar': {
      description: "Wismar's UNESCO World Heritage old town and Baltic Sea location make it perfect for history-loving retirees. Excellent healthcare and infrastructure in a manageable size city.",
      cost_index: 1800,
      healthcare_score: 9,
      climate_description: "Baltic maritime climate with mild summers (22°C) and cool winters (2°C). Moderate rainfall year-round.",
      lifestyle_description: "Peaceful Baltic lifestyle with German efficiency. Rich cultural heritage and easy access to nature.",
      data_completeness_score: 30
    },
    
    // Windhoek, Namibia
    'Windhoek': {
      description: "Windhoek offers a unique African retirement experience with modern infrastructure and stunning landscapes. English is widely spoken in this clean, safe capital city.",
      cost_index: 1200,
      healthcare_score: 6,
      climate_description: "Semi-arid climate with warm days year-round (25°C) and cool nights. Minimal rainfall, mostly in summer.",
      lifestyle_description: "Relaxed African pace with German colonial influences. Great for nature lovers and adventure seekers.",
      data_completeness_score: 30
    },
    
    // Willemstad, Curaçao
    'Willemstad': {
      description: "Willemstad's colorful Dutch colonial architecture and Caribbean beaches create a unique retirement paradise. EU connections with tropical weather year-round.",
      cost_index: 2200,
      healthcare_score: 7,
      climate_description: "Tropical climate with constant temperatures (27°C) and cooling trade winds. Outside hurricane belt.",
      lifestyle_description: "Laid-back Caribbean lifestyle with Dutch organization. Multilingual environment and duty-free shopping.",
      data_completeness_score: 30
    },
    
    // Wiesbaden, Germany
    'Wiesbaden': {
      description: "Wiesbaden combines spa town elegance with Rhine Valley charm. This affluent city offers excellent healthcare and easy access to Frankfurt's international connections.",
      cost_index: 2800,
      healthcare_score: 9,
      climate_description: "Mild continental climate protected by Taunus mountains. Warm summers (25°C) and mild winters (5°C).",
      lifestyle_description: "Sophisticated spa town atmosphere with thermal baths and casinos. High quality of life with parks and culture.",
      data_completeness_score: 30
    },
    
    // Wellington, New Zealand
    'Wellington': {
      description: "Wellington captivates with its harbor setting, vibrant arts scene, and world-class coffee culture. New Zealand's compact capital offers urban amenities with natural beauty.",
      cost_index: 2400,
      healthcare_score: 8,
      climate_description: "Temperate oceanic climate with mild temperatures (8-20°C) but famous winds. No extreme temperatures.",
      lifestyle_description: "Creative, cosmopolitan atmosphere in a walkable city. Strong cafe culture and excellent public transport.",
      data_completeness_score: 30
    },
    
    // Wanaka, New Zealand
    'Wanaka': {
      description: "Wanaka offers stunning alpine lakeside living for active retirees. This resort town provides year-round outdoor activities with small-town charm.",
      cost_index: 2600,
      healthcare_score: 7,
      climate_description: "Alpine climate with warm summers (25°C) and cold winters (0°C). Low rainfall and high sunshine hours.",
      lifestyle_description: "Outdoor paradise for active retirees. Skiing in winter, hiking and water sports in summer.",
      data_completeness_score: 30
    }
  }
  
  // Update each town
  for (const [townName, updateData] of Object.entries(updates)) {
    console.log(`Updating ${townName}...`)
    
    // First find the town
    const { data: towns } = await supabase
      .from('towns')
      .select('id, name, country')
      .ilike('name', townName)
      .is('image_url_1', null) // Only update towns WITHOUT photos
    
    if (towns && towns.length > 0) {
      const town = towns[0]
      
      // IMPORTANT: Exclude photo fields from update
      const safeUpdate = {
        ...updateData,
        last_ai_update: new Date().toISOString()
        // NO image_url fields!
      }
      
      const { error } = await supabase
        .from('towns')
        .update(safeUpdate)
        .eq('id', town.id)
      
      if (error) {
        console.error(`❌ Error updating ${town.name}:`, error.message)
      } else {
        console.log(`✅ Updated ${town.name}, ${town.country}`)
      }
    } else {
      console.log(`⏭️  Skipped ${townName} (not found or has photo)`)
    }
  }
  
  console.log('\n✨ Test update complete!')
}

async function verifyUpdates() {
  console.log('\n3️⃣ Verifying updates...\n')
  
  for (const townName of TEST_TOWNS) {
    const { data: towns } = await supabase
      .from('towns')
      .select('name, country, description, data_completeness_score, image_url_1')
      .ilike('name', townName)
    
    if (towns && towns.length > 0) {
      const town = towns[0]
      console.log(`${town.name}, ${town.country}:`)
      console.log(`  Description: ${town.description ? '✅' : '❌'}`)
      console.log(`  Completeness: ${town.data_completeness_score}%`)
      console.log(`  Photo: ${town.image_url_1 ? '⚠️ HAS PHOTO' : '✅ Still no photo'}`)
    }
  }
}

// Run the test sequence
async function runTest() {
  await checkTestTowns()
  
  console.log('\nProceed with test update? (Check output above)')
  console.log('These towns should NOT have photos to be safe test subjects.')
  console.log('\nIf ready, uncomment the lines below:\n')
  
  // Uncomment these lines to actually run the update:
  // await updateTestTowns()
  // await verifyUpdates()
  
  console.log('// await updateTestTowns()')
  console.log('// await verifyUpdates()')
}

runTest()