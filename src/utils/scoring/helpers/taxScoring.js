/**
 * TAX SCORING HELPER
 *
 * Provides comprehensive tax scoring logic for preference matching.
 * Used in both Admin scoring (government quality) and Cost scoring (cost fit).
 *
 * Created: 2025-10-17
 * Purpose: Eliminate duplication between adminScoring.js and costScoring.js
 */

import { parsePreferences } from './preferenceParser.js';

/**
 * Calculate comprehensive tax scoring based on user's tax sensitivity
 *
 * @param {Object} preferences - User's tax sensitivity preferences
 * @param {Object} town - Town tax data
 * @param {number} maxPoints - Maximum points for tax scoring (default: 15)
 * @returns {Object} Score, factors, and tax data availability
 *
 * @example
 * const preferences = {
 *   income_tax_sensitive: true,
 *   property_tax_sensitive: false,
 *   sales_tax_sensitive: true
 * };
 *
 * const town = {
 *   income_tax_rate_pct: 15,     // Excellent!
 *   sales_tax_rate_pct: 20,      // Fair
 *   tax_treaty_us: true          // Bonus!
 * };
 *
 * calculateTaxScore(preferences, town, 15);
 * // Returns: { score: 13, factors: [...], hasTaxData: true }
 */
export function calculateTaxScore(preferences, town, maxPoints = 15) {
  let score = 0;
  const factors = [];

  // Parse preferences to access tax sensitivity flags
  const parsed = parsePreferences(preferences);

  // Get tax data from town
  const taxData = {
    income: town.income_tax_rate_pct,
    property: town.property_tax_rate_pct,
    sales: town.sales_tax_rate_pct
  };

  let totalSensitiveTaxes = 0;
  let taxScoreTotal = 0;

  // Income tax scoring (if user is sensitive)
  if (parsed.cost.incomeTaxSensitive && taxData.income !== null && taxData.income !== undefined) {
    totalSensitiveTaxes++;
    const incomeTaxResult = calculateGradualTaxScore(taxData.income, 'income');
    taxScoreTotal += incomeTaxResult.score;
    factors.push({
      factor: `Income tax ${incomeTaxResult.description} (${taxData.income}%)`,
      score: incomeTaxResult.score
    });
  }

  // Property tax scoring (if user is sensitive)
  if (parsed.cost.propertyTaxSensitive && taxData.property !== null && taxData.property !== undefined) {
    totalSensitiveTaxes++;
    const propertyTaxResult = calculateGradualTaxScore(taxData.property, 'property');
    taxScoreTotal += propertyTaxResult.score;
    factors.push({
      factor: `Property tax ${propertyTaxResult.description} (${taxData.property}%)`,
      score: propertyTaxResult.score
    });
  }

  // Sales tax scoring (if user is sensitive)
  if (parsed.cost.salesTaxSensitive && taxData.sales !== null && taxData.sales !== undefined) {
    totalSensitiveTaxes++;
    const salesTaxResult = calculateGradualTaxScore(taxData.sales, 'sales');
    taxScoreTotal += salesTaxResult.score;
    factors.push({
      factor: `Sales tax ${salesTaxResult.description} (${taxData.sales}%)`,
      score: salesTaxResult.score
    });
  }

  // Calculate proportional score based on sensitive taxes (80% of max points)
  if (totalSensitiveTaxes > 0) {
    const avgTaxScore = taxScoreTotal / totalSensitiveTaxes; // 0-5 scale
    score = (avgTaxScore / 5) * (maxPoints * 0.8); // Convert to 0-12 points (80% of 15)
  }

  // Bonus scoring for tax benefits (20% of max points)
  let bonusPoints = 0;
  const maxBonus = maxPoints * 0.2;

  // Tax treaty bonus
  if (town.tax_treaty_us) {
    bonusPoints += maxBonus * 0.4; // 40% of bonus
    factors.push({
      factor: 'US tax treaty available',
      score: Math.round(maxBonus * 0.4)
    });
  }

  // Tax haven status bonus
  if (town.tax_haven_status) {
    bonusPoints += maxBonus * 0.5; // 50% of bonus
    factors.push({
      factor: 'Recognized tax haven',
      score: Math.round(maxBonus * 0.5)
    });
  }

  // Foreign income not taxed bonus
  if (town.foreign_income_taxed === false) {
    bonusPoints += maxBonus * 0.3; // 30% of bonus
    factors.push({
      factor: 'Foreign income not taxed',
      score: Math.round(maxBonus * 0.3)
    });
  }

  score += bonusPoints;

  // If user has no tax sensitivities, give neutral score (50%)
  if (totalSensitiveTaxes === 0) {
    score = maxPoints * 0.5;
    factors.push({
      factor: 'Tax rates not a priority',
      score: Math.round(maxPoints * 0.5)
    });
  }

  return {
    score: Math.min(Math.round(score), maxPoints),
    factors,
    hasTaxData: totalSensitiveTaxes > 0 ||
                town.tax_treaty_us ||
                town.tax_haven_status ||
                town.foreign_income_taxed !== null
  };
}

