import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * COMPREHENSIVE DATA AUDIT - PHASE 2: CLIMATE DATA
 *
 * Checking 11 climate columns across 341 towns:
 * - climate, avg_temp_summer, avg_temp_winter, annual_rainfall, sunshine_hours
 * - summer_climate_actual, winter_climate_actual, humidity_level_actual
 * - sunshine_level_actual, precipitation_level_actual, seasonal_variation_actual
 */

const issues = {
  critical: [],
  high: [],
  medium: [],
  low: []
};

async function phase2Audit() {
  console.log('🔍 PHASE 2: CLIMATE DATA AUDIT\n');
  console.log('Checking 11 climate columns across 341 towns...\n');

  const { data: towns, error } = await supabase
    .from('towns')
    .select(`
      id, name, country,
      climate, avg_temp_summer, avg_temp_winter, annual_rainfall, sunshine_hours,
      summer_climate_actual, winter_climate_actual, humidity_level_actual,
      sunshine_level_actual, precipitation_level_actual, seasonal_variation_actual,
      latitude
    `)
    .order('name');

  if (error) {
    console.error('❌ Error fetching towns:', error);
    return;
  }

  console.log(`📊 Analyzing ${towns.length} towns...\n`);

  // Check 1: Missing climate type
  console.log('CHECK 1: Missing climate type...');
  towns.forEach(town => {
    if (!town.climate) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'climate',
        issue: 'Missing climate type',
        severity: 'MEDIUM',
        current_value: null
      });
    }
  });
  console.log(`   Found ${issues.medium.filter(i => i.field === 'climate').length} missing climate types\n`);

  // Check 2: Temperature validation
  console.log('CHECK 2: Temperature validation...');
  towns.forEach(town => {
    // Summer temperature checks
    if (town.avg_temp_summer === null) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'avg_temp_summer',
        issue: 'Missing summer temperature',
        severity: 'MEDIUM',
        current_value: null
      });
    } else {
      // Validate reasonable range (-20°C to 50°C)
      if (town.avg_temp_summer < -20 || town.avg_temp_summer > 50) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'avg_temp_summer',
          issue: 'Summer temperature outside reasonable range (-20°C to 50°C)',
          severity: 'HIGH',
          current_value: town.avg_temp_summer
        });
      }
      // Check if summer is colder than typical freezing
      if (town.avg_temp_summer < -10) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'avg_temp_summer',
          issue: 'Unusually cold summer temperature (<-10°C) - verify for polar regions',
          severity: 'MEDIUM',
          current_value: town.avg_temp_summer
        });
      }
      // Check if summer is extremely hot
      if (town.avg_temp_summer > 40) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'avg_temp_summer',
          issue: 'Very high summer temperature (>40°C) - verify for desert regions',
          severity: 'MEDIUM',
          current_value: town.avg_temp_summer
        });
      }
    }

    // Winter temperature checks
    if (town.avg_temp_winter === null) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'avg_temp_winter',
        issue: 'Missing winter temperature',
        severity: 'MEDIUM',
        current_value: null
      });
    } else {
      // Validate reasonable range (-50°C to 40°C)
      if (town.avg_temp_winter < -50 || town.avg_temp_winter > 40) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'avg_temp_winter',
          issue: 'Winter temperature outside reasonable range (-50°C to 40°C)',
          severity: 'HIGH',
          current_value: town.avg_temp_winter
        });
      }
    }

    // Temperature consistency check
    if (town.avg_temp_summer !== null && town.avg_temp_winter !== null) {
      // Winter should generally be colder than summer (except near equator)
      if (town.avg_temp_winter > town.avg_temp_summer) {
        // Check if near equator (within 10 degrees latitude)
        const isNearEquator = Math.abs(town.latitude) < 10;
        if (!isNearEquator) {
          issues.high.push({
            town_id: town.id,
            town_name: town.name,
            country: town.country,
            field: 'avg_temp_winter/avg_temp_summer',
            issue: 'Winter temperature higher than summer (inconsistent)',
            severity: 'HIGH',
            current_value: { winter: town.avg_temp_winter, summer: town.avg_temp_summer }
          });
        }
      }
      // Check for very small seasonal variation in non-tropical areas
      const tempDiff = Math.abs(town.avg_temp_summer - town.avg_temp_winter);
      const isNearEquator = Math.abs(town.latitude) < 20;
      if (tempDiff < 3 && !isNearEquator) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'seasonal_temperature_variation',
          issue: 'Very small seasonal temperature variation (<3°C) for non-tropical location',
          severity: 'MEDIUM',
          current_value: { winter: town.avg_temp_winter, summer: town.avg_temp_summer, diff: tempDiff }
        });
      }
    }
  });

  const tempIssues = issues.high.filter(i => i.field.includes('temp')).length +
                     issues.medium.filter(i => i.field.includes('temp')).length;
  console.log(`   Found ${tempIssues} temperature issues\n`);

  // Check 3: Rainfall validation
  console.log('CHECK 3: Rainfall validation...');
  towns.forEach(town => {
    if (town.annual_rainfall === null) {
      issues.low.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'annual_rainfall',
        issue: 'Missing annual rainfall data',
        severity: 'LOW',
        current_value: null
      });
    } else {
      // Validate reasonable range (0mm to 15,000mm)
      if (town.annual_rainfall < 0 || town.annual_rainfall > 15000) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'annual_rainfall',
          issue: 'Rainfall outside reasonable range (0-15,000mm)',
          severity: 'HIGH',
          current_value: town.annual_rainfall
        });
      }
      // Flag extremely low rainfall (desert)
      if (town.annual_rainfall < 100) {
        issues.low.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'annual_rainfall',
          issue: 'Very low rainfall (<100mm) - verify for desert/arid regions',
          severity: 'LOW',
          current_value: town.annual_rainfall
        });
      }
      // Flag extremely high rainfall (rainforest)
      if (town.annual_rainfall > 5000) {
        issues.low.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'annual_rainfall',
          issue: 'Very high rainfall (>5,000mm) - verify for tropical rainforest regions',
          severity: 'LOW',
          current_value: town.annual_rainfall
        });
      }
    }
  });

  const rainfallIssues = issues.high.filter(i => i.field === 'annual_rainfall').length +
                         issues.low.filter(i => i.field === 'annual_rainfall').length;
  console.log(`   Found ${rainfallIssues} rainfall issues\n`);

  // Check 4: Sunshine hours validation
  console.log('CHECK 4: Sunshine hours validation...');
  towns.forEach(town => {
    if (town.sunshine_hours === null) {
      issues.low.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'sunshine_hours',
        issue: 'Missing sunshine hours data',
        severity: 'LOW',
        current_value: null
      });
    } else {
      // Validate reasonable range (500 to 4,000 hours/year)
      // Max possible is ~4,380 hours (12 hours * 365 days)
      if (town.sunshine_hours < 0 || town.sunshine_hours > 4380) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'sunshine_hours',
          issue: 'Sunshine hours outside possible range (0-4,380 hours/year)',
          severity: 'HIGH',
          current_value: town.sunshine_hours
        });
      }
      // Flag very low sunshine (polar/very cloudy)
      if (town.sunshine_hours < 1000) {
        issues.low.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'sunshine_hours',
          issue: 'Very low sunshine (<1,000 hours/year) - verify for polar/cloudy regions',
          severity: 'LOW',
          current_value: town.sunshine_hours
        });
      }
    }
  });

  const sunshineIssues = issues.high.filter(i => i.field === 'sunshine_hours').length +
                         issues.low.filter(i => i.field === 'sunshine_hours').length;
  console.log(`   Found ${sunshineIssues} sunshine hours issues\n`);

  // Check 5: Climate descriptors validation
  console.log('CHECK 5: Climate descriptors validation...');
  // Updated 2025-09-30: Added expanded descriptive values
  const validSummerClimate = ['hot', 'warm', 'mild', 'cool', 'cold', null];
  const validWinterClimate = ['hot', 'warm', 'mild', 'cool', 'cold', null];
  const validHumidity = ['dry', 'balanced', 'humid', null];
  const validSunshine = ['low', 'less_sunny', 'balanced', 'high', 'often_sunny', null];
  const validPrecipitation = ['low', 'mostly_dry', 'balanced', 'high', 'less_dry', null];
  const validSeasonal = ['low', 'minimal', 'moderate', 'distinct_seasons', 'high', 'extreme', null];

  towns.forEach(town => {
    if (town.summer_climate_actual && !validSummerClimate.includes(town.summer_climate_actual)) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'summer_climate_actual',
        issue: `Invalid summer climate value: "${town.summer_climate_actual}"`,
        severity: 'MEDIUM',
        current_value: town.summer_climate_actual,
        expected: validSummerClimate.filter(v => v !== null).join(', ')
      });
    }

    if (town.winter_climate_actual && !validWinterClimate.includes(town.winter_climate_actual)) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'winter_climate_actual',
        issue: `Invalid winter climate value: "${town.winter_climate_actual}"`,
        severity: 'MEDIUM',
        current_value: town.winter_climate_actual,
        expected: validWinterClimate.filter(v => v !== null).join(', ')
      });
    }

    if (town.humidity_level_actual && !validHumidity.includes(town.humidity_level_actual)) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'humidity_level_actual',
        issue: `Invalid humidity level: "${town.humidity_level_actual}"`,
        severity: 'MEDIUM',
        current_value: town.humidity_level_actual,
        expected: validHumidity.filter(v => v !== null).join(', ')
      });
    }

    if (town.sunshine_level_actual && !validSunshine.includes(town.sunshine_level_actual)) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'sunshine_level_actual',
        issue: `Invalid sunshine level: "${town.sunshine_level_actual}"`,
        severity: 'MEDIUM',
        current_value: town.sunshine_level_actual,
        expected: validSunshine.filter(v => v !== null).join(', ')
      });
    }

    if (town.precipitation_level_actual && !validPrecipitation.includes(town.precipitation_level_actual)) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'precipitation_level_actual',
        issue: `Invalid precipitation level: "${town.precipitation_level_actual}"`,
        severity: 'MEDIUM',
        current_value: town.precipitation_level_actual,
        expected: validPrecipitation.filter(v => v !== null).join(', ')
      });
    }

    if (town.seasonal_variation_actual && !validSeasonal.includes(town.seasonal_variation_actual)) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'seasonal_variation_actual',
        issue: `Invalid seasonal variation: "${town.seasonal_variation_actual}"`,
        severity: 'MEDIUM',
        current_value: town.seasonal_variation_actual,
        expected: validSeasonal.filter(v => v !== null).join(', ')
      });
    }
  });

  const descriptorIssues = issues.medium.filter(i =>
    i.field.includes('_actual') && i.field.includes('climate')
  ).length;
  console.log(`   Found ${descriptorIssues} climate descriptor issues\n`);

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PHASE 2 SUMMARY:\n');
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
    phase: 2,
    phase_name: 'Climate Data',
    columns_checked: [
      'climate', 'avg_temp_summer', 'avg_temp_winter', 'annual_rainfall', 'sunshine_hours',
      'summer_climate_actual', 'winter_climate_actual', 'humidity_level_actual',
      'sunshine_level_actual', 'precipitation_level_actual', 'seasonal_variation_actual'
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
    'database-utilities/audit-phase2-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('✅ Phase 2 report saved to: database-utilities/audit-phase2-report.json\n');

  return report;
}

phase2Audit().catch(console.error);