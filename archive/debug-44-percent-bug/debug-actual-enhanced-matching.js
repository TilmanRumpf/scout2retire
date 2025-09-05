import { createClient } from '@supabase/supabase-js';
import { calculateEnhancedMatch } from './src/utils/enhancedMatchingAlgorithm.js';
import { convertPreferencesToAlgorithmFormat } from './src/utils/unifiedScoring.js';

// Create Supabase client
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function debugActualEnhancedMatching() {
  console.log('🚀 ACTUAL ENHANCED MATCHING ALGORITHM DEBUG')
  console.log('==========================================\n')
  
  try {
    // Get the latest user preferences
    console.log('📥 Fetching user preferences...')
    const { data: user, error: userError } = await supabase
      .from('user_preferences')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (userError) {
      console.error('❌ Error fetching user preferences:', userError)
      return
    }
    
    console.log('✅ User preferences loaded')
    console.log('Raw user data keys:', Object.keys(user))
    
    // Get Valencia town data
    console.log('\\n📥 Fetching Valencia town data...')
    const { data: valencia, error: townError } = await supabase
      .from('towns')
      .select('*')
      .eq('name', 'Valencia')
      .eq('country', 'Spain')
      .single()
    
    if (townError) {
      console.error('❌ Error fetching Valencia data:', townError)
      return
    }
    
    console.log('✅ Valencia town data loaded')
    console.log('Valencia country:', valencia.country)
    
    // Convert preferences using the real conversion function
    console.log('\\n🔄 Converting user preferences to algorithm format...')
    const convertedPreferences = convertPreferencesToAlgorithmFormat(user)
    
    console.log('✅ Preferences converted')
    console.log('Converted structure keys:', Object.keys(convertedPreferences))
    
    console.log('\\n📋 CONVERTED PREFERENCES BREAKDOWN:')
    console.log('Region preferences:', JSON.stringify(convertedPreferences.region_preferences, null, 2))
    console.log('Climate preferences:', JSON.stringify(convertedPreferences.climate_preferences, null, 2))
    console.log('Culture preferences:', JSON.stringify(convertedPreferences.culture_preferences, null, 2))
    console.log('Hobbies preferences:', JSON.stringify(convertedPreferences.hobbies_preferences, null, 2))
    console.log('Admin preferences:', JSON.stringify(convertedPreferences.admin_preferences, null, 2))
    console.log('Budget preferences:', JSON.stringify(convertedPreferences.budget_preferences, null, 2))
    
    // Run the actual enhanced matching algorithm
    console.log('\\n🧮 RUNNING ACTUAL ENHANCED MATCHING ALGORITHM...')
    const result = await calculateEnhancedMatch(convertedPreferences, valencia)
    
    console.log('✅ Enhanced matching complete!')
    
    console.log('\\n🎯 ACTUAL RESULTS:')
    console.log('=' * 50)
    console.log(`Final Match Score: ${result.match_score}%`)
    console.log(`Match Quality: ${result.match_quality}`)
    
    console.log('\\n📊 CATEGORY SCORES:')
    console.log(`  Region: ${result.category_scores.region}%`)
    console.log(`  Climate: ${result.category_scores.climate}%`)
    console.log(`  Culture: ${result.category_scores.culture}%`)
    console.log(`  Hobbies: ${result.category_scores.hobbies}%`)
    console.log(`  Admin: ${result.category_scores.admin}%`)
    console.log(`  Budget: ${result.category_scores.budget}%`)
    
    console.log('\\n🔍 TOP FACTORS:')
    result.top_factors.forEach((factor, index) => {
      console.log(`  ${index + 1}. ${factor.factor} (${factor.score} points)`)
    })
    
    console.log('\\n⚠️ WARNINGS:')
    if (result.warnings.length === 0) {
      console.log('  No warnings')
    } else {
      result.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`)
      })
    }
    
    // Identify problem categories
    const lowScoreCategories = Object.entries(result.category_scores)
      .filter(([category, score]) => score < 50)
      .map(([category, score]) => ({ category, score }))
    
    if (lowScoreCategories.length > 0) {
      console.log('\\n🚨 LOW SCORING CATEGORIES (< 50%):')
      lowScoreCategories.forEach(({ category, score }) => {
        console.log(`  ${category.toUpperCase()}: ${score}% - This may be dragging down the total score`)
      })
    }
    
    console.log('\\n💡 ANALYSIS:')
    if (result.match_score < 50) {
      console.log('❌ Score is unexpectedly low. Problem categories identified above.')
      console.log('   Check the specific scoring functions for these categories.')
    } else {
      console.log('✅ Score looks reasonable.')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    console.error('Stack trace:', error.stack)
  }
}

// Run the debug
debugActualEnhancedMatching()