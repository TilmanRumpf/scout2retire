/**
 * AI-Assisted Research Utility
 *
 * Intelligently researches town data by:
 * 1. Learning patterns from similar towns in YOUR database
 * 2. Using Claude API to research with learned context
 * 3. Returning recommendations with reasoning
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
      .select(`id, name, country, ${fieldName}`)
      .eq('country', country)
      .not(fieldName, 'is', null)
      .neq('id', townId)
      .limit(5);

    // Strategy 2: If <3 results, expand to all countries
    if (!similarTowns || similarTowns.length < 3) {
      const { data: allTowns } = await supabase
        .from('towns')
        .select(`id, name, country, ${fieldName}`)
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
    .map(t => `- ${t.name}, ${t.country}: "${t[fieldName]}"`);

  return `Found ${examples.length} examples in our database:
${examples.join('\n')}

IMPORTANT: Study these examples carefully:
- Count of items (if comma-separated)
- Format and structure
- Level of detail/granularity
- Maintain consistency with these patterns`;
}

/**
 * Main AI research function with database pattern learning
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
    // Step 1: Learn from database
    console.log(`🔍 Learning patterns for ${fieldName} from database...`);
    const similarTowns = await getSimilarTownsPattern(fieldName, country, townId);
    const patternAnalysis = analyzePattern(similarTowns, fieldName);

    // Step 2: Build AI prompt with context
    const location = subdivisionCode && subdivisionCode.toLowerCase() !== townName.toLowerCase()
      ? `${townName}, ${subdivisionCode}, ${country}`
      : `${townName}, ${country}`;

    const prompt = `You are a data research assistant for a retirement town database.

RESEARCH TARGET:
Town: ${location}
Field: ${fieldName}
Query: "${searchQuery}"
Expected Format: "${expectedFormat}"
Current Value: ${currentValue || '(empty)'}

PATTERN LEARNING FROM DATABASE:
${patternAnalysis}

Task: ${currentValue
  ? 'Improve or enhance the current value. Maintain consistency with database patterns. Explain what you added/changed and why.'
  : 'Research and provide a value that matches the patterns from our database examples. If no pattern exists, follow the Expected Format.'
}

CRITICAL RULES:
1. If improving existing value: Keep good parts, add missing details
2. Match the granularity and format of database examples
3. Be concise - follow Expected Format character limits
4. If uncertain, indicate lower confidence

Respond in JSON format only:
{
  "recommendedValue": "your researched answer here",
  "reasoning": "explain what you learned from database patterns and what you researched",
  "confidence": "high|medium|low",
  "changes": {
    "added": ["new item 1", "new item 2"],
    "removed": ["removed item"],
    "kept": ["existing item"]
  }
}`;

    // Step 3: Call Claude API
    console.log('🤖 Calling Claude Haiku API...');
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Step 4: Parse response
    const responseText = message.content[0].text;
    console.log('📝 AI Response:', responseText);

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      recommendedValue: result.recommendedValue,
      reasoning: result.reasoning,
      confidence: result.confidence || 'medium',
      changes: result.changes || { added: [], removed: [], kept: [] },
      patternCount: similarTowns.length,
      error: null
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
 * @returns {boolean} True if API key exists
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
