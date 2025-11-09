// ONE-TIME BATCH GENERATION: Create all missing templates
// Run ONCE to populate all 166 missing field templates
// After generation, templates remain STATIC for comparability

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// All town table fields that need templates
const FIELDS_NEEDING_TEMPLATES = [
  'description',
  'town_name',
  'climate',
  'cost_of_living_usd',
  'population',
  'healthcare_score',
  'safety_score',
  'climate_description',
  'geographic_features',
  'avg_temp_summer',
  'annual_rainfall',
  'image_url_1',
  'image_url_2',
  'image_url_3',
  'overall_score',
  'infrastructure_score',
  'culture_score',
  'activities_score',
  'walkability',
  'language',
  'expat_friendly',
  'retirement_community_presence',
  'healthcare_quality',
  'hospital_count',
  'english_proficiency',
  'internet_speed_mbps',
  'public_transport_score'
  // Add all 166 fields here
];

async function generateTemplateWithAI(fieldName) {
  const humanName = fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const prompt = `Generate a search template for the database field "${fieldName}" (${humanName}).

This template will be used to guide AI research for finding accurate data about retirement towns.

Return ONLY valid JSON with this structure:
{
  "search_template": "Question to ask about {town_name}, {subdivision}, {country}",
  "expected_format": "Brief description of expected data format",
  "human_description": "Clear description for admins about what this field captures"
}

Examples:
- For "population": {"search_template": "What is the population of {town_name}, {subdivision}, {country}?", "expected_format": "number", "human_description": "Total population count"}
- For "climate": {"search_template": "What is the climate type in {town_name}, {subdivision}, {country}?", "expected_format": "mediterranean|tropical|temperate|etc", "human_description": "Climate classification"}

Make it specific and actionable. Use placeholders: {town_name}, {subdivision}, {country}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  const result = await response.json();

  // Extract JSON from response
  const text = result.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in AI response');
  }

  return JSON.parse(jsonMatch[0]);
}

async function batchGenerateTemplates() {
  console.log('\n🤖 BATCH TEMPLATE GENERATION\n');
  console.log(`Generating templates for ${FIELDS_NEEDING_TEMPLATES.length} fields...\n`);

  // Check which templates already exist
  const { data: existing } = await supabase
    .from('field_search_templates')
    .select('field_name')
    .in('field_name', FIELDS_NEEDING_TEMPLATES);

  const existingFields = new Set(existing?.map(t => t.field_name) || []);
  const fieldsToGenerate = FIELDS_NEEDING_TEMPLATES.filter(f => !existingFields.has(f));

  console.log(`✅ ${existingFields.size} templates already exist`);
  console.log(`🔄 ${fieldsToGenerate.length} templates to generate\n`);

  if (fieldsToGenerate.length === 0) {
    console.log('✅ All templates already exist!');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < fieldsToGenerate.length; i++) {
    const fieldName = fieldsToGenerate[i];

    try {
      console.log(`[${i + 1}/${fieldsToGenerate.length}] Generating: ${fieldName}...`);

      const template = await generateTemplateWithAI(fieldName);

      // Save to database
      const { error } = await supabase
        .from('field_search_templates')
        .insert({
          field_name: fieldName,
          search_template: template.search_template,
          expected_format: template.expected_format,
          human_description: template.human_description,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      successCount++;
      console.log(`   ✅ Success`);

      // Rate limit: wait 1 second between requests
      if (i < fieldsToGenerate.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      errorCount++;
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log(`\n📊 RESULTS:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total templates: ${existingFields.size + successCount}`);
  console.log(`\n✅ Batch generation complete!\n`);
}

batchGenerateTemplates();
