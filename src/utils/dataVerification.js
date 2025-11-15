/**
 * DATA VERIFICATION UTILITIES
 *
 * Detects outliers, convention violations, and data quality issues
 * across all towns in the database.
 *
 * Created: 2025-10-28
 */

// Field definitions with expected ranges and validation rules
const FIELD_CONVENTIONS = {
  // Temperature fields (Celsius)
  avg_temp_summer: { min: -10, max: 50, type: 'temperature', unit: '°C' },
  avg_temp_winter: { min: -40, max: 40, type: 'temperature', unit: '°C' },
  avg_temp_spring: { min: -20, max: 40, type: 'temperature', unit: '°C' },
  avg_temp_fall: { min: -20, max: 40, type: 'temperature', unit: '°C' },

  // Score fields (0-10 scale)
  healthcare_score: { min: 0, max: 10, type: 'score', integer: true },
  safety_score: { min: 0, max: 10, type: 'score', integer: true },
  walkability: { min: 0, max: 10, type: 'score', integer: true },
  expat_rating: { min: 0, max: 10, type: 'score', integer: true },

  // English proficiency (0-100 percentage scale, separate from 0-10 scores)
  english_proficiency: { min: 0, max: 100, type: 'percentage', integer: true },

  // Cost fields (USD)
  cost_of_living_usd: { min: 200, max: 10000, type: 'cost', unit: 'USD' },
  typical_monthly_living_cost: { min: 200, max: 10000, type: 'cost', unit: 'USD' },
  rent_1bed: { min: 100, max: 5000, type: 'cost', unit: 'USD' },
  rent_2bed: { min: 150, max: 8000, type: 'cost', unit: 'USD' },

  // Distance fields (km)
  distance_to_ocean_km: { min: 0, max: 5000, type: 'distance', unit: 'km' },
  airport_distance: { min: 0, max: 500, type: 'distance', unit: 'km' },

  // Weather fields
  annual_rainfall: { min: 0, max: 12000, type: 'rainfall', unit: 'mm' },
  sunshine_hours: { min: 800, max: 4000, type: 'sunshine', unit: 'hours/year' },
  humidity: { min: 0, max: 100, type: 'percentage', unit: '%' },

  // Geographic fields
  elevation_meters: { min: -100, max: 5000, type: 'elevation', unit: 'm' },
  latitude: { min: -90, max: 90, type: 'coordinate' },
  longitude: { min: -180, max: 180, type: 'coordinate' },
  population: { min: 0, max: 50000000, type: 'population' }
};

/**
 * Fields required for data quality validation
 *
 * NOTE: This is DIFFERENT from CRITICAL_FIELDS in bulkUpdateTown.js
 * - bulkUpdateTown CRITICAL_FIELDS (14 fields): Algorithm-blocking fields for Smart Update
 * - dataVerification VALIDATION_REQUIRED_FIELDS (6 fields): Data quality check
 *
 * Renamed November 14, 2025 to avoid confusion
 */
const VALIDATION_REQUIRED_FIELDS = [
  'town_name', 'country', 'region',
  'cost_of_living_usd', 'healthcare_score', 'safety_score'
];

// Issue severity levels
const SEVERITY = {
  CRITICAL: 'critical',   // Impossible values, breaks conventions
  HIGH: 'high',           // Severe outliers (>3 std dev)
  MEDIUM: 'medium',       // Moderate outliers (2-3 std dev)
  LOW: 'low'              // Minor inconsistencies
};

// Issue types
const ISSUE_TYPE = {
  IMPOSSIBLE: 'impossible',           // Physically impossible value
  OUT_OF_RANGE: 'out_of_range',      // Outside expected range
  CONVENTION: 'convention',           // Violates data convention
  OUTLIER_EXTREME: 'outlier_extreme', // >3 standard deviations
  OUTLIER_MODERATE: 'outlier_moderate', // 2-3 standard deviations
  RELATIONAL: 'relational',           // Inconsistent with related fields
  MISSING_CRITICAL: 'missing_critical', // Missing critical field
  SUSPICIOUS: 'suspicious'            // Suspicious pattern
};

