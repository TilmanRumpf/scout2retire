import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  getFieldDisplayName,
  getConfidenceIcon,
  getFieldExplanation
} from '../../utils/admin/bulkUpdateTown';

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
  const [selectedSuggestions, setSelectedSuggestions] = useState({});
  const [isApplying, setIsApplying] = useState(false);

  // Initialize selected state from suggestions
  useEffect(() => {
    if (suggestions && suggestions.length > 0) {
      const initialSelected = {};
      suggestions.forEach(suggestion => {
        // Only auto-select if has a valid suggested value
        initialSelected[suggestion.fieldName] = suggestion.selected &&
                                                 suggestion.suggestedValue !== null;
      });
      setSelectedSuggestions(initialSelected);
    }
  }, [suggestions]);

  if (!isOpen) return null;

  const toggleSelection = (fieldName) => {
    setSelectedSuggestions(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const selectAll = () => {
    const allSelected = {};
    suggestions.forEach(s => {
      if (s.suggestedValue !== null) {
        allSelected[s.fieldName] = true;
      }
    });
    setSelectedSuggestions(allSelected);
  };

  const selectNone = () => {
    setSelectedSuggestions({});
  };

  const handleApply = async () => {
    const selected = suggestions.filter(s => selectedSuggestions[s.fieldName]);

    if (selected.length === 0) {
      return;
    }

    setIsApplying(true);
    await onApplyUpdates(selected);
    setIsApplying(false);
  };

  const selectedCount = Object.values(selectedSuggestions).filter(Boolean).length;

  // Truncate long text for display
  const truncate = (text, maxLength = 100) => {
    if (!text) return '(empty)';
    const str = String(text);
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
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
            disabled={isApplying}
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
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Found {suggestions.length} fields that need attention
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={selectNone}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    Select None
                  </button>
                </div>
              </div>

              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.fieldName}
                  className={`border rounded-lg p-4 transition-all ${
                    selectedSuggestions[suggestion.fieldName]
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  } ${
                    suggestion.suggestedValue === null
                      ? 'opacity-50'
                      : 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                  onClick={() => {
                    if (suggestion.suggestedValue !== null) {
                      toggleSelection(suggestion.fieldName);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedSuggestions[suggestion.fieldName] || false}
                        onChange={() => toggleSelection(suggestion.fieldName)}
                        disabled={suggestion.suggestedValue === null}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
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
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded px-3 py-2 font-mono">
                      {truncate(suggestion.currentValue)}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="text-center my-2">
                    <span className="text-blue-500 text-xl">↓</span>
                  </div>

                  {/* Suggested value */}
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Suggested:</div>
                    <div className="text-sm text-gray-900 dark:text-white bg-green-50 dark:bg-green-900/20 rounded px-3 py-2 font-mono border border-green-200 dark:border-green-800">
                      {suggestion.suggestedValue !== null ? (
                        truncate(suggestion.suggestedValue)
                      ) : (
                        <span className="text-red-600 dark:text-red-400">
                          {suggestion.reason}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reason/explanation */}
                  {suggestion.reason && suggestion.suggestedValue !== null && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
                      {suggestion.reason}
                    </div>
                  )}
                </div>
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
            {selectedCount} field{selectedCount !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isApplying}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={selectedCount === 0 || isApplying || isGenerating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isApplying ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Applying...
                </>
              ) : (
                `Update ${selectedCount} Field${selectedCount !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateTownModal;
