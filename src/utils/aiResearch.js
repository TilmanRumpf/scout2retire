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
import {
  validateSuggestedValue,
  normalizeSuggestedValue
} from './validation/aiSuggestionValidation.js';

/**
 * MULTI-DIMENSIONAL FIELD CONFIGURATIONS
 *
 * For fields that require multiple layers of research, not just a single value.
 * Add new fields here to enable rich, comprehensive AI research.
 */
const MULTI_DIMENSIONAL_FIELDS = {
  geo_region: {
    name: 'Geographic Region',
    layers: [
      { name: 'Climate/ecological region', examples: 'mediterranean, tropical, temperate', case: 'lowercase' },
      { name: 'Political/cultural region', examples: 'aegean region, tuscany, catalonia', case: 'lowercase' },
      { name: 'Major water bodies', examples: 'Aegean Sea, Caribbean Sea, Gulf of Mexico', case: 'Title Case' },
      { name: 'Colloquial/tourism names', examples: 'turquoise coast, french riviera, costa del sol', case: 'lowercase' },
      { name: 'Local geographic features', examples: 'Gulf of Gökova, Bay of Naples', case: 'Title Case' }
    ],
    format: 'comma-separated, 3-6 values',
    examples: {
      'Bodrum, Turkey': 'mediterranean,aegean region,Aegean Sea,turquoise coast,Gulf of Gökova',
      'Nice, France': 'mediterranean,provence-alpes-côte d\'azur,Mediterranean Sea,french riviera,côte d\'azur'
    }
  },
  regions: {
    name: 'Multiple Region Classifications',
    layers: [
      { name: 'Geopolitical regions', examples: 'Middle East, Balkans, Western Europe', case: 'Title Case' },
      { name: 'Economic/political blocs', examples: 'NATO, EU, G20, OECD', case: 'ALL CAPS' },
      { name: 'Climate zones', examples: 'Mediterranean Climate, Tropical Climate', case: 'Title Case' },
      { name: 'Geographic features', examples: 'Coastal, Mountainous, Island', case: 'Title Case' },
      { name: 'Cultural regions', examples: 'Arab World, Latin America, Caribbean', case: 'Title Case' }
    ],
    format: 'comma-separated, 3-7 values (Title Case)',
    examples: {
      'Bodrum, Turkey': 'Mediterranean,Middle East,NATO,Mediterranean Climate,Coastal,Aegean Region',
      'Dubai, UAE': 'Middle East,Arab World,Persian Gulf,GCC,Coastal,Desert Climate'
    }
  },
  // Add more multi-dimensional fields here as needed
  // geographic_features_actual: { ... },
  // activities_available: { ... },
};

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
 * Fetch field definition from field_search_templates table
 * @param {string} fieldName - Field name
 * @returns {Promise<Object|null>} Field definition with audit_question, search_terms, etc. or null
 */
async function getFieldDefinition(fieldName) {
  try {
    const { data, error } = await supabase
      .from('field_search_templates')
      .select('*')
      .eq('field_name', fieldName)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.warn(`Template query error for "${fieldName}":`, error);
      return null;
    }

    if (!data) {
      console.warn(`No active template found for "${fieldName}"`);
      // DO NOT auto-generate - templates must be static for comparability
      // Use generic fallback instead
      return null;
    }

    // Map to expected structure for backward compatibility
    return {
      search_template: data.search_template,
      expected_format: data.expected_format,
      audit_question: data.human_description,
      search_terms: fieldName,
      search_query: data.search_template
    };
  } catch (error) {
    console.warn(`Error fetching field definition for ${fieldName}:`, error);
    return null;
  }
}

/**
 * Auto-generate a template for a missing field using AI
 */
