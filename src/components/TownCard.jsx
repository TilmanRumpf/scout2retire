// components/TownCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleFavorite } from '../utils/townUtils';
import toast from 'react-hot-toast';

export default function TownCard({ 
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

  // Custom Like Button that doesn't do its own API call
  const LikeButtonSimple = () => (
    <button
      onClick={handleFavoriteToggle}
      disabled={isUpdating}
      className={`p-2 rounded-full ${isFavorited ? 'text-red-500' : 'text-gray-400'} transition-colors ${isUpdating ? 'opacity-50' : 'hover:text-red-500'}`}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorited ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  );

  // Render compact variant (for lists)
  if (variant === 'compact') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex ${className}`}>
        <Link to={`/discover?town=${town.id}`} className="flex flex-1">
          <div className="w-24 h-24">
            {town.image_url_1 ? (
              <img
                src={town.image_url_1}
                alt={town.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            )}
          </div>
          <div className="p-3 flex-1">
            <h4 className="font-medium text-gray-800 dark:text-white">{town.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{town.country}</p>
            {town.cost_index && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs rounded-full">
                ${town.cost_index}/mo
              </span>
            )}
          </div>
        </Link>
        {showActions && userId && (
          <div className="p-3">
            <LikeButtonSimple />
          </div>
        )}
      </div>
    );
  }

  // Default card variant
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="relative h-48">
        {town.image_url_1 ? (
          <img
            src={town.image_url_1}
            alt={town.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}
        {showActions && userId && (
          <div className="absolute top-2 right-2">
            <LikeButtonSimple />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{town.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{town.country}</p>
          </div>
          
          <a
            href={town.google_maps_link || `https://www.google.com/maps/search/${encodeURIComponent(town.name + ', ' + town.country)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 dark:text-green-400 text-sm hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Map
          </a>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {town.cost_index && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs rounded-full">
              ${town.cost_index}/mo
            </span>
          )}
          {town.healthcare_score && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs rounded-full">
              Healthcare: {town.healthcare_score}/10
            </span>
          )}
          {town.safety_score && (
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 text-xs rounded-full">
              Safety: {town.safety_score}/10
            </span>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {town.description || "Discover this beautiful town for your retirement."}
        </p>

        <div className="flex justify-between items-center">
          <Link
            to={`/discover?town=${town.id}`}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
          >
            Explore
          </Link>
          {variant === 'detailed' && (
            <Link
              to={`/compare?towns=${town.id}`}
              className="text-green-600 dark:text-green-400 text-sm hover:underline"
            >
              Compare
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}