/**
 * Calculate statistics for a numeric field across all towns
 */
function calculateFieldStats(towns, fieldName) {
  const values = towns
    .map(t => t[fieldName])
    .filter(v => v !== null && v !== undefined && v !== '' && !isNaN(v))
    .map(v => Number(v));

  if (values.length === 0) {
    return { count: 0, min: null, max: null, mean: null, median: null, stdDev: null };
  }

  // Sort for median
  const sorted = [...values].sort((a, b) => a - b);

  // Calculate mean
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

  // Calculate median
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  // Calculate standard deviation
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2))
  };
}

/**
 * Detect if a value is a statistical outlier
 */
function isStatisticalOutlier(value, stats) {
  if (!stats.stdDev || stats.stdDev === 0) return null;

  const zScore = Math.abs((value - stats.mean) / stats.stdDev);

  if (zScore > 3) return { severity: SEVERITY.HIGH, zScore, type: ISSUE_TYPE.OUTLIER_EXTREME };
  if (zScore > 2) return { severity: SEVERITY.MEDIUM, zScore, type: ISSUE_TYPE.OUTLIER_MODERATE };

  return null;
}

/**
 * Validate a value against field conventions
 */
function validateConvention(fieldName, value) {
  const convention = FIELD_CONVENTIONS[fieldName];
  if (!convention || value === null || value === undefined || value === '') return null;

  const numValue = Number(value);
  if (isNaN(numValue)) return null;

  const issues = [];

  // Check if value is outside possible range
  if (numValue < convention.min) {
    issues.push({
      type: ISSUE_TYPE.OUT_OF_RANGE,
      severity: numValue < convention.min * 0.5 ? SEVERITY.CRITICAL : SEVERITY.HIGH,
      message: `Value ${numValue}${convention.unit || ''} is below minimum (${convention.min}${convention.unit || ''})`
    });
  }

  if (numValue > convention.max) {
    issues.push({
      type: ISSUE_TYPE.OUT_OF_RANGE,
      severity: numValue > convention.max * 2 ? SEVERITY.CRITICAL : SEVERITY.HIGH,
      message: `Value ${numValue}${convention.unit || ''} exceeds maximum (${convention.max}${convention.unit || ''})`
    });
  }

  // Check if score should be integer
  if (convention.integer && !Number.isInteger(numValue)) {
    issues.push({
      type: ISSUE_TYPE.CONVENTION,
      severity: SEVERITY.MEDIUM,
      message: `Score should be integer, got ${numValue}`
    });
  }

  return issues.length > 0 ? issues : null;
}

/**
 * Check relational consistency between fields
 */
function checkRelationalConsistency(town) {
  const issues = [];

  // Winter warmer than summer
  if (town.avg_temp_winter && town.avg_temp_summer &&
      town.avg_temp_winter > town.avg_temp_summer) {
    issues.push({
      type: ISSUE_TYPE.RELATIONAL,
      severity: SEVERITY.CRITICAL,
      field: 'avg_temp_winter',
      message: `Winter temp (${town.avg_temp_winter}°C) higher than summer (${town.avg_temp_summer}°C)`,
      relatedFields: ['avg_temp_summer', 'avg_temp_winter']
    });
  }

  // Coastal without ocean
  if (town.geographic_features_actual?.includes('coastal')) {
    if (!town.water_bodies ||
        (Array.isArray(town.water_bodies) && !town.water_bodies.some(w => w.toLowerCase().includes('ocean') || w.toLowerCase().includes('sea')))) {
      issues.push({
        type: ISSUE_TYPE.RELATIONAL,
        severity: SEVERITY.HIGH,
        field: 'geographic_features_actual',
        message: 'Marked as coastal but no ocean/sea in water_bodies',
        relatedFields: ['geographic_features_actual', 'water_bodies']
      });
    }
  }

  // High elevation without mountain feature
  if (town.elevation_meters && town.elevation_meters > 2000) {
    if (!town.geographic_features_actual?.includes('mountain')) {
      issues.push({
        type: ISSUE_TYPE.RELATIONAL,
        severity: SEVERITY.MEDIUM,
        field: 'elevation_meters',
        message: `High elevation (${town.elevation_meters}m) but not marked as mountain`,
        relatedFields: ['elevation_meters', 'geographic_features_actual']
      });
    }
  }

  // Island without coastal
  if (town.geographic_features_actual?.includes('island')) {
    if (!town.geographic_features_actual.includes('coastal')) {
      issues.push({
        type: ISSUE_TYPE.RELATIONAL,
        severity: SEVERITY.HIGH,
        field: 'geographic_features_actual',
        message: 'Marked as island but not marked as coastal',
        relatedFields: ['geographic_features_actual']
      });
    }
  }

  return issues;
}

