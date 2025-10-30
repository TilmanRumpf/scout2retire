#!/usr/bin/env node

// COMPREHENSIVE TOWNS TABLE COLUMN ANALYSIS
// Analyzes all 170+ columns with data types, ranges, and samples

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function analyzeAllColumns() {
  console.log('🔍 COMPREHENSIVE TOWNS TABLE ANALYSIS');
  console.log('='.repeat(100));
  console.log('');

  // Step 1: Get all column metadata
  console.log('📊 Step 1: Fetching column metadata...');
  const { data: columns, error: colError } = await supabase
    .from('towns')
    .select('*')
    .limit(1);

  if (colError) {
    console.error('❌ Error fetching columns:', colError);
    return;
  }

  const columnNames = Object.keys(columns[0]);
  console.log(`✅ Found ${columnNames.length} columns\n`);

  // Step 2: Get total town count
  const { count, error: countError } = await supabase
    .from('towns')
    .select('id', { count: 'exact', head: true });

  const totalTowns = count || 0;
  console.log(`📍 Total towns: ${totalTowns}\n`);

  // Step 3: Analyze each column
  const analysis = {
    boolean_fields: [],
    numeric_fields: [],
    text_fields: [],
    timestamp_fields: [],
    json_fields: [],
    unknown_fields: []
  };

  console.log('🔬 Analyzing each column...\n');

  for (const colName of columnNames.sort()) {
    // Get sample of non-null values
    const { data: samples, error: sampleError } = await supabase
      .from('towns')
      .select(colName)
      .not(colName, 'is', null)
      .limit(10);

    if (sampleError) {
      console.log(`⚠️  ${colName}: Error - ${sampleError.message}`);
      continue;
    }

    // Get null count
    const { data: nullData, error: nullError } = await supabase
      .from('towns')
      .select(colName)
      .is(colName, null);

    const nullCount = nullData ? nullData.length : 0;
    const populatedCount = totalTowns - nullCount;
    const populatedPercent = ((populatedCount / totalTowns) * 100).toFixed(1);

    // Determine data type from samples
    let dataType = 'unknown';
    let minValue = null;
    let maxValue = null;
    let uniqueValues = new Set();
    let sampleValues = [];

    if (samples && samples.length > 0) {
      const firstValue = samples[0][colName];

      if (typeof firstValue === 'boolean') {
        dataType = 'boolean';
        samples.forEach(s => uniqueValues.add(s[colName]));
      } else if (typeof firstValue === 'number') {
        dataType = Number.isInteger(firstValue) ? 'integer' : 'numeric';
        const values = samples.map(s => s[colName]).filter(v => v !== null);
        minValue = Math.min(...values);
        maxValue = Math.max(...values);
      } else if (typeof firstValue === 'string') {
        if (firstValue.match(/^\d{4}-\d{2}-\d{2}/)) {
          dataType = 'timestamp';
        } else {
          dataType = 'text';
          sampleValues = samples.slice(0, 3).map(s => s[colName]);
        }
      } else if (typeof firstValue === 'object') {
        dataType = 'json';
      }
    }

    // Categorize
    const field = {
      name: colName,
      type: dataType,
      populated: populatedCount,
      populated_percent: populatedPercent,
      null_count: nullCount,
      min: minValue,
      max: maxValue,
      unique_values: Array.from(uniqueValues),
      samples: sampleValues
    };

    if (dataType === 'boolean') {
      analysis.boolean_fields.push(field);
    } else if (dataType === 'integer' || dataType === 'numeric') {
      analysis.numeric_fields.push(field);
    } else if (dataType === 'text') {
      analysis.text_fields.push(field);
    } else if (dataType === 'timestamp') {
      analysis.timestamp_fields.push(field);
    } else if (dataType === 'json') {
      analysis.json_fields.push(field);
    } else {
      analysis.unknown_fields.push(field);
    }

    // Progress indicator
    const progress = Math.round((columnNames.indexOf(colName) / columnNames.length) * 100);
    process.stdout.write(`\r   Progress: ${progress}% (${colName.slice(0, 40).padEnd(40)})`);
  }

  console.log('\n\n');
  console.log('='.repeat(100));
  console.log('📈 ANALYSIS RESULTS');
  console.log('='.repeat(100));
  console.log('');

  // Print Boolean Fields
  console.log('🔘 BOOLEAN FIELDS (' + analysis.boolean_fields.length + ')');
  console.log('-'.repeat(100));
  analysis.boolean_fields.forEach(f => {
    console.log(`  ${f.name.padEnd(50)} | ${f.populated_percent}% populated | Values: ${f.unique_values.join(', ')}`);
  });
  console.log('');

  // Print Numeric Fields
  console.log('🔢 NUMERIC FIELDS (' + analysis.numeric_fields.length + ')');
  console.log('-'.repeat(100));
  analysis.numeric_fields.forEach(f => {
    const range = f.min !== null ? `Range: ${f.min} - ${f.max}` : 'No data';
    console.log(`  ${f.name.padEnd(50)} | ${f.populated_percent}% populated | ${range}`);
  });
  console.log('');

  // Print Text Fields (sample)
  console.log('📝 TEXT FIELDS (' + analysis.text_fields.length + ')');
  console.log('-'.repeat(100));
  analysis.text_fields.slice(0, 30).forEach(f => {
    const sample = f.samples.length > 0 ? f.samples[0].slice(0, 40) : 'No data';
    console.log(`  ${f.name.padEnd(50)} | ${f.populated_percent}% populated | "${sample}..."`);
  });
  if (analysis.text_fields.length > 30) {
    console.log(`  ... and ${analysis.text_fields.length - 30} more text fields`);
  }
  console.log('');

  // Print Timestamp Fields
  console.log('🕐 TIMESTAMP FIELDS (' + analysis.timestamp_fields.length + ')');
  console.log('-'.repeat(100));
  analysis.timestamp_fields.forEach(f => {
    console.log(`  ${f.name.padEnd(50)} | ${f.populated_percent}% populated`);
  });
  console.log('');

  // Print JSON Fields
  console.log('📦 JSON FIELDS (' + analysis.json_fields.length + ')');
  console.log('-'.repeat(100));
  analysis.json_fields.forEach(f => {
    console.log(`  ${f.name.padEnd(50)} | ${f.populated_percent}% populated`);
  });
  console.log('');

  // Save detailed JSON output
  const fs = await import('fs');
  const outputPath = '/Users/tilmanrumpf/Desktop/scout2retire/database-utilities/column-analysis-output.json';
  fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
  console.log(`💾 Detailed analysis saved to: ${outputPath}\n`);

  // Summary stats
  console.log('='.repeat(100));
  console.log('📊 SUMMARY');
  console.log('='.repeat(100));
  console.log(`Total columns: ${columnNames.length}`);
  console.log(`  - Boolean: ${analysis.boolean_fields.length}`);
  console.log(`  - Numeric: ${analysis.numeric_fields.length}`);
  console.log(`  - Text: ${analysis.text_fields.length}`);
  console.log(`  - Timestamp: ${analysis.timestamp_fields.length}`);
  console.log(`  - JSON: ${analysis.json_fields.length}`);
  console.log(`  - Unknown: ${analysis.unknown_fields.length}`);
  console.log('');

  // Find well-populated fields (>90%)
  const wellPopulated = [
    ...analysis.boolean_fields,
    ...analysis.numeric_fields,
    ...analysis.text_fields
  ].filter(f => parseFloat(f.populated_percent) > 90);

  console.log(`✅ Well-populated fields (>90%): ${wellPopulated.length}`);
  console.log('');

  // Find sparse fields (<10%)
  const sparse = [
    ...analysis.boolean_fields,
    ...analysis.numeric_fields,
    ...analysis.text_fields
  ].filter(f => parseFloat(f.populated_percent) < 10);

  console.log(`⚠️  Sparse fields (<10%): ${sparse.length}`);
  if (sparse.length > 0) {
    sparse.slice(0, 10).forEach(f => {
      console.log(`     ${f.name} (${f.populated_percent}%)`);
    });
    if (sparse.length > 10) {
      console.log(`     ... and ${sparse.length - 10} more`);
    }
  }
  console.log('');
}

analyzeAllColumns().catch(console.error);
