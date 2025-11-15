// src/hooks/useAuditManagement.js

/**
 * Audit Management Hook
 * Extracted from TownsManager.jsx to reduce component size
 *
 * Handles:
 * - Loading audit results from database
 * - Running AI audits
 * - Managing audit state
 *
 * Created: November 14, 2025 - TownsManager refactor
 */

import { useState } from 'react';
import { auditTownData, loadAuditResults } from '../utils/auditTown';

export function useAuditManagement(supabase) {
  const [auditResults, setAuditResults] = useState({});
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditedFields, setAuditedFields] = useState({});

  /**
   * Load audit results for a town
   */
  const loadAudits = async (townId) => {
    try {
      const results = await loadAuditResults(townId, supabase);
      setAuditResults(results);
      return results;
    } catch (error) {
      console.error('Error loading audits:', error);
      return {};
    }
  };

  /**
   * Run AI audit on a town
   */
  const runAudit = async (townData) => {
    setAuditLoading(true);
    try {
      const result = await auditTownData(townData, supabase);
      if (result.success) {
        setAuditResults(result.fieldConfidence);
        return result;
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Audit error:', error);
      return { success: false, error: error.message };
    } finally {
      setAuditLoading(false);
    }
  };

  return {
    auditResults,
    auditLoading,
    auditedFields,
    setAuditedFields,
    loadAudits,
    runAudit
  };
}
