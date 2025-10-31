/**
 * STEP 2: DETERMINE TEMPLATE REQUIREMENTS
 *
 * Takes the 24 "custom template needed" fields and determines:
 * 1. Which ones MUST have custom templates (categorical with specific values)
 * 2. Which ones can use auto-generation (simple text fields)
 * 3. Generates the exact Expected format for categorical fields
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { VALID_CATEGORICAL_VALUES } from '../src/utils/validation/categoricalValues.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the analysis from step 1
const analysisPath = path.join(__dirname, 'field-template-analysis.json');
const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));

const customTemplateFields = analysis.fields.CUSTOM_TEMPLATE;

console.log('🔍 STEP 2: DETERMINING TEMPLATE REQUIREMENTS\n');
console.log(`Analyzing ${customTemplateFields.length} fields marked as "custom template needed"...\n`);

const results = {
  MUST_HAVE_TEMPLATE: [],      // Categorical fields - need Expected format
  CAN_USE_AUTO_GEN: [],        // Simple text fields - auto-gen is fine
  SKIP_ENTIRELY: []            // Don't need research (ID fields, etc.)
};

customTemplateFields.forEach(field => {
  const fieldName = field.field;

  // Check if this field has defined categorical values
  const validValues = VALID_CATEGORICAL_VALUES[fieldName];

  if (validValues) {
    // HAS CATEGORICAL VALUES - MUST have custom template
    results.MUST_HAVE_TEMPLATE.push({
      ...field,
      validValues,
      expectedFormat: validValues.map(v => v.replace(/_/g, ' ')).join(' | '),
      priority: 'HIGH',
      reasoning: `Categorical field with ${validValues.length} valid values - needs Expected format to guide Google searches`
    });
  } else if (fieldName === 'country' || fieldName === 'region') {
    // Administrative fields - skip (already known from town selection)
    results.SKIP_ENTIRELY.push({
      ...field,
      reasoning: 'Administrative field - already known from town selection, no Google search needed'
    });
  } else if (field.type === 'array' && (fieldName.includes('geographic_features') || fieldName.includes('vegetation_type'))) {
    // Geographic arrays - likely need custom template
    results.MUST_HAVE_TEMPLATE.push({
      ...field,
      expectedFormat: 'Comma-separated list (e.g., coastal, mountainous, forested)',
      priority: 'MEDIUM',
      reasoning: 'Array field with multiple possible values - needs Expected format for consistency'
    });
  } else if (fieldName.includes('_tax_rate') || fieldName.includes('tax_haven')) {
    // Tax fields - complex, need custom templates
    results.MUST_HAVE_TEMPLATE.push({
      ...field,
      expectedFormat: fieldName.includes('status') ? 'Yes or No' : 'Percentage (e.g., 15%, 22%, 0%)',
      priority: 'HIGH',
      reasoning: 'Tax/legal field - complex queries need specific Expected format'
    });
  } else if (fieldName.includes('landmark')) {
    // Cultural landmarks - simple text
    results.CAN_USE_AUTO_GEN.push({
      ...field,
      reasoning: 'Simple text field - "what is the most famous cultural landmark in X" works fine'
    });
  } else if (fieldName === 'primary_language') {
    // Language - simple factual
    results.CAN_USE_AUTO_GEN.push({
      ...field,
      reasoning: 'Simple factual query - "what is the primary language spoken in X" works fine'
    });
  } else if (fieldName.includes('specialties')) {
    // Medical specialties - need custom template for format
    results.MUST_HAVE_TEMPLATE.push({
      ...field,
      expectedFormat: 'Comma-separated list (e.g., Cardiology, Neurology, Orthopedics)',
      priority: 'MEDIUM',
      reasoning: 'List field - needs Expected format for consistency'
    });
  } else if (fieldName === 'water_bodies' || fieldName === 'activities_available') {
    // List fields - need custom template
    results.MUST_HAVE_TEMPLATE.push({
      ...field,
      expectedFormat: 'Comma-separated list',
      priority: 'LOW',
      reasoning: 'List field - benefits from Expected format but auto-gen might work'
    });
  } else {
    // Unknown - default to can use auto-gen
    results.CAN_USE_AUTO_GEN.push({
      ...field,
      reasoning: 'Unclear if custom template needed - auto-generation should work'
    });
  }
});

// Print results
console.log('═══════════════════════════════════════════════════════════════');
console.log('FINAL SUMMARY');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`MUST HAVE CUSTOM TEMPLATE:  ${results.MUST_HAVE_TEMPLATE.length} fields`);
console.log(`CAN USE AUTO-GENERATION:    ${results.CAN_USE_AUTO_GEN.length} fields`);
console.log(`SKIP ENTIRELY:              ${results.SKIP_ENTIRELY.length} fields`);
console.log(`\nTOTAL TEMPLATES TO CREATE:  ${results.MUST_HAVE_TEMPLATE.length}\n`);

console.log('═══════════════════════════════════════════════════════════════');
console.log(`CATEGORY 1: MUST HAVE CUSTOM TEMPLATE (${results.MUST_HAVE_TEMPLATE.length} fields)`);
console.log('═══════════════════════════════════════════════════════════════\n');

// Sort by priority
const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
results.MUST_HAVE_TEMPLATE.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

results.MUST_HAVE_TEMPLATE.forEach((f, idx) => {
  console.log(`${idx + 1}. ${f.field} [${f.priority} PRIORITY]`);
  console.log(`   Label: ${f.label}`);
  console.log(`   Type: ${f.type}`);
  console.log(`   Expected: ${f.expectedFormat}`);
  console.log(`   Reason: ${f.reasoning}`);
  console.log(`   File: ${f.file}\n`);
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`CATEGORY 2: CAN USE AUTO-GENERATION (${results.CAN_USE_AUTO_GEN.length} fields)`);
console.log('═══════════════════════════════════════════════════════════════\n');

results.CAN_USE_AUTO_GEN.forEach((f, idx) => {
  console.log(`${idx + 1}. ${f.field}`);
  console.log(`   Label: ${f.label}`);
  console.log(`   Reason: ${f.reasoning}\n`);
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`CATEGORY 3: SKIP ENTIRELY (${results.SKIP_ENTIRELY.length} fields)`);
console.log('═══════════════════════════════════════════════════════════════\n');

results.SKIP_ENTIRELY.forEach((f, idx) => {
  console.log(`${idx + 1}. ${f.field}`);
  console.log(`   Reason: ${f.reasoning}\n`);
});

// Save results
const outputPath = path.join(__dirname, 'template-requirements-final.json');
fs.writeFileSync(outputPath, JSON.stringify({
  summary: {
    must_have_template: results.MUST_HAVE_TEMPLATE.length,
    can_use_auto_gen: results.CAN_USE_AUTO_GEN.length,
    skip_entirely: results.SKIP_ENTIRELY.length,
    total_templates_to_create: results.MUST_HAVE_TEMPLATE.length
  },
  templates_to_create: results.MUST_HAVE_TEMPLATE,
  auto_generation_ok: results.CAN_USE_AUTO_GEN,
  skip: results.SKIP_ENTIRELY
}, null, 2));

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('NEXT STEPS');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`1. Create ${results.MUST_HAVE_TEMPLATE.length} custom templates (prioritize HIGH priority fields)`);
console.log(`2. Test auto-generation for ${results.CAN_USE_AUTO_GEN.length} fields`);
console.log(`3. Skip ${results.SKIP_ENTIRELY.length} fields (no templates needed)\n`);

console.log(`Final count: ${results.MUST_HAVE_TEMPLATE.length} templates to create\n`);
console.log(`Results saved to: ${outputPath}\n`);
