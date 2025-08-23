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

// Fields that MUST be NULL due to constraints
const CONSTRAINT_FIELDS_NULL = {
  tourist_season_impact: null,
  pollen_levels: null
};

// Critical hard data fields to enrich (from your analysis)
const CRITICAL_FIELDS = [
  'description',           // 40.9% complete
  'crime_rate',           // 34.2% complete
  'outdoor_rating',       // 33.6% complete
  'nearest_airport',      // 34.5% complete
  'meal_cost',           // 23.7% complete
  'healthcare_cost',      // 48.0% complete
  'geographic_features',  // 10.2% complete
  'tax_rates',           // 6.7% complete
  'visa_requirements',    // 6.7% complete
  'healthcare_specialties_available', // 6.7% complete
  'cost_index',          // 67% complete
  'healthcare_score',    // 72% complete
  'quality_of_life',     // 72% complete
  'internet_speed',      // 67% complete
  'climate'              // 72% complete
];

// Log with timestamp
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// Save progress
async function saveProgress(progress) {
  await fs.writeFile('hard-data-progress.json', JSON.stringify({
    ...progress,
    lastUpdate: new Date().toISOString()
  }, null, 2));
}

// Load progress
async function loadProgress() {
  try {
    const data = await fs.readFile('hard-data-progress.json', 'utf8');
    return JSON.parse(data);
  } catch {
    return {
      processedTowns: [],
      successCount: 0,
      errorCount: 0,
      totalCost: 0
    };
  }
}

