/**
 * INFRASTRUCTURE PANEL - WITH INLINE EDITING
 *
 * Shows infrastructure data with INLINE EDITING capability
 * Includes internet, transport, walkability, government services
 *
 * Created: 2025-10-18
 */

import React, { useState, useEffect } from 'react';
import EditableDataField from '../EditableDataField';
import { checkAdminAccess } from '../../utils/paywallUtils';

export default function InfrastructurePanel({ town, onTownUpdate }) {
  const [isExecutiveAdmin, setIsExecutiveAdmin] = useState(false);

  useEffect(() => {
    const checkExecAdmin = async () => {
      const hasAccess = await checkAdminAccess('executive_admin');
      setIsExecutiveAdmin(hasAccess);
    };
    checkExecAdmin();
  }, []);

  const [expandedSections, setExpandedSections] = useState({
    internet: true,
    transport: true,
    mobility: true,
    government: true,
    utilities: true
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
      {/* Internet & Digital Infrastructure */}
      <div>
        <button
          onClick={() => toggleSection('internet')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            📡 Internet & Digital Infrastructure
          </h3>
          <span className="text-gray-500">{expandedSections.internet ? '▼' : '▶'}</span>
        </button>

        {expandedSections.internet && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="internet_speed"
              value={town.internet_speed}
              label="Internet Speed (Mbps)"
              type="number"
              range="1-1000"
              description="Average internet download speed in Mbps"
            />
            <EditableField
              field="coworking_spaces_count"
              value={town.coworking_spaces_count}
              label="Coworking Spaces Count"
              type="number"
              range="0-100"
              description="Number of coworking spaces available"
            />
            <EditableField
              field="digital_nomad_visa"
              value={town.digital_nomad_visa}
              label="Digital Nomad Visa Available"
              type="boolean"
              description="Whether the country offers a digital nomad visa"
            />
          </div>
        )}
      </div>

      {/* Public Transport */}
      <div>
        <button
          onClick={() => toggleSection('transport')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🚌 Public Transport & Airports
          </h3>
          <span className="text-gray-500">{expandedSections.transport ? '▼' : '▶'}</span>
        </button>

        {expandedSections.transport && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="public_transport_quality"
              value={town.public_transport_quality}
              label="Public Transport Quality"
              type="number"
              range="1-5"
              description="Overall quality of public transportation (1=very poor, 5=excellent)"
            />
            <EditableField
              field="airport_distance"
              value={town.airport_distance}
              label="Airport Distance (km)"
              type="string"
              description="Distance to nearest airport (e.g., '40' or '40-60')"
            />
            <EditableField
              field="international_airport_distance"
              value={town.international_airport_distance}
              label="International Airport Distance (km)"
              type="string"
              description="Distance to nearest international airport"
            />
            <EditableField
              field="regional_airport_distance"
              value={town.regional_airport_distance}
              label="Regional Airport Distance (km)"
              type="string"
              description="Distance to nearest regional/domestic airport"
            />
          </div>
        )}
      </div>

      {/* Walkability & Infrastructure */}
      <div>
        <button
          onClick={() => toggleSection('mobility')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🚶 Walkability & Infrastructure
          </h3>
          <span className="text-gray-500">{expandedSections.mobility ? '▼' : '▶'}</span>
        </button>

        {expandedSections.mobility && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="walkability"
              value={town.walkability}
              label="Walkability Score"
              type="number"
              range="1-10"
              description="Walkability rating (1=car dependent, 10=very walkable)"
            />
            <EditableField
              field="infrastructure_description"
              value={town.infrastructure_description}
              label="Infrastructure Description"
              type="string"
              description="Overall description of local infrastructure"
            />
          </div>
        )}
      </div>

      {/* Government & Services */}
      <div>
        <button
          onClick={() => toggleSection('government')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🏛️ Government & Services
          </h3>
          <span className="text-gray-500">{expandedSections.government ? '▼' : '▶'}</span>
        </button>

        {expandedSections.government && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="government_efficiency_rating"
              value={town.government_efficiency_rating}
              label="Government Efficiency Rating"
              type="number"
              range="1-100"
              description="Efficiency of government services and bureaucracy (1-100 scale)"
            />
          </div>
        )}
      </div>
    </div>
  );
}
