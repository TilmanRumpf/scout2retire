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
    examples: examples.slice(0, 10) // Show more examples
  });
}

// Check for unrealistic zero values
async function checkUnrealisticZeros(columnName) {
  const { data, error } = await supabase
    .from('towns')
    .select(`id, name, ${columnName}`)
    .eq(columnName, 0);

  if (error || !data || data.length === 0) return;

  // Zero is unrealistic for certain fields
  if (columnName.includes('cost') || columnName.includes('rent') ||
      columnName.includes('price') || columnName.includes('population')) {
    addIssue('WARNING', columnName, 'UNREALISTIC_ZERO',
      `${data.length} town(s) with zero value (likely placeholder)`,
      data.map(o => `${o.name}: ${o[columnName]}`)
    );
  }
}

// Check for suspiciously round numbers (often placeholders)
async function checkRoundNumbers(columnName) {
  const { data, error } = await supabase
    .from('towns')
    .select(`id, name, ${columnName}`)
    .not(columnName, 'is', null);

  if (error || !data || data.length === 0) return;

  const suspiciousRounds = data.filter(row => {
    const val = parseFloat(row[columnName]);
    if (isNaN(val)) return false;

    // Check if divisible by 1000, 500, or 100 (common placeholders)
    return (val % 1000 === 0 || val % 500 === 0 || val % 100 === 0) && val > 100;
  });

  if (suspiciousRounds.length > data.length * 0.3) { // If >30% are round numbers
    addIssue('INFO', columnName, 'MANY_ROUND_NUMBERS',
      `${suspiciousRounds.length}/${data.length} values are suspiciously round (may be estimates)`,
      suspiciousRounds.slice(0, 10).map(o => `${o.name}: ${o[columnName]}`)
    );
  }
}

// Check for duplicate values (might indicate copy-paste errors)
async function checkDuplicateValues(columnName) {
  const { data, error } = await supabase
    .from('towns')
    .select(`id, name, ${columnName}`)
    .not(columnName, 'is', null);

  if (error || !data || data.length === 0) return;

  const valueCounts = {};
  data.forEach(row => {
    const val = row[columnName];
    valueCounts[val] = valueCounts[val] || [];
    valueCounts[val].push(row.name);
  });

  // Find values shared by many towns (might be copy-paste)
  const duplicates = Object.entries(valueCounts)
    .filter(([val, towns]) => towns.length > 10)
    .sort((a, b) => b[1].length - a[1].length);

  if (duplicates.length > 0 && !columnName.includes('score')) {
    duplicates.forEach(([val, towns]) => {
      addIssue('INFO', columnName, 'MANY_DUPLICATES',
        `Value "${val}" appears in ${towns.length} towns (may be placeholder)`,
        towns.slice(0, 10)
      );
    });
  }
}

// Check for missing data patterns
async function checkMissingData(columnName) {
  const { count: totalCount } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true });

  const { count: filledCount } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
    .not(columnName, 'is', null);

  const missingCount = totalCount - filledCount;
  const missingPct = (missingCount / totalCount * 100).toFixed(1);

  if (missingPct > 50) {
    addIssue('WARNING', columnName, 'HIGH_MISSING_RATE',
      `${missingPct}% missing (${missingCount}/${totalCount} towns)`,
      []
    );
  } else if (missingPct > 20) {
    addIssue('INFO', columnName, 'MODERATE_MISSING_RATE',
      `${missingPct}% missing (${missingCount}/${totalCount} towns)`,
      []
    );
  }
}

// Check for inconsistent categorical values
async function checkCategoricalConsistency(columnName, expectedValues = null) {
  const { data, error } = await supabase
    .from('towns')
    .select(`id, name, ${columnName}`)
    .not(columnName, 'is', null);

  if (error || !data || data.length === 0) return;

  const uniqueValues = [...new Set(data.map(r => r[columnName]))];

  // Report all unique values for categorical columns
  if (uniqueValues.length <= 20) {
    const valueCounts = {};
    data.forEach(row => {
      const val = row[columnName];
      valueCounts[val] = (valueCounts[val] || 0) + 1;
    });

    const sortedValues = Object.entries(valueCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([val, count]) => `${val} (${count})`);

    addIssue('INFO', columnName, 'UNIQUE_VALUES',
      `${uniqueValues.length} unique values found`,
      sortedValues
    );
  }

  // Check for likely typos (values appearing only 1-2 times)
  const valueCounts = {};
  data.forEach(row => {
    const val = String(row[columnName]).toLowerCase().trim();
    valueCounts[val] = valueCounts[val] || { original: row[columnName], towns: [] };
    valueCounts[val].towns.push(row.name);
  });

  const rareCases = Object.entries(valueCounts)
    .filter(([val, info]) => info.towns.length <= 2)
    .map(([val, info]) => `"${info.original}" (${info.towns.join(', ')})`);

  if (rareCases.length > 0 && uniqueValues.length > 5) {
    addIssue('WARNING', columnName, 'RARE_VALUES',
      `${rareCases.length} value(s) appear in ≤2 towns (possible typos)`,
      rareCases
    );
  }
}

