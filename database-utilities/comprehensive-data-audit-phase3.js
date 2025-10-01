import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * COMPREHENSIVE DATA AUDIT - PHASE 3: COST/FINANCIAL DATA
 *
 * Checking 17 cost/financial columns across 341 towns:
 * - cost_index, rent_1bed, meal_cost, groceries_cost, utilities_cost
 * - typical_monthly_living_cost, typical_rent_1bed, typical_home_price
 * - healthcare_cost, healthcare_cost_monthly
 * - rent_2bed_usd, rent_house_usd, purchase_apartment_sqm_usd, purchase_house_avg_usd
 * - income_tax_rate_pct, sales_tax_rate_pct, property_tax_rate_pct
 */

const issues = {
  critical: [],
  high: [],
  medium: [],
  low: []
};

async function phase3Audit() {
  console.log('🔍 PHASE 3: COST/FINANCIAL DATA AUDIT\n');
  console.log('Checking 17 cost/financial columns across 341 towns...\n');

  const { data: towns, error } = await supabase
    .from('towns')
    .select(`
      id, name, country,
      cost_index, rent_1bed, meal_cost, groceries_cost, utilities_cost,
      typical_monthly_living_cost, typical_rent_1bed, typical_home_price,
      healthcare_cost, healthcare_cost_monthly,
      rent_2bed_usd, rent_house_usd, purchase_apartment_sqm_usd, purchase_house_avg_usd,
      income_tax_rate_pct, sales_tax_rate_pct, property_tax_rate_pct
    `)
    .order('name');

  if (error) {
    console.error('❌ Error fetching towns:', error);
    return;
  }

  console.log(`📊 Analyzing ${towns.length} towns...\n`);

  // Check 1: Rent validation
  console.log('CHECK 1: Rent validation...');
  towns.forEach(town => {
    // 1-bed rent
    if (town.rent_1bed !== null) {
      if (town.rent_1bed < 100) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'rent_1bed',
          issue: 'Unusually low 1-bed rent (<$100/month)',
          severity: 'MEDIUM',
          current_value: town.rent_1bed
        });
      }
      if (town.rent_1bed > 10000) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'rent_1bed',
          issue: 'Unusually high 1-bed rent (>$10,000/month)',
          severity: 'MEDIUM',
          current_value: town.rent_1bed
        });
      }
      if (town.rent_1bed < 0) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'rent_1bed',
          issue: 'Negative rent value',
          severity: 'HIGH',
          current_value: town.rent_1bed
        });
      }
    }

    // 2-bed rent
    if (town.rent_2bed_usd !== null) {
      if (town.rent_2bed_usd < 0) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'rent_2bed_usd',
          issue: 'Negative rent value',
          severity: 'HIGH',
          current_value: town.rent_2bed_usd
        });
      }
      // 2-bed should typically be more than 1-bed
      if (town.rent_1bed && town.rent_2bed_usd < town.rent_1bed) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'rent_2bed_usd',
          issue: '2-bed rent less than 1-bed rent (inconsistent)',
          severity: 'MEDIUM',
          current_value: { rent_1bed: town.rent_1bed, rent_2bed: town.rent_2bed_usd }
        });
      }
    }

    // House rent
    if (town.rent_house_usd !== null && town.rent_house_usd < 0) {
      issues.high.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'rent_house_usd',
        issue: 'Negative rent value',
        severity: 'HIGH',
        current_value: town.rent_house_usd
      });
    }

    // typical_rent_1bed vs rent_1bed consistency
    if (town.typical_rent_1bed !== null && town.rent_1bed !== null) {
      const diff = Math.abs(town.typical_rent_1bed - town.rent_1bed);
      const diffPct = (diff / Math.max(town.typical_rent_1bed, town.rent_1bed)) * 100;
      if (diffPct > 50) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'typical_rent_1bed',
          issue: 'Large discrepancy (>50%) between rent_1bed and typical_rent_1bed',
          severity: 'MEDIUM',
          current_value: { rent_1bed: town.rent_1bed, typical_rent_1bed: town.typical_rent_1bed, diff_pct: diffPct.toFixed(1) }
        });
      }
    }
  });

  const rentIssues = issues.high.filter(i => i.field.includes('rent')).length +
                     issues.medium.filter(i => i.field.includes('rent')).length;
  console.log(`   Found ${rentIssues} rent issues\n`);

  // Check 2: Cost of living components
  console.log('CHECK 2: Cost of living components...');
  towns.forEach(town => {
    // Meal cost
    if (town.meal_cost !== null) {
      if (town.meal_cost < 1) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'meal_cost',
          issue: 'Unusually low meal cost (<$1)',
          severity: 'MEDIUM',
          current_value: town.meal_cost
        });
      }
      if (town.meal_cost > 100) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'meal_cost',
          issue: 'Unusually high meal cost (>$100)',
          severity: 'MEDIUM',
          current_value: town.meal_cost
        });
      }
      if (town.meal_cost < 0) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'meal_cost',
          issue: 'Negative meal cost',
          severity: 'HIGH',
          current_value: town.meal_cost
        });
      }
    }

    // Groceries cost
    if (town.groceries_cost !== null) {
      if (town.groceries_cost < 50) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'groceries_cost',
          issue: 'Unusually low monthly groceries cost (<$50)',
          severity: 'MEDIUM',
          current_value: town.groceries_cost
        });
      }
      if (town.groceries_cost > 2000) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'groceries_cost',
          issue: 'Unusually high monthly groceries cost (>$2,000)',
          severity: 'MEDIUM',
          current_value: town.groceries_cost
        });
      }
      if (town.groceries_cost < 0) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'groceries_cost',
          issue: 'Negative groceries cost',
          severity: 'HIGH',
          current_value: town.groceries_cost
        });
      }
    }

    // Utilities cost
    if (town.utilities_cost !== null) {
      if (town.utilities_cost < 20) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'utilities_cost',
          issue: 'Unusually low utilities cost (<$20/month)',
          severity: 'MEDIUM',
          current_value: town.utilities_cost
        });
      }
      if (town.utilities_cost > 1000) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'utilities_cost',
          issue: 'Unusually high utilities cost (>$1,000/month)',
          severity: 'MEDIUM',
          current_value: town.utilities_cost
        });
      }
      if (town.utilities_cost < 0) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'utilities_cost',
          issue: 'Negative utilities cost',
          severity: 'HIGH',
          current_value: town.utilities_cost
        });
      }
    }
  });

  const componentIssues = issues.high.filter(i => ['meal_cost', 'groceries_cost', 'utilities_cost'].includes(i.field)).length +
                          issues.medium.filter(i => ['meal_cost', 'groceries_cost', 'utilities_cost'].includes(i.field)).length;
  console.log(`   Found ${componentIssues} cost component issues\n`);

  // Check 3: Property prices validation
  console.log('CHECK 3: Property prices validation...');
  towns.forEach(town => {
    // Apartment price per sqm
    if (town.purchase_apartment_sqm_usd !== null) {
      if (town.purchase_apartment_sqm_usd < 100) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'purchase_apartment_sqm_usd',
          issue: 'Unusually low apartment price per sqm (<$100)',
          severity: 'MEDIUM',
          current_value: town.purchase_apartment_sqm_usd
        });
      }
      if (town.purchase_apartment_sqm_usd > 50000) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'purchase_apartment_sqm_usd',
          issue: 'Unusually high apartment price per sqm (>$50,000)',
          severity: 'MEDIUM',
          current_value: town.purchase_apartment_sqm_usd
        });
      }
      if (town.purchase_apartment_sqm_usd < 0) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'purchase_apartment_sqm_usd',
          issue: 'Negative apartment price',
          severity: 'HIGH',
          current_value: town.purchase_apartment_sqm_usd
        });
      }
    }

    // House purchase price
    if (town.purchase_house_avg_usd !== null) {
      if (town.purchase_house_avg_usd < 10000) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'purchase_house_avg_usd',
          issue: 'Unusually low house price (<$10,000)',
          severity: 'MEDIUM',
          current_value: town.purchase_house_avg_usd
        });
      }
      if (town.purchase_house_avg_usd > 10000000) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'purchase_house_avg_usd',
          issue: 'Unusually high house price (>$10M)',
          severity: 'MEDIUM',
          current_value: town.purchase_house_avg_usd
        });
      }
      if (town.purchase_house_avg_usd < 0) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'purchase_house_avg_usd',
          issue: 'Negative house price',
          severity: 'HIGH',
          current_value: town.purchase_house_avg_usd
        });
      }
    }

    // typical_home_price check
    if (town.typical_home_price !== null && town.typical_home_price < 0) {
      issues.high.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'typical_home_price',
        issue: 'Negative home price',
        severity: 'HIGH',
        current_value: town.typical_home_price
      });
    }
  });

  const propertyIssues = issues.high.filter(i => i.field.includes('purchase') || i.field.includes('home_price')).length +
                         issues.medium.filter(i => i.field.includes('purchase') || i.field.includes('home_price')).length;
  console.log(`   Found ${propertyIssues} property price issues\n`);

  // Check 4: Tax rates validation
  console.log('CHECK 4: Tax rates validation...');
  towns.forEach(town => {
    // Income tax
    if (town.income_tax_rate_pct !== null) {
      if (town.income_tax_rate_pct < 0 || town.income_tax_rate_pct > 100) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'income_tax_rate_pct',
          issue: 'Income tax rate outside valid range (0-100%)',
          severity: 'HIGH',
          current_value: town.income_tax_rate_pct
        });
      }
      if (town.income_tax_rate_pct > 70) {
        issues.low.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'income_tax_rate_pct',
          issue: 'Very high income tax rate (>70%) - verify accuracy',
          severity: 'LOW',
          current_value: town.income_tax_rate_pct
        });
      }
    }

    // Sales tax
    if (town.sales_tax_rate_pct !== null) {
      if (town.sales_tax_rate_pct < 0 || town.sales_tax_rate_pct > 100) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'sales_tax_rate_pct',
          issue: 'Sales tax rate outside valid range (0-100%)',
          severity: 'HIGH',
          current_value: town.sales_tax_rate_pct
        });
      }
      if (town.sales_tax_rate_pct > 35) {
        issues.low.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'sales_tax_rate_pct',
          issue: 'Very high sales tax rate (>35%) - verify accuracy',
          severity: 'LOW',
          current_value: town.sales_tax_rate_pct
        });
      }
    }

    // Property tax
    if (town.property_tax_rate_pct !== null) {
      if (town.property_tax_rate_pct < 0 || town.property_tax_rate_pct > 100) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'property_tax_rate_pct',
          issue: 'Property tax rate outside valid range (0-100%)',
          severity: 'HIGH',
          current_value: town.property_tax_rate_pct
        });
      }
      if (town.property_tax_rate_pct > 5) {
        issues.low.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'property_tax_rate_pct',
          issue: 'High property tax rate (>5%) - verify accuracy',
          severity: 'LOW',
          current_value: town.property_tax_rate_pct
        });
      }
    }
  });

  const taxIssues = issues.high.filter(i => i.field.includes('tax')).length +
                    issues.low.filter(i => i.field.includes('tax')).length;
  console.log(`   Found ${taxIssues} tax rate issues\n`);

  // Check 5: Healthcare cost validation
  console.log('CHECK 5: Healthcare cost validation...');
  towns.forEach(town => {
    if (town.healthcare_cost !== null) {
      if (town.healthcare_cost < 0) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'healthcare_cost',
          issue: 'Negative healthcare cost',
          severity: 'HIGH',
          current_value: town.healthcare_cost
        });
      }
      if (town.healthcare_cost > 5000) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'healthcare_cost',
          issue: 'Very high healthcare cost (>$5,000) - verify accuracy',
          severity: 'MEDIUM',
          current_value: town.healthcare_cost
        });
      }
    }

    if (town.healthcare_cost_monthly !== null) {
      if (town.healthcare_cost_monthly < 0) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'healthcare_cost_monthly',
          issue: 'Negative monthly healthcare cost',
          severity: 'HIGH',
          current_value: town.healthcare_cost_monthly
        });
      }
      if (town.healthcare_cost_monthly > 2000) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'healthcare_cost_monthly',
          issue: 'Very high monthly healthcare cost (>$2,000) - verify accuracy',
          severity: 'MEDIUM',
          current_value: town.healthcare_cost_monthly
        });
      }
    }
  });

  const healthcareCostIssues = issues.high.filter(i => i.field.includes('healthcare_cost')).length +
                               issues.medium.filter(i => i.field.includes('healthcare_cost')).length;
  console.log(`   Found ${healthcareCostIssues} healthcare cost issues\n`);

  // Check 6: Cost index validation
  console.log('CHECK 6: Cost index validation...');
  towns.forEach(town => {
    if (town.cost_index !== null) {
      if (town.cost_index < 0 || town.cost_index > 200) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'cost_index',
          issue: 'Cost index outside typical range (0-200)',
          severity: 'HIGH',
          current_value: town.cost_index
        });
      }
    }
  });

  const costIndexIssues = issues.high.filter(i => i.field === 'cost_index').length;
  console.log(`   Found ${costIndexIssues} cost index issues\n`);

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PHASE 3 SUMMARY:\n');
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
    phase: 3,
    phase_name: 'Cost/Financial Data',
    columns_checked: [
      'cost_index', 'rent_1bed', 'meal_cost', 'groceries_cost', 'utilities_cost',
      'typical_monthly_living_cost', 'typical_rent_1bed', 'typical_home_price',
      'healthcare_cost', 'healthcare_cost_monthly',
      'rent_2bed_usd', 'rent_house_usd', 'purchase_apartment_sqm_usd', 'purchase_house_avg_usd',
      'income_tax_rate_pct', 'sales_tax_rate_pct', 'property_tax_rate_pct'
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
    'database-utilities/audit-phase3-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('✅ Phase 3 report saved to: database-utilities/audit-phase3-report.json\n');

  return report;
}

phase3Audit().catch(console.error);