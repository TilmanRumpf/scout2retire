/**
 * Audit Town Data Utility
 *
 * Uses Claude AI to assess confidence level for each field in a town's data
 * Returns confidence ratings: 'high', 'limited', 'low', 'unknown', 'not_editable'
 */

import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

/**
 * Check if Anthropic API key is configured
 * @returns {boolean}
 */
export function hasAnthropicAPIKey() {
  return !!import.meta.env.VITE_ANTHROPIC_API_KEY;
}

/**
 * Audit all fields in a town's data and save to database
 * @param {Object} townData - Complete town data object
 * @param {Object} supabase - Supabase client instance
 * @returns {Promise<Object>} Object mapping field names to confidence levels
 */
export async function auditTownData(townData, supabase) {
  if (!hasAnthropicAPIKey()) {
    throw new Error('Anthropic API key not configured');
  }

  if (!supabase) {
    throw new Error('Supabase client is required');
  }

  try {
    // Build a concise summary of the town's data for Claude
    const dataSummary = Object.entries(townData)
      .filter(([key, value]) => {
        // Skip metadata fields
        return !key.startsWith('_') &&
               !['id', 'created_at', 'updated_at', 'last_modified'].includes(key) &&
               value !== null &&
               value !== undefined &&
               value !== '';
      })
      .map(([field, value]) => {
        // Truncate long text fields
        const displayValue = typeof value === 'string' && value.length > 100
          ? value.substring(0, 100) + '...'
          : String(value);
        return `${field}: ${displayValue}`;
      })
      .join('\n');

    const prompt = `You are auditing data quality for a retirement town database.

Town: ${townData.town_name}, ${townData.country}
Region: ${townData.region || 'N/A'}

DATA TO AUDIT:
${dataSummary}

TASK: Assess confidence level for EACH field above. For each field, determine:
- HIGH: Data is specific, verifiable, and appropriate (e.g., "75" for cost_of_living_usd, "mediterranean" for climate)
- LIMITED: Data is generic or partially complete (e.g., "moderate" without specifics)
- LOW: Data seems incorrect, placeholder-like, or contradictory (e.g., "100" for everything, "unknown")

CRITICAL RULES:
1. Evaluate EACH field independently
2. Consider the field name and what type of data is expected
3. Check if values are realistic for this location
4. Flag generic/placeholder values as LOW confidence
5. Non-editable fields (id, dates) should NOT be included

Return ONLY a JSON object mapping field names to confidence levels.
Format: {"field_name": "high|limited|low"}

Example response:
{
  "cost_of_living_usd": "high",
  "healthcare_score": "limited",
  "description": "low"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Use fast, cheap model for auditing
      max_tokens: 2000,
      temperature: 0.3, // Low temperature for consistent assessments
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Extract and parse Claude's response
    const responseText = message.content[0].text;

    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Claude did not return valid JSON');
    }

    const fieldConfidence = JSON.parse(jsonMatch[0]);

    // Add 'not_editable' for system fields that shouldn't have indicators
    const systemFields = ['id', 'created_at', 'updated_at', 'last_modified'];
    systemFields.forEach(field => {
      if (townData[field] !== undefined) {
        fieldConfidence[field] = 'not_editable';
      }
    });

    // Save audit results to database
    const auditRecords = Object.entries(fieldConfidence).map(([fieldName, confidence]) => ({
      town_id: townData.id,
      field_name: fieldName,
      confidence: confidence
    }));

    // Use upsert to update existing records or insert new ones
    const { error: saveError } = await supabase
      .from('town_field_audits')
      .upsert(auditRecords, {
        onConflict: 'town_id,field_name',
        ignoreDuplicates: false
      });

    if (saveError) {
      console.error('Error saving audit results to database:', saveError);
      throw new Error(`Failed to save audit results: ${saveError.message}`);
    }

    return {
      success: true,
      fieldConfidence,
      totalFields: Object.keys(fieldConfidence).length,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Audit error:', error);
    return {
      success: false,
      error: error.message,
      fieldConfidence: {}
    };
  }
}

/**
 * Load audit results for a town from database
 * Merges AI-generated audits from town_field_audits table with manual audits from towns.audit_data
 * Manual audits take priority over AI audits
 * @param {string} townId - Town ID
 * @param {Object} supabase - Supabase client instance
 * @returns {Promise<Object>} Object mapping field names to confidence levels
 */
export async function loadAuditResults(townId, supabase) {
  try {
    // Load AI-generated audit results from town_field_audits table
    const { data: aiAudits, error: aiError } = await supabase
      .from('town_field_audits')
      .select('field_name, confidence')
      .eq('town_id', townId);

    if (aiError) {
      console.error('Error loading AI audit results:', aiError);
    }

    // Load manual audit results from towns.audit_data JSONB column
    const { data: townData, error: townError } = await supabase
      .from('towns')
      .select('audit_data')
      .eq('id', townId)
      .single();

    if (townError) {
      console.error('Error loading manual audit results:', townError);
    }

    // Start with AI audits
    const auditResults = {};
    if (aiAudits) {
      aiAudits.forEach(record => {
        auditResults[record.field_name] = record.confidence;
      });
    }

    // Merge manual audits (they take priority)
    if (townData?.audit_data) {
      Object.entries(townData.audit_data).forEach(([fieldName, auditInfo]) => {
        // Manual audit overrides AI audit
        if (auditInfo?.status) {
          auditResults[fieldName] = auditInfo.status;
        }
      });
    }

    return auditResults;
  } catch (error) {
    console.error('Error loading audit results:', error);
    return {};
  }
}

/**
 * Save manual audit status and metadata for a specific field
 * Stores in towns.audit_data JSONB column
 * Updated: November 14, 2025 - Added final value persistence
 *
 * @param {string} townId - Town ID
 * @param {string} fieldName - Field name being audited
 * @param {string} status - Audit status (unknown|needs_review|approved|rejected)
 * @param {Object} supabase - Supabase client instance
 * @param {Object} metadata - Optional metadata to save (finalValue, confidence, source, etc.)
 * @returns {Promise<Object>} Success/error result
 */
export async function saveFieldAuditStatus(townId, fieldName, status, supabase, metadata = {}) {
  if (!supabase) {
    throw new Error('Supabase client is required');
  }

  const validStatuses = ['unknown', 'needs_review', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid audit status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
  }

  try {
    // Load current audit_data
    const { data: townData, error: fetchError } = await supabase
      .from('towns')
      .select('audit_data')
      .eq('id', townId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch town audit data: ${fetchError.message}`);
    }

    // Preserve existing metadata and merge with new
    const currentAuditData = townData?.audit_data || {};
    const existingFieldData = currentAuditData[fieldName] || {};

    const updatedAuditData = {
      ...currentAuditData,
      [fieldName]: {
        ...existingFieldData,  // Preserve existing metadata
        status,
        updated_at: new Date().toISOString(),
        // Merge in new metadata (finalValue, confidence, source, aiSuggestion, etc.)
        ...metadata
      }
    };

    // Save back to database
    const { error: updateError } = await supabase
      .from('towns')
      .update({ audit_data: updatedAuditData })
      .eq('id', townId);

    if (updateError) {
      throw new Error(`Failed to save audit status: ${updateError.message}`);
    }

    return {
      success: true,
      fieldName,
      status,
      metadata
    };

  } catch (error) {
    console.error('Error saving audit status:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
