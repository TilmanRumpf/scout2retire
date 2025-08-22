import React from 'react';
import { uiConfig } from '../../styles/uiConfig';

const TownClimate = React.memo(({ town }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="space-y-3 flex-1">
        {/* Climate Description - Show descriptive data first */}
        {(town.climate || town.climate_description) && (
          <div className="mb-2">
            <h4 className="font-medium text-sm mb-1">Climate Type</h4>
            <p className="text-sm">{town.climate || town.climate_description}</p>
          </div>
        )}
        
        {/* Seasonal Characteristics */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">Seasonal Characteristics</h4>
          <div className="space-y-1 text-sm">
            {town.summer_climate_actual && (
              <div className="flex justify-between">
                <span className={uiConfig.colors.hint}>Summer Climate:</span>
                <span className="font-medium capitalize">{town.summer_climate_actual}</span>
              </div>
            )}
            {town.winter_climate_actual && (
              <div className="flex justify-between">
                <span className={uiConfig.colors.hint}>Winter Climate:</span>
                <span className="font-medium capitalize">{town.winter_climate_actual}</span>
              </div>
            )}
            {town.humidity_level_actual && (
              <div className="flex justify-between">
                <span className={uiConfig.colors.hint}>Humidity:</span>
                <span className="font-medium capitalize">{town.humidity_level_actual}</span>
              </div>
            )}
            {town.sunshine_level_actual && (
              <div className="flex justify-between">
                <span className={uiConfig.colors.hint}>Sunshine:</span>
                <span className="font-medium capitalize">{town.sunshine_level_actual?.replace('_', ' ')}</span>
              </div>
            )}
            {town.precipitation_level_actual && (
              <div className="flex justify-between">
                <span className={uiConfig.colors.hint}>Precipitation:</span>
                <span className="font-medium capitalize">{town.precipitation_level_actual?.replace('_', ' ')}</span>
              </div>
            )}
            {town.seasonal_variation_actual && (
              <div className="flex justify-between">
                <span className={uiConfig.colors.hint}>Seasonal Variation:</span>
                <span className="font-medium capitalize">{town.seasonal_variation_actual?.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Quantitative Climate Data */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">Climate Data</h4>
          <div className="space-y-1 text-sm">
            {town.avg_temp_summer && (
              <div className="flex justify-between">
                <span className={uiConfig.colors.hint}>Summer Temperature:</span>
                <span className="font-medium">{town.avg_temp_summer}°C</span>
              </div>
            )}
            {town.avg_temp_winter && (
              <div className="flex justify-between">
                <span className={uiConfig.colors.hint}>Winter Temperature:</span>
                <span className="font-medium">{town.avg_temp_winter}°C</span>
              </div>
            )}
            {town.sunshine_hours && (
              <div className="flex justify-between">
                <span className={uiConfig.colors.hint}>Sunshine Hours:</span>
                <span className="font-medium">{town.sunshine_hours} hours/day</span>
              </div>
            )}
            {town.annual_rainfall && (
              <div className="flex justify-between">
                <span className={uiConfig.colors.hint}>Annual Rainfall:</span>
                <span className="font-medium">{town.annual_rainfall}mm</span>
              </div>
            )}
            {town.air_quality_index && (
              <div className="flex justify-between">
                <span className={uiConfig.colors.hint}>Air Quality Index:</span>
                <span className="font-medium">{town.air_quality_index} AQI</span>
              </div>
            )}
            {town.environmental_health_rating && (
              <div className="flex justify-between">
                <span className={uiConfig.colors.hint}>Environmental Health:</span>
                <span className="font-medium">{town.environmental_health_rating}/5</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

TownClimate.displayName = 'TownClimate';

export default TownClimate;