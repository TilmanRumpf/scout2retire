import React from 'react';
import { uiConfig } from '../../styles/uiConfig';

const TownOverview = React.memo(({ town }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Category Scores Table - Like on Discover page */}
      {town.categoryScores && (
        <div className="mb-4">
          <div className={`text-xs ${uiConfig.colors.body} mb-1.5 flex items-center gap-1`}>
            <span>Matching your preferences</span>
            <span className={`${uiConfig.colors.hint} text-xs`}>(weighted avg: {town.matchScore}%)</span>
          </div>
          <div className="grid grid-rows-2 grid-flow-col gap-x-4 gap-y-1.5 text-xs">
            <div className="flex items-center gap-1">
              <span className={`${uiConfig.colors.hint} capitalize`}>Region</span>
              <span className={`font-medium ${uiConfig.colors.hint}`}>{Math.round(town.categoryScores.region || 0)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`${uiConfig.colors.hint} capitalize`}>Climate</span>
              <span className={`font-medium ${uiConfig.colors.hint}`}>{Math.round(town.categoryScores.climate || 0)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`${uiConfig.colors.hint} capitalize`}>Culture</span>
              <span className={`font-medium ${uiConfig.colors.hint}`}>{Math.round(town.categoryScores.culture || 0)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`${uiConfig.colors.hint} capitalize`}>Hobbies</span>
              <span className={`font-medium ${uiConfig.colors.hint}`}>{Math.round(town.categoryScores.hobbies || 0)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`${uiConfig.colors.hint} capitalize`}>Admin</span>
              <span className={`font-medium ${uiConfig.colors.hint}`}>{Math.round(town.categoryScores.administration || 0)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`${uiConfig.colors.hint} capitalize`}>Costs</span>
              <span className={`font-medium ${uiConfig.colors.hint}`}>{Math.round(town.categoryScores.cost || 0)}%</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Description */}
      <p className="line-clamp-5">{town.description || 'No description available.'}</p>
    </div>
  );
});

TownOverview.displayName = 'TownOverview';

export default TownOverview;