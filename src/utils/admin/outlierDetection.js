// Outlier Detection & Data Normalization
// Purpose: Catch impossible values, AI hallucinations, data corruption
// Philosophy: Towns change, but physics doesn't - some values are IMPOSSIBLE

/**
 * HARD LIMITS - Values that violate physics/reality
 * If these fail, it's corruption or AI fuckup, NOT a real change
 */
const HARD_LIMITS = {
  // Quality scores MUST be 1-10
  quality_of_life: { min: 1, max: 10, type: 'score' },
  healthcare_score: { min: 1, max: 10, type: 'score' },
  safety_score: { min: 1, max: 10, type: 'score' },
  walkability_score: { min: 1, max: 10, type: 'score' },
  public_transport_score: { min: 1, max: 10, type: 'score' },

  // Population cannot be negative or exceed 50M for a town
  population: { min: 1, max: 50000000, type: 'count' },

  // Costs (monthly rent in USD)
  'rent_cost_$': { min: 50, max: 20000, type: 'currency' }, // $50-$20k/month is reasonable range
  cost_index: { min: 10, max: 500, type: 'index' }, // 10% to 500% of global average

  // Temperature (Celsius) - Earth's habitable range
  avg_temp_summer: { min: -20, max: 55, type: 'temperature' },
  avg_temp_winter: { min: -60, max: 45, type: 'temperature' },

  // Rainfall (mm/year)
  annual_rainfall: { min: 0, max: 15000, type: 'precipitation' }, // 0-15000mm covers all Earth

  // Sunshine hours (max 4383 hours/year = 12 hours/day avg)
  sunshine_hours: { min: 0, max: 4383, type: 'hours' },

  // Humidity (percentage)
  humidity_level_actual: { min: 0, max: 100, type: 'percentage' },

  // Internet speed (Mbps) - 0 to 10000 is reasonable
  internet_speed_mbps: { min: 0, max: 10000, type: 'bandwidth' },

  // Distance to ocean (km) - max 2500km (center of Eurasia)
  distance_to_ocean_km: { min: 0, max: 2500, type: 'distance' },

  // Elevation (meters) - Dead Sea (-430m) to La Rinconada (5100m)
  elevation_meters: { min: -500, max: 6000, type: 'elevation' }
};

/**
 * STATISTICAL BENCHMARKS - Expected ranges based on global data
 * Values outside these are POSSIBLE but suspicious (need review)
 */
const STATISTICAL_BENCHMARKS = {
  // Most towns: quality 4-8, extremes 1-3 or 9-10 are rare
  quality_of_life: { typical: [4, 8], rare: [1, 3, 9, 10] },
  healthcare_score: { typical: [4, 8], rare: [1, 3, 9, 10] },
  safety_score: { typical: [4, 8], rare: [1, 3, 9, 10] },

  // Most towns: $300-$3000 rent
  'rent_cost_$': { typical: [300, 3000], outlier: [50, 200, 5000, 20000] },

  // Most towns: 5k-500k population
  population: { typical: [5000, 500000], outlier: [0, 1000, 1000000, 50000000] }
};

/**
 * Check if value violates hard limits (impossible/corrupt)
 */
export function checkHardLimits(fieldName, value) {
  const limit = HARD_LIMITS[fieldName];
  if (!limit) return { valid: true }; // No hard limit defined

  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return {
      valid: false,
      violation: 'NOT_A_NUMBER',
      message: `${fieldName} must be a number, got: ${value}`
    };
  }

  if (numValue < limit.min || numValue > limit.max) {
    return {
      valid: false,
      violation: 'OUT_OF_BOUNDS',
      message: `${fieldName} = ${numValue} violates ${limit.type} limits [${limit.min}, ${limit.max}]`,
      expectedRange: [limit.min, limit.max],
      actualValue: numValue
    };
  }

  return { valid: true };
}

/**
 * Check if value is statistically suspicious (outlier)
 */
export function checkStatisticalOutlier(fieldName, value) {
  const benchmark = STATISTICAL_BENCHMARKS[fieldName];
  if (!benchmark) return { isOutlier: false };

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return { isOutlier: false };

  const [typicalMin, typicalMax] = benchmark.typical;

  // Within typical range = normal
  if (numValue >= typicalMin && numValue <= typicalMax) {
    return { isOutlier: false, category: 'typical' };
  }

  // Check if in rare/outlier zone
  if (benchmark.rare && benchmark.rare.includes(numValue)) {
    return {
      isOutlier: true,
      severity: 'moderate',
      category: 'rare_but_possible',
      message: `${fieldName} = ${numValue} is rare but possible (typical range: ${typicalMin}-${typicalMax})`
    };
  }

  if (benchmark.outlier) {
    const inOutlierRange = benchmark.outlier.some(range => {
      if (Array.isArray(range)) {
        return numValue >= range[0] && numValue <= range[1];
      }
      return numValue === range;
    });

    if (inOutlierRange) {
      return {
        isOutlier: true,
        severity: 'extreme',
        category: 'statistical_outlier',
        message: `${fieldName} = ${numValue} is an extreme outlier (typical: ${typicalMin}-${typicalMax})`
      };
    }
  }

  // Outside all defined ranges = very suspicious
  return {
    isOutlier: true,
    severity: 'extreme',
    category: 'unknown_outlier',
    message: `${fieldName} = ${numValue} is outside all expected ranges`
  };
}

