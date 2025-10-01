import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * COMPREHENSIVE DATA AUDIT - PHASE 4: HEALTHCARE DATA
 *
 * Checking 10 healthcare columns across 341 towns:
 * - hospital_count, english_speaking_doctors
 * - healthcare_specialties_available, medical_specialties_rating
 * - environmental_health_rating, insurance_availability_rating
 * - medical_specialties_available, nearest_major_hospital_km
 * - health_insurance_required, private_healthcare_cost_index
 */

const issues = {
  critical: [],
  high: [],
  medium: [],
  low: []
};

async function phase4Audit() {
  console.log('🔍 PHASE 4: HEALTHCARE DATA AUDIT\n');
  console.log('Checking 10 healthcare columns across 341 towns...\n');

  const { data: towns, error } = await supabase
    .from('towns')
    .select(`
      id, name, country,
      hospital_count, english_speaking_doctors,
      healthcare_specialties_available, medical_specialties_rating,
      environmental_health_rating, insurance_availability_rating,
      medical_specialties_available, nearest_major_hospital_km,
      health_insurance_required, private_healthcare_cost_index
    `)
    .order('name');

  if (error) {
    console.error('❌ Error fetching towns:', error);
    return;
  }

  console.log(`📊 Analyzing ${towns.length} towns...\n`);

  // Check 1: Hospital count validation
  console.log('CHECK 1: Hospital count validation...');
  towns.forEach(town => {
    if (town.hospital_count !== null) {
      if (town.hospital_count < 0) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'hospital_count',
          issue: 'Negative hospital count',
          severity: 'HIGH',
          current_value: town.hospital_count
        });
      }
      if (town.hospital_count > 50) {
        issues.low.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'hospital_count',
          issue: 'Very high hospital count (>50) - verify for major cities',
          severity: 'LOW',
          current_value: town.hospital_count
        });
      }
    }
  });

  const hospitalIssues = issues.high.filter(i => i.field === 'hospital_count').length +
                         issues.low.filter(i => i.field === 'hospital_count').length;
  console.log(`   Found ${hospitalIssues} hospital count issues\n`);

  // Check 2: Hospital distance validation
  console.log('CHECK 2: Hospital distance validation...');
  towns.forEach(town => {
    if (town.nearest_major_hospital_km !== null) {
      const distanceNum = typeof town.nearest_major_hospital_km === 'string'
        ? parseFloat(town.nearest_major_hospital_km)
        : town.nearest_major_hospital_km;

      if (isNaN(distanceNum)) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'nearest_major_hospital_km',
          issue: 'Invalid hospital distance (not a number)',
          severity: 'HIGH',
          current_value: town.nearest_major_hospital_km
        });
      } else {
        if (distanceNum < 0) {
          issues.high.push({
            town_id: town.id,
            town_name: town.name,
            country: town.country,
            field: 'nearest_major_hospital_km',
            issue: 'Negative hospital distance',
            severity: 'HIGH',
            current_value: distanceNum
          });
        }
        if (distanceNum > 500) {
          issues.medium.push({
            town_id: town.id,
            town_name: town.name,
            country: town.country,
            field: 'nearest_major_hospital_km',
            issue: 'Very distant hospital (>500km) - verify for remote locations',
            severity: 'MEDIUM',
            current_value: distanceNum
          });
        }
      }
    }
  });

  const distanceIssues = issues.high.filter(i => i.field === 'nearest_major_hospital_km').length +
                         issues.medium.filter(i => i.field === 'nearest_major_hospital_km').length;
  console.log(`   Found ${distanceIssues} hospital distance issues\n`);

  // Check 3: Rating validations
  console.log('CHECK 3: Healthcare rating validations...');
  const ratingFields = [
    'medical_specialties_rating',
    'environmental_health_rating',
    'insurance_availability_rating'
  ];

  towns.forEach(town => {
    ratingFields.forEach(field => {
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

  const ratingIssues = issues.high.filter(i => i.field.includes('_rating')).length;
  console.log(`   Found ${ratingIssues} rating issues\n`);

  // Check 4: Healthcare cost index validation
  console.log('CHECK 4: Healthcare cost index validation...');
  towns.forEach(town => {
    if (town.private_healthcare_cost_index !== null) {
      if (town.private_healthcare_cost_index < 0) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'private_healthcare_cost_index',
          issue: 'Negative healthcare cost index',
          severity: 'HIGH',
          current_value: town.private_healthcare_cost_index
        });
      }
      if (town.private_healthcare_cost_index > 300) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'private_healthcare_cost_index',
          issue: 'Very high healthcare cost index (>300) - verify accuracy',
          severity: 'MEDIUM',
          current_value: town.private_healthcare_cost_index
        });
      }
    }
  });

  const costIndexIssues = issues.high.filter(i => i.field === 'private_healthcare_cost_index').length +
                          issues.medium.filter(i => i.field === 'private_healthcare_cost_index').length;
  console.log(`   Found ${costIndexIssues} healthcare cost index issues\n`);

  // Check 5: Healthcare specialties data quality
  console.log('CHECK 5: Healthcare specialties data quality...');
  towns.forEach(town => {
    // healthcare_specialties_available should be array
    if (town.healthcare_specialties_available !== null &&
        !Array.isArray(town.healthcare_specialties_available)) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'healthcare_specialties_available',
        issue: 'Healthcare specialties not an array',
        severity: 'MEDIUM',
        current_value: typeof town.healthcare_specialties_available
      });
    }

    // medical_specialties_available should be array or null
    if (town.medical_specialties_available !== null &&
        !Array.isArray(town.medical_specialties_available)) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'medical_specialties_available',
        issue: 'Medical specialties not an array',
        severity: 'MEDIUM',
        current_value: typeof town.medical_specialties_available
      });
    }
  });

  const specialtiesIssues = issues.medium.filter(i =>
    i.field.includes('specialties')
  ).length;
  console.log(`   Found ${specialtiesIssues} specialties data type issues\n`);

  // Check 6: Boolean field validation
  console.log('CHECK 6: Boolean field validation...');
  towns.forEach(town => {
    // english_speaking_doctors should be boolean or null
    if (town.english_speaking_doctors !== null &&
        typeof town.english_speaking_doctors !== 'boolean') {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'english_speaking_doctors',
        issue: 'Should be boolean (true/false)',
        severity: 'MEDIUM',
        current_value: town.english_speaking_doctors
      });
    }

    // health_insurance_required should be boolean or null
    if (town.health_insurance_required !== null &&
        typeof town.health_insurance_required !== 'boolean') {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'health_insurance_required',
        issue: 'Should be boolean (true/false)',
        severity: 'MEDIUM',
        current_value: town.health_insurance_required
      });
    }
  });

  const booleanIssues = issues.medium.filter(i =>
    ['english_speaking_doctors', 'health_insurance_required'].includes(i.field)
  ).length;
  console.log(`   Found ${booleanIssues} boolean field type issues\n`);

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PHASE 4 SUMMARY:\n');
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

  // Save detailed report
  const report = {
    phase: 4,
    phase_name: 'Healthcare Data',
    columns_checked: [
      'hospital_count', 'english_speaking_doctors',
      'healthcare_specialties_available', 'medical_specialties_rating',
      'environmental_health_rating', 'insurance_availability_rating',
      'medical_specialties_available', 'nearest_major_hospital_km',
      'health_insurance_required', 'private_healthcare_cost_index'
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
    'database-utilities/audit-phase4-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('✅ Phase 4 report saved to: database-utilities/audit-phase4-report.json\n');

  return report;
}

phase4Audit().catch(console.error);