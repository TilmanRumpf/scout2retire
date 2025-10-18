/**
 * CLIMATE PANEL - WITH INLINE EDITING
 *
 * Shows climate data with INLINE EDITING capability
 * Follows same pattern as ScoreBreakdownPanel
 *
 * Created: 2025-10-18
 */

import React, { useState, useEffect } from 'react';
import EditableDataField from '../EditableDataField';
import LegacyFieldsSection from './LegacyFieldsSection';
import { checkAdminAccess } from '../../utils/paywallUtils';

export default function ClimatePanel({ town, onTownUpdate }) {
  const [isExecutiveAdmin, setIsExecutiveAdmin] = useState(false);

  useEffect(() => {
    const checkExecAdmin = async () => {
      const hasAccess = await checkAdminAccess('executive_admin');
      setIsExecutiveAdmin(hasAccess);
    };
    checkExecAdmin();
  }, []);

  const [expandedSections, setExpandedSections] = useState({
    summer: true,
    winter: true,
    general: true
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
      {/* Summer Climate */}
      <div>
        <button
          onClick={() => toggleSection('summer')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ☀️ Summer Climate
          </h3>
          <span className="text-gray-500">{expandedSections.summer ? '▼' : '▶'}</span>
        </button>

        {expandedSections.summer && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="avg_temp_summer"
              value={town.avg_temp_summer}
              label="Average Summer Temperature (°C)"
              type="number"
              range="-50 to 50"
              description="Average temperature during summer months in Celsius"
            />
            <EditableField
              field="summer_climate_actual"
              value={town.summer_climate_actual}
              label="Summer Climate"
              type="string"
              description="Description of summer climate conditions"
            />
          </div>
        )}
      </div>

      {/* Winter Climate */}
      <div>
        <button
          onClick={() => toggleSection('winter')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ❄️ Winter Climate
          </h3>
          <span className="text-gray-500">{expandedSections.winter ? '▼' : '▶'}</span>
        </button>

        {expandedSections.winter && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="avg_temp_winter"
              value={town.avg_temp_winter}
              label="Average Winter Temperature (°C)"
              type="number"
              range="-50 to 30"
              description="Average temperature during winter months in Celsius"
            />
            <EditableField
              field="winter_climate_actual"
              value={town.winter_climate_actual}
              label="Winter Climate"
              type="string"
              description="Description of winter climate conditions"
            />
          </div>
        )}
      </div>

      {/* General Climate */}
      <div>
        <button
          onClick={() => toggleSection('general')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🌍 General Climate
          </h3>
          <span className="text-gray-500">{expandedSections.general ? '▼' : '▶'}</span>
        </button>

        {expandedSections.general && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="sunshine_level_actual"
              value={town.sunshine_level_actual}
              label="Sunshine Level"
              type="select"
              range={['low', 'less_sunny', 'balanced', 'high', 'often_sunny']}
              description="Amount of sunshine throughout the year"
            />
            <EditableField
              field="sunshine_hours"
              value={town.sunshine_hours}
              label="Annual Sunshine Hours"
              type="number"
              range="0-4500"
              description="Total sunshine hours per year"
            />
            <EditableField
              field="precipitation_level_actual"
              value={town.precipitation_level_actual}
              label="Precipitation Level"
              type="select"
              range={['low', 'mostly_dry', 'balanced', 'high', 'less_dry']}
              description="Amount of rainfall/precipitation"
            />
            <EditableField
              field="annual_rainfall"
              value={town.annual_rainfall}
              label="Annual Rainfall (mm)"
              type="number"
              range="0-10000"
              description="Total annual rainfall in millimeters"
            />
            <EditableField
              field="seasonal_variation_actual"
              value={town.seasonal_variation_actual}
              label="Seasonal Variation"
              type="select"
              range={['low', 'minimal', 'moderate', 'distinct_seasons', 'high', 'extreme']}
              description="How much climate varies between seasons"
            />
            <EditableField
              field="humidity_level_actual"
              value={town.humidity_level_actual}
              label="Humidity Level"
              type="select"
              range={['low', 'moderate', 'high']}
              description="General humidity level throughout the year"
            />
            <EditableField
              field="humidity_average"
              value={town.humidity_average}
              label="Average Humidity (%)"
              type="number"
              range="0-100"
              description="Average humidity percentage"
            />
            <EditableField
              field="climate_description"
              value={town.climate_description}
              label="Climate Description"
              type="text"
              description="General description of the climate"
            />
          </div>
        )}
      </div>

      {/* Legacy Fields */}
      <LegacyFieldsSection
        fields={['avg_temp_spring', 'avg_temp_fall', 'snow_days', 'uv_index', 'storm_frequency']}
        town={town}
        onTownUpdate={onTownUpdate}
      />
    </div>
  );
}
