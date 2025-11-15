// components/TownCard.jsx
import React, { useState } from 'react';
import { formatTownDisplay } from '../utils/townDisplayUtils';
import { Link } from 'react-router-dom';
import { toggleFavorite } from '../utils/townUtils.jsx';
import toast from 'react-hot-toast';
import { MapPin, DollarSign, Activity, Shield, Info } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';
import OptimizedImage from './OptimizedImage';
import TownImageOverlay from './TownImageOverlay';
import TownCardImageCarousel from './TownCardImageCarousel';
import { getCostStatus, getLuxuryCostNote } from '../utils/scoring/helpers/costUtils';

function TownCard({
  town,
  userId,
  initiallyFavorited = false,
  onFavoriteChange,
  variant = 'default', // 'default', 'compact', 'detailed'
  showActions = true,
  className = '',
  userBudget = null // User's monthly budget for cost status display
}) {
  const [isFavorited, setIsFavorited] = useState(initiallyFavorited);
  const [isUpdating, setIsUpdating] = useState(false);

  // Compute cost status if user budget is provided
  const townCost = town.cost_of_living_usd || town.typical_monthly_living_cost;
  const costStatus = userBudget ? getCostStatus(userBudget, townCost) : null;
  const luxuryCostNote = userBudget ? getLuxuryCostNote(userBudget, townCost) : null;

  const handleFavoriteToggle = async () => {
    if (!userId || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const { success, action, error } = await toggleFavorite(userId, town.id);
      
      if (success) {
        const newFavoriteState = action === 'added';
        setIsFavorited(newFavoriteState);
        
        // Notify parent component if callback provided
        if (onFavoriteChange) {
          onFavoriteChange(town.id, newFavoriteState);
        }
        
        // Don't show toast here if parent is handling it
        if (!onFavoriteChange) {
          toast.success(action === 'added' ? 'Added to favorites' : 'Removed from favorites');
        }
      } else {
        toast.error(`Failed to update favorite: ${error?.message}`);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Failed to update favorite");
    } finally {
      setIsUpdating(false);
    }
  };


  // Render compact variant (for lists)
  if (variant === 'compact') {
    return (
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden flex ${className}`}>
        <Link to={`/discover?town=${town.id}`} className="flex flex-1">
          <TownCardImageCarousel
            townId={town.id}
            townName={town.town_name}
            fallbackImageUrl={town.image_url_1}
            height="h-24 w-24"
            className="flex-shrink-0"
          />
          <div className="p-3 flex-1">
            <h4 className={`font-medium ${uiConfig.colors.heading}`}>{town.town_name}</h4>
            <p className={`text-sm ${uiConfig.colors.hint}`}>{town.country}</p>
            {(town.cost_of_living_usd || town.typical_monthly_living_cost) && (
              <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 ${uiConfig.colors.badge} text-xs ${uiConfig.layout.radius.full}`}>
                <DollarSign size={12} />
                ${town.cost_of_living_usd || town.typical_monthly_living_cost}/mo
              </span>
            )}
          </div>
        </Link>
      </div>
    );
  }

  // Default card variant
  return (
    <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden ${className}`}>
      <div className="relative">
        <TownCardImageCarousel
          townId={town.id}
          townName={town.town_name}
          fallbackImageUrl={town.image_url_1}
          height="h-48"
        />
        {showActions && userId && (
          <TownImageOverlay
            town={town}
            matchScore={town.matchScore}
            isFavorited={isFavorited}
            isUpdating={isUpdating}
            onFavoriteClick={handleFavoriteToggle}
            appealStatement={town.appealStatement}
            preferenceCoverage={town.preferenceCoverage}
          />
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>{town.town_name}</h3>
            <p className={`text-sm ${uiConfig.colors.hint} flex items-center gap-1`}>
              <MapPin size={12} />
              {town.country}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {(town.cost_of_living_usd || town.typical_monthly_living_cost) && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 ${uiConfig.colors.badge} text-xs ${uiConfig.layout.radius.full}`}>
              <DollarSign size={12} />
              ${town.cost_of_living_usd || town.typical_monthly_living_cost}/mo
            </span>
          )}
          {costStatus && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs ${uiConfig.layout.radius.full} ${
              costStatus.level === 'low' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
              costStatus.level === 'medium' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
              costStatus.level === 'high' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {costStatus.label}
            </span>
          )}
          {town.healthcare_score && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 ${uiConfig.colors.statusInfo} text-xs ${uiConfig.layout.radius.full}`}>
              <Activity size={12} />
              {town.healthcare_score}/10
            </span>
          )}
          {town.safety_score && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 ${uiConfig.colors.badge} text-xs ${uiConfig.layout.radius.full}`}>
              <Shield size={12} />
              {town.safety_score}/10
            </span>
          )}
        </div>

        <p className={`${uiConfig.colors.body} text-sm mb-4 line-clamp-3`}>
          {town.description || "Discover this beautiful town for your retirement."}
        </p>

        {/* Personalization Note - appears when coverage is low but score is high */}
        {town.personalizationNote && (
          <div className={`flex items-start gap-2 mb-3 p-2 ${uiConfig.layout.radius.md} bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800`}>
            <Info size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              {town.personalizationNote}
            </p>
          </div>
        )}

        {/* Luxury Cost Note - appears when high-budget user matched with very cheap town */}
        {luxuryCostNote && (
          <div className={`flex items-start gap-2 mb-3 p-2 ${uiConfig.layout.radius.md} bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800`}>
            <Info size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 dark:text-blue-200">
              💡 {luxuryCostNote}
            </p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <Link
            to={`/discover?town=${town.id}`}
            className={`px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md} text-sm`}
          >
            Explore
          </Link>
          {variant === 'detailed' && (
            <Link
              to={`/compare?towns=${town.id}`}
              className={`${uiConfig.colors.accent} text-sm hover:underline`}
            >
              Compare
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(TownCard);
