import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY,
});

// Fields that have database constraints - always set to NULL
const CONSTRAINT_FIELDS = [
  'tourist_season_impact',
  'pollen_levels'
];

// Priority fields to enrich
const PRIORITY_FIELDS = [
  'image_url_1',
  'description',
  'outdoor_rating',
  'crime_rate',
  'nearest_airport',
  'meal_cost',
  'healthcare_cost',
  'geographic_features',
  'tax_rates',
  'visa_requirements',
  'healthcare_specialties_available'
];

// Log with timestamp
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// Save progress to file
async function saveProgress(processedIds) {
  await fs.writeFile('enrichment-progress.json', JSON.stringify({
    processedIds,
    lastRun: new Date().toISOString(),
    totalProcessed: processedIds.length
  }, null, 2));
}

// Load previous progress
async function loadProgress() {
  try {
    const data = await fs.readFile('enrichment-progress.json', 'utf8');
    return JSON.parse(data);
  } catch {
    return { processedIds: [], lastRun: null, totalProcessed: 0 };
  }
}

// Generate enrichment data using Claude
async function generateEnrichmentData(town) {
  const prompt = `You are enriching data for a retirement destination database. 
  
Town: ${town.name}
Country: ${town.country}
State/Region: ${town.state_code || town.region || 'Unknown'}
Current Population: ${town.population || 'Unknown'}

Generate realistic, accurate data for these fields. Be specific and factual:

1. image_url_1: Suggest a specific landmark or scenic view that represents this town (describe what the image should show, I'll find the URL later)
2. description: Write a compelling 2-3 sentence description for retirees (mention climate, lifestyle, and key attractions)
3. outdoor_rating: Rate 1-10 based on hiking, parks, beaches, outdoor activities
4. crime_rate: Estimate crimes per 100,000 people (be realistic based on the location)
5. nearest_airport: Name the nearest major airport and its 3-letter code
6. meal_cost: Average cost of a meal at a mid-range restaurant in USD
7. healthcare_cost: Average monthly healthcare cost for a retiree in USD
8. geographic_features: List 2-3 key features (e.g., "coastal, mountains, valleys")
9. tax_rates: Brief description of tax situation for retirees
10. visa_requirements: Brief visa/residency requirements for US retirees
11. healthcare_specialties_available: List 3-5 medical specialties available locally

Return as JSON object with these exact field names. Be accurate and realistic.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const enrichedData = JSON.parse(jsonMatch[0]);
    
    // Add NULL for constraint fields
    CONSTRAINT_FIELDS.forEach(field => {
      enrichedData[field] = null;
    });
    
    // Add metadata
    enrichedData.last_ai_update = new Date().toISOString();
    
    return enrichedData;
  } catch (error) {
    log(`Error generating data for ${town.name}: ${error.message}`);
    return null;
  }
}

// Main enrichment function
async function enrichTowns(testMode = false) {
  log('Starting safe enrichment process...');
  
  // Load progress
  const progress = await loadProgress();
  log(`Previous progress: ${progress.totalProcessed} towns processed`);
  
  // Get towns that need enrichment (missing photos)
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, state_code, region, population, image_url_1, description')
    .is('image_url_1', null)
    .order('country', { ascending: true });
    
  if (error) {
    log(`Error fetching towns: ${error.message}`);
    return;
  }
  
  // Filter out already processed towns
  const townsToProcess = towns.filter(t => !progress.processedIds.includes(t.id));
  
  log(`Found ${townsToProcess.length} towns to enrich (${towns.length} total missing photos)`);
  
  if (testMode) {
    log('TEST MODE: Processing only first town');
    townsToProcess.splice(1);
  }
  
  let successCount = 0;
  let errorCount = 0;
  let estimatedCost = 0;
  
  for (let i = 0; i < townsToProcess.length; i++) {
    const town = townsToProcess[i];
    log(`\n[${i + 1}/${townsToProcess.length}] Processing ${town.name}, ${town.country}`);
    
    // Generate enrichment data
    const enrichedData = await generateEnrichmentData(town);
    
    if (!enrichedData) {
      errorCount++;
      continue;
    }
    
    // Update database (will not fail due to constraints)
    const { error: updateError } = await supabase
      .from('towns')
      .update(enrichedData)
      .eq('id', town.id);
      
    if (updateError) {
      log(`❌ Error updating ${town.name}: ${updateError.message}`);
      errorCount++;
    } else {
      log(`✅ Successfully enriched ${town.name}`);
      successCount++;
      progress.processedIds.push(town.id);
      
      // Save progress every 5 towns
      if (successCount % 5 === 0) {
        await saveProgress(progress.processedIds);
        log(`💾 Progress saved: ${successCount} towns completed`);
      }
    }
    
    // Estimate cost (Haiku: $0.25 per million input tokens, ~500 tokens per request)
    estimatedCost += 0.000125;
    
    // Rate limiting - wait 1 second between requests
    if (i < townsToProcess.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Final save
  await saveProgress(progress.processedIds);
  
  // Summary
  log('\n' + '='.repeat(50));
  log('ENRICHMENT COMPLETE');
  log(`✅ Success: ${successCount} towns`);
  log(`❌ Errors: ${errorCount} towns`);
  log(`💰 Estimated cost: $${estimatedCost.toFixed(2)}`);
  log(`📊 Total processed (all time): ${progress.processedIds.length} towns`);
  log('='.repeat(50));
}

// Parse command line arguments
const args = process.argv.slice(2);
const testMode = args.includes('--test');

// Run enrichment
enrichTowns(testMode).catch(console.error);