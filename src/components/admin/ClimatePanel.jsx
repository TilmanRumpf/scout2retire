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
import { VALID_CATEGORICAL_VALUES } from '../../utils/validation/categoricalValues';

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
    general: true,
    environmental: true
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
              type="select"
              range={VALID_CATEGORICAL_VALUES.summer_climate_actual}
              description="Summer climate conditions"
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
              type="select"
              range={VALID_CATEGORICAL_VALUES.winter_climate_actual}
              description="Winter climate conditions"
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
              range={VALID_CATEGORICAL_VALUES.sunshine_level_actual}
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
              range={VALID_CATEGORICAL_VALUES.precipitation_level_actual}
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
              range={VALID_CATEGORICAL_VALUES.seasonal_variation_actual}
              description="How much climate varies between seasons"
            />
            <EditableField
              field="humidity_level_actual"
              value={town.humidity_level_actual}
              label="Humidity Level"
              type="select"
              range={VALID_CATEGORICAL_VALUES.humidity_level_actual}
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

      {/* Environmental & Health */}
      <div>
        <button
          onClick={() => toggleSection('environmental')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🌱 Environmental & Health
          </h3>
          <span className="text-gray-500">{expandedSections.environmental ? '▼' : '▶'}</span>
        </button>

        {expandedSections.environmental && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="air_quality_index"
              value={town.air_quality_index}
              label="Air Quality Index"
              type="number"
              range="0-500"
              description="Air quality index (0-50: Excellent, 51-100: Good, 101-150: Moderate, 151+: Poor)"
            />
            <EditableField
              field="natural_disaster_risk"
              value={town.natural_disaster_risk}
              label="Natural Disaster Risk"
              type="number"
              range="1-10"
              description="Risk level for natural disasters (1=Very Low, 10=Very High)"
            />
            <EditableField
              field="environmental_health_rating"
              value={town.environmental_health_rating}
              label="Environmental Health Rating"
              type="number"
              range="0-10"
              description="Overall environmental health score (0-10 scale)"
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