// Generate hard data using Claude
async function generateHardData(town, existingData) {
  const prompt = `You are a data analyst enriching retirement destination information. Provide accurate, factual data.

LOCATION DETAILS:
Town: ${town.name}
Country: ${town.country}
State/Region: ${town.state_code || town.region || 'N/A'}
Population: ${town.population || 'Unknown'}
Latitude: ${town.latitude || 'Unknown'}
Longitude: ${town.longitude || 'Unknown'}

EXISTING DATA (for context):
Cost of Living USD: ${existingData.cost_of_living_usd || 'Missing'}
Rent 1BR: ${existingData.rent_1bed || 'Missing'}
Safety Score: ${existingData.safety_score || 'Missing'}

Generate ACCURATE data for these fields. Use real-world knowledge:

1. description: 2-3 sentences for retirees. Mention climate, lifestyle, cost of living, and main attractions.

2. crime_rate: Verbose safety description (e.g., "Low - Generally safe with occasional petty crime" or "Moderate - Some crime exists, choose neighborhoods carefully" or "Very Low - One of the safest destinations")

3. outdoor_rating: 1-10 rating based on:
   - Beaches, mountains, parks, trails
   - Climate suitability for outdoor activities
   - Natural beauty

4. nearest_airport: Airport name and IATA code (e.g., "Miami International Airport (MIA)")

5. meal_cost: Average mid-range restaurant meal in USD (realistic for the location)

6. healthcare_cost: Monthly healthcare cost for a retiree in USD (insurance + out of pocket)

7. geographic_features: Array of features (e.g., ["coastal", "flat", "tropical"] or ["mountainous", "valleys", "temperate"])

8. tax_rates: Brief description of tax situation for retirees (e.g., "No state income tax, 7% sales tax")

9. visa_requirements: Requirements for US citizens (e.g., "90-day visa-free, retirement visa available with $2000/month income")

10. healthcare_specialties_available: Array of medical specialties (e.g., ["cardiology", "oncology", "orthopedics", "general surgery"])

11. cost_index: 1-100 scale where 100 = New York City costs (calculate based on actual costs)

12. healthcare_score: 1-10 rating of healthcare quality and accessibility

13. quality_of_life: 1-10 overall rating for retirees

14. internet_speed: Average Mbps (e.g., 50, 100, 200)

15. climate: One of: Tropical, Mediterranean, Desert, Temperate, Continental, Subtropical

Return ONLY a JSON object with these exact field names. Be accurate and use real data.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      temperature: 0.2, // Lower temperature for more factual data
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
    
    // Add constraint fields as NULL
    Object.assign(enrichedData, CONSTRAINT_FIELDS_NULL);
    
    // Add metadata
    enrichedData.last_ai_update = new Date().toISOString();
    
    // Validate data types (removed crime_rate parsing since it's now verbose)
    if (enrichedData.outdoor_rating) enrichedData.outdoor_rating = parseInt(enrichedData.outdoor_rating);
    if (enrichedData.meal_cost) enrichedData.meal_cost = parseFloat(enrichedData.meal_cost);
    if (enrichedData.healthcare_cost) enrichedData.healthcare_cost = parseFloat(enrichedData.healthcare_cost);
    if (enrichedData.cost_index) enrichedData.cost_index = parseInt(enrichedData.cost_index);
    if (enrichedData.healthcare_score) enrichedData.healthcare_score = parseInt(enrichedData.healthcare_score);
    if (enrichedData.quality_of_life) enrichedData.quality_of_life = parseInt(enrichedData.quality_of_life);
    if (enrichedData.internet_speed) enrichedData.internet_speed = parseInt(enrichedData.internet_speed);
    
    // Ensure array fields are arrays
    if (enrichedData.geographic_features && !Array.isArray(enrichedData.geographic_features)) {
      // Convert comma-separated string to array if needed
      if (typeof enrichedData.geographic_features === 'string') {
        enrichedData.geographic_features = enrichedData.geographic_features
          .split(',')
          .map(f => f.trim())
          .filter(f => f.length > 0);
      }
    }
    
    if (enrichedData.healthcare_specialties_available && !Array.isArray(enrichedData.healthcare_specialties_available)) {
      // Convert comma-separated string to array if needed
      if (typeof enrichedData.healthcare_specialties_available === 'string') {
        enrichedData.healthcare_specialties_available = enrichedData.healthcare_specialties_available
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);
      }
    }
    
    return enrichedData;
  } catch (error) {
    log(`Error generating data: ${error.message}`);
    return null;
  }
}

// Check which fields need updating
function getTownNeedsUpdate(town) {
  const missingFields = [];
  
  for (const field of CRITICAL_FIELDS) {
    if (!town[field] || town[field] === null || town[field] === '') {
      missingFields.push(field);
    }
  }
  
  return {
    needsUpdate: missingFields.length > 0,
    missingFields,
    completeness: ((CRITICAL_FIELDS.length - missingFields.length) / CRITICAL_FIELDS.length * 100).toFixed(1)
  };
}

// Main enrichment function
async function enrichHardData(options = {}) {
  const { testMode = false, limit = null, continueFromProgress = true } = options;
  
  log('='.repeat(60));
  log('STARTING HARD DATA ENRICHMENT');
  log('='.repeat(60));
  
  // Load previous progress
  const progress = continueFromProgress ? await loadProgress() : {
    processedTowns: [],
    successCount: 0,
    errorCount: 0,
    totalCost: 0
  };
  
  if (progress.processedTowns.length > 0) {
    log(`Continuing from previous run: ${progress.processedTowns.length} towns already processed`);
  }
  
  // Fetch all towns
  const { data: allTowns, error: fetchError } = await supabase
    .from('towns')
    .select('*')
    .order('country', { ascending: true });
    
  if (fetchError) {
    log(`Error fetching towns: ${fetchError.message}`);
    return;
  }
  
  // Filter towns that need updates
  const townsNeedingUpdates = allTowns.filter(town => {
    if (progress.processedTowns.includes(town.id)) return false;
    const { needsUpdate } = getTownNeedsUpdate(town);
    return needsUpdate;
  });
  
  log(`Total towns: ${allTowns.length}`);
  log(`Towns needing updates: ${townsNeedingUpdates.length}`);
  log(`Already processed: ${progress.processedTowns.length}`);
  
  // Apply limit if specified
  let townsToProcess = townsNeedingUpdates;
  if (testMode) {
    townsToProcess = townsNeedingUpdates.slice(0, 3);
    log('TEST MODE: Processing only 3 towns');
  } else if (limit) {
    townsToProcess = townsNeedingUpdates.slice(0, limit);
    log(`Limited to ${limit} towns`);
  }
  
  log(`\nProcessing ${townsToProcess.length} towns...`);
  log('-'.repeat(60));
  
  // Process each town
  for (let i = 0; i < townsToProcess.length; i++) {
    const town = townsToProcess[i];
    const { missingFields, completeness } = getTownNeedsUpdate(town);
    
    log(`\n[${i + 1}/${townsToProcess.length}] ${town.name}, ${town.country}`);
    log(`  Current completeness: ${completeness}%`);
    log(`  Missing fields: ${missingFields.length} (${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? '...' : ''})`);
    
    // Generate enrichment data
    const enrichedData = await generateHardData(town, {
      cost_of_living_usd: town.cost_of_living_usd,
      rent_1bed: town.rent_1bed,
      safety_score: town.safety_score
    });
    
    if (!enrichedData) {
      log(`  ❌ Failed to generate data`);
      progress.errorCount++;
      continue;
    }
    
    // Update database
    const { error: updateError } = await supabase
      .from('towns')
      .update(enrichedData)
      .eq('id', town.id);
      
    if (updateError) {
      log(`  ❌ Database update failed: ${updateError.message}`);
      progress.errorCount++;
    } else {
      log(`  ✅ Successfully updated`);
      progress.successCount++;
      progress.processedTowns.push(town.id);
      
      // Calculate cost (Haiku pricing)
      const estimatedTokens = 800; // ~800 tokens per request
      const costPerRequest = (estimatedTokens / 1000000) * 0.25; // $0.25 per million tokens
      progress.totalCost += costPerRequest;
    }
    
    // Save progress every 5 towns
    if ((i + 1) % 5 === 0) {
      await saveProgress(progress);
      log(`  💾 Progress saved`);
    }
    
    // Rate limiting
    if (i < townsToProcess.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
  }
  
  // Final save
  await saveProgress(progress);
  
  // Summary report
  log('\n' + '='.repeat(60));
  log('ENRICHMENT COMPLETE');
  log('='.repeat(60));
  log(`✅ Successfully updated: ${progress.successCount} towns`);
  log(`❌ Failed: ${progress.errorCount} towns`);
  log(`📊 Total processed (all-time): ${progress.processedTowns.length} towns`);
  log(`💰 Estimated cost: $${progress.totalCost.toFixed(4)}`);
  log(`📁 Progress saved to: hard-data-progress.json`);
  
  // Data quality report
  if (!testMode) {
    log('\n📈 DATA QUALITY REPORT:');
    const { data: updatedTowns } = await supabase
      .from('towns')
      .select('*')
      .in('id', progress.processedTowns.slice(-10)); // Check last 10 processed
      
    if (updatedTowns) {
      const avgCompleteness = updatedTowns.reduce((sum, town) => {
        const { completeness } = getTownNeedsUpdate(town);
        return sum + parseFloat(completeness);
      }, 0) / updatedTowns.length;
      
      log(`Average completeness of processed towns: ${avgCompleteness.toFixed(1)}%`);
    }
  }
  
  log('\n✨ Done!');
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  testMode: args.includes('--test'),
  limit: args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : null,
  continueFromProgress: !args.includes('--restart')
};

// Show usage if --help
if (args.includes('--help')) {
  console.log(`
Usage: node enrich-hard-data.js [options]

Options:
  --test              Run in test mode (process only 3 towns)
  --limit <number>    Limit number of towns to process
  --restart           Start fresh, ignore previous progress
  --help              Show this help message

Examples:
  node enrich-hard-data.js --test
  node enrich-hard-data.js --limit 50
  node enrich-hard-data.js --restart --limit 100
`);
  process.exit(0);
}

// Run enrichment
enrichHardData(options).catch(console.error);