import React from 'react';
import { formatTownDisplay } from '../utils/townDisplayUtils';
import TownRadarChart from './TownRadarChart';
import LikeButton from './LikeButton';
import OptimizedImage from './OptimizedImage';
import { MapPin, X } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';

export default function ComparisonGrid({ 
  towns, 
  activeCategory, 
  getCategoryData, 
  handleRemoveTown, 
  handleToggleFavorite, 
  isFavorited, 
  userId 
}) {
  // Helper to render category-specific content
  const renderCategoryContent = (town, category) => {
    switch (category) {
      case 'overview':
        return (
          <div className="space-y-4">
            {/* Radar Chart */}
            <div className="h-48">
              <TownRadarChart townData={town} />
            </div>
            
            {/* Key Stats */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={uiConfig.colors.hint}>Overall Match</span>
                <span className="font-medium">{town.matchScore || town.overall_match || 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={uiConfig.colors.hint}>Monthly Cost</span>
                <span className="font-medium">${town.cost_index || town.typical_monthly_living_cost || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={uiConfig.colors.hint}>Healthcare</span>
                <span className="font-medium">{town.healthcare_score || 0}/10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={uiConfig.colors.hint}>Safety</span>
                <span className="font-medium">{town.safety_score || 0}/10</span>
              </div>
            </div>
          </div>
        );

      case 'region':
        return (
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2">Location</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>Country</span>
                  <span className="font-medium">{town.country || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>State/Region</span>
                  <span className="font-medium">{town.region || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>Population</span>
                  <span className="font-medium">{town.population ? town.population.toLocaleString() : 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className={`bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg p-3 text-center`}>
              <p className={`text-xs ${uiConfig.colors.hint} mb-1`}>Region Match</p>
              <p className={`text-2xl font-bold ${uiConfig.colors.success}`}>
                {town.categoryScores?.region ? `${Math.round(town.categoryScores.region)}%` : 'N/A'}
              </p>
            </div>
          </div>
        );

      case 'climate':
        return (
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2">Temperature</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className={uiConfig.colors.hint}>Summer</span>
                  <p className="font-medium">{town.avg_temp_summer ? `${town.avg_temp_summer}°C` : 'N/A'}</p>
                </div>
                <div>
                  <span className={uiConfig.colors.hint}>Winter</span>
                  <p className="font-medium">{town.avg_temp_winter ? `${town.avg_temp_winter}°C` : 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2">Weather</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>Rainfall</span>
                  <span className="font-medium">{town.annual_rainfall ? `${town.annual_rainfall}mm` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>Sunshine</span>
                  <span className="font-medium">{town.sunshine_hours ? `${town.sunshine_hours}hrs` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>Humidity</span>
                  <span className="font-medium">{town.humidity ? `${town.humidity}%` : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'culture':
        return (
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2">Cultural Features</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>Language</span>
                  <span className="font-medium">{town.primary_language || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>English</span>
                  <span className="font-medium">
                    {town.english_proficiency_level
                      ? town.english_proficiency_level.charAt(0).toUpperCase() + town.english_proficiency_level.slice(1)
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>Expat Scene</span>
                  <span className="font-medium">{town.expat_community || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className={`bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg p-3 text-center`}>
              <p className={`text-xs ${uiConfig.colors.hint} mb-1`}>Culture Match</p>
              <p className={`text-2xl font-bold ${uiConfig.colors.success}`}>
                {town.categoryScores?.culture ? `${Math.round(town.categoryScores.culture)}%` : 'N/A'}
              </p>
            </div>
          </div>
        );

      case 'hobbies':
        return (
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2">Activities</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>Outdoor</span>
                  <span className="font-medium">{town.outdoor_activities || 'N/A'}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>Cultural</span>
                  <span className="font-medium">{town.cultural_activities || 'N/A'}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>Nightlife</span>
                  <span className="font-medium">{town.nightlife || 'N/A'}/10</span>
                </div>
              </div>
            </div>
            <div className={`bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg p-3 text-center`}>
              <p className={`text-xs ${uiConfig.colors.hint} mb-1`}>Hobbies Match</p>
              <p className={`text-2xl font-bold ${uiConfig.colors.success}`}>
                {town.categoryScores?.hobbies ? `${Math.round(town.categoryScores.hobbies)}%` : 'N/A'}
              </p>
            </div>
          </div>
        );

      case 'administration':
        return (
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2">Administrative</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>Healthcare</span>
                  <span className="font-medium">{town.healthcare_score || 0}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>Safety</span>
                  <span className="font-medium">{town.safety_score || 0}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>Internet</span>
                  <span className="font-medium">{town.internet_score || 0}/10</span>
                </div>
              </div>
            </div>
            <div className={`bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg p-3 text-center`}>
              <p className={`text-xs ${uiConfig.colors.hint} mb-1`}>Admin Match</p>
              <p className={`text-2xl font-bold ${uiConfig.colors.success}`}>
                {town.categoryScores?.administration ? `${Math.round(town.categoryScores.administration)}%` : 'N/A'}
              </p>
            </div>
          </div>
        );

      case 'costs':
        return (
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2">Monthly Costs</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>Rent (1BR)</span>
                  <span className="font-medium">${town.rent_1br || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>Food</span>
                  <span className="font-medium">${town.food_cost || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={uiConfig.colors.hint}>Transport</span>
                  <span className="font-medium">${town.transport_cost || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className={`bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg p-3 text-center`}>
              <p className={`text-xs ${uiConfig.colors.hint} mb-1`}>Total/Month</p>
              <p className={`text-2xl font-bold ${uiConfig.colors.success}`}>
                ${town.cost_index || town.typical_monthly_living_cost || 'N/A'}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Determine grid columns based on number of towns
  const gridCols = towns.length === 1 
    ? 'grid-cols-1' 
    : towns.length === 2 
    ? 'grid-cols-1 md:grid-cols-2' 
    : 'grid-cols-1 md:grid-cols-3';

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {towns.map((town) => (
        <div key={town.id} className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
          {/* Town Header */}
          <div className="relative h-32">
            <OptimizedImage
              src={town.image_url_1}
              alt={town.town_name}
              className="w-full h-full object-cover"
              fallbackIcon={MapPin}
              fallbackIconSize={48}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            
            {/* Town Name & Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end">
              <div>
                <h3 className="text-white font-semibold text-lg">{town.town_name}</h3>
                <p className="text-white/80 text-sm">{town.region && `${town.region}, `}{town.country}</p>
              </div>
              <div className="flex gap-2">
                {userId && (
                  <LikeButton
                    isLiked={isFavorited(town.id)}
                    onClick={() => handleToggleFavorite(town.id)}
                    size="sm"
                  />
                )}
                <button
                  onClick={() => handleRemoveTown(town.id)}
                  className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Remove from comparison"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Content */}
          <div className="p-4">
            {renderCategoryContent(town, activeCategory)}
          </div>
        </div>
      ))}
    </div>
  );
}
