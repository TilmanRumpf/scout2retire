/**
 * CULTURE PANEL - WITH INLINE EDITING
 *
 * Shows culture data with INLINE EDITING capability
 * Follows same pattern as ScoreBreakdownPanel
 *
 * Created: 2025-10-18
 */

import React, { useState, useEffect } from 'react';
import EditableDataField from '../EditableDataField';
import { checkAdminAccess } from '../../utils/paywallUtils';

export default function CulturePanel({ town, onTownUpdate }) {
  const [isExecutiveAdmin, setIsExecutiveAdmin] = useState(false);

  useEffect(() => {
    const checkExecAdmin = async () => {
      const hasAccess = await checkAdminAccess('executive_admin');
      setIsExecutiveAdmin(hasAccess);
    };
    checkExecAdmin();
  }, []);

  const [expandedSections, setExpandedSections] = useState({
    language: true,
    lifestyle: true,
    community: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const EditableField = ({ field, value, label, type = 'string', range, description }) => {
    return (
      <EditableDataField
        label={label}
        value={value}
        field={field}
        townId={town.id}
        townName={town.name}
        countryName={town.country}
        type={type}
        range={range}
        description={description}
        isExecutiveAdmin={isExecutiveAdmin}
        onUpdate={(field, newValue) => {
          if (onTownUpdate) {
            onTownUpdate(field, newValue);
          }
        }}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Language & Communication */}
      <div>
        <button
          onClick={() => toggleSection('language')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🗣️ Language & Communication
          </h3>
          <span className="text-gray-500">{expandedSections.language ? '▼' : '▶'}</span>
        </button>

        {expandedSections.language && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="primary_language"
              value={town.primary_language}
              label="Primary Language"
              type="string"
              description="Main language spoken in the area"
            />
            <EditableField
              field="english_proficiency_level"
              value={town.english_proficiency_level}
              label="English Proficiency Level"
              type="select"
              range={['minimal', 'low', 'moderate', 'high', 'widespread']}
              description="How widely English is spoken"
            />
          </div>
        )}
      </div>

      {/* Lifestyle & Pace */}
      <div>
        <button
          onClick={() => toggleSection('lifestyle')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🏖️ Lifestyle & Pace
          </h3>
          <span className="text-gray-500">{expandedSections.lifestyle ? '▼' : '▶'}</span>
        </button>

        {expandedSections.lifestyle && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="pace_of_life_actual"
              value={town.pace_of_life_actual}
              label="Pace of Life"
              type="select"
              range={['slow', 'relaxed', 'moderate', 'fast']}
              description="General pace of daily life"
            />
            <EditableField
              field="social_atmosphere"
              value={town.social_atmosphere}
              label="Social Atmosphere"
              type="select"
              range={['reserved', 'quiet', 'moderate', 'friendly', 'vibrant', 'very friendly']}
              description="How social and welcoming the community is"
            />
            <EditableField
              field="traditional_progressive_lean"
              value={town.traditional_progressive_lean}
              label="Traditional vs Progressive"
              type="select"
              range={['traditional', 'moderate', 'balanced', 'progressive']}
              description="Cultural attitude towards tradition vs progress"
            />
          </div>
        )}
      </div>

      {/* Community & Events */}
      <div>
        <button
          onClick={() => toggleSection('community')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            👥 Community & Events
          </h3>
          <span className="text-gray-500">{expandedSections.community ? '▼' : '▶'}</span>
        </button>

        {expandedSections.community && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="expat_community_size"
              value={town.expat_community_size}
              label="Expat Community Size"
              type="select"
              range={['small', 'moderate', 'large']}
              description="Size of the expatriate community"
            />
            <EditableField
              field="retirement_community_presence"
              value={town.retirement_community_presence}
              label="Retirement Community Presence"
              type="select"
              range={['none', 'minimal', 'limited', 'moderate', 'strong', 'extensive', 'very_strong']}
              description="Presence of retirement-focused communities"
            />
            <EditableField
              field="cultural_events_frequency"
              value={town.cultural_events_frequency}
              label="Cultural Events Frequency"
              type="select"
              range={['rare', 'occasional', 'monthly', 'frequent', 'weekly', 'constant', 'daily']}
              description="How often cultural events and festivals occur"
            />
            <EditableField
              field="local_festivals"
              value={town.local_festivals}
              label="Local Festivals"
              type="text"
              description="Names or descriptions of local festivals and celebrations"
            />
          </div>
        )}
      </div>
    </div>
  );
}
