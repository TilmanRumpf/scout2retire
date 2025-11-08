/**
 * COSTS PANEL - WITH INLINE EDITING
 *
 * Shows cost data with INLINE EDITING capability
 * Follows same pattern as ScoreBreakdownPanel
 *
 * Created: 2025-10-18
 */

import React, { useState, useEffect } from 'react';
import EditableDataField from '../EditableDataField';
import { checkAdminAccess } from '../../utils/paywallUtils';

export default function CostsPanel({ town, onTownUpdate, auditResults = {} }) {
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
    daily: true,
    taxes: true
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
              field="groceries_cost"
              value={town.groceries_cost}
              label="Groceries Cost (USD)"
              type="number"
              range="0-2000"
              description="Typical monthly groceries cost in USD"
            />
            <EditableField
              field="meal_cost"
              value={town.meal_cost}
              label="Average Meal Cost (USD)"
              type="number"
              range="0-100"
              description="Average cost of a meal at a restaurant in USD"
            />
          </div>
        )}
      </div>

      {/* Taxes & Fiscal */}
      <div>
        <button
          onClick={() => toggleSection('taxes')}
          className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            💼 Taxes & Fiscal
          </h3>
          <span className="text-gray-500">{expandedSections.taxes ? '▼' : '▶'}</span>
        </button>

        {expandedSections.taxes && (
          <div className="space-y-2 pl-4">
            <EditableField
              field="income_tax_rate_pct"
              value={town.income_tax_rate_pct}
              label="Income Tax Rate (%)"
              type="number"
              range="0-100"
              description="Personal income tax rate percentage"
            />
            <EditableField
              field="property_tax_rate_pct"
              value={town.property_tax_rate_pct}
              label="Property Tax Rate (%)"
              type="number"
              range="0-10"
              description="Property tax rate percentage (annual)"
            />
            <EditableField
              field="sales_tax_rate_pct"
              value={town.sales_tax_rate_pct}
              label="Sales Tax Rate (%)"
              type="number"
              range="0-30"
              description="Sales/VAT tax rate percentage"
            />
            <EditableField
              field="tax_haven_status"
              value={town.tax_haven_status}
              label="Tax Haven Status"
              type="boolean"
              description="Whether the location is considered a tax haven"
            />
            <EditableField
              field="foreign_income_taxed"
              value={town.foreign_income_taxed}
              label="Foreign Income Taxed"
              type="boolean"
              description="Whether foreign income is subject to local taxation"
            />
          </div>
        )}
      </div>
    </div>
  );
}
