import React from 'react';
import { uiConfig } from '../../styles/uiConfig';

const TownCosts = React.memo(({ town }) => {
  if (!town) return null;

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Cost of Living Index */}
      {town.costOfLiving && (
        <div>
          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1.5`}>Cost of Living Index</div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${
              town.costOfLiving < 90 ? uiConfig.colors.success :
              town.costOfLiving < 110 ? uiConfig.colors.warning :
              uiConfig.colors.error
            }`}>
              {town.costOfLiving}
            </span>
            <span className={`text-xs ${uiConfig.colors.subtitle}`}>
              (US avg: 100)
            </span>
          </div>
        </div>
      )}

      {/* Housing Costs */}
      <div>
        <div className={`text-xs ${uiConfig.colors.subtitle} mb-1.5`}>Housing</div>
        <div className="space-y-1">
          {town.medianHomePrice && (
            <div className="flex justify-between items-center">
              <span className={`text-xs ${uiConfig.colors.body}`}>Median Home:</span>
              <span className={`text-sm font-medium ${uiConfig.colors.accent}`}>
                ${(town.medianHomePrice / 1000).toFixed(0)}K
              </span>
            </div>
          )}
          {town.medianRent && (
            <div className="flex justify-between items-center">
              <span className={`text-xs ${uiConfig.colors.body}`}>Median Rent:</span>
              <span className={`text-sm ${uiConfig.colors.body}`}>
                ${town.medianRent.toLocaleString()}/mo
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tax Rates */}
      <div>
        <div className={`text-xs ${uiConfig.colors.subtitle} mb-1.5`}>Tax Rates</div>
        <div className="space-y-1">
          {town.taxRates?.income !== undefined && (
            <div className="flex justify-between items-center">
              <span className={`text-xs ${uiConfig.colors.body}`}>Income Tax:</span>
              <span className={`text-xs ${uiConfig.colors.body}`}>
                {town.taxRates.income}%
              </span>
            </div>
          )}
          {town.taxRates?.sales !== undefined && (
            <div className="flex justify-between items-center">
              <span className={`text-xs ${uiConfig.colors.body}`}>Sales Tax:</span>
              <span className={`text-xs ${uiConfig.colors.body}`}>
                {town.taxRates.sales}%
              </span>
            </div>
          )}
          {town.taxRates?.property !== undefined && (
            <div className="flex justify-between items-center">
              <span className={`text-xs ${uiConfig.colors.body}`}>Property Tax:</span>
              <span className={`text-xs ${uiConfig.colors.body}`}>
                {town.taxRates.property}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Utilities Average */}
      {town.utilities && (
        <div>
          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1`}>Avg Monthly Utilities</div>
          <div className={`text-sm ${uiConfig.colors.body}`}>
            ${town.utilities}/mo
          </div>
        </div>
      )}
    </div>
  );
});

TownCosts.displayName = 'TownCosts';

export default TownCosts;