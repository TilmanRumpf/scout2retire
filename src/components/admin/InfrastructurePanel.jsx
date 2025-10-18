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
              field="internet_reliability"
              value={town.internet_reliability}
              label="Internet Reliability"
              type="select"
              range={['poor', 'fair', 'good', 'very_good', 'excellent']}
              description="Reliability and consistency of internet service"
            />
            <EditableField
              field="mobile_coverage"
              value={town.mobile_coverage}
              label="Mobile Coverage"
              type="select"
              range={['poor', 'fair', 'good', 'excellent']}
              description="Quality of mobile phone coverage"
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
              field="digital_services_availability"
              value={town.digital_services_availability}
              label="Digital Services Availability"
              type="select"
              range={['very_low', 'low', 'moderate', 'high', 'very_high']}
              description="Availability of government and public digital services"
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
              type="select"
              range={['very_poor', 'poor', 'fair', 'good', 'excellent']}
              description="Overall quality and coverage of public transportation"
            />
            <EditableField
              field="airport_distance"
              value={town.airport_distance}
              label="Airport Distance (km)"
              type="number"
              range="0-500"
              description="Distance to nearest airport in kilometers"
            />
            <EditableField
              field="international_airport_distance"
              value={town.international_airport_distance}
              label="International Airport Distance (km)"
              type="number"
              range="0-1000"
              description="Distance to nearest international airport in kilometers"
            />
            <EditableField
              field="regional_airport_distance"
              value={town.regional_airport_distance}
              label="Regional Airport Distance (km)"
              type="number"
              range="0-300"
              description="Distance to nearest regional/domestic airport in kilometers"
            />
          </div>
        )}
      </div>

      {/* Walkability & Mobility */}
      <div>
        <button
          onClick={() => toggleSection('mobility')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🚶 Walkability & Mobility
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
              range="0-100"
              description="Walkability score (0-100 scale, higher is better)"
            />
            <EditableField
              field="bike_infrastructure"
              value={town.bike_infrastructure}
              label="Bike Infrastructure"
              type="select"
              range={['very_poor', 'poor', 'fair', 'good', 'excellent']}
              description="Quality of bicycle lanes and bike-friendly infrastructure"
            />
            <EditableField
              field="road_quality"
              value={town.road_quality}
              label="Road Quality"
              type="select"
              range={['very_poor', 'poor', 'fair', 'good', 'excellent']}
              description="Overall quality and maintenance of roads"
            />
            <EditableField
              field="traffic_congestion"
              value={town.traffic_congestion}
              label="Traffic Congestion"
              type="select"
              range={['minimal', 'low', 'moderate', 'high', 'severe']}
              description="Level of traffic congestion during peak hours"
            />
            <EditableField
              field="parking_availability"
              value={town.parking_availability}
              label="Parking Availability"
              type="select"
              range={['very_poor', 'poor', 'fair', 'good', 'excellent']}
              description="Availability and ease of finding parking"
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
              range="1-10"
              description="Efficiency of government services and bureaucracy (1-10 scale)"
            />
            <EditableField
              field="banking_infrastructure"
              value={town.banking_infrastructure}
              label="Banking Infrastructure"
              type="select"
              range={['very_poor', 'poor', 'fair', 'good', 'excellent']}
              description="Quality and availability of banking services"
            />
          </div>
        )}
      </div>
    </div>
  );
}
