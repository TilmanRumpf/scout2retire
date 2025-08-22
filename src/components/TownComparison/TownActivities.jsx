import React from 'react';
import { uiConfig } from '../../styles/uiConfig';

const TownActivities = React.memo(({ town }) => {
  if (!town) return null;

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Hobbies Available */}
      {town.activities && town.activities.length > 0 && (
        <div className="flex-1">
          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1.5`}>Available Activities</div>
          <div className="flex flex-wrap gap-1">
            {town.activities.slice(0, 8).map((activity, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-0.5 rounded ${uiConfig.colors.secondary} ${uiConfig.colors.body}`}
              >
                {activity}
              </span>
            ))}
            {town.activities.length > 8 && (
              <span className={`text-xs px-2 py-0.5 ${uiConfig.colors.subtitle}`}>
                +{town.activities.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Recreation Score */}
      {town.recreationScore && (
        <div>
          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1.5`}>Recreation Score</div>
          <div className="flex items-center gap-2">
            <div className={`h-2 ${uiConfig.colors.secondary} rounded-full flex-1`}>
              <div
                className={`h-full ${uiConfig.colors.accent} rounded-full transition-all duration-300`}
                style={{ width: `${town.recreationScore}%` }}
              />
            </div>
            <span className={`text-sm ${uiConfig.colors.body}`}>
              {town.recreationScore}/100
            </span>
          </div>
        </div>
      )}

      {/* Nearby Attractions */}
      {town.nearbyAttractions && (
        <div>
          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1`}>Nearby Attractions</div>
          <div className={`text-xs ${uiConfig.colors.body} space-y-0.5`}>
            {town.nearbyAttractions.split(',').slice(0, 3).map((attraction, i) => (
              <div key={i} className="flex items-start gap-1">
                <span className={uiConfig.colors.accent}>•</span>
                <span>{attraction.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

TownActivities.displayName = 'TownActivities';

export default TownActivities;