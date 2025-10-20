import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const issues = [];

function addIssue(severity, column, issueType, description, examples = []) {
  issues.push({
    severity,
    column,
    issueType,
    description,
    examples: examples.slice(0, 5) // Limit to 5 examples
  });
}

// Get basic statistics for numeric columns
async function analyzeNumericColumn(columnName) {
  const { data, error } = await supabase
    .from('towns')
    .select(`id, name, ${columnName}`)
    .not(columnName, 'is', null);

  if (error || !data || data.length === 0) return;

  const values = data.map(row => parseFloat(row[columnName])).filter(v => !isNaN(v));
  if (values.length === 0) return;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Check for outliers (>3 standard deviations from mean)
  const outliers = data.filter(row => {
    const val = parseFloat(row[columnName]);
    return !isNaN(val) && Math.abs(val - mean) > 3 * stdDev;
  });

  if (outliers.length > 0) {
    const meanStr = mean.toFixed(2);
    const stdDevStr = stdDev.toFixed(2);
    addIssue('WARNING', columnName, 'OUTLIER',
      `${outliers.length} outlier(s) detected (>3σ from mean=${meanStr}, σ=${stdDevStr})`,
      outliers.map(o => `${o.name}: ${o[columnName]}`)
    );
  }

  // Check for unrealistic values based on column type
  if (columnName.includes('percentage') || columnName.includes('pct') || columnName.includes('percent')) {
    const invalid = data.filter(row => {
      const val = parseFloat(row[columnName]);
      return !isNaN(val) && (val < 0 || val > 100);
    });
    if (invalid.length > 0) {
      addIssue('ERROR', columnName, 'INVALID_RANGE',
        `${invalid.length} percentage value(s) outside 0-100 range`,
        invalid.map(o => `${o.name}: ${o[columnName]}`)
      );
    }
  }

  // Check for negative values in cost/distance columns
  if (columnName.includes('cost') || columnName.includes('rent') || columnName.includes('price') ||
      columnName.includes('distance') || columnName.includes('population')) {
    const negative = data.filter(row => {
      const val = parseFloat(row[columnName]);
      return !isNaN(val) && val < 0;
    });
    if (negative.length > 0) {
      addIssue('ERROR', columnName, 'NEGATIVE_VALUE',
        `${negative.length} negative value(s) found`,
        negative.map(o => `${o.name}: ${o[columnName]}`)
      );
    }
  }

  // Check for suspiciously low/high costs
  if (columnName.includes('rent') || columnName.includes('cost_of_living')) {
    const tooLow = data.filter(row => {
      const val = parseFloat(row[columnName]);
      return !isNaN(val) && val < 50;
    });
    const tooHigh = data.filter(row => {
      const val = parseFloat(row[columnName]);
      return !isNaN(val) && val > 10000;
    });
    if (tooLow.length > 0) {
      addIssue('WARNING', columnName, 'SUSPICIOUSLY_LOW',
        `${tooLow.length} value(s) < $50`,
        tooLow.map(o => `${o.name}: ${o[columnName]}`)
      );
    }
    if (tooHigh.length > 0) {
      addIssue('WARNING', columnName, 'SUSPICIOUSLY_HIGH',
        `${tooHigh.length} value(s) > $10,000`,
        tooHigh.map(o => `${o.name}: ${o[columnName]}`)
      );
    }
  }

  return { mean, stdDev, min, max, count: values.length };
}

// Analyze text/categorical columns
async function analyzeCategoricalColumn(columnName) {
  const { data, error } = await supabase
    .from('towns')
    .select(`id, name, ${columnName}`)
    .not(columnName, 'is', null);

  if (error || !data || data.length === 0) return;

  const valueCounts = {};
  const caseIssues = [];
  const formatIssues = [];

  data.forEach(row => {
    const val = row[columnName];
    if (typeof val === 'string') {
      // Track unique values
      const normalized = val.toLowerCase().trim();
      valueCounts[normalized] = (valueCounts[normalized] || 0) + 1;

      // Check for case inconsistencies
      if (val !== val.toLowerCase() && val !== val.toUpperCase()) {
        const hasMultipleCases = data.some(r =>
          r[columnName] &&
          r[columnName].toLowerCase() === normalized &&
          r[columnName] !== val
        );
        if (hasMultipleCases) {
          caseIssues.push(`${row.name}: "${val}"`);
        }
      }

      // Check for extra spaces
      if (val !== val.trim() || val.includes('  ')) {
        formatIssues.push(`${row.name}: "${val}" (spacing issue)`);
      }

      // Check for mixed delimiters in list fields
      if (val.includes(',') && val.includes(';')) {
        formatIssues.push(`${row.name}: mixed delimiters`);
      }
    }
  });

  if (caseIssues.length > 0) {
    addIssue('INFO', columnName, 'CASE_INCONSISTENCY',
      `${caseIssues.length} potential case mismatch(es)`,
      [...new Set(caseIssues)]
    );
  }

  if (formatIssues.length > 0) {
    addIssue('WARNING', columnName, 'FORMAT_ISSUE',
      `${formatIssues.length} formatting issue(s)`,
      [...new Set(formatIssues)]
    );
  }

  return { uniqueValues: Object.keys(valueCounts).length, valueCounts };
}

