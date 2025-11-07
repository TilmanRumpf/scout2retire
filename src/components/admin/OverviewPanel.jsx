/**
 * OVERVIEW PANEL - WITH INLINE EDITING
 *
 * Shows overview data with INLINE EDITING capability
 * Includes photos, descriptions, scores, and timestamps
 *
 * Created: 2025-10-18
 */

import React, { useState, useEffect } from 'react';
import EditableDataField from '../EditableDataField';
import { checkAdminAccess } from '../../utils/paywallUtils';
import TownPhotoUpload from './TownPhotoUpload';
import supabase from '../../utils/supabaseClient';

export default function OverviewPanel({ town, onTownUpdate, auditResults = {} }) {
  const [isExecutiveAdmin, setIsExecutiveAdmin] = useState(false);
  const [createdByUser, setCreatedByUser] = useState(null);
  const [updatedByUser, setUpdatedByUser] = useState(null);

  // Check if user is executive admin
  useEffect(() => {
    const checkExecAdmin = async () => {
      const hasAccess = await checkAdminAccess('executive_admin');
      setIsExecutiveAdmin(hasAccess);
    };
    checkExecAdmin();
  }, []);

  // Fetch user information for created_by and updated_by fields
  useEffect(() => {
    const fetchUserInfo = async () => {
      // Fetch created_by user
      if (town.created_by) {
        const { data: creator } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', town.created_by)
          .single();
        setCreatedByUser(creator);
      } else {
        setCreatedByUser(null);
      }

      // Fetch updated_by user
      if (town.updated_by) {
        const { data: updater } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', town.updated_by)
          .single();
        setUpdatedByUser(updater);
      } else {
        setUpdatedByUser(null);
      }
    };

    fetchUserInfo();
  }, [town.created_by, town.updated_by]);

  // Auto-expand all sections
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    photos: true,
    descriptions: true,
    metadata: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper function to get confidence indicator - returns either a color class or 'critical' for special rendering
  const getConfidenceIndicator = (field) => {
    const confidence = auditResults[field] || 'unknown';
    switch (confidence) {
      case 'high':
        return { type: 'color', value: 'bg-green-500' };
      case 'limited':
        return { type: 'color', value: 'bg-yellow-500' };
      case 'low':
        return { type: 'color', value: 'bg-red-500' };
      case 'critical':
        return { type: 'icon', value: 'lightning' }; // Special lightning bolt icon
      case 'not_editable':
        return { type: 'color', value: 'bg-black' };
      case 'unknown':
      default:
        return { type: 'color', value: 'bg-gray-300' };
    }
  };

  // Backward compatibility - still support getConfidenceColor for simple cases
  const getConfidenceColor = (field) => {
    const confidence = auditResults[field] || 'unknown';
    switch (confidence) {
      case 'high':
        return 'bg-green-500';
      case 'limited':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-red-500';
      case 'critical':
        return 'bg-orange-500';
      case 'not_editable':
        return 'bg-black';
      case 'unknown':
      default:
        return 'bg-gray-300';
    }
  };

  // Get tooltip text for confidence levels
  const getConfidenceTooltip = (confidence) => {
    switch (confidence) {
      case 'high':
        return '🟢 High confidence - Safe to edit';
      case 'limited':
        return '🟡 Limited confidence - Edit with caution';
      case 'low':
        return '🔴 Low confidence - Needs verification';
      case 'critical':
        return '⚡ CRITICAL - Editable but has system-wide impact!';
      case 'not_editable':
        return '⚫ Non-editable system field';
      case 'unknown':
      default:
        return '⚪ Unknown - Not audited yet';
    }
  };

  // Helper component for editable fields
  const EditableField = ({ field, value, label, type = 'string', range, description, forceConfidence }) => {
    return (
      <EditableDataField
        label={label}
        value={value}
        field={field}
        townId={town.id}
        townName={town.town_name}
        countryName={town.country}
        subdivisionCode={town.region}
        type={type}
        range={range}
        description={description}
        isExecutiveAdmin={isExecutiveAdmin}
        confidence={forceConfidence || auditResults[field] || 'unknown'}
        onUpdate={(field, newValue) => {
          if (onTownUpdate) {
            onTownUpdate(field, newValue);
          }
        }}
      />
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '(not set)';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <button
          onClick={() => toggleSection('basic')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            📋 Basic Information
          </h3>
          <span className="text-gray-500">{expandedSections.basic ? '▼' : '▶'}</span>
        </button>

        {expandedSections.basic && (
          <div className="space-y-2 pl-4">
            {/* Town Name (EDITABLE WITH WARNINGS) */}
            <EditableField
              field="town_name"
              value={town.town_name}
              label="Town Name"
              type="string"
              forceConfidence="critical"
              description="⚠️ CRITICAL FIELD: Changing this will NOT update descriptions or verbose fields that reference the old name. Use with extreme caution!"
            />

            {/* Country (Display Only) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Country
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    country
                  </div>
                </div>
                <div className="group/tooltip relative inline-block">
                  <div className={`w-3 h-3 rounded-full bg-black cursor-help`} />
                  <div className="hidden group-hover/tooltip:block absolute right-0 top-5 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-50">
                    {getConfidenceTooltip('not_editable')}
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {town.country || <span className="text-red-500 italic">(not set)</span>}
                </div>
              </div>
            </div>

            {/* State Code (Display Only) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Region
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    region
                  </div>
                </div>
                <div className="group/tooltip relative inline-block">
                  <div className={`w-3 h-3 rounded-full bg-black cursor-help`} />
                  <div className="hidden group-hover/tooltip:block absolute right-0 top-5 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-50">
                    {getConfidenceTooltip('not_editable')}
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {town.region || <span className="text-gray-500 italic">(not specified)</span>}
                </div>
              </div>
            </div>

            {/* Overall Score (Display Only) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Overall Score
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    quality_of_life
                  </div>
                </div>
                <div className="group/tooltip relative inline-block">
                  <div className={`w-3 h-3 rounded-full ${getConfidenceColor('quality_of_life')} cursor-help`} />
                  <div className="hidden group-hover/tooltip:block absolute right-0 top-5 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-50">
                    {getConfidenceTooltip(auditResults['quality_of_life'] || 'unknown')}
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <div className="text-sm font-bold text-blue-900 dark:text-blue-100">
                  {town.quality_of_life !== null && town.quality_of_life !== undefined
                    ? `${town.quality_of_life}%`
                    : <span className="text-red-500 italic">(not calculated)</span>
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Photos */}
      <div>
        <button
          onClick={() => toggleSection('photos')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            📸 Photos
          </h3>
          <span className="text-gray-500">{expandedSections.photos ? '▼' : '▶'}</span>
        </button>

        {expandedSections.photos && (
          <div className="pl-4">
            <TownPhotoUpload
              town={town}
              onPhotoUpdate={(updatedTown) => {
                // Update all three photo fields at once
                if (onTownUpdate) {
                  Object.keys(updatedTown).forEach(key => {
                    if (key.startsWith('image_url_')) {
                      onTownUpdate(key, updatedTown[key]);
                    }
                  });
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Descriptions & Summaries */}
      <div>
        <button
          onClick={() => toggleSection('descriptions')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            📝 Descriptions & Summaries
          </h3>
          <span className="text-gray-500">{expandedSections.descriptions ? '▼' : '▶'}</span>
        </button>

        {expandedSections.descriptions && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="description"
              value={town.description}
              label="Short Description"
              type="text"
              description="Brief description of the town (used in search results and previews)"
            />

            {town.verbose_description !== undefined && (
              <EditableField
                field="verbose_description"
                value={town.verbose_description}
                label="Verbose Description"
                type="text"
                description="Detailed description with more information about the town"
              />
            )}

            {town.summary !== undefined && (
              <EditableField
                field="summary"
                value={town.summary}
                label="Summary"
                type="text"
                description="Quick summary highlighting key features"
              />
            )}

            {town.appealStatement !== undefined && (
              <EditableField
                field="appealStatement"
                value={town.appealStatement}
                label="Appeal Statement"
                type="text"
                description="Statement describing what makes this town appealing for retirees"
              />
            )}
          </div>
        )}
      </div>

      {/* Metadata & Timestamps */}
      <div>
        <button
          onClick={() => toggleSection('metadata')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🕒 Metadata & Timestamps
          </h3>
          <span className="text-gray-500">{expandedSections.metadata ? '▼' : '▶'}</span>
        </button>

        {expandedSections.metadata && (
          <div className="space-y-2 pl-4">
            {/* Town ID (Display Only) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Town ID
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    id
                  </div>
                </div>
                <div className="group/tooltip relative inline-block">
                  <div className={`w-3 h-3 rounded-full bg-black cursor-help`} />
                  <div className="hidden group-hover/tooltip:block absolute right-0 top-5 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-50">
                    {getConfidenceTooltip('not_editable')}
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
                  {town.id}
                </div>
              </div>
            </div>

            {/* Created At (Display Only) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Created At
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    created_at
                  </div>
                </div>
                <div className="group/tooltip relative inline-block">
                  <div className={`w-3 h-3 rounded-full bg-black cursor-help`} />
                  <div className="hidden group-hover/tooltip:block absolute right-0 top-5 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-50">
                    {getConfidenceTooltip('not_editable')}
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(town.created_at)}
                </div>
              </div>
            </div>

            {/* Updated At (Display Only) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Updated At
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    updated_at
                  </div>
                </div>
                <div className="group/tooltip relative inline-block">
                  <div className={`w-3 h-3 rounded-full bg-black cursor-help`} />
                  <div className="hidden group-hover/tooltip:block absolute right-0 top-5 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-50">
                    {getConfidenceTooltip('not_editable')}
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(town.updated_at)}
                </div>
              </div>
            </div>

            {/* Last AI Update (if exists) */}
            {town.last_ai_update !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last AI Update
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      last_ai_update
                    </div>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full bg-black`}
                    title="Non-editable field"
                  />
                </div>
                <div className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                  <div className="text-sm text-purple-900 dark:text-purple-100">
                    {formatDate(town.last_ai_update)}
                  </div>
                </div>
              </div>
            )}

            {/* Created By (if exists) */}
            {town.created_by && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Created By
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      created_by
                    </div>
                  </div>
                  <div className="group/tooltip relative inline-block">
                    <div className={`w-3 h-3 rounded-full bg-black cursor-help`} />
                    <div className="hidden group-hover/tooltip:block absolute right-0 top-5 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-50">
                      {getConfidenceTooltip('not_editable')}
                    </div>
                  </div>
                </div>
                <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    {createdByUser ? (
                      <>
                        {createdByUser.full_name && <div className="font-medium">{createdByUser.full_name}</div>}
                        <div className={createdByUser.full_name ? 'text-xs' : ''}>{createdByUser.email}</div>
                      </>
                    ) : (
                      <span className="text-gray-500 italic">Loading...</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Last Modified By - ALWAYS SHOW */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Modified By
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    updated_by
                  </div>
                </div>
                <div className="group/tooltip relative inline-block">
                  <div className={`w-3 h-3 rounded-full bg-black cursor-help`} />
                  <div className="hidden group-hover/tooltip:block absolute right-0 top-5 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-50">
                    {getConfidenceTooltip('not_editable')}
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <div className="text-sm text-green-900 dark:text-green-100">
                  {town.updated_by && updatedByUser ? (
                    <>
                      {updatedByUser.full_name && <div className="font-medium">{updatedByUser.full_name}</div>}
                      <div className={updatedByUser.full_name ? 'text-xs' : ''}>{updatedByUser.email}</div>
                    </>
                  ) : town.updated_by && !updatedByUser ? (
                    <span className="text-gray-500 italic">Loading...</span>
                  ) : (
                    <span className="text-gray-500 italic">Unknown - Not tracked yet</span>
                  )}
                </div>
              </div>
            </div>

            {/* Data Source (if exists) */}
            {town.data_source !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Data Source
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      data_source
                    </div>
                  </div>
                </div>
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {town.data_source || <span className="text-gray-500 italic">(not specified)</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
