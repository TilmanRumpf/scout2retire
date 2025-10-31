/**
 * FIELD TEMPLATE NEEDS ANALYSIS
 *
 * Analyzes all 103 editable fields to determine:
 * 1. Which need custom templates (complex/categorical)
 * 2. Which can use auto-generation (simple/boolean/count)
 * 3. Which don't need templates at all (ID/computed/uploaded)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read all admin panel files
const adminPanelFiles = [
  '../src/components/admin/ActivitiesPanel.jsx',
  '../src/components/admin/ClimatePanel.jsx',
  '../src/components/admin/CostsPanel.jsx',
  '../src/components/admin/CulturePanel.jsx',
  '../src/components/admin/HealthcarePanel.jsx',
  '../src/components/admin/InfrastructurePanel.jsx',
  '../src/components/admin/OverviewPanel.jsx',
  '../src/components/admin/RegionPanel.jsx',
  '../src/components/admin/SafetyPanel.jsx'
];

// Parse fields from admin panels
function parseFieldsFromFile(filePath) {
  const content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
  const fields = [];

  // Match EditableField components
  const fieldPattern = /<EditableField\s+([\s\S]*?)\/>/g;
  let match;

  while ((match = fieldPattern.exec(content)) !== null) {
    const fieldBlock = match[1];

    // Extract attributes
    const fieldName = fieldBlock.match(/field="([^"]+)"/)?.[1];
    const label = fieldBlock.match(/label="([^"]+)"/)?.[1];
    const type = fieldBlock.match(/type="([^"]+)"/)?.[1] || 'string';
    const range = fieldBlock.match(/range="([^"]+)"/)?.[1] || fieldBlock.match(/range=\{(\[.*?\])\}/)?.[1];
    const descMatch = fieldBlock.match(/description(?:=\{`|=")([\s\S]*?)(?:`\}|")/);
    const description = descMatch?.[1]?.replace(/\n/g, ' ').trim();

    if (fieldName) {
      fields.push({
        field: fieldName,
        label: label || fieldName,
        type,
        range,
        description: description || '',
        file: path.basename(filePath)
      });
    }
  }

  return fields;
}

// Categorize field based on characteristics
function categorizeField(field) {
  const { field: name, type, description, range } = field;

  // NO TEMPLATE NEEDED - Skip these
  if (name === 'id' || name === 'latitude' || name === 'longitude') {
    return { category: 'NO_TEMPLATE', reason: 'Auto-generated or geocoded' };
  }

  if (name.includes('image_url') || name.includes('photo')) {
    return { category: 'NO_TEMPLATE', reason: 'Uploaded file' };
  }

  if (name.includes('description') || name.includes('summary') || name.includes('Statement') || name === 'verbose_description') {
    return { category: 'NO_TEMPLATE', reason: 'Human-written narrative text' };
  }

  if (name.endsWith('_score') && !name.includes('rating')) {
    return { category: 'NO_TEMPLATE', reason: 'Computed/calculated score' };
  }

  // AUTO-GENERATION WORKS - Simple queries
  if (type === 'boolean') {
    return { category: 'AUTO_GENERATION', reason: 'Boolean field - simple yes/no query works' };
  }

  if (name.includes('_count') || name.includes('_distance') || name.includes('_km')) {
    return { category: 'AUTO_GENERATION', reason: 'Numeric count/distance - simple "how many" or "how far" query works' };
  }

  if (type === 'number' && range && range.includes('-')) {
    const desc = description.toLowerCase();
    if (desc.includes('rating') || desc.includes('score') || desc.includes('index')) {
      return { category: 'AUTO_GENERATION', reason: 'Numeric rating/score with range - auto-gen adds range to query' };
    }
  }

  if (name === 'population' || name === 'elevation_meters') {
    return { category: 'AUTO_GENERATION', reason: 'Simple factual number' };
  }

  // CUSTOM TEMPLATE NEEDED - Complex/categorical
  if (name.includes('_actual') || name.includes('_level')) {
    return { category: 'CUSTOM_TEMPLATE', reason: 'Categorical field with specific valid values - needs Expected format' };
  }

  if (description.includes('categorical') || description.includes('one of:')) {
    return { category: 'CUSTOM_TEMPLATE', reason: 'Explicitly categorical field' };
  }

  if (type === 'select' && range) {
    return { category: 'CUSTOM_TEMPLATE', reason: 'Select dropdown with specific options - needs Expected format' };
  }

  if (name.includes('visa') || name.includes('tax') || name.includes('_path_info')) {
    return { category: 'CUSTOM_TEMPLATE', reason: 'Complex legal/administrative info - needs specific query format' };
  }

  if (name.includes('specialties') || name.includes('features') || name.includes('activities_available')) {
    return { category: 'CUSTOM_TEMPLATE', reason: 'List/array field - needs specific format guidance' };
  }

  // DEFAULT: CUSTOM TEMPLATE if unclear
  if (type === 'string' && !name.includes('_cost') && !name.includes('_rate')) {
    return { category: 'CUSTOM_TEMPLATE', reason: 'Text field - may need specific Expected format' };
  }

  return { category: 'AUTO_GENERATION', reason: 'Simple field type - auto-generation should work' };
}

// Main analysis
console.log('📊 FIELD TEMPLATE NEEDS ANALYSIS\n');
console.log('Analyzing all editable fields across admin panels...\n');

const allFields = [];
adminPanelFiles.forEach(file => {
  const fields = parseFieldsFromFile(file);
  allFields.push(...fields);
});

console.log(`Total fields found: ${allFields.length}\n`);

// Categorize all fields
const categorized = {
  NO_TEMPLATE: [],
  AUTO_GENERATION: [],
  CUSTOM_TEMPLATE: []
};

allFields.forEach(field => {
  const result = categorizeField(field);
  categorized[result.category].push({ ...field, reason: result.reason });
});

// Print summary
console.log('═══════════════════════════════════════════════════════════════');
console.log('SUMMARY');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`NO TEMPLATE NEEDED:       ${categorized.NO_TEMPLATE.length} fields`);
console.log(`AUTO-GENERATION WORKS:    ${categorized.AUTO_GENERATION.length} fields`);
console.log(`CUSTOM TEMPLATE NEEDED:   ${categorized.CUSTOM_TEMPLATE.length} fields`);
console.log(`\nTOTAL:                    ${allFields.length} fields\n`);

// Detailed breakdown
console.log('═══════════════════════════════════════════════════════════════');
console.log('CATEGORY 1: NO TEMPLATE NEEDED (' + categorized.NO_TEMPLATE.length + ' fields)');
console.log('═══════════════════════════════════════════════════════════════\n');

categorized.NO_TEMPLATE.forEach(f => {
  console.log(`  ${f.field}`);
  console.log(`    Label: ${f.label}`);
  console.log(`    Type: ${f.type}`);
  console.log(`    Reason: ${f.reason}`);
  console.log(`    File: ${f.file}\n`);
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('CATEGORY 2: AUTO-GENERATION WORKS (' + categorized.AUTO_GENERATION.length + ' fields)');
console.log('═══════════════════════════════════════════════════════════════\n');

categorized.AUTO_GENERATION.forEach(f => {
  console.log(`  ${f.field}`);
  console.log(`    Label: ${f.label}`);
  console.log(`    Type: ${f.type}${f.range ? ` (${f.range})` : ''}`);
  console.log(`    Reason: ${f.reason}`);
  console.log(`    File: ${f.file}\n`);
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('CATEGORY 3: CUSTOM TEMPLATE NEEDED (' + categorized.CUSTOM_TEMPLATE.length + ' fields)');
console.log('═══════════════════════════════════════════════════════════════\n');

categorized.CUSTOM_TEMPLATE.forEach(f => {
  console.log(`  ${f.field}`);
  console.log(`    Label: ${f.label}`);
  console.log(`    Type: ${f.type}${f.range ? ` (${f.range})` : ''}`);
  console.log(`    Reason: ${f.reason}`);
  console.log(`    Description: ${f.description.substring(0, 100)}${f.description.length > 100 ? '...' : ''}`);
  console.log(`    File: ${f.file}\n`);
});

// Save to JSON for next step
const outputPath = path.join(__dirname, 'field-template-analysis.json');
fs.writeFileSync(outputPath, JSON.stringify({
  summary: {
    total: allFields.length,
    no_template: categorized.NO_TEMPLATE.length,
    auto_generation: categorized.AUTO_GENERATION.length,
    custom_template: categorized.CUSTOM_TEMPLATE.length
  },
  fields: categorized
}, null, 2));

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('RECOMMENDATIONS');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`1. Skip ${categorized.NO_TEMPLATE.length} fields (no template needed)`);
console.log(`2. Trust auto-generation for ${categorized.AUTO_GENERATION.length} fields`);
console.log(`3. Create custom templates for ${categorized.CUSTOM_TEMPLATE.length} fields\n`);

console.log(`Total templates to create: ${categorized.CUSTOM_TEMPLATE.length}\n`);
console.log(`Analysis saved to: ${outputPath}\n`);
