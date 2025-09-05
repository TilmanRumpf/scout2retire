#!/usr/bin/env node

/**
 * UNIFIED DATA ENRICHMENT FRAMEWORK
 * Uses Claude Haiku for all data research - NO external APIs
 * Aligns with Numbeo data formats for future compatibility
 * 
 * Scales aligned with Numbeo:
 * - Healthcare/Safety: 0-10 scale (we keep as-is)
 * - Crime Index: 0-100 scale (converting from text)
 * - Government/Political: 0-100 scale (we have this)
 * - Costs: USD actual amounts
 * - Air Quality: Standard AQI scale
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

// Initialize Supabase with service role key for updates
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Anthropic with Haiku model for cost efficiency
const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY,
});

// Numbeo-aligned data formats
const NUMBEO_FORMATS = {
  // 0-10 scales (already aligned)
  healthcare_score: { min: 0, max: 10, type: 'float', description: 'Healthcare quality and accessibility' },
  safety_score: { min: 0, max: 10, type: 'float', description: 'General safety rating' },
  quality_of_life: { min: 0, max: 10, type: 'float', description: 'Overall quality of life for retirees' },
  outdoor_rating: { min: 0, max: 10, type: 'integer', description: 'Outdoor activities rating' },
  
  // 0-100 scales (Numbeo standard)
  crime_index: { min: 0, max: 100, type: 'float', description: 'Crime level (0=safest, 100=most dangerous)' },
  government_efficiency_rating: { min: 0, max: 100, type: 'float', description: 'Government efficiency percentage' },
  political_stability_rating: { min: 0, max: 100, type: 'float', description: 'Political stability percentage' },
  cost_index: { min: 0, max: 200, type: 'integer', description: 'Cost index where 100=NYC baseline' },
  
  // USD amounts (actual values)
  cost_of_living_usd: { min: 500, max: 10000, type: 'float', description: 'Monthly cost for comfortable retirement' },
  meal_cost: { min: 3, max: 100, type: 'float', description: 'Average mid-range restaurant meal in USD' },
  groceries_cost: { min: 100, max: 2000, type: 'float', description: 'Monthly groceries for one person in USD' },
  healthcare_cost_monthly: { min: 0, max: 3000, type: 'float', description: 'Monthly healthcare costs for retiree' },
  rent_1bed: { min: 200, max: 5000, type: 'float', description: '1-bedroom apartment monthly rent' },
  
  // Standard scales
  air_quality_index: { min: 0, max: 500, type: 'integer', description: 'Standard AQI (0-50 good, 51-100 moderate)' },
  internet_speed: { min: 1, max: 1000, type: 'integer', description: 'Average internet speed in Mbps' },
  
  // Text descriptions (will be enriched)
  visa_requirements: { type: 'text', description: 'Visa requirements for US citizens' },
  tax_implications: { type: 'text', description: 'Tax implications for retirees' },
  nearest_airport: { type: 'text', description: 'Nearest airport name and IATA code' },
};

// Crime rate text to numeric conversion map
const CRIME_TEXT_TO_INDEX = {
  'very low - one of the safest destinations': 15,
  'very low': 20,
  'low': 30,
  'low - generally safe': 30,
  'low to moderate': 40,
  'moderate': 50,
  'moderate - some areas require caution': 55,
  'moderate to high': 70,
  'high': 80,
  'very high': 90
};

// Column groups for vertical processing (max 3 columns at a time)
const ENRICHMENT_GROUPS = {
  cost_data: {
    columns: ['cost_of_living_usd', 'meal_cost', 'groceries_cost'],
    priority: 1,
    description: 'Essential cost of living data'
  },
  healthcare_data: {
    columns: ['healthcare_cost_monthly', 'healthcare_score', 'hospital_count'],
    priority: 2,
    description: 'Healthcare costs and quality'
  },
  infrastructure_data: {
    columns: ['internet_speed', 'air_quality_index', 'environmental_health_rating'],
    priority: 3,
    description: 'Infrastructure and environment'
  },
  geographic_data: {
    columns: ['nearest_airport', 'latitude', 'longitude'],
    priority: 4,
    description: 'Geographic and travel data'
  },
  administrative_data: {
    columns: ['crime_index', 'visa_requirements', 'tax_implications'],
    priority: 5,
    description: 'Administrative and legal information'
  }
};

// Logging with timestamp
const log = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString();
  const prefix = level === 'ERROR' ? '❌' : level === 'SUCCESS' ? '✅' : '📊';
  console.log(`[${timestamp}] ${prefix} ${message}`);
};

// Save progress to resume later
async function saveProgress(groupName, progress) {
  const filename = `enrichment-progress-${groupName}.json`;
  await fs.writeFile(filename, JSON.stringify({
    ...progress,
    lastUpdate: new Date().toISOString()
  }, null, 2));
  log(`Progress saved to ${filename}`);
}

// Load previous progress
async function loadProgress(groupName) {
  const filename = `enrichment-progress-${groupName}.json`;
  try {
    const data = await fs.readFile(filename, 'utf8');
    return JSON.parse(data);
  } catch {
    return {
      processedTowns: [],
      successCount: 0,
      errorCount: 0,
      totalCost: 0,
      auditRecords: []
    };
  }
}

// Validate enriched data against Numbeo formats
function validateEnrichedData(column, value) {
  const format = NUMBEO_FORMATS[column];
  if (!format) return { valid: true, value }; // No validation rules
  
  // Handle text fields
  if (format.type === 'text') {
    return { 
      valid: value && value.length > 0, 
      value: value ? value.trim() : null 
    };
  }
  
  // Handle numeric fields
  let numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return { valid: false, error: `Invalid number: ${value}` };
  }
  
  // Check range
  if (format.min !== undefined && numValue < format.min) {
    numValue = format.min;
    log(`Clamped ${column} from ${value} to min ${format.min}`, 'WARN');
  }
  if (format.max !== undefined && numValue > format.max) {
    numValue = format.max;
    log(`Clamped ${column} from ${value} to max ${format.max}`, 'WARN');
  }
  
  // Convert to integer if needed
  if (format.type === 'integer') {
    numValue = Math.round(numValue);
  }
  
  return { valid: true, value: numValue };
}

// Create audit trail record
async function createAuditRecord(townId, column, oldValue, newValue, source, cost) {
  const auditData = {
    town_id: townId,
    column_name: column,
    old_value: oldValue ? String(oldValue) : null,
    new_value: String(newValue),
    data_source: source,
    enrichment_method: 'claude-haiku',
    cost_usd: cost,
    operator: 'unified-enrichment',
    success: true,
    timestamp: new Date().toISOString()
  };
  
  // Try to insert into audit table (create table first if it doesn't exist)
  try {
    const { error } = await supabase
      .from('town_data_audit')
      .insert(auditData);
    
    if (error && error.code === '42P01') {
      // Table doesn't exist, create it
      await createAuditTable();
      // Retry insert
      await supabase.from('town_data_audit').insert(auditData);
    }
  } catch (error) {
    log(`Audit trail error: ${error.message}`, 'WARN');
  }
  
  return auditData;
}

// Create audit table if it doesn't exist
async function createAuditTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS town_data_audit (
        id SERIAL PRIMARY KEY,
        town_id INTEGER REFERENCES towns(id),
        column_name TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        data_source TEXT,
        enrichment_method TEXT,
        cost_usd DECIMAL(10,6),
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        operator TEXT DEFAULT 'unified-enrichment',
        success BOOLEAN DEFAULT TRUE,
        error_message TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_audit_town_id ON town_data_audit(town_id);
      CREATE INDEX IF NOT EXISTS idx_audit_column ON town_data_audit(column_name);
      CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON town_data_audit(timestamp);
    `
  });
  
  if (error) {
    log(`Failed to create audit table: ${error.message}`, 'ERROR');
  } else {
    log('Created town_data_audit table', 'SUCCESS');
  }
}

// Generate enrichment prompt for Claude
function generateEnrichmentPrompt(town, columns, existingData) {
  const columnDescriptions = columns.map(col => {
    const format = NUMBEO_FORMATS[col];
    if (!format) return `${col}: Provide accurate data`;
    
    let instruction = `${col}: ${format.description}`;
    if (format.type === 'float' || format.type === 'integer') {
      instruction += ` (${format.min}-${format.max} range)`;
      if (col.includes('usd') || col.includes('cost') || col.includes('meal') || col.includes('rent')) {
        instruction += ' in USD';
      }
    }
    return instruction;
  }).join('\n');
  
  return `You are a data analyst enriching retirement destination information with accurate, real-world data.
Your data must align with Numbeo's formats for future API compatibility.

LOCATION:
Town: ${town.name}
Country: ${town.country}
State/Region: ${town.state_code || town.region || 'N/A'}
Population: ${town.population || 'Unknown'}

EXISTING CONTEXT (for reference):
${Object.entries(existingData)
  .filter(([k, v]) => v != null)
  .map(([k, v]) => `${k}: ${v}`)
  .join('\n')}

Generate ACCURATE 2025 data for these fields:
${columnDescriptions}

CRITICAL REQUIREMENTS:
- Use real-world knowledge and research
- Healthcare/Safety scores: 0-10 scale (10 = best)
- Crime index: 0-100 scale (0 = safest, 100 = most dangerous)
- Government/Political ratings: 0-100 scale (100 = best)
- All costs in USD for 2025
- Internet speed in Mbps
- Air quality as standard AQI (0-50 good, 51-100 moderate)

Return ONLY a JSON object with the exact field names. Be accurate and realistic.`;
}

// Enrich a single town's data using Claude
async function enrichTownData(town, columns, progress) {
  const startTime = Date.now();
  
  // Prepare existing data for context
  const existingData = {
    cost_of_living_usd: town.cost_of_living_usd,
    healthcare_score: town.healthcare_score,
    safety_score: town.safety_score,
    population: town.population,
    climate: town.climate
  };
  
  // Generate prompt
  const prompt = generateEnrichmentPrompt(town, columns, existingData);
  
  try {
    // Call Claude Haiku
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      temperature: 0.2, // Low temperature for factual accuracy
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    // Extract JSON from response
    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }
    
    const enrichedData = JSON.parse(jsonMatch[0]);
    
    // Validate and normalize each field
    const validatedData = {};
    const auditRecords = [];
    
    for (const column of columns) {
      if (enrichedData[column] !== undefined) {
        const validation = validateEnrichedData(column, enrichedData[column]);
        if (validation.valid) {
          validatedData[column] = validation.value;
          
          // Create audit record
          const audit = await createAuditRecord(
            town.id,
            column,
            town[column],
            validation.value,
            'claude-haiku-research',
            0.00025 / columns.length // Distribute cost across columns
          );
          auditRecords.push(audit);
        } else {
          log(`Validation failed for ${column}: ${validation.error}`, 'WARN');
        }
      }
    }
    
    // Special handling for crime_rate conversion
    if (columns.includes('crime_index') && town.crime_rate && !validatedData.crime_index) {
      // Convert existing text to numeric
      const crimeText = town.crime_rate.toLowerCase();
      for (const [text, index] of Object.entries(CRIME_TEXT_TO_INDEX)) {
        if (crimeText.includes(text)) {
          validatedData.crime_index = index;
          log(`Converted crime_rate "${town.crime_rate}" to index ${index}`);
          break;
        }
      }
    }
    
    // Calculate cost (Haiku: $0.25 per million tokens)
    const estimatedTokens = 500; // ~500 tokens per request
    const costPerRequest = (estimatedTokens / 1000000) * 0.25;
    
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    return {
      success: true,
      data: validatedData,
      cost: costPerRequest,
      time: elapsedTime,
      auditRecords
    };
    
  } catch (error) {
    log(`Error enriching ${town.name}: ${error.message}`, 'ERROR');
    return {
      success: false,
      error: error.message,
      cost: 0,
      time: ((Date.now() - startTime) / 1000).toFixed(2)
    };
  }
}

// Main enrichment function for a column group
export async function enrichColumnGroup(groupName, options = {}) {
  const {
    testMode = false,
    limit = null,
    continueFromProgress = true,
    requireApproval = true
  } = options;
  
  // Get group configuration
  const group = ENRICHMENT_GROUPS[groupName];
  if (!group) {
    log(`Invalid group name: ${groupName}`, 'ERROR');
    log(`Available groups: ${Object.keys(ENRICHMENT_GROUPS).join(', ')}`);
    return;
  }
  
  log('='.repeat(60));
  log(`ENRICHMENT GROUP: ${groupName.toUpperCase()}`);
  log(`Columns: ${group.columns.join(', ')}`);
  log(`Description: ${group.description}`);
  log('='.repeat(60));
  
  // Load previous progress
  const progress = continueFromProgress ? await loadProgress(groupName) : {
    processedTowns: [],
    successCount: 0,
    errorCount: 0,
    totalCost: 0,
    auditRecords: []
  };
  
  if (progress.processedTowns.length > 0) {
    log(`Resuming from previous run: ${progress.processedTowns.length} towns already processed`);
  }
  
  // Fetch towns that need enrichment
  const { data: towns, error: fetchError } = await supabase
    .from('towns')
    .select('*')
    .order('country', { ascending: true });
  
  if (fetchError) {
    log(`Failed to fetch towns: ${fetchError.message}`, 'ERROR');
    return;
  }
  
  // Filter towns that need updates for this group
  const townsNeedingUpdates = towns.filter(town => {
    if (progress.processedTowns.includes(town.id)) return false;
    
    // Check if any column in this group needs data
    return group.columns.some(col => !town[col] || town[col] === null);
  });
  
  log(`Total towns: ${towns.length}`);
  log(`Towns needing updates: ${townsNeedingUpdates.length}`);
  log(`Already processed: ${progress.processedTowns.length}`);
  
  // Apply limit for testing
  let townsToProcess = townsNeedingUpdates;
  if (testMode) {
    townsToProcess = townsNeedingUpdates.slice(0, 5);
    log('TEST MODE: Processing only 5 towns', 'WARN');
  } else if (limit) {
    townsToProcess = townsNeedingUpdates.slice(0, limit);
    log(`Limited to ${limit} towns`);
  }
  
  // Approval step for test mode
  if (requireApproval && testMode && townsToProcess.length > 0) {
    log('\n📋 TEST ENRICHMENT PREVIEW:');
    log('Sample towns to enrich:');
    townsToProcess.slice(0, 3).forEach(t => {
      log(`  - ${t.name}, ${t.country}`);
    });
    log(`\nEstimated cost: $${(townsToProcess.length * 0.00025).toFixed(4)}`);
    log('Proceed with test enrichment? (Check results before full run)');
  }
  
  // Process each town
  log(`\nProcessing ${townsToProcess.length} towns...`);
  log('-'.repeat(60));
  
  for (let i = 0; i < townsToProcess.length; i++) {
    const town = townsToProcess[i];
    
    log(`\n[${i + 1}/${townsToProcess.length}] ${town.name}, ${town.country}`);
    
    // Check what's missing
    const missingColumns = group.columns.filter(col => !town[col]);
    if (missingColumns.length === 0) {
      log(`  ⏭️ All columns already have data, skipping`);
      progress.processedTowns.push(town.id);
      continue;
    }
    
    log(`  Missing: ${missingColumns.join(', ')}`);
    
    // Enrich data
    const result = await enrichTownData(town, group.columns, progress);
    
    if (result.success && Object.keys(result.data).length > 0) {
      // Update database
      const { error: updateError } = await supabase
        .from('towns')
        .update(result.data)
        .eq('id', town.id);
      
      if (updateError) {
        log(`  ❌ Database update failed: ${updateError.message}`, 'ERROR');
        progress.errorCount++;
      } else {
        log(`  ✅ Successfully enriched (${result.time}s, $${result.cost.toFixed(6)})`, 'SUCCESS');
        progress.successCount++;
        progress.totalCost += result.cost;
        progress.processedTowns.push(town.id);
        progress.auditRecords.push(...result.auditRecords);
        
        // Show enriched values
        Object.entries(result.data).forEach(([col, val]) => {
          log(`     ${col}: ${val}`);
        });
      }
    } else {
      log(`  ❌ Enrichment failed: ${result.error}`, 'ERROR');
      progress.errorCount++;
    }
    
    // Save progress every 10 towns
    if ((i + 1) % 10 === 0) {
      await saveProgress(groupName, progress);
    }
    
    // Rate limiting: 10 towns per minute = 6 seconds per town
    if (i < townsToProcess.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 6000));
    }
  }
  
  // Final save
  await saveProgress(groupName, progress);
  
  // Summary report
  log('\n' + '='.repeat(60));
  log('ENRICHMENT COMPLETE');
  log('='.repeat(60));
  log(`✅ Successfully enriched: ${progress.successCount} towns`, 'SUCCESS');
  log(`❌ Failed: ${progress.errorCount} towns`);
  log(`📊 Total processed: ${progress.processedTowns.length} towns`);
  log(`💰 Total cost: $${progress.totalCost.toFixed(4)}`);
  log(`📁 Progress saved to: enrichment-progress-${groupName}.json`);
  
  // Data quality report for test mode
  if (testMode && progress.auditRecords.length > 0) {
    log('\n📊 SAMPLE ENRICHED DATA:');
    const sampleAudits = progress.auditRecords.slice(0, 10);
    sampleAudits.forEach(audit => {
      log(`  ${audit.column_name}: ${audit.old_value || 'NULL'} → ${audit.new_value}`);
    });
  }
  
  return progress;
}

// Command line interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
UNIFIED DATA ENRICHMENT FRAMEWORK
==================================

Usage: node unified-enrichment.js <group> [options]

Groups:
  cost_data         Cost of living, meals, groceries (Priority 1)
  healthcare_data   Healthcare costs and quality (Priority 2)
  infrastructure    Internet, air quality, environment (Priority 3)
  geographic_data   Airports, coordinates (Priority 4)
  administrative    Crime index, visas, taxes (Priority 5)

Options:
  --test            Test mode (5 towns only)
  --limit <n>       Limit to n towns
  --restart         Start fresh, ignore previous progress
  --no-approval     Skip approval prompt in test mode

Examples:
  node unified-enrichment.js cost_data --test
  node unified-enrichment.js healthcare_data --limit 50
  node unified-enrichment.js administrative --restart

Numbeo Alignment:
  - Healthcare/Safety: 0-10 scale ✓
  - Crime Index: 0-100 scale (converting from text)
  - Government/Political: 0-100 scale ✓
  - Costs: Actual USD amounts ✓
  - Air Quality: Standard AQI scale ✓
`);
    process.exit(0);
  }
  
  const groupName = args[0];
  const options = {
    testMode: args.includes('--test'),
    limit: args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : null,
    continueFromProgress: !args.includes('--restart'),
    requireApproval: !args.includes('--no-approval')
  };
  
  enrichColumnGroup(groupName, options).catch(console.error);
}