// Check for data type mismatches
async function checkDataTypeMismatch(columnName, expectedType) {
  const { data, error } = await supabase
    .from('towns')
    .select(`id, name, ${columnName}`)
    .not(columnName, 'is', null);

  if (error || !data || data.length === 0) return;

  const mismatches = [];

  data.forEach(row => {
    const val = row[columnName];

    if (expectedType === 'numeric') {
      if (typeof val === 'string' && isNaN(parseFloat(val))) {
        mismatches.push(`${row.name}: "${val}" (expected number)`);
      }
    } else if (expectedType === 'boolean') {
      if (typeof val !== 'boolean' && !['true', 'false', 't', 'f', 'yes', 'no', '1', '0'].includes(String(val).toLowerCase())) {
        mismatches.push(`${row.name}: "${val}" (expected boolean)`);
      }
    }
  });

  if (mismatches.length > 0) {
    addIssue('ERROR', columnName, 'TYPE_MISMATCH',
      `${mismatches.length} type mismatch(es)`,
      mismatches
    );
  }
}

// Main audit function
async function runAudit() {
  console.log('🔍 Starting comprehensive data quality audit...\n');

  // Get all columns from the table
  const { data: sampleRow } = await supabase
    .from('towns')
    .select('*')
    .limit(1)
    .single();

  if (!sampleRow) {
    console.error('Could not fetch sample row');
    return;
  }

  const columns = Object.keys(sampleRow);
  console.log(`Found ${columns.length} columns to audit\n`);

  // Define column categories
  const numericColumns = columns.filter(col =>
    ['cost', 'rent', 'price', 'score', 'population', 'distance', 'elevation',
     'temperature', 'humidity', 'precipitation', 'sunshine', 'quality', 'safety',
     'healthcare', 'walkability', 'internet', 'expat', 'english', 'overall'].some(keyword =>
      col.includes(keyword) && !col.includes('_actual') && col !== 'id'
    )
  );

  const categoricalColumns = columns.filter(col =>
    col.includes('_actual') || col.includes('type') || col.includes('category') ||
    col.includes('level') || col.includes('presence') || col.includes('frequency') ||
    col.includes('atmosphere') || col.includes('lean') || col.includes('size')
  );

  const booleanColumns = columns.filter(col =>
    col.startsWith('has_') || col.startsWith('is_') || col.startsWith('allows_')
  );

  console.log(`📊 Analyzing ${numericColumns.length} numeric columns...`);
  for (const col of numericColumns) {
    await analyzeNumericColumn(col);
  }

  console.log(`📝 Analyzing ${categoricalColumns.length} categorical columns...`);
  for (const col of categoricalColumns) {
    await analyzeCategoricalColumn(col);
  }

  console.log(`✓ Analyzing ${booleanColumns.length} boolean columns...`);
  for (const col of booleanColumns) {
    await checkDataTypeMismatch(col, 'boolean');
  }

  // Generate report
  console.log('\n' + '='.repeat(80));
  console.log('📋 DATA QUALITY AUDIT REPORT');
  console.log('='.repeat(80) + '\n');

  const errorIssues = issues.filter(i => i.severity === 'ERROR');
  const warningIssues = issues.filter(i => i.severity === 'WARNING');
  const infoIssues = issues.filter(i => i.severity === 'INFO');

  console.log(`🔴 ERRORS: ${errorIssues.length}`);
  console.log(`🟡 WARNINGS: ${warningIssues.length}`);
  console.log(`🔵 INFO: ${infoIssues.length}\n`);

  // Group by severity
  ['ERROR', 'WARNING', 'INFO'].forEach(severity => {
    const filtered = issues.filter(i => i.severity === severity);
    if (filtered.length === 0) return;

    console.log(`\n${'='.repeat(80)}`);
    console.log(`${severity === 'ERROR' ? '🔴' : severity === 'WARNING' ? '🟡' : '🔵'} ${severity} (${filtered.length})`);
    console.log('='.repeat(80));

    filtered.forEach(issue => {
      console.log(`\n📍 Column: ${issue.column}`);
      console.log(`   Type: ${issue.issueType}`);
      console.log(`   ${issue.description}`);
      if (issue.examples.length > 0) {
        console.log(`   Examples:`);
        issue.examples.forEach(ex => console.log(`   - ${ex}`));
      }
    });
  });

  console.log('\n' + '='.repeat(80));
  console.log('✅ AUDIT COMPLETE');
  console.log('='.repeat(80));
}

runAudit().catch(console.error);
