/**
 * AI-Assisted Research Utility
 *
 * Intelligently researches town data by:
 * 1. Learning patterns from similar towns in YOUR database
 * 2. Using Claude API directly (client-side with dangerouslyAllowBrowser)
 * 3. Returning recommendations with reasoning
 *
 * Uses Claude Haiku for cost-effective field research ($0.25/million tokens)
 */

import Anthropic from '@anthropic-ai/sdk';
import { supabase } from './supabaseClient';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

/**
 * Query database for similar towns to learn data patterns
 * @param {string} fieldName - Field being researched
 * @param {string} country - Current town's country
 * @param {string} townId - Current town's ID (to exclude)
 * @returns {Promise<Array>} Similar towns with data for this field
 */
async function getSimilarTownsPattern(fieldName, country, townId) {
  try {
    // Strategy 1: Same country with data
    let { data: similarTowns } = await supabase
      .from('towns')
      .select(`id, town_name, country, ${fieldName}`)
      .eq('country', country)
      .not(fieldName, 'is', null)
      .neq('id', townId)
      .limit(5);

    // Strategy 2: If <3 results, expand to all countries
    if (!similarTowns || similarTowns.length < 3) {
      const { data: allTowns } = await supabase
        .from('towns')
        .select(`id, town_name, country, ${fieldName}`)
        .not(fieldName, 'is', null)
        .neq('id', townId)
        .limit(10);

      similarTowns = allTowns || [];
    }

    return similarTowns || [];
  } catch (error) {
    console.error('Error fetching similar towns:', error);
    return [];
  }
}

/**
 * Analyze pattern from similar towns
 * @param {Array} similarTowns - Towns with data
 * @param {string} fieldName - Field name
 * @returns {string} Pattern analysis for AI
 */
function analyzePattern(similarTowns, fieldName) {
  if (!similarTowns || similarTowns.length === 0) {
    return 'No examples found in database. Research freely following Expected Format.';
  }

  const examples = similarTowns
    .filter(t => t[fieldName])
    .map(t => `- ${t.town_name}, ${t.country}: "${t[fieldName]}"`);

  return `Found ${examples.length} examples in our database:
${examples.join('\n')}

IMPORTANT: Study these examples carefully:
- Count of items (if comma-separated)
- Format and structure
- Level of detail/granularity
- Maintain consistency with these patterns`;
}

/**
 * Fetch field definition from database template row
 * @param {string} fieldName - Field name
 * @returns {Promise<Object|null>} Field definition with audit_question, search_terms, etc. or null
 */
async function getFieldDefinition(fieldName) {
  try {
    const { data, error } = await supabase
      .from('towns')
      .select('audit_data')
      .eq('id', 'ffffffff-ffff-ffff-ffff-ffffffffffff')
      .maybeSingle(); // Use maybeSingle() instead of single() - doesn't throw on 0 rows

    if (error) {
      console.warn(`Template row query error:`, error);
      return null;
    }

    if (!data) {
      console.warn(`Template row doesn't exist yet - field definitions not available`);
      return null;
    }

    const fieldDef = data?.audit_data?.field_definitions?.[fieldName];

    if (!fieldDef || !fieldDef.audit_question) {
      console.warn(`No field definition for "${fieldName}" in template row`);
      return null;
    }

    return fieldDef;
  } catch (error) {
    console.warn(`Error fetching field definition for ${fieldName}:`, error);
    return null;
  }
}

/**
 * Main AI research function - USES FIELD DEFINITIONS FROM DATABASE
 *
 * This is the SINGLE SOURCE OF TRUTH for data normalization.
 * Fetches field-specific prompts from database template row.
 *
 * @param {string} townId - Town ID (to exclude from pattern search)
 * @param {string} fieldName - Database field name
 * @param {Object} townData - Full town object with all fields
 * @param {Object} options - Optional parameters
 * @returns {Promise<Object>} { success, suggestedValue, confidence, reasoning, error }
 */
export async function researchFieldWithContext(townId, fieldName, townData, options = {}) {
  try {
    console.log(`🔍 Researching ${fieldName} for ${townData.town_name}, ${townData.country}...`);

    // Step 1: Try to fetch field definition from database
    const fieldDef = await getFieldDefinition(fieldName);

    if (fieldDef) {
      console.log(`📋 Using field definition:`, {
        audit_question: fieldDef.audit_question,
        search_terms: fieldDef.search_terms
      });
    } else {
      console.log(`⚠️ No field definition available - using generic prompt`);
    }

    // Step 2: Get similar towns to learn pattern
    const similarTowns = await getSimilarTownsPattern(fieldName, townData.country, townId);
    const pattern = analyzePattern(similarTowns, fieldName);

    console.log(`Found ${similarTowns.length} similar towns for pattern learning`);

    // Step 3: Build prompt - use field definition if available, otherwise generic
    const task = fieldDef?.audit_question ||
      `Research and provide accurate data for the field "${fieldName}". Follow the format/pattern from similar towns below.`;

    const searchContext = fieldDef?.search_terms ||
      `Research ${fieldName} for ${townData.town_name}, ${townData.country}`;

    const prompt = `You are a data normalization expert for retirement town database.

TOWN INFORMATION:
- Name: ${townData.town_name}
- Country: ${townData.country}
- State/Region: ${townData.state_code || 'N/A'}

FIELD: ${fieldName}
Current value: ${townData[fieldName] || 'NULL/Empty'}

YOUR TASK:
${task}

PATTERN ANALYSIS FROM SIMILAR TOWNS:
${pattern}

SEARCH CONTEXT:
${searchContext}

NORMALIZATION RULES:
1. Follow the exact format/pattern from similar towns
2. Maintain data consistency across all towns
3. If current value already matches pattern, keep it unchanged
4. For empty/NULL values, research and provide normalized data
5. Rate confidence: high (verified data), limited (inferred), low (uncertain)

SPECIAL FIELD HANDLING:
- image_url_1: Real Unsplash URL format: https://images.unsplash.com/photo-[id]?w=1200
- Numeric fields: Return number only, no units
- Text fields: Concise, factual, consistent formatting
- NULL: Only if data cannot be reliably determined

RESPONSE FORMAT (JSON only):
{
  "suggestedValue": "normalized value or null",
  "reasoning": "why this value (reference pattern/research)",
  "confidence": "high/limited/low"
}`;

    // Step 4: Call Anthropic API directly
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Step 5: Parse response
    const responseText = response.content[0].text;
    console.log('Raw AI response:', responseText);

    // Extract JSON from response (handle markdown code blocks)
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response did not contain valid JSON');
    }

    const result = JSON.parse(jsonMatch[0]);

    console.log('✅ AI Research completed:', result);

    return {
      success: true,
      suggestedValue: result.suggestedValue,
      confidence: result.confidence || 'limited',
      reasoning: result.reasoning || 'AI-generated suggestion',
      patternCount: similarTowns.length,
      fieldDefinition: fieldDef.audit_question // Include for transparency
    };

  } catch (error) {
    console.error('AI Research Error:', error);

    return {
      success: false,
      suggestedValue: null,
      confidence: 'unknown',
      reasoning: error.message,
      error: error.message || 'Failed to research field'
    };
  }
}

/**
 * Validate Anthropic API key is configured
 * @returns {boolean} True if API key is available
 */
export function hasAnthropicAPIKey() {
  return !!import.meta.env.VITE_ANTHROPIC_API_KEY;
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
