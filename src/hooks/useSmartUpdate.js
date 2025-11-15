// src/hooks/useSmartUpdate.js

/**
 * Smart Update Hook
 * Extracted from TownsManager.jsx to reduce component size
 *
 * Handles:
 * - Generating update suggestions
 * - Managing update modal state
 * - Progress tracking
 *
 * Created: November 14, 2025 - TownsManager refactor
 */

import { useState } from 'react';
import {
  analyzeTownCompleteness,
  generateUpdateSuggestions
} from '../utils/admin/bulkUpdateTown';

export function useSmartUpdate() {
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateSuggestions, setUpdateSuggestions] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(null);
  const [updateMode, setUpdateMode] = useState('critical'); // 'critical' or 'supplemental'
  const [currentTabFilter, setCurrentTabFilter] = useState(null);

  /**
   * Generate smart update suggestions for a town
   */
  const generateSuggestions = async (town, auditResults, mode = 'critical', tabFilter = null) => {
    setUpdateLoading(true);
    setGenerationProgress(null);
    setUpdateMode(mode);
    setCurrentTabFilter(tabFilter);

    try {
      // Analyze which fields need attention
      const analysis = analyzeTownCompleteness(town, auditResults, mode, tabFilter);
      const fieldsToUpdate = analysis.priorityFields || [];

      if (fieldsToUpdate.length === 0) {
        setUpdateLoading(false);
        return { success: true, count: 0 };
      }

      // Generate AI suggestions
      const suggestions = await generateUpdateSuggestions(
        town,
        fieldsToUpdate,
        (progress) => setGenerationProgress(progress)
      );

      setUpdateSuggestions(suggestions);
      setUpdateModalOpen(true);
      setUpdateLoading(false);

      return { success: true, count: suggestions.length };
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setUpdateLoading(false);
      return { success: false, error: error.message };
    }
  };

  /**
   * Close update modal and reset state
   */
  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setUpdateSuggestions([]);
    setGenerationProgress(null);
  };

  return {
    updateModalOpen,
    updateSuggestions,
    updateLoading,
    generationProgress,
    updateMode,
    currentTabFilter,
    generateSuggestions,
    closeUpdateModal,
    setUpdateModalOpen,
    setUpdateMode,
    setUpdateSuggestions,
    setUpdateLoading,
    setGenerationProgress,
    setCurrentTabFilter
  };
}
