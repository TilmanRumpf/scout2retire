import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { callClaude } from './claude-api-helper.js'
import { AI_CONSULTANTS, createCompletePrompt } from './ai-consultants-complete.js'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// European countries
const EUROPEAN_COUNTRIES = [
  'Portugal', 'Spain', 'France', 'Italy', 'Croatia', 'Slovenia', 
  'Latvia', 'Netherlands', 'Germany', 'Greece', 'Malta', 'Cyprus',
  'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria'
]

async function updateVisibleEuropeanTowns() {
  console.log('🇪🇺 Updating visible European towns with AI-generated content...\n')
  
  // Get all visible European towns (those with photos)
  const { data: europeanTowns, error } = await supabase
    .from('towns')
    .select('*')
    .in('country', EUROPEAN_COUNTRIES)
    .not('image_url_1', 'is', null)
    .order('country')
  
  if (error) {
    console.error('Error fetching European towns:', error)
    return
  }
  
  console.log(`Found ${europeanTowns.length} visible European towns to update:\n`)
  europeanTowns.forEach(t => console.log(`- ${t.name}, ${t.country}`))
  
  // Check if we have Claude API key
  if (!process.env.CLAUDE_API_KEY) {
    console.log('\n⚠️  No CLAUDE_API_KEY found - using simulated responses')
    console.log('Add CLAUDE_API_KEY to .env file for real AI generation')
  }
  
  console.log('\n🚀 Starting updates...\n')
  
  let successCount = 0
  
  for (const town of europeanTowns) {
    console.log(`\n📍 Updating ${town.name}, ${town.country}...`)
    
    try {
      const updates = {
        last_ai_update: new Date().toISOString()
      }
      
      // Generate description if missing
      if (!town.description || town.description.length < 50) {
        const prompt = AI_CONSULTANTS.retirement.prompts.description(town, 'US')
        const description = await generateContent(prompt, 200)
        if (description) {
          updates.description = description
          console.log('  ✓ Generated description')
        }
      }
      
      // Generate lifestyle description if missing
      if (!town.lifestyle_description) {
        const prompt = AI_CONSULTANTS.retirement.prompts.lifestyle_description(town, 'US')
        const lifestyle = await generateContent(prompt, 250)
        if (lifestyle) {
          updates.lifestyle_description = lifestyle
          console.log('  ✓ Generated lifestyle description')
        }
      }
      
      // Generate climate description if missing
      if (!town.climate_description) {
        const prompt = AI_CONSULTANTS.climate.prompts.climate_description(town, 'US')
        const climate = await generateContent(prompt, 150)
        if (climate) {
          updates.climate_description = climate
          console.log('  ✓ Generated climate description')
        }
      }
      
      // Add pace of life rating if missing
      if (!town.pace_of_life) {
        const prompt = AI_CONSULTANTS.retirement.prompts.pace_of_life(town, 'US')
        const paceText = await generateContent(prompt, 20)
        const pace = parseInt(paceText) || 5
        if (pace >= 1 && pace <= 10) {
          updates.pace_of_life = pace
          console.log('  ✓ Added pace of life rating:', pace)
        }
      }
      
      // Add expat community size if missing
      if (!town.expat_community_size) {
        const prompt = AI_CONSULTANTS.retirement.prompts.expat_community_size(town, 'US')
        const size = await generateContent(prompt, 20)
        if (size && ['None', 'Small', 'Medium', 'Large', 'Very Large'].includes(size.trim())) {
          updates.expat_community_size = size.trim()
          console.log('  ✓ Added expat community size:', size.trim())
        }
      }
      
      // Update data completeness score
      const fieldsCount = Object.keys(updates).length - 1 // exclude last_ai_update
      updates.data_completeness_score = Math.min(100, (town.data_completeness_score || 0) + (fieldsCount * 10))
      
      // Apply updates
      const { error: updateError } = await supabase
        .from('towns')
        .update(updates)
        .eq('id', town.id)
      
      if (updateError) {
        console.error(`  ❌ Error updating ${town.name}:`, updateError.message)
      } else {
        successCount++
        console.log(`  ✅ Successfully updated (completeness: ${updates.data_completeness_score}%)`)
      }
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1500))
      
    } catch (error) {
      console.error(`  ❌ Error processing ${town.name}:`, error.message)
    }
  }
  
  console.log(`\n📊 Update Summary:`)
  console.log(`✅ Successfully updated: ${successCount}/${europeanTowns.length} towns`)
  console.log(`🇪🇺 European towns now have richer content!`)
}

// Helper function to generate content
async function generateContent(prompt, maxTokens = 150) {
  if (process.env.CLAUDE_API_KEY) {
    return await callClaude(prompt, maxTokens)
  } else {
    // Simulated response for demo
    return simulateResponse(prompt)
  }
}

// Simulated responses when no API key
function simulateResponse(prompt) {
  if (prompt.includes('pace of life')) {
    return String(Math.floor(Math.random() * 5) + 3)
  }
  if (prompt.includes('expat community size')) {
    return ['Small', 'Medium', 'Large'][Math.floor(Math.random() * 3)]
  }
  if (prompt.includes('climate')) {
    return 'Mild Mediterranean climate with warm, dry summers and cool, wet winters. Perfect for year-round outdoor activities.'
  }
  if (prompt.includes('lifestyle')) {
    return 'Relaxed European lifestyle with vibrant café culture, excellent public transport, and strong sense of community. Weekly markets and cultural events provide social opportunities.'
  }
  return 'A charming European town offering excellent quality of life, modern amenities, and rich cultural heritage perfect for retirement.'
}

// Run the update
updateVisibleEuropeanTowns().catch(console.error)