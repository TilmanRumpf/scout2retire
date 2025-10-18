/**
 * ACTIVITIES PANEL - WITH INLINE EDITING
 *
 * Shows activities/hobbies data with INLINE EDITING capability
 * Replaces the non-editable HobbiesDisplay component
 *
 * Created: 2025-10-18
 */

import React, { useState, useEffect } from 'react';
import EditableDataField from '../EditableDataField';
import { checkAdminAccess } from '../../utils/paywallUtils';

export default function ActivitiesPanel({ town, onTownUpdate }) {
  const [isExecutiveAdmin, setIsExecutiveAdmin] = useState(false);

  useEffect(() => {
    const checkExecAdmin = async () => {
      const hasAccess = await checkAdminAccess('executive_admin');
      setIsExecutiveAdmin(hasAccess);
    };
    checkExecAdmin();
  }, []);

  const [expandedSections, setExpandedSections] = useState({
    sports: true,
    outdoor: true,
    water: true,
    cultural: true,
    facilities: true
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
      {/* Sports & Recreation */}
      <div>
        <button
          onClick={() => toggleSection('sports')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ⛳ Sports & Recreation
          </h3>
          <span className="text-gray-500">{expandedSections.sports ? '▼' : '▶'}</span>
        </button>

        {expandedSections.sports && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="golf_courses_count"
              value={town.golf_courses_count}
              label="Golf Courses Count"
              type="number"
              range="0-100"
              description="Number of golf courses in the area"
            />
            <EditableField
              field="tennis_courts_count"
              value={town.tennis_courts_count}
              label="Tennis Courts Count"
              type="number"
              range="0-200"
              description="Number of tennis courts available"
            />
            <EditableField
              field="sports_facilities"
              value={town.sports_facilities}
              label="Sports Facilities"
              type="select"
              range={['very_limited', 'limited', 'moderate', 'good', 'excellent']}
              description="Overall availability and quality of sports facilities"
            />
            <EditableField
              field="dog_parks_count"
              value={town.dog_parks_count}
              label="Dog Parks Count"
              type="number"
              range="0-50"
              description="Number of dog parks and pet-friendly areas"
            />
          </div>
        )}
      </div>

      {/* Outdoor Activities */}
      <div>
        <button
          onClick={() => toggleSection('outdoor')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🥾 Outdoor Activities
          </h3>
          <span className="text-gray-500">{expandedSections.outdoor ? '▼' : '▶'}</span>
        </button>

        {expandedSections.outdoor && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="hiking_trails_km"
              value={town.hiking_trails_km}
              label="Hiking Trails (km)"
              type="number"
              range="0-10000"
              description="Total kilometers of hiking trails accessible from town"
            />
            <EditableField
              field="ski_resorts_within_100km"
              value={town.ski_resorts_within_100km}
              label="Ski Resorts Within 100km"
              type="number"
              range="0-50"
              description="Number of ski resorts within 100km radius"
            />
            <EditableField
              field="mountain_activities"
              value={town.mountain_activities}
              label="Mountain Activities"
              type="select"
              range={['none', 'limited', 'moderate', 'good', 'excellent']}
              description="Availability of mountain activities (skiing, climbing, hiking)"
            />
            <EditableField
              field="outdoor_rating"
              value={town.outdoor_rating}
              label="Outdoor Rating"
              type="number"
              range="1-10"
              description="Overall outdoor activities rating (1-10 scale)"
            />
            <EditableField
              field="parks_per_capita"
              value={town.parks_per_capita}
              label="Parks Per Capita"
              type="number"
              range="0-100"
              description="Number of parks per 100,000 residents"
            />
            <EditableField
              field="recreation_centers"
              value={town.recreation_centers}
              label="Recreation Centers Count"
              type="number"
              range="0-100"
              description="Number of public recreation centers"
            />
          </div>
        )}
      </div>

      {/* Water Activities */}
      <div>
        <button
          onClick={() => toggleSection('water')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🏖️ Water Activities
          </h3>
          <span className="text-gray-500">{expandedSections.water ? '▼' : '▶'}</span>
        </button>

        {expandedSections.water && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="beaches_nearby"
              value={town.beaches_nearby}
              label="Beaches Nearby"
              type="select"
              range={['none', 'limited', 'several', 'many', 'abundant']}
              description="Availability of beaches within reasonable distance"
            />
            <EditableField
              field="water_sports_available"
              value={town.water_sports_available}
              label="Water Sports Available"
              type="select"
              range={['none', 'limited', 'moderate', 'good', 'excellent']}
              description="Availability of water sports (surfing, sailing, kayaking, etc.)"
            />
            <EditableField
              field="marinas_count"
              value={town.marinas_count}
              label="Marinas Count"
              type="number"
              range="0-50"
              description="Number of marinas and boat harbors"
            />
          </div>
        )}
      </div>

      {/* Cultural Activities */}
      <div>
        <button
          onClick={() => toggleSection('cultural')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🎭 Cultural Activities
          </h3>
          <span className="text-gray-500">{expandedSections.cultural ? '▼' : '▶'}</span>
        </button>

        {expandedSections.cultural && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="cultural_activities"
              value={town.cultural_activities}
              label="Cultural Activities"
              type="select"
              range={['very_limited', 'limited', 'moderate', 'good', 'excellent']}
              description="Availability of cultural activities (theaters, concerts, museums)"
            />
            <EditableField
              field="farmers_markets"
              value={town.farmers_markets}
              label="Farmers Markets Count"
              type="number"
              range="0-50"
              description="Number of farmers markets and local food markets"
            />
          </div>
        )}
      </div>
    </div>
  );
}
