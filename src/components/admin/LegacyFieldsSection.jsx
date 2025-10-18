/**
 * LEGACY FIELDS SECTION - WITH INLINE EDITING
 *
 * Renders legacy/unused fields with same inline editing + Google search
 * capabilities as modern fields.
 *
 * Used to preserve historical data that guides admin decisions.
 *
 * Created: 2025-10-18
 */

import React, { useState, useEffect } from 'react';
import EditableDataField from '../EditableDataField';
import { checkAdminAccess } from '../../utils/paywallUtils';

// Field metadata: type, range, description
const FIELD_METADATA = {
  // Region fields
  latitude: {
    type: 'number',
    range: '-90 to 90',
    description: 'Latitude coordinate'
  },
  longitude: {
    type: 'number',
    range: '-180 to 180',
    description: 'Longitude coordinate'
  },
  elevation_meters: {
    type: 'number',
    range: '0-9000',
    description: 'Elevation above sea level in meters'
  },
  distance_to_ocean_km: {
    type: 'number',
    range: '0-5000',
    description: 'Distance to nearest ocean in kilometers'
  },
  water_bodies: {
    type: 'text',
    description: 'Nearby water bodies (lakes, rivers, seas)'
  },

  // Climate fields
  avg_temp_spring: {
    type: 'number',
    range: '-50 to 50',
    description: 'Average spring temperature (°C)'
  },
  avg_temp_fall: {
    type: 'number',
    range: '-50 to 50',
    description: 'Average fall/autumn temperature (°C)'
  },
  snow_days: {
    type: 'number',
    range: '0-365',
    description: 'Average number of snow days per year'
  },
  uv_index: {
    type: 'number',
    range: '0-15',
    description: 'Average UV index'
  },
  storm_frequency: {
    type: 'select',
    range: ['rare', 'occasional', 'moderate', 'frequent', 'very frequent'],
    description: 'Frequency of storms and severe weather'
  },

  // Culture fields
  cultural_events: {
    type: 'text',
    description: 'Cultural events and festivals (legacy field)'
  },
  local_cuisine: {
    type: 'text',
    description: 'Description of local cuisine'
  },
  religious_diversity: {
    type: 'text',
    description: 'Information about religious diversity'
  },
  arts_scene: {
    type: 'text',
    description: 'Description of local arts and theater scene'
  },
  music_scene: {
    type: 'text',
    description: 'Description of local music scene'
  },

  // Admin fields
  emergency_response_time: {
    type: 'number',
    range: '0-60',
    description: 'Average emergency response time in minutes'
  },
  political_stability_score: {
    type: 'number',
    range: '0-10',
    description: 'Political stability score (0-10 scale)'
  },
  government_efficiency_score: {
    type: 'number',
    range: '0-10',
    description: 'Government efficiency score (0-10 scale)'
  },
  tax_treaty: {
    type: 'text',
    description: 'Information about tax treaties'
  },

  // Costs fields
  rent_2bed: {
    type: 'number',
    range: '0-10000',
    description: 'Monthly rent for 2-bedroom apartment (USD)'
  },
  home_price_sqm: {
    type: 'number',
    range: '0-50000',
    description: 'Home price per square meter (USD)'
  },
  utilities_cost: {
    type: 'number',
    range: '0-500',
    description: 'Average monthly utilities cost (USD)'
  },
  groceries_index: {
    type: 'number',
    range: '0-200',
    description: 'Groceries cost index (relative to reference city)'
  },
  restaurant_price_index: {
    type: 'number',
    range: '0-200',
    description: 'Restaurant price index (relative to reference city)'
  },

  // Hobbies fields (legacy JSON fields)
  outdoor_activities: {
    type: 'text',
    description: 'Legacy outdoor activities data'
  },
  hiking_trails: {
    type: 'text',
    description: 'Legacy hiking trails data'
  },
  beaches_nearby: {
    type: 'text',
    description: 'Legacy beaches data'
  },
  golf_courses: {
    type: 'text',
    description: 'Legacy golf courses data'
  },
  ski_resorts_nearby: {
    type: 'text',
    description: 'Legacy ski resorts data'
  },
  cultural_attractions: {
    type: 'text',
    description: 'Legacy cultural attractions data'
  }
};

// Convert field name to human-readable label
const fieldToLabel = (field) => {
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function LegacyFieldsSection({ fields, town, onTownUpdate }) {
  const [isExecutiveAdmin, setIsExecutiveAdmin] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkExecAdmin = async () => {
      const hasAccess = await checkAdminAccess('executive_admin');
      setIsExecutiveAdmin(hasAccess);
    };
    checkExecAdmin();
  }, []);

  // Don't render if no fields
  if (!fields || fields.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-3 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors border border-amber-200 dark:border-amber-800"
      >
        <div className="flex items-center gap-2">
          <span className="text-amber-600 dark:text-amber-400">📜</span>
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
            Legacy Data (for reference)
          </h3>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            {fields.length} field{fields.length !== 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-amber-600 dark:text-amber-400">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="space-y-2 pl-4">
          <div className="text-sm text-amber-700 dark:text-amber-300 mb-4 p-3 bg-amber-50 dark:bg-amber-900/10 rounded border border-amber-200 dark:border-amber-800">
            ℹ️ These fields contain historical data that may guide your decisions. They have the same
            inline editing and Google search capabilities as modern fields.
          </div>

          {fields.map(field => {
            const metadata = FIELD_METADATA[field] || { type: 'text', description: `Legacy ${fieldToLabel(field)} field` };

            return (
              <EditableDataField
                key={field}
                label={fieldToLabel(field)}
                value={town[field]}
                field={field}
                townId={town.id}
                townName={town.name}
                countryName={town.country}
                type={metadata.type}
                range={metadata.range}
                description={metadata.description}
                isExecutiveAdmin={isExecutiveAdmin}
                onUpdate={(field, newValue) => {
                  if (onTownUpdate) {
                    onTownUpdate(field, newValue);
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
