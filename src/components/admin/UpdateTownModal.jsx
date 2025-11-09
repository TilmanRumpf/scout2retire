import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getFieldDisplayName,
  getConfidenceIcon,
  getFieldExplanation
} from '../../utils/admin/bulkUpdateTown';
import { researchFieldWithContext, hasAnthropicAPIKey } from '../../utils/aiResearch';

/**
 * Modal for previewing and applying AI-generated town data updates
 */
const UpdateTownModal = ({
  isOpen,
  onClose,
  town,
  suggestions,
  onApplyUpdates,
  isGenerating = false,
  generationProgress = null,
  mode = 'critical' // 'critical' or 'supplemental'
}) => {
  const sessionTitle = mode === 'critical'
    ? 'Session 1: Fix Algorithm-Critical Fields'
    : 'Session 2: Add Supplemental Details';
  const sessionDescription = mode === 'critical'
    ? 'These fields are required for scoring algorithm to work properly'
    : 'Nice-to-have details that enhance user experience';
  const [researchingField, setResearchingField] = useState(null); // Track which field is being researched
  const [updatingField, setUpdatingField] = useState(null); // Track which field is being updated
  const [appliedFields, setAppliedFields] = useState(new Set()); // Track which fields have been applied
  const [manualInputs, setManualInputs] = useState({}); // Track manual input values per field

  // Reset applied fields when suggestions change
  useEffect(() => {
    setAppliedFields(new Set());
  }, [suggestions]);

  if (!isOpen) return null;

  // Apply individual field update
  const handleApplySingle = async (suggestion) => {
    setUpdatingField(suggestion.fieldName);

    try {
      // Use manual input if provided, otherwise use AI suggestion
      const valueToApply = manualInputs[suggestion.fieldName] !== undefined && manualInputs[suggestion.fieldName] !== ''
        ? manualInputs[suggestion.fieldName]
        : suggestion.suggestedValue;

      const updatedSuggestion = {
        ...suggestion,
        suggestedValue: valueToApply
      };

      await onApplyUpdates([updatedSuggestion]);
      setAppliedFields(prev => new Set([...prev, suggestion.fieldName]));
      toast.success(`${getFieldDisplayName(suggestion.fieldName)} updated successfully!`);

      // Clear manual input after successful update
      setManualInputs(prev => {
        const updated = { ...prev };
        delete updated[suggestion.fieldName];
        return updated;
      });
    } catch (error) {
      console.error('Error updating field:', error);
      toast.error(`Failed to update ${getFieldDisplayName(suggestion.fieldName)}`);
    } finally {
      setUpdatingField(null);
    }
  };

  // Generate search query for field verification
  const generateSearchQuery = (fieldName) => {
    const label = getFieldDisplayName(fieldName);
    const location = `${town.town_name}, ${town.country}`;

    // Generate smart query based on field type
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
        toast.success(`AI suggests: ${result.suggestedValue}`, { duration: 5000 });
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

  // Format text for display - NO TRUNCATION for admin review
  const formatValue = (text) => {
    if (!text) return '(empty)';
    return String(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
            // Suggestions list
            <div className="space-y-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Found {suggestions.length} field{suggestions.length !== 1 ? 's' : ''} that need attention
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  💡 Verify each suggestion, then click "Update This Field" to apply individually
                </p>
              </div>

              {suggestions.map((suggestion) => {
                const isApplied = appliedFields.has(suggestion.fieldName);
                const isUpdating = updatingField === suggestion.fieldName;

                return (
                  <div
                    key={suggestion.fieldName}
                    className={`border rounded-lg p-4 transition-all ${
                      isApplied
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 opacity-75'
                        : suggestion.suggestedValue === null
                        ? 'border-gray-300 dark:border-gray-600 opacity-50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isApplied && (
                          <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {getFieldDisplayName(suggestion.fieldName)}
                        </span>
                      </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Priority: {suggestion.priority}
                      </span>
                      <span
                        className="text-sm px-2 py-1 rounded"
                        style={{
                          backgroundColor: suggestion.confidence === 'high' ? '#10b981' :
                                          suggestion.confidence === 'limited' ? '#f59e0b' :
                                          suggestion.confidence === 'low' ? '#ef4444' : '#6b7280',
                          color: 'white'
                        }}
                        title={suggestion.confidence}
                      >
                        {getConfidenceIcon(suggestion.confidence)} {suggestion.confidence}
                      </span>
                    </div>
                  </div>

                  {/* Why this matters - Plain English explanation */}
                  <div className="mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                    <div className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                      Why This Matters:
                    </div>
                    <div className="text-xs text-blue-800 dark:text-blue-200">
                      {getFieldExplanation(suggestion.fieldName)}
                    </div>
                  </div>

                  {/* Current value */}
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current:</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded px-3 py-2 font-mono max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {formatValue(suggestion.currentValue)}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="text-center my-2">
                    <span className="text-blue-500 text-xl">↓</span>
                  </div>

                  {/* Suggested value */}
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Suggested:</div>
                    <div className="text-sm text-gray-900 dark:text-white bg-green-50 dark:bg-green-900/20 rounded px-3 py-2 font-mono border border-green-200 dark:border-green-800 max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {suggestion.suggestedValue !== null ? (
                        formatValue(suggestion.suggestedValue)
                      ) : (
                        <span className="text-red-600 dark:text-red-400">
                          {suggestion.reason}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Research Buttons - Verify suggestion */}
                  {suggestion.suggestedValue !== null && !isApplied && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAIResearch(suggestion.fieldName)}
                          disabled={researchingField === suggestion.fieldName || isUpdating}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
                          title="Get another AI opinion to verify this suggestion"
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
                          onClick={() => handleGoogleSearch(suggestion.fieldName)}
                          disabled={isUpdating}
                          className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 border-2 border-green-500 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-sm disabled:opacity-50"
                          title="Search Google to verify this value"
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

                      {/* Manual Input Field */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Your Best Estimate (optional - overrides AI suggestion):
                        </label>
                        <input
                          type="text"
                          value={manualInputs[suggestion.fieldName] || ''}
                          onChange={(e) => setManualInputs(prev => ({
                            ...prev,
                            [suggestion.fieldName]: e.target.value
                          }))}
                          placeholder="Enter your own value if AI is incorrect"
                          disabled={isUpdating}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        />
                      </div>

                      {/* Update This Field Button */}
                      <button
                        onClick={() => handleApplySingle(suggestion)}
                        disabled={isUpdating}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-md"
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
                  )}

                  {isApplied && (
                    <div className="mt-3 px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-center">
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">
                        ✓ Applied Successfully
                      </span>
                    </div>
                  )}

                  {/* Reason/explanation */}
                  {suggestion.reason && suggestion.suggestedValue !== null && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
                      {suggestion.reason}
                    </div>
                  )}
                </div>
              )
              })}
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
            {suggestions && suggestions.length > 0 && appliedFields.size < suggestions.filter(s => s.suggestedValue !== null).length && (
              <button
                onClick={async () => {
                  const unappliedSuggestions = suggestions.filter(s =>
                    s.suggestedValue !== null && !appliedFields.has(s.fieldName)
                  );

                  if (confirm(`Update all ${unappliedSuggestions.length} remaining fields at once?`)) {
                    for (const suggestion of unappliedSuggestions) {
                      await handleApplySingle(suggestion);
                    }
                  }
                }}
                disabled={updatingField !== null}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Update All {suggestions.filter(s => s.suggestedValue !== null && !appliedFields.has(s.fieldName)).length} Fields
              </button>
            )}

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
