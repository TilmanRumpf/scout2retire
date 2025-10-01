import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * COMPREHENSIVE DATA AUDIT - PHASE 1: CRITICAL CORE DATA
 *
 * Checking 10 critical columns across 341 towns:
 * - id, name, country, population, latitude, longitude
 * - cost_of_living_usd, healthcare_score, safety_score, quality_of_life
 */

const issues = {
  critical: [],
  high: [],
  medium: [],
  low: []
};

async function phase1Audit() {
  console.log('🔍 PHASE 1: CRITICAL CORE DATA AUDIT\n');
  console.log('Checking 10 critical columns across 341 towns...\n');

  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, population, latitude, longitude, cost_of_living_usd, healthcare_score, safety_score, quality_of_life')
    .order('name');

  if (error) {
    console.error('❌ Error fetching towns:', error);
    return;
  }

  console.log(`📊 Analyzing ${towns.length} towns...\n`);

  // Check 1: Missing critical fields
  console.log('CHECK 1: Missing critical fields...');
  towns.forEach(town => {
    if (!town.name) {
      issues.critical.push({
        town_id: town.id,
        field: 'name',
        issue: 'Missing town name',
        severity: 'CRITICAL',
        current_value: null
      });
    }
    if (!town.country) {
      issues.critical.push({
        town_id: town.id,
        town_name: town.name,
        field: 'country',
        issue: 'Missing country',
        severity: 'CRITICAL',
        current_value: null
      });
    }
  });
  console.log(`   Found ${issues.critical.length} critical missing fields\n`);

  // Check 2: Invalid coordinates
  console.log('CHECK 2: Invalid coordinates...');
  towns.forEach(town => {
    if (town.latitude === null || town.longitude === null) {
      issues.high.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'latitude/longitude',
        issue: 'Missing coordinates',
        severity: 'HIGH',
        current_value: { lat: town.latitude, lng: town.longitude }
      });
    } else {
      // Check if coordinates are valid ranges
      if (town.latitude < -90 || town.latitude > 90) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'latitude',
          issue: 'Invalid latitude (must be -90 to 90)',
          severity: 'HIGH',
          current_value: town.latitude
        });
      }
      if (town.longitude < -180 || town.longitude > 180) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'longitude',
          issue: 'Invalid longitude (must be -180 to 180)',
          severity: 'HIGH',
          current_value: town.longitude
        });
      }
      // Check if coordinates are (0,0) - likely default/placeholder
      if (town.latitude === 0 && town.longitude === 0) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'latitude/longitude',
          issue: 'Coordinates are (0,0) - likely placeholder',
          severity: 'HIGH',
          current_value: { lat: 0, lng: 0 }
        });
      }
    }
  });
  console.log(`   Found ${issues.high.filter(i => i.field.includes('latitude') || i.field.includes('longitude')).length} coordinate issues\n`);

  // Check 3: Population data quality
  console.log('CHECK 3: Population data quality...');
  towns.forEach(town => {
    if (town.population === null) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'population',
        issue: 'Missing population data',
        severity: 'MEDIUM',
        current_value: null
      });
    } else if (town.population < 1000) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'population',
        issue: 'Unusually low population for retirement destination (<1,000)',
        severity: 'MEDIUM',
        current_value: town.population
      });
    } else if (town.population > 25000000) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'population',
        issue: 'Unusually high population (>25M) - verify accuracy',
        severity: 'MEDIUM',
        current_value: town.population
      });
    }
  });
  console.log(`   Found ${issues.medium.filter(i => i.field === 'population').length} population issues\n`);

  // Check 4: Cost of living data
  console.log('CHECK 4: Cost of living data...');
  towns.forEach(town => {
    if (town.cost_of_living_usd === null) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'cost_of_living_usd',
        issue: 'Missing cost of living data',
        severity: 'MEDIUM',
        current_value: null
      });
    } else if (town.cost_of_living_usd < 300) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'cost_of_living_usd',
        issue: 'Unusually low cost of living (<$300/month) - verify accuracy',
        severity: 'MEDIUM',
        current_value: town.cost_of_living_usd
      });
    } else if (town.cost_of_living_usd > 10000) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'cost_of_living_usd',
        issue: 'Unusually high cost of living (>$10,000/month) - verify accuracy',
        severity: 'MEDIUM',
        current_value: town.cost_of_living_usd
      });
    }
  });
  console.log(`   Found ${issues.medium.filter(i => i.field === 'cost_of_living_usd').length} cost of living issues\n`);

  // Check 5: Healthcare score validation
  console.log('CHECK 5: Healthcare score validation...');
  towns.forEach(town => {
    if (town.healthcare_score === null) {
      issues.low.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'healthcare_score',
        issue: 'Missing healthcare score',
        severity: 'LOW',
        current_value: null
      });
    } else if (town.healthcare_score < 0 || town.healthcare_score > 10) {
      issues.high.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'healthcare_score',
        issue: 'Healthcare score out of valid range (0-10)',
        severity: 'HIGH',
        current_value: town.healthcare_score
      });
    }
  });
  console.log(`   Found ${issues.low.filter(i => i.field === 'healthcare_score').length + issues.high.filter(i => i.field === 'healthcare_score').length} healthcare score issues\n`);

  // Check 6: Safety score validation
  console.log('CHECK 6: Safety score validation...');
  towns.forEach(town => {
    if (town.safety_score === null) {
      issues.low.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'safety_score',
        issue: 'Missing safety score',
        severity: 'LOW',
        current_value: null
      });
    } else if (town.safety_score < 0 || town.safety_score > 10) {
      issues.high.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'safety_score',
        issue: 'Safety score out of valid range (0-10)',
        severity: 'HIGH',
        current_value: town.safety_score
      });
    }
  });
  console.log(`   Found ${issues.low.filter(i => i.field === 'safety_score').length + issues.high.filter(i => i.field === 'safety_score').length} safety score issues\n`);

  // Check 7: Quality of life validation
  console.log('CHECK 7: Quality of life validation...');
  towns.forEach(town => {
    if (town.quality_of_life === null) {
      issues.low.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'quality_of_life',
        issue: 'Missing quality of life score',
        severity: 'LOW',
        current_value: null
      });
    } else if (town.quality_of_life < 0 || town.quality_of_life > 10) {
      issues.high.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'quality_of_life',
        issue: 'Quality of life score out of valid range (0-10)',
        severity: 'HIGH',
        current_value: town.quality_of_life
      });
    }
  });
  console.log(`   Found ${issues.low.filter(i => i.field === 'quality_of_life').length + issues.high.filter(i => i.field === 'quality_of_life').length} quality of life issues\n`);

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PHASE 1 SUMMARY:\n');
  console.log(`🔴 CRITICAL issues: ${issues.critical.length}`);
  console.log(`🟠 HIGH issues: ${issues.high.length}`);
  console.log(`🟡 MEDIUM issues: ${issues.medium.length}`);
  console.log(`🟢 LOW issues: ${issues.low.length}`);
  console.log(`\n📊 Total issues found: ${issues.critical.length + issues.high.length + issues.medium.length + issues.low.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Save detailed report
  const report = {
    phase: 1,
    phase_name: 'Critical Core Data',
    columns_checked: ['id', 'name', 'country', 'population', 'latitude', 'longitude', 'cost_of_living_usd', 'healthcare_score', 'safety_score', 'quality_of_life'],
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
    'database-utilities/audit-phase1-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('✅ Phase 1 report saved to: database-utilities/audit-phase1-report.json\n');

  return report;
}

phase1Audit().catch(console.error);