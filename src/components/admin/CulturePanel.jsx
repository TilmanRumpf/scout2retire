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
import LegacyFieldsSection from './LegacyFieldsSection';
import { checkAdminAccess } from '../../utils/paywallUtils';
import { VALID_CATEGORICAL_VALUES } from '../../utils/validation/categoricalValues';

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
    community: true,
    ratings: true,
    landmarks: true
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
              range={VALID_CATEGORICAL_VALUES.english_proficiency_level}
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
              range={VALID_CATEGORICAL_VALUES.pace_of_life_actual}
              description="General pace of daily life"
            />
            <EditableField
              field="social_atmosphere"
              value={town.social_atmosphere}
              label="Social Atmosphere"
              type="select"
              range={VALID_CATEGORICAL_VALUES.social_atmosphere}
              description="How social and welcoming the community is"
            />
            <EditableField
              field="traditional_progressive_lean"
              value={town.traditional_progressive_lean}
              label="Traditional vs Progressive"
              type="select"
              range={VALID_CATEGORICAL_VALUES.traditional_progressive_lean}
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
              range={VALID_CATEGORICAL_VALUES.expat_community_size}
              description="Size of the expatriate community"
            />
            <EditableField
              field="retirement_community_presence"
              value={town.retirement_community_presence}
              label="Retirement Community Presence"
              type="select"
              range={VALID_CATEGORICAL_VALUES.retirement_community_presence}
              description="Presence of retirement-focused communities"
            />
            <EditableField
              field="cultural_events_frequency"
              value={town.cultural_events_frequency}
              label="Cultural Events Frequency"
              type="select"
              range={VALID_CATEGORICAL_VALUES.cultural_events_frequency}
              description="How often cultural events and festivals occur"
            />
          </div>
        )}
      </div>

      {/* Culture Ratings */}
      <div>
        <button
          onClick={() => toggleSection('ratings')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ⭐ Culture Ratings (1-10 Scale)
          </h3>
          <span className="text-gray-500">{expandedSections.ratings ? '▼' : '▶'}</span>
        </button>

        {expandedSections.ratings && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="cultural_events_rating"
              value={town.cultural_events_rating}
              label="Cultural Events Rating"
              type="number"
              range="1-10"
              description="Quality and frequency of cultural events (1-10 scale)"
            />
            <EditableField
              field="nightlife_rating"
              value={town.nightlife_rating}
              label="Nightlife Rating"
              type="number"
              range="1-10"
              description="Quality and variety of nightlife options (1-10 scale)"
            />
            <EditableField
              field="restaurants_rating"
              value={town.restaurants_rating}
              label="Restaurants Rating"
              type="number"
              range="1-10"
              description="Quality and variety of dining options (1-10 scale)"
            />
            <EditableField
              field="museums_rating"
              value={town.museums_rating}
              label="Museums Rating"
              type="number"
              range="1-10"
              description="Quality and variety of museums and galleries (1-10 scale)"
            />
            <EditableField
              field="shopping_rating"
              value={town.shopping_rating}
              label="Shopping Rating"
              type="number"
              range="1-10"
              description="Quality and variety of shopping options (1-10 scale)"
            />
            <EditableField
              field="outdoor_rating"
              value={town.outdoor_rating}
              label="Outdoor Activities Rating"
              type="number"
              range="1-10"
              description="Quality and variety of outdoor activities (1-10 scale)"
            />
          </div>
        )}
      </div>

      {/* Cultural Landmarks */}
      <div>
        <button
          onClick={() => toggleSection('landmarks')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🏛️ Cultural Landmarks
          </h3>
          <span className="text-gray-500">{expandedSections.landmarks ? '▼' : '▶'}</span>
        </button>

        {expandedSections.landmarks && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="cultural_landmark_1"
              value={town.cultural_landmark_1}
              label="Cultural Landmark 1"
              type="string"
              description="First notable cultural landmark or attraction"
            />
            <EditableField
              field="cultural_landmark_2"
              value={town.cultural_landmark_2}
              label="Cultural Landmark 2"
              type="string"
              description="Second notable cultural landmark or attraction"
            />
            <EditableField
              field="cultural_landmark_3"
              value={town.cultural_landmark_3}
              label="Cultural Landmark 3"
              type="string"
              description="Third notable cultural landmark or attraction"
            />
          </div>
        )}
      </div>

      {/* Legacy Fields */}
      <LegacyFieldsSection
        fields={['cultural_events', 'local_cuisine', 'religious_diversity', 'arts_scene', 'music_scene']}
        town={town}
        onTownUpdate={onTownUpdate}
      />
    </div>
  );
}
