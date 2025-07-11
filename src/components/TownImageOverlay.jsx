import { Heart, MapPin } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';

/**
 * Standardized image overlay component for all town cards
 * Shows 4 consistent elements:
 * 1. Upper left: Match percentage
 * 2. Upper right: Heart/like button  
 * 3. Lower right: Location icon linked to Google Maps
 * 4. Lower left: Appeal statement
 */
export default function TownImageOverlay({ 
  town,
  matchScore,
  isFavorited,
  isUpdating,
  onFavoriteClick,
  appealStatement
}) {
  // Generate a default appeal statement if none provided
  const getDefaultAppealStatement = () => {
    if (matchScore >= 80) return "Excellent match";
    if (matchScore >= 70) return "Strong compatibility";
    if (matchScore >= 60) return "Good potential";
    if (town.cost_index <= 1500) return "Budget-friendly";
    if (town.healthcare_score >= 8) return "Great healthcare";
    if (town.safety_score >= 8) return "Very safe";
    return "Worth exploring";
  };

  const finalAppealStatement = appealStatement || getDefaultAppealStatement();

  return (
    <>
      {/* Upper left: Match percentage */}
      {matchScore !== undefined && matchScore !== null && (
        <div className={`absolute ${uiConfig.townCardOverlay.position.topLeft}`}>
          <div className={`px-2.5 py-1 ${uiConfig.townCardOverlay.radius} ${uiConfig.townCardOverlay.backdrop} ${uiConfig.townCardOverlay.fontSize.matchScore} ${uiConfig.townCardOverlay.fontWeight.matchScore} ${
            matchScore >= 80 ? uiConfig.townCardOverlay.matchColors.high :
            matchScore >= 60 ? uiConfig.townCardOverlay.matchColors.medium :
            uiConfig.townCardOverlay.matchColors.low
          }`}>
            {matchScore}%
          </div>
        </div>
      )}

      {/* Upper right: Heart/like button */}
      <div className={`absolute ${uiConfig.townCardOverlay.position.topRight}`}>
        <button
          onClick={onFavoriteClick}
          disabled={isUpdating}
          className={`${uiConfig.townCardOverlay.iconButton.base} ${uiConfig.townCardOverlay.backdrop} ${
            isFavorited ? uiConfig.townCardOverlay.iconButton.heart.active : uiConfig.townCardOverlay.iconButton.heart.inactive
          } ${isUpdating ? 'opacity-50' : uiConfig.townCardOverlay.iconButton.heart.hover}`}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={20}
            fill={isFavorited ? "currentColor" : "none"}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Lower left: Appeal statement */}
      <div className={`absolute ${uiConfig.townCardOverlay.position.bottomLeft}`}>
        <div className={`px-2.5 py-1 ${uiConfig.townCardOverlay.radius} ${uiConfig.townCardOverlay.backdrop} ${uiConfig.townCardOverlay.fontSize.appealStatement} ${uiConfig.townCardOverlay.fontWeight.appealStatement} ${uiConfig.townCardOverlay.appealColor} max-w-[150px]`}>
          {finalAppealStatement}
        </div>
      </div>

      {/* Lower right: Location icon with Google Maps link */}
      <div className={`absolute ${uiConfig.townCardOverlay.position.bottomRight}`}>
        <a
          href={town.google_maps_link || `https://www.google.com/maps/search/${encodeURIComponent(town.name + ', ' + town.country)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex ${uiConfig.townCardOverlay.iconButton.base} ${uiConfig.townCardOverlay.backdrop} ${uiConfig.townCardOverlay.iconButton.location.base} ${uiConfig.townCardOverlay.iconButton.location.hover}`}
          aria-label={`View ${town.name} on Google Maps`}
          onClick={(e) => e.stopPropagation()}
        >
          <MapPin size={20} />
        </a>
      </div>
    </>
  );
}