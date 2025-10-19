/**
 * COMPREHENSIVE ADMIN PANEL AUDIT
 *
 * This script performs a deep review of all admin panels to identify:
 * 1. Fields that don't exist in database
 * 2. Fields with incorrect types or options
 * 3. Missing validation or dropdown options
 * 4. Misalignment with onboarding preferences
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Known valid values from onboarding
const ONBOARDING_VALUES = {
  // Climate preferences
  summer_climate_actual: ['mild', 'warm', 'hot'],
  winter_climate_actual: ['cold', 'cool', 'mild', 'hot'],
  humidity_level_actual: ['dry', 'balanced', 'humid'],
  sunshine_level_actual: ['low', 'less_sunny', 'balanced', 'high', 'often_sunny'],
  precipitation_level_actual: ['low', 'mostly_dry', 'balanced', 'high', 'less_dry'],
  seasonal_variation_actual: ['low', 'minimal', 'moderate', 'distinct_seasons', 'high', 'extreme'],

  // Culture preferences
  pace_of_life_actual: ['slow', 'relaxed', 'moderate', 'fast'],
  social_atmosphere: ['reserved', 'quiet', 'moderate', 'friendly', 'vibrant', 'very friendly'],
  traditional_progressive_lean: ['traditional', 'moderate', 'balanced', 'progressive'],
  expat_community_size: ['small', 'moderate', 'large'],
  retirement_community_presence: ['none', 'minimal', 'limited', 'moderate', 'strong', 'extensive', 'very_strong'],
  cultural_events_frequency: ['rare', 'occasional', 'monthly', 'frequent', 'weekly', 'constant', 'daily'],
  english_proficiency_level: ['low', 'moderate', 'high', 'very high', 'widespread', 'native'],

  // Geographic preferences
  geographic_features_actual: ['coastal', 'island', 'river', 'desert', 'plains', 'mountain', 'lake', 'valley', 'forest'],
  vegetation_type_actual: ['tropical', 'subtropical', 'mediterranean', 'forest', 'grassland', 'desert'],
  urban_rural_character: ['rural', 'suburban', 'urban']
};

// Admin panel files to check
const PANEL_FILES = [
  'src/components/admin/BasicInfoPanel.jsx',
  'src/components/admin/ScoreBreakdownPanel.jsx',
  'src/components/admin/ClimatePanel.jsx',
  'src/components/admin/CulturePanel.jsx',
  'src/components/admin/HealthPanel.jsx',
  'src/components/admin/CostsPanel.jsx',
  'src/components/admin/InfrastructurePanel.jsx',
  'src/components/admin/ActivitiesPanel.jsx',
  'src/components/admin/RegionPanel.jsx'
];

async function auditPanels() {
  console.log('🔍 COMPREHENSIVE ADMIN PANEL AUDIT');
  console.log('=' .repeat(70) + '\n');

  const issues = {
    nonExistentFields: [],
    incorrectTypes: [],
    missingDropdownOptions: [],
    numericRangeIssues: [],
    onboardingMisalignment: []
  };

  // 1. Get database schema
  console.log('1️⃣ FETCHING DATABASE SCHEMA...\n');
  const { data: sampleTown, error } = await supabase
    .from('towns')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('❌ Could not fetch database schema:', error);
    return;
  }

  const dbColumns = Object.keys(sampleTown);
  const columnTypes = {};

  // Determine column types
  for (const [key, value] of Object.entries(sampleTown)) {
    if (value === null) {
      columnTypes[key] = 'unknown';
    } else if (typeof value === 'boolean') {
      columnTypes[key] = 'boolean';
    } else if (typeof value === 'number') {
      columnTypes[key] = 'number';
    } else if (Array.isArray(value)) {
      columnTypes[key] = 'array';
    } else if (typeof value === 'object') {
      columnTypes[key] = 'object';
    } else {
      columnTypes[key] = 'string';
    }
  }

  // 2. Analyze each panel file
  console.log('2️⃣ ANALYZING ADMIN PANEL FILES...\n');

  for (const filePath of PANEL_FILES) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filePath}`);
      continue;
    }

    const fileName = path.basename(filePath);
    console.log(`📄 Checking ${fileName}...`);

    const content = fs.readFileSync(filePath, 'utf8');

    // Extract field definitions
    const fieldMatches = content.matchAll(/field="([^"]+)"/g);
    const typeMatches = content.matchAll(/type="([^"]+)"/g);
    const rangeMatches = content.matchAll(/range=\{?\[([^\]]+)\]\}?/g);

    const fields = [...fieldMatches].map(m => m[1]);

    for (const field of fields) {
      // Check if field exists in database
      if (!dbColumns.includes(field)) {
        issues.nonExistentFields.push({
          panel: fileName,
          field: field
        });
      }

      // Check for onboarding alignment
      if (ONBOARDING_VALUES[field]) {
        // Extract the range/options for this field from the panel
        const fieldRegex = new RegExp(`field="${field}"[^>]*>[\\s\\S]*?range=\\{?\\[([^\\]]+)\\]`, 'm');
        const match = content.match(fieldRegex);

        if (match) {
          const panelOptions = match[1].split(',').map(opt =>
            opt.trim().replace(/['"]/g, '').toLowerCase()
          );

          const validOptions = ONBOARDING_VALUES[field];
          const missingOptions = validOptions.filter(opt =>
            !panelOptions.includes(opt.toLowerCase())
          );

          if (missingOptions.length > 0) {
            issues.missingDropdownOptions.push({
              panel: fileName,
              field: field,
              missing: missingOptions,
              hasInPanel: panelOptions,
              shouldHave: validOptions
            });
          }
        }
      }
    }
  }

  // 3. Check for specific known issues
  console.log('\n3️⃣ CHECKING FOR SPECIFIC PATTERNS...\n');

  // Check for fields that should be dropdowns but aren't
  for (const filePath of PANEL_FILES) {
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    // Look for fields with _actual suffix that should have dropdowns
    const actualFields = content.matchAll(/field="(\w+_actual)"/g);
    for (const match of actualFields) {
      const field = match[1];
      if (ONBOARDING_VALUES[field]) {
        // Check if it has type="select" or proper range
        const fieldBlock = content.substring(
          content.indexOf(`field="${field}"`),
          content.indexOf(`field="${field}"`) + 500
        );

        if (!fieldBlock.includes('type="select"') &&
            !fieldBlock.includes('type="multiselect"') &&
            !fieldBlock.includes('range={[')) {
          issues.incorrectTypes.push({
            panel: fileName,
            field: field,
            issue: 'Should be a dropdown but is free text'
          });
        }
      }
    }
  }

  // 4. Check numeric fields for proper ranges
  console.log('4️⃣ CHECKING NUMERIC FIELD RANGES...\n');

  const numericFields = Object.entries(columnTypes)
    .filter(([_, type]) => type === 'number')
    .map(([field, _]) => field);

  for (const filePath of PANEL_FILES) {
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    for (const numField of numericFields) {
      if (content.includes(`field="${numField}"`)) {
        const fieldBlock = content.substring(
          content.indexOf(`field="${numField}"`),
          Math.min(content.indexOf(`field="${numField}"`) + 300, content.length)
        );

        // Check if it's incorrectly set as select instead of number
        if (fieldBlock.includes('type="select"')) {
          issues.numericRangeIssues.push({
            panel: fileName,
            field: numField,
            issue: 'Numeric field set as select dropdown'
          });
        }

        // Check if range is properly defined for number type
        if (fieldBlock.includes('type="number"') && !fieldBlock.includes('range=')) {
          issues.numericRangeIssues.push({
            panel: fileName,
            field: numField,
            issue: 'Number field missing range specification'
          });
        }
      }
    }
  }

  // 5. Cross-reference with database values
  console.log('5️⃣ CHECKING DATABASE VALUE DISTRIBUTIONS...\n');

  for (const [field, validValues] of Object.entries(ONBOARDING_VALUES)) {
    const { data: values, error } = await supabase
      .from('towns')
      .select(field)
      .not(field, 'is', null);

    if (!error && values) {
      const uniqueValues = new Set();

      values.forEach(row => {
        const value = row[field];
        if (Array.isArray(value)) {
          value.forEach(v => uniqueValues.add(v));
        } else if (typeof value === 'string') {
          if (value.includes(',')) {
            value.split(',').forEach(v => uniqueValues.add(v.trim()));
          } else {
            uniqueValues.add(value);
          }
        }
      });

      // Check for values not in onboarding
      const extraValues = [...uniqueValues].filter(v =>
        !validValues.map(vv => vv.toLowerCase()).includes(v.toLowerCase())
      );

      if (extraValues.length > 0) {
        console.log(`⚠️ ${field}: Database has extra values not in onboarding:`);
        console.log(`   Extra: ${extraValues.join(', ')}`);
      }
    }
  }

  // 6. Generate Report
  console.log('\n' + '='.repeat(70));
  console.log('📊 AUDIT SUMMARY REPORT');
  console.log('='.repeat(70) + '\n');

  console.log('❌ NON-EXISTENT FIELDS IN PANELS:');
  if (issues.nonExistentFields.length === 0) {
    console.log('   ✅ None found - all fields exist in database');
  } else {
    issues.nonExistentFields.forEach(issue => {
      console.log(`   - ${issue.panel}: ${issue.field}`);
    });
  }

  console.log('\n❌ INCORRECT FIELD TYPES:');
  if (issues.incorrectTypes.length === 0) {
    console.log('   ✅ None found - all types correct');
  } else {
    issues.incorrectTypes.forEach(issue => {
      console.log(`   - ${issue.panel}: ${issue.field} - ${issue.issue}`);
    });
  }

  console.log('\n⚠️ MISSING DROPDOWN OPTIONS:');
  if (issues.missingDropdownOptions.length === 0) {
    console.log('   ✅ None found - all dropdowns complete');
  } else {
    issues.missingDropdownOptions.forEach(issue => {
      console.log(`   - ${issue.panel}: ${issue.field}`);
      console.log(`     Missing: ${issue.missing.join(', ')}`);
      console.log(`     Should have: ${issue.shouldHave.join(', ')}`);
    });
  }

  console.log('\n⚠️ NUMERIC FIELD ISSUES:');
  if (issues.numericRangeIssues.length === 0) {
    console.log('   ✅ None found - all numeric fields properly configured');
  } else {
    issues.numericRangeIssues.forEach(issue => {
      console.log(`   - ${issue.panel}: ${issue.field} - ${issue.issue}`);
    });
  }

  // Calculate score
  const totalIssues =
    issues.nonExistentFields.length +
    issues.incorrectTypes.length +
    issues.missingDropdownOptions.length +
    issues.numericRangeIssues.length;

  console.log('\n' + '='.repeat(70));
  console.log('🎯 OVERALL ASSESSMENT');
  console.log('='.repeat(70));

  if (totalIssues === 0) {
    console.log('✅ EXCELLENT - No issues found!');
  } else if (totalIssues <= 5) {
    console.log(`⚠️ GOOD - ${totalIssues} minor issues found`);
  } else {
    console.log(`❌ NEEDS ATTENTION - ${totalIssues} issues found`);
  }

  // Save detailed report
  const detailedReport = {
    timestamp: new Date().toISOString(),
    issues,
    summary: {
      nonExistentFields: issues.nonExistentFields.length,
      incorrectTypes: issues.incorrectTypes.length,
      missingDropdownOptions: issues.missingDropdownOptions.length,
      numericRangeIssues: issues.numericRangeIssues.length,
      total: totalIssues
    }
  };

  fs.writeFileSync(
    'PANEL_AUDIT_REPORT.json',
    JSON.stringify(detailedReport, null, 2)
  );

  console.log('\nDetailed report saved to PANEL_AUDIT_REPORT.json');

  return detailedReport;
}

// Run the audit
auditPanels().catch(console.error);