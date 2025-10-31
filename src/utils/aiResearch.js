/**
 * AI-Assisted Research Utility
 *
 * Intelligently researches town data by:
 * 1. Learning patterns from similar towns in YOUR database
 * 2. Using Claude API to research with learned context (via secure Edge Function)
 * 3. Returning recommendations with reasoning
 *
 * SECURITY: All API calls go through Supabase Edge Function (server-side)
 * Never exposes API keys to client
 */

import supabase from './supabaseClient';

/**
 * Main AI research function with database pattern learning
 *
 * Calls Supabase Edge Function for secure server-side API access
 *
 * @param {Object} params - Research parameters
 * @param {string} params.townName - Town name
 * @param {string} params.subdivisionCode - State/province/subdivision
 * @param {string} params.country - Country name
 * @param {string} params.townId - Town ID (to exclude from pattern search)
 * @param {string} params.fieldName - Database field name
 * @param {string} params.searchQuery - Human-readable search query
 * @param {string} params.expectedFormat - Expected data format
 * @param {string} params.currentValue - Current value in database (if any)
 * @returns {Promise<Object>} { recommendedValue, reasoning, confidence, error }
 */
export async function researchFieldWithContext({
  townName,
  subdivisionCode,
  country,
  townId,
  fieldName,
  searchQuery,
  expectedFormat,
  currentValue
}) {
  try {
    console.log(`🔍 Calling AI Research Edge Function for ${fieldName}...`);

    // Get current user session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated. Please log in.');
    }

    // Call Supabase Edge Function (server-side secure API call)
    const { data, error } = await supabase.functions.invoke('ai-research-field', {
      body: {
        townName,
        subdivisionCode,
        country,
        townId,
        fieldName,
        searchQuery,
        expectedFormat,
        currentValue
      }
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(error.message || 'Failed to call AI research function');
    }

    console.log('✅ AI Research completed:', data);

    return {
      recommendedValue: data.recommendedValue,
      reasoning: data.reasoning,
      confidence: data.confidence || 'medium',
      changes: data.changes || { added: [], removed: [], kept: [] },
      patternCount: data.patternCount || 0,
      error: data.error || null
    };

  } catch (error) {
    console.error('AI Research Error:', error);

    return {
      recommendedValue: null,
      reasoning: null,
      confidence: null,
      changes: null,
      patternCount: 0,
      error: error.message || 'Failed to research field'
    };
  }
}

/**
 * Validate Anthropic API key is configured
 * @returns {boolean} True (API key is configured server-side in Supabase Edge Function)
 */
export function hasAnthropicAPIKey() {
  // API key is now configured server-side in Supabase Edge Function
  // No need to check client-side environment variables
  return true;
}

/**
 * Get estimated token count for a research operation
 * @param {string} searchQuery - Search query
 * @param {number} patternCount - Number of similar towns in pattern
 * @returns {number} Estimated tokens
 */
export function estimateTokens(searchQuery, patternCount = 5) {
  // Rough estimate:
  // - Base prompt: ~400 tokens
  // - Each pattern example: ~50 tokens
  // - Search query: ~20-100 tokens
  // - Response: ~200 tokens
  return 400 + (patternCount * 50) + searchQuery.length / 4 + 200;
}

/**
 * Get estimated cost for research operation
 * @param {number} estimatedTokens - Token count
 * @returns {number} Cost in USD
 */
export function estimateCost(estimatedTokens) {
  // Claude Haiku pricing: $0.25 per 1M input tokens, $1.25 per 1M output tokens
  // Average split: 70% input, 30% output
  const inputCost = (estimatedTokens * 0.7) * 0.25 / 1000000;
  const outputCost = (estimatedTokens * 0.3) * 1.25 / 1000000;
  return inputCost + outputCost;
}
