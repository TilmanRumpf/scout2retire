import { createClient } from '@supabase/supabase-js';
import { calculateEnhancedMatch } from '../src/utils/enhancedMatchingAlgorithm.js';
import { 
  generateEnhancedInsights, 
  generateEnhancedWarnings, 
  generateEnhancedHighlights 
} from '../src/utils/enhancedMatchingHelpers.js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testEnhancedMatching() {
  try {
    console.log('Testing Enhanced Matching Algorithm...\n');
    
    // Get a sample town
    const { data: town, error: townError } = await supabase
      .from('towns')
      .select('*')
      .eq('name', 'Porto')
      .single();
      
    if (townError) throw townError;
    console.log('Test town:', town.name, town.country);
    
    // Create test preferences
    const testPreferences = {
      region_preferences: {
        countries: ['Portugal', 'Spain', 'France'],
        regions: ['Europe', 'Mediterranean'],
        geographic_features: ['Coastal', 'Historic'],
        vegetation_types: ['Mediterranean']
      },
      climate_preferences: {
        seasonal_preference: 'warm_all_year',
        summer_climate_preference: 'warm_dry',
        winter_climate_preference: 'mild_wet',
        temperature_sensitivity: 'moderate'
      },
      culture_preferences: {
        language_comfort: {
          preferences: ['willing_to_learn']
        },
        lifestyle_preferences: {
          pace_of_life: ['relaxed'],
          cultural_environment: ['blend_of_old_and_new']
        }
      },
      hobbies_preferences: {
        primary_hobbies: ['golf', 'dining'],
        secondary_hobbies: ['beach', 'cultural_events']
      },
      admin_preferences: {
        healthcare_quality: ['good'],
        safety_importance: ['good'],
        stay_duration: ['long']
      },
      budget_preferences: {
        total_monthly_budget: 3000,
        income_tax_sensitive: true
      },
      current_status: {
        citizenship: 'USA'
      }
    };
    
    // Calculate match
    console.log('\nCalculating match score...');
    const matchResult = await calculateEnhancedMatch(testPreferences, town);
    
    console.log('\nMatch Results:');
    console.log('Overall Score:', matchResult.match_score + '%');
    console.log('Match Quality:', matchResult.match_quality);
    console.log('\nCategory Scores:');
    Object.entries(matchResult.category_scores).forEach(([category, score]) => {
      console.log(`  ${category}: ${score}%`);
    });
    
    console.log('\nTop Factors:');
    matchResult.top_factors.forEach(factor => {
      console.log(`  - ${factor.factor} (+${factor.score})`);
    });
    
    // Generate insights
    const insights = generateEnhancedInsights(town, testPreferences, matchResult.category_scores);
    const warnings = generateEnhancedWarnings(town, testPreferences);
    const highlights = generateEnhancedHighlights(town, matchResult.category_scores);
    
    console.log('\nInsights:');
    insights.forEach(insight => {
      console.log(`  [${insight.category}] ${insight.text}`);
    });
    
    console.log('\nWarnings:');
    warnings.forEach(warning => {
      console.log(`  [${warning.severity}] ${warning.text}`);
    });
    
    console.log('\nHighlights:');
    highlights.forEach(highlight => {
      console.log(`  - ${highlight}`);
    });
    
    // Test with multiple towns
    console.log('\n\nTesting with multiple towns...');
    const { data: towns, error: townsError } = await supabase
      .from('towns')
      .select('*')
      .in('name', ['Paris', 'Barcelona', 'Lisbon', 'Rome', 'Athens'])
      .not('image_url_1', 'is', null);
      
    if (townsError) throw townsError;
    
    console.log('\nComparative Scores:');
    const scores = await Promise.all(towns.map(async t => {
      const result = await calculateEnhancedMatch(testPreferences, t);
      return {
        name: t.name,
        country: t.country,
        score: result.match_score,
        quality: result.match_quality
      };
    }));
    
    scores.sort((a, b) => b.score - a.score);
    scores.forEach(({ name, country, score, quality }) => {
      console.log(`  ${name}, ${country}: ${score}% (${quality})`);
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testEnhancedMatching();