/**
 * Validate town data before saving
 * Returns: { valid: boolean, errors: [], warnings: [] }
 */
export function validateTownData(townData) {
  const errors = [];
  const warnings = [];

  Object.keys(townData).forEach(fieldName => {
    const value = townData[fieldName];
    if (value === null || value === undefined || value === '') return;

    // Check hard limits first
    const hardCheck = checkHardLimits(fieldName, value);
    if (!hardCheck.valid) {
      errors.push({
        field: fieldName,
        value,
        type: hardCheck.violation,
        message: hardCheck.message,
        severity: 'error'
      });
    }

    // Check statistical outliers
    const outlierCheck = checkStatisticalOutlier(fieldName, value);
    if (outlierCheck.isOutlier) {
      const issue = {
        field: fieldName,
        value,
        type: outlierCheck.category,
        message: outlierCheck.message,
        severity: outlierCheck.severity
      };

      if (outlierCheck.severity === 'extreme') {
        warnings.push({ ...issue, requiresReview: true });
      } else {
        warnings.push(issue);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    requiresReview: warnings.some(w => w.requiresReview)
  };
}

/**
 * Detect if a change from oldValue to newValue is suspicious
 */
export function detectSuspiciousChange(fieldName, oldValue, newValue) {
  if (oldValue === newValue) return { suspicious: false };

  const oldNum = parseFloat(oldValue);
  const newNum = parseFloat(newValue);

  if (isNaN(oldNum) || isNaN(newNum)) {
    return { suspicious: false }; // Can't analyze non-numeric
  }

  // Check if new value violates hard limits
  const hardCheck = checkHardLimits(fieldName, newValue);
  if (!hardCheck.valid) {
    return {
      suspicious: true,
      severity: 'critical',
      reason: 'HARD_LIMIT_VIOLATION',
      message: hardCheck.message
    };
  }

  // Calculate percentage change
  const change = newNum - oldNum;
  const pctChange = oldNum !== 0 ? Math.abs((change / oldNum) * 100) : 100;

  // Define suspicious thresholds per field type
  const limit = HARD_LIMITS[fieldName];
  if (!limit) return { suspicious: false };

  let threshold;
  switch (limit.type) {
    case 'score': // Scores 1-10: change of 3+ is suspicious
      threshold = Math.abs(change) >= 3;
      break;
    case 'currency': // Costs: 50%+ change is suspicious
      threshold = pctChange >= 50;
      break;
    case 'index': // Indexes: 30%+ change is suspicious
      threshold = pctChange >= 30;
      break;
    case 'temperature': // Temperature: 20+ degree change is suspicious
      threshold = Math.abs(change) >= 20;
      break;
    case 'count': // Population: 100%+ change is suspicious (doubled/halved)
      threshold = pctChange >= 100;
      break;
    default:
      return { suspicious: false };
  }

  if (threshold) {
    return {
      suspicious: true,
      severity: pctChange >= 100 || Math.abs(change) >= 5 ? 'extreme' : 'moderate',
      reason: 'LARGE_CHANGE',
      message: `${fieldName} changed from ${oldValue} to ${newValue} (${pctChange.toFixed(1)}% change)`,
      oldValue,
      newValue,
      changePercent: pctChange
    };
  }

  return { suspicious: false };
}

/**
 * Normalize town data - fix common issues
 * Returns: { normalized: data, changes: [] }
 */
export function normalizeTownData(townData) {
  const normalized = { ...townData };
  const changes = [];

  Object.keys(HARD_LIMITS).forEach(fieldName => {
    const value = normalized[fieldName];
    if (value === null || value === undefined) return;

    const limit = HARD_LIMITS[fieldName];
    const numValue = parseFloat(value);

    if (isNaN(numValue)) return;

    // Clamp to hard limits
    if (numValue < limit.min) {
      normalized[fieldName] = limit.min;
      changes.push({
        field: fieldName,
        old: numValue,
        new: limit.min,
        reason: `Value below minimum (${limit.min})`
      });
    } else if (numValue > limit.max) {
      normalized[fieldName] = limit.max;
      changes.push({
        field: fieldName,
        old: numValue,
        new: limit.max,
        reason: `Value above maximum (${limit.max})`
      });
    }
  });

  return { normalized, changes };
}

export default {
  checkHardLimits,
  checkStatisticalOutlier,
  validateTownData,
  detectSuspiciousChange,
  normalizeTownData,
  HARD_LIMITS,
  STATISTICAL_BENCHMARKS
};
