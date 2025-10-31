/**
 * HEALTHCARE PANEL - WITH INLINE EDITING
 *
 * Shows healthcare data with INLINE EDITING capability
 * Follows same pattern as CulturePanel and ClimatePanel
 *
 * Created: 2025-10-18
 */

import React, { useState, useEffect } from 'react';
import EditableDataField from '../EditableDataField';
import LegacyFieldsSection from './LegacyFieldsSection';
import { checkAdminAccess } from '../../utils/paywallUtils';
import { VALID_CATEGORICAL_VALUES } from '../../utils/validation/categoricalValues';

export default function HealthcarePanel({ town, onTownUpdate, auditResults = {} }) {
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
    facilities: true,
    quality: true,
    costs: true,
    insurance: true,
    specialties: true
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
        confidence={auditResults[field] || 'unknown'}
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
      {/* Healthcare Scores */}
      <div>
        <button
          onClick={() => toggleSection('scores')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ⭐ Healthcare Scores
          </h3>
          <span className="text-gray-500">{expandedSections.scores ? '▼' : '▶'}</span>
        </button>

        {expandedSections.scores && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="healthcare_score"
              value={town.healthcare_score}
              label="Healthcare Score"
              type="number"
              range="1-10"
              description="Overall healthcare quality score (1-10 scale)"
            />
            <EditableField
              field="environmental_health_rating"
              value={town.environmental_health_rating}
              label="Environmental Health Rating"
              type="number"
              range="1-10"
              description="Environmental health factors rating (1-10 scale)"
            />
            <EditableField
              field="medical_specialties_rating"
              value={town.medical_specialties_rating}
              label="Medical Specialties Rating"
              type="number"
              range="1-10"
              description="Quality and availability of medical specialists (1-10 scale)"
            />
          </div>
        )}
      </div>

      {/* Healthcare Facilities */}
      <div>
        <button
          onClick={() => toggleSection('facilities')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🏥 Healthcare Facilities
          </h3>
          <span className="text-gray-500">{expandedSections.facilities ? '▼' : '▶'}</span>
        </button>

        {expandedSections.facilities && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="hospital_count"
              value={town.hospital_count}
              label="Hospital Count"
              type="number"
              description="Number of hospitals in the area"
            />
            <EditableField
              field="nearest_major_hospital_km"
              value={town.nearest_major_hospital_km}
              label="Nearest Major Hospital (km)"
              type="number"
              description="Distance to nearest major hospital in kilometers"
            />
          </div>
        )}
      </div>

      {/* Quality & Services */}
      <div>
        <button
          onClick={() => toggleSection('quality')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            👨‍⚕️ Quality & Services
          </h3>
          <span className="text-gray-500">{expandedSections.quality ? '▼' : '▶'}</span>
        </button>

        {expandedSections.quality && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="emergency_services_quality"
              value={town.emergency_services_quality}
              label="Emergency Services Quality"
              type="select"
              range={VALID_CATEGORICAL_VALUES.emergency_services_quality}
              description="Quality of emergency medical services"
            />
            <EditableField
              field="english_speaking_doctors"
              value={town.english_speaking_doctors}
              label="English Speaking Doctors"
              type="select"
              range={VALID_CATEGORICAL_VALUES.english_speaking_doctors}
              description="Availability of English-speaking medical professionals"
            />
            <EditableField
              field="healthcare_description"
              value={town.healthcare_description}
              label="Healthcare Description"
              type="text"
              description="General description of healthcare system and quality"
            />
          </div>
        )}
      </div>

      {/* Healthcare Costs */}
      <div>
        <button
          onClick={() => toggleSection('costs')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            💰 Healthcare Costs
          </h3>
          <span className="text-gray-500">{expandedSections.costs ? '▼' : '▶'}</span>
        </button>

        {expandedSections.costs && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="healthcare_cost"
              value={town.healthcare_cost}
              label="Healthcare Cost"
              type="select"
              range={VALID_CATEGORICAL_VALUES.healthcare_cost}
              description="General healthcare cost level"
            />
            <EditableField
              field="healthcare_cost_monthly"
              value={town.healthcare_cost_monthly}
              label="Healthcare Cost Monthly (USD)"
              type="number"
              description="Average monthly healthcare cost in USD"
            />
            <EditableField
              field="private_healthcare_cost_index"
              value={town.private_healthcare_cost_index}
              label="Private Healthcare Cost Index"
              type="number"
              description="Cost index for private healthcare (100 = baseline)"
            />
          </div>
        )}
      </div>

      {/* Insurance & Coverage */}
      <div>
        <button
          onClick={() => toggleSection('insurance')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🛡️ Insurance & Coverage
          </h3>
          <span className="text-gray-500">{expandedSections.insurance ? '▼' : '▶'}</span>
        </button>

        {expandedSections.insurance && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="insurance_availability_rating"
              value={town.insurance_availability_rating}
              label="Insurance Availability Rating"
              type="number"
              range="1-10"
              description="How easily accessible health insurance is (1-10 scale)"
            />
            <EditableField
              field="health_insurance_required"
              value={town.health_insurance_required}
              label="Health Insurance Required"
              type="boolean"
              description="Whether health insurance is mandatory"
            />
          </div>
        )}
      </div>

      {/* Medical Specialties */}
      <div>
        <button
          onClick={() => toggleSection('specialties')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🔬 Medical Specialties
          </h3>
          <span className="text-gray-500">{expandedSections.specialties ? '▼' : '▶'}</span>
        </button>

        {expandedSections.specialties && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="medical_specialties_available"
              value={town.medical_specialties_available}
              label="Medical Specialties Available"
              type="text"
              description="List of available medical specialties (comma-separated)"
            />
            <EditableField
              field="healthcare_specialties_available"
              value={town.healthcare_specialties_available}
              label="Healthcare Specialties Available"
              type="text"
              description="Specific healthcare specialties in the area"
            />
          </div>
        )}
      </div>

      {/* Legacy Fields */}
      <LegacyFieldsSection
        fields={['environmental_factors']}
        town={town}
        onTownUpdate={onTownUpdate}
      />
    </div>
  );
}
