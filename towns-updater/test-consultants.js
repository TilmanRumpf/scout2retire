import { AI_CONSULTANTS, getConsultantForColumn } from './ai-consultants-complete.js'

console.log('🤖 Testing AI Consultants System\n')

// Test town
const porto = { name: 'Porto', country: 'Portugal' }

// Test 1: Check all consultants loaded
console.log('Available consultants:')
Object.keys(AI_CONSULTANTS).forEach(consultant => {
  console.log(`- ${consultant}`)
})

// Test 2: Generate a sample prompt
console.log('\n📝 Sample prompt for Healthcare Consultant:')
const healthcarePrompt = AI_CONSULTANTS.healthcare.prompts.healthcare_description(porto, 'US')
console.log(healthcarePrompt)

// Test 3: Check column mapping
console.log('\n🗺️ Column mapping test:')
console.log('healthcare_description maps to:', getConsultantForColumn('healthcare_description'))
console.log('visa_requirements maps to:', getConsultantForColumn('visa_requirements'))

console.log('\n✅ AI Consultants system ready!')