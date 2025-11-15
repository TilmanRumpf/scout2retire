import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getFieldDisplayName,
  getConfidenceIcon,
  getFieldExplanation
} from '../../utils/admin/bulkUpdateTown';
import { researchFieldWithContext, hasAnthropicAPIKey } from '../../utils/aiResearch';
import { saveFieldAuditStatus } from '../../utils/auditTown';
import { supabase } from '../../utils/supabaseClient';
import {
  getFieldUILayout,
  getLayoutClasses,
  getInputType
} from '../../utils/fieldUILayouts';
import { getValidValues } from '../../utils/validation/categoricalValues';
import { ARRAY_FIELDS, isArrayField } from '../../utils/config/arrayFields.js';
import { normalizeFieldValue } from '../../utils/fieldNormalization.js';

/**
 * Auto-resize textarea hook
 * Automatically adjusts textarea height to fit content
 */
function useAutosizeTextArea(value) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reset height so scrollHeight is measured correctly
    el.style.height = 'auto';
    // Set height to fit content
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return ref;
}

/**
 * Convert array or Postgres array literal to editable string
 * NOW USING CONSOLIDATED NORMALIZATION - November 14, 2025
 */
function toEditableString(value) {
  return normalizeFieldValue(null, value, 'display');
}

/**
 * Individual Field Audit Row Component
 * Extracted to avoid calling hooks inside loops
 * Supports both compact (single-line) and long-form (multi-line) layouts
 * Updated: Nov 14, 2025 - Fixed auto-resize for all fields
 */
