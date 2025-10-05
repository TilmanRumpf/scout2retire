import fs from 'fs';
import path from 'path';

/**
 * Analyze all audit issues across 9 phases
 * Categorize by type and fixability
 */

console.log('🔍 ANALYZING ALL AUDIT ISSUES\n');
console.log('Loading all phase reports...\n');

const issues = {
  // Categorized by fix approach
  schemaUpdatesNeeded: [],
  actualDataErrors: [],
  missingOptionalData: [],
  caseSensitivityIssues: [],
  crossValidationWarnings: [],
  emptyArraysInformational: [],

  // Stats
  totalIssues: 0,
  byPhase: {},
  bySeverity: { critical: 0, high: 0, medium: 0, low: 0 }
};

// Load all 9 phase reports
for (let phase = 1; phase <= 9; phase++) {
  const reportPath = `database-utilities/audit-phase${phase}-report.json`;

  try {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    issues.byPhase[phase] = {
      name: report.phase_name,
      critical: report.summary.critical,
      high: report.summary.high,
      medium: report.summary.medium,
      low: report.summary.low,
      total: report.summary.total
    };

    issues.bySeverity.critical += report.summary.critical;
    issues.bySeverity.high += report.summary.high;
    issues.bySeverity.medium += report.summary.medium;
    issues.bySeverity.low += report.summary.low;
    issues.totalIssues += report.summary.total;

    // Categorize issues by type
    if (report.issues.critical) {
      report.issues.critical.forEach(issue => {
        issues.actualDataErrors.push({ ...issue, phase, severity: 'CRITICAL' });
      });
    }

    if (report.issues.high) {
      report.issues.high.forEach(issue => {
        issues.actualDataErrors.push({ ...issue, phase, severity: 'HIGH' });
      });
    }

    if (report.issues.medium) {
      report.issues.medium.forEach(issue => {
        // Categorize MEDIUM issues
        if (issue.issue && issue.issue.includes('Invalid ') && issue.expected) {
          // Categorical value mismatch
          if (issue.current_value && typeof issue.current_value === 'string') {
            const currentLower = issue.current_value.toLowerCase();
            const expectedLower = issue.expected.toLowerCase();
            if (expectedLower.includes(currentLower)) {
              issues.caseSensitivityIssues.push({ ...issue, phase, severity: 'MEDIUM' });
            } else {
              issues.schemaUpdatesNeeded.push({ ...issue, phase, severity: 'MEDIUM' });
            }
          } else {
            issues.schemaUpdatesNeeded.push({ ...issue, phase, severity: 'MEDIUM' });
          }
        } else if (issue.issue && (issue.issue.includes('Missing ') || issue.issue.includes('NULL'))) {
          // Missing data
          issues.missingOptionalData.push({ ...issue, phase, severity: 'MEDIUM' });
        } else if (issue.check) {
          // Cross-validation issue
          issues.crossValidationWarnings.push({ ...issue, phase, severity: 'MEDIUM' });
        } else if (issue.current_value === null) {
          // NULL value
          issues.missingOptionalData.push({ ...issue, phase, severity: 'MEDIUM' });
        } else {
          // Potential actual error
          issues.actualDataErrors.push({ ...issue, phase, severity: 'MEDIUM' });
        }
      });
    }

    if (report.issues.low) {
      report.issues.low.forEach(issue => {
        // Categorize LOW issues
        if (issue.current_value === 'empty array') {
          issues.emptyArraysInformational.push({ ...issue, phase, severity: 'LOW' });
        } else if (issue.check) {
          issues.crossValidationWarnings.push({ ...issue, phase, severity: 'LOW' });
        } else if (issue.issue && issue.issue.includes('Missing ')) {
          issues.missingOptionalData.push({ ...issue, phase, severity: 'LOW' });
        } else {
          issues.crossValidationWarnings.push({ ...issue, phase, severity: 'LOW' });
        }
      });
    }

  } catch (error) {
    console.error(`Error loading phase ${phase} report:`, error.message);
  }
}

