/**
 * SAFETY PANEL - WITH INLINE EDITING
 *
 * Shows safety data with INLINE EDITING capability
 * Follows same pattern as CulturePanel and ClimatePanel
 *
 * Created: 2025-10-18
 */

import React, { useState, useEffect } from 'react';
import EditableDataField from '../EditableDataField';
import { checkAdminAccess } from '../../utils/paywallUtils';
import { VALID_CATEGORICAL_VALUES } from '../../utils/validation/categoricalValues';

export default function SafetyPanel({ town, onTownUpdate }) {
  const [isExecutiveAdmin, setIsExecutiveAdmin] = useState(false);

  useEffect(() => {
    const checkExecAdmin = async () => {
      const hasAccess = await checkAdminAccess('executive_admin');
      setIsExecutiveAdmin(hasAccess);
    };
    checkExecAdmin();
  }, []);

  const [expandedSections, setExpandedSections] = useState({
    scores: true,
    crime: true,
    stability: true,
    disasters: true
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
        townName={town.town_name}
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
      {/* Safety Scores */}
      <div>
        <button
          onClick={() => toggleSection('scores')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ⭐ Safety Scores
          </h3>
          <span className="text-gray-500">{expandedSections.scores ? '▼' : '▶'}</span>
        </button>

        {expandedSections.scores && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="safety_score"
              value={town.safety_score}
              label="Safety Score"
              type="number"
              range="1-10"
              description="Overall safety score (1-10 scale)"
            />
            <EditableField
              field="safety_description"
              value={town.safety_description}
              label="Safety Description"
              type="text"
              description="General description of safety conditions"
            />
          </div>
        )}
      </div>

      {/* Crime Statistics */}
      <div>
        <button
          onClick={() => toggleSection('crime')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🚓 Crime Statistics
          </h3>
          <span className="text-gray-500">{expandedSections.crime ? '▼' : '▶'}</span>
        </button>

        {expandedSections.crime && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="crime_rate"
              value={town.crime_rate}
              label="Crime Rate"
              type="select"
              range={VALID_CATEGORICAL_VALUES.crime_rate}
              description="Overall crime rate level"
            />
          </div>
        )}
      </div>

      {/* Political Stability */}
      <div>
        <button
          onClick={() => toggleSection('stability')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🏛️ Political Stability
          </h3>
          <span className="text-gray-500">{expandedSections.stability ? '▼' : '▶'}</span>
        </button>

        {expandedSections.stability && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="political_stability_rating"
              value={town.political_stability_rating}
              label="Political Stability Rating"
              type="number"
              range="1-10"
              description="Political stability and governance rating (1-10 scale)"
            />
          </div>
        )}
      </div>

      {/* Natural Disasters */}
      <div>
        <button
          onClick={() => toggleSection('disasters')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🌪️ Natural Disasters
          </h3>
          <span className="text-gray-500">{expandedSections.disasters ? '▼' : '▶'}</span>
        </button>

        {expandedSections.disasters && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="natural_disaster_risk"
              value={town.natural_disaster_risk}
              label="Natural Disaster Risk"
              type="select"
              range={VALID_CATEGORICAL_VALUES.natural_disaster_risk_level}
              description="Overall natural disaster risk level"
            />
            <EditableField
              field="natural_disaster_risk_score"
              value={town.natural_disaster_risk_score}
              label="Natural Disaster Risk Score"
              type="number"
              range="1-10"
              description="Natural disaster risk score (1-10 scale, 1=lowest risk)"
            />
          </div>
        )}
      </div>
    </div>
  );
}