function FieldAuditRow({
  suggestion,
  isApplied,
  isUpdating,
  auditStatus,
  finalValue,
  onFinalValueChange,
  onAuditStatusChange,
  onApplySingle,
  onUndoApplied,
  onAIResearch,
  onGoogleSearch,
  researchingField,
  savingAuditStatus
}) {
  // Determine UI layout for this field
  const layout = getFieldUILayout(suggestion.fieldName);
  const isLongForm = layout === 'longForm';
  const layoutClasses = getLayoutClasses(layout);

  // ALWAYS use textarea for "Your Final Value" to enable auto-resize
  // Hook must be called unconditionally (same order every render)
  const textareaRef = useAutosizeTextArea(finalValue || '');

  // Format text for display (read-only columns)
  // 🔧 FIX: Handle array values properly (convert to comma-separated for display)
  const formatValue = (text) => {
    if (!text && text !== 0) return '(empty)';
    // Use same logic as editable fields for consistency
    return toEditableString(text);
  };

  // Get audit status style
  const getAuditStatusStyle = (status) => {
    const styles = {
      unknown: { color: '#6b7280', label: 'Unknown', dot: '⚪' },
      needs_review: { color: '#f59e0b', label: 'Needs Review', dot: '🟡' },
      approved: { color: '#10b981', label: 'Approved', dot: '🟢' },
      rejected: { color: '#ef4444', label: 'Rejected', dot: '🔴' }
    };
    return styles[status] || styles.unknown;
  };

  const auditStyle = getAuditStatusStyle(auditStatus);

  return (
    <div
      className={`border rounded-lg p-6 transition-all ${
        isApplied
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 opacity-75'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Field Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Audit status indicator dot - clickable to cycle through statuses */}
          <button
            onClick={() => {
              const statusCycle = ['unknown', 'needs_review', 'approved', 'rejected'];
              const currentIndex = statusCycle.indexOf(auditStatus);
              const nextIndex = (currentIndex + 1) % statusCycle.length;
              const nextStatus = statusCycle[nextIndex];
              onAuditStatusChange(suggestion.fieldName, nextStatus);
            }}
            className="text-xl hover:scale-110 transition-transform cursor-pointer"
            title={`Click to change status (currently: ${auditStyle.label})`}
          >
            {auditStyle.dot}
          </button>
          {isApplied && (
            <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
          )}
          <span className="font-semibold text-lg text-gray-900 dark:text-white">
            {getFieldDisplayName(suggestion.fieldName)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Priority: {suggestion.priority}
          </span>
          <span
            className="text-xs px-2 py-1 rounded font-medium"
            style={{
              backgroundColor: suggestion.confidence === 'high' ? '#10b981' :
                              suggestion.confidence === 'limited' ? '#f59e0b' :
                              suggestion.confidence === 'low' ? '#ef4444' : '#6b7280',
              color: 'white'
            }}
          >
            {getConfidenceIcon(suggestion.confidence)} {suggestion.confidence}
          </span>
        </div>
      </div>

      {/* Why this matters */}
      <div className="mb-4 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
        <div className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
          Why This Matters:
        </div>
        <div className="text-xs text-blue-800 dark:text-blue-200">
          {getFieldExplanation(suggestion.fieldName)}
        </div>
      </div>

      {/* Valid Options - Show categorical field options as clickable chips */}
      {(() => {
        const validOptions = getValidValues(suggestion.fieldName);
        if (!validOptions || validOptions.length === 0) return null;

        // Check if this is an array field (multi-select)
        // NOTE: Using imported isArrayField() from config/arrayFields.js
        const isMultiSelect = isArrayField(suggestion.fieldName);

        // Parse current final value to array for multi-select
        const getCurrentValues = () => {
          const val = finalValue || '';
          if (Array.isArray(val)) return val;
          if (typeof val === 'string') {
            return val.split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
          }
          return [];
        };

        const currentValues = isMultiSelect ? getCurrentValues() : [];

        const toggleArrayValue = (option) => {
          const current = getCurrentValues();
          const optionLower = option.toLowerCase();
          const newValues = current.includes(optionLower)
            ? current.filter(v => v !== optionLower)
            : [...current, optionLower];
          onFinalValueChange(suggestion.fieldName, newValues.join(', '));
        };

        return (
          <div className="mb-4 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500">
            <div className="text-xs font-semibold text-purple-900 dark:text-purple-300 mb-2">
              Valid Options {isMultiSelect ? '(select multiple)' : '(click to use)'}:
            </div>
            <div className="flex flex-wrap gap-2">
              {validOptions.map(option => {
                const isSelected = isMultiSelect && currentValues.includes(option.toLowerCase());

                return (
                  <button
                    key={option}
                    onClick={() => isMultiSelect ? toggleArrayValue(option) : onFinalValueChange(suggestion.fieldName, option)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      isSelected
                        ? 'bg-purple-600 dark:bg-purple-700 text-white border-purple-700 dark:border-purple-500'
                        : 'bg-purple-100 dark:bg-purple-800 hover:bg-purple-200 dark:hover:bg-purple-700 text-purple-900 dark:text-purple-100 border-purple-300 dark:border-purple-600'
                    }`}
                    title={isMultiSelect ? `Click to toggle "${option}"` : `Click to set value to "${option}"`}
                  >
                    {isSelected && '✓ '}{option}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* 3-COLUMN GRID - All columns auto-match height via flexbox */}
      <div className="grid grid-cols-3 gap-4 mb-4 items-start">
        {/* Column 1: Current Value - Read-only, height matches others */}
        <div className="flex flex-col gap-1 h-full">
          <div className={layoutClasses.label}>
            Current Value
          </div>
          <div className={`${layoutClasses.baseBox} border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 whitespace-pre-wrap flex-1`}>
            {formatValue(suggestion.currentValue)}
          </div>
        </div>

        {/* Column 2: AI Suggestion - Read-only, height matches others */}
        <div className="flex flex-col gap-1 h-full">
          <div className="flex items-center justify-between">
            <div className={layoutClasses.label}>
              AI Suggestion
            </div>
            {suggestion.suggestedValue !== null && !isApplied && (
              <button
                onClick={() => {
                  // 🔧 FIX: Convert AI suggestion to editable string format (for arrays)
                  const editableValue = toEditableString(suggestion.suggestedValue);
                  onFinalValueChange(suggestion.fieldName, editableValue);
                  toast.success('AI suggestion copied!');
                }}
                className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                title="Copy AI suggestion to Your Final Value"
              >
                Use AI →
              </button>
            )}
          </div>
          <div className={`${layoutClasses.baseBox} ${
            suggestion.suggestedValue !== null
              ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-gray-900 dark:text-white'
              : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'
          } whitespace-pre-wrap flex-1`}>
            {suggestion.suggestedValue !== null ? (
              formatValue(suggestion.suggestedValue)
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 text-sm">⚠️</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                      AI could not help
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      {suggestion.reason || 'No suggestion available'}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 italic border-t border-amber-200 dark:border-amber-800 pt-2">
                  Manual review required
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Your Final Value - Always auto-resizing textarea */}
        <div className="flex flex-col gap-1 h-full">
          <div className={layoutClasses.label}>
            Your Final Value
          </div>
          <textarea
            ref={textareaRef}
            value={finalValue || ''}
            onChange={(e) => onFinalValueChange(suggestion.fieldName, e.target.value)}
            disabled={isApplied || isUpdating}
            placeholder="Edit if needed"
            className={`${layoutClasses.baseBox} border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 whitespace-pre-wrap resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed flex-1`}
            style={{ minHeight: '44px' }}
          />
        </div>
      </div>

      {/* Research & Action Buttons - ALWAYS show, even when AI failed */}
      {!isApplied && (
        <div className="space-y-3">
          {/* Research Buttons Row - Only show if AI suggestion exists */}
          {suggestion.suggestedValue !== null && (
            <div className="flex gap-2">
              <button
                onClick={() => onAIResearch(suggestion.fieldName)}
                disabled={researchingField === suggestion.fieldName || isUpdating}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
              >
                {researchingField === suggestion.fieldName ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Researching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Verify with AI</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onGoogleSearch(suggestion.fieldName)}
                disabled={isUpdating}
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 border-2 border-green-500 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Google Search</span>
              </button>
            </div>
          )}

          {/* AI Failed - Show manual research suggestion */}
          {suggestion.suggestedValue === null && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
              <div className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 text-lg">⚠️</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    AI could not help with this field
                  </div>
                  <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Please manually review the current value and approve if correct, or research and update if needed.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audit Status + Update Button Row - ALWAYS show */}
          <div className="flex gap-3 items-center">
            {/* Audit Status Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Audit Status:
              </label>
              <div className="relative">
                <select
                  value={auditStatus || ''}
                  onChange={(e) => onAuditStatusChange(suggestion.fieldName, e.target.value)}
                  disabled={isApplied || savingAuditStatus === suggestion.fieldName}
                  className="text-sm px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed appearance-none min-w-[180px]"
                >
                  <option value="">Select status...</option>
                  <option value="unknown">⚪ Unknown</option>
                  <option value="needs_review">🟡 Needs Review</option>
                  <option value="approved">🟢 Approved</option>
                  <option value="rejected">🔴 Rejected</option>
                </select>
                {savingAuditStatus === suggestion.fieldName && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Update Button - Enabled when audit status selected (AI suggestion not required) */}
            <button
              onClick={() => onApplySingle(suggestion)}
              disabled={isUpdating || !auditStatus}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-md"
              title={!auditStatus ? 'Please select an audit status first' : ''}
            >
              {isUpdating ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>✓ Update This Field</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {isApplied && (
        <div className="mt-3 px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-green-800 dark:text-green-300">
            ✓ Applied Successfully
          </span>
          <button
            onClick={onUndoApplied}
            className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors font-medium"
            title="Undo this update and allow re-editing"
          >
            ↺ Undo
          </button>
        </div>
      )}

      {/* Reason/explanation */}
      {suggestion.reason && suggestion.suggestedValue !== null && (
        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 italic">
          {suggestion.reason}
        </div>
      )}
    </div>
  );
}

/**
 * Modal for previewing and applying AI-generated town data updates
 * Updated: November 13, 2025 - 3-column audit grid with auto-resize textarea
 */
const UpdateTownModal = ({
  isOpen,
  onClose,
  town,
  suggestions,
  onApplyUpdates,
  isGenerating = false,
  generationProgress = null,
  mode = 'critical', // 'critical' or 'supplemental'
  tabName = null // Tab name for tab-specific Smart Update
}) => {
  // Dynamic title based on whether this is tab-specific or global
  const sessionTitle = tabName
    ? `Smart Update: ${tabName} Tab`
    : mode === 'critical'
    ? 'Session 1: Fix Algorithm-Critical Fields'
    : 'Session 2: Add Supplemental Details';

  const sessionDescription = tabName
    ? `Review and update ${tabName} fields that affect matching and scoring`
    : mode === 'critical'
    ? 'These fields are required for scoring algorithm to work properly'
    : 'Nice-to-have details that enhance user experience';

  const [researchingField, setResearchingField] = useState(null);
  const [updatingField, setUpdatingField] = useState(null);
  const [appliedFields, setAppliedFields] = useState(new Set());

  // 🆕 4-COLUMN GRID STATE
  const [finalValues, setFinalValues] = useState({}); // Admin's final value per field
  const [auditStatuses, setAuditStatuses] = useState({}); // Audit status per field
  const [savingAuditStatus, setSavingAuditStatus] = useState(null); // Track audit save in progress

  // NOTE: ARRAY_FIELDS imported from utils/config/arrayFields.js (single source of truth)
  // No longer defined locally - prevents duplication and divergence

  /**
   * Normalize values for audit status comparison
   * NOW USING CONSOLIDATED NORMALIZATION - November 14, 2025
   */
  const normalizeForAuditComparison = (fieldName, value) => {
    return normalizeFieldValue(fieldName, value, 'compare');
  };

  // Initialize final values and audit statuses when suggestions change
  // 🔄 PERSISTENCE: Hydrate from audit_data if available (Updated Nov 14, 2025)
  useEffect(() => {
    if (!suggestions || suggestions.length === 0) return;

    const initialFinalValues = {};
    const initialAuditStatuses = {};
    const alreadyApplied = new Set();

    suggestions.forEach(suggestion => {
      const fieldName = suggestion.fieldName;
      const auditData = town?.audit_data?.[fieldName];

      // 🔍 DEBUG: Log reloaded data for geographic_features_actual
      if (fieldName === 'geographic_features_actual') {
        console.log('[GeoFeatures] Reloaded town field + audit:', {
          dbValue: town?.geographic_features_actual,
          currentValue: suggestion.currentValue,
          audit: auditData,
          valueType: typeof town?.geographic_features_actual
        });
      }

      // 🔍 DEBUG: Log reloaded data for water_bodies (BUG FIX LOGGING)
      if (fieldName === 'water_bodies') {
        console.log('[WaterBodies][Reload] town field + audit:', {
          dbValue: town?.water_bodies,
          currentValue: suggestion.currentValue,
          audit: auditData,
          valueType: typeof town?.water_bodies
        });
      }

      // HYDRATE from audit_data if available
      if (auditData) {
        // Restore previously saved final value
        const restoredValue = auditData.finalValue !== undefined
          ? auditData.finalValue
          : suggestion.currentValue;

        // 🔧 FIX: Convert arrays/Postgres literals to comma-separated strings for editing
        initialFinalValues[fieldName] = toEditableString(restoredValue);

        // Restore previously saved audit status
        initialAuditStatuses[fieldName] = auditData.status || '';

        // 🔧 FIX: Check if field was already updated using normalized comparison
        // This handles array fields where DB has ["a","b"] but audit_data has "a, b"
        if ((auditData.status === 'approved' || auditData.status === 'rejected') &&
            auditData.finalValue !== undefined) {
          const currentNorm = normalizeForAuditComparison(fieldName, suggestion.currentValue);
          const finalNorm = normalizeForAuditComparison(fieldName, auditData.finalValue);

          console.log('[Hydration][AppliedCheck]', fieldName, {
            status: auditData.status,
            currentNorm,
            finalNorm,
            equal: currentNorm === finalNorm
          });

          if (currentNorm === finalNorm) {
            alreadyApplied.add(fieldName);
          }
        }
      } else {
        // No audit_data yet - use defaults
        // 🔄 CRITICAL: Always default to CURRENT DB value (not AI suggestion)
        // This is especially important when AI fails (suggestedValue === null)
        // Admin can always copy AI suggestion if they want it

        // 🔧 FIX: Convert arrays/Postgres literals to comma-separated strings for editing
        initialFinalValues[fieldName] = toEditableString(suggestion.currentValue);

        // No default audit status - admin must explicitly choose
        initialAuditStatuses[fieldName] = '';
      }
    });

    setFinalValues(initialFinalValues);
    setAuditStatuses(initialAuditStatuses);
    setAppliedFields(alreadyApplied);
  }, [suggestions, town]);

  if (!isOpen) return null;

  // Apply individual field update
  // 🔄 PERSISTENCE: Save to both DB field AND audit_data (Updated Nov 14, 2025)
  const handleApplySingle = async (suggestion) => {
    setUpdatingField(suggestion.fieldName);

    try {
      const fieldName = suggestion.fieldName;
      const valueToApply = finalValues[fieldName];
      const currentStatus = auditStatuses[fieldName];

      // 🔍 DEBUG: Special logging for geographic_features_actual
      if (fieldName === 'geographic_features_actual') {
        console.log('[GeoFeatures] Building update payload:', {
          fieldName,
          currentValue: suggestion.currentValue,
          finalValue: valueToApply,
          auditStatus: currentStatus,
          valueType: typeof valueToApply
        });
      }

      // 🔍 DEBUG: Special logging for water_bodies (BUG FIX LOGGING)
      if (fieldName === 'water_bodies') {
        console.log('[WaterBodies][ApplySingle] payload before send:', {
          fieldName,
          currentValue: suggestion.currentValue,
          currentValueType: typeof suggestion.currentValue,
          currentValueIsArray: Array.isArray(suggestion.currentValue),
          finalValue: valueToApply,
          finalValueType: typeof valueToApply,
          finalValueIsArray: Array.isArray(valueToApply),
          auditStatus: currentStatus,
          townId: town.id
        });
      }

      const updatedSuggestion = {
        ...suggestion,
        suggestedValue: valueToApply
      };

      // 🔍 DEBUG: Log before DB update
      if (fieldName === 'geographic_features_actual') {
        console.log('[GeoFeatures] Sending update to DB:', updatedSuggestion);
      }
      if (fieldName === 'water_bodies') {
        console.log('[WaterBodies][ApplySingle] Sending update to DB:', updatedSuggestion);
      }

      // Update the actual town field value in DB
      await onApplyUpdates([updatedSuggestion]);

      // 🔍 DEBUG: Log after DB update
      if (fieldName === 'geographic_features_actual') {
        console.log('[GeoFeatures] DB update completed successfully');
      }
      if (fieldName === 'water_bodies') {
        console.log('[WaterBodies][ApplySingle] DB update completed successfully');
      }

      // ALSO update audit_data with the applied value and status
      const metadata = {
        finalValue: valueToApply,
        aiSuggestion: suggestion.suggestedValue,
        confidence: suggestion.confidence,
        currentDbValue: suggestion.currentValue,
        appliedAt: new Date().toISOString()
      };

      if (fieldName === 'water_bodies') {
        console.log('[WaterBodies][ApplySingle] Saving audit status:', {
          townId: town.id,
          fieldName,
          status: currentStatus || 'approved',
          metadata
        });
      }

      const auditResult = await saveFieldAuditStatus(town.id, fieldName, currentStatus || 'approved', supabase, metadata);

      if (fieldName === 'water_bodies') {
        console.log('[WaterBodies][ApplySingle] Audit status save result:', auditResult);
      }

      setAppliedFields(prev => new Set([...prev, fieldName]));

      if (fieldName === 'water_bodies') {
        console.log('[WaterBodies][ApplySingle] Added to appliedFields set');
      }

      toast.success(`${getFieldDisplayName(fieldName)} updated successfully!`);
    } catch (error) {
      console.error('Error updating field:', error);
      // 🔍 DEBUG: Enhanced error logging for geographic_features_actual
      if (suggestion.fieldName === 'geographic_features_actual') {
        console.error('[GeoFeatures] Update FAILED:', error);
      }
      // 🔍 DEBUG: Error logging for water_bodies (BUG FIX LOGGING)
      if (suggestion.fieldName === 'water_bodies') {
        console.error('[WaterBodies][ApplySingle] Update FAILED:', {
          error: error.message,
          stack: error.stack,
          suggestion
        });
      }
      toast.error(`Failed to update ${getFieldDisplayName(suggestion.fieldName)}`);
    } finally {
      setUpdatingField(null);
    }
  };

  // Save audit status to database
  // 🔄 PERSISTENCE: Also save final value alongside status (Updated Nov 14, 2025)
  const handleAuditStatusChange = async (fieldName, newStatus) => {
    setAuditStatuses(prev => ({ ...prev, [fieldName]: newStatus }));

    // Don't save empty/placeholder status to database
    if (!newStatus || newStatus === '') {
      return;
    }

    setSavingAuditStatus(fieldName);

    try {
      // Include current final value and suggestion metadata in audit_data
      const currentFinalValue = finalValues[fieldName];
      const suggestion = suggestions.find(s => s.fieldName === fieldName);

      const metadata = {
        finalValue: currentFinalValue,
        aiSuggestion: suggestion?.suggestedValue,
        confidence: suggestion?.confidence,
        currentDbValue: suggestion?.currentValue
      };

      const result = await saveFieldAuditStatus(town.id, fieldName, newStatus, supabase, metadata);

      if (!result.success) {
        toast.error(`Failed to save audit status: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving audit status:', error);
      toast.error('Failed to save audit status');
    } finally {
      setSavingAuditStatus(null);
    }
  };

  // Handle final value change
  const handleFinalValueChange = (fieldName, newValue) => {
    setFinalValues(prev => ({ ...prev, [fieldName]: newValue }));
    // Note: We do NOT auto-change audit status when editing
    // Admin must explicitly select audit status before updating
  };

  // Undo an applied field to allow re-editing
  const handleUndoApplied = (fieldName) => {
    setAppliedFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(fieldName);
      return newSet;
    });
    toast.success(`${getFieldDisplayName(fieldName)} unlocked for re-editing`, { duration: 2000 });
  };

  // Generate search query for field verification
  const generateSearchQuery = (fieldName) => {
    const label = getFieldDisplayName(fieldName);
    const location = `${town.town_name}, ${town.country}`;

    if (fieldName.includes('cost')) {
      return `what is the cost of living in ${location}? expected: monthly cost in USD`;
    } else if (fieldName.includes('score') || fieldName.includes('rating')) {
      return `what is the ${label.toLowerCase()} in ${location}?`;
    } else if (fieldName.includes('population')) {
      return `what is the population of ${location}?`;
    } else {
      return `what is the ${label.toLowerCase()} for ${location}?`;
    }
  };

  // AI Research handler
  const handleAIResearch = async (fieldName) => {
    if (!hasAnthropicAPIKey()) {
      toast.error('Anthropic API key not configured');
      return;
    }

    setResearchingField(fieldName);

    try {
      const townData = {
        town_name: town.town_name,
        country: town.country,
        state_code: town.state_code,
        [fieldName]: town[fieldName]
      };

      const result = await researchFieldWithContext(
        town.id,
        fieldName,
        townData,
        { searchQuery: generateSearchQuery(fieldName) }
      );

      if (result.success && result.suggestedValue) {
        // 🔧 FIX: Convert AI suggestion to editable string format (for arrays)
        const editableValue = toEditableString(result.suggestedValue);
        setFinalValues(prev => ({ ...prev, [fieldName]: editableValue }));
        toast.success(`AI suggests: ${editableValue}`, { duration: 5000 });
      } else {
        toast.error(`AI research failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('AI research error:', error);
      toast.error('AI research failed');
    } finally {
      setResearchingField(null);
    }
  };

  // Google Search handler
  const handleGoogleSearch = (fieldName) => {
    const searchQuery = generateSearchQuery(fieldName);
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(googleUrl, '_blank', 'width=1000,height=700');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {sessionTitle}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {town?.town_name}, {town?.country} - {sessionDescription}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={updatingField !== null}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isGenerating ? (
            // Generating suggestions state
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Generating AI Suggestions...
              </h3>
              {generationProgress && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Processing {generationProgress.current} of {generationProgress.total} fields
                  <br />
                  <span className="text-xs">({generationProgress.fieldName})</span>
                </p>
              )}
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            // 4-COLUMN AUDIT GRID
            <div className="space-y-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {(() => {
                    const totalFields = suggestions.length;
                    const completedFields = appliedFields.size;
                    const remainingFields = totalFields - completedFields;

                    if (completedFields === 0) {
                      return `Found ${totalFields} field${totalFields !== 1 ? 's' : ''} that need attention`;
                    } else if (remainingFields === 0) {
                      return `✅ All ${totalFields} field${totalFields !== 1 ? 's' : ''} updated!`;
                    } else {
                      return `${completedFields} of ${totalFields} fields updated • ${remainingFields} remaining`;
                    }
                  })()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  💡 Review each field, adjust the final value if needed, then click "Update This Field"
                </p>
              </div>

              {suggestions.map((suggestion) => (
                <FieldAuditRow
                  key={suggestion.fieldName}
                  suggestion={suggestion}
                  isApplied={appliedFields.has(suggestion.fieldName)}
                  isUpdating={updatingField === suggestion.fieldName}
                  auditStatus={auditStatuses[suggestion.fieldName] || 'unknown'}
                  finalValue={finalValues[suggestion.fieldName]}
                  onFinalValueChange={handleFinalValueChange}
                  onAuditStatusChange={handleAuditStatusChange}
                  onApplySingle={handleApplySingle}
                  onUndoApplied={() => handleUndoApplied(suggestion.fieldName)}
                  onAIResearch={handleAIResearch}
                  onGoogleSearch={handleGoogleSearch}
                  researchingField={researchingField}
                  savingAuditStatus={savingAuditStatus}
                />
              ))}
            </div>
          ) : (
            // No suggestions
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No fields need updating. This town looks complete!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {appliedFields.size} of {suggestions?.length || 0} field{suggestions?.length !== 1 ? 's' : ''} updated
          </p>
          <div className="flex gap-3">
            {/* Bulk Update All Button */}
            {suggestions && suggestions.length > 0 && (() => {
              // Build clean filtered list of fields ready for bulk update
              // ONLY include fields that meet ALL criteria:
              // 1. Has audit status selected (not empty string)
              // 2. Audit status is 'approved'
              // 3. Final value DIFFERS from current DB value (something changed)
              // 4. Not already applied (not in appliedFields set)
              const fieldsToUpdate = suggestions.filter(s => {
                const hasStatus = !!auditStatuses[s.fieldName] && auditStatuses[s.fieldName] !== '';
                const isApproved = auditStatuses[s.fieldName] === 'approved';

                // 🔧 FIX (water_bodies bug): Use same normalization as hydration check
                // This ensures array fields are lowercased, sorted, and compared correctly
                const finalNormalized = normalizeForAuditComparison(s.fieldName, finalValues[s.fieldName]);
                const currentNormalized = normalizeForAuditComparison(s.fieldName, s.currentValue);

                const isChanged = finalNormalized !== currentNormalized;
                const notApplied = !appliedFields.has(s.fieldName);

                // Debug logging for troubleshooting
                if (hasStatus && isApproved) {
                  console.log(`[BulkUpdate] ${s.fieldName}:`, {
                    hasStatus,
                    isApproved,
                    isChanged: `"${finalNormalized}" !== "${currentNormalized}" = ${isChanged}`,
                    notApplied
                  });
                }

                return hasStatus && isApproved && isChanged && notApplied;
              });

              const count = fieldsToUpdate.length;

              return count > 0 ? (
                <button
                  onClick={async () => {
                    // Prepare field names for confirmation (limit to first 5 if too many)
                    const fieldNames = fieldsToUpdate
                      .slice(0, 5)
                      .map(f => getFieldDisplayName(f.fieldName))
                      .join(', ');
                    const additionalCount = count > 5 ? ` and ${count - 5} more` : '';

                    // Singular/plural handling
                    const confirmMessage = count === 1
                      ? `Update 1 approved field?\n\n${fieldNames}`
                      : `Update ${count} approved fields?\n\n${fieldNames}${additionalCount}`;

                    console.log(`[SmartUpdate] Bulk update requested:`, {
                      townId: town.id,
                      count,
                      fields: fieldsToUpdate.map(f => f.fieldName)
                    });

                    if (confirm(confirmMessage)) {
                      // Apply updates sequentially
                      for (const suggestion of fieldsToUpdate) {
                        await handleApplySingle(suggestion);
                      }

                      // Success message with singular/plural
                      const successMessage = count === 1
                        ? 'Updated 1 field successfully!'
                        : `Updated ${count} fields successfully!`;
                      toast.success(successMessage);
                    }
                  }}
                  disabled={updatingField !== null}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {/* Button text with proper singular/plural */}
                  {count === 1 ? 'Update 1 Approved Field' : `Update All ${count} Approved Fields`}
                </button>
              ) : null;
            })()}

            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              {appliedFields.size > 0 ? 'Done' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateTownModal;