console.log('📊 ISSUE CATEGORIZATION:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`Total issues analyzed: ${issues.totalIssues}\n`);

console.log('By Severity:');
console.log(`  🔴 CRITICAL: ${issues.bySeverity.critical}`);
console.log(`  🟠 HIGH: ${issues.bySeverity.high}`);
console.log(`  🟡 MEDIUM: ${issues.bySeverity.medium}`);
console.log(`  🟢 LOW: ${issues.bySeverity.low}\n`);

console.log('By Fix Type:');
console.log(`  📝 Schema Updates Needed: ${issues.schemaUpdatesNeeded.length}`);
console.log(`  🔧 Actual Data Errors: ${issues.actualDataErrors.length}`);
console.log(`  📋 Case Sensitivity Issues: ${issues.caseSensitivityIssues.length}`);
console.log(`  ℹ️  Missing Optional Data: ${issues.missingOptionalData.length}`);
console.log(`  ⚠️  Cross-Validation Warnings: ${issues.crossValidationWarnings.length}`);
console.log(`  📊 Empty Arrays (Informational): ${issues.emptyArraysInformational.length}\n`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Analyze specific patterns
console.log('🔍 PATTERN ANALYSIS:\n');

// Group schema updates by field
const schemaByField = {};
issues.schemaUpdatesNeeded.forEach(issue => {
  const field = issue.field;
  if (!schemaByField[field]) {
    schemaByField[field] = { count: 0, examples: [], values: new Set() };
  }
  schemaByField[field].count++;
  if (schemaByField[field].examples.length < 3) {
    schemaByField[field].examples.push({
      town: issue.town_name,
      current: issue.current_value,
      expected: issue.expected
    });
  }
  if (issue.current_value) {
    schemaByField[field].values.add(issue.current_value);
  }
});

console.log('Schema Updates Needed by Field:');
Object.entries(schemaByField)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([field, data]) => {
    console.log(`\n  ${field}: ${data.count} issues`);
    console.log(`    Unique values found: ${Array.from(data.values).join(', ')}`);
    console.log(`    Expected: ${data.examples[0]?.expected || 'N/A'}`);
  });

// Group case sensitivity by field
const caseByField = {};
issues.caseSensitivityIssues.forEach(issue => {
  const field = issue.field;
  if (!caseByField[field]) {
    caseByField[field] = { count: 0, examples: [] };
  }
  caseByField[field].count++;
  if (caseByField[field].examples.length < 3) {
    caseByField[field].examples.push({
      town: issue.town_name,
      current: issue.current_value
    });
  }
});

console.log('\n\nCase Sensitivity Issues by Field:');
Object.entries(caseByField)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([field, data]) => {
    console.log(`  ${field}: ${data.count} issues`);
    console.log(`    Examples: ${data.examples.map(e => e.current).join(', ')}`);
  });

// Actual data errors - these need fixing
console.log('\n\n🔧 ACTUAL DATA ERRORS (Need Fixing):');
const errorsByType = {};
issues.actualDataErrors.forEach(issue => {
  const key = issue.issue || issue.check || 'unknown';
  if (!errorsByType[key]) {
    errorsByType[key] = [];
  }
  errorsByType[key].push(issue);
});

Object.entries(errorsByType)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([type, errors]) => {
    console.log(`\n  ${type}: ${errors.length} towns`);
    errors.slice(0, 3).forEach(e => {
      console.log(`    - ${e.town_name}, ${e.country}: ${JSON.stringify(e.current_value).substring(0, 60)}`);
    });
    if (errors.length > 3) {
      console.log(`    ... and ${errors.length - 3} more`);
    }
  });

// Save categorized issues
const analysis = {
  timestamp: new Date().toISOString(),
  summary: {
    total_issues: issues.totalIssues,
    by_severity: issues.bySeverity,
    by_fix_type: {
      schema_updates: issues.schemaUpdatesNeeded.length,
      actual_errors: issues.actualDataErrors.length,
      case_sensitivity: issues.caseSensitivityIssues.length,
      missing_optional: issues.missingOptionalData.length,
      cross_validation: issues.crossValidationWarnings.length,
      empty_arrays: issues.emptyArraysInformational.length
    }
  },
  categorized_issues: {
    schema_updates_needed: issues.schemaUpdatesNeeded,
    actual_data_errors: issues.actualDataErrors,
    case_sensitivity_issues: issues.caseSensitivityIssues,
    missing_optional_data: issues.missingOptionalData,
    cross_validation_warnings: issues.crossValidationWarnings,
    empty_arrays_informational: issues.emptyArraysInformational
  },
  pattern_analysis: {
    schema_by_field: Object.fromEntries(
      Object.entries(schemaByField).map(([k, v]) => [k, {
        count: v.count,
        unique_values: Array.from(v.values),
        examples: v.examples
      }])
    ),
    case_by_field: caseByField,
    errors_by_type: Object.fromEntries(
      Object.entries(errorsByType).map(([k, v]) => [k, v.length])
    )
  }
};

fs.writeFileSync(
  'database-utilities/issues-categorized.json',
  JSON.stringify(analysis, null, 2)
);

console.log('\n\n✅ Analysis saved to: database-utilities/issues-categorized.json\n');
