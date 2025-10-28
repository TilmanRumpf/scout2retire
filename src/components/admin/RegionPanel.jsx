/**
 * REGION PANEL - WITH INLINE EDITING
 *
 * Shows region data with INLINE EDITING capability
 * Follows same pattern as ScoreBreakdownPanel
 *
 * Created: 2025-10-18
 */

import React, { useState, useEffect } from 'react';
import EditableDataField from '../EditableDataField';
import LegacyFieldsSection from './LegacyFieldsSection';
import { checkAdminAccess } from '../../utils/paywallUtils';
import { VALID_CATEGORICAL_VALUES } from '../../utils/validation/categoricalValues';

export default function RegionPanel({ town, onTownUpdate }) {
  const [isExecutiveAdmin, setIsExecutiveAdmin] = useState(false);

  // Check if user is executive admin
  useEffect(() => {
    const checkExecAdmin = async () => {
      const hasAccess = await checkAdminAccess('executive_admin');
      setIsExecutiveAdmin(hasAccess);
    };
    checkExecAdmin();
  }, []);

  // Auto-expand all sections
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    geography: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper component for editable fields
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
      {/* Location & Countries */}
      <div>
        <button
          onClick={() => toggleSection('location')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            📍 Location & Countries
          </h3>
          <span className="text-gray-500">{expandedSections.location ? '▼' : '▶'}</span>
        </button>

        {expandedSections.location && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="country"
              value={town.country}
              label="Country"
              type="string"
              description="Country where the town is located"
            />
            <EditableField
              field="geo_region"
              value={town.geo_region}
              label="Geographic Region"
              type="array"
              description="Geographic regions (e.g., Mediterranean, Caribbean)"
            />
            <EditableField
              field="latitude"
              value={town.latitude}
              label="Latitude"
              type="number"
              range="-90 to 90"
              description="Latitude coordinate"
            />
            <EditableField
              field="longitude"
              value={town.longitude}
              label="Longitude"
              type="number"
              range="-180 to 180"
              description="Longitude coordinate"
            />
          </div>
        )}
      </div>

      {/* Geography & Features */}
      <div>
        <button
          onClick={() => toggleSection('geography')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🏔️ Geography & Features
          </h3>
          <span className="text-gray-500">{expandedSections.geography ? '▼' : '▶'}</span>
        </button>

        {expandedSections.geography && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="geographic_features_actual"
              value={town.geographic_features_actual}
              label="Geographic Features"
              type="array"
              description='Geographic features as JSON array. Valid values: coastal, island, river, desert, plains, mountain, lake, valley, forest. Example: ["coastal","plains"]'
            />
            <EditableField
              field="vegetation_type_actual"
              value={town.vegetation_type_actual}
              label="Vegetation Type"
              type="array"
              description='Vegetation types as JSON array. Valid values: tropical, subtropical, mediterranean, forest, grassland, desert. Example: ["forest","mediterranean"]'
            />
            <EditableField
              field="elevation_meters"
              value={town.elevation_meters}
              label="Elevation (meters)"
              type="number"
              range="0-9000"
              description="Elevation above sea level in meters"
            />
            <EditableField
              field="population"
              value={town.population}
              label="Population"
              type="number"
              range="0-50000000"
              description="Town/city population"
            />
            <EditableField
              field="urban_rural_character"
              value={town.urban_rural_character}
              label="Urban/Rural Character"
              type="select"
              range={VALID_CATEGORICAL_VALUES.urban_rural_character}
              description="Character of the area: rural, suburban, or urban"
            />
          </div>
        )}
      </div>

      {/* Legacy Fields */}
      <LegacyFieldsSection
        fields={['distance_to_ocean_km', 'water_bodies']}
        town={town}
        onTownUpdate={onTownUpdate}
      />
    </div>
  );
}
