// components/TownCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleFavorite } from '../utils/townUtils.jsx';
import toast from 'react-hot-toast';
import { MapPin, DollarSign, Activity, Shield } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';
import OptimizedImage from './OptimizedImage';
import TownImageOverlay from './TownImageOverlay';

function TownCard({ 
  town, 
  userId, 
  initiallyFavorited = false,
  onFavoriteChange,
  variant = 'default', // 'default', 'compact', 'detailed'
  showActions = true,
  className = ''
}) {
  const [isFavorited, setIsFavorited] = useState(initiallyFavorited);
  const [isUpdating, setIsUpdating] = useState(false);

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
          <div className="w-24 h-24">
            <OptimizedImage
              src={town.image_url_1}
              alt={town.name}
              className="w-full h-full object-cover"
              fallbackIconSize={16}
            />
          </div>
          <div className="p-3 flex-1">
            <h4 className={`font-medium ${uiConfig.colors.heading}`}>{town.name}</h4>
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
      <div className="relative h-48">
        <OptimizedImage
          src={town.image_url_1}
          alt={town.name}
          className="w-full h-full object-cover"
          fallbackIconSize={24}
        />
        {showActions && userId && (
          <TownImageOverlay
            town={town}
            matchScore={town.matchScore}
            isFavorited={isFavorited}
            isUpdating={isUpdating}
            onFavoriteClick={handleFavoriteToggle}
            appealStatement={town.appealStatement}
          />
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>{town.name}</h3>
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