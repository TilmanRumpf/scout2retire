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
        <div className="absolute top-3 left-3">
          <div className={`px-2.5 py-1 ${uiConfig.layout.radius.md} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm text-sm font-medium ${
            matchScore >= 80 ? 'text-scout-accent-600 dark:text-scout-accent-400' :
            matchScore >= 60 ? 'text-gray-700 dark:text-gray-300' :
            'text-gray-600 dark:text-gray-400'
          }`}>
            {matchScore}%
          </div>
        </div>
      )}

      {/* Upper right: Heart/like button */}
      <div className="absolute top-3 right-3">
        <button
          onClick={onFavoriteClick}
          disabled={isUpdating}
          className={`p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm ${
            isFavorited ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
          } transition-colors ${isUpdating ? 'opacity-50' : 'hover:text-red-500'}`}
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
      <div className="absolute bottom-3 left-3">
        <div className={`px-2.5 py-1 ${uiConfig.layout.radius.md} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[150px]`}>
          {finalAppealStatement}
        </div>
      </div>

      {/* Lower right: Location icon with Google Maps link */}
      <div className="absolute bottom-3 right-3">
        <a
          href={town.google_maps_link || `https://www.google.com/maps/search/${encodeURIComponent(town.name + ', ' + town.country)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm text-gray-600 dark:text-gray-400 transition-colors hover:text-scout-accent-600 dark:hover:text-scout-accent-400`}
          aria-label={`View ${town.name} on Google Maps`}
          onClick={(e) => e.stopPropagation()}
        >
          <MapPin size={20} />
        </a>
      </div>
    </>
  );
}