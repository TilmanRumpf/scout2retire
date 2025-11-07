// Town Data Audit Utility
// Purpose: Automatically log all town data changes for audit trail
// Catches: AI fuckups, data corruption, real disasters

import supabase from '../supabaseClient';

/**
 * Fields that impact scoring and should be tracked
 * These are OBJECTIVE town metrics, NOT personalized scores
 */
const TRACKED_FIELDS = [
  // Quality metrics (1-10 scale)
  'quality_of_life',
  'healthcare_score',
  'safety_score',

  // Cost metrics
  'rent_cost_$',
  'cost_index',
  'groceries_cost_index',
  'utilities_cost_index',

  // Climate metrics
  'avg_temp_summer',
  'avg_temp_winter',
  'annual_rainfall',
  'sunshine_hours',
  'humidity_level_actual',

  // Infrastructure
  'internet_speed_mbps',
  'public_transport_score',
  'walkability_score',

  // Location
  'distance_to_ocean_km',
  'elevation_meters',

  // Demographics
  'population',
  'expat_community_size',

  // Critical descriptive fields
  'description',
  'image_url_1'
];

/**
 * Log town data changes to history table
 * Call this BEFORE saving changes to database
 */
export async function logTownDataChange({
  townId,
  oldData,
  newData,
  changeType = 'manual_edit', // 'manual_edit', 'bulk_update', 'ai_update', 'migration'
  changeReason = null,
  sourceInfo = null
}) {
  try {
    // Find which fields changed
    const changedFields = [];
    const oldValues = {};
    const newValues = {};

    TRACKED_FIELDS.forEach(field => {
      const oldVal = oldData[field];
      const newVal = newData[field];

      // Check if value actually changed
      if (oldVal !== newVal) {
        changedFields.push(field);
        oldValues[field] = oldVal;
        newValues[field] = newVal;
      }
    });

    // If nothing changed, don't log
    if (changedFields.length === 0) {
      return null;
    }

    // Call database function to log the change
    const { data, error } = await supabase.rpc('log_town_data_change', {
      p_town_id: townId,
      p_changed_fields: changedFields,
      p_old_values: oldValues,
      p_new_values: newValues,
      p_change_type: changeType,
      p_change_reason: changeReason,
      p_source_info: sourceInfo
    });

    if (error) {
      console.error('Error logging town data change:', error);
      // Don't throw - we don't want audit logging to block actual changes
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in logTownDataChange:', error);
    return null;
  }
}

/**
 * Wrapper for updating town data with automatic audit logging
 * Use this instead of direct supabase.update() calls
 */
export async function updateTownWithAudit({
  townId,
  updates,
  changeType = 'manual_edit',
  changeReason = null,
  sourceInfo = null
}) {
  try {
    // 1. Fetch current data
    const { data: currentTown, error: fetchError } = await supabase
      .from('towns')
      .select('*')
      .eq('id', townId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Log the change BEFORE applying it
    await logTownDataChange({
      townId,
      oldData: currentTown,
      newData: { ...currentTown, ...updates },
      changeType,
      changeReason,
      sourceInfo
    });

    // 3. Apply the update
    const { data: updatedTown, error: updateError } = await supabase
      .from('towns')
      .update(updates)
      .eq('id', townId)
      .select()
      .single();

    if (updateError) throw updateError;

    return { success: true, data: updatedTown };
  } catch (error) {
    console.error('Error in updateTownWithAudit:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Bulk update multiple towns with audit logging
 */
export async function bulkUpdateTownsWithAudit({
  updates, // Array of { townId, data }
  changeType = 'bulk_update',
  changeReason = null,
  sourceInfo = null,
  progressCallback = null
}) {
  const results = {
    success: [],
    failed: [],
    logged: 0
  };

  for (let i = 0; i < updates.length; i++) {
    const { townId, data } = updates[i];

    try {
      const result = await updateTownWithAudit({
        townId,
        updates: data,
        changeType,
        changeReason,
        sourceInfo: {
          ...sourceInfo,
          batchIndex: i,
          batchTotal: updates.length
        }
      });

      if (result.success) {
        results.success.push(townId);
        results.logged++;
      } else {
        results.failed.push({ townId, error: result.error });
      }

      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total: updates.length,
          successCount: results.success.length,
          failedCount: results.failed.length
        });
      }
    } catch (error) {
      results.failed.push({ townId, error: error.message });
    }
  }

  return results;
}

/**
 * Get recent extreme changes across all towns
 * Use this to build a dashboard of issues needing review
 */
export async function getRecentExtremeChanges(limit = 50) {
  try {
    const { data, error } = await supabase
      .from('town_data_history')
      .select(`
        *,
        towns!inner(id, town_name, country)
      `)
      .eq('severity', 'extreme')
      .eq('admin_reviewed', false)
      .order('changed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching extreme changes:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get statistics about changes for a town
 */
export async function getTownChangeStats(townId) {
  try {
    const { data, error } = await supabase
      .from('town_data_history')
      .select('severity, admin_reviewed')
      .eq('town_id', townId);

    if (error) throw error;

    const stats = {
      total: data.length,
      extreme: data.filter(d => d.severity === 'extreme').length,
      moderate: data.filter(d => d.severity === 'moderate').length,
      normal: data.filter(d => d.severity === 'normal').length,
      reviewed: data.filter(d => d.admin_reviewed).length,
      needsReview: data.filter(d => !d.admin_reviewed && d.severity !== 'normal').length
    };

    return { success: true, stats };
  } catch (error) {
    console.error('Error fetching town change stats:', error);
    return { success: false, error: error.message };
  }
}

export default {
  logTownDataChange,
  updateTownWithAudit,
  bulkUpdateTownsWithAudit,
  getRecentExtremeChanges,
  getTownChangeStats
};
