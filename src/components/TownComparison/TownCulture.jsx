import React from 'react';
import { uiConfig } from '../../styles/uiConfig';

const TownCulture = React.memo(({ town }) => {
  if (!town) return null;

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Arts & Culture Score */}
      {town.cultureScore && (
        <div>
          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1.5`}>Arts & Culture Score</div>
          <div className="flex items-center gap-2">
            <div className={`h-2 ${uiConfig.colors.secondary} rounded-full flex-1`}>
              <div
                className={`h-full ${uiConfig.colors.accent} rounded-full transition-all duration-300`}
                style={{ width: `${town.cultureScore}%` }}
              />
            </div>
            <span className={`text-sm ${uiConfig.colors.body}`}>
              {town.cultureScore}/100
            </span>
          </div>
        </div>
      )}

      {/* Cultural Venues */}
      {town.culturalVenues && (
        <div>
          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1.5`}>Cultural Venues</div>
          <div className="space-y-1">
            {town.culturalVenues.museums > 0 && (
              <div className="flex justify-between items-center">
                <span className={`text-xs ${uiConfig.colors.body}`}>Museums:</span>
                <span className={`text-xs ${uiConfig.colors.body}`}>
                  {town.culturalVenues.museums}
                </span>
              </div>
            )}
            {town.culturalVenues.theaters > 0 && (
              <div className="flex justify-between items-center">
                <span className={`text-xs ${uiConfig.colors.body}`}>Theaters:</span>
                <span className={`text-xs ${uiConfig.colors.body}`}>
                  {town.culturalVenues.theaters}
                </span>
              </div>
            )}
            {town.culturalVenues.galleries > 0 && (
              <div className="flex justify-between items-center">
                <span className={`text-xs ${uiConfig.colors.body}`}>Art Galleries:</span>
                <span className={`text-xs ${uiConfig.colors.body}`}>
                  {town.culturalVenues.galleries}
                </span>
              </div>
            )}
            {town.culturalVenues.musicVenues > 0 && (
              <div className="flex justify-between items-center">
                <span className={`text-xs ${uiConfig.colors.body}`}>Music Venues:</span>
                <span className={`text-xs ${uiConfig.colors.body}`}>
                  {town.culturalVenues.musicVenues}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Restaurants & Dining */}
      {town.dining && (
        <div>
          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1.5`}>Dining</div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className={`text-xs ${uiConfig.colors.body}`}>Restaurants:</span>
              <span className={`text-xs ${uiConfig.colors.body}`}>
                {town.dining.restaurants || 0}+
              </span>
            </div>
            {town.dining.fineDining > 0 && (
              <div className="flex justify-between items-center">
                <span className={`text-xs ${uiConfig.colors.body}`}>Fine Dining:</span>
                <span className={`text-xs ${uiConfig.colors.body}`}>
                  {town.dining.fineDining}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Local Events */}
      {town.annualEvents && town.annualEvents.length > 0 && (
        <div>
          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1`}>Annual Events</div>
          <div className={`text-xs ${uiConfig.colors.body} space-y-0.5`}>
            {town.annualEvents.slice(0, 3).map((event, i) => (
              <div key={i} className="flex items-start gap-1">
                <span className={uiConfig.colors.accent}>•</span>
                <span>{event}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

TownCulture.displayName = 'TownCulture';

export default TownCulture;