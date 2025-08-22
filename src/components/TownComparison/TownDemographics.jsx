import React from 'react';
import { uiConfig } from '../../styles/uiConfig';

const TownDemographics = React.memo(({ town }) => {
  if (!town) return null;

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Age Distribution */}
      <div>
        <div className={`text-xs ${uiConfig.colors.subtitle} mb-1.5`}>Age Distribution</div>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className={`text-xs ${uiConfig.colors.body}`}>Median Age:</span>
            <span className={`text-sm font-medium ${uiConfig.colors.accent}`}>
              {town.medianAge || 'N/A'}
            </span>
          </div>
          {town.ageDistribution && (
            <>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${uiConfig.colors.body}`}>Under 18:</span>
                <span className={`text-xs ${uiConfig.colors.body}`}>
                  {town.ageDistribution.under18 || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${uiConfig.colors.body}`}>18-65:</span>
                <span className={`text-xs ${uiConfig.colors.body}`}>
                  {town.ageDistribution.working || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${uiConfig.colors.body}`}>Over 65:</span>
                <span className={`text-xs ${uiConfig.colors.body}`}>
                  {town.ageDistribution.senior || 0}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Education */}
      {town.education && (
        <div>
          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1.5`}>Bachelor's Degree or Higher</div>
          <div className="flex items-center gap-2">
            <div className={`h-2 ${uiConfig.colors.secondary} rounded-full flex-1`}>
              <div
                className={`h-full ${uiConfig.colors.accent} rounded-full transition-all duration-300`}
                style={{ width: `${town.education}%` }}
              />
            </div>
            <span className={`text-sm ${uiConfig.colors.body}`}>
              {town.education}%
            </span>
          </div>
        </div>
      )}

      {/* Politics */}
      {town.politics && (
        <div>
          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1`}>Political Leaning</div>
          <div className={`text-xs ${
            town.politics === 'Liberal' ? 'text-blue-600' :
            town.politics === 'Conservative' ? 'text-red-600' :
            town.politics === 'Moderate' ? 'text-purple-600' :
            uiConfig.colors.body
          } ${uiConfig.colors.secondary} px-2 py-1 rounded inline-block`}>
            {town.politics}
          </div>
        </div>
      )}

      {/* Race/Ethnicity if available */}
      {town.ethnicity && (
        <div>
          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1`}>Diversity</div>
          <div className={`text-xs ${uiConfig.colors.body}`}>
            {town.ethnicity.white && `${town.ethnicity.white}% White`}
            {town.ethnicity.hispanic && `, ${town.ethnicity.hispanic}% Hispanic`}
            {town.ethnicity.black && `, ${town.ethnicity.black}% Black`}
            {town.ethnicity.asian && `, ${town.ethnicity.asian}% Asian`}
          </div>
        </div>
      )}
    </div>
  );
});

TownDemographics.displayName = 'TownDemographics';

export default TownDemographics;