// Check text fields for formatting issues
async function checkTextFormatting(columnName) {
  const { data, error } = await supabase
    .from('towns')
    .select(`id, name, ${columnName}`)
    .not(columnName, 'is', null);

  if (error || !data || data.length === 0) return;

  const issues = [];

  data.forEach(row => {
    const val = String(row[columnName]);

    // Check for leading/trailing whitespace
    if (val !== val.trim()) {
      issues.push(`${row.name}: Has leading/trailing whitespace`);
    }

    // Check for double spaces
    if (val.includes('  ')) {
      issues.push(`${row.name}: Contains double spaces`);
    }

    // Check for tabs or newlines
    if (val.includes('\t') || val.includes('\n')) {
      issues.push(`${row.name}: Contains tabs/newlines`);
    }

    // Check for mixed case in categorical fields
    if (columnName.includes('_actual') || columnName.includes('type')) {
      if (val !== val.toLowerCase() && val !== val.toUpperCase()) {
        // This might be intentional, so just info
      }
    }
  });

  if (issues.length > 0) {
    addIssue('WARNING', columnName, 'TEXT_FORMATTING',
      `${issues.length} formatting issue(s) found`,
      issues.slice(0, 10)
    );
  }
}

// Check for placeholder values
async function checkPlaceholders(columnName) {
  const { data, error } = await supabase
    .from('towns')
    .select(`id, name, ${columnName}`)
    .not(columnName, 'is', null);

  if (error || !data || data.length === 0) return;

  const placeholders = ['TODO', 'TBD', 'N/A', 'n/a', 'NULL', 'null', 'unknown',
                        'placeholder', 'test', 'xxx', '???', 'pending'];

  const found = data.filter(row => {
    const val = String(row[columnName]).toLowerCase();
    return placeholders.some(p => val.includes(p));
  });

  if (found.length > 0) {
    addIssue('ERROR', columnName, 'PLACEHOLDER_TEXT',
      `${found.length} placeholder value(s) found`,
      found.map(o => `${o.name}: "${o[columnName]}"`)
    );
  }
}

// Main audit function
async function runDetailedAudit() {
  console.log('🔍 Starting DETAILED data quality audit...\n');

  // Get all columns
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

  const textColumns = columns.filter(col =>
    col.includes('description') || col.includes('name') || col.includes('summary') ||
    col.includes('notes') || col === 'region' || col === 'country'
  );

  console.log('🔍 Checking for unrealistic zeros...');
  for (const col of numericColumns) {
    await checkUnrealisticZeros(col);
  }

  console.log('🔍 Checking for round numbers (possible estimates)...');
  for (const col of numericColumns) {
    await checkRoundNumbers(col);
  }

  console.log('🔍 Checking for duplicate values...');
  for (const col of numericColumns.slice(0, 20)) { // Sample to avoid too slow
    await checkDuplicateValues(col);
  }

  console.log('🔍 Checking missing data rates...');
  for (const col of columns) {
    await checkMissingData(col);
  }

  console.log('🔍 Checking categorical consistency...');
  for (const col of categoricalColumns) {
    await checkCategoricalConsistency(col);
  }

  console.log('🔍 Checking text formatting...');
  for (const col of textColumns) {
    await checkTextFormatting(col);
  }

  console.log('🔍 Checking for placeholders...');
  for (const col of columns) {
    await checkPlaceholders(col);
  }

  // Generate report
  console.log('\n' + '='.repeat(100));
  console.log('📋 DETAILED DATA QUALITY AUDIT REPORT');
  console.log('='.repeat(100) + '\n');

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

    console.log(`\n${'='.repeat(100)}`);
    console.log(`${severity === 'ERROR' ? '🔴' : severity === 'WARNING' ? '🟡' : '🔵'} ${severity} (${filtered.length})`);
    console.log('='.repeat(100));

    // Group by issue type
    const byType = {};
    filtered.forEach(issue => {
      byType[issue.issueType] = byType[issue.issueType] || [];
      byType[issue.issueType].push(issue);
    });

    Object.entries(byType).forEach(([type, typeIssues]) => {
      console.log(`\n▶ ${type} (${typeIssues.length} columns affected)`);
      console.log('-'.repeat(100));

      typeIssues.forEach(issue => {
        console.log(`\n  📍 Column: ${issue.column}`);
        console.log(`     ${issue.description}`);
        if (issue.examples.length > 0) {
          console.log(`     Examples:`);
          issue.examples.forEach(ex => console.log(`     - ${ex}`));
        }
      });
    });
  });

  console.log('\n' + '='.repeat(100));
  console.log('✅ DETAILED AUDIT COMPLETE');
  console.log('='.repeat(100));

  // Summary by column
  console.log('\n\n📊 COLUMNS WITH MOST ISSUES:');
  console.log('='.repeat(100));

  const columnIssueCount = {};
  issues.forEach(issue => {
    columnIssueCount[issue.column] = (columnIssueCount[issue.column] || 0) + 1;
  });

  const sortedColumns = Object.entries(columnIssueCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  sortedColumns.forEach(([col, count]) => {
    console.log(`${col}: ${count} issue(s)`);
  });
}

runDetailedAudit().catch(console.error);