async function autoGenerateTemplate(fieldName) {
  try {
    // Convert field name to human-readable
    const humanName = fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Generate template using Claude
    const prompt = `Generate a search template for the database field "${fieldName}" (${humanName}).

This template will be used to guide AI research for finding accurate data about retirement towns.

Return ONLY valid JSON with this structure:
{
  "search_template": "Question to ask about {town_name}, {subdivision}, {country}",
  "expected_format": "Brief description of expected data format",
  "human_description": "Clear description for admins about what this field captures"
}

Examples:
- For "population": search_template should be "What is the population of {town_name}, {subdivision}, {country}?"
- For "climate": search_template should be "What is the climate type in {town_name}, {subdivision}, {country}?"

Make it specific and actionable. Use placeholders: {town_name}, {subdivision}, {country}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    const result = await response.json();
    const generatedTemplate = JSON.parse(result.content[0].text);

    // Save to database
    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from('field_search_templates')
      .insert({
        field_name: fieldName,
        search_template: generatedTemplate.search_template,
        expected_format: generatedTemplate.expected_format,
        human_description: generatedTemplate.human_description,
        status: 'active',
        updated_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    console.log(`🤖 Auto-generated template for "${fieldName}":`, generatedTemplate);
  } catch (error) {
    console.error(`Failed to auto-generate template for "${fieldName}":`, error);
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

    // Extract expected format from options or field definition
    const expectedFormat = options.expectedFormat || fieldDef?.expected_format ||
      (pattern.includes('Format:') ? pattern.split('Format:')[1].split('\n')[0].trim() : 'See pattern below');

    // SPECIAL HANDLING: Multi-dimensional fields
    const multiDimConfig = MULTI_DIMENSIONAL_FIELDS[fieldName];
    const multiDimInstructions = multiDimConfig ? `

🎯 SPECIAL: This is a MULTI-DIMENSIONAL ${multiDimConfig.name.toUpperCase()} FIELD!

You MUST research and include ALL of these layers (${multiDimConfig.format}):
${multiDimConfig.layers.map((layer, i) =>
  `${i + 1}. ${layer.name} (${layer.examples}) - ${layer.case}`
).join('\n')}

EXAMPLES:
${Object.entries(multiDimConfig.examples).map(([location, value]) =>
  `✓ ${location}: "${value}"`
).join('\n')}

✗ WRONG: Single simple value (missing layers!)

FORMAT RULES:
- ${multiDimConfig.format}
- Follow capitalization rules for each layer type
- Include ${multiDimConfig.layers.length} values (comprehensive but focused)
- Use recognized names, not invented terms
- Research actual local names - verify spelling and accuracy
` : '';

    const prompt = `You are an AI data auditor for a structured town-metadata database.

TOWN INFORMATION:
- Name: ${townData.town_name}
- Country: ${townData.country}
- State/Region: ${townData.state_code || 'N/A'}

FIELD: ${fieldName}
Expected Format: ${expectedFormat || 'See below'}
Current DB Value: ${townData[fieldName] || 'NULL/Empty'}

${task ? `FIELD PURPOSE: ${task}` : ''}
${multiDimInstructions}

PATTERN ANALYSIS FROM SIMILAR TOWNS (for reference only):
${pattern}

SEARCH CONTEXT (use this for research):
${searchContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR JOB: Research, verify, and ONLY carefully improve the existing value.
You must NOT blindly overwrite thoughtful human input.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. RESEARCH WORKFLOW (for every field):
   - Do real research about this town and field using search context
   - Identify most reliable facts and canonical terms
   - Use research to EVALUATE the existing current_db_value

2. TREAT EXISTING DATABASE VALUE AS A STRONG PRIOR:

   Step A – Validate each part of current_db_value:
   ✅ Correct – supported by research and matches expected format
   ⚠️ Partially correct – somewhat supported but unclear
   ❌ Incorrect – contradicts reliable sources

   Step B – Prefer reuse over replacement:
   - If current_db_value is correct → KEEP IT (normalize spacing/case, but keep same meaning)
   - If parts are correct → Start from correct subset, add/remove based on research
   - Never silently drop human-entered elements; if removing, explain WHY in notes
   - Only fully replace when research CLEARLY shows it's wrong, incomplete, or misaligned

   Step C – Multi-value fields (regions, tags, features):
   - Begin with validated elements from current_db_value
   - Add ONLY new elements clearly and strongly supported by research
   - Avoid dumping every theoretically true label; prefer concise, meaningful set
   - Keep order stable (append new items to end)

3. CONFIDENCE AND SOURCE RULES:
   - If based on verified research → source="research", confidence="high" or "limited"
   - If guessing from patterns (weak research) → source="pattern", confidence="low" (MANDATORY)
   - If no reliable info found → proposed_value=null or keep current, source="not_found", confidence="low"
   - NEVER label high confidence if based on pattern guessing

4. SPECIAL FIELD HANDLING:
   - image_url_1: Real Unsplash URL format: https://images.unsplash.com/photo-[id]?w=1200
   - cost_of_living_usd: MONTHLY cost in USD for SINGLE PERSON (typically 800-3000). Integer only.
   - Numeric fields: Number only, no units
   - Text fields: Concise, factual, consistent formatting
   ${multiDimConfig ? `- ${fieldName}: MUST include multiple layers (see above)` : ''}

RESPONSE FORMAT (JSON only - CRITICAL: Valid JSON with escaped strings):
{
  "proposed_value": "<final suggested value in expected format>",
  "factSummary": "Short factual paragraph about town/field (2-3 sentences from research)",
  "confidence": "high | limited | low",
  "source": "research | pattern | not_found",
  "notes": "Explain how you evaluated current_db_value, what you kept, what you changed, and WHY."
}

⚠️ JSON FORMAT RULES:
- All string values must be on a single line (no literal newlines inside strings)
- Use proper JSON escaping for quotes and special characters
- If you need to include line breaks in text, use spaces instead
- Keep factSummary and notes concise (2-3 sentences max each)

PRIORITY ORDER:
1. Verify and reuse good human data
2. Carefully improve when research justifies changes
3. Only then replace or guess – clearly marked with low confidence

⚠️ CRITICAL: DO NOT HALLUCINATE OR INVENT FACTS
- ONLY include information you can verify from search_context or reliable knowledge
- If uncertain about ANY detail (climate type, geographic features, etc.) → mark confidence="limited" or "low"
- NEVER add speculative labels like "Mediterranean" without clear evidence
- When in doubt, be conservative - less is more`;

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

    // Clean the JSON string - remove control characters but preserve intentional newlines in strings
    let jsonString = jsonMatch[0];

    // Parse with better error handling
    let result;
    try {
      result = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Problematic JSON:', jsonString.substring(0, 500));

      // Try to fix common issues
      // Replace literal newlines inside strings with \n
      jsonString = jsonString.replace(/("\w+"\s*:\s*")([^"]*?)"/g, (match, prefix, content) => {
        // Fix newlines and control characters in string values
        const cleaned = content
          .replace(/\n/g, ' ')
          .replace(/\r/g, '')
          .replace(/\t/g, ' ')
          .replace(/[\x00-\x1F\x7F]/g, ''); // Remove all control characters
        return prefix + cleaned + '"';
      });

      try {
        result = JSON.parse(jsonString);
        console.log('✅ Successfully parsed after cleaning');
      } catch (secondError) {
        throw new Error(`Failed to parse AI response: ${secondError.message}. Response: ${jsonString.substring(0, 200)}`);
      }
    }

    // ENFORCE RULE: pattern or not_found → confidence MUST be low
    if ((result.source === 'pattern' || result.source === 'not_found') && result.confidence !== 'low') {
      console.warn(`⚠️ ENFORCING RULE: source="${result.source}" requires confidence="low" (was "${result.confidence}")`);
      result.confidence = 'low';
    }

    console.log('✅ AI Research completed:', result);

    // 🔍 CENTRALIZED VALIDATION: Check against enum/range constraints
    // Added: November 13, 2025 - Tab-aware Smart Update validation layer
    const proposedValue = result.proposed_value || result.suggestedValue;

    if (proposedValue !== null && proposedValue !== undefined) {
      // Normalize value first (e.g., convert comma-separated strings to arrays)
      const normalizedValue = normalizeSuggestedValue(fieldName, proposedValue);

      // Validate against field rules
      const validation = validateSuggestedValue(fieldName, normalizedValue);

      if (!validation.ok) {
        console.warn(`⚠️ VALIDATION FAILED: ${fieldName} = "${proposedValue}"`);
        console.warn(`   Reason: ${validation.reason}`);
        if (validation.suggestion) {
          console.warn(`   Suggestion: ${validation.suggestion}`);
        }

        return {
          success: false,
          suggestedValue: null,
          confidence: 'low',
          reasoning: `AI suggestion rejected by validation: ${validation.reason}`,
          validationError: validation.reason,
          validationSuggestion: validation.suggestion,
          patternCount: similarTowns.length,
          fieldDefinition: fieldDef?.audit_question || null
        };
      }

      // Validation passed - use normalized value
      result.proposed_value = normalizedValue;
      result.suggestedValue = normalizedValue;
      console.log(`✓ VALIDATION PASSED: ${fieldName} = ${JSON.stringify(normalizedValue)}`);
    }

    // 🎯 OVERRIDE: Primary photo should be manually uploaded, not AI-suggested
    if (fieldName === 'image_url_1') {
      console.log('🖼️ PRIMARY PHOTO OVERRIDE: Replacing AI suggestion with manual upload message');
      return {
        success: true,
        suggestedValue: "Upload a photo in towns manager, if you have confidence in all relevant town data points.",
        confidence: result.confidence || 'high', // Preserve AI confidence if available
        reasoning: result.reasoning
          ? `AI suggestion: ${result.reasoning}\n\nNote: Manual photo upload recommended for quality control.`
          : 'Manual photo upload recommended for quality control.',
        patternCount: similarTowns.length,
        fieldDefinition: fieldDef?.audit_question || null
      };
    }

    // 🔍 VALIDATION: Cost of living must be reasonable monthly USD amount
    if (fieldName === 'cost_of_living_usd' && result.suggestedValue !== null) {
      const cost = parseInt(result.suggestedValue);

      // Reject if not a number or outside reasonable range
      if (isNaN(cost) || cost < 300 || cost > 8000) {
        console.warn(`⚠️ VALIDATION FAILED: cost_of_living_usd=${cost} is outside reasonable range (300-8000)`);
        return {
          success: false,
          suggestedValue: null,
          confidence: 'low',
          reasoning: `AI suggested ${cost} which is outside reasonable monthly cost range (300-8000 USD). This might be annual cost, local currency, or hallucination. Manual research recommended.`,
          patternCount: similarTowns.length,
          fieldDefinition: fieldDef?.audit_question || null
        };
      }

      // Accept valid cost
      console.log(`✓ VALIDATION PASSED: cost_of_living_usd=${cost} is reasonable`);
    }

    return {
      success: true,
      suggestedValue: result.proposed_value || result.suggestedValue, // Support both old and new format
      factSummary: result.factSummary || 'No fact summary provided',
      source: result.source || 'research', // Default to research if not specified
      confidence: result.confidence || 'limited',
      reasoning: result.notes || result.reasoning || 'AI-generated suggestion', // Support both old and new format
      patternCount: similarTowns.length,
      fieldDefinition: fieldDef?.audit_question || null
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
