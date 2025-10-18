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
    general: true,
    environmental: true,
    monthly: true
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
              range={['mild', 'warm', 'hot']}
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
              range={['cold', 'cool', 'mild', 'hot']}
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
              field="climate_type"
              value={town.climate_type}
              label="Climate Type"
              type="select"
              range={['Alpine', 'Arctic', 'Atlantic Maritime', 'Continental', 'Desert', 'Highland', 'Highland Tropical', 'Humid Subtropical', 'Maritime', 'Mediterranean', 'Monsoon', 'Oceanic', 'Savanna', 'Semi-arid', 'Subtropical', 'Temperate', 'Tropical']}
              description="Primary climate classification"
            />
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
              range={['dry', 'balanced', 'humid']}
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
              type="select"
              range={['Very Low', 'Low', 'Moderate', 'High', 'Very High']}
              description="Risk level for natural disasters (earthquakes, hurricanes, floods, etc.)"
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

      {/* Monthly Climate Data */}
      <div>
        <button
          onClick={() => toggleSection('monthly')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            📅 Monthly Climate Data
          </h3>
          <span className="text-gray-500">{expandedSections.monthly ? '▼' : '▶'}</span>
        </button>

        {expandedSections.monthly && (
          <div className="space-y-4 pl-4">
            <div className="border-l-4 border-blue-500 pl-3">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Temperatures (°C)</h4>
              <div className="space-y-2 grid grid-cols-2 gap-2">
                <EditableField field="jan_temp" value={town.jan_temp} label="January" type="number" range="-50 to 50" description="Average temperature in January" />
                <EditableField field="feb_temp" value={town.feb_temp} label="February" type="number" range="-50 to 50" description="Average temperature in February" />
                <EditableField field="mar_temp" value={town.mar_temp} label="March" type="number" range="-50 to 50" description="Average temperature in March" />
                <EditableField field="apr_temp" value={town.apr_temp} label="April" type="number" range="-50 to 50" description="Average temperature in April" />
                <EditableField field="may_temp" value={town.may_temp} label="May" type="number" range="-50 to 50" description="Average temperature in May" />
                <EditableField field="jun_temp" value={town.jun_temp} label="June" type="number" range="-50 to 50" description="Average temperature in June" />
                <EditableField field="jul_temp" value={town.jul_temp} label="July" type="number" range="-50 to 50" description="Average temperature in July" />
                <EditableField field="aug_temp" value={town.aug_temp} label="August" type="number" range="-50 to 50" description="Average temperature in August" />
                <EditableField field="sep_temp" value={town.sep_temp} label="September" type="number" range="-50 to 50" description="Average temperature in September" />
                <EditableField field="oct_temp" value={town.oct_temp} label="October" type="number" range="-50 to 50" description="Average temperature in October" />
                <EditableField field="nov_temp" value={town.nov_temp} label="November" type="number" range="-50 to 50" description="Average temperature in November" />
                <EditableField field="dec_temp" value={town.dec_temp} label="December" type="number" range="-50 to 50" description="Average temperature in December" />
              </div>
            </div>

            <div className="border-l-4 border-green-500 pl-3">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Rainfall (mm)</h4>
              <div className="space-y-2 grid grid-cols-2 gap-2">
                <EditableField field="jan_rainfall" value={town.jan_rainfall} label="January" type="number" range="0-1000" description="Average rainfall in January" />
                <EditableField field="feb_rainfall" value={town.feb_rainfall} label="February" type="number" range="0-1000" description="Average rainfall in February" />
                <EditableField field="mar_rainfall" value={town.mar_rainfall} label="March" type="number" range="0-1000" description="Average rainfall in March" />
                <EditableField field="apr_rainfall" value={town.apr_rainfall} label="April" type="number" range="0-1000" description="Average rainfall in April" />
                <EditableField field="may_rainfall" value={town.may_rainfall} label="May" type="number" range="0-1000" description="Average rainfall in May" />
                <EditableField field="jun_rainfall" value={town.jun_rainfall} label="June" type="number" range="0-1000" description="Average rainfall in June" />
                <EditableField field="jul_rainfall" value={town.jul_rainfall} label="July" type="number" range="0-1000" description="Average rainfall in July" />
                <EditableField field="aug_rainfall" value={town.aug_rainfall} label="August" type="number" range="0-1000" description="Average rainfall in August" />
                <EditableField field="sep_rainfall" value={town.sep_rainfall} label="September" type="number" range="0-1000" description="Average rainfall in September" />
                <EditableField field="oct_rainfall" value={town.oct_rainfall} label="October" type="number" range="0-1000" description="Average rainfall in October" />
                <EditableField field="nov_rainfall" value={town.nov_rainfall} label="November" type="number" range="0-1000" description="Average rainfall in November" />
                <EditableField field="dec_rainfall" value={town.dec_rainfall} label="December" type="number" range="0-1000" description="Average rainfall in December" />
              </div>
            </div>
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
