import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * COMPREHENSIVE DATA AUDIT - PHASE 8: BOOLEAN/CATEGORICAL FIELDS
 *
 * Checking remaining boolean and categorical fields:
 * - Booleans: tax_treaty_us, tax_haven_status, foreign_income_taxed, digital_nomad_visa,
 *   retirement_visa_available, needs_update, image_is_fallback
 * - Categorical: pace_of_life_actual, urban_rural_character, social_atmosphere,
 *   traditional_progressive_lean, primary_language, english_proficiency_level
 * - Other specific fields that need validation
 */

const issues = {
  critical: [],
  high: [],
  medium: [],
  low: []
};

async function phase8Audit() {
  console.log('🔍 PHASE 8: BOOLEAN/CATEGORICAL FIELDS AUDIT\n');
  console.log('Checking boolean and categorical fields across 341 towns...\n');

  const { data: towns, error } = await supabase
    .from('towns')
    .select(`
      id, name, country,
      tax_treaty_us, tax_haven_status, foreign_income_taxed,
      digital_nomad_visa, retirement_visa_available,
      needs_update, image_is_fallback,
      pace_of_life_actual, urban_rural_character, social_atmosphere,
      traditional_progressive_lean, primary_language, english_proficiency_level,
      languages_spoken, secondary_languages,
      pet_friendliness, solo_living_support,
      family_friendliness_rating, senior_friendly_rating,
      lgbtq_friendly_rating, startup_ecosystem_rating,
      tourist_season_impact, property_appreciation_rate_pct,
      pollen_levels, swimming_facilities
    `)
    .order('name');

  if (error) {
    console.error('❌ Error fetching towns:', error);
    return;
  }

  console.log(`📊 Analyzing ${towns.length} towns...\n`);

  // Check 1: Boolean fields validation
  console.log('CHECK 1: Boolean fields validation...');
  const booleanFields = [
    'tax_treaty_us', 'tax_haven_status', 'foreign_income_taxed',
    'digital_nomad_visa', 'retirement_visa_available',
    'needs_update', 'image_is_fallback'
  ];

  towns.forEach(town => {
    booleanFields.forEach(field => {
      const value = town[field];
      if (value !== null && typeof value !== 'boolean') {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: field,
          issue: `${field} should be boolean (true/false)`,
          severity: 'MEDIUM',
          current_value: `${typeof value}: ${value}`
        });
      }
    });
  });

  const booleanIssues = issues.medium.filter(i => booleanFields.includes(i.field)).length;
  console.log(`   Found ${booleanIssues} boolean field type issues\n`);

  // Check 2: Pace of life validation
  console.log('CHECK 2: Pace of life validation...');
  // Updated 2025-09-30: Added "relaxed" - used by 164 towns (48% of database)
  const validPaceOfLife = ['slow', 'relaxed', 'moderate', 'fast', null];

  towns.forEach(town => {
    if (town.pace_of_life_actual && !validPaceOfLife.includes(town.pace_of_life_actual.toLowerCase())) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'pace_of_life_actual',
        issue: 'Invalid pace of life value',
        severity: 'MEDIUM',
        current_value: town.pace_of_life_actual,
        expected: 'slow, moderate, fast'
      });
    }
  });

  const paceIssues = issues.medium.filter(i => i.field === 'pace_of_life_actual').length;
  console.log(`   Found ${paceIssues} pace of life issues\n`);

  // Check 3: Urban/rural character validation
  console.log('CHECK 3: Urban/rural character validation...');
  const validUrbanRural = ['urban', 'suburban', 'rural', 'remote', null];

  towns.forEach(town => {
    if (town.urban_rural_character && !validUrbanRural.includes(town.urban_rural_character.toLowerCase())) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'urban_rural_character',
        issue: 'Invalid urban/rural character value',
        severity: 'MEDIUM',
        current_value: town.urban_rural_character,
        expected: 'urban, suburban, rural, remote'
      });
    }
  });

  const urbanRuralIssues = issues.medium.filter(i => i.field === 'urban_rural_character').length;
  console.log(`   Found ${urbanRuralIssues} urban/rural character issues\n`);

  // Check 4: English proficiency validation
  console.log('CHECK 4: English proficiency validation...');
  const validEnglishLevels = ['low', 'moderate', 'high', 'very high', 'native', null];

  towns.forEach(town => {
    if (town.english_proficiency_level && !validEnglishLevels.includes(town.english_proficiency_level.toLowerCase())) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'english_proficiency_level',
        issue: 'Invalid English proficiency level',
        severity: 'MEDIUM',
        current_value: town.english_proficiency_level,
        expected: 'low, moderate, high, very high, native'
      });
    }
  });

  const englishIssues = issues.medium.filter(i => i.field === 'english_proficiency_level').length;
  console.log(`   Found ${englishIssues} English proficiency issues\n`);

  // Check 5: Language fields validation
  console.log('CHECK 5: Language fields validation...');
  towns.forEach(town => {
    // languages_spoken should be array
    if (town.languages_spoken !== null && !Array.isArray(town.languages_spoken)) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'languages_spoken',
        issue: 'languages_spoken should be an array',
        severity: 'MEDIUM',
        current_value: typeof town.languages_spoken
      });
    }

    // secondary_languages should be array or null
    if (town.secondary_languages !== null && !Array.isArray(town.secondary_languages)) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'secondary_languages',
        issue: 'secondary_languages should be an array',
        severity: 'MEDIUM',
        current_value: typeof town.secondary_languages
      });
    }

    // primary_language should be a string
    if (town.primary_language !== null && typeof town.primary_language !== 'string') {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'primary_language',
        issue: 'primary_language should be a string',
        severity: 'MEDIUM',
        current_value: typeof town.primary_language
      });
    }
  });

  const languageIssues = issues.medium.filter(i =>
    ['languages_spoken', 'secondary_languages', 'primary_language'].includes(i.field)
  ).length;
  console.log(`   Found ${languageIssues} language field issues\n`);

  // Check 6: Rating fields (friendliness/ecosystem)
  console.log('CHECK 6: Friendliness/ecosystem rating validation...');
  const friendlinessRatingFields = [
    'family_friendliness_rating', 'senior_friendly_rating',
    'lgbtq_friendly_rating', 'startup_ecosystem_rating'
  ];

  towns.forEach(town => {
    friendlinessRatingFields.forEach(field => {
      const value = town[field];
      if (value !== null) {
        if (value < 0 || value > 10) {
          issues.high.push({
            town_id: town.id,
            town_name: town.name,
            country: town.country,
            field: field,
            issue: `${field} outside valid range (0-10)`,
            severity: 'HIGH',
            current_value: value
          });
        }
      }
    });
  });

  const friendlinessIssues = issues.high.filter(i => friendlinessRatingFields.includes(i.field)).length;
  console.log(`   Found ${friendlinessIssues} friendliness rating issues\n`);

  // Check 7: Percentage fields validation
  console.log('CHECK 7: Percentage fields validation...');
  towns.forEach(town => {
    // property_appreciation_rate_pct can be negative (depreciation) but should be reasonable
    if (town.property_appreciation_rate_pct !== null) {
      if (town.property_appreciation_rate_pct < -50 || town.property_appreciation_rate_pct > 100) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'property_appreciation_rate_pct',
          issue: 'Property appreciation rate outside reasonable range (-50% to 100%)',
          severity: 'MEDIUM',
          current_value: town.property_appreciation_rate_pct
        });
      }
    }
  });

  const percentageIssues = issues.medium.filter(i => i.field === 'property_appreciation_rate_pct').length;
  console.log(`   Found ${percentageIssues} percentage field issues\n`);

  // Check 8: Social atmosphere and traditional/progressive lean
  console.log('CHECK 8: Social atmosphere and traditional/progressive validation...');
  // Updated 2025-09-30: Added "vibrant", "quiet", "balanced"
  const validSocialAtmosphere = ['reserved', 'quiet', 'moderate', 'friendly', 'vibrant', 'very friendly', null];
  const validTraditionalProgressive = ['traditional', 'moderate', 'balanced', 'progressive', null];

  towns.forEach(town => {
    if (town.social_atmosphere && !validSocialAtmosphere.includes(town.social_atmosphere.toLowerCase())) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'social_atmosphere',
        issue: 'Invalid social atmosphere value',
        severity: 'MEDIUM',
        current_value: town.social_atmosphere,
        expected: 'reserved, moderate, friendly, very friendly'
      });
    }

    if (town.traditional_progressive_lean && !validTraditionalProgressive.includes(town.traditional_progressive_lean.toLowerCase())) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'traditional_progressive_lean',
        issue: 'Invalid traditional/progressive lean value',
        severity: 'MEDIUM',
        current_value: town.traditional_progressive_lean,
        expected: 'traditional, moderate, progressive'
      });
    }
  });

  const atmosphereIssues = issues.medium.filter(i =>
    ['social_atmosphere', 'traditional_progressive_lean'].includes(i.field)
  ).length;
  console.log(`   Found ${atmosphereIssues} atmosphere/lean issues\n`);

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PHASE 8 SUMMARY:\n');
  console.log(`🔴 CRITICAL issues: ${issues.critical.length}`);
  console.log(`🟠 HIGH issues: ${issues.high.length}`);
  console.log(`🟡 MEDIUM issues: ${issues.medium.length}`);
  console.log(`🟢 LOW issues: ${issues.low.length}`);
  console.log(`\n📊 Total issues found: ${issues.critical.length + issues.high.length + issues.medium.length + issues.low.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Sample some HIGH severity issues
  if (issues.high.length > 0) {
    console.log('🟠 Sample HIGH severity issues:');
    issues.high.slice(0, 5).forEach(issue => {
      console.log(`   - ${issue.town_name}, ${issue.country}: ${issue.issue}`);
      console.log(`     Current value: ${JSON.stringify(issue.current_value)}`);
    });
    if (issues.high.length > 5) {
      console.log(`   ... and ${issues.high.length - 5} more HIGH issues\n`);
    }
  }

  // Sample some MEDIUM severity issues
  if (issues.medium.length > 0) {
    console.log('🟡 Sample MEDIUM severity issues (first 10):');
    issues.medium.slice(0, 10).forEach(issue => {
      console.log(`   - ${issue.town_name}, ${issue.country}: ${issue.issue}`);
      console.log(`     Current value: ${issue.current_value}`);
      if (issue.expected) {
        console.log(`     Expected: ${issue.expected}`);
      }
    });
    if (issues.medium.length > 10) {
      console.log(`   ... and ${issues.medium.length - 10} more MEDIUM issues\n`);
    }
  }

  // Save detailed report
  const report = {
    phase: 8,
    phase_name: 'Boolean/Categorical Fields',
    columns_checked: [
      'tax_treaty_us', 'tax_haven_status', 'foreign_income_taxed',
      'digital_nomad_visa', 'retirement_visa_available',
      'needs_update', 'image_is_fallback',
      'pace_of_life_actual', 'urban_rural_character', 'social_atmosphere',
      'traditional_progressive_lean', 'primary_language', 'english_proficiency_level',
      'languages_spoken', 'secondary_languages',
      'pet_friendliness', 'solo_living_support',
      'family_friendliness_rating', 'senior_friendly_rating',
      'lgbtq_friendly_rating', 'startup_ecosystem_rating',
      'tourist_season_impact', 'property_appreciation_rate_pct',
      'pollen_levels', 'swimming_facilities'
    ],
    towns_analyzed: towns.length,
    timestamp: new Date().toISOString(),
    issues: issues,
    summary: {
      critical: issues.critical.length,
      high: issues.high.length,
      medium: issues.medium.length,
      low: issues.low.length,
      total: issues.critical.length + issues.high.length + issues.medium.length + issues.low.length
    }
  };

  fs.writeFileSync(
    'database-utilities/audit-phase8-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('✅ Phase 8 report saved to: database-utilities/audit-phase8-report.json\n');

  return report;
}

phase8Audit().catch(console.error);