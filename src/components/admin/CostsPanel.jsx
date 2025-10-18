/**
 * COSTS PANEL - WITH INLINE EDITING
 *
 * Shows cost/budget data with INLINE EDITING capability
 * Follows same pattern as ScoreBreakdownPanel
 *
 * Created: 2025-10-18
 */

import React, { useState, useEffect } from 'react';
import EditableDataField from '../EditableDataField';
import { checkAdminAccess } from '../../utils/paywallUtils';

export default function CostsPanel({ town, onTownUpdate }) {
  const [isExecutiveAdmin, setIsExecutiveAdmin] = useState(false);

  useEffect(() => {
    const checkExecAdmin = async () => {
      const hasAccess = await checkAdminAccess('executive_admin');
      setIsExecutiveAdmin(hasAccess);
    };
    checkExecAdmin();
  }, []);

  const [expandedSections, setExpandedSections] = useState({
    living: true,
    housing: true,
    daily: true
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
      {/* Living Costs */}
      <div>
        <button
          onClick={() => toggleSection('living')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            💰 Living Costs
          </h3>
          <span className="text-gray-500">{expandedSections.living ? '▼' : '▶'}</span>
        </button>

        {expandedSections.living && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="cost_of_living_usd"
              value={town.cost_of_living_usd}
              label="Cost of Living (USD)"
              type="number"
              range="0-10000"
              description="Overall cost of living in USD per month"
            />
            <EditableField
              field="typical_monthly_living_cost"
              value={town.typical_monthly_living_cost}
              label="Typical Monthly Living Cost"
              type="number"
              range="0-10000"
              description="Typical monthly expenses in local currency"
            />
          </div>
        )}
      </div>

      {/* Housing */}
      <div>
        <button
          onClick={() => toggleSection('housing')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🏠 Housing
          </h3>
          <span className="text-gray-500">{expandedSections.housing ? '▼' : '▶'}</span>
        </button>

        {expandedSections.housing && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="rent_1bed"
              value={town.rent_1bed}
              label="Rent - 1 Bedroom"
              type="number"
              range="0-10000"
              description="Monthly rent for 1-bedroom apartment in city center"
            />
            <EditableField
              field="rent_2bed"
              value={town.rent_2bed}
              label="Rent - 2 Bedroom"
              type="number"
              range="0-15000"
              description="Monthly rent for 2-bedroom apartment in city center"
            />
            <EditableField
              field="home_price_sqm"
              value={town.home_price_sqm}
              label="Home Price per m²"
              type="number"
              range="0-50000"
              description="Average price per square meter for buying property"
            />
          </div>
        )}
      </div>

      {/* Daily Expenses */}
      <div>
        <button
          onClick={() => toggleSection('daily')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🛒 Daily Expenses
          </h3>
          <span className="text-gray-500">{expandedSections.daily ? '▼' : '▶'}</span>
        </button>

        {expandedSections.daily && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="utilities_cost"
              value={town.utilities_cost}
              label="Utilities Cost"
              type="number"
              range="0-500"
              description="Monthly utilities (electricity, water, gas, internet)"
            />
            <EditableField
              field="groceries_index"
              value={town.groceries_index}
              label="Groceries Index"
              type="number"
              range="0-200"
              description="Grocery price index (100 = average)"
            />
            <EditableField
              field="restaurant_price_index"
              value={town.restaurant_price_index}
              label="Restaurant Price Index"
              type="number"
              range="0-200"
              description="Restaurant price index (100 = average)"
            />
          </div>
        )}
      </div>
    </div>
  );
}
