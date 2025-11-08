/**
 * AI-Powered Turkish Town Geographic Feature Analyzer & Fixer
 * Uses Claude AI to analyze and correct geographic features for Turkish towns
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try multiple env file locations
dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

// Support both naming conventions
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('Looking for: VITE_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('Available env keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  process.exit(1);
}

if (!ANTHROPIC_KEY) {
  console.error('❌ Missing Anthropic API key in environment variables');
  console.error('Looking for: VITE_ANTHROPIC_API_KEY or ANTHROPIC_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_KEY
});

async function analyzeTurkishTowns() {
  console.log('🔍 Fetching Turkish towns from database...\n');

  // Fetch all Turkish towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, town_name, country, region, geographic_features_actual, regions, latitude, longitude')
    .eq('country', 'Turkey')
    .order('town_name');

  if (error) {
    console.error('❌ Error fetching towns:', error);
    return;
  }

  console.log(`📊 Found ${towns.length} Turkish towns\n`);
  console.log('Current geographic features:');
  towns.forEach(town => {
    console.log(`  - ${town.town_name}: ${town.geographic_features_actual || 'NULL'} (regions: ${JSON.stringify(town.regions)})`);
  });

  console.log('\n🤖 Analyzing each town with Claude AI...\n');

  const updates = [];

  for (const town of towns) {
    try {
      const prompt = `Analyze this Turkish town and determine its geographic features:

Town: ${town.town_name}, Turkey
Current features: ${town.geographic_features_actual || 'none'}
Latitude: ${town.latitude}
Longitude: ${town.longitude}
Region: ${town.region || 'unknown'}

Based on your knowledge of Turkish geography, determine which of these features apply:
- coastal (on the Mediterranean, Aegean, or Black Sea coast)
- island (if it's on an island)
- mountain (if it's in a mountainous area like Cappadocia, Eastern Anatolia)
- inland (if not coastal)
- valley (if in a valley)
- lake (if near a major lake)

Return ONLY a JSON object in this format:
{
  "features": "comma-separated list of applicable features",
  "reasoning": "brief explanation",
  "is_coastal": true/false
}

Examples:
- Antalya: {"features": "coastal", "reasoning": "Major Mediterranean coastal resort city", "is_coastal": true}
- Ankara: {"features": "inland, highland", "reasoning": "Capital city in central Anatolia plateau", "is_coastal": false}
- Bodrum: {"features": "coastal", "reasoning": "Aegean Sea resort town on peninsula", "is_coastal": true}`;

      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const responseText = message.content[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);

        console.log(`✅ ${town.town_name}:`);
        console.log(`   Features: ${analysis.features}`);
        console.log(`   Reasoning: ${analysis.reasoning}`);
        console.log(`   Is Coastal: ${analysis.is_coastal ? 'YES' : 'NO'}`);

        // Only update if different from current
        if (town.geographic_features_actual !== analysis.features) {
          updates.push({
            id: town.id,
            town_name: town.town_name,
            old_features: town.geographic_features_actual,
            new_features: analysis.features,
            reasoning: analysis.reasoning
          });
        }
      } else {
        console.log(`⚠️  ${town.town_name}: Could not parse AI response`);
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`❌ Error analyzing ${town.town_name}:`, error.message);
    }
  }

  console.log('\n📋 Summary of proposed updates:\n');
  if (updates.length === 0) {
    console.log('✅ All Turkish towns already have correct geographic features!');
    return;
  }

  console.log(`Found ${updates.length} towns that need updates:\n`);
  updates.forEach(update => {
    console.log(`${update.town_name}:`);
    console.log(`  OLD: "${update.old_features || 'NULL'}"`);
    console.log(`  NEW: "${update.new_features}"`);
    console.log(`  WHY: ${update.reasoning}\n`);
  });

  // Confirm before applying
  console.log('\n🔄 Applying updates to database...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const update of updates) {
    const { error } = await supabase
      .from('towns')
      .update({ geographic_features_actual: update.new_features })
      .eq('id', update.id);

    if (error) {
      console.error(`❌ Failed to update ${update.town_name}:`, error.message);
      errorCount++;
    } else {
      console.log(`✅ Updated ${update.town_name}`);
      successCount++;
    }
  }

  console.log('\n🎉 COMPLETE!');
  console.log(`✅ Successfully updated: ${successCount} towns`);
  if (errorCount > 0) {
    console.log(`❌ Failed updates: ${errorCount} towns`);
  }

  // Verify coastal towns
  const { data: coastalTowns } = await supabase
    .from('towns')
    .select('town_name, geographic_features_actual')
    .eq('country', 'Turkey')
    .ilike('geographic_features_actual', '%coastal%');

  console.log(`\n🏖️  Turkish coastal towns now in database: ${coastalTowns?.length || 0}`);
  if (coastalTowns && coastalTowns.length > 0) {
    coastalTowns.forEach(town => {
      console.log(`   - ${town.town_name}`);
    });
  }
}

analyzeTurkishTowns().catch(console.error);