/**
 * Check for suspicious patterns
 */
function checkSuspiciousPatterns(town, fieldName, value) {
  const issues = [];

  if (value === null || value === undefined || value === '') return issues;

  const numValue = Number(value);
  if (isNaN(numValue)) return issues;

  // Suspiciously round numbers for costs
  if (FIELD_CONVENTIONS[fieldName]?.type === 'cost') {
    if (numValue % 1000 === 0 && numValue >= 1000) {
      issues.push({
        type: ISSUE_TYPE.SUSPICIOUS,
        severity: SEVERITY.LOW,
        message: `Suspiciously round number: ${numValue} (might be estimate)`
      });
    }
  }

  // Exact same value as another field (possible copy/paste error)
  if (fieldName === 'rent_1bed' && town.rent_2bed && numValue === town.rent_2bed) {
    issues.push({
      type: ISSUE_TYPE.SUSPICIOUS,
      severity: SEVERITY.MEDIUM,
      message: `1BR and 2BR rent are identical (${numValue}) - likely error`,
      relatedFields: ['rent_1bed', 'rent_2bed']
    });
  }

  return issues;
}

/**
 * Main function: Analyze all towns and return comprehensive issue report
 */
export function analyzeDataQuality(towns) {
  const report = {
    summary: {
      totalTowns: towns.length,
      townsWithIssues: 0,
      totalIssues: 0,
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      byType: {}
    },
    fieldStats: {},
    townIssues: [], // Array of { townId, townName, issues: [] }
    fieldIssues: {} // Map of fieldName -> { stats, outliers: [] }
  };

  // Calculate statistics for all numeric fields
  const numericFields = Object.keys(FIELD_CONVENTIONS);
  numericFields.forEach(field => {
    const stats = calculateFieldStats(towns, field);
    report.fieldStats[field] = stats;
    report.fieldIssues[field] = {
      stats,
      outliers: [],
      conventionViolations: []
    };
  });

  // Analyze each town
  towns.forEach(town => {
    const townReport = {
      townId: town.id,
      townName: town.town_name,
      country: town.country,
      region: town.region,
      issues: []
    };

    // Check each numeric field
    numericFields.forEach(field => {
      const value = town[field];
      if (value === null || value === undefined || value === '') return;

      const numValue = Number(value);
      if (isNaN(numValue)) return;

      // Convention validation
      const conventionIssues = validateConvention(field, value);
      if (conventionIssues) {
        conventionIssues.forEach(issue => {
          townReport.issues.push({
            field,
            value: numValue,
            ...issue
          });
          report.fieldIssues[field].conventionViolations.push({
            townId: town.id,
            townName: town.town_name,
            value: numValue,
            ...issue
          });
        });
      }

      // Statistical outlier detection
      const stats = report.fieldStats[field];
      const outlierResult = isStatisticalOutlier(numValue, stats);
      if (outlierResult) {
        townReport.issues.push({
          field,
          value: numValue,
          ...outlierResult,
          message: `Statistical outlier: ${numValue}${FIELD_CONVENTIONS[field].unit || ''} (mean: ${stats.mean}, σ: ${stats.stdDev})`
        });
        report.fieldIssues[field].outliers.push({
          townId: town.id,
          townName: town.town_name,
          value: numValue,
          zScore: outlierResult.zScore
        });
      }

      // Suspicious patterns
      const suspiciousIssues = checkSuspiciousPatterns(town, field, value);
      suspiciousIssues.forEach(issue => {
        townReport.issues.push({
          field,
          value: numValue,
          ...issue
        });
      });
    });

    // Check relational consistency
    const relationalIssues = checkRelationalConsistency(town);
    townReport.issues.push(...relationalIssues);

    // Check for missing critical fields
    VALIDATION_REQUIRED_FIELDS.forEach(field => {
      if (!town[field] || town[field] === '' || town[field] === 'NULL') {
        townReport.issues.push({
          field,
          type: ISSUE_TYPE.MISSING_CRITICAL,
          severity: SEVERITY.CRITICAL,
          message: `Missing critical field: ${field}`
        });
      }
    });

    // Update summary counts
    if (townReport.issues.length > 0) {
      report.summary.townsWithIssues++;
      report.summary.totalIssues += townReport.issues.length;

      townReport.issues.forEach(issue => {
        report.summary.bySeverity[issue.severity]++;
        report.summary.byType[issue.type] = (report.summary.byType[issue.type] || 0) + 1;
      });

      report.townIssues.push(townReport);
    }
  });

  // Sort towns by severity priority (critical > high > medium > low), then by total count
  report.townIssues.sort((a, b) => {
    // Count issues by severity for each town
    const countSeverity = (town, severity) =>
      town.issues.filter(i => i.severity === severity).length;

    const aCritical = countSeverity(a, SEVERITY.CRITICAL);
    const bCritical = countSeverity(b, SEVERITY.CRITICAL);
    if (aCritical !== bCritical) return bCritical - aCritical;

    const aHigh = countSeverity(a, SEVERITY.HIGH);
    const bHigh = countSeverity(b, SEVERITY.HIGH);
    if (aHigh !== bHigh) return bHigh - aHigh;

    const aMedium = countSeverity(a, SEVERITY.MEDIUM);
    const bMedium = countSeverity(b, SEVERITY.MEDIUM);
    if (aMedium !== bMedium) return bMedium - aMedium;

    const aLow = countSeverity(a, SEVERITY.LOW);
    const bLow = countSeverity(b, SEVERITY.LOW);
    if (aLow !== bLow) return bLow - aLow;

    // Tiebreaker: total issue count
    return b.issues.length - a.issues.length;
  });

  // Debug log top 10 for verification
  console.log('🔴 Top 10 towns after severity sort:');
  report.townIssues.slice(0, 10).forEach((town, idx) => {
    const critical = town.issues.filter(i => i.severity === SEVERITY.CRITICAL).length;
    const high = town.issues.filter(i => i.severity === SEVERITY.HIGH).length;
    const medium = town.issues.filter(i => i.severity === SEVERITY.MEDIUM).length;
    const low = town.issues.filter(i => i.severity === SEVERITY.LOW).length;
    console.log(`  ${idx + 1}. ${town.townName}: ${critical}C, ${high}H, ${medium}M, ${low}L (total: ${town.issues.length})`);
  });

  return report;
}

/**
 * Get top N worst towns by issue count
 */
export function getWorstTowns(report, n = 10) {
  return report.townIssues.slice(0, n);
}

/**
 * Get all critical issues
 */
export function getCriticalIssues(report) {
  const critical = [];
  report.townIssues.forEach(town => {
    town.issues.forEach(issue => {
      if (issue.severity === SEVERITY.CRITICAL) {
        critical.push({
          ...issue,
          townId: town.townId,
          townName: town.townName,
          country: town.country,
          region: town.region
        });
      }
    });
  });
  return critical;
}

/**
 * Get issues by field name
 */
export function getIssuesByField(report, fieldName) {
  const issues = [];
  report.townIssues.forEach(town => {
    town.issues.forEach(issue => {
      if (issue.field === fieldName) {
        issues.push({
          ...issue,
          townId: town.townId,
          townName: town.townName
        });
      }
    });
  });
  return issues.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

export { SEVERITY, ISSUE_TYPE, FIELD_CONVENTIONS, VALIDATION_REQUIRED_FIELDS };
