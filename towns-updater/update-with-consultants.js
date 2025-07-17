import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { AI_CONSULTANTS } from './ai-consultants-complete.js'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Example: Update Porto with AI consultant data
async function updateTownWithConsultants() {
  console.log('🤖 Updating town with AI consultants...\n')
  
  const town = { name: 'Porto', country: 'Portugal' }
  
  // Simulate AI responses (in real use, you'd call Claude API)
  const aiGeneratedContent = {
    // From Retirement Consultant
    description: "Porto captivates retirees with its perfect blend of old-world charm and modern amenities, offering UNESCO World Heritage architecture alongside a thriving cultural scene. The city's walkable neighborhoods, excellent healthcare, and welcoming locals create an ideal environment for expats seeking authentic Portuguese living at a fraction of Lisbon's cost.",
    pace_of_life: 4,
    expat_community_size: "Large",
    
    // From Healthcare Consultant (citizenship-specific)
    healthcare_description: {
      US: "Porto offers excellent healthcare through both public and private systems. US retirees typically opt for private insurance (€50-100/month) for shorter wait times and English-speaking doctors.",
      UK: "UK retirees with S1 forms can access public healthcare immediately. Private insurance adds faster specialist access for €60-120/month.",
      EU: "EU citizens can use EHIC for emergencies and register for full public healthcare access after obtaining residency."
    },
    healthcare_score: 8,
    
    // From Immigration Consultant (citizenship-specific)
    visa_requirements: {
      US: "90 days visa-free, then D7 visa with €760/month passive income proof",
      UK: "90 days visa-free post-Brexit, similar D7 requirements as US citizens",
      EU: "Unlimited stay, register for residency certificate after 3 months"
    },
    
    // From Climate Consultant
    climate_description: "Porto enjoys a mild Atlantic climate with warm summers (25°C/77°F) and cool, rainy winters (12°C/54°F). The city experiences more rainfall than southern Portugal but avoids extreme temperatures year-round.",
    
    // Data completeness tracking
    data_completeness_score: 75,
    last_ai_update: new Date().toISOString()
  }
  
  // Update the town
  const { data, error } = await supabase
    .from('towns')
    .update(aiGeneratedContent)
    .eq('name', town.name)
    .eq('country', town.country)
    .select()
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✅ Successfully updated with AI consultant data!')
    console.log('\n📊 Data completeness: 75%')
    console.log('\n🌍 Citizenship-specific content added for:')
    console.log('- Healthcare access')
    console.log('- Visa requirements')
  }
}

// Show how consultants would be used
function demonstrateConsultantUsage() {
  console.log('\n📋 Consultant Usage Example:\n')
  
  const porto = { name: 'Porto', country: 'Portugal' }
  
  // Show prompts for different consultants
  console.log('1️⃣ Retirement Consultant Prompt:')
  console.log(AI_CONSULTANTS.retirement.prompts.description(porto, 'US'))
  
  console.log('\n2️⃣ Healthcare Consultant Prompt (US citizen):')
  console.log(AI_CONSULTANTS.healthcare.prompts.healthcare_description(porto, 'US'))
  
  console.log('\n3️⃣ Immigration Consultant Prompt (UK citizen):')
  console.log(AI_CONSULTANTS.immigration.prompts.visa_requirements(porto, 'UK'))
}

// Run demonstration
demonstrateConsultantUsage()
console.log('\n' + '='.repeat(50) + '\n')

// Run actual update
updateTownWithConsultants()