/**
 * Calculate gradual tax scoring for a specific tax type
 *
 * Uses different thresholds for income, property, and sales taxes
 *
 * @param {number} taxRate - Tax rate percentage
 * @param {string} taxType - Type of tax ('income', 'property', 'sales')
 * @returns {Object} Score (0-5) and description
 *
 * @example
 * calculateGradualTaxScore(8, 'income');
 * // Returns: { score: 5, description: 'excellent rate' }
 *
 * calculateGradualTaxScore(25, 'income');
 * // Returns: { score: 3, description: 'fair rate' }
 *
 * calculateGradualTaxScore(1.5, 'property');
 * // Returns: { score: 4, description: 'good rate' }
 */
export function calculateGradualTaxScore(taxRate, taxType) {
  if (taxRate === null || taxRate === undefined) {
    return { score: 0, description: 'data unavailable' };
  }

  // Define tax rate thresholds by type
  const thresholds = {
    income: {
      excellent: 10,   // 0-10%
      good: 20,        // 10-20%
      fair: 30,        // 20-30%
      poor: 40         // 30-40%
    },
    property: {
      excellent: 1,    // 0-1%
      good: 2,         // 1-2%
      fair: 3,         // 2-3%
      poor: 4          // 3-4%
    },
    sales: {
      excellent: 10,   // 0-10%
      good: 17,        // 10-17%
      fair: 22,        // 17-22% (includes most EU VAT rates)
      poor: 27         // 22-27%
    }
  };

  const t = thresholds[taxType];

  if (!t) {
    console.warn(`Unknown tax type: ${taxType}`);
    return { score: 0, description: 'unknown type' };
  }

  if (taxRate <= t.excellent) {
    return { score: 5, description: 'excellent rate' };
  } else if (taxRate <= t.good) {
    return { score: 4, description: 'good rate' };
  } else if (taxRate <= t.fair) {
    return { score: 3, description: 'fair rate' };
  } else if (taxRate <= t.poor) {
    return { score: 2, description: 'high rate' };
  } else {
    return { score: 1, description: 'very high rate' };
  }
}

/**
 * Get detailed tax breakdown for transparency
 *
 * @param {Object} preferences - User's tax sensitivity preferences
 * @param {Object} town - Town tax data
 * @returns {Object} Detailed breakdown of all tax components
 */
export function getTaxScoreBreakdown(preferences, town) {
  const parsed = parsePreferences(preferences);

  const breakdown = {
    income: null,
    property: null,
    sales: null,
    bonuses: []
  };

  // Income tax details
  if (parsed.cost.incomeTaxSensitive && town.income_tax_rate_pct !== null) {
    breakdown.income = {
      rate: town.income_tax_rate_pct,
      ...calculateGradualTaxScore(town.income_tax_rate_pct, 'income')
    };
  }

  // Property tax details
  if (parsed.cost.propertyTaxSensitive && town.property_tax_rate_pct !== null) {
    breakdown.property = {
      rate: town.property_tax_rate_pct,
      ...calculateGradualTaxScore(town.property_tax_rate_pct, 'property')
    };
  }

  // Sales tax details
  if (parsed.cost.salesTaxSensitive && town.sales_tax_rate_pct !== null) {
    breakdown.sales = {
      rate: town.sales_tax_rate_pct,
      ...calculateGradualTaxScore(town.sales_tax_rate_pct, 'sales')
    };
  }

  // Tax bonuses
  if (town.tax_treaty_us) {
    breakdown.bonuses.push({ type: 'US Tax Treaty', available: true });
  }
  if (town.tax_haven_status) {
    breakdown.bonuses.push({ type: 'Tax Haven Status', available: true });
  }
  if (town.foreign_income_taxed === false) {
    breakdown.bonuses.push({ type: 'Foreign Income Not Taxed', available: true });
  }

  return breakdown;
}
