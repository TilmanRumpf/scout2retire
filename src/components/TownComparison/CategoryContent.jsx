import React, { useMemo } from 'react';
import { uiConfig } from '../../styles/uiConfig';
import TownOverview from './TownOverview';
import TownClimate from './TownClimate';
import TownDemographics from './TownDemographics';
import TownActivities from './TownActivities';
import TownCosts from './TownCosts';
import TownHealthcare from './TownHealthcare';
import TownCulture from './TownCulture';

// Memoized component for category content rendering
const CategoryContent = React.memo(({ town, category }) => {
  // Use useMemo to prevent recalculating on every render
  const content = useMemo(() => {
    if (!town) return <div>No data available</div>;

    switch (category) {
      case 'overview':
        return <TownOverview town={town} />;
      
      case 'climate':
        return <TownClimate town={town} />;
      
      case 'cost':
      case 'costs':
        return (
          <div className="h-full flex flex-col">
            <p className={`mb-3 ${uiConfig.colors.body} min-h-[7.5rem] line-clamp-5`}>
              {town.cost_description || 'No cost information available.'}
            </p>
            <div className="space-y-3 flex-1">
              {/* Housing Costs Section */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[7.5rem]">
                <h4 className="font-medium text-sm mb-2">Housing Costs</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>1-Bedroom Rent:</span>
                    <span className="font-medium">{town.rent_1bed ? `$${town.rent_1bed}/mo` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>2-Bedroom Rent:</span>
                    <span className="font-medium">{town.rent_2bed ? `$${town.rent_2bed}/mo` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Buy Price/m²:</span>
                    <span className="font-medium">{town.property_buy_sqm ? `$${town.property_buy_sqm}` : 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Daily Expenses Section */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[9rem]">
                <h4 className="font-medium text-sm mb-2">Daily Expenses</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Restaurant Meal:</span>
                    <span className="font-medium">{town.meal_cost ? `$${town.meal_cost}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Weekly Groceries:</span>
                    <span className="font-medium">{town.groceries_cost ? `$${town.groceries_cost}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Monthly Utilities:</span>
                    <span className="font-medium">{town.utilities_cost ? `$${town.utilities_cost}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Public Transport:</span>
                    <span className="font-medium">{town.transport_cost ? `$${town.transport_cost}/mo` : 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Total Costs/Month */}
              <div className={`bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg p-3 h-[4rem] flex items-center justify-center`}>
                <div className="text-center">
                  <p className={`text-xs ${uiConfig.colors.hint} mb-1`}>Total Costs/Month</p>
                  <p className={`text-2xl font-bold ${uiConfig.colors.success}`}>
                    ${town.cost_index || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'culture':
        return <TownCulture town={town} />;
      
      case 'demographics':
        return <TownDemographics town={town} />;
      
      case 'healthcare':
        return <TownHealthcare town={town} />;

      case 'hobbies':
      case 'activities':
        return <TownActivities town={town} />;

      case 'administration':
        return (
          <div className="h-full flex flex-col">
            <div className="space-y-3 flex-1">
              {/* Visa & Residency */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Visa & Residency</h4>
                <div className="space-y-1 text-sm">
                  {town.visa_ease_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Visa Process:</span>
                      <span className="font-medium capitalize">{town.visa_ease_actual}</span>
                    </div>
                  )}
                  {town.residency_process_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Residency Process:</span>
                      <span className="font-medium capitalize">{town.residency_process_actual}</span>
                    </div>
                  )}
                  {town.tax_friendliness_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Tax Friendliness:</span>
                      <span className="font-medium capitalize">{town.tax_friendliness_actual}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Infrastructure */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Infrastructure</h4>
                <div className="space-y-1 text-sm">
                  {town.internet_quality_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Internet Quality:</span>
                      <span className="font-medium capitalize">{town.internet_quality_actual}</span>
                    </div>
                  )}
                  {town.utilities_reliability_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Utilities:</span>
                      <span className="font-medium capitalize">{town.utilities_reliability_actual}</span>
                    </div>
                  )}
                  {town.bureaucracy_level_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Bureaucracy Level:</span>
                      <span className="font-medium capitalize">{town.bureaucracy_level_actual}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="h-full flex flex-col">
            <div className="space-y-3 flex-1">
              {/* Budget Ranges */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Monthly Living Costs</h4>
                <div className="space-y-1 text-sm">
                  {town.budget_housing_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Housing Budget:</span>
                      <span className="font-medium capitalize">{town.budget_housing_actual?.replace('_', ' ')}</span>
                    </div>
                  )}
                  {town.budget_food_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Food Budget:</span>
                      <span className="font-medium capitalize">{town.budget_food_actual?.replace('_', ' ')}</span>
                    </div>
                  )}
                  {town.budget_transportation_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Transportation:</span>
                      <span className="font-medium capitalize">{town.budget_transportation_actual?.replace('_', ' ')}</span>
                    </div>
                  )}
                  {town.budget_healthcare_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Healthcare:</span>
                      <span className="font-medium capitalize">{town.budget_healthcare_actual?.replace('_', ' ')}</span>
                    </div>
                  )}
                  {town.budget_entertainment_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Entertainment:</span>
                      <span className="font-medium capitalize">{town.budget_entertainment_actual?.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Overall Cost Index */}
              {town.cost_index && (
                <div className={`bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg p-3 text-center`}>
                  <p className={`text-xs ${uiConfig.colors.hint} mb-1`}>Overall Cost Index</p>
                  <p className={`text-2xl font-bold ${uiConfig.colors.success}`}>
                    ${town.cost_index}/month
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div>Category not found</div>;
    }
  }, [town, category]);

  return content;
});

CategoryContent.displayName = 'CategoryContent';

export default CategoryContent;