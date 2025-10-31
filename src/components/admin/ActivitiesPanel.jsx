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
    facilities: true,
    markets: true
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
        subdivisionCode={town.region}
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
              field="outdoor_rating"
              value={town.outdoor_rating}
              label="Outdoor Rating"
              type="number"
              range="1-10"
              description="Overall outdoor activities rating (1-10 scale)"
            />
            <EditableField
              field="outdoor_activities_rating"
              value={town.outdoor_activities_rating}
              label="Outdoor Activities Rating"
              type="number"
              range="1-10"
              description="Alternative outdoor activities rating (1-10 scale)"
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
              type="boolean"
              description="Whether there are beaches within reasonable distance"
            />
            <EditableField
              field="water_bodies"
              value={town.water_bodies}
              label="Water Bodies"
              type="string"
              description="Names of nearby water bodies (oceans, lakes, rivers)"
            />
          </div>
        )}
      </div>

      {/* Activities Available */}
      <div>
        <button
          onClick={() => toggleSection('cultural')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🎭 Activities Available
          </h3>
          <span className="text-gray-500">{expandedSections.cultural ? '▼' : '▶'}</span>
        </button>

        {expandedSections.cultural && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="activities_available"
              value={town.activities_available}
              label="Activities Available"
              type="text"
              description="Comma-separated list of available activities in the area"
            />
          </div>
        )}
      </div>

      {/* Local Markets & Community */}
      <div>
        <button
          onClick={() => toggleSection('markets')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🛒 Local Markets & Community
          </h3>
          <span className="text-gray-500">{expandedSections.markets ? '▼' : '▶'}</span>
        </button>

        {expandedSections.markets && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="farmers_markets"
              value={town.farmers_markets}
              label="Farmers Markets"
              type="boolean"
              description="Whether the town has regular farmers markets (weekly/monthly). Include details in notes if available."
            />
            <EditableField
              field="marinas_count"
              value={town.marinas_count}
              label="Marinas Count"
              type="number"
              range="0-50"
              description="Number of marinas in the area"
            />
            <EditableField
              field="coworking_spaces_count"
              value={town.coworking_spaces_count}
              label="Coworking Spaces Count"
              type="number"
              range="0-100"
              description="Number of coworking spaces available for remote workers"
            />
            <EditableField
              field="veterinary_clinics_count"
              value={town.veterinary_clinics_count}
              label="Veterinary Clinics Count"
              type="number"
              range="0-50"
              description="Number of veterinary clinics for pet care"
            />
            <EditableField
              field="international_schools_count"
              value={town.international_schools_count}
              label="International Schools Count"
              type="number"
              range="0-50"
              description="Number of international schools (English-language or multi-lingual)"
            />
          </div>
        )}
      </div>
    </div>
